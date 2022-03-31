class EventHandler {
    
    constructor(eventEmitter, obsClient, config) {
        this.obsClient = obsClient
        this.eventEmitter = eventEmitter
        this.config = config
        this.timer = null
        this.autoStream = null
        this.vrml = false
        this.left = 0
        // round win counter
        this.roundData = {orange:0,blue:0}
        this.listenGameEvents()
        this.initListener()
    }
    
    // Event handler (stop stream (detecter stop stream :  ))
    // End stream,delay = time without game restarting (count round win) 

    // reset need to reset the win round count (reset event done)

    // show end stream scene during duration, end stream

    // owa le bordel

    initListener() {
        this.eventEmitter.on('game.emptyTeam', (args, event) => {
            if(this.roundData.orange !== 0 && this.roundData.blue !== 0) {
                // start delay before end game
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
            if(args.autoStart.time != this.config.autoStart.time) {
                this.autoStart(args.autoStart.time)
            }
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
            this.autoStream = setInterval(() => {
                let date = new Date()
                let currentTime = date.getHours() + ':' + date.getMinutes()
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
        if(event.used) {
            setTimeout(() => {
                this.obsClient.send('SetCurrentScene',{"scene-name":event.scene})
                setTimeout(() => {
                    this.obsClient.send('SetCurrentScene',{"scene-name":this.config.autoStart.main})
                }, event.duration * 1000);
            }, event.delay * 1000);
        }
    }

    listenGameEvents() {
        // y'a peut etre mieux a faire que de faire un listener par event (plus tard)
        this.eventEmitter.on('game.scoreChanged', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })

        

        this.eventEmitter.on('game.overtime', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })

        this.eventEmitter.on('game.possessionChange', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })

        this.eventEmitter.on('game.roundOver', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
            this.roundData[args.winner]++
            if(this.roundData.blue-this.roundData.orange >= 2 || this.roundData.orange-this.roundData.blue >= 2) {
                // start delay before end game
            }
        })
        this.eventEmitter.on('game.roundStart', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })
        this.eventEmitter.on('game.teamChange', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })
        this.eventEmitter.on('game.roundTime', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })
        this.eventEmitter.on('game.scoreBoard', (args, event) => {
            let index = this.config.game.events.findIndex(x => x.event === args.name)
            let gameEvent = this.config.game.events[index]
            this.switchWindowEvent(gameEvent)
        })

        
    }

}

module.exports = EventHandler