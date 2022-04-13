class TeamChange {
    constructor() {
        this.name = 'Team change'
        this.blue = []
        this.orange = []
        this.rostersA = []
        this.customizable = true
    }

    handle(gameData, eventEmitter) {
        if (JSON.stringify(gameData.blueTeam.teamData) === JSON.stringify(this.blue) && (JSON.stringify(gameData.orangeTeam.teamData) === JSON.stringify(this.orange))) {
            return 
        }
        
        this.blue = gameData.blueTeam.teamData
        this.orange = gameData.orangeTeam.teamData

        if(this.blue.length === 0 || this.orange.length === 0) {
            eventEmitter.send('game.emptyTeam')
        }

        let teamsColor = gameData.defineColor()
        eventEmitter.send('vrml.colorChanged', teamsColor)

        eventEmitter.send('game.teamChange', {
            teams: {blue: this.blue, orange: this.orange},
            name:this.name
        })
    }
}

module.exports = TeamChange
