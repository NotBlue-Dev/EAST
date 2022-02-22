let socket = io();

window.addEventListener("DOMContentLoaded", (event) => {
    const imgA = document.getElementById('teamAStart')

    const imgB = document.getElementById('teamBStart')

    const week = document.getElementById('weekStart')

    const nameA = document.getElementById('teamNameA')

    const nameB = document.getElementById('teamNameB')   
    
    const rankA = document.getElementById('rankAStart')  

    const rankB = document.getElementById('rankBStart')  

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
        rankA.src = `https://vrmasterleague.com/${arg[0].rank}`
        rankB.src = `https://vrmasterleague.com/${arg[0].rank}`
        imgA.src = `https://vrmasterleague.com/${arg[0].logo}`
        imgB.src = `https://vrmasterleague.com/${arg[1].logo}`
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

