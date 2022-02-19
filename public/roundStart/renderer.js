let socket = io();

socket.on('round', (arg) => {
    console.log(arg)
});

// nothing will be emit from here, emit will be in api.js