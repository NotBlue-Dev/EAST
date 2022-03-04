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

    // for vrml
    socket.on('vrml.matchDataLoaded', (arg) => {
        week.innerHTML = `Week ${arg.week}`
        nameA.innerHTML = arg.teams.away.name
        nameB.innerHTML = arg.teams.home.name
        divA.innerHTML = `${arg.teams.home.place}th`
        divB.innerHTML = `${arg.teams.away.place}th`
        rankA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.home.rank}`)
        rankB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.away.rank}`)
        imgA.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.home.logo}`)
        imgB.setAttribute("xlink:href", `https://vrmasterleague.com/${arg.teams.away.logo}`)
        
        // clear player
        while (teamPlayerA.firstChild) {
            teamPlayerA.removeChild(teamPlayerA.firstChild);
        }
        while (teamPlayerB.firstChild) {
            teamPlayerB.removeChild(teamPlayerB.firstChild);
        }
        
        arg.teams.home.rosters.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            teamPlayerB.appendChild(a)
        });
        arg.teams.away.rosters.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            teamPlayerA.appendChild(a)
        });
    });

    // for mixed
    socket.on('game.teamChange', (arg) => {
        // clear player
        while (teamPlayerA.firstChild) {
            teamPlayerA.removeChild(teamPlayerA.firstChild);
        }
        while (teamPlayerB.firstChild) {
            teamPlayerB.removeChild(teamPlayerB.firstChild);
        }
        
        arg.teams.blue.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            teamPlayerB.appendChild(a)
        });
        arg.teams.orange.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            teamPlayerA.appendChild(a)
        });
    });

});

