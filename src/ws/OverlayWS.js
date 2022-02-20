const http = require('http');
const { Server } = require("socket.io");
const express = require('express');
const path = require('path');

class OverlayWS {
    constructor(config, eventEmitter, rootPath) {
        this.eventEmitter = eventEmitter || ((channel, args) => {
            console.log(channel, args)
        })
        const app = express();
        this.rootPath = rootPath
        this.initializeOverlayServer(app, config)
        this.server = http.createServer(app)
        this.io = new Server(this.server);

        this.listenEvents(config)
    }

    listenEvents(config) {
        this.eventEmitter.on('overlayWs.launchServer', (args) => {
            this.server.addListener('listening', () => {
                this.eventEmitter.send('overlayWs.listening', {
                    port: args.port,
                    config, 
                })
            })

            this.startServer(args.port)
        })
    }

    initializeOverlayServer(app, config) {
      app.use(express.static(path.join(this.rootPath, 'public')));
      
      config.overlays.map((overlay) => {
        app.get(overlay.path, (req, res) => {
          res.sendFile(path.join(this.rootPath , 'public', overlay.template, 'index.html'))
        });
      })
    }

    startServer(port) {
        this.io.on('connection', (socket) => {
            this.eventEmitter.send('overlayWs.userConnected')
            socket.on('disconnect', () => {
              this.eventEmitter.send('overlayWs.userDisconnected')
            });
        });
        
        this.server.listen(port, () => {
            this.eventEmitter.send('overlayWs.listening', {port})
        });
    }

    listenEvent = (channel, callable) => {
        this.io.on('connection', (socket) => {
            socket.on(channel, callable);
        });
        
    }
    
    sendEvent = (channel, args) => {
        this.io.emit(channel, args);
    }
}

module.exports = OverlayWS