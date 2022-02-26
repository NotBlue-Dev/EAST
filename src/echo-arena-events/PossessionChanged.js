class PossessionChanged {
    constructor() {
        this.playerName = ''
        this.team = ''
    }

    handle(gameData, eventEmitter) {
        gameData.teams.forEach(team => {
            try {
                team.players.forEach(player => {
                    if(player.possession && player.possession !== this.playerName) {
                        this.playerName = player.name
                        this.team = team
                        
                        eventEmitter.send('possessionChange', {
                            player: this.playerName,
                            team: this.team
                        })
                    }
                });
            } catch {
            }
        });
    }
}

module.exports = PossessionChanged
