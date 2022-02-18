const http = require('http');
const { Server } = require("socket.io");

class OverlayWS {
    constructor(app, port) {
        this.port = port
        this.server = http.createServer(app)
        this.io =  new Server(this.server);
        this.startServer()
    }

    startServer() {
        this.io.on('connection', (socket) => {
            console.log('user connected');
            socket.on('disconnect', () => {
              console.log('user disconnected');
            });
        });
        
        this.server.listen(this.port, () => {
            console.log('Server app listening on port ' + this.port);
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