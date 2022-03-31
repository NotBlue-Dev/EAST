let socket = io();

window.addEventListener("load", (event) => {
    let svg = document.querySelector(".svgClass").getSVGDocument()

    const blue = document.getElementsByClassName('blue')

    const orange = document.getElementsByClassName('orange')

    socket.on('game.teamChange', (arg) => {
        while (orange.firstChild) {
            orange.removeChild(orange.firstChild);
        }
        while (blue.firstChild) {
            blue.removeChild(blue.firstChild);
        }

        for(let x =0; x<orange.length; x++) {
            let or = arg.teams.orange
            if(or[x] !== undefined) {
                orange[x].id = or[x]
                orange[x].innerHTML = or[x]
            }
        }
    
        for(let i =0; i<blue.length; i++) {
            let bl = arg.teams.blue
            if(bl[i] !== undefined) {
                blue[i].id = bl[i]
                blue[i].innerHTML = bl[i]
            }
        }
    });

    socket.on('game.possessionChange', (arg) => {

        // reset
        let current = document.getElementsByClassName('current')[0]
        current && current.classList.remove('current')

        if(arg.possession.team === 'ORANGE TEAM') {
            for(let x =0; x<orange.length; x++) {
                if(orange[x].id == arg.player) {
                    orange[x].classList.add('current')
                }
            }
        } else {
            for(let i =0; i<blue.length; i++) {
                if(blue[i].id == arg.player) {
                    blue[i].classList.add('current')
                }
            }
        }
    });  
})
