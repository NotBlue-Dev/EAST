let socket = io();

window.addEventListener("load", () => {

    const imgA = document.getElementById('Blue')
    const TeamA = document.getElementById('BlueName')
    const imgB = document.getElementById('Orange')
    const TeamB = document.getElementById('OrangeName')
    const timer = document.getElementById('timer')

    const week = document.getElementById('week')

    const fill = function (arg) {
        orange = arg.teams.home
        blue = arg.teams.away

        if (arg.teams.home.color !== null && arg.teams.away.color !== null) { 
            if(arg.teams.home.color === 'blue') {
                blue = arg.teams.home
                orange = arg.teams.away
            } else {
                blue = arg.teams.away
                orange = arg.teams.home
            }
        }

        imgB.src = `https://vrmasterleague.com/${orange.logo}`
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        TeamA.innerHTML = orange.name
        TeamB.innerHTML = blue.name
    }

    socket.on('vrml.colorChanged' , (arg) => {
        fill(arg)
    })

    socket.on('vrml.matchDataLoaded', (arg) => {
        fill(arg)
        
        week.innerHTML = `VRML Week ${arg.week}`
        
        console.log(arg)

        try {clearInterval(matchCountDown)} catch {}

        let date = new Date()
        let nextMatch = new Date(arg.time)
        let time = Math.round((nextMatch.getTime() - date.getTime()) / 1000)
        function timerFunc() {
            let hours = Math.floor(time / 3600);
            let restTime = time - hours * 3600;
            let minutes = Math.floor(restTime / 60);
            let seconds = Math.round(restTime - minutes * 60);
            time--
            if (minutes < 10) {
                minutes = '0' + minutes
            }
            if (seconds < 10) {
                seconds = '0' + seconds
            }
            
            if (hours > 0) {
                timer.innerHTML = `${hours}:${minutes}:${seconds}`
            } else {
                timer.innerHTML = `${minutes}:${seconds}`
            }
            if (time < 1) {
                // switch scene send event to obs
                clearInterval(matchCountDown);
            }
        }
        let matchCountDown = setInterval(function() {timerFunc()}, 1000)
    })

    socket.emit('overlay.ready', {'overlay': 'wait'})
});

