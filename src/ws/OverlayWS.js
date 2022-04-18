const http = require('http');
const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const { resolve } = require('path');

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

        this.io.on('connection', (socket) => {
            this.socket = socket
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
        return new Promise((resolve) => {
            this.server.listen(port, () => {
                resolve()
            })
        })
    }

    on = (channel, callable) => {
        this.socket.on(channel, callable);
    }
    
    send = (channel, args) => {
        this.io.emit(channel, args);
    }
}

module.exports = OverlayWS
