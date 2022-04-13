class RoundTimeChanged {
    constructor() {
        this.name = 'Round time change (do not use)'
        this.time = null
        this.customizable = false
    }

    handle(gameData, eventEmitter) {
        if (gameData.clockDisplay === this.time) {
            return
        }

        this.time = gameData.clockDisplay.replace(/\.[^.]*$/g, "")
        // has RoundTime ?
        eventEmitter.send('game.roundTime', {
            time: this.time,
            name:this.name
        })
    }
}

module.exports = RoundTimeChanged
