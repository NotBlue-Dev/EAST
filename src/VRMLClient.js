const fetch = require('node-fetch');

class VRMLClient {
    constructor () {
        this.baseUrl = 'https://api.vrmasterleague.com';
    }

    async getSeason() {
        const data = await fetch(`${this.baseUrl}/EchoArena/Seasons`);
        const json = await data.json();
        let season = json.find(x => x.isCurrent === true).seasonName;
        return season.match(/\d+/)[0];
    }

    getTeamPlace(teamId) {
        return fetch(`${this.baseUrl}/Teams/${teamId}`).then(resp => resp.json());
    }

    async getTeams(region = 'eu', rank = 0) {
        if(region == 'na') {
            // eslint-disable-next-line no-promise-executor-return
            await new Promise(r => setTimeout(r, 280));
        }

        try {
            const resp = await fetch(`${this.baseUrl}/EchoArena/Standings/?region=${region}&rank=${rank}`);
            const json = await resp.json();
            if (!json.teams) {
                return [];
            }

            if (json.teams.length !== json.nbPerPage) {
                return json.teams;
            }
            
            const next = await this.getTeams(region, rank + json.nbPerPage);
            
            return [...json.teams, ...next];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    getTeamUpcomingMatches(teamId) {
        return fetch(`${this.baseUrl}/Teams/${teamId}/Matches/Upcoming`).then(resp => resp.json());
    }

    getTeam(teamId) {
        return fetch(`${this.baseUrl}/Teams/${teamId}`).then(resp => resp.json());
    }
}

module.exports = VRMLClient;
