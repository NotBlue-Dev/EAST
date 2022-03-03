class ColorsDefined {
    
    constructor() {
        this.Allinfo.teams[0].rosters
    }

    handle(gameData, eventEmitter) {
        let PlayersBlue = []
        let PlayersOrange = []
        let ARoster = this.Allinfo.teams[0].rosters

        function getArraysIntersection(a1,a2){
            return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
        }
        
        try {
            gameData.blueTeamPlayers.forEach(player => {
                PlayersBlue.push(player.name.toLowerCase())
            });
            gameData.orangeTeamPlayers.forEach(player => {
                PlayersOrange.push(player.name.toLowerCase())
            });
        } catch {
            console.log('one team is empty')
        }
        let b = getArraysIntersection(ARoster, PlayersBlue)
        let o = getArraysIntersection(ARoster, PlayersOrange)

        if(b.length>o.length) {
            this.Allinfo.teams[1].color = 'blue'
            this.Allinfo.teams[0].color = 'orange'
        } else {
            this.Allinfo.teams[0].color = 'orange'
            this.Allinfo.teams[1].color = 'blue'
        }
        resolve()
    }
}

module.exports = ColorsDefined
