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
    
    socket.on('vrml.matchDataLoaded', (arg) => {
        document.getElementById('teamA').innerHTML = arg.teams.away.name
        document.getElementById('teamB').innerHTML = arg.teams.home.name
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.away.logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.home.logo}`)
    });
    
    socket.on('game.scoreChanged', (arg) => {
        document.getElementById('blue').innerHTML = arg.blue
        document.getElementById('orange').innerHTML = arg.orange
    });

    socket.on('game.roundTime', (arg) => {
        document.getElementById('timing').innerHTML = arg.time
    });    
    
})
