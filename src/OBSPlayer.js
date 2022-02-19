const api = require('./api')
const wait = require('./event/wait')
const fetch = require('node-fetch');
const cheerio = require("cheerio");
const axios = require('axios');

class OBSPlayer {
    constructor(client, OverlayWS, ip, team) {
        this.client = client
        this.overlayWS = OverlayWS
        this.team = team
        this.ip = ip
        this.infoState = false
        this.week0 = 'January 24, 2022'
        this.Allinfo = {
            "teams":[],
            "times":[],
            "week":Math.ceil(Math.abs(Date.now() - new Date(this.week0).getTime()) / 604800000)
        }
        this.getInfo()
        this.obsConnectionState = false
        this.api = new api(this.client,this.ip,this.overlayWS)
        this.initializeListeners()
    }

    initializeListeners() {
        this.overlayWS.listenEvent('get-week', this.getWeek.bind(this))
        this.overlayWS.listenEvent('get-winner', this.getWinner.bind(this))
        this.overlayWS.listenEvent('get-teams-data', this.getTeamsData.bind(this))
    }

    getWinner() {
        fetch(`http://${this.ip}:6721/session`).then(resp => resp.json()).then(json => {
            let blue = json.blue_points;
            let orange = json.orange_points;
            let winner = null

            if(blue>orange) {
                winner = 'blue'
            } else {
                winner = 'orange'
            }

            for(let i = 0; i<this.Allinfo.teams[0].length; i++) {
                if(this.Allinfo.teams[0][i].color === 'blue') {
                    if(winner === 'blue') {
                        this.overlayWS.sendEvent('winner',this.Allinfo.teams[0][i])
                    } 
                } else {
                    if(winner === 'orange') {
                        this.overlayWS.sendEvent('winner',this.Allinfo.teams[0][i])
                    }
                }
            }
        }).catch(error => {console.log(error)})
    }

    getWeek() {
        this.overlayWS.sendEvent('week',this.Allinfo.week)
    }

    getTeamsData() {
        // in case it's called before the elem clear (if elem exist socket io crash)
        this.Allinfo.teams.forEach(element => {
            element.elem = []
        });
        this.overlayWS.sendEvent('teams-data',this.Allinfo.teams)
    }

    launch() {
        this.client
            .onConnected((name) => {
                if(this.obsConnectionState !== true) {
                    this.obsConnectionState = true
                    console.log('Connected')
                    setTimeout(() => {
                        this.startRequest()
                        this.overlayWS.sendEvent('get-teams-data')
                        this.overlayWS.sendEvent('get-week')
                    }, 1000);
                }
            })
            .onDisconnected((message) => {
                this.obsConnectionState = false
                console.log('Disconnected')
                }
            )
        .connect()
    }

    setColor() {
        const getColors = new Promise((resolve,reject) => {
            fetch(`http://${this.ip}:6721/session`).then(resp => resp.json()).then(json => {
                let PlayersBlue = []
                let PlayersOrange = []
                let ARoster = this.Allinfo.teams[0][0].rosters
    
                function getArraysIntersection(a1,a2){
                    return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
                }
    
                try {
                    json.teams[0].players.forEach(player => {
                        PlayersBlue.push(player.name)
                    });
                    json.teams[1].players.forEach(player => {
                        PlayersOrange.push(player.name)
                    });
                } catch {
                    console.log('one team is empty')
                }
    
                let b = getArraysIntersection(ARoster, PlayersBlue)
                let o = getArraysIntersection(ARoster, PlayersOrange)
                if(b.length>o.length) {
                    this.Allinfo.teams[0][0].color = 'blue'
                    this.Allinfo.teams[0][1].color = 'orange'
                } else {
                    this.Allinfo.teams[0][0].color = 'orange'
                    this.Allinfo.teams[0][1].color = 'blue'
                }
                resolve()
            // this.overlayWS.sendEvent('round',json.total_round_count)
            }).catch(error => {console.log(error)})
        });
        return getColors
    }

    async getInfo() {
        // get current matches info
        const url = `https://vrmasterleague.com/EchoArena/Teams/${this.team}`;
        const { data } = await axios.get(url).catch(function (error) {console.log('error', error)})
        const $ = cheerio.load(data);
        // return hours
        const timing = $('.date_scheduled_cell').map((i, div) => $(div).text()).get()
        
        for(let i=0; i<timing.length; i++) {
            let dt = new Date(timing[i]);
            if(!(dt instanceof Date && !isNaN(dt))) {
                this.Allinfo.times.push('TBD');
            } else {
                dt.setHours(dt.getHours()+2);
                this.Allinfo.times.push(dt);
            }
            // current timezone
            // console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
        }
        
        async function getRank(team) {
            let urlTeam = `https://vrmasterleague.com${team}`;
            let { data } = await axios.get(urlTeam).catch(function (error) {console.log('error', error)});
            const $2 = cheerio.load(data);
            let rank = $2('.team-division')[0].attribs.src
            let temp = []
            let rosters = $2('.players_container').find('.player_name').each((i,elem) => {temp.push(elem.children[0].data)})
            return {"rank":rank,"rosters":temp}
        }

        const teams = $('.matches-scheduled')
        let temp = []
        let teamName = teams.find('.team_name')
        let listName = []
        teamName.each((i,elem) => {listName.push(elem)})
        let x = 0
        const getData = new Promise((resolve,reject) => {
            for(let u=0; u<listName.length; u++) {
                temp.push({
                    "name":null,
                    "rank":null,
                    "logo":null,
                    "link":listName[u].parent.attribs.href,
                    "rosters":null,
                    "elem":listName[u],
                    "color":null
                })
                if((u % 2 == 1)) {
                    this.Allinfo.teams.push(temp)
                    temp = []
                }
            }
            
            this.Allinfo.teams.forEach(matches => {
                matches.forEach(teams => {
                    getRank(teams.link).then((value) => {
                        teams.name = teams.elem.children[0].data
                        teams.rank = value.rank
                        teams.logo = teams.elem.prev.attribs.src
                        teams.rosters = value.rosters
                        x++
                    }).finally(() => {
                        if(teamName.length === x) {
                            resolve('done')
                        }
                    })
                });
            });
        })
        
        // keep only the today's match
        getData.then(() => {
            for(let i=0; i<this.Allinfo.times.length; i++) {
                if(this.Allinfo.times[i] !== 'TBD') {
                    this.Allinfo.times = [this.Allinfo.times[i]]
                    this.Allinfo.teams[i].forEach(element => {
                        element.elem = []
                    });
                    this.Allinfo.teams = [this.Allinfo.teams[i]]
                    this.infoState = true
                    this.setColor().then(() => {
                        this.launch()
                        // just for testing :
                        this.Allinfo.times = [new Date(new Date().getTime() + 2*6000)]
                        console.log(this.Allinfo.times)
                        // end
                        return;
                    }).catch(error => {console.log(error)})
                }
            };
        }).catch(error => {console.log(error)})

    }

    startRequest() {
        if (this.obsConnectionState && this.infoState) {
            this.api.state = true;
            this.api.request()
            new wait(this.client, this.Allinfo, this.overlayWS)
        }
    }

}

module.exports = OBSPlayer