let socket = io();

window.addEventListener("load", (event) => {

    let dataOrange = document.getElementById('dataOrange')
    let dataBlue = document.getElementById('dataBlue')
    let nameBlue = document.getElementById('nameBlue')
    let nameOrange = document.getElementById('nameOrange')
    let halfTime = document.getElementById('comp')

    socket.on('game.scoreChanged', (arg) => {
        halfTime.classList.add('hide')
    })

    socket.on('animation.triggerHalfTime', (arg) => {
        console.log(arg)
        if(arg.blue.data === null) {
            dataBlue.innerHTML = 'No data'
        } else {
            dataBlue.innerHTML = arg.blue.data
            nameBlue.innerHTML = arg.blue.name
        }

        if(arg.orange.data === null) {
            dataOrange.innerHTML = 'No data'
        } else {
            dataOrange.innerHTML = arg.orange.data
            nameOrange.innerHTML = arg.orange.name
        }

        halfTime.classList.remove('hide')
        setTimeout(() => {
            halfTime.classList.add('hide')
        }, 6000);
    })
    
    socket.emit('overlay.ready', {'overlay': 'halfTime'})
});

