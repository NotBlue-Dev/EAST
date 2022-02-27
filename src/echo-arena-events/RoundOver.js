class RoundOver {
    constructor () {
        this.roundIsOver = false
        this.rounds = []
    }

    handle (gameData, eventEmitter) {
        if (gameData.status !== 'round_over') {
            this.roundIsOver = false
            return
        }

        if (this.roundIsOver === false) {
            this.roundIsOver = true

            this.rounds.push({blue: gameData.bluepoints, orange: gameData.orangepoints})
            const winner = (gameData.bluepoints == gameData.orangepoints) ? null : (gameData.bluepoints > gameData.orangepoints) ? 'blue' : 'orange'

            eventEmitter.send('roundOver', {
                rounds: this.rounds,
                winner
            })
        }
    }
}

module.exports = RoundOver
