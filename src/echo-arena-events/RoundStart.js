class RoundStart {
    constructor() {
        this.roundStarted = false
        this.lastRound = 0
    }

    handle(gameData, eventEmitter) {
        const status = gameData.status

        if (status === 'pre_match' || status === 'round_over') {
            this.roundStarted = false
            return
        }

        if (this.roundStarted) {
            return
        }

        if (status === 'round_start' && (gameData.round != this.lastRound || gameData.round == 0)) {
            this.roundStarted = true
            this.lastRound = gameData.round
            eventEmitter('roundStart', {
                round: gameData.round
            })
        }
    }
}
