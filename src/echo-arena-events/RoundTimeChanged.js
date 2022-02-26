class RoundTimeChanged {
    handle(gameData, eventEmitter) {
        // has RoundTime ?
        eventEmitter.send('roundTime', {
            time: gameData.clock
        })
    }
}

module.exports = RoundTimeChanged