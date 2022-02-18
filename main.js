const libOBS = require('./index')
const express = require('express');
const app = express();
const path = require('path');
const port = 4545

const listenEvent = (channel, callable) => {
    eventEmitter.on(channel, callable);
}

app.use(express.static(__dirname + "/public"));

app.get('/wait', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/wait/index.html'))
});

// to do config loader
const lib = 
    new libOBS.OBSPlayer(
    new libOBS.OBSClient(),
    new libOBS.OverlayWS(app, port),
    '127.0.0.1',
    'BsxJ57dQVfuba3hgviBdZw2'
    // '192.168.1.77'
    )

setTimeout(() => {
    lib.launch()
}, 6000);