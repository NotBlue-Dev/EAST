class sessionID {
    constructor() {
        this.name = 'sessionID';
        this.customizable = false;
        this.sessionID = null;
    }

    handle(gameData, eventEmitter) {
        if (gameData.sessionID === this.sessionID) {
            return;
        }

        this.sessionID = gameData.sessionID;
        eventEmitter.send('echoArena.sessionID', { 
            name:this.name,
            sessionID:this.sessionID,
            blue:gameData.blueTeam.teamData,
            orange:gameData.orangeTeam.teamData, 
        });
    }
}

module.exports = sessionID;
