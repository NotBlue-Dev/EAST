class RoundTimeChanged {
    constructor() {
        this.time = null
    }

    handle(gameData, eventEmitter) {
        if (gameData.clock === this.time) {
            return
        }

        this.time = gameData.clock
        // has RoundTime ?
        eventEmitter.send('game.roundTime', {
            time: gameData.clock
        })
    }
}

module.exports = RoundTimeChanged
