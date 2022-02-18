
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
        let time = (nextMatch.getTime() - date.getTime()) / 1000
        
        function sendTimer(ws) {
            let minutes = Math.floor(time / 60);
            let seconds = Math.round(time - minutes * 60);
            ws.sendEvent('countDownTimer', {"m":minutes,"s":seconds});
            time--
            if (time === 0) {
                ws.sendEvent('startLive');
                clearInterval(matchCountDown);
            }
        }
        let ws = this.ws
        let matchCountDown = setInterval(function() {sendTimer(ws)}, 1000)
    }
}

module.exports = wait