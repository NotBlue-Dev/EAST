let socket = io();

window.addEventListener("load", (event) => {

    const content = document.getElementById('ping')

    socket.on('game.ping', (arg) => {
        const dataBlue = arg.pings.blue.map((ping) => {
            const color = ping.ping > 250 ? 'purple'
                        : ping.ping > 150 ? 'red'
                        : ping.ping > 100 ? 'orange'
                        : 'green'
            return `<tr style="color: ${color}"><td>${ping.name}</td><td>${ping.ping}</td><tr>`;
        })
        const dataOrange = arg.pings.orange.map((ping) => {
            const color = ping.ping > 250 ? 'purple'
            : ping.ping > 150 ? 'red'
            : ping.ping > 100 ? 'orange'
            : 'green'
            return `<tr style="color: ${color}"><td>${ping.name}</td><td>${ping.ping}</td><tr>`;
        })
        content.innerHTML = `<table>${dataBlue.join('')}${dataOrange.join('')}</table>`;
    });
})
