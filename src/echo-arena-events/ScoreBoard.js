class ScoreBoard {
    constructor() {
        this.name = 'scoreBoard (do not use)'
        this.blue = []
        this.orange = []
        this.customizable = false
        this.lastHalf = null
        this.orangeStats = [{data:null, name:null, type:"Stuns"}, {data:null, name:null, type:"Saves"}, {data:null, name:null, type:"Goals"}]
        this.blueStats = [{data:null, name:null, type:"Stuns"}, {data:null, name:null, type:"Saves"}, {data:null, name:null, type:"Goals"}]
    }

    handle(gameData, eventEmitter) {
        if (JSON.stringify(gameData.blueTeam.playerStats) === JSON.stringify(this.blue) && (JSON.stringify(gameData.orangeTeam.playerStats) === JSON.stringify(this.orange))) {
            return 
        }

        this.blue = gameData.blueTeam.playerStats
        this.orange = gameData.orangeTeam.playerStats

        const send = (orange, blue) => {
            eventEmitter.send('local.halfTimeStats', {
                blue:blue,
                orange:orange
            })
            console.log(orange,blue)
            this.lastHalf = Date.now()
        }

        const fill = (color, player) => {
            let stuns = color.findIndex(x => x.type === "Stuns")
            let saves = color.findIndex(x => x.type === "Saves")
            let goals = color.findIndex(x => x.type === "Goals")

            if(color[stuns].data < player.stats.stuns) {
                color[stuns].data = player.stats.stuns
                color[stuns].name = player.name
            }
            if(color[saves].data < player.stats.saves) {
                color[saves].data = player.stats.saves
                color[saves].name = player.name
            }
            if(color[goals].data < player.stats.goals) {
                color[goals].data = player.stats.goals
                color[goals].name = player.name
            }

            if(player.stats.stuns > 2) {
                send(this.orangeStats[stuns], this.blueStats[stuns])
            }
            if(player.stats.saves > 1) { 
                send(this.orangeStats[saves], this.blueStats[saves])
            }
            if(player.stats.goals > 1) { 
                send(this.orangeStats[goals], this.blueStats[goals])
            }
        }

        // pause for 2m
        console.log(Math.floor(((Math.abs(this.lastHalf - Date.now()))/1000)/60), this.lastHalf)
        if(this.lastHalf === null || Math.floor(((Math.abs(this.lastHalf - Date.now()))/1000)/60) >= 1) {
            this.orange.forEach(player => {
                fill(this.orangeStats, player)
            });
    
            this.blue.forEach(player => {
                fill(this.blueStats, player)
            });
        }

        eventEmitter.send('game.scoreBoard', {
            blue: this.blue,
            orange: this.orange,
            name:this.name
        })
    }
}

module.exports = ScoreBoard
