// eslint-disable-next-line no-undef
let socket = io();

window.addEventListener("load", () => {

    const content = document.getElementById('ping')

    socket.on('game.ping', (arg) => {
        console.log(arg)
        const dataBlue = arg.pings.blue.map((ping) => {
            const color = ping.ping > 250 ? 'purple'
                        : ping.ping > 150 ? 'red'
                        : ping.ping > 100 ? 'orange'
                        : 'green'
            return `<tr style="color: ${color}"><td>${ping.name}</td><td>${ping.ping}</td><td>${ping.handL}</td><td>${ping.handR}</td><tr>`;
        })
        const dataOrange = arg.pings.orange.map((ping) => {
            const color = ping.ping > 250 ? 'purple'
            : ping.ping > 150 ? 'red'
            : ping.ping > 100 ? 'orange'
            : 'green'
            return `<tr style="color: ${color}"><td>${ping.name}</td><td>${ping.ping}</td><td>${ping.handL}</td><td>${ping.handR}</td><tr>`;
        })
        content.innerHTML = `<table>${dataBlue.join('')}${dataOrange.join('')}</table>`;
    });
})
