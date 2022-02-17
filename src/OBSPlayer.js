const api = require('./api')
const wait = require('./scenes/wait')
const cheerio = require("cheerio");
const axios = require('axios');

class OBSPlayer {
    constructor(client, sendEvent, listenEvent, ip, team) {
        this.client = client
        this.team = team
        this.sendEvent = sendEvent
        this.listenEvent = listenEvent
        this.getInfo()
        this.obsConnectionState = false
        this.api = new api(client,ip)
    }

    launch() {
        this.client
            .onConnected((name) => {
                if(this.obsConnectionState !== true) {
                    this.obsConnectionState = true
                    this.startRequest()
                    console.log('Connected')
                }
            })
            .onDisconnected((message) => {
                this.obsConnectionState = false
                console.log('Disconnected')
                }
            )
        .connect()
    }

    async getInfo() {
        // fetch info from vrml website
        const url = `https://vrmasterleague.com/EchoArena/Teams/${this.team}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        // return hours
        const timing = $('.date_scheduled_cell').map((i, div) => $(div).text()).get()
        
        let info = {
            "teams":[],
            "hours":[],
            "day":[],
            "week":null
        }

        for(let i=0; i<timing.length; i++) {
            info.hours.push(timing[i].slice(timing[i].length - 5))
            info.day.push(timing[i].slice(0,-6))
        }
        
        async function getRank(team) {
            let urlTeam = `https://vrmasterleague.com${team}`;
            let { data } = await axios.get(urlTeam);
            const $2 = cheerio.load(data);
            let rank = $2('.team-division')[0].attribs.src
            return rank
        }

        const teams = $('.matches-scheduled')
        let temp = []
        teams.find('.team_name').each((i,elem) => {
            temp.push({
                "name":elem.children[0].data,
                "rank":getRank(elem.parent.attribs.href),
                "logo":elem.prev.attribs.src,
                "link":elem.parent.attribs.href
            })
            if(temp.length >=2) {
                info.teams.push(temp)
                temp = []
            }
        })
    }

    startRequest() {
        if (this.obsConnectionState) {
            this.api.state = true;
            this.api.request()
            new wait(this.client)
        }
    }

}

module.exports = OBSPlayer