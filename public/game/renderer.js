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

    const imgA = svg.getElementById('teamA')

    const imgB = svg.getElementById('teamB')

    socket.on('game.roundStart', (arg) => {
        svg.getElementById('Round').innerHTML = `Round ${arg.round}`
    });

    function fill(arg) {
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

        document.getElementById('teamA').innerHTML = blue.name
        document.getElementById('teamB').innerHTML = orange.name
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${blue.logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${orange.logo}`)
    }

    socket.on('vrml.colorChanged' , (arg) => {
        fill(arg)
    })

    socket.on('vrml.matchDataLoaded', (arg) => {
        fill(arg)
    });
    
    socket.on('game.scoreChanged', (arg) => {
        document.getElementById('blue').innerHTML = arg.blue
        document.getElementById('orange').innerHTML = arg.orange
    });

    socket.on('game.roundTime', (arg) => {
        document.getElementById('timing').innerHTML = arg.time
    });    
    
})
