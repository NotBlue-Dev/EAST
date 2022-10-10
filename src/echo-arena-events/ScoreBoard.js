class ScoreBoard {
    constructor() {
        this.name = 'scoreBoard (do not use)'
        this.blue = []
        this.orange = []
        this.customizable = false
        this.lastHalf = null
    }

    handle(gameData, eventEmitter) {
        if (JSON.stringify(gameData.blueTeam.playerStats) === JSON.stringify(this.blue) && (JSON.stringify(gameData.orangeTeam.playerStats) === JSON.stringify(this.orange))) {
            return 
        }

        let orangeStats = [{ data:null,
            name:null,
            type:"Stuns" }, { data:null,
            name:null,
            type:"Saves" }, { data:null,
            name:null,
            type:"Goals" }
        ]

        let blueStats = [{ data:null,
            name:null,
            type:"Stuns" }, { data:null,
            name:null,
            type:"Saves" }, { data:null,
            name:null,
            type:"Goals" }
        ]

        this.blue = gameData.blueTeam.playerStats
        this.orange = gameData.orangeTeam.playerStats
        
        const send = (orange, blue) => {
            if(this.lastHalf === null || Math.floor(((Math.abs(this.lastHalf - Date.now())) / 1000) / 60) >= 1) {
                eventEmitter.send('local.halfTimeStats', {
                    blue:blue,
                    orange:orange
                })
            }
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

            if(player.stats.stuns >= 45) {
                send(orangeStats[stuns], blueStats[stuns])
            }
            if(player.stats.saves >= 5) { 
                send(orangeStats[saves], blueStats[saves])
            }
            if(player.stats.goals >= 5) { 
                send(orangeStats[goals], blueStats[goals])
            }
        }

        if(this.lastHalf === null || Math.floor(((Math.abs(this.lastHalf - Date.now())) / 1000) / 60) >= 1) {
            this.orange.forEach(player => {
                fill(orangeStats, player)
            });
    
            this.blue.forEach(player => {
                fill(blueStats, player)
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
