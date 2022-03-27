class ScoreBoard {
    constructor() {
        this.name = 'scoreBoard'
        this.teams = {
            blue:[],
            orange:[]
        }
    }

    handle(gameData, eventEmitter) {
        if (JSON.stringify(gameData.playerStats) === JSON.stringify(this.teams)) {
            return
        }
        this.teams = gameData.playerStats

        eventEmitter.send('game.scoreBoard', {
            blue: this.teams.blue,
            orange: this.teams.orange
        })
    }
}

module.exports = ScoreBoard
