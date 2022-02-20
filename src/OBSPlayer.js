const ConfigLoader = require('./ConfigLoader')
const OBSClient = require('./OBSClient')
const OverlayWS = require('./ws/OverlayWS')
const Api = require('./Api')
const wait = require('./event/wait')
const fetch = require('node-fetch');

class OBSPlayer {
    constructor(rootPath, eventEmitter) {
        this.configLoader = new ConfigLoader(rootPath)
        this.globalConfig = this.configLoader.load();
        this.eventEmitter = eventEmitter
        this.eventEmitter.send('config.loaded', this.globalConfig)

        this.obsClient = new OBSClient()
        this.overlayWS = new OverlayWS(this.globalConfig.overlayWs, this.eventEmitter, rootPath)

        this.config = this.globalConfig.echoArena
        this.vrmlBaseUrl = 'https://api.vrmasterleague.com'
        this.infoState = false
        this.Allinfo = {
            "teams":[],
            "times":[],
            "week":null
        }

        this.connectVrml(this.globalConfig.vrml.teamId)
        this.obsConnectionState = false
        this.initializeListeners()
    }

    initializeListeners() {
        this.eventEmitter.on('echoArena.connect', (args, event) => {
            this.connectEchoArena(args).then(() => {
                event.reply('echoArena.connected', args)
                this.globalConfig.echoArena = {
                    ...args,
                    ...this.globalConfig.echoArena,
                }
                this.configLoader.save(this.globalConfig)
            }).catch((error) => {
                event.reply('echoArena.connectionFailed', {
                    args,
                    error
                })
            })
        })

        this.eventEmitter.on('obsWebsocket.connect', (args, event) => {
            this.connectObsWebsocket(args).then(() => {
                event.reply('obsWebsocket.connected', args)
                this.globalConfig.obs = {
                    ...args,
                    ...this.globalConfig.obs,
                }
                this.configLoader.save(this.globalConfig)
            }).catch((error) => {
                event.reply('obsWebsocket.connectionFailed', {
                    args,
                    error
                })
            })
        })

        this.eventEmitter.on('overlayWs.launchServer', (args, event) => {
            this.overlayWS.startServer(args.port).then(() => {
                event.reply('overlayWs.listening', args)
                this.globalConfig.overlay = {
                    ...args,
                    ...this.globalConfig.overlay
                }
                this.configLoader.save(this.globalConfig)
            }).catch((error) => {
                event.reply('overlayWs.launchFailed', {
                    args,
                    error
                })
            })
        })

        this.overlayWS.listenEvent('get-week', this.getWeek.bind(this))
        this.overlayWS.listenEvent('get-winner', this.getWinner.bind(this))
        this.overlayWS.listenEvent('get-teams-data', this.getTeamsData.bind(this))
    }

    getWinner() {
        fetch(`http://${this.config.ip}:${this.config.port}/session`).then(resp => resp.json()).then(json => {
            let blue = json.blue_points;
            let orange = json.orange_points;
            let winner = null

            if(blue>orange) {
                winner = 'blue'
            } else {
                winner = 'orange'
            }

            for(let i = 0; i<this.Allinfo.teams[0].length; i++) {
                if(this.Allinfo.teams[0][i].color === 'blue') {
                    if(winner === 'blue') {
                        this.overlayWS.sendEvent('winner',this.Allinfo.teams[0][i])
                    } 
                } else {
                    if(winner === 'orange') {
                        this.overlayWS.sendEvent('winner',this.Allinfo.teams[0][i])
                    }
                }
            }
        }).catch(error => {console.log(error)})
    }

    getWeek() {
        this.overlayWS.sendEvent('week',this.Allinfo.week)
    }

    getTeamsData() {
        this.overlayWS.sendEvent('teams-data',this.Allinfo.teams)
    }

    connectObsWebsocket(args) {
        return this.obsClient
            .onConnected((name) => {
                if(this.obsConnectionState !== true) {
                    this.obsConnectionState = true
                    console.log('Connected')
                    setTimeout(() => {
                        this.overlayWS.sendEvent('get-teams-data')
                        this.overlayWS.sendEvent('get-week')
                    }, 1000);
                }
            })
            .onDisconnected((message) => {
                this.obsConnectionState = false
                console.log('Disconnected')
                }
            )
        .connect(args)
    }

    setColor() {
        const getColors = new Promise((resolve,reject) => {
            fetch(`http://${this.config.ip}:${this.config.port}/session`).then(resp => resp.json()).then(json => {
                let PlayersBlue = []
                let PlayersOrange = []
                let ARoster = this.Allinfo.teams[0].rosters
    
                function getArraysIntersection(a1,a2){
                    return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
                }
                
                try {
                    json.teams[0].players.forEach(player => {
                        PlayersBlue.push(player.name.toLowerCase())
                    });
                    json.teams[1].players.forEach(player => {
                        PlayersOrange.push(player.name.toLowerCase())
                    });
                } catch {
                    console.log('one team is empty')
                }
                let b = getArraysIntersection(ARoster, PlayersBlue)
                let o = getArraysIntersection(ARoster, PlayersOrange)

                if(b.length>o.length) {
                    this.Allinfo.teams[1].color = 'blue'
                    this.Allinfo.teams[0].color = 'orange'
                } else {
                    this.Allinfo.teams[0].color = 'orange'
                    this.Allinfo.teams[1].color = 'blue'
                }
                resolve()
            // this.overlayWS.sendEvent('round',json.total_round_count)
            }).catch(error => {console.log(error)})
        });
        return getColors
    }

    async connectVrml(team) {
        // get current matches info
        const getData = new Promise((resolve,reject) => {
            fetch(`${this.vrmlBaseUrl}/Teams/${team}/Matches/Upcoming`).then(resp => resp.json()).then(json => {
                try {this.Allinfo.week = json[0].week} catch {}
                json.forEach(element => {
                    let dt = new Date(element.dateScheduledUTC)
                    if(dt.getTime() == new Date("2022-02-14 13:00").getTime()) {
                        this.Allinfo.times.push('TBD');
                    } else {
                        dt.setHours(dt.getHours()+2);
                        this.Allinfo.times.push(dt);
                    }
                });
    
                for(let i = 0; i<this.Allinfo.times.length; i++) {
                    if(this.Allinfo.times[i] !== 'TBD') {
                        this.Allinfo.teams.push({
                            "name":json[i].homeTeam.teamName,
                            "rank":json[i].homeTeam.divisionLogo,
                            "logo":json[i].homeTeam.teamLogo,
                            "link":json[i].homeTeam.teamID,
                            "rosters":[],
                            "color":null
                        })
    
                        this.Allinfo.teams.push({
                            "name":json[i].awayTeam.teamName,
                            "rank":json[i].awayTeam.divisionLogo,
                            "logo":json[i].awayTeam.teamLogo,
                            "link":json[i].awayTeam.teamID,
                            "rosters":[],
                            "color":null
                        })
                        resolve('done')
                        return;
                    }
                }
            })
        })

        getData.then(() => {
            // get rosters
            let u = 0
            const getPlayers = new Promise((resolve,reject) => {
                this.Allinfo.teams.forEach(element => {
                    fetch(`${this.vrmlBaseUrl}/Teams/${element.link}`).then(resp => resp.json()).then(json => {
                        json.team.players.forEach(player => {
                            element.rosters.push(player.playerName.toLowerCase())
                        });
                        u++
                        if(u >= 2) resolve('done')
                    })
                });
            });
            getPlayers.catch(error => {console.log(error)})
        }).catch(error => {console.log(error)})

    }

    connectEchoArena(config) {
        if (this.obsConnectionState && this.infoState) {
            const echoArenaApi = new Api(config, this.obsClient, this.overlayWs)
            this.setColor().then(() => {
                // just for testing :
                this.Allinfo.times = [new Date(new Date().getTime() + 2*6000)]
                console.log(this.Allinfo.times)
                // end
                return;
            }).catch(error => {console.log(error)})

            echoArenaApi.state = true;
            echoArenaApi.request()
            new wait(this.obsClient, this.Allinfo, this.overlayWS)
        }
    }

}

module.exports = OBSPlayer