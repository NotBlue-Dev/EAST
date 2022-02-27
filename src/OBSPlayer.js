const ConfigLoader = require('./ConfigLoader')
const OBSClient = require('./OBSClient')
const OverlayWS = require('./ws/OverlayWS')
const Api = require('./Api')
const wait = require('./event/wait')
const fetch = require('node-fetch');
const VRMLClient = require('./VRMLClient')
const EchoArena = require('./EchoArena')

class OBSPlayer {
    constructor(rootPath, eventEmitter) {
        this.configLoader = new ConfigLoader(rootPath)
        this.globalConfig = this.configLoader.load();
        this.eventEmitter = eventEmitter
        this.eventEmitter.send('config.loaded', this.globalConfig)

        this.obsClient = new OBSClient()
        this.overlayWS = new OverlayWS(this.globalConfig.overlayWs, this.eventEmitter, rootPath)
        this.scenes = []
        this.echoArena = null

        this.config = this.globalConfig.echoArena
        this.vrmlClient = new VRMLClient()
        this.infoState = false
        this.Allinfo = {
            "teams":[],
            "times":[],
            "week":null
        }

        
    }

    async start() {
        try {
            await this.loadTeamList()
            //await this.connectVrml(this.globalConfig.vrml.teamId)
        } catch (err) {
            console.error(err.message)
        }

        this.obsConnectionState = false
        this.initializeListeners()
    }

    initializeListeners() {
        this.eventEmitter.on('echoArena.connect', (args, event) => {
            console.log(args)
            this.connectEchoArena(args).then(() => {
                this.eventEmitter.send('echoArena.connected', args)
                this.globalConfig.echoArena = {
                    ...this.globalConfig.echoArena,
                    ...args,
                }
                this.configLoader.save(this.globalConfig)
            }).catch((error) => {
                this.eventEmitter.send('echoArena.connectionFailed', {
                    args,
                    error
                })
            })
        })

        this.eventEmitter.on('obsWebsocket.connect', (args, event) => {
            this.connectObsWebsocket(args).then(() => {
                this.eventEmitter.send('obsWebsocket.connected', args)
                this.globalConfig.obs = {
                    ...this.globalConfig.obs,
                    ...args,
                }
                this.configLoader.save(this.globalConfig)
            }).catch((error) => {
                this.eventEmitter.send('obsWebsocket.connectionFailed', {
                    args,
                    error
                })
            })
        })

        this.eventEmitter.on('overlayWs.launchServer', (args, event) => {
            this.overlayWS.startServer(args.port).then(() => {
                this.eventEmitter.add({on: this.overlayWS.listenEvent, send: this.overlayWS.sendEvent})
                this.eventEmitter.send('overlayWs.listening', args)
                this.globalConfig.overlay = {
                    ...this.globalConfig.overlay,
                    ...args
                }
                this.configLoader.save(this.globalConfig)
            }).catch((error) => {
                this.eventEmitter.send('overlayWs.launchFailed', {
                    args,
                    error
                })
            })
        })

        this.eventEmitter.on('vrml.teamSelected', (args, event) => {
            this.eventEmitter.send('vrml.teamChanged', args)
            this.globalConfig.vrml = {
                ...this.globalConfig.vrml,
                ...args,
            }
            this.configLoader.save(this.globalConfig)
        })

        this.eventEmitter.on('vrml.isVrmlMatch', (args, event) => {
            this.getMatchDataFromTeam(args.teamId).then((match) => {
                this.eventEmitter.send('vrml.matchDataLoaded', match)
            }).catch(error => {
                this.eventEmitter.send('vrml.matchDataNotFound', {
                    teamId: args.teamId
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
                        this.obsClient.send('GetSceneList').then((scenesData) => {
                            this.eventEmitter.send('scenes.loaded', {
                                scenes: scenesData.scenes.map(scene => scene.name)
                            })
                        })
                        // récupérer les scènes dispos
                    }, 1000);
                }
            })
            .onDisconnected((message) => {
                this.obsConnectionState = false
                console.log('Disconnected', message)
            })
        .connect(args)
    }

    setColor() {
        return new Promise((resolve,reject) => {
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
            }).catch(error => {console.log(error), reject()})
        });
    }

    async loadTeamList(region) {
        const json = await this.vrmlClient.getTeams()
        const teams = json.filter(team => team.isActive).map((team) => {
            return {
                name: team.teamName,
                id: team.teamID,
            }
        }).sort((a, b) => a.name.localeCompare(b.name))
        this.eventEmitter.send('vrml.teamListLoaded', {
            teams,
            teamId: this.globalConfig.vrml.teamId
        })
    }

    async getMatchDataFromTeam(team) {
        const json = await this.vrmlClient.getTeamUpcomingMatches(team)
        try {
            this.Allinfo.week = json[0].week
        } catch {}
        json.forEach(element => {
            let dt = new Date(element.dateScheduledUTC)
            if(dt.getTime() == new Date("2022-02-14 13:00").getTime()) {
                this.Allinfo.times.push('TBD');
            } else {
                dt.setHours(dt.getHours()+2);
                this.Allinfo.times.push(dt);
            }
        });

        if(this.Allinfo.times.length === 0) {
            throw new Error('no matches found')
        }

        for(let i = 0; i<this.Allinfo.times.length; i++) {
            if(this.Allinfo.times[i] === 'TBD') {
                continue
            }

            this.Allinfo.teams.push({
                name: json[i].homeTeam.teamName,
                rank: json[i].homeTeam.divisionLogo,
                logo: json[i].homeTeam.teamLogo,
                link: json[i].homeTeam.teamID,
                rosters: [],
                color: null
            })

            this.Allinfo.teams.push({
                name: json[i].awayTeam.teamName,
                rank: json[i].awayTeam.divisionLogo,
                logo: json[i].awayTeam.teamLogo,
                link: json[i].awayTeam.teamID,
                rosters: [],
                color: null
            })

            await getPlayers()
            return {
                time: this.Allinfo.times[i],
                teams: {
                    home: this.Allinfo.teams[0],
                    away: this.Allinfo.teams[1],
                }
            };
        }
    }
    
    async getPlayers() {
        let u = 0
        for (let u = 0; u < this.Allinfo.teams.length; u++) {
            const element = this.Allinfo.teams[u]
            const json = await this.vrmlClient.getTeam(element.link)
            json.team.players.map(player => {
                element.rosters.push(player.playerName.toLowerCase())
            });
            if(u >= 2) {
                this.infoState = true
                return
            }
        }
    }
        
    connectEchoArena(config) {
        return new Promise((resolve,reject) => {
            this.echoArena = new EchoArena(config, this.eventEmitter)
            this.echoArena.listen()

            if (this.obsConnectionState) {
            
                const echoArenaApi = new Api(config, this.obsClient, this.overlayWS)
                this.setColor().then(() => {
                    // just for testing :
                    this.Allinfo.times = [new Date(new Date().getTime() + 2*6000)]
                    console.log(this.Allinfo.times)
                    // end
                    echoArenaApi.state = true;
                    echoArenaApi.request()
                    new wait(this.obsClient, this.Allinfo, this.overlayWS)
                    resolve()
                }).catch(error => {console.log(error), reject()})
            }
        })
    }

}

module.exports = OBSPlayer
