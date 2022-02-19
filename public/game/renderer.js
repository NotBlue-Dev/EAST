let socket = io();

socket.on('round', (arg) => {
    console.log(arg)
});

socket.on('teams-data', (arg) => {
    arg[0].forEach(element => {
        const img = document.createElement("img");
        img.src = `https://vrmasterleague.com/${element.logo}`;
        document.body.appendChild(img);
    });
});

socket.on('score-change', (arg) => {
    console.log(arg)
});

socket.on('posses-change', (arg) => {
    console.log(arg)
});

socket.on('round-time', (arg) => {
    console.log(arg)
});

// nothing will be emit from here, emit will be in api.js