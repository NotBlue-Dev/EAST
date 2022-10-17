// eslint-disable-next-line no-undef
let socket = io();

window.addEventListener("load", () => {
    let comp = document.getElementById('comp');

    // display
    function display() {
        comp.classList.remove('hidden');
        setTimeout(function () {
            comp.classList.remove('visuallyhidden');
        }, 20);
    }

    // hide
    function hide() {
        comp.classList.add('visuallyhidden');    
        comp.addEventListener('transitionend', function() {
            comp.classList.add('hidden');
        });
    }

    socket.on('game.showReplay', (arg) => {
        if(arg.data.team === 'blue') {
            document.getElementById('gradient').style.setProperty('--gradient', "conic-gradient(rgb(3, 117, 255), rgb(3, 185, 224))");
        } else {
            document.getElementById('gradient').style.setProperty('--gradient', "conic-gradient(#DC872C, #FA3F10)");
        }
        
        display();
    });

    socket.on('game.endReplay', () => {
        hide();
    });
    
    socket.emit('overlay.ready', {
        'overlay': 'replay'
    });
});

