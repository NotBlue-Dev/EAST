class ChainEventEmitter {
    constructor() {
        this.emitters = []
    }

    add(eventEmitter) {
        this.emitters.push(eventEmitter)
    }

    on(channel, callback) {
        this.emitters.map((eventEmitter) => {
            eventEmitter.on(channel, callback)
        })
    }

    send(channel, args) {
        this.emitters.map((eventEmitter) => {
            eventEmitter.send(channel, args)
        })
    }
}

module.exports = ChainEventEmitter
