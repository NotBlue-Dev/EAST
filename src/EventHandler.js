class EventHandler {
    
    constructor(eventEmitter, obsClient, config) {
        this.obsClient = obsClient
        this.eventEmitter = eventEmitter
        this.config = config
        this.timer = null
        this.autoStream = null
        this.vrml = false
        this.left = 0
        this.listenGameEvents()
        this.initListener()
    }
    
    // Event handler (setcurrent scene with timeout, stop stream)

    initListener() {
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
                // convert args.time (date) to local time date
                let localTime = new Date(args.time.getTime() + date.getTimezoneOffset() * 60000)
                let incoming = localTime.getHours() + ':' + localTime.getMinutes()
                // start 10m before for the wait page
                let currentTime = date.getHours() + ':' + date.getMinutes() - 10
                let timeLeft = incoming - currentTime
                // convert minutes to milisecondes
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

    listenGameEvents() {
        this.eventEmitter.on('game.scoreChanged', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.overtime', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.possessionChange', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.roundOver', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.roundStart', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.teamChange', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.roundTime', (args, event) => {
            console.log(args)
        })
        this.eventEmitter.on('game.scoreBoard', (args, event) => {
            console.log(args)
        })

        
    }

}

module.exports = EventHandler