class ScoreChanged {
    constructor() {
        this.name = 'Score changed'
        this.orangePoints = null
        this.bluePoints = null
        this.customizable = true
    }

    handle(gameData, eventEmitter) {
        if (this.orangePoints === null || this.bluePoints === null) {
            this.bluePoints = gameData.blueTeam.points
            this.orangePoints = gameData.orangeTeam.points
            return
        }
        if (this.orangePoints != gameData.orangeTeam.points || this.bluePoints != gameData.blueTeam.points) {
            this.bluePoints = gameData.blueTeam.points
            this.orangePoints = gameData.orangeTeam.points
            let team;
            let nbData;

            if(gameData.team === 'blue') {
                team = 0
            } else if(gameData.team === 'orange') {
                team = 1
            }

            gameData.teams[team].players.forEach(player => {
                if(player.name === gameData.person_scored) {
                    nbData = player.number
                }
            });

            this.data = {
                speed:Math.ceil(gameData.lastscore.disc_speed),
                dist:Math.ceil(gameData.distance_thrown),
                team:gameData.team,
                ammount:gameData.point_amount,
                scorer:gameData.person_scored,
                assist:gameData.assist_scored,
                nb:nbData
            }

            eventEmitter.send('game.scoreChanged', {blue: this.bluePoints, orange: this.orangePoints, data:this.data, name:this.name, clip:false});
        }
    }
}

module.exports = ScoreChanged
