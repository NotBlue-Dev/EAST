class GameData {
    constructor(json) {
        this.timestamp = Date.now()
        this.clock = json.game_clock
        this.blueTeamPlayers = json.teams[0].players;
        this.orangeTeamPlayers = json.teams[1].players;
        this.lastscore = json.last_score;
        this.round = json.blue_round_score + json.orange_round_score
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
}

module.exports = GameData