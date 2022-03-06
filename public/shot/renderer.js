let socket = io();

window.addEventListener("load", (event) => {

    // ADD SOCKET LISTENING TO CUSTOM COLOR AND DO THIS WITH THE RIGHT COLORS
    let customMain = null

    const speed = document.getElementById('speed')
    const dist = document.getElementById('dist')
    const points = document.getElementById('points')
    const assist = document.getElementById('assist')
    const pseudo = document.getElementById('pseudo')
    const number = document.getElementById('nb')

    let comp = document.getElementById('component')

    let svg = document.querySelector(".svgClass").getSVGDocument()
    let listMain = svg.getElementsByClassName('MainColor')
    for (let item of listMain) {
        if(customMain !== null) {
            item.style.fill = customMain
        }
    }

    comp.classList.add('hide')
    
    socket.on('game.scoreChanged', (arg) => {
        if(arg.data.team === 'blue') {
            svg.getElementsByClassName('teamColor')[0].style.fill = '#00A8FF'
        } else {
            svg.getElementsByClassName('teamColor')[0].style.fill = '#FFAA00'
        }
        
        speed.innerHTML = `${arg.data.speed}m/s`
        dist.innerHTML = `${arg.data.dist}M`
        points.innerHTML = arg.data.ammount
        pseudo.innerHTML = arg.data.scorer
        let nb = arg.data.nb
        if(nb < 10) nb = `0${nb}`
        number.innerHTML = nb
        if(arg.data.assist !== '[INVALID]') {
            assist.innerHTML = `assisted ${arg.data.assist}`
        }


        comp.classList.remove('hide')
        setTimeout(() => {
            comp.classList.add('hide')
        }, 8000);
    })
    




});

