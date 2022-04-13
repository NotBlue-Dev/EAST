let socket = io();

window.addEventListener("load", (event) => {

    const speed = document.getElementById('speed')
    const dist = document.getElementById('dist')
    const points = document.getElementById('points')
    const assist = document.getElementById('assist')
    const pseudo = document.getElementById('pseudo')

    let comp = document.getElementById('comp')

    comp.classList.add('hide')
    
    socket.on('game.scoreChanged', (arg) => {
        if(arg.data.team === 'blue') {
            document.getElementById('box').classList.add('b')
        } else {
            document.getElementById('box').classList.add('o')
        }
        
        speed.innerHTML = `${arg.data.speed}m/s`
        dist.innerHTML = `${arg.data.dist}m`
        points.innerHTML = arg.data.ammount
        pseudo.innerHTML = arg.data.scorer
        if(arg.data.assist !== '[INVALID]') {
            assist.innerHTML = `Assisted by ${arg.data.assist}`
        }

        comp.classList.remove('hide')
        setTimeout(() => {
            comp.classList.add('hide')
        }, 8000);
    })
    
    socket.emit('overlay.ready', {'overlay': 'shot'})
});

