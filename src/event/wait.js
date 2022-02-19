
class wait {
    constructor(client,stat, ws) {
        this.client = client
        this.stat = stat
        this.ws = ws
        this.waiting.bind(this)()
    }

    waiting() {
        let date = new Date()
        let nextMatch = this.stat.times[0]
        let time = Math.round((nextMatch.getTime() - date.getTime()) / 1000)
        
        function sendTimer(ws,client) {
            let minutes = Math.floor(time / 60);
            let seconds = Math.round(time - minutes * 60);
            ws.sendEvent('countDownTimer', {"m":minutes,"s":seconds});
            time--
            console.log(time)
            if (time < 1) {
                client.send('SetCurrentScene', {'scene-name': 'Starting'})
                clearInterval(matchCountDown);
            }
        }
        let ws = this.ws
        let client = this.client
        let matchCountDown = setInterval(function() {sendTimer(ws,client)}, 1000)

        this.client.send('SetCurrentScene', {'scene-name': 'Waiting'})
    }
}

module.exports = wait