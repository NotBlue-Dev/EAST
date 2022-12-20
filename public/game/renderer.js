// eslint-disable-next-line no-undef
let socket = io();

window.addEventListener("load", () => {
    const imgA = document.getElementById('logoA');
    let vrml = false;
    const imgB = document.getElementById('logoB');
    const bestOfID = document.getElementById('bestOf');
    const scoreA = document.getElementById('scoreA');
    const scoreB = document.getElementById('scoreB');
    const nameA = document.getElementById('teamA');
    const nameB = document.getElementById('teamB');

    const fill = (arg) => {
        if(arg.teams === null || arg.teams.length === 0) {
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

        nameA.innerHTML = blue.name;
        nameB.innerHTML = orange.name;
        imgA.classList.remove('hide');
        imgB.classList.remove('hide');
        imgA.src = `https://vrmasterleague.com/${blue.logo}`;
        imgB.src = `https://vrmasterleague.com/${orange.logo}`;
    };

    socket.on('vrml.colorChanged', fill);
    socket.on('vrml.matchDataLoaded', fill);
    
    socket.on('game.updateScore', (arg) => {
        if(arg.blue !== undefined && arg.orange !== undefined) {
            scoreB.innerHTML = arg.blue;
            scoreA.innerHTML = arg.orange;
        }
    });

    socket.on('game.scoreChanged', (arg) => {
        scoreB.innerHTML = arg.blue;
        scoreA.innerHTML = arg.orange;
    });

    const mixed = (arg) => {
        nameA.innerHTML = arg.teamName[1];
        nameB.innerHTML = arg.teamName[0];
        imgA.classList.add('hide');
        imgB.classList.add('hide');
    };


    function createRoundBar(bestOf) {
        //clear element with class round
        let round = document.getElementsByClassName('round');
        while(round.length > 0) {
            round[0].parentNode.removeChild(round[0]);
        }

        let orange = document.getElementById('orange');
        let blue = document.getElementById('blue');

        for(let i = Math.ceil(bestOf / 2); i > 0; i--) {
            let orangeRound = document.createElement('div');
            orangeRound.id = `OrangeR${i}`;
            orangeRound.classList.add('round');
            orangeRound.classList.add('tbdO');

            let blueRound = document.createElement('div');
            blueRound.id = `BlueR${i}`;
            blueRound.classList.add('round');
            blueRound.classList.add('tbdB');

            if(i == 1) {
                orangeRound.style.marginRight = '9.8vw';
            } else {
                orangeRound.style.marginRight = '0.6vw';
            }
            blueRound.style.marginLeft = '0.6vw';

            orange.insertAdjacentElement('beforebegin', orangeRound);
            blue.insertAdjacentElement('beforebegin', blueRound);

        }

        bestOfID.innerHTML = bestOf;
        
    }

    let args = null;

    socket.on('game.ping', (arg) => {
        if(nameA.innerHTML === "" && nameB.innerHTML === "" && !vrml) {
            mixed(arg);
        }

        if(arg.settings.settingsFound && bestOfID.innerHTML != arg.settings.bestOf) {
            createRoundBar(arg.settings.bestOf);
        }
        if(scoreA.innerHTML != arg.scores.orange || scoreB.innerHTML != arg.scores.blue) {
            scoreA.innerHTML = arg.scores.orange;
            scoreB.innerHTML = arg.scores.blue;
        }

        args = arg;
    });

    socket.on('updateNames', (arg) => {
        if(!vrml) {
            nameA.innerHTML = arg.orange;
            nameB.innerHTML = arg.blue;
        }
    });

    socket.on('frontEnd.reset', () => {
        nameA.innerHTML = "";
        nameB.innerHTML = "";
        if(args !== null && args.settings.settingsFound) {
            createRoundBar(args.settings.bestOf);
        }
    });

    socket.on('vrml.hide', () => {
        vrml = false;
        imgA.classList.add('hide');
        imgB.classList.add('hide');
        nameA.innerHTML = '';
        nameB.innerHTML = '';
    });  

    socket.on('game.teamChange', (arg) => {
        if(!vrml) {
            mixed(arg);
        }
    });

    socket.on('game.roundTime', (arg) => {
        let split = arg.time.split('.');
        document.getElementById('ms').innerHTML = `.${split[1]}`;
        document.getElementById('minutes').innerHTML = `${split[0]}`;
    });

    socket.on('game.roundOver', (arg) => {
        if(arg.winner !== null) {
            if(arg.winner === 'orange') {
                let current = document.getElementById(`OrangeR${arg.rounds[arg.rounds.length - 1].currentRound}`);
                current.classList.add('winO');
                current.classList.remove('tbdO');
            } else {
                let current = document.getElementById(`BlueR${arg.rounds[arg.rounds.length - 1].currentRound}`);
                current.classList.add('winB');
                current.classList.remove('tbdB');
            }
        }
    });

    socket.emit('overlay.ready', {
        'overlay': 'game'
    });
});
