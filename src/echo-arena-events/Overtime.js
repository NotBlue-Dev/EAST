class Overtime {
    constructor() {
        this.name = 'Overtime'
        this.isOvertime = false
        this.customizable = true
    }

    handle(gameData, eventEmitter) {
        if (gameData.status !== 'sudden_death') {
            this.isOvertime = false
            return
        }

        if (this.isOvertime === false) {
            this.isOvertime = true
            eventEmitter.send('game.overtime', {name:this.name})
        }
    }
}

module.exports = Overtime
