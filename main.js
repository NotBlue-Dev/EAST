const libOBS = require('./index')
const express = require('express');
const app = express();
const path = require('path');
const port = 4545

app.use(express.static(__dirname + "/public"));

app.get('/wait', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/wait/index.html'))
});

app.get('/starting', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/starting/index.html'))
});

app.get('/roundStart', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/roundStart/index.html'))
});

app.get('/roundWin', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/roundWin/index.html'))
});

app.get('/betwenRound', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/betwenRound/index.html'))
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/game/index.html'))
});

app.get('/ot', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/overTime/index.html'))
});

// to do config loader
const lib = 
    new libOBS.OBSPlayer(
    new libOBS.OBSClient(),
    new libOBS.OverlayWS(app, port),
    '192.168.1.77',
    '8R4Ws4hivnTpPMkIMVrmcg2'
    // '192.168.1.77'
)

// faire visu + regler bug img dupliquée