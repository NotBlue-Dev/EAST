let socket = io();

socket.on('round', (arg) => {
    console.log(arg)
});

socket.on('winner', (arg) => {
    console.log(arg)
});