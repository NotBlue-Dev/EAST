let socket = io();

window.addEventListener("load", (event) => {
    const imgA = document.getElementById('LogoA')
    let vrml = false
    const imgB = document.getElementById('LogoB')

    const nameA = document.getElementById('nameA')

    const nameB = document.getElementById('nameB')  
    
    const teamPlayerA = document.getElementById('playersOrange')

    const teamPlayerB = document.getElementById('playersBlue')

    const fill = (arg) => {
        const season = document.getElementById('season')
        season.innerHTML =  `SEASON ${arg.season}`
        if(arg.teams.length === 0) {
            vrml = false
            return
        } else {
            vrml = true
        }

        orange = arg.teams.home
        blue = arg.teams.away
        
        

        if (orange.color !== null && blue.color !== null && orange.color !== undefined && blue.color !== undefined) {
            if(arg.teams.home.color === 'blue') {
                blue = arg.teams.home
                orange = arg.teams.away
            } else {
                blue = arg.teams.away
                orange = arg.teams.home
            }
        }

        nameB.innerHTML = orange.name
        nameA.innerHTML = blue.name
        imgA.classList.remove('hide')
        imgB.classList.remove('hide')
        imgA.src = `https://vrmasterleague.com/${blue.logo}`
        imgB.src = `https://vrmasterleague.com/${orange.logo}`
    }



    socket.on('game.roundOver', (arg) => {  
        arg.rounds.forEach(round => {
            if(round.winner === 'orange') {
                let r = document.getElementById(`R${round.currentRound}O`)
                r.classList.add('winO')
                let rB = document.getElementById(`R${round.currentRound}B`)
                rB.classList.add('looseB')
            } else {
                let r = document.getElementById(`R${round.currentRound}B`)
                r.classList.add('winB')
                let rB = document.getElementById(`R${round.currentRound}O`)
                rB.classList.add('looseO')
            }
            document.getElementById(`R${round.currentRound}O_SCORE`).innerHTML = round.orange
            document.getElementById(`R${round.currentRound}B_SCORE`).innerHTML = round.blue
        });
          
    })

    socket.on('game.teamChange', (arg) => {
        if(!vrml) {
            nameA.innerHTML = "ORANGE"
            nameB.innerHTML = "BLUE"
            imgA.classList.add('hide')
            imgB.classList.add('hide')
        }

        while (teamPlayerA.firstChild) {
            teamPlayerA.removeChild(teamPlayerA.firstChild);
        }
        while (teamPlayerB.firstChild) {
            teamPlayerB.removeChild(teamPlayerB.firstChild);
        }

        arg.teams.blue.forEach(player => {
            createBlue(player)
        });

        arg.teams.orange.forEach(player => {
            createOrange(player)
        });
    });


    socket.on('vrml.colorChanged', fill)

    socket.on('vrml.matchDataLoaded', fill)
    
    socket.on('game.scoreBoard', (arg) => {
        arg.blue.forEach(player => {
            let pts = document.getElementById(`${player.name}_PTS`)
            pts.innerHTML = player.stats.points
            let ass = document.getElementById(`${player.name}_ASS`)
            ass.innerHTML = player.stats.assists
            let sav = document.getElementById(`${player.name}_SAV`)
            sav.innerHTML = player.stats.saves
            let stn = document.getElementById(`${player.name}_STN`)
            stn.innerHTML = player.stats.stuns
            let att = document.getElementById(`${player.name}_ATT`)
            att.innerHTML = player.stats.possession_time
            let pos = document.getElementById(`${player.name}_POS`)
            pos.innerHTML = player.stats.steals
        });

        arg.orange.forEach(player => {
            let pts = document.getElementById(`${player.name}_PTS`)
            pts.innerHTML = player.stats.points
            let ass = document.getElementById(`${player.name}_ASS`)
            ass.innerHTML = player.stats.assists
            let sav = document.getElementById(`${player.name}_SAV`)
            sav.innerHTML = player.stats.saves
            let stn = document.getElementById(`${player.name}_STN`)
            stn.innerHTML = player.stats.stuns
            let att = document.getElementById(`${player.name}_ATT`)
            att.innerHTML = player.stats.possession_time
            let pos = document.getElementById(`${player.name}_POS`)
            pos.innerHTML = player.stats.steals
        });
    })

    socket.emit('overlay.ready', {'overlay': 'betweenRound'})
});

function createOrange(playername) {
    let container = document.getElementById('playersOrange')
    let e_0 = document.createElement("div");
    let e_1 = document.createElement("div");
    e_1.setAttribute("class", "rowO");
    let e_15 = document.createElement("div");
    e_15.setAttribute("class", "nameo");
    e_15.appendChild(document.createTextNode(playername));
    e_1.appendChild(e_15);
    let e_2 = document.createElement("div");
    e_2.setAttribute("class", "data");
    let e_3 = document.createElement("div");
    e_3.setAttribute("class", "dat");
    e_3.setAttribute("id", `${playername}_PTS`);
    let e_4 = document.createElement("a");
    e_4.appendChild(document.createTextNode(0));
    e_3.appendChild(e_4);
    e_2.appendChild(e_3);
    let e_5 = document.createElement("div");
    e_5.setAttribute("class", "dat");
    e_5.setAttribute("id", `${playername}_ASS`);
    let e_6 = document.createElement("a");
    e_6.appendChild(document.createTextNode(0));
    e_5.appendChild(e_6);
    e_2.appendChild(e_5);
    let e_7 = document.createElement("div");
    e_7.setAttribute("class", "dat");
    e_7.setAttribute("id", `${playername}_SAV`);
    let e_8 = document.createElement("a");
    e_8.appendChild(document.createTextNode(0));
    e_7.appendChild(e_8);
    e_2.appendChild(e_7);
    let e_9 = document.createElement("div");
    e_9.setAttribute("class", "dat");
    e_9.setAttribute("id", `${playername}_STN`);
    let e_10 = document.createElement("a");
    e_10.appendChild(document.createTextNode(0));
    e_9.appendChild(e_10);
    e_2.appendChild(e_9);
    let e_11 = document.createElement("div");
    e_11.setAttribute("class", "dat");
    e_11.setAttribute("id", `${playername}_POS`);
    let e_12 = document.createElement("a");
    e_12.appendChild(document.createTextNode(0));
    e_11.appendChild(e_12);
    e_2.appendChild(e_11);
    let e_13 = document.createElement("div");
    e_13.setAttribute("class", "dat");
    e_13.setAttribute("id", `${playername}_ATT`);
    let e_14 = document.createElement("a");
    e_14.appendChild(document.createTextNode(0));
    e_13.appendChild(e_14);
    e_2.appendChild(e_13);
    e_1.appendChild(e_2);
    e_0.appendChild(e_1);
    container.appendChild(e_0);
}

function createBlue(playername) {
    let container = document.getElementById('playersBlue')
    let e_0 = document.createElement("div");
    let e_1 = document.createElement("div");
    e_1.setAttribute("class", "rowB");
    let e_2 = document.createElement("div");
    e_2.setAttribute("class", "data datab");
    let e_3 = document.createElement("div");
    e_3.setAttribute("class", "dat");
    e_3.setAttribute("id", `${playername}_PTS`);
    let e_4 = document.createElement("a");
    e_4.appendChild(document.createTextNode(0));
    e_3.appendChild(e_4);
    e_2.appendChild(e_3);
    let e_5 = document.createElement("div");
    e_5.setAttribute("class", "dat");
    e_5.setAttribute("id", `${playername}_ASS`);
    let e_6 = document.createElement("a");
    e_6.appendChild(document.createTextNode(0));
    e_5.appendChild(e_6);
    e_2.appendChild(e_5);
    let e_7 = document.createElement("div");
    e_7.setAttribute("class", "dat");
    e_7.setAttribute("id", `${playername}_SAV`);
    let e_8 = document.createElement("a");
    e_8.appendChild(document.createTextNode(0));
    e_7.appendChild(e_8);
    e_2.appendChild(e_7);
    let e_9 = document.createElement("div");
    e_9.setAttribute("class", "dat");
    e_9.setAttribute("id", `${playername}_STN`);
    let e_10 = document.createElement("a");
    e_10.appendChild(document.createTextNode(0));
    e_9.appendChild(e_10);
    e_2.appendChild(e_9);
    let e_11 = document.createElement("div");
    e_11.setAttribute("class", "dat");
    e_11.setAttribute("id", `${playername}_POS`);
    let e_12 = document.createElement("a");
    e_12.appendChild(document.createTextNode(0));
    e_11.appendChild(e_12);
    e_2.appendChild(e_11);
    let e_13 = document.createElement("div");
    e_13.setAttribute("class", "dat");
    e_13.setAttribute("id", `${playername}_ATT`);
    let e_14 = document.createElement("a");
    e_14.appendChild(document.createTextNode(0));
    e_13.appendChild(e_14);
    e_2.appendChild(e_13);
    e_1.appendChild(e_2);
    let e_15 = document.createElement("div");
    e_15.setAttribute("class", "name");
    e_15.appendChild(document.createTextNode(playername));
    e_1.appendChild(e_15);
    e_0.appendChild(e_1);
    container.appendChild(e_0);
}

