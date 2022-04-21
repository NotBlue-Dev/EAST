class PingTracking {
    constructor() {
        this.name = 'Ping tracking';
    }

    handle(gameData, eventEmitter) {
        if (false === gameData.pingTracking) {
            return;
        }

        eventEmitter.send('game.ping', {
            timestamp: gameData.timestamp,
            round: gameData.round,
            clock: gameData.clock, 
            pings: {
                blue: gameData.blueTeam.playerPing,
                orange: gameData.orangeTeam.playerPing,
            },
            teamName:[gameData.blueTeam.teamName, gameData.orangeTeam.teamName]
        })
    }
}

module.exports = PingTracking
