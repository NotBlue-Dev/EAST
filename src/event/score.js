class Score {
    constructor(ws, client) {
        this.ws = ws
        this.client = client
        this.orangePoints = null
        this.bluePoints = null
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
            setTimeout(() => {
                this.client.obsClient.send('GetSceneList').then((data) => {
                    data.scenes.forEach(scene => {
                        if (scene.name !== 'Round Result' || scene.name !== "OT") {
                            this.client.send('SetCurrentScene', {'scene-name': 'Goal'})
                        }
                    });
                })
            }, 4000);

            this.ws.sendEvent('score-change', {"blue":this.bluePoints,"orange":this.orangePoints});
        }
    }
}

module.exports = Score