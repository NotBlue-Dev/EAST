let socket = io();

window.addEventListener("load", (event) => {
    const imgA = document.getElementById('LogoA')

    const imgB = document.getElementById('LogoB')

    const nameA = document.getElementById('nameA')

    const nameB = document.getElementById('nameB')   

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

        nameB.innerHTML = orange.name
        nameA.innerHTML = blue.name
        imgA.classList.remove('hide')
        imgB.classList.remove('hide')
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        imgB.src = `https://vrmasterleague.com/${orange.logo}`
    }

    socket.on('game.teamChange', (arg) => {
        nameA.innerHTML = "ORANGE"
        nameB.innerHTML = "BLUE"
        imgA.classList.add('hide')
        imgB.classList.add('hide')
    });


    socket.on('vrml.colorChanged', fill)

    socket.on('vrml.matchDataLoaded', fill)
    
    socket.on('game.scoreBoard', (arg) => {
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




