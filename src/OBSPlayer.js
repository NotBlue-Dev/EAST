const ConfigLoader = require('./ConfigLoader');
const OBSClient = require('./OBSClient');
const OverlayWS = require('./ws/OverlayWS');
const VRMLClient = require('./VRMLClient');
const EchoArena = require('./EchoArena');
const EventHandler = require('./EventHandler');
const events = require('./EchoArenaEvents.js');
const path = require('path');
const exec = require('child_process').exec;
class OBSPlayer {
    constructor(rootPath, eventEmitter) {
        this.configLoader = new ConfigLoader(rootPath);
        this.globalConfig = this.configLoader.load();
        this.eventEmitter = eventEmitter;
        this.eventEmitter.send('config.loaded', this.globalConfig);
        this.spectateStarted = false;
        this.obsClient = new OBSClient(eventEmitter);
        this.overlayWS = new OverlayWS(this.globalConfig.overlayWs, this.eventEmitter, rootPath);
        this.scenes = [];
        this.eventHandler = null;
        this.sessionID = null;
        this.restarting = false;
        this.echoArena = null;
        this.custom = null;
        this.arenaSwitched = 1;
        this.vrmlInfo = null;
        this.vrmlInfoWS = [];
        this.config = this.globalConfig.echoArena;
        this.vrmlClient = new VRMLClient();
        this.infoState = false;
        this.Allinfo = {
            "teams":[],
            "times":[],
            "week":null,
            "season":null,
        };
    }

    async start() {
        try {
            await this.loadTeamList(this.globalConfig.vrml.region);
            //await this.connectVrml(this.globalConfig.vrml.teamId)
        } catch (err) {
            console.error(err.message);
        }

        this.obsConnectionState = false;
        this.initializeListeners();
    }

    initializeWS() {
        this.eventEmitter.on('overlayWs.launchServer', (args) => {
            this.overlayWS.startServer(args.port).then(() => {
                this.eventEmitter.add({
                    send:this.overlayWS.send, 
                    on:this.overlayWS.on
                });
                this.globalConfig.overlayWs.autoLaunch = args.autoLaunch;
                this.globalConfig.overlayWs.port = args.port;
                this.configLoader.save(this.globalConfig);
                this.eventEmitter.send('overlayWs.listening', args);

                this.initializeListenersUsedByWS();
            }).catch((error) => {
                this.eventEmitter.send('overlayWs.launchFailed', {
                    args,
                    error
                });
            });
        });

        this.eventEmitter.send('all.ready');
        
    } 

    createScenesAndContent() {
            let scenesListandSourcesData;
            let OBSsources = [];
            this.obsClient.send('GetSceneList').then((arg) => {
                scenesListandSourcesData = arg.scenes;
                this.globalConfig.obs.scenesNames.forEach(scene => {
                    let sceneName = `[Echo Overlay] ${scene}`;  
                    if(!scenesListandSourcesData.some(obj => obj.name === sceneName)) {
                        this.obsClient.createScene(sceneName);
                    }
                });
                this.obsClient.send('SetTransitionSettings', {
                    transitionName:'Stinger', 
                    transitionSettings: {
                        audioFadeStyle: 0,
                        path: path.join(__dirname, '../public/assets/transition/transition.mov')
                    }
                });

                this.obsClient.send('SetCurrentTransition', {
                    "transition-name":'Stinger'
                });

                setTimeout(() => {
                    this.globalConfig.obs.sources.forEach(source => {
                        let settings = {
                            width:this.globalConfig.obs.width,
                            height:this.globalConfig.obs.height
                        };
                        scenesListandSourcesData.forEach(item => {
                            item.sources.forEach(source => {
                                if(!OBSsources.some(obj => obj.name === source.name)) {
                                    OBSsources.push({
                                        name:source.name, 
                                        type:source.type
                                    });
                                }
                            });
                        });
                        
                        source.scene.forEach(scene => {
                            let sceneName = `[Echo Overlay] ${scene.name}`;  
                            let index = scenesListandSourcesData.findIndex(obj => obj.name === sceneName);
                            if(scene.data !== undefined) {
                                settings.captureMode = 'window';
                                settings.window = 'Echo VR:WindowsClass:echovr.exe';
                            }
                            if(source.url !== undefined) {
                                settings.url = `http://localhost:${this.globalConfig.overlayWs.port}/${source.url}`;
                                settings.restartWhenActive = scene.refresh;
                            }
                            if(source.type === 'ffmpeg_source') {
                                settings.localFile = path.join(__dirname, source.file);
                                settings.looping = true;
                            }
                            if(!OBSsources.some(obj => obj.name === source.name && obj.type === source.type)) {
                                this.obsClient.createSource(source.name, source.type, sceneName, settings);
                            } else if(index === -1 || scenesListandSourcesData[index].sources.findIndex(obj => obj.name === source.name && obj.type === source.type) === -1) {
                                this.obsClient.addSourceToScene(sceneName, source.name);
                            }
                        });
                        
                        setTimeout(() => {
                            source.scene.forEach(scene => {
                                let sceneName = `[Echo Overlay] ${scene.name}`;
                                let order = [];
                                if(scene.data !== undefined) {
                                    if(scene.data.mute) {
                                        this.obsClient.send('SetMute', {
                                            source:source.name, 
                                            mute:true
                                        });
                                    }
                                }
                                
                                if(scene.order !== undefined) {
                                    this.obsClient.send('GetSceneItemList', {
                                        sceneName:sceneName
                                    }).then((arg) => {
                                        arg.sceneItems.forEach(item => {
                                            if(item.sourceName !== source.name) {
                                                order.push({
                                                    name:item.sourceName
                                                });
                                            }
                                        });

                                        // si la liste est renvoyer a l'envers on la retourne
                                        if(order[order.length - 1].name === 'Replay') {
                                            order = order.reverse();
                                        }
                                        
                                        if(scene.order === 'first') {
                                            order = [{
                                                name:source.name
                                            }].concat(order);
                                        }
                                        
                                        if(scene.order === 'last') {
                                            order.push({
                                                name:source.name
                                            });
                                        }
                                        this.obsClient.setSourceOrder(sceneName, order);
                                    });
                                }

                                if(scene.data !== undefined) {
                                    if(scene.data.playlist !== undefined) {
                                        let playlist = scene.data.playlist;
                                        let val = playlist[0].value;
                                        playlist[0].value = path.join(__dirname, val);
                                        this.obsClient.send('SetSourceSettings', {
                                            "sourceName": source.name,
                                            "sourceSettings": {
                                                "playlist": playlist[0].value,
                                                "loop":true
                                            }
                                        });
                                    }
                                    this.obsClient.send('SetSceneItemTransform', {
                                        'scene-name': sceneName,
                                        'item': source.name,
                                        "x-scale": scene.data.scaleX,
                                        "y-scale": scene.data.scaleY,
                                        'rotation':0,
                                    });
                                    this.obsClient.send('SetSceneItemPosition', {
                                        'scene-name': sceneName,
                                        'item': source.name,
                                        'x': scene.data.x,
                                        'y': scene.data.y
                                    });
                                    this.obsClient.send('SetSceneItemProperties', {
                                        "scene-name": sceneName,
                                        "item": source.name,
                                        "visible":scene.data.visible
                                    });

                                    settings = {
                                        width:this.globalConfig.obs.width,
                                        height:this.globalConfig.obs.height
                                    };
                                }

                                this.obsClient.refreshAll();
                            });
                        }, 500);
                    });
                }, 500);
            });
    }

    startEchoVR(executablePath, sessionID) {
        let self = this;
        this.sessionID = sessionID;
        exec(`start /d "${executablePath}" echovr.exe -spectatorstream ${sessionID !== null ? `-lobbyid "${sessionID}"` : ""} ${this.globalConfig.echoArena.settings.anonymous ? "-noovr" : ""} ${this.globalConfig.echoArena.port != 6721 ? `-httpport ${this.globalConfig.echoArena.port} ` : ""} `, (error) => { 
            if(error !== null) {
                self.eventEmitter.send('spectate.error', error);
                console.log(error);
            }
            self.eventEmitter.send('spectate.started');
            this.restarting = false;
        });
    }

    setTournamentTeams(args) {
        let obj = {};
        this.globalConfig.tournament.teams.forEach((team) => {
            let countB = 0;
            let countO = 0;
            team.players.forEach((player) => {
                if(args.blue.includes(player)) {
                    countB++;
                }
                if(args.orange.includes(player)) {
                    countO++;
                }
            });
            obj[team.teamName] = {
                blue:countB,
                orange:countO
            };
        });

        let blueTeam = Object.keys(obj).reduce((a, b) => (obj[a].blue > obj[b].blue ? a : b));

        let orangeTeam = Object.keys(obj).reduce((a, b) => (obj[a].orange > obj[b].orange ? a : b));

        if(obj[blueTeam].blue === 0 && obj[blueTeam].orange === 0) {
            blueTeam = this.globalConfig.mixed.blue;
        }
        if(obj[orangeTeam].blue === 0 && obj[orangeTeam].orange === 0) {
            orangeTeam = this.globalConfig.mixed.orange;
        }

        this.custom.mixed = {
            blue:blueTeam,
            orange:orangeTeam
        };
        this.echoArena.customData = this.custom;
        this.eventEmitter.send('updateNames', this.custom.mixed);
        console.log(this.custom.mixed);
    }

    initializeListenersUsedByWS() {
        if(this.obsConnectionState) {
            this.obsClient.refreshAll();
        }
        this.eventEmitter.on('overlay.ready', () => {
            if(this.globalConfig.vrml.autoLoad) {
                this.overlayWS.send('vrml.matchDataLoaded', this.vrmlInfoWS);
            }
            if(this.obsConnectionState && this.echoArena !== null) {
                this.overlayWS.send('roundData', this.echoArena.rounds);
                this.overlayWS.send('game.updateScore', this.echoArena.scoreData);
            }
        });
    }

    initializeListeners() {
        this.vrmlClient.getSeason().then((data) => {
            this.Allinfo.season = data;
        });

        //ATEST

        this.eventEmitter.on('echo.nextArena', () => {
            if(this.arenaSwitched >= this.globalConfig.tournament.games) {
                let self = this;
            
                exec('taskkill /F /IM echovr.exe', (error) => {
                    if(error !== null) {
                        self.eventEmitter.send('spectate.error', error);
                        console.log(error);
                    }
                    self.eventEmitter.send('spectate.stopped');
                });
                
                let nextArena = this.globalConfig.tournament.arena[(this.globalConfig.tournament.arena.indexOf(this.sessionID) + 1) % this.globalConfig.tournament.arena.length];
                this.startEchoVR(this.globalConfig.echoArena.executablePath, nextArena);
                this.arenaSwitched++;
            }
        });

        this.eventEmitter.on('vrml.region', (args) => {
            this.globalConfig.vrml.region = args.region;
            this.loadTeamList(args.region);
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('vrml.disabled', () => {
            this.eventEmitter.send('vrml.hide');
        });

        this.eventEmitter.on('obsWebsocket.autoBuffer', (args) => {
            this.globalConfig.obs.autoBuffer = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('tournament.games', (args) => {
            this.globalConfig.tournament.games = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('tournament.removeTeam', (args) => {
            let team = this.globalConfig.tournament.teams.find((team) => team.teamName === args);
            if(team != undefined) {
                this.globalConfig.tournament.teams.splice(this.globalConfig.tournament.teams.indexOf(team), 1);
                this.configLoader.save(this.globalConfig);
            }
        });

        this.eventEmitter.on('tournament.addTeam', (args) => {
            console.log(args);
            this.globalConfig.tournament.teams.push(args);
            console.log(this.globalConfig.tournament.teams);
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('tournament.updateTeam', (args) => {
            let team = this.globalConfig.tournament.teams.find((team) => team.teamName === args.oldName);
            if(team != undefined) {
                team.teamName = args.team;
                team.players = args.players;
                this.configLoader.save(this.globalConfig);
                this.custom.tournament = this.globalConfig.tournament.teams;
            }
        });

        this.eventEmitter.on('tournament.getTeam', (args) => {
            let team = this.globalConfig.tournament.teams.find((team) => team.teamName === args);
            this.eventEmitter.send('tournament.team', team);
        });

        this.eventEmitter.on('tournament.enable', (args) => {
            this.globalConfig.tournament.enabled = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('tournament.custom', (args) => {
            this.globalConfig.tournament.customTeams = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('tournament.arena', (args) => {
            this.globalConfig.tournament.arena = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('scenes.autoStart', (args) => {
            this.globalConfig.autoStream.autoStart = {
                ...this.globalConfig.autoStream.autoStart,
                ...args
            };
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream);
        });

        this.eventEmitter.on('scenes.start', (args) => {
            this.globalConfig.autoStream.start = {
                ...this.globalConfig.autoStream.start,
                ...args
            };
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream);
        });
        
        this.eventEmitter.on('scenes.events', (args) => {
            this.globalConfig.autoStream.game = {
                ...this.globalConfig.autoStream.game,
                ...args
            };
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream);
        });

        this.eventEmitter.on('scenes.end', (args) => {
            this.globalConfig.autoStream.end = {
                ...this.globalConfig.autoStream.end,
                ...args
            };
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream);
        });

        this.eventEmitter.on('update.Names', (args) => {
            this.eventEmitter.send('updateNames', args);
        });

        this.eventEmitter.on('obsWebsocket.autoConnect', (args) => {
            this.globalConfig.obs.autoConnect = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('spectate.start', (args) => {
            if(args !== undefined && args.id !== undefined && args.id !== "" && args.id !== null) {
                this.sessionID = args.id;
            }
            
            if(!this.spectateStarted) {
                this.startEchoVR(this.globalConfig.echoArena.path, this.sessionID);
                this.spectateStarted = true;
            }
        });

        this.eventEmitter.on('spectate.restart', () => {
            if(!this.restarting) {
                exec('taskkill /F /IM EchoVR.exe', (error) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                    }
                    this.startEchoVR(this.globalConfig.echoArena.path, this.sessionID);
                    this.spectateStarted = true;
                    this.restarting = true;
                });
                
            }
        });

        this.eventEmitter.on('echoArena.updateDurBetweenRound', (args) => {
            this.globalConfig.autoStream.start.dur = args.dur;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('game.restart', () => {
            this.echoArena.rounds = [];
            this.eventEmitter.send('frontEnd.reset');
        });

        this.eventEmitter.on('echoArena.sessionID', (args) => {
            let self = this;
            this.sessionID = args.sessionID;
            this.echoArena.rounds = [];
            this.echoArena.killAll();
            
            this.connectEchoArena({
                ip:this.globalConfig.echoArena.ip, 
                port:this.globalConfig.echoArena.port
            });

            exec('tasklist /FI "imagename eq echovr.exe"', function(err, stdout) {
                if(stdout.indexOf('echovr.exe') === -1) {
                    self.spectateStarted = false;
                } else {
                    self.spectateStarted = true;
                }
            });
            
            if(this.globalConfig.echoArena.autoStart && !this.spectateStarted) {
                this.startEchoVR(this.globalConfig.echoArena.path, args.sessionID);
            }
            if(this.echoArena !== null) {
                this.echoArena.setSettingsEchoVR(this.globalConfig.echoArena.settings);
            }

            this.eventEmitter.send('frontEnd.reset');

            if(this.globalConfig.tournament.customTeams) {
                this.setTournamentTeams(args);
            }
        });

        this.eventEmitter.on('spectate.updateConfig', (args) => {
            this.globalConfig.echoArena.settings = {
                ...this.globalConfig.echoArena.settings,
                ...args.settings
            };
            let parts = args.path.split('\\');
            let output = parts.join('/');
            if(output.endsWith('echovr.exe')) {
                output = output.substring(0, output.length - 11);
            }
            if(!output.endsWith('/')) {
                output += '/';
            }
            this.globalConfig.echoArena.path = output;
            this.globalConfig.echoArena.autoStart = args.spectateMe;
            this.configLoader.save(this.globalConfig);
            if(this.echoArena !== null) {
                this.echoArena.setSettingsEchoVR(this.globalConfig.echoArena.settings);
            }
        });
        
        this.eventEmitter.on('obs.screen', (args) => {
            this.globalConfig.obs.width = args.width;
            this.globalConfig.obs.height = args.height;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('obs.soft', (args) => {
            this.globalConfig.obs.autoStart = args.auto;
            let parts = args.path.split('\\');
            let output = parts.join('/');
            this.globalConfig.obs.path = output;
            this.configLoader.save(this.globalConfig);
        });
        
        this.eventEmitter.on('obsWebsocket.createScenes', () => {
            this.createScenesAndContent();
            if(this.obsConnectionState) {
                this.obsClient.refreshAll();
            }

        });

        this.eventEmitter.on('obs.start', () => {
            let executablePath = this.globalConfig.obs.path;
            this.obsClient.isLaunched().then((isLaunched) => {
                if(!isLaunched) {
                    this.obsClient.launch(executablePath);
                }
            });
        });

        this.eventEmitter.on('obsWebsocket.clip', (args) => {
            this.globalConfig.autoStream.end = {
                ...this.globalConfig.autoStream.end,
                ...args
            };
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('scenes.changed', this.globalConfig.autoStream);
        });

        this.eventEmitter.on('echoArena.connect', (args) => {
            this.connectEchoArena(args).then(() => {
                this.eventEmitter.send('echoArena.connected', args);
                this.globalConfig.echoArena = {
                    ...this.globalConfig.echoArena,
                    ...args,
                };

                if(this.echoArena !== null) {
                    this.echoArena.setSettingsEchoVR(this.globalConfig.echoArena.settings);
                }

                this.configLoader.save(this.globalConfig);
                this.obsClient.send('GetSourcesList').then(() => {
                    this.obsClient.refreshAll();
                });
            }).catch((error) => {
                this.eventEmitter.send('echoArena.connectionFailed', {
                    args,
                    error
                });
            });
        });

        this.eventEmitter.on('echoArena.edit', (args) => {
            this.globalConfig.echoArena.ip = args.ip;
            this.globalConfig.echoArena.port = args.port;
            this.globalConfig.echoArena.autoConnect = args.autoConnect;
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('echoArena.configEdited', this.globalConfig.echoArena);
        });

        let ev = events.filter(event => event.customizable);
        this.eventEmitter.send('echoArena.eventsLoaded', {
            events: ev.map(event => event.name)
        }); 

        this.eventEmitter.on('obsWebsocket.connect', (args) => {
            this.connectObsWebsocket(args).then(() => {
                this.eventEmitter.send('obsWebsocket.connected', args);
                this.eventHandler = new EventHandler(this.eventEmitter, this.obsClient, this.globalConfig.autoStream, this.globalConfig);
                this.globalConfig.obs = {
                    ...this.globalConfig.obs,
                    ...args,
                };        
                this.obsClient.refreshAll();
                this.configLoader.save(this.globalConfig);
            }).catch((error) => {
                this.eventEmitter.send('obsWebsocket.connectionFailed', {
                    args,
                    error
                });
            });
        });

        this.eventEmitter.on('obsWebsocket.startStream', (args) => {
            this.obsClient.send('StartStreaming').catch((error) => {
                this.eventEmitter.send('obsWebsocket.startStreamFailed', {
                    args,
                    error
                });
            });
        });
    
        this.eventEmitter.on('obsWebsocket.stopStream', (args) => {
            this.obsClient.send('StopStreaming').catch((error) => {
                this.eventEmitter.send('obsWebsocket.stopStreamFailed', {
                    args,
                    error
                });
            });
        });

        this.eventEmitter.on('obsWebsocket.startBuffer', () => {
            this.obsClient.send('GetReplayBufferStatus').then(arg => {
                if(!arg.isReplayBufferActive) {
                    this.obsClient.send("StartReplayBuffer");
                }
            });
            
        });

        this.eventEmitter.on('mixed.customTeam', (args) => {
            this.globalConfig.mixed.blue = args.blue;
            this.globalConfig.mixed.orange = args.orange;
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('mixed.customTeamChanged', this.globalConfig.mixed);
        });

        this.eventEmitter.on('game.teamChange', (args) => {
            if(this.globalConfig.tournament.customTeams) {
                this.setTournamentTeams(args);
            }
        });

        this.eventEmitter.on('overlayWs.config', (args) => {
            this.globalConfig.overlayWs.autoLaunch = args.autoLaunch;
            this.globalConfig.overlayWs.port = args.port;
            this.configLoader.save(this.globalConfig);
            this.eventEmitter.send('overlayWs.configEdited', this.globalConfig.overlayWs);
        });

        this.eventEmitter.on('vrml.autoLoad', (args) => {
            this.globalConfig.vrml.autoLoad = args;
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('app.kill', () => {
            this.overlayWS.killServer();
        });

        this.eventEmitter.on('vrml.teamSelected', (args) => {
            this.eventEmitter.send('vrml.teamChanged', args);
            this.globalConfig.vrml = {
                ...this.globalConfig.vrml,
                ...args,
            };
            // reset team info
            this.Allinfo = {
                "teams":[],
                "times":[],
                "week":null
            };
            this.configLoader.save(this.globalConfig);
        });

        this.eventEmitter.on('vrml.isVrmlMatch', (args) => {
            console.log('load data');
            this.loadMatchDataFromTeam(args.teamId);
        });
        
        this.initializeWS();
        
    }

    loadMatchDataFromTeam(teamId) {

        this.getMatchDataFromTeam(teamId).then((match) => {
            if(this.echoArena !== null) {
                this.echoArena.vrmlInfo = match;
            } 
            this.vrmlInfoWS = match;
            this.eventEmitter.send('vrml.matchDataLoaded', match);
            
        }).catch(() => {
            this.vrmlInfoWS = this.Allinfo;
            this.eventEmitter.send('vrml.matchDataNotFound', {
                teamId: teamId
            });
        });
        
    }

    connectObsWebsocket(args) {
        return this.obsClient
            .onConnected(() => {
                if(this.obsConnectionState !== true) {
                    this.obsConnectionState = true;
                    setTimeout(() => {
                        this.eventEmitter.send('obs.connected');
                        this.obsClient.send('GetSceneList').then((scenesData) => {
                            this.eventEmitter.send('scenes.loaded', {
                                scenes: scenesData.scenes.map(scene => scene.name)
                            });
                            this.eventEmitter.send('autoStream.configLoaded', this.globalConfig.autoStream);
                        });
                    }, 1000);
                }
            })
            .onDisconnected(() => {
                this.obsConnectionState = false;
                this.eventEmitter.send('obs.disconnected');
            })
        .connect(args);
    }

    async loadTeamList(args) {
        const json = await this.vrmlClient.getTeams(args);
        const teams = json.filter(team => team.isActive).map((team) => {
            return {
                name: team.teamName,
                id: team.teamID,
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
        this.eventEmitter.send('vrml.teamListLoaded', {
            teams,
            teamId: this.globalConfig.vrml.teamId,
            auto:this.globalConfig.vrml.autoLoad,
            region:args,
            regions:['eu','na','oce']
        });
    }

    async getMatchDataFromTeam(team) {
        const json = await this.vrmlClient.getTeamUpcomingMatches(team);
        
        // reset team info
        this.Allinfo.teams = [];

        try {
            this.Allinfo.week = json[0].week;
        } catch {
            console.log('catch');
        }

        json.forEach(element => {
            let dt = new Date(element.dateScheduledUTC);
            if(dt.getDay() === 1 && dt.getHours() === 13) {
                this.Allinfo.times.push('TBD');
            } else {
                // dt.setHours(dt.getHours()+2);
                this.Allinfo.times.push(dt);
            }
        });

        if(this.Allinfo.times.length === 0) {
            throw new Error('no matches found');
        }

        if(this.Allinfo.times.filter(x => x == 'TBD').length === this.Allinfo.times.length) {
            throw new Error('no matches scheduled');
        }

        for(let i = 0; i < this.Allinfo.times.length; i++) {
            if(this.Allinfo.times[i] !== 'TBD') {

                /*
                 * const data = {
                 *     A:this.vrmlClient.getTeamPlace(json[i].homeTeam.teamID), 
                 *     B:this.vrmlClient.getTeamPlace(json[i].awayTeam.teamID)
                 * };
                 */
                this.Allinfo.teams.push({
                    name: json[i].homeTeam.teamName,
                    rank: json[i].homeTeam.divisionLogo,
                    logo: json[i].homeTeam.teamLogo,
                    link: json[i].homeTeam.teamID,
                    rosters: [],
                    // place:data.A.team.rank,
                    color: null
                });
    
                this.Allinfo.teams.push({
                    name: json[i].awayTeam.teamName,
                    rank: json[i].awayTeam.divisionLogo,
                    logo: json[i].awayTeam.teamLogo,
                    link: json[i].awayTeam.teamID,
                    rosters: [],
                    // place:data.B.team.rank,
                    color: null
                });
                console.log(this.Allinfo.teams);
                this.getPlayers();

                return {
                    // time: newDate,
                    time: this.Allinfo.times[i],
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

    getPlayers() {
        for (let u = 0; u < this.Allinfo.teams.length; u++) {
            const element = this.Allinfo.teams[u];
            this.vrmlClient.getTeam(element.link).then((json) => {
                json.team.players.map(player => {
                    element.rosters.push(player.playerName.toLowerCase());
                    return 0;
                });
                if(u >= 2) {
                    this.infoState = true;
                    // eslint-disable-next-line no-useless-return
                    return;
                }
            }).catch((err) => {
                console.log(err);
            });
            
            
        }
    }
        
    connectEchoArena(config) {
        return new Promise(() => {
            this.custom = {
                mixed:this.globalConfig.mixed, 
                bet:this.globalConfig.autoStream.start.dur,
                tournament:this.globalConfig.tournament.teams,
            };
            this.echoArena = new EchoArena(config, this.eventEmitter, this.vrmlInfo, this.custom, this.config.autoRestart);
            this.echoArena.listen();
        });
    }

}

module.exports = OBSPlayer;
