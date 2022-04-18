let socket = io();

window.addEventListener("load", (event) => {
    const imgA = document.getElementById('logoA')

    const imgB = document.getElementById('logoB')

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

        document.getElementById('teamA').innerHTML = blue.name
        document.getElementById('teamB').innerHTML = orange.name
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        imgB.src = `https://vrmasterleague.com/${orange.logo}`
    }

    socket.on('vrml.colorChanged', fill)
    socket.on('vrml.matchDataLoaded', fill)
    
    socket.on('game.scoreChanged', (arg) => {
        document.getElementById('scoreB').innerHTML = arg.blue
        document.getElementById('scoreA').innerHTML = arg.orange
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
