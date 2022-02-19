class Posses {
    constructor(ws) {
        this.ws = ws
    }

    handle(gameData) {
        gameData.teams.forEach(team => {
            try {
                team.players.forEach(player => {
                    if(player.possession) {
                        this.ws.sendEvent('posses-change',player.name)
                    }
                });
            } catch {
                
            }
        });
    }
}

module.exports = Posses