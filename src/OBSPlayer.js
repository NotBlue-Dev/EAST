const ConfigLoader = require('./ConfigLoader')
const OBSClient = require('./OBSClient')
const OverlayWS = require('./ws/OverlayWS')
const fetch = require('node-fetch');
const VRMLClient = require('./VRMLClient')
const EchoArena = require('./EchoArena')
const EventHandler = require('./EventHandler')
const events = require('./EchoArenaEvents.js')

class OBSPlayer {
    constructor(rootPath, eventEmitter) {
        this.configLoader = new ConfigLoader(rootPath)
        this.globalConfig = this.configLoader.load();
        this.eventEmitter = eventEmitter
        this.eventEmitter.send('config.loaded', this.globalConfig)

        this.obsClient = new OBSClient()
        this.overlayWS = new OverlayWS(this.globalConfig.overlayWs, this.eventEmitter, rootPath)
        this.scenes = []
        this.eventHandler = null
        this.echoArena = null

        this.config = this.globalConfig.echoArena
        this.vrmlClient = new VRMLClient()
        this.infoState = false
        this.Allinfo = {
            "teams":[],
            "times":[],
            "week":null,
            "season":null,
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

    initializeWS() {
        this.eventEmitter.on('overlayWs.launchServer', (args, event) => {
            this.overlayWS.startServer(args.port).then(() => {
                this.eventEmitter.add({send:this.overlayWS.send, on:this.overlayWS.on})
                this.globalConfig.overlayWs.autoLaunch = args.autoLaunch
                this.globalConfig.overlayWs.port = args.port
                this.configLoader.save(this.globalConfig)
                this.eventEmitter.send('overlayWs.listening', args)
                this.initializeListenersUsedByWS()
            }).catch((error) => {
                this.eventEmitter.send('overlayWs.launchFailed', {
                    args,
                    error
                })
            })
        })
    } 

    initializeListenersUsedByWS() {
        this.eventEmitter.on('overlay.ready', (args, event) => {
            let data = this.loadMatchDataFromTeam(this.globalConfig.vrml.teamId)
            this.overlayWS.send('vrml.matchDataLoaded', data)
        })
    }

    initializeListeners() {
        this.vrmlClient.getSeason().then((data) => {
            this.Allinfo.season = data
        })

        this.eventEmitter.on('obsWebsocket.autoBuffer', (args, event) => {
            this.globalConfig.obs.autoBuffer = args
            this.configLoader.save(this.globalConfig)
        })

        this.eventEmitter.on('scenes.autoStart', (args, event) => {
            this.globalConfig.autoStream.autoStart = {
                ...this.globalConfig.autoStream.autoStart,
                ...args
            }
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream)
        })

        this.eventEmitter.on('scenes.start', (args, event) => {
            this.globalConfig.autoStream.start = {
                ...this.globalConfig.autoStream.start,
                ...args
            }
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream)
        })
        
        this.eventEmitter.on('scenes.events', (args, event) => {
            this.globalConfig.autoStream.game = {
                ...this.globalConfig.autoStream.game,
                ...args
            }
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream)
        })

        this.eventEmitter.on('scenes.end', (args, event) => {
            this.globalConfig.autoStream.end = {
                ...this.globalConfig.autoStream.end,
                ...args
            }
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream)
        })

        this.eventEmitter.on('obsWebsocket.clip', (args, event) => {
            this.globalConfig.autoStream.end = {
                ...this.globalConfig.autoStream.end,
                ...args
            }
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream)
        })

        this.eventEmitter.on('echoArena.connect', (args, event) => {
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

        this.eventEmitter.on('echoArena.edit', (args, event) => {
            this.globalConfig.echoArena.ip = args.ip
            this.globalConfig.echoArena.autoConnect = args.autoConnect
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('echoArena.configEdited', this.globalConfig.echoArena)
        })

        

        let ev = events.filter(event => event.customizable)
        this.eventEmitter.send('echoArena.eventsLoaded', {
            events: ev.map(event => event.name)
        }) 

        this.eventEmitter.on('obsWebsocket.connect', (args, event) => {
            this.connectObsWebsocket(args).then(() => {
                this.eventEmitter.send('obsWebsocket.connected', args)
                this.eventHandler = new EventHandler(this.eventEmitter, this.obsClient, this.globalConfig.autoStream)
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

        this.eventEmitter.on('obsWebsocket.startStream', (args, event) => {
            this.obsClient.send('StartStreaming').catch((error) => {
                this.eventEmitter.send('obsWebsocket.startStreamFailed', {
                    args,
                    error
                })
            })
        })
    
        this.eventEmitter.on('obsWebsocket.stopStream', (args, event) => {
            this.obsClient.send('StopStreaming').catch((error) => {
                this.eventEmitter.send('obsWebsocket.stopStreamFailed', {
                    args,
                    error
                })
            })
        })

        this.eventEmitter.on('obsWebsocket.startBuffer', (args, event) => {
            this.obsClient.send("StartReplayBuffer")
        })

        this.eventEmitter.on('overlayWs.config', (args, event) => {
            this.globalConfig.overlayWs.autoLaunch = args.autoLaunch
            this.globalConfig.overlayWs.port = args.port
            this.configLoader.save(this.globalConfig)
            this.eventEmitter.send('overlayWs.configEdited', this.globalConfig.overlayWs)
        })

        this.eventEmitter.on('vrml.autoLoad', (args, event) => {
            this.globalConfig.vrml.autoLoad = args
            this.configLoader.save(this.globalConfig)
        })

        this.eventEmitter.on('vrml.teamSelected', (args, event) => {
            this.eventEmitter.send('vrml.teamChanged', args)
            this.globalConfig.vrml = {
                ...this.globalConfig.vrml,
                ...args,
            }
            // reset team info
            this.Allinfo = {
                "teams":[],
                "times":[],
                "week":null
            }
            this.configLoader.save(this.globalConfig)
        })

        this.eventEmitter.on('vrml.isVrmlMatch', (args, event) => {
            this.loadMatchDataFromTeam(args.teamId)
        })
        
        this.initializeWS()
        
    }

    loadMatchDataFromTeam(teamId) {
        this.getMatchDataFromTeam(teamId).then((match) => {
            if(this.echoArena !== null) this.echoArena.vrmlInfo = match
            this.eventEmitter.send('vrml.matchDataLoaded', match)
            
        }).catch(error => {
            this.eventEmitter.send('vrml.matchDataNotFound', {
                teamId: teamId
            })
            
        })
        
    }

    connectObsWebsocket(args) {
        return this.obsClient
            .onConnected((name) => {
                if(this.obsConnectionState !== true) {
                    this.obsConnectionState = true
                    console.log('Connected')
                    setTimeout(() => {
                        this.obsClient.send('GetSceneList').then((scenesData) => {
                            this.eventEmitter.send('scenes.loaded', {
                                scenes: scenesData.scenes.map(scene => scene.name)
                            })
                            this.eventEmitter.send('autoStream.configLoaded', this.globalConfig.autoStream)
                        })
                    }, 1000);
                }
            })
            .onDisconnected((message) => {
                this.obsConnectionState = false
                console.log('Disconnected', message)
            })
        .connect(args)
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
            teamId: this.globalConfig.vrml.teamId,
            auto:this.globalConfig.vrml.autoLoad
        })
    }

    async getMatchDataFromTeam(team) {
        const json = await this.vrmlClient.getTeamUpcomingMatches(team)
        
        // reset team info
        this.Allinfo.teams = []

        try {
            this.Allinfo.week = json[0].week
        } catch {}

        json.forEach(element => {
            let dt = new Date(element.dateScheduledUTC)
            if(dt.getDay() === 1 && dt.getHours() === 13) {
                this.Allinfo.times.push('TBD');
            } else {
                dt.setHours(dt.getHours()+2);
                this.Allinfo.times.push(dt);
            }
        });

        if(this.Allinfo.times.length === 0) {
            throw new Error('no matches found')
        }

        if(this.Allinfo.times.filter(x => x == 'TBD').length === this.Allinfo.times.length) {
            throw new Error('no matches scheduled')
        }

        for(let i = 0; i<this.Allinfo.times.length; i++) {
            if(this.Allinfo.times[i] !== 'TBD') {
                const data = {A:await this.vrmlClient.getTeamPlace(json[i].homeTeam.teamID), B:await this.vrmlClient.getTeamPlace(json[i].awayTeam.teamID)}
                this.Allinfo.teams.push({
                    name: json[i].homeTeam.teamName,
                    rank: json[i].homeTeam.divisionLogo,
                    logo: json[i].homeTeam.teamLogo,
                    link: json[i].homeTeam.teamID,
                    rosters: [],
                    place:data.A.team.rank,
                    color: null
                })
    
                this.Allinfo.teams.push({
                    name: json[i].awayTeam.teamName,
                    rank: json[i].awayTeam.divisionLogo,
                    logo: json[i].awayTeam.teamLogo,
                    link: json[i].awayTeam.teamID,
                    rosters: [],
                    place:data.B.team.rank,
                    color: null
                })
            
                await this.getPlayers()

                let date = new Date(this.Allinfo.times[i])
                let newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
                let offset = date.getTimezoneOffset() / 60;
                let hours = date.getHours();
                newDate.setHours(hours - offset);

                return {
                    time: newDate,
                    week:this.Allinfo.week,
                    season:this.Allinfo.season,
                    teams: {
                        home: this.Allinfo.teams[0],
                        away: this.Allinfo.teams[1],
                    }
                };
            }
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
        console.log(this.echoArena)
        return new Promise((resolve,reject) => {
            if(this.echoArena === null) this.echoArena = new EchoArena(config, this.eventEmitter, this.Allinfo)
            this.echoArena.listen()
        })
    }

}

module.exports = OBSPlayer
