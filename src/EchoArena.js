const events = require('./EchoArenaEvents.js')
const fetch = require('node-fetch');
const GameData = require("./gameData");
const axios = require('axios');
class EchoArena {
    constructor({ip, port}, eventEmitter, vrmlInfo, customData) {
        this.eventEmitter = eventEmitter
        this.ip = ip
        this.port = port
        this.customData = customData
        this.fails = 0
        this.rounds = []
        this.scoreData = []
        this.vrmlInfo = vrmlInfo
    }
    
    async listen() {
        return this.testConnection().then(this.request.bind(this)).catch(console.error)
    }

    async requestEchoVR(url, data) {
        let res = await axios.post(`http://127.0.0.1:${this.port}/${url}`, data).catch(function (error) {
            console.log(error.toJSON());
        });
    }

    setSettingsEchoVR(settings) {
        fetch(`http://127.0.0.1:${this.port}/session`).then(resp => resp.json()).then(json => {
            this.requestEchoVR("ui_visibility", {enabled: !settings.ui})
            this.requestEchoVR("minimap_visibility", {enabled: !settings.map})
            this.requestEchoVR("team_muted", {blue_team_muted: settings.mute, orange_team_muted: settings.mute})
            this.requestEchoVR("nameplates_visibility", {enabled: !settings.plate})
            this.requestEchoVR("camera_mode", {mode: settings.camera, num: 0})
        }).catch(error => {
            setTimeout(() => {
                this.setSettingsEchoVR()
            }, 1500);
        })
    }

    async testConnection() {
        try {
            let data = await fetch(`http://${this.ip}:${this.port}/session`)
            this.eventEmitter.send('echoArena.connected')
            return true
        } catch(error) {
            if (error.response) {
                this.eventEmitter.send('echoArena.connected', {error})
                return true
            } else {
                this.eventEmitter.send('echoArena.failed', {error})
                throw new Error();
            }
        }
    }

    async request() {
        fetch(`http://${this.ip}:${this.port}/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json, this.vrmlInfo, true, this.customData)
            events.forEach((event) => {
                event.handle(gameData, this.eventEmitter)
            })
            this.rounds = gameData.roundData
            this.scoreData = gameData.scoreData
            this.request()
        }).catch(error => {
            if (error.response) {
                if (error.response.status === 404) {
                    this.eventEmitter.send('echoArena.notFound')
                } else {
                    this.eventEmitter.send('echoArena.requestError', {
                        status: error.response.status
                    })
                }
            } else if (error.request) {
                this.eventEmitter.send('echoArena.refused')
                this.fails++
            } else {
                this.eventEmitter.send('echoArena.error', {error});
                this.fails++
            }
            if (this.fails < 5) {
                setTimeout(() => {
                    this.request()
                }, 500);
            } else {
                this.eventEmitter.send('echoArena.disconnected');
                setTimeout(() => {
                    this.request()
                }, 2000);
            }
        })
    }
}

module.exports = EchoArena
