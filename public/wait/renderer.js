let socket = io();

window.addEventListener("load", () => {
    
    // ADD SOCKET LISTENING TO CUSTOM COLOR AND DO THIS WITH THE RIGHT COLORS
    let customMain = null
    let listMain = document.querySelector(".svgClass").getSVGDocument().getElementsByClassName('MainColor')
    for (let item of listMain) {
        if(customMain !== null) {
            item.style.fill = customMain
        }
    }

    let svg = document.querySelector(".svgClass").getSVGDocument()
    const imgA = svg.getElementById('teamAWait')

    const imgB = svg.getElementById('teamBWait')

    const timer = document.getElementById('timer')

    const week = svg.getElementById('WEEK_')

    socket.on('overlayWs.week', (arg) => {
        week.innerHTML = `WEEK ${arg}`
    })

    socket.on('vrml.matchDataLoaded', (arg) => {
        try {clearInterval(matchCountDown)} catch {}

        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.home.logo}`)
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.away.logo}`)
        let date = new Date()
        let nextMatch = new Date(arg.time)
        let time = Math.round((nextMatch.getTime() - date.getTime()) / 1000)
        function timerFunc() {
            let minutes = Math.floor(time / 60);
            let seconds = Math.round(time - minutes * 60);
            time--
            timer.innerHTML = `${minutes}:${seconds}`
            if (time < 1) {
                // switch scene send event to obs
                clearInterval(matchCountDown);
            }
        }
        let matchCountDown = setInterval(function() {timerFunc()}, 1000)
    })

    socket.emit('overlayWs.getWeek')
    socket.emit('vrml.getConfigMatchData')


});

