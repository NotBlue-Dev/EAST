let socket = io();

window.addEventListener("load", (event) => {
    const imgA = document.getElementById('logoA')
    let vrml = false
    const imgB = document.getElementById('logoB')

    const nameA = document.getElementById('teamA')
    const nameB = document.getElementById('teamB')

    const fill = (arg) => {
        if(arg.teams.length === 0) {
            vrml = false
            return
        } else {
            vrml = true
        }

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

        nameA.innerHTML = blue.name
        nameB.innerHTML = orange.name
        imgA.classList.remove('hide')
        imgB.classList.remove('hide')
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        imgB.src = `https://vrmasterleague.com/${orange.logo}`
    }

    socket.on('vrml.colorChanged', fill)
    socket.on('vrml.matchDataLoaded', fill)
    
    socket.on('game.scoreChanged', (arg) => {
        document.getElementById('scoreB').innerHTML = arg.blue
        document.getElementById('scoreA').innerHTML = arg.orange
    });

    const mixed = (arg) => {
        nameA.innerHTML = arg.teamName[1]
        nameB.innerHTML = arg.teamName[0]
        imgA.classList.add('hide')
        imgB.classList.add('hide')
    }

    socket.on('game.ping', (arg) => {
        if(nameA.innerHTML === "" && nameB.innerHTML === "" && !vrml) {
            mixed(arg)
        }
    });

    socket.on('vrml.hide', (arg) => {
        vrml = false
        imgA.classList.add('hide')
        imgB.classList.add('hide')
        nameA.innerHTML = ''
        nameB.innerHTML = ''
    })  

    socket.on('game.teamChange', (arg) => {
        if(!vrml) {
            mixed(arg)
        }
    });

    socket.on('game.roundTime', (arg) => {
        let split = arg.time.split('.')

        document.getElementById('ms').innerHTML = `.${split[1]}`
        document.getElementById('minutes').innerHTML = `${split[0]}`
    });

    socket.on('game.roundOver', (arg) => {
        if(arg.winner !== null) {
            if(arg.winner === 'orange') {
                let current = document.getElementById(`OrangeR${arg.rounds[arg.rounds.length-1].currentRound}`)
                current.classList.add('winO')
                current.classList.remove('tbdO')
            } else {
                let current = document.getElementById(`BlueR${arg.rounds[arg.rounds.length-1].currentRound}`)
                current.classList.add('winB')
                current.classList.remove('tbdB')
            }
        }
    })

    socket.emit('overlay.ready', {'overlay': 'game'})
})
