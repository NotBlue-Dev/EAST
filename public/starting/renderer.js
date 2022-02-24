let socket = io();

window.addEventListener("load", (event) => {

    // ADD SOCKET LISTENING TO CUSTOM COLOR AND DO THIS WITH THE RIGHT COLORS
    let customMain = null
    let customScd = null

    let listMain = document.querySelector(".svgClass").getSVGDocument().getElementsByClassName('MainColor')
    for (let item of listMain) {
        if(customMain !== null) {
            item.style.fill = customMain
        }
    }

    let listScd = document.querySelector(".svgClass").getSVGDocument().getElementsByClassName('ScdColor')
    for (let item of listScd) {
        if(item !== null) {
            item.style.fill = customScd
        }
    }
    
    let svg = document.querySelector(".svgClass").getSVGDocument()

    const imgA = svg.getElementById('teamA')

    const imgB = svg.getElementById('teamB')

    const week = svg.getElementById('WEEK_')

    const nameA = document.getElementById('teamNameA')

    const nameB = document.getElementById('teamNameB')   
    
    const rankA = svg.getElementById('rankA')  

    const rankB = svg.getElementById('rankB')  

    const divA = document.getElementById('nbA')  

    const divB = document.getElementById('nbB')  

    const teamPlayerA = document.getElementById('containerA')  

    const teamPlayerB = document.getElementById('containerB')  

    socket.on('week', (arg) => {
        week.innerHTML = `Week ${arg}`
    })
    
    socket.on('teams-data', (arg) => {
        nameA.innerHTML = arg[0].name
        nameB.innerHTML = arg[1].name
        divA.innerHTML = `${arg[0].place}th`
        divB.innerHTML = `${arg[1].place}th`
        rankA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].rank}`)
        rankB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].rank}`)
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[1].logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg[0].logo}`)
        arg[0].rosters.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            teamPlayerA.appendChild(a)
        });
        arg[1].rosters.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            teamPlayerB.appendChild(a)
        });
        
    });
    
    socket.emit('get-teams-data')
    
    socket.emit('get-week')

});

