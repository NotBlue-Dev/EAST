const events = require('./EchoArenaEvents.js')
const fetch = require('node-fetch');
const GameData = require("./gameData");

class EchoArena {
    constructor({ip, port}, eventEmitter, vrmlInfo, customData) {
        this.eventEmitter = eventEmitter
        this.ip = ip
        this.port = port
        this.customData = customData
        this.fails = 0
        this.vrmlInfo = vrmlInfo
    }
    
    async listen() {
        return this.testConnection().then(this.request.bind(this)).catch(console.error)
    }
 
    async testConnection() {
        try {
            await fetch(`http://${this.ip}:${this.port}/session`)
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

            // ca fais pas long feux quand on switch de serv fails dépassent 5 en 2s
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
