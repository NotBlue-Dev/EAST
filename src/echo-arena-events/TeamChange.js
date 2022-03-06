class TeamChange {
    constructor() {
        this.name = 'Team change'
        this.teams = {
            blue:[],
            orange:[]
        }
        this.rostersA = []
    }

    handle(gameData, eventEmitter) {
        if (JSON.stringify(gameData.teamData) === JSON.stringify(this.teams)) {
            return
        }
        
        this.teams = gameData.teamData

        let teamsColor = gameData.defineColor()
        eventEmitter.send('vrml.colorChanged', teamsColor)

        eventEmitter.send('game.teamChange', {
            teams: gameData.teamData
        })
    }
}

module.exports = TeamChange
