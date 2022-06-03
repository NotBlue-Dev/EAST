const { Console } = require("console");
const fs = require("fs");

const myLogger = new Console({
  stdout: fs.createWriteStream("eventLogs.txt", {flags:'a'}),
});

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
            myLogger.log(`channel : ${channel} ${args !== undefined ? JSON.stringify(args) : ""}`)
        })
    }
}

module.exports = ChainEventEmitter
