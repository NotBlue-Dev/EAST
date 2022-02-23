let socket = io();

window.addEventListener("load", (event) => {
    let svg = document.querySelector(".svgClass").getSVGDocument()
    const imgA = svg.getElementById('teamAWait')

    const imgB = svg.getElementById('teamBWait')

    const timer = svg.getElementById('timer')

    const week = svg.getElementById('WEEK_')
    console.log(imgA)
    socket.on('countDownTimer', (arg) => {
        timer.innerHTML = `${arg.m}:${arg.s}`
    })
    
    socket.on('week', (arg) => {
        week.innerHTML = `WEEK ${arg}`
    })
    
    socket.on('teams-data', (arg) => {
        console.log(arg)
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[0].logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].logo}`)
    });
    
    socket.emit('get-teams-data')
    
    socket.emit('get-week')

});

