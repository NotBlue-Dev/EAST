class EventHandler {
    
    constructor(eventEmitter, obsClient, config) {
        this.obsClient = obsClient
        this.eventEmitter = eventEmitter
        this.config = config
        this.timer = null
        this.autoStream = null
        this.vrml = false
        this.left = 0
        this.halfTimeShown = 0
        this.animRN = false
        // round win counter
        this.roundData = {orange:0,blue:0}
        this.listenGameEvents()
        this.initListener()
    }
    
    endStream() {
        clearTimeout(this.delay)
        clearTimeout(this.dur)
        this.delay = setTimeout(() => {
            this.obsClient.send('SetCurrentScene',{"scene-name":this.config.end.ending.scene})
            this.dur = setTimeout(() => {
                this.obsClient.send('StopStreaming')
            }, this.config.end.ending.duration * 1000);
        }, this.config.end.delay * 1000);
    }

    initListener() {
        this.eventEmitter.on('game.emptyTeam', (args, event) => {
            if(this.roundData.orange !== 0 && this.roundData.blue !== 0) {
                this.endStream()
            }
        })

        this.eventEmitter.on('obsWebsocket.connected', (args, event) => {
            this.autoStart()
        })

        this.obsClient.on('StreamStarted', (args) => {
            if(this.vrml) {
                this.obsClient.send('SetCurrentScene',{"scene-name":this.config.autoStart.wait})
                setTimeout(() => {
                    this.obsClient.send('SetCurrentScene',{"scene-name":this.config.start.scene})
                }, this.left);
            } else {
                this.obsClient.send('SetCurrentScene',{"scene-name":this.config.start.scene})
            }
            
        })

        this.eventEmitter.on('scenes.changed', (args, event) => {
            this.autoStart(args.autoStart.time)
            this.config = args
        })

        // VRML match incoming
        this.eventEmitter.on('vrml.matchDataLoaded', (args, event) => {
            clearInterval(this.timer)
            this.timer = setInterval(() => {
                let date = new Date()
                let localTime = new Date(args.time.getTime() + date.getTimezoneOffset() * 60000)
                let incoming = localTime.getHours() + ':' + localTime.getMinutes()
                let currentTime = date.getHours() + ':' + date.getMinutes() - 10
                let timeLeft = incoming - currentTime
                this.left = timeLeft * 60 * 1000
                if(timeLeft <= 10) {
                    this.vrml = true
                    this.obsClient.send('StartStreaming')
                    clearInterval(this.timer)
                } else if (timeLeft <= 0) {
                    this.vrml = false
                    this.obsClient.send('StartStreaming')
                    clearInterval(this.timer)
                }
            }, 1000);
        })
    }

    autoStart() {
        if(this.config.autoStart.auto) {
            if(this.autoStream !== null) {
                return;
            }
            this.autoStream = setInterval(() => {
                let date = new Date()
                let currentTime = date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2)
                if(currentTime == this.config.autoStart.time) {
                    this.obsClient.send('StartStreaming')
                    clearInterval(this.autoStream)
                }
            }, 1000);
        } else {
            clearInterval(this.autoStream)
        }
    }

    switchWindowEvent(event) {
        if(event.used && event.scene !== "DO NOT SWITCH SCENE") {
            setTimeout(() => {
                this.obsClient.send('SetCurrentScene',{"scene-name":event.scene})
                setTimeout(() => {
                    this.obsClient.send('SetCurrentScene',{"scene-name":this.config.autoStart.main})
                }, event.duration * 1000);
            }, event.delay * 1000);
        }
    }

    listenGameEvents() {
        this.eventEmitter.on('game.scoreChanged', (args, event) => {
            let sourceName;
            let sceneName = this.config.autoStart.main

            this.obsClient.send('GetSceneItemList', {sceneName:sceneName}).then((arg) => {
                arg.sceneItems.forEach(item => {
                    if(item.sourceKind === 'vlc_source') {
                        sourceName = item.sourceName
                    }
                });
            });
            
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            
            // shot
            this.switchWindowEvent(gameEvent)
            if(gameEvent.clip) {
                setTimeout(() => {
                    this.eventEmitter.send('game.showScore', args)
                    setTimeout(() => {
                        this.eventEmitter.send('game.endScore')
                    }, (gameEvent.duration * 1000));
                }, gameEvent.delay * 1000);

                // replay
                setTimeout(() => {
                    this.obsClient.send('SaveReplayBuffer')
                    setTimeout(() => {
                        this.obsClient.send('SetSceneItemProperties', {
                            "scene-name": sceneName,
                            "item": sourceName,
                            "visible":true
                        })
                        this.eventEmitter.send('game.showReplay', args)
                        this.animRN = true

                        setTimeout(() => {
                            this.eventEmitter.send('game.endReplay')
                            this.obsClient.send('SetSceneItemProperties', {
                                "scene-name": sceneName,
                                "item": sourceName,
                                "visible":false
                            })
                            setTimeout(() => {
                                this.animRN = false
                            }, 1100);
                        }, (gameEvent.duration * 1000) + 1000);
                    }, ((gameEvent.delay * 1000)+1500)/1.5);
                }, (gameEvent.delay * 1000) + 1500);
            }
        })

        this.eventEmitter.on('game.restart', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            setTimeout(() => {
                this.switchWindowEvent(gameEvent)
            }, gameEvent.delay * 1000);
            this.roundData = {orange:0,blue:0}
        })

        this.eventEmitter.on('game.overtime', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
            setTimeout(() => {
                this.eventEmitter.send('animation.triggerOT')
            }, gameEvent.delay * 1000);
        })

        this.eventEmitter.on('game.possessionChange', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })

        this.eventEmitter.on('local.halfTimeStats', (args, event) => {
            if(this.halfTimeShown < 2) {
                this.halfTimeShown++;
                this.eventEmitter.send('animation.triggerHalfTime', args)
            }
        })

        this.eventEmitter.on('game.play', (args, event) => {
            this.obsClient.send('SetCurrentScene',{"scene-name":this.config.autoStart.main})
        })

        this.eventEmitter.on('game.roundOver', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.roundData[args.winner]++
            let showRound = () => {
                if(this.animRN) {
                    setTimeout(() => {
                        showRound()
                    }, 1000);
                } else {
                    this.eventEmitter.send('animation.triggerRoundOver', {rounds:args.rounds, winner:args.winner})
                    this.halfTimeShown = 0
                    this.switchWindowEvent(gameEvent)
                    setTimeout(() => {
                        setTimeout(() => {
                            this.obsClient.send('SetCurrentScene',{"scene-name":this.config.start.between})
                        }, gameEvent.duration * 1000);
                    }, (gameEvent.delay * 1000));
                }
            }
            
            setTimeout(() => {
                showRound()
            }, gameEvent.delay * 1000);
            if(this.roundData.blue-this.roundData.orange >= 2 || this.roundData.orange-this.roundData.blue >= 2) {
                this.endStream()
            }
            
        })
        this.eventEmitter.on('game.roundStart', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            setTimeout(() => {
                this.eventEmitter.send('animation.triggerRoundStart', {round:args.round})
                this.switchWindowEvent(gameEvent)
            }, gameEvent.delay * 1000);
            
        })
        this.eventEmitter.on('game.teamChange', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
            clearTimeout(this.delay)
            clearTimeout(this.dur)
        })
    }

}

module.exports = EventHandler