class PossessionChanged {
    constructor() {
        this.name = 'Possession changed'
        this.possession = {
            team: null,
            player: null,
        }
    }

    handle(gameData, eventEmitter) {
        const possession = gameData.teams.reduce((prev, team) => {
            const player = team.possession ? team.players.reduce((prevPlayer, player) => {
                return player.possession ? player.name : prevPlayer
            }, null) : null

            return null === player ? prev : {
                team: team.team,
                player
            }
            
        }, {
           team: null,
           player: null, 
        })

        if (this.possession.player !== possession.player || this.possession.team !== possession.team) {
            this.possession = possession
            eventEmitter.send('game.possessionChange', {possession:this.possession, name:this.name})
        }
    }
}

module.exports = PossessionChanged
