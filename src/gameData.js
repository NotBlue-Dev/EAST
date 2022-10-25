/* eslint-disable camelcase */
class GameData {
    constructor(json, vrmlInfo, customData, pingTracking = false) {
        this.vrmlInfo = vrmlInfo;
        this.pingTracking = pingTracking;
        this.timestamp = Date.now();
        this.clock = json.game_clock;
        this.teams = json.teams;
        this.durBet = customData.bet;
        this.sessionID = json.sessionid;
        this.roundData = [];
        this.betweenRound = false;
        this.blueTeam = {
            teamName:customData.mixed.blue,
            blueTeamPlayers: [],
            blueReset: (json.blue_team_restart_request > 0),
            teamData:[],
            playerStats:[],
            playerPosition:[],
            playerPing:[],
            points:json.blue_points
        };
        this.blueTeam.blueTeamPlayers = json.teams[0].players;
        this.orangeTeam = {
            teamName:customData.mixed.orange,
            orangeTeamPlayers :[],
            orangeReset :(json.orange_team_restart_request > 0),
            teamData:[],
            playerStats:[],
            playerPosition:[],
            playerPing:[],
            points:json.orange_points
        };
        this.scoreData = {
            blue:this.blueTeam.points, 
            orange:this.orangeTeam.points
        };
        this.orangeTeam.orangeTeamPlayers = json.teams[1].players;
        this.discPosition = [json.disc.position[0], json.disc.position[2]];
        
        this.lastscore = json.last_score;
        this.point_amount = this.lastscore.point_amount;
        this.person_scored = this.lastscore.person_scored;
        this.assist_scored = this.lastscore.assist_scored;
        this.team = this.lastscore.team;
        
        
        this.distance_thrown = this.lastscore.distance_thrown;
        this.round = json.blue_round_score + json.orange_round_score + 1;
        this.totalRound = json.total_round_count;

        if (this.blueTeam.blueTeamPlayers === undefined && this.orangeTeam.orangeTeamPlayers === undefined) {
            return;
        }

        if(this.blueTeam.blueTeamPlayers.length !== 0 && this.blueTeam.blueTeamPlayers !== undefined) {
            for (let player of this.blueTeam.blueTeamPlayers) {
                
                // eslint-disable-next-line camelcase
                player.stats.possession_time = Math.round(player.stats.possession_time);
                this.blueTeam.playerStats.push({
                    name:player.name, 
                    stats:player.stats, 
                    stunned:player.stunned
                });
                this.blueTeam.teamData.push(player.name);
                this.blueTeam.playerPosition.push({
                    name:player.name, 
                    position:[player.head.position[0],player.head.position[2]], 
                    nb:player.number
                });
                this.blueTeam.playerPing.push({
                    name: player.name, 
                    ping: player.ping, 
                    handL: player.holding_left, 
                    handR: player.holding_right
                });
            }
        }
 
        if(this.orangeTeam.orangeTeamPlayers !== 0 && this.orangeTeam.orangeTeamPlayers !== undefined) {
            for (let player of this.orangeTeam.orangeTeamPlayers) {
                
                // eslint-disable-next-line camelcase
                player.stats.possession_time = Math.round(player.stats.possession_time);
                this.orangeTeam.playerStats.push({
                    name:player.name, 
                    stats:player.stats, 
                    stunned:player.stunned
                });
                this.orangeTeam.teamData.push(player.name);
                this.orangeTeam.playerPosition.push({
                    name:player.name, 
                    position:[player.head.position[0],player.head.position[2]], 
                    nb:player.number
                });
                this.orangeTeam.playerPing.push({
                    name: player.name, 
                    ping: player.ping,
                    handL: player.holding_left, 
                    handR: player.holding_right
                });
            }
        }

        this.status = json.game_status;
        this.clockDisplay = json.game_clock_display;
        this.matchType = json.match_type;
    }

    isInMatch() {
        return this.matchType === 'Echo_Arena' || this.matchType === 'Echo_Arena_Private';
    }

    isPlaying() {
        return this.status === 'playing';
    }

    getArraysIntersection(a1,a2) {
        return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
    }

    defineColor() {
        // when round start check wich VRML team is orange/blue
        if(this.vrmlInfo !== null) {
            let PlayersBlue = [];
            let PlayersOrange = [];
            let ARoster = this.vrmlInfo.teams.home.rosters;
            
            try {
                this.blueTeam.blueTeamPlayers.forEach(player => {
                    PlayersBlue.push(player.name.toLowerCase());
                });
                this.orangeTeam.orangeTeamPlayers.forEach(player => {
                    PlayersOrange.push(player.name.toLowerCase());
                });
            } catch {
                console.log('one team is empty');
            }
            
            let b = this.getArraysIntersection(ARoster, PlayersBlue);
            let o = this.getArraysIntersection(ARoster, PlayersOrange);
            
            this.vrmlInfo.teams.home.color = (b.length > o.length) ? 'orange' : 'blue';
            this.vrmlInfo.teams.away.color = (b.length > o.length) ? 'blue' : 'orange';

            return this.vrmlInfo;
        }
    }
}

module.exports = GameData;
