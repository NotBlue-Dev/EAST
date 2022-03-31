class RoundOver {
    constructor () {
        this.name = 'Round over'
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

            this.rounds.push({blue: gameData.blueTeam.points, orange: gameData.orangeTeam.points})
            const winner = (gameData.blueTeam.points == gameData.orangeTeam.points) ? null : (gameData.blueTeam.points > gameData.orangeTeam.points) ? 'blue' : 'orange'

            eventEmitter.send('game.roundOver', {
                rounds: this.rounds,
                name:this.name,
                winner:winner
            })
        }
    }
}

module.exports = RoundOver
