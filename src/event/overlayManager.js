
class overlayManager {
    constructor(ws, client) {
        this.ws = ws
        this.client = client
        this.show = false
        this.roundlast = 0
        this.round_start = false
        this.round_over = false
        this.starting = false
        this.ot = false
        this.playing = false
        this.round = {
            1:{"blue":null,"orange":null},
            2:{"blue":null,"orange":null},
            3:{"blue":null,"orange":null}
        }
    }

    // after each overlay, show playing

    handle(gameData) {
        this.client.obsWebSocket.send('GetSceneList').then((data) => {
            data.scenes.forEach(scene => {
                if (scene.name === 'Waiting') {
                    return;
                }
            });
        })

        switch (gameData.status) {

            // RoundStart.js
            case 'pre_match':
                this.round_start = false
                break;
        
            // RoundOver.js
            case 'round_over':
                // quand OT, round over déclencher puis OT déclencher donc on wait pour check que c'est pas OT
                setTimeout(() => {
                    if(!this.round_over && !this.ot) {
                        this.round_over = true
                        // show roundWin
                        this.ws.sendEvent('round',gameData.round)
                        this.ws.sendEvent('get-winner')
                        this.client.send('SetCurrentScene', {'scene-name': 'Round Result'})
                        // then betwenn round
                        setTimeout(() => {
                            this.round[gameData.round].blue = gameData.bluepoints
                            this.round[gameData.round].orange = gameData.orangepoints
                            this.ws.sendEvent('points',this.round)
                            this.client.send('SetCurrentScene', {'scene-name': 'Round Betwen'})
                        }, 5000);

                        // at the end of the between round
                        setTimeout(() => {
                            this.round_start = false
                            this.starting = false
                            // show playing
                            console.log('end betwen round')
                            this.client.send('SetCurrentScene', {'scene-name': 'Echo'})
                        }, 90000);
                    }
                }, 50);
                this.ot = false  
                break;

            // Overtime.js
            case 'sudden_death':
                if(!this.ot) {
                    this.ot = true
                    // show OT
                    this.client.send('SetCurrentScene', {'scene-name': 'OT'})
                    setTimeout(() => {
                        this.client.send('SetCurrentScene', {'scene-name': 'Echo'})
                    }, 5000);
                }
                break;

            // RoundStart.js
            case 'round_start':
                if ((gameData.round != this.roundlast || gameData.round == 0) && !this.round_start ) {
                    this.round_start = true
                    this.roundlast = gameData.round
                    // SHOW ROUND STARTT
                    this.ws.sendEvent('round',gameData.round)
                    this.client.send('SetCurrentScene', {'scene-name': 'Round Start'})
                    // then show playing
                    setTimeout(() => {
                        this.client.send('SetCurrentScene', {'scene-name': 'Echo'})
                    }, 5000);
                }
                this.round_over = false
                break
            default:
                break;
        }
    }
}

module.exports = overlayManager