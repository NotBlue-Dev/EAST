class GameData {
    constructor(json, vrmlInfo) {
        this.vrmlInfo = vrmlInfo
        this.timestamp = Date.now()
        this.clock = json.game_clock
        this.blueTeamPlayers = json.teams[0].players;
        this.orangeTeamPlayers = json.teams[1].players;
        this.lastscore = json.last_score;
        this.point_amount = this.lastscore.point_amount
        this.person_scored = this.lastscore.person_scored
        this.assist_scored = this.lastscore.assist_scored
        this.team = this.lastscore.team
        this.distance_thrown = this.lastscore.distance_thrown
        this.round = json.blue_round_score + json.orange_round_score
        this.teamData = {
            blue:[],
            orange:[]
        }
        for (let player of this.blueTeamPlayers) {
            this.teamData.blue.push(player.name)
        }
        for (let player of this.orangeTeamPlayers) {
            this.teamData.orange.push(player.name)
        }
        this.teams = json.teams
        if (this.blueTeamPlayers === undefined && this.orangeTeamPlayers === undefined) {
            return
        }

        this.orangepoints = json.orange_points;
        this.bluepoints = json.blue_points;
        this.status = json.game_status;
        this.clockDisplay = json.game_clock_display;

        this.matchType = json.match_type
    }

    isInMatch() {
        return this.matchType === 'Echo_Arena' || this.matchType === 'Echo_Arena_Private'
    }

    isPlaying() {
        return this.status === 'playing'
    }

    defineColor() {
        // when round start check wich VRML team is orange/blue
        if(this.vrmlInfo !== null) {
            let PlayersBlue = []
            let PlayersOrange = []
            let ARoster = this.vrmlInfo.teams.home.rosters

            function getArraysIntersection(a1,a2){
                return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
            }
            
            try {
                this.blueTeamPlayers.forEach(player => {
                    PlayersBlue.push(player.name.toLowerCase())
                });
                this.orangeTeamPlayers.forEach(player => {
                    PlayersOrange.push(player.name.toLowerCase())
                });
            } catch {
                console.log('one team is empty')
            }
            
            let b = getArraysIntersection(ARoster, PlayersBlue)
            let o = getArraysIntersection(ARoster, PlayersOrange)
            
            let teamA;
            let teamB;
            
            if(b.length>o.length) {
                teamB = 'blue'
                teamA = 'orange'
            } else {
                teamA = 'orange'
                teamB = 'blue'
            }

            this.vrmlInfo.teams.home.color = teamA
            this.vrmlInfo.teams.away.color = teamB

            return this.vrmlInfo
        }
    }
}

module.exports = GameData