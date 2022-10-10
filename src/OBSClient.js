const OBSWebSocket = require('obs-websocket-js');
const exec = require('child_process').exec;
class OBSClient {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.obsWebSocket = new OBSWebSocket();
        this.handleConnected = () => {};
        this.handleDisconnected = () => {};
        this.initialize();
    }

    onConnected(callback) {
        this.handleConnected = callback;
        return this;
    }

    isLaunched() {
        return new Promise((resolve) => {
            exec('tasklist /FI "imagename eq obs64.exe"', function(err, stdout) {
                if(stdout.indexOf('obs64.exe') === -1) {
                    resolve(false);
                }
                resolve(true);
            });
        });

    }

    launch(executablePath) {
        let self = this;
        if(executablePath.endsWith('obs64.exe')) {
            executablePath = executablePath.substring(0, executablePath.length - 10);
        }
        if(!executablePath.endsWith('\\')) {
            executablePath += '\\';
        }

        exec(`start /d "${executablePath}" obs64.exe`, (error) => { 
            if(error !== null) self.eventEmitter.send('obs.error', error);

            self.eventEmitter.send('obs.started');
        });
    }

    onDisconnected(callback) {
        this.handleDisconnected = callback;
        return this;
    }

    connect({
        ip, 
        port, 
        password
        }) {
        return this.obsWebSocket.connect({ 
            address: `${ip}:${port}`,
            password
        });
        
    }  

    on(channel, callback) {
        this.obsWebSocket.on(channel, (args) => callback(args));
        return this;
    }

    async createScene(sceneName) {
        const response = await this.send('CreateScene', {
            sceneName
        });
        return response;
    }

    async refresh(sourceName) {
        const response = await this.send('RefreshBrowserSource', {
            sourceName
        });
        return response;
    }

    async addSourceToScene(sceneName, sourceName) {
        const response = await this.send('AddSceneItem', {
            sourceName,
            sceneName
        });
        return response;
    }

    async setSourceOrder(sceneName, sceneItem) {
        const response = await this.send('ReorderSceneItems', {
            scene:sceneName,
            items:sceneItem
        });
        return response;
    }

    async createSource(sourceName, sourceKind, sceneName, sourceSettings = {}) {
        const response = await this.send('CreateSource', {
            sourceName,
            sourceKind,
            sceneName,
            sourceSettings,
        });
        return response;
    }

    refreshAll() {
        this.send('GetSourcesList').then((arg) => {
            arg.sources.forEach(source => {
                if(source.typeId === 'browser_source') {
                    this.refresh(source.name);
                }
            });
        });
    }

    send(channel, arg) {
        return this.obsWebSocket.send(channel, arg).catch((error) => {console.log(error);});
    }

    initialize() {
        this.obsWebSocket.on('ConnectionOpened', (data) => this.handleConnected('Connected',data));
        this.obsWebSocket.on('ConnectionClosed', (data) => this.handleDisconnected('Disconnected', data));
    }

}

module.exports = OBSClient;
