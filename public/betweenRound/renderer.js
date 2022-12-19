// eslint-disable-next-line no-undef
let socket = io();

window.addEventListener("load", () => {
    const imgA = document.getElementById('LogoA');
    let vrml = false;
    const imgB = document.getElementById('LogoB');
    const bestOfID = document.getElementById('bestOf');
    const nameA = document.getElementById('nameA');

    const nameB = document.getElementById('nameB');  
    
    const teamPlayerA = document.getElementById('playersOrange');

    const teamPlayerB = document.getElementById('playersBlue');

    const fill = (arg) => {
        const season = document.getElementById('season');
        season.innerHTML =  `SEASON ${arg.season}`;
        if(arg.teams.length === 0) {
            vrml = false;
            return;
        } 
        vrml = true;

        let orange = arg.teams.home;
        let blue = arg.teams.away;

        if (orange.color !== null && blue.color !== null && orange.color !== undefined && blue.color !== undefined) {
            if(arg.teams.home.color === 'blue') {
                blue = arg.teams.home;
                orange = arg.teams.away;
            } else {
                blue = arg.teams.away;
                orange = arg.teams.home;
            }
        }

        nameB.innerHTML = orange.name;
        nameA.innerHTML = blue.name;
        imgA.classList.remove('hide');
        imgB.classList.remove('hide');
        imgA.src = `https://vrmasterleague.com/${blue.logo}`;
        imgB.src = `https://vrmasterleague.com/${orange.logo}`;
    };

    const clear = () => {
        while (teamPlayerA.firstChild) {
            teamPlayerA.removeChild(teamPlayerA.firstChild);
        }
        while (teamPlayerB.firstChild) {
            teamPlayerB.removeChild(teamPlayerB.firstChild);
        }
    };

    const fillRound = (arg) => { 
        arg.forEach(round => {
            if(round.winner === 'orange') {
                let r = document.getElementById(`R${round.currentRound}O`);
                r.classList.add('winO');
                let rB = document.getElementById(`R${round.currentRound}B`);
                rB.classList.add('looseB');
            } else {
                let r = document.getElementById(`R${round.currentRound}B`);
                r.classList.add('winB');
                let rB = document.getElementById(`R${round.currentRound}O`);
                rB.classList.add('looseO');
            }
            document.getElementById(`R${round.currentRound}O_SCORE`).innerHTML = round.orange;
            document.getElementById(`R${round.currentRound}B_SCORE`).innerHTML = round.blue;
        }); 
    };

    function createRound(bestOf) {
        const top = document.getElementById('top');
        const bottom = document.getElementById('bottom');

        // clear before

        while (top.firstChild) {
            top.removeChild(top.firstChild);
        }
        while (bottom.firstChild) {
            bottom.removeChild(bottom.firstChild);
        }

        if(bestOf >= 5) {
            document.getElementById('scores').style.left = '68.5vw';
        } else {
            document.getElementById('scores').style.left = '73.5vw';
        }

        if(bestOf == 1) {
            top.style.justifyContent = 'center';
            bottom.style.justifyContent = 'center';
        }

        for(let i = 1; i <= bestOf; i++) {
            const divB = document.createElement('div');
            divB.id = `R${i}B`;
            divB.classList.add('RoundB');
            const aB = document.createElement('a');
            aB.id = `R${i}B_SCORE`;
            aB.innerHTML = `R${i}`;
            divB.appendChild(aB);
            top.appendChild(divB);

            const divO = document.createElement('div');
            divO.id = `R${i}O`;
            divO.classList.add('RoundO');
            const aO = document.createElement('a');
            aO.id = `R${i}O_SCORE`;
            aO.innerHTML = `R${i}`;
            divO.appendChild(aO);
            bottom.appendChild(divO);
        }
        bestOfID.innerHTML = bestOf;
    }

    socket.on('game.roundOver', (arg) => {  
        fillRound(arg.rounds);
        console.log("RoundOver : ");
        console.log(arg);
    });

    socket.on('roundData', (arg) => {
        fillRound(arg);
        console.log("RoundData : " + arg);
    });
    
    socket.on('vrml.hide', () => {
        vrml = false;
        imgA.classList.add('hide');
        imgB.classList.add('hide');
        nameA.innerHTML = '';
        nameB.innerHTML = '';

    });  

    const mixed = (arg) => {
        nameA.innerHTML = arg.teamName[1];
        nameB.innerHTML = arg.teamName[0];
        imgA.classList.add('hide');
        imgB.classList.add('hide');
    };

        
    function createOrange(playername) {
        let container = document.getElementById('playersOrange');
        let e0 = document.createElement("div");
        let e1 = document.createElement("div");
        e1.setAttribute("class", "rowO");
        let e15 = document.createElement("div");
        e15.setAttribute("class", "nameo");
        e15.appendChild(document.createTextNode(playername));
        e1.appendChild(e15);
        let e2 = document.createElement("div");
        e2.setAttribute("class", "data");
        let e3 = document.createElement("div");
        e3.setAttribute("class", "dat");
        e3.setAttribute("id", `${playername}_PTS`);
        let e4 = document.createElement("a");
        e4.appendChild(document.createTextNode(0));
        e3.appendChild(e4);
        e2.appendChild(e3);
        let e5 = document.createElement("div");
        e5.setAttribute("class", "dat");
        e5.setAttribute("id", `${playername}_ASS`);
        let e6 = document.createElement("a");
        e6.appendChild(document.createTextNode(0));
        e5.appendChild(e6);
        e2.appendChild(e5);
        let e7 = document.createElement("div");
        e7.setAttribute("class", "dat");
        e7.setAttribute("id", `${playername}_SAV`);
        let e8 = document.createElement("a");
        e8.appendChild(document.createTextNode(0));
        e7.appendChild(e8);
        e2.appendChild(e7);
        let e9 = document.createElement("div");
        e9.setAttribute("class", "dat");
        e9.setAttribute("id", `${playername}_STN`);
        let e10 = document.createElement("a");
        e10.appendChild(document.createTextNode(0));
        e9.appendChild(e10);
        e2.appendChild(e9);
        let e11 = document.createElement("div");
        e11.setAttribute("class", "dat");
        e11.setAttribute("id", `${playername}_POS`);
        let e12 = document.createElement("a");
        e12.appendChild(document.createTextNode(0));
        e11.appendChild(e12);
        e2.appendChild(e11);
        let e13 = document.createElement("div");
        e13.setAttribute("class", "dat");
        e13.setAttribute("id", `${playername}_ATT`);
        let e14 = document.createElement("a");
        e14.appendChild(document.createTextNode(0));
        e13.appendChild(e14);
        e2.appendChild(e13);
        e1.appendChild(e2);
        e0.appendChild(e1);
        container.appendChild(e0);
    }

    function createBlue(playername) {
        let container = document.getElementById('playersBlue');
        let e0 = document.createElement("div");
        let e1 = document.createElement("div");
        e1.setAttribute("class", "rowB");
        let e2 = document.createElement("div");
        e2.setAttribute("class", "data datab");
        let e3 = document.createElement("div");
        e3.setAttribute("class", "dat");
        e3.setAttribute("id", `${playername}_PTS`);
        let e4 = document.createElement("a");
        e4.appendChild(document.createTextNode(0));
        e3.appendChild(e4);
        e2.appendChild(e3);
        let e5 = document.createElement("div");
        e5.setAttribute("class", "dat");
        e5.setAttribute("id", `${playername}_ASS`);
        let e6 = document.createElement("a");
        e6.appendChild(document.createTextNode(0));
        e5.appendChild(e6);
        e2.appendChild(e5);
        let e7 = document.createElement("div");
        e7.setAttribute("class", "dat");
        e7.setAttribute("id", `${playername}_SAV`);
        let e8 = document.createElement("a");
        e8.appendChild(document.createTextNode(0));
        e7.appendChild(e8);
        e2.appendChild(e7);
        let e9 = document.createElement("div");
        e9.setAttribute("class", "dat");
        e9.setAttribute("id", `${playername}_STN`);
        let e10 = document.createElement("a");
        e10.appendChild(document.createTextNode(0));
        e9.appendChild(e10);
        e2.appendChild(e9);
        let e11 = document.createElement("div");
        e11.setAttribute("class", "dat");
        e11.setAttribute("id", `${playername}_POS`);
        let e12 = document.createElement("a");
        e12.appendChild(document.createTextNode(0));
        e11.appendChild(e12);
        e2.appendChild(e11);
        let e13 = document.createElement("div");
        e13.setAttribute("class", "dat");
        e13.setAttribute("id", `${playername}_ATT`);
        let e14 = document.createElement("a");
        e14.appendChild(document.createTextNode(0));
        e13.appendChild(e14);
        e2.appendChild(e13);
        e1.appendChild(e2);
        let e15 = document.createElement("div");
        e15.setAttribute("class", "name");
        e15.appendChild(document.createTextNode(playername));
        e1.appendChild(e15);
        e0.appendChild(e1);
        container.appendChild(e0);
    }

    socket.on('fontEnd.reset', () => {
        nameA.innerHTML = "";
        nameB.innerHTML = "";
        clear();
    });

    socket.on('game.ping', (arg) => {
        if(nameA.innerHTML === "" && nameB.innerHTML === "" && !vrml) {
            mixed(arg);

            clear();
    
            arg.pings.blue.forEach(player => {
                createBlue(player.name);
            });
    
            arg.pings.orange.forEach(player => {
                createOrange(player.name);
            });
        }

        if(arg.settings.settingsFound && bestOfID.innerHTML != arg.settings.bestOf) {
            createRound(arg.settings.bestOf);
        }
    });

    socket.on('game.teamChange', (arg) => {
        if(!vrml) {
            mixed(arg);
        }

        clear();

        arg.teams.blue.forEach(player => {
            createBlue(player);
        });

        arg.teams.orange.forEach(player => {
            createOrange(player);
        });
    });


    socket.on('vrml.colorChanged', fill);

    socket.on('vrml.matchDataLoaded', fill);
    
    socket.on('game.scoreBoard', (arg) => {
        if(document.getElementById('playersOrange').childElementCount === 0) {
            arg.orange.forEach(player => {
                createOrange(player.name);
            });
        }

        if(document.getElementById('playersBlue').childElementCount === 0) {
            arg.blue.forEach(player => {
                createBlue(player.name);
            });
        }
        
        arg.blue.forEach(player => {
            let pts = document.getElementById(`${player.name}_PTS`);
            pts.innerHTML = player.stats.points;
            let ass = document.getElementById(`${player.name}_ASS`);
            ass.innerHTML = player.stats.assists;
            let sav = document.getElementById(`${player.name}_SAV`);
            sav.innerHTML = player.stats.saves;
            let stn = document.getElementById(`${player.name}_STN`);
            stn.innerHTML = player.stats.stuns;
            let att = document.getElementById(`${player.name}_ATT`);
            att.innerHTML = player.stats.possession_time;
            let pos = document.getElementById(`${player.name}_POS`);
            pos.innerHTML = player.stats.steals;
        });

        arg.orange.forEach(player => {
            let pts = document.getElementById(`${player.name}_PTS`);
            pts.innerHTML = player.stats.points;
            let ass = document.getElementById(`${player.name}_ASS`);
            ass.innerHTML = player.stats.assists;
            let sav = document.getElementById(`${player.name}_SAV`);
            sav.innerHTML = player.stats.saves;
            let stn = document.getElementById(`${player.name}_STN`);
            stn.innerHTML = player.stats.stuns;
            let att = document.getElementById(`${player.name}_ATT`);
            att.innerHTML = player.stats.possession_time;
            let pos = document.getElementById(`${player.name}_POS`);
            pos.innerHTML = player.stats.steals;
        });
    });

    socket.emit('overlay.ready', {
        'overlay': 'betweenRound'
    });
});
