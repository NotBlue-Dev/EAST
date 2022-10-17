class RoundOver {
    constructor () {
        this.name = 'Round over';
        this.roundIsOver = false;
        this.rounds = [];
        this.customizable = true;
    }

    handle (gameData, eventEmitter) {
        gameData.roundData = this.rounds;
        if (gameData.status !== 'round_over') {
            this.roundIsOver = false;
            return;
        }

        if (this.roundIsOver === false) {
            this.roundIsOver = true;

            const winner = (gameData.blueTeam.points == gameData.orangeTeam.points) ? null : (gameData.blueTeam.points > gameData.orangeTeam.points) ? 'blue' : 'orange';
            this.rounds.push({ 
                blue: gameData.blueTeam.points,
                orange: gameData.orangeTeam.points,
                currentRound: gameData.round - 1,
                winner:winner,
            });
            
            eventEmitter.send('game.roundOver', {
                rounds: this.rounds,
                name:this.name,
                winner:winner
            });
        }
    }
}

module.exports = RoundOver;
