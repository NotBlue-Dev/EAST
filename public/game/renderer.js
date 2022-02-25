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

    socket.on('round', (arg) => {
        svg.getElementById('Round').innerHTML = `Round ${arg}`
    });
    
    socket.on('teams-data', (arg) => {
        document.getElementById('teamA').innerHTML = arg[1].name
        document.getElementById('teamB').innerHTML = arg[0].name
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[0].logo}`)
    });
    
    socket.on('score-change', (arg) => {
        document.getElementById('blue').innerHTML = arg.blue
        document.getElementById('orange').innerHTML = arg.orange
    });

    socket.on('round-time', (arg) => {
        document.getElementById('timing').innerHTML = arg
    });    

    socket.emit('get-teams-data')
    
    socket.emit('get-week')
    
})
