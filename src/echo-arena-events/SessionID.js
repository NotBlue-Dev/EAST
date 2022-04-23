class sessionID {
    constructor() {
        this.name = 'sessionID'
        this.customizable = false
        this.sessionID = null
    }

    handle(gameData, eventEmitter) {
        // faudra test quand meme
        if (gameData.sessionID === this.sessionID) {
            return
        }

        this.sessionID = gameData.sessionID

        eventEmitter.send('echoArena.sessionID', {name:this.name, sessionID:this.sessionID})
        
    }
}

module.exports = sessionID
