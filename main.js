const libOBS = require('./index')
const events = require('events');
const eventEmitter = new events.EventEmitter();

const sendEvent = (channel, args) => {
    eventEmitter.emit(channel, args);
}

const listenEvent = (channel, callable) => {
    eventEmitter.on(channel, callable);
}

// to do config loader

const lib = 
    new libOBS.OBSPlayer(
    new libOBS.OBSClient(),
    sendEvent,
    listenEvent,
    '127.0.0.1',
    '5lf15zfVzKoa28JcTu9V3A2'
    // '192.168.1.77'
).launch()