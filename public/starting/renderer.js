let socket = io();

window.addEventListener("load", (event) => {

    const imgA = document.getElementById('BLOGO')

    const imgB = document.getElementById('OLOGO')

    const week = document.getElementById('week')

    const nameA = document.getElementById('OrangeName')

    const nameB = document.getElementById('BlueName')   

    const teamPlayerA = document.getElementById('BoxOrange')  

    const teamPlayerB = document.getElementById('BoxBlue') 

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

        week.innerHTML = `VRML Week ${arg.week}`
        nameA.innerHTML = orange.name
        nameB.innerHTML = blue.name
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        imgB.src = `https://vrmasterleague.com/${orange.logo}`
        
        // clear player
        while (teamPlayerA.firstChild) {
            teamPlayerA.removeChild(teamPlayerA.firstChild);
        }
        while (teamPlayerB.firstChild) {
            teamPlayerB.removeChild(teamPlayerB.firstChild);
        }
        
        blue.rosters.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            let div = document.createElement('div')
            div.classList.add('row')
            div.classList.add('b')
            div.appendChild(a)
            teamPlayerB.appendChild(div)
        });
        orange.rosters.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            let div = document.createElement('div')
            div.classList.add('row')
            div.classList.add('o')
            div.appendChild(a)
            teamPlayerA.appendChild(div)
        });
    }

    // for vrml
    socket.on('vrml.matchDataLoaded', fill)

    socket.on('vrml.colorChanged', fill)

    // for mixed
    socket.on('game.teamChange', (arg) => {

        nameA.innerHTML = "Orange"
        nameB.innerHTML = "Blue"
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
            let div = document.createElement('div')
            div.classList.add('row')
            div.classList.add('b')
            div.appendChild(a)
            teamPlayerB.appendChild(div)
        });
        arg.teams.orange.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            let div = document.createElement('div')
            div.classList.add('row')
            div.classList.add('o')
            div.appendChild(a)
            teamPlayerA.appendChild(div)
        });
    });

    socket.emit('overlay.ready', {'overlay': 'starting'})
});
