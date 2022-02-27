let socket = io();

socket.on('echoArena.roundEnded', (arg) => {
    console.log(arg)
});

socket.on('round', (arg) => {
    console.log(arg)
});

socket.on('winner', (arg) => {
    console.log(arg)
});
