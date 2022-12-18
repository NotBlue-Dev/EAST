// eslint-disable-next-line no-undef
let socket = io();

window.addEventListener("load", () => {

    const imgA = document.getElementById('Blue');
    const TeamA = document.getElementById('BlueName');
    const imgB = document.getElementById('Orange');
    const bestOfID = document.getElementById('bestOf');
    const TeamB = document.getElementById('OrangeName');
    const timer = document.getElementById('timer');
    
    let vrml = false;
    let matchCountDown;

    const week = document.getElementById('week');

    // eslint-disable-next-line func-style
    const fill = function (arg) {
        if(arg.teams.length === 0) {
            vrml = false;
            return;
        } 
        vrml = true;
        

        let orange = arg.teams.home;
        let blue = arg.teams.away;

        if (arg.teams.home.color !== null && arg.teams.away.color !== null) { 
            if(arg.teams.home.color === 'blue') {
                blue = arg.teams.home;
                orange = arg.teams.away;
            } else {
                blue = arg.teams.away;
                orange = arg.teams.home;
            }
        }

        imgA.classList.remove('hide');
        imgB.classList.remove('hide');
        imgB.src = `https://vrmasterleague.com/${orange.logo}`;
        imgA.src = `https://vrmasterleague.com/${blue.logo}`;
        TeamA.innerHTML = orange.name;
        TeamB.innerHTML = blue.name;
    };

    socket.on('vrml.colorChanged' , (arg) => {
        fill(arg);
    });

    socket.on('game.ping', (arg) => {
        if(TeamA.innerHTML === "" && TeamB.innerHTML === "" && !vrml) {
            TeamA.innerHTML = arg.teamName[1];
            TeamB.innerHTML = arg.teamName[0];
        }

        if(arg.settings.settingsFound && bestOfID.innerHTML != arg.settings.bestOf) {
            bestOfID.innerHTML = arg.settings.bestOf;
        }

    });

    socket.on('vrml.hide', () => {
        vrml = false;
        imgA.classList.add('hide');
        imgB.classList.add('hide');
        TeamA.innerHTML = '';
        TeamB.innerHTML = '';
        try {clearInterval(matchCountDown);} catch {
            console.log('catch');
        }
        timer.innerHTML = '';
    });

    socket.on('game.teamChange', (arg) => {
        if(!vrml) {
            TeamA.innerHTML = arg.teams.teamName[1];
            TeamB.innerHTML = arg.teams.teamName[0];
        }
    });

    socket.on('vrml.matchDataLoaded', (arg) => {
        fill(arg);
        
        week.innerHTML = `VRML Week ${arg.week}`;
        
        try {clearInterval(matchCountDown);} catch {
            console.log('catch');
        }

        let date = new Date();
        let nextMatch = new Date(arg.time);
        let time = Math.round((nextMatch.getTime() - date.getTime()) / 1000);
        
        function timerFunc() {
            let hours = Math.floor(time / 3600);
            let restTime = time - (hours * 3600);
            let minutes = Math.floor(restTime / 60);
            let seconds = Math.round(restTime - (minutes * 60));
            time--;
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            
            if (hours > 0) {
                timer.innerHTML = `${hours}:${minutes}:${seconds}`;
            } else {
                timer.innerHTML = `${minutes}:${seconds}`;
            }
            if (time < 1) {
                // switch scene send event to obs
                clearInterval(matchCountDown);
            }
        }
        matchCountDown = setInterval(function() {timerFunc();}, 1000);
    });

    socket.emit('overlay.ready', { 'overlay': 'wait' });
});

