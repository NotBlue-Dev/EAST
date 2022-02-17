
const fetch = require('node-fetch');
const GameData = require("./gameData");
const wait = require("./scenes/wait");

class Api {
    constructor(client, ip) {
        this.client = client
        this.ip = ip
        this.scenes = []
    }

    playId() {
        fetch(`http://${this.ip}:6721/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)
            this.playerTeamLength = gameData.playerTeamLength
        }).catch(error => {console.log('error')})
    }

    request() {
        fetch(`http://${this.ip}:6721/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)
            
            if (!gameData.isInMatch() || this.state === false) {
                throw new Error('Not ready');
            }   

            if (this.playerTeamLength !== gameData.playerTeamLength) {
                this.playId()
            }

            this.scenes.forEach((scene) => {
                scene.handle(gameData)
            })

            this.request()
        }).catch(error => {
            if (error.response) {
                if (error.response.status === 404) {
                    console.log('in Menu/Loading or invalid IP')
                } else {
                    console.log(error.response.status)
                }
            } else if (error.request) {
                console.log('Connection refused, game running ?');
            } else {
                console.log('Error', error);
            }

            setTimeout(() => {
                this.playId()
                this.request()
            }, 5000);
        })
    }
}

module.exports = Api