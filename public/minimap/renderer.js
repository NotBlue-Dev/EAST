/* eslint-disable no-mixed-operators */

// eslint-disable-next-line no-undef
let socket = io();

// Most of the code on this page is made by NTSFranz who made Spark
window.addEventListener('load', function() {
    const disc = document.getElementById("disc");
    const players = document.getElementsByClassName('player');

    function setPos(elem, x, z) {
        elem.style.left = (-z / 80 + 0.5) * 427 + 68 + "px";
        elem.style.top = (x / 32 + 0.5) * 165 + 5 + "px";
    }    

    function removePlayer(arg) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === arg) {
                players[i].remove();
            }
        }
    }
    
    function createPlayer(arg) {
        const player = document.createElement('div');
        player.classList.add('player');
        player.classList.add(arg.team);
        player.id = arg.name;
        player.classList.add('positionable_element');
        let text = arg.number;
        if (text < 10) {
            text = "0" + text;
        }

        player.innerHTML = `<div></div><p class="player_number">${text}</p>`;
        player.style.left = 0;
        player.style.top = 0;
        let container = document.getElementById('content');
        container.insertBefore(player, container.firstChild);
    }
    
    function createPlayers(team, color) {
        if (players.length === 0) {
            for (let i = 0; i < team.length; i++) {
                createPlayer({
                    name: team[i].name,
                    number: team[i].nb,
                    team: color
                });
            }
            return;
        }
        for (let j = 0; j < team.length; j++) {
            const player = team[j];
            const id = [...players].map(e => e.id);
    
            if (players.length > 0 && id.indexOf(player.name) === -1) {
                createPlayer({
                    name: player.name,
                    number: player.nb,
                    team: color
                });
            } else {
                setPos(players[id.indexOf(player.name)], player.position[0], player.position[1]);
            }
        }
    }

    socket.on('game.minimap', (arg) => {
        console.log(arg.blue, arg.orange);
        // if a player miss it will be created
        createPlayers(arg.orange, 'orange');
        createPlayers(arg.blue, 'blue');

        // if a player is not in the game anymore it will be removed
        for (let i = 0; i < players.length; i++) {           
            const player = players[i];
            const id = [...arg.orange, ...arg.blue].map(e => e.name);
            if (id.indexOf(player.id) === -1) {
                removePlayer(player.id);
            }
        }

        setPos(disc, arg.disc[0], arg.disc[1]); 
    });

    socket.emit('overlay.ready', {
        'overlay': 'minimap'
    });
});
