class Overtime {
    constructor() {
        this.isOvertime = false
    }

    handle(gameData, eventEmitter) {
        if (gameData.status !== 'sudden_death') {
            this.isOvertime = false
            return
        }

        if (this.isOvertime === false) {
            this.isOvertime = true

            eventEmitter.send('overtime')
        }
    }
}

module.exports = Overtime
