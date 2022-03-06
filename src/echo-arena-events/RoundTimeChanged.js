class RoundTimeChanged {
    constructor() {
        this.time = null
    }

    handle(gameData, eventEmitter) {
        if (gameData.clockDisplay === this.time) {
            return
        }

        this.time = gameData.clockDisplay.replace(/\.[^.]*$/g, "")
        // has RoundTime ?
        eventEmitter.send('game.roundTime', {
            time: this.time
        })
    }
}

module.exports = RoundTimeChanged
