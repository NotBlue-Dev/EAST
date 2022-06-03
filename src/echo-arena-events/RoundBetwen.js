class RoundBetwen {
    constructor () {
        this.name = 'Round betwen'
        this.roundIsOver = false
        this.timeout = null
        this.play = false
        this.betwenRound = null
        this.customizable = false
    }

    handle (gameData, eventEmitter) {
        gameData.betwenRound = this.betwenRound
        if (gameData.status !== 'round_over') {
            this.roundIsOver = false
            return
        }

        if(!this.play &&(gameData.status === 'sudden_death') || (gameData.blueTeam.blueReset && gameData.orangeTeam.orangeReset)) {
            this.betwenRound = false
            this.play = true
            clearTimeout(this.timeout)
            eventEmitter.send('game.play')
        }

        if (this.roundIsOver === false) {
            this.roundIsOver = true
            this.play = false
            this.betwenRound = true
            this.timeout = setTimeout(() => {
                this.betwenRound = false
                eventEmitter.send('game.play')
            }, gameData.durBet * 1000)

        }
    }
}

module.exports = RoundBetwen
