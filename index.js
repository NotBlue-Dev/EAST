const OBSClient = require('./src/OBSClient');
const OBSPlayer = require('./src/OBSPlayer');
const OverlayWS = require('./src/ws/OverlayWS');
const ConfigLoader = require('./src/ConfigLoader');

module.exports = {
    OBSClient,
    OBSPlayer,
    OverlayWS,
    ConfigLoader
};

// load score even if no score update
//get current scene with obsWS
//update name of team/logo even if not connected to echo arena