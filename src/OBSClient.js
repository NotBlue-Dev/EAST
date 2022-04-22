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

    on(channel, callback) {
        this.obsWebSocket.on(channel, (args) => callback(args));
        return this
    }

    async createScene(sceneName) {

        const createSceneResponse = await this.send('CreateScene', {sceneName});
        console.log(createSceneResponse)

        this.createSource('source', 'browser_source', sceneName, {
            width: 1920,
            height: 1080, 
            url: 'http://localhost:4545/game', 
        })
    }

    async createSource(sourceName, sourceKind, sceneName, sourceSettings = {}) {
        const response = await this.send('CreateSource', {
            sourceName,
            sourceKind,
            sceneName,
            sourceSettings,
        });

        console.log(response)

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