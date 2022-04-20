let socket = io();

window.addEventListener("load", (event) => {
    const imgA = svg.getElementById('teamA')

    const imgB = svg.getElementById('teamB')

    const week = svg.getElementById('WEEK_')

    const nameA = document.getElementById('teamNameA')

    const nameB = document.getElementById('teamNameB')   
    
    const rankA = svg.getElementById('rankA')  

    const rankB = svg.getElementById('rankB')  

    const divA = document.getElementById('nbA')  

    const divB = document.getElementById('nbB')  

    socket.on('week', (arg) => {
        week.innerHTML = `Week ${arg}`
    })
    
    socket.on('teams-data', (arg) => {
        nameA.innerHTML = arg[0].name
        nameB.innerHTML = arg[1].name
        divA.innerHTML = `${arg[0].place}th`
        divB.innerHTML = `${arg[1].place}th`
        rankA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].rank}`)
        rankB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[0].rank}`)
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[0].logo}`)
    });
    
    socket.on('points', (arg) => {
        for (const [key, value] of Object.entries(arg)) {
            if(value.blue !== null) {
                document.getElementById(`${key}B`).innerHTML = value.blue
            }
            if(value.orange !== null) {
                document.getElementById(`${key}O`).innerHTML = value.orange
            }
        }
    })

    socket.emit('overlay.ready', {'overlay': 'betweenRound'})
});




