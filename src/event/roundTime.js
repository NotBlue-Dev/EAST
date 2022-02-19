
class wait {
    constructor(ws) {
        this.ws = ws
    }

    handle(gameData) {
        this.ws.sendEvent('round-time',gameData.clock)
    }
}

module.exports = wait