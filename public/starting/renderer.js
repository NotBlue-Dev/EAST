let socket = io();

window.addEventListener("load", (event) => {
    let vrml = false

    const imgA = document.getElementById('BLOGO')

    const imgB = document.getElementById('OLOGO')

    const week = document.getElementById('week')

    const nameA = document.getElementById('OrangeName')

    const nameB = document.getElementById('BlueName')   

    const teamPlayerA = document.getElementById('BoxOrange')  

    const teamPlayerB = document.getElementById('BoxBlue') 

    const createPlayers = (arg1,arg2) => {
        arg1.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            let div = document.createElement('div')
            div.classList.add('row')
            div.classList.add('b')
            div.appendChild(a)
            teamPlayerB.appendChild(div)
        });
        arg2.forEach(player => {
            let a = document.createElement('a')
            a.innerHTML = player
            let div = document.createElement('div')
            div.classList.add('row')
            div.classList.add('o')
            div.appendChild(a)
            teamPlayerA.appendChild(div)
        });
    }

    const clear = () => {
        while (teamPlayerA.firstChild) {
            teamPlayerA.removeChild(teamPlayerA.firstChild);
        }
        while (teamPlayerB.firstChild) {
            teamPlayerB.removeChild(teamPlayerB.firstChild);
        }
    }

    const fill = (arg) => {
        if(arg.week == null) {
            week.innerHTML = `MIXED GAME`
        } else {
            week.innerHTML = `VRML Week ${arg.week}`
        }
        
        if(arg.teams.length === 0) {
            vrml = false
            return
        } else {
            vrml = true
        }

        orange = arg.teams.home
        blue = arg.teams.away
        if (orange.color !== null && blue.color !== null && orange.color !== undefined && blue.color !== undefined) {
            if(arg.teams.home.color === 'blue') {
                blue = arg.teams.home
                orange = arg.teams.away
            } else {
                blue = arg.teams.away
                orange = arg.teams.home
            }
        }


        nameA.innerHTML = orange.name
        nameB.innerHTML = blue.name
        imgA.classList.remove('hide')
        imgB.classList.remove('hide')
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        imgB.src = `https://vrmasterleague.com/${orange.logo}`
        
        clear()

        createPlayers(blue.rosters, orange.rosters)
        
    }

    // for vrml
    socket.on('vrml.matchDataLoaded', fill)

    socket.on('vrml.colorChanged', fill)

    socket.on('vrml.hide', (arg) => {
        vrml = false
        imgA.classList.add('hide')
        imgB.classList.add('hide')
        nameA.innerHTML = ''
        nameB.innerHTML = ''
        clear()

        createPlayers(['','','',''], ['','','',''])
    })  

    socket.on('game.ping', (arg) => {
        if(nameA.innerHTML === "" && nameB.innerHTML === "" && !vrml) {
            clear()

            arg.pings.blue.forEach(player => {
                let a = document.createElement('a')
                a.innerHTML = player.name
                let div = document.createElement('div')
                div.classList.add('row')
                div.classList.add('b')
                div.appendChild(a)
                teamPlayerB.appendChild(div)
            });
            arg.pings.orange.forEach(player => {
                let a = document.createElement('a')
                a.innerHTML = player.name
                let div = document.createElement('div')
                div.classList.add('row')
                div.classList.add('o')
                div.appendChild(a)
                teamPlayerA.appendChild(div)
            });

            nameA.innerHTML = arg.teamName[1]
            nameB.innerHTML = arg.teamName[0]
        }
    });

    // for mixed
    socket.on('game.teamChange', (arg) => {

        if(!vrml) {
            nameA.innerHTML = arg.teams.teamName[1]
            nameB.innerHTML = arg.teams.teamName[0]
        }

        clear()
        
        createPlayers(arg.teams.blue, arg.teams.orange)
    });

    socket.emit('overlay.ready', {'overlay': 'starting'})

});
