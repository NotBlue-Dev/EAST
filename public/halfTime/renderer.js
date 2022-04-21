let socket = io();

window.addEventListener("load", (event) => {

    
    
    socket.emit('overlay.ready', {'overlay': 'halfTime'})
});

