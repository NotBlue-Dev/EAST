let socket = io();



window.addEventListener("load", (event) => {
    let svg = document.querySelector(".svgClass").getSVGDocument()

    const imgA = svg.getElementById('teamA')

    const imgB = svg.getElementById('teamB')

    socket.on('round', (arg) => {
        svg.getElementById('Round').innerHTML = `Round ${arg}`
    });
    
    socket.on('teams-data', (arg) => {
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[0].logo}`)
    });
    
    socket.on('score-change', (arg) => {
        console.log(arg)
    });

    socket.on('round-time', (arg) => {
        console.log(arg)
    });    

    socket.emit('get-teams-data')
    
    socket.emit('get-week')
    
    socket.emit('get-round')
})
