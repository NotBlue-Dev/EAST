// eslint-disable-next-line no-undef
let socket = io();

window.addEventListener("load", () => {

    const speed = document.getElementById('speed');
    const dist = document.getElementById('dist');
    const points = document.getElementById('points');
    const assist = document.getElementById('assist');
    const pseudo = document.getElementById('pseudo');

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

    socket.on('game.showScore', (arg) => {
        if(arg.data.team === 'blue') {
            document.getElementById('box').classList.remove('o');
            document.getElementById('box').classList.add('b');
        } else {
            document.getElementById('box').classList.remove('b');
            document.getElementById('box').classList.add('o');
        }
        
        speed.innerHTML = `${arg.data.speed}m/s`;
        dist.innerHTML = `${arg.data.dist}m`;
        points.innerHTML = `${arg.data.ammount}pts`;
        pseudo.innerHTML = arg.data.scorer;
        if(arg.data.assist !== '[INVALID]') {
            assist.innerHTML = `Assisted by ${arg.data.assist}`;
        }

        display();
    });

    socket.on('game.endScore', () => {
        hide();
    });
    
    socket.emit('overlay.ready', { 'overlay': 'shot' });
});

