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
        this.Allinfo = {
            "teams":[],
            "times":[],
            "week":null
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
                let ARoster = this.Allinfo.teams[0].rosters
    
                function getArraysIntersection(a1,a2){
                    return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
                }
                
                try {
                    json.teams[0].players.forEach(player => {
                        PlayersBlue.push(player.name.toLowerCase())
                    });
                    json.teams[1].players.forEach(player => {
                        PlayersOrange.push(player.name.toLowerCase())
                    });
                } catch {
                    console.log('one team is empty')
                }
                let b = getArraysIntersection(ARoster, PlayersBlue)
                let o = getArraysIntersection(ARoster, PlayersOrange)

                if(b.length>o.length) {
                    this.Allinfo.teams[1].color = 'blue'
                    this.Allinfo.teams[0].color = 'orange'
                } else {
                    this.Allinfo.teams[0].color = 'orange'
                    this.Allinfo.teams[1].color = 'blue'
                }
                resolve()
            // this.overlayWS.sendEvent('round',json.total_round_count)
            }).catch(error => {console.log(error)})
        });
        return getColors
    }

    async getInfo() {
        // get current matches info
        const getData = new Promise((resolve,reject) => {
            fetch(`https://api.vrmasterleague.com/Teams/${this.team}/Matches/Upcoming`).then(resp => resp.json()).then(json => {
                try {this.Allinfo.week = json[0].week} catch {}
                json.forEach(element => {
                    let dt = new Date(element.dateScheduledUTC)
                    if(dt.getTime() == new Date("2022-02-14 13:00").getTime()) {
                        this.Allinfo.times.push('TBD');
                    } else {
                        dt.setHours(dt.getHours()+2);
                        this.Allinfo.times.push(dt);
                    }
                });
    
                for(let i = 0; i<this.Allinfo.times.length; i++) {
                    if(this.Allinfo.times[i] !== 'TBD') {
                        this.Allinfo.teams.push({
                            "name":json[i].homeTeam.teamName,
                            "rank":json[i].homeTeam.divisionLogo,
                            "logo":json[i].homeTeam.teamLogo,
                            "link":json[i].homeTeam.teamID,
                            "rosters":[],
                            "color":null
                        })
    
                        this.Allinfo.teams.push({
                            "name":json[i].awayTeam.teamName,
                            "rank":json[i].awayTeam.divisionLogo,
                            "logo":json[i].awayTeam.teamLogo,
                            "link":json[i].awayTeam.teamID,
                            "rosters":[],
                            "color":null
                        })
                        resolve('done')
                        return;
                    }
                }
            })
        })

        getData.then(() => {
            // get rosters
            let u = 0
            const getPlayers = new Promise((resolve,reject) => {
                this.Allinfo.teams.forEach(element => {
                    fetch(`https://api.vrmasterleague.com/Teams/${element.link}`).then(resp => resp.json()).then(json => {
                        json.team.players.forEach(player => {
                            element.rosters.push(player.playerName.toLowerCase())
                        });
                        u++
                        if(u >= 2) resolve('done')
                    })
                });
            });
            getPlayers.then(() => {
                this.setColor().then(() => {
                    this.launch()
                    // just for testing :
                    this.Allinfo.times = [new Date(new Date().getTime() + 2*6000)]
                    console.log(this.Allinfo.times)
                    // end
                    return;
                }).catch(error => {console.log(error)})
            }).catch(error => {console.log(error)})
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