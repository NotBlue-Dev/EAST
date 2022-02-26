const events = require('./EchoArenaEvents.js')
const fetch = require('node-fetch');
const GameData = require("./gameData");

class EchoArena {
    constructor({ip, port}, eventEmitter) {
        this.ip = ip
        this.port = port
        this.eventEmitter = eventEmitter
        this.fails = 0
    }

    listen() {
        this.testConnection().then(() => {
            this.request()
        })
    }

    async testConnection() {
        fetch(`http://${this.ip}:${this.port}/session`).then(() => {
            this.eventEmitter.send('connected')
            return
        }).catch(error => {
            if (error.response) {
                this.eventEmitter.send('connected')
                return
            } else {
                this.eventEmitter.send('failed')
                throw new Error();
            }
        })
    }

    request() {
        fetch(`http://${this.ip}:${this.port}/session`).then(resp => resp.json()).then(json => {
            const gameData = new GameData(json)

            events.forEach((event) => {
                event.handle(gameData, this.eventEmitter)
            })

            this.request()
        }).catch(error => {
            if (error.response) {
                if (error.response.status === 404) {
                    this.eventEmitter.send('notFound')
                } else {
                    this.eventEmitter.send('requestError', {
                        status: error.response.status
                    })
                }
            } else if (error.request) {
                this.eventEmitter.send('refused')
                this.fails++
            } else {
                this.eventEmitter.send('error', {error});
                this.fails++
            }

            if (this.fails < 5) {
                setTimeout(() => {
                    this.request()
                }, 500);
            } else {
                this.eventEmitter.send('disconnected');
            }
        })
    }
}

module.exports = EchoArena
