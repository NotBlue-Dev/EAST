let socket = io();

window.addEventListener("load", (event) => {

    let dataOrange = document.getElementById('dataOrange')
    let dataBlue = document.getElementById('dataBlue')
    let nameBlue = document.getElementById('nameBlue')
    let nameOrange = document.getElementById('nameOrange')
    let halfTime = document.getElementById('comp')
    let comp = document.getElementById('comp')

    socket.on('game.scoreChanged', (arg) => {
        halfTime.classList.add('hide')
    })

    function display() {
        comp.classList.remove('hidden');
        setTimeout(function () {
            comp.classList.remove('visuallyhidden');
        }, 20);
    }

    // hide
    function hide() {
        comp.classList.add('visuallyhidden');    
        comp.addEventListener('transitionend', function(e) {
            comp.classList.add('hidden');
        });
    }

    socket.on('animation.triggerHalfTime', (arg) => {
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

        display()
        setTimeout(() => {
            hide()
        }, 6000);
    })
    
    socket.emit('overlay.ready', {'overlay': 'halfTime'})
});

