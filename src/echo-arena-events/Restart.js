class Restart {
    constructor() {
        this.name = 'Restart'
        this.Restart = false
        this.customizable = true
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
