let socket = io();

socket.on('round', (arg) => {
    console.log(arg)
});

socket.emit('overlay.ready', {'overlay': 'roundStart'})

// nothing will be emit from here, emit will be in api.js
