let socket = io();

socket.on('round', (arg) => {
    console.log(arg)
});

socket.emit('get-round')