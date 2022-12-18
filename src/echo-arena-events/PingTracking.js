class PingTracking {
    constructor() {
        this.name = 'Ping tracking';
        this.bestOf = 3;
    }

    handle(gameData, eventEmitter) {
        if (false === gameData.pingTracking) {
            return;
        }

        if(gameData.bestOf != this.bestOf) {
            this.bestOf = gameData.bestOf;
            eventEmitter.send('update.bestOf', {
                bestOf: gameData.bestOf
            });
        }

        eventEmitter.send('game.ping', {
            timestamp: gameData.timestamp,
            round: gameData.round,
            clock: gameData.clock, 
            settings : {
                settingsFound : gameData.settings !== null,
                bestOf : gameData.bestOf,
                roundWaitTime : gameData.roundWaitTime,
                roundPlayed : gameData.roundPlayed,
                orangeWinRound : gameData.orangeWinRound,
                blueWinRound : gameData.blueWinRound
            },
            pings: {
                blue: gameData.blueTeam.playerPing,
                orange: gameData.orangeTeam.playerPing,
            },
 
            teamName:[gameData.blueTeam.teamName, gameData.orangeTeam.teamName]
        });
    }
}

module.exports = PingTracking;
