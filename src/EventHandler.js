class EventHandler {
    constructor(eventEmitter, obsClient, config) {
        this.obsClient = obsClient
        this.eventEmitter = eventEmitter
        this.listenConfigChange()
        this.listenGameEvents()
        this.initAutoStart()
        this.config = config

    }
    // read config, listen game events, setcurrent scene with timeout, start stream and stop stream
    
    listenConfigChange() {
        this.eventEmitter.on('scenes.changed', (args, event) => {
            this.config = args
        })
        
    }

    // AutoStart
    initAutoStart() {
        
        this.obsClient.on('StreamStarted', (args) => {
            this.obsClient.send('SetCurrentScene',{"scene-name":this.config.start.scene})
        })
    }
    // Start stream

    // End Stream

    // Game stream
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