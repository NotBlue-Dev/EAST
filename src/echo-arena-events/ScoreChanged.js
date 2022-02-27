class ScoreChanged {
    constructor() {
        this.orangePoints = null
        this.bluePoints = null
    }

    handle(gameData, eventEmitter) {
        if (this.orangePoints === null || this.bluePoints === null) {
            this.bluePoints = gameData.bluepoints
            this.orangePoints = gameData.orangepoints
            return
        }
        if (this.orangePoints != gameData.orangepoints || this.bluePoints != gameData.bluepoints) {
            this.bluePoints = gameData.bluepoints
            this.orangePoints = gameData.orangepoints

            eventEmitter.send('game.scoreChanged', {blue: this.bluePoints, orange: this.orangePoints});
        }
    }
}

module.exports = ScoreChanged
