const OBSWebSocket = require('obs-websocket-js');

class OBSClient {
    constructor() {
        this.obsWebSocket = new OBSWebSocket();
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

    connect({ip, port, password}) {
        return this.obsWebSocket.connect({ 
            address: `${ip}:${port}`,
            password
        })
    }  

    async send(channel, arg) {
        return await this.obsWebSocket.send(channel, arg).catch((error) => {console.log(error)});
    }

    initialize() {
        this.obsWebSocket.on('ConnectionOpened', (data) => this.handleConnected('Connected',data));
        this.obsWebSocket.on('ConnectionClosed', (data) => this.handleDisconnected('Disconnected', data));
    }

}

module.exports = OBSClient