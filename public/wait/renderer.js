let socket = io();

window.addEventListener("DOMContentLoaded", (event) => {
    const imgA = document.getElementById('teamAWait')

    const imgB = document.getElementById('teamBWait')

    const timer = document.getElementById('timerWait')

    const week = document.getElementById('weekWait')
    
    socket.on('countDownTimer', (arg) => {
        timer.innerHTML = `${arg.m}:${arg.s}`
    })
    
    socket.on('week', (arg) => {
        week.innerHTML = arg
    })
    
    socket.on('teams-data', (arg) => {
        console.log(arg)
        imgA.src = `https://vrmasterleague.com/${arg[0].logo}`
        imgB.src = `https://vrmasterleague.com/${arg[1].logo}`
    });
    
    socket.emit('get-teams-data')
    
    socket.emit('get-week')

});

