/* eslint-disable camelcase */
// eslint-disable-next-line no-undef
let socket = io();

function createOrange(playername) {
    // c'est pas claire mais ca a pas besoin de l'etre, ca crée juste l'element en html
    let container = document.getElementById('playersOrange');
    let e_8 = document.createElement("div");
    e_8.setAttribute("class", "player");
    let e_9 = document.createElement("div");
    e_9.setAttribute("class", "top-header O");
    e_9.setAttribute("id", `${playername}_BOX`);
    let e_10 = document.createElement("a");
    e_10.setAttribute("id", playername);
    e_10.appendChild(document.createTextNode(playername));
    e_9.appendChild(e_10);
    e_8.appendChild(e_9);
    let e_11 = document.createElement("div");
    e_11.setAttribute("class", "playercontent ");
    let e_12 = document.createElement("img");
    e_12.setAttribute("class", "poss hide");
    e_12.setAttribute("id", `${playername}_POSS`);
    e_12.setAttribute("src", "/assets/poss.png");
    e_11.appendChild(e_12);
    let e_13 = document.createElement("div");
    e_13.setAttribute("class", "data");
    let e_14 = document.createElement("div");
    e_14.setAttribute("class", "datas");
    let e_15 = document.createElement("div");
    e_15.setAttribute("class", "datarow");
    e_15.setAttribute("id", `${playername}_PTS`);
    let e_16 = document.createElement("a");
    e_16.appendChild(document.createTextNode(0));
    e_15.appendChild(e_16);
    e_14.appendChild(e_15);
    let e_17 = document.createElement("div");
    e_17.setAttribute("class", "datarow");
    e_17.setAttribute("id", `${playername}_ASS`);
    let e_18 = document.createElement("a");
    e_18.appendChild(document.createTextNode(0));
    e_17.appendChild(e_18);
    e_14.appendChild(e_17);
    let e_19 = document.createElement("div");
    e_19.setAttribute("class", "datarow");
    e_19.setAttribute("id", `${playername}_SAVE`);
    let e_20 = document.createElement("a");
    e_20.appendChild(document.createTextNode(0));
    e_19.appendChild(e_20);
    e_14.appendChild(e_19);
    let e_21 = document.createElement("div");
    e_21.setAttribute("class", "datarow");
    e_21.setAttribute("id", `${playername}_STN`);
    let e_22 = document.createElement("a");
    e_22.appendChild(document.createTextNode(0));
    e_21.appendChild(e_22);
    e_14.appendChild(e_21);
    e_13.appendChild(e_14);
    e_11.appendChild(e_13);
    e_8.appendChild(e_11);
    container.appendChild(e_8);
}

function createBlue(playername) {
    let container = document.getElementById('playersBlue');
    let e_0 = document.createElement("div");
    e_0.setAttribute("class", "player");
    let e_1 = document.createElement("div");
    e_1.setAttribute("class", "top-header topB B");
    e_1.setAttribute("id", `${playername}_BOX`);
    let e_2 = document.createElement("a");
    e_2.setAttribute("id", playername);
    e_2.appendChild(document.createTextNode(playername));
    e_1.appendChild(e_2);
    e_0.appendChild(e_1);
    let e_3 = document.createElement("div");
    e_3.setAttribute("class", "playercontent");
    let e_4 = document.createElement("img");
    e_4.setAttribute("class", "poss hide possB");
    e_4.setAttribute("id", `${playername}_POSS`);
    e_4.setAttribute("src", "/assets/poss.png");
    e_3.appendChild(e_4);
    let e_5 = document.createElement("div");
    e_5.setAttribute("class", "data dataB");
    let e_6 = document.createElement("div");
    e_6.setAttribute("class", "datas");
    let e_7 = document.createElement("div");
    e_7.setAttribute("class", "datarow");
    e_7.setAttribute("id", `${playername}_PTS`);
    let e_8 = document.createElement("a");
    e_8.appendChild(document.createTextNode(0));
    e_7.appendChild(e_8);
    e_6.appendChild(e_7);
    let e_9 = document.createElement("div");
    e_9.setAttribute("class", "datarow");
    e_9.setAttribute("id", `${playername}_ASS`);
    let e_10 = document.createElement("a");
    e_10.appendChild(document.createTextNode(0));
    e_9.appendChild(e_10);
    e_6.appendChild(e_9);
    let e_11 = document.createElement("div");
    e_11.setAttribute("class", "datarow");
    e_11.setAttribute("id", `${playername}_SAVE`);
    let e_12 = document.createElement("a");
    e_12.appendChild(document.createTextNode(0));
    e_11.appendChild(e_12);
    e_6.appendChild(e_11);
    let e_13 = document.createElement("div");
    e_13.setAttribute("class", "datarow");
    e_13.setAttribute("id", `${playername}_STN`);
    let e_14 = document.createElement("a");
    e_14.appendChild(document.createTextNode(0));
    e_13.appendChild(e_14);
    e_6.appendChild(e_13);
    e_5.appendChild(e_6);
    e_3.appendChild(e_5);
    e_0.appendChild(e_3);
    container.appendChild(e_0);
}

window.addEventListener("load", () => {

    const blue = document.getElementById('playersBlue');

    const orange = document.getElementById('playersOrange');

    socket.on('game.teamChange', (arg) => {
        while (orange.firstChild) {
            orange.removeChild(orange.firstChild);
        }
        while (blue.firstChild) {
            blue.removeChild(blue.firstChild);
        }

        let or = arg.teams.orange;
        for(let x = 0; x < or.length; x++) {
            createOrange(or[x]);
        }

        let bl = arg.teams.blue;
        for(let i = 0; i < bl.length; i++) {
            createBlue(bl[i]);
        }
    });


    socket.on('game.scoreBoard', (arg) => {
        if (document.getElementById('playersBlue').childElementCount === 0) {
            let bl = arg.blue;
            for(let i = 0; i < bl.length; i++) {
                createBlue(bl[i].name);
            }
        }

        if (document.getElementById('playersOrange').childElementCount === 0) {
            let or = arg.orange;
            for(let x = 0; x < or.length; x++) {
                createOrange(or[x].name);
            }
        }
        
        for(let i = 0; i < arg.orange.length; i++) {
            let ass = document.getElementById(`${arg.orange[i].name}_ASS`);
            let pts = document.getElementById(`${arg.orange[i].name}_PTS`);
            let save = document.getElementById(`${arg.orange[i].name}_SAVE`);
            let stn = document.getElementById(`${arg.orange[i].name}_STN`);
            ass.innerHTML = arg.orange[i].stats.assists;
            pts.innerHTML = arg.orange[i].stats.points;
            save.innerHTML = arg.orange[i].stats.saves;
            stn.innerHTML = arg.orange[i].stats.stuns;
            
            let box = document.getElementById(`${arg.orange[i].name}_BOX`);
            if(arg.orange[i].stunned) {
                
                box.classList.add('stunO');
            } else {
                box.classList.remove('stunO');
            }
        }

        for(let i = 0; i < arg.blue.length; i++) {
            let ass = document.getElementById(`${arg.blue[i].name}_ASS`);
            let pts = document.getElementById(`${arg.blue[i].name}_PTS`);
            let save = document.getElementById(`${arg.blue[i].name}_SAVE`);
            let stn = document.getElementById(`${arg.blue[i].name}_STN`);
            ass.innerHTML = arg.blue[i].stats.assists;
            pts.innerHTML = arg.blue[i].stats.points;
            save.innerHTML = arg.blue[i].stats.saves;
            stn.innerHTML = arg.blue[i].stats.stuns;

            let box = document.getElementById(`${arg.blue[i].name}_BOX`);
            if(arg.blue[i].stunned) {
                
                box.classList.add('stunB');
            } else {
                box.classList.remove('stunB');
            }
        }
    });

    socket.on('frontEnd.reset', () => {
        while (orange.firstChild) {
            orange.removeChild(orange.firstChild);
        }
        while (blue.firstChild) {
            blue.removeChild(blue.firstChild);
        }
    });

    socket.on('game.possessionChange', (arg) => {
        let box = document.getElementById(`${arg.possession.player}_BOX`);
        let poss = document.getElementById(`${arg.possession.player}_POSS`);
        let elem = document.getElementsByClassName('show');
        let elemBox = document.getElementsByClassName('showBox');
        if(elem.length !== 0) {
            for(let i = 0; i < elem.length; i++) {
                elem[i].classList.add('hide');
                elem[i].classList.remove('show');
            }
        }
        if(elemBox.length !== 0) {
            for(let i = 0; i < elemBox.length; i++) {
                elemBox[i].classList.remove('holdB');
                elemBox[i].classList.remove('holdO');
            }
        }
        if(arg.possession.team === "BLUE TEAM") {
            box.classList.add("holdB");
        } else {
            box.classList.add("holdO");
        }
        poss.classList.remove("hide");
        poss.classList.add('show');
        box.classList.add('showBox');
    });  

    socket.emit('overlay.ready', {
        'overlay': 'possession'
    });
});
