class RoundTimeChanged {
    constructor() {
        this.name = 'Round time change (do not use)';
        this.time = null;
        this.customizable = false;
    }

    handle(gameData, eventEmitter) {
        if (gameData.clockDisplay === this.time) {
            return;
        }

        // has RoundTime ?
        eventEmitter.send('game.roundTime', {
            time: gameData.clockDisplay,
            name:this.name
        });
    }
}

module.exports = RoundTimeChanged;
