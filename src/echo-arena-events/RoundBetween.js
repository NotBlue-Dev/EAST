class RoundBetween {
    constructor () {
        this.name = 'Round between'
        this.roundIsOver = false
        this.timeout = null
        this.play = false
        this.betweenRound = null
        this.customizable = false
    }

    handle (gameData, eventEmitter) {
        gameData.betweenRound = this.betweenRound
        if (gameData.status !== 'round_over') {
            this.roundIsOver = false
            return
        }

        if(!this.play &&(gameData.status === 'sudden_death') || (gameData.blueTeam.blueReset && gameData.orangeTeam.orangeReset)) {
            this.betweenRound = false
            this.play = true
            clearTimeout(this.timeout)
            eventEmitter.send('game.play')
        }

        if (this.roundIsOver === false) {
            this.roundIsOver = true
            this.play = false
            this.betweenRound = true
            this.timeout = setTimeout(() => {
                this.betweenRound = false
                eventEmitter.send('game.play')
            }, gameData.durBet * 1000)

        }
    }
}

module.exports = RoundBetween
