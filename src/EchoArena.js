const events = require('./EchoArenaEvents.js')
const fetch = require('node-fetch');
const GameData = require("./gameData");

class EchoArena {
    constructor({ip, port}, eventEmitter) {
        this.eventEmitter = eventEmitter
        this.ip = ip
        this.port = port
        this.fails = 0
        this.vrmlInfo = null

        this.eventEmitter.send('echoArena.eventsLoaded', {
            events: events.map(event => event.name).filter(event => event !== undefined)
        })
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
            const gameData = new GameData(json, this.vrmlInfo)
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
                }, 1000);
            } else {
                this.eventEmitter.send('echoArena.disconnected');
            }
        })
    }
}

module.exports = EchoArena
