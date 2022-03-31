class Restart {
    constructor() {
        this.name = 'Restart'
        this.Restart = false
    }

    handle(gameData, eventEmitter) {
        // faudra test quand meme
        if (!gameData.blueTeam.blueReset && !gameData.orangeTeam.orangeReset) {
            this.Restart = false
            return
        }

        if (this.Restart === false) {
            this.Restart = true
            eventEmitter.send('game.restart', {name:this.name})
        }
    }
}

module.exports = Restart
