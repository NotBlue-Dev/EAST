const OBSWebSocket = require('obs-websocket-js');

class OBS {
    constructor() {
        this.obsClient = new OBSWebSocket();
        this.handleConnected = () => {}
        this.handleDisconnected = () => {}
        this.initialize()
    }

    onConnected(callback) {
        this.handleConnected = callback
        return this
    }

    onDisconnected(callback) {
        this.handleDisconnected = callback
        return this
    }

    connect() {
        this.obsClient.connect({ address: '127.0.0.1:4444', password: 'toor' }).catch(err => {
            console.log('obs not running ?');
            setTimeout(() => {
                this.connect()
            }, 5000);
        });
    }

    initialize() {
        this.obsClient.on('ConnectionOpened', (data) => this.handleConnected('Connected',data));
        this.obsClient.on('ConnectionClosed', (data) => this.handleDisconnected('Disconnected', data));
    }

}

module.exports = OBS