const fetch = require('node-fetch');

class VRMLClient {
    constructor () {
        this.baseUrl = 'https://api.vrmasterleague.com'
    }

    async getSeason() {
        const data = await fetch(`${this.baseUrl}/EchoArena/Seasons`)
        const json = await data.json()
        let season = json.find(x => x.isCurrent === true).seasonName;
        return season.match(/\d+/)[0]
    }

    async getTeamPlace(teamId) {
        return await fetch(`${this.baseUrl}/Teams/${teamId}`).then(resp => resp.json())
    }

    async getTeams(region = 'eu', rank = 0) {
        try {
            const resp = await fetchWithTimeout(`${this.baseUrl}/EchoArena/Standings/?region=${region}&rank=${rank}`, {
                timeout: 8000
            })
            const json = await resp.json()
            if (!json.teams) {
                return []
            }

            if (json.teams.length !== json.nbPerPage) {
                return json.teams
            }

            const next = await this.getTeams(region, rank + json.nbPerPage)
            
            return [...json.teams, ...next]
        } catch (err) {
            console.error(err)
            return [];
        }
    }

    async getTeamUpcomingMatches(teamId) {
        return await fetch(`${this.baseUrl}/Teams/${teamId}/Matches/Upcoming`).then(resp => resp.json())
    }

    async getTeam(teamId) {
        return await fetch(`${this.baseUrl}/Teams/${teamId}`).then(resp => resp.json())
    }
}

module.exports = VRMLClient
