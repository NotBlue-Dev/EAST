class RoundTimeChanged {
    constructor() {
        this.time = null
    }

    handle(gameData, eventEmitter) {
        if (gameData.clock === this.time) {
            return
        }

        this.time = Math.round(gameData.clock)
        // has RoundTime ?
        eventEmitter.send('game.roundTime', {
            time: (this.time-(this.time%=60))/60+(9<this.time?':':':0')+this.time
        })
    }
}

module.exports = RoundTimeChanged
