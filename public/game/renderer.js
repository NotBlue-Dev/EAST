let socket = io();

window.addEventListener("load", (event) => {
    let svg = document.querySelector(".svgClass").getSVGDocument()

    let customMain = null

    let listMain = document.querySelector(".svgClass").getSVGDocument().getElementsByClassName('MainColor')
    for (let item of listMain) {
        if(customMain !== null) {
            item.style.fill = customMain
        }
    }

    const imgA = svg.getElementById('blue-logo')

    const imgB = svg.getElementById('orange-logo')

    socket.on('game.roundStart', (arg) => {
        svg.getElementById('Round').innerHTML = `Round ${arg.round}`
    });

    const fill = (arg) => {
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

        document.getElementById('blue-name').innerHTML = blue.name
        document.getElementById('orange-name').innerHTML = orange.name
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${blue.logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${orange.logo}`)
    }

    socket.on('vrml.colorChanged', fill)
    socket.on('vrml.matchDataLoaded', fill)
    
    socket.on('game.scoreChanged', (arg) => {
        document.getElementById('blue-score').innerHTML = arg.blue
        document.getElementById('orange-score').innerHTML = arg.orange
    });

    socket.on('game.roundTime', (arg) => {
        document.getElementById('timing').innerHTML = arg.time
    });

    socket.emit('overlay.ready', {'overlay': 'game'})
})
