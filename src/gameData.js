class GameData {
    constructor(json) {
        this.timestamp = Date.now()
        this.clock = json.game_clock
        const playerName = 'Wow-';
        // const playerName = json.client_name;
        this.NameOfPlayer = playerName;
        this.blueTeamPlayers = json.teams[0].players;
        this.orangeTeamPlayers = json.teams[1].players;

        if (this.blueTeamPlayers === undefined && this.orangeTeamPlayers === undefined) {
            return
        }

        if(this.blueTeamPlayers !== undefined && this.blueTeamPlayers.some(item => item.name === playerName)) {
            this.playerTeamIndex = 0;
            this.playerTeamLength = this.blueTeamPlayers.length;
            this.playerIndex = this.blueTeamPlayers.findIndex((element) => { return (element.name === playerName)})
        } else if(this.orangeTeamPlayers !== undefined && this.orangeTeamPlayers.some(item => item.name === playerName)) {
            this.playerTeamIndex = 1;
            this.playerTeamLength = this.orangeTeamPlayers.length
            this.playerIndex = this.orangeTeamPlayers.findIndex((element) => { return (element.name === playerName)})
        }

        this.orangepoints = json.orange_points;
        this.bluepoints = json.blue_points;
        this.status = json.game_status;
        this.clockDisplay = json.game_clock_display;

        this.playerTeam = json.teams[this.playerTeamIndex]
        this.player = this.playerTeam.players[this.playerIndex]
        this.playerId = this.player.playerid;

        this.enemyTeamPlayers = json.teams[Math.abs(this.playerTeamIndex - 1)].players

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