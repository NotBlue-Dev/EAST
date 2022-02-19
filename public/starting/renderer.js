let socket = io();

socket.on('week', (arg) => {
    console.log(arg)
})

socket.on('teams-data', (arg) => {
    // arg[0].forEach(element => {
    //     const img = document.createElement("img");
    //     img.src = `https://vrmasterleague.com/${element.logo}`;
    //     document.body.appendChild(img);
    // });
});

socket.emit('get-teams-data')

socket.emit('get-week')