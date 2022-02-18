const OBSClient = require('./src/obs-js/connection')
const OBSPlayer = require('./src/OBSPlayer')
const OverlayWS = require('./src/ws/OverlayWS')

module.exports = {
    OBSClient: OBSClient,
    OBSPlayer: OBSPlayer,
    OverlayWS:OverlayWS
}