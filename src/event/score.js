class Score {
    constructor(ws, client) {
        this.ws = ws
        this.client = client
        this.orangePoints = null
        this.bluePoints = null
        this.delay = 3
        this.dur = 4
    }

    handle(gameData) {
        if (this.orangePoints === null || this.bluePoints === null) {
            this.bluePoints = gameData.bluepoints
            this.orangePoints = gameData.orangepoints
            return
        }
        if (this.orangePoints != gameData.orangepoints || this.bluePoints != gameData.bluepoints) {
            this.bluePoints = gameData.bluepoints
            this.orangePoints = gameData.orangepoints
            // wait x second before showing clip
            let client = this.client
            // si on a pas le temps de montrer le goal (end round) on le skip
            if(((gameData.clock - (this.delay + this.dur)) >= 0)) {
                setTimeout(() => {
                    client.send('GetSceneList').then((data) => {
                        data.scenes.forEach(scene => {
                            if (scene.name !== 'Round Result' || scene.name !== "OT") {
                                client.send('SetCurrentScene', {'scene-name': 'Goal'})
                                // show clip x second
                                setTimeout(() => {
                                    client.send('SetCurrentScene', {'scene-name': 'Echo'})
                                }, this.dur*1000);
                                return;
                            }
                        });
                    })
                }, this.delay*1000);
            }

            this.ws.sendEvent('score-change', {"blue":this.bluePoints,"orange":this.orangePoints});
        }
    }
}

module.exports = Score