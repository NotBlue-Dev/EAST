const fetch = require('node-fetch');

class VRMLClient {
    constructor () {
        this.baseUrl = 'https://api.vrmasterleague.com'
    }

    async getTeamUpcomingMatches(teamId) {
        return await fetch(`${this.baseUrl}/Teams/${teamId}/Matches/Upcoming`).then(resp => resp.json())
    }

    async getTeam(teamId) {
        return await fetch(`${this.baseUrl}/Teams/${teamId}`).then(resp => resp.json())
    }
}

module.exports = VRMLClient
