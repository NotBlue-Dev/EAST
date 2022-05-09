let socket = io();
let VRMLDATA = [];

socket.on('vrml.matchDataLoaded', (arg) => {
    VRMLDATA = arg
});

socket.on('vrml.colorChanged', (arg) => {
    if(arg !== undefined) {
        VRMLDATA = arg
    }
});


socket.on('animation.triggerRoundOver', (arg) => {
    animate(VRMLDATA, arg.winner)
});

function animate(arg, winner) {
    document.getElementById('background-video').play()
    let roundDiv = document.getElementById('roundDiv')
    let teamName = document.getElementById('teamName')
    let img = document.getElementById('img')
    let teamDiv = document.getElementById('teamDiv')
    
    if(winner === 'blue') {
        roundDiv.classList.add('blue')
        roundDiv.classList.remove('orange')
    } else if(winner === 'orange') {
        roundDiv.classList.remove('blue')
        roundDiv.classList.add('orange') 
    }

    if(arg.length === 0 || arg.teams.length === 0) {
        img.classList.add('hide')
    } else {
        img.classList.remove('hide')
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

        if(winner === 'blue') {
            img.src = `https://vrmasterleague.com/${blue.logo}`
            winner = blue.name
        } else if(winner === 'orange') {
            img.src = `https://vrmasterleague.com/${orange.logo}`
            winner = orange.name
        }
    }

    teamName.innerHTML = winner.toUpperCase()

    teamDiv.classList.add('middle')
    setTimeout(() => {
        roundDiv.classList.add('opened')
        setTimeout(() => {
            teamName.classList.remove('hide')
        }, 850);
    }, 1500);

    setTimeout(() => {
        roundDiv.classList.add('leave')
        teamDiv.classList.remove('middle')
        teamDiv.classList.add('goLeft')
        setTimeout(() => {
            roundDiv.classList.remove('opened')
            roundDiv.classList.add('closed')
            setTimeout(() => {
                teamName.classList.add('hide')
            }, 150);
        }, 250);
    }, 3500);

    // clear

    setTimeout(() => {
        teamDiv.classList.add('noDisplay')
        roundDiv.classList.remove('leave')
        teamDiv.classList.remove('goLeft')
        setTimeout(() => {
            teamDiv.classList.remove('noDisplay')
        }, 1000);
    }, 6000)
}

socket.emit('overlay.ready', {'overlay': 'roundWin'})