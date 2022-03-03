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

            this.data = {
                speed:Math.ceil(gameData.lastscore.disc_speed),
                dist:Math.ceil(gameData.distance_thrown),
                team:gameData.team,
                ammount:gameData.point_amount,
                scorer:gameData.person_scored,
                assist:gameData.assist_scored
            }

            eventEmitter.send('game.scoreChanged', {blue: this.bluePoints, orange: this.orangePoints, data:this.data});
        }
    }
}

module.exports = ScoreChanged
