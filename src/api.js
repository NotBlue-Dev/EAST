
const fetch = require('node-fetch');
const GameData = require("./gameData");
const Score = require("./event/score");
const roundTime = require("./event/roundTime");
const Posses = require('./event/possession');
const overlayManager = require('./event/overlayManager');

class Api {
    constructor({ip, port}, obsClient, overlayWs) {
        this.ip = ip
        this.port = port
        this.scenes = [
            new roundTime(overlayWs),
            new Score(overlayWs, obsClient),
            new Posses(overlayWs),
            new overlayManager(overlayWs, obsClient)
        ]
        // emit round time here
    }

    request() {
        fetch(`http://${this.ip}:${this.port}/session`).then(resp => resp.json()).then(json => {
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
                this.request()
            }, 5000);
        })
    }
}

module.exports = Api