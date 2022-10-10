const { ipcRenderer } = require('electron');
let events;
let initAuto = false;

const initAutoStream = (document) => {
  ipcRenderer.on('echoArena.eventsLoaded', (event, data) => {
    if(!initAuto) {
      const main = document.getElementById('main-scene');
      const wait = document.getElementById('wait-scene');
      const autostream = document.getElementById('autostream');
      const launch = document.getElementById('launch-time');
      const start = document.getElementById('start-scene[0]');
      const end = document.getElementById('end-scene[0]');
      const delay = document.getElementById('end-duration[0]');
      const durEnd = document.getElementById('delay-after-end-game');
      const event = document.getElementById('event[0]');
      const delayEvent = document.getElementById('delay[0]');
      const scene = document.getElementById('scene[0]');
      const dur = document.getElementById('duration[0]');
      const state = document.getElementById('event');
      const between = document.getElementById('between-scene[0]');
      const clips = document.getElementById('clips');
      const buffer = document.getElementById('buffer');

        data.events.map((eventName) => {    
          const opt = document.createElement('option');
          opt.value = eventName;
          opt.innerHTML = eventName;
          event.appendChild(opt);
          return 0;
        });

      const sendAuto = () => {
        ipcRenderer.send('scenes.autoStart', {
          main: main.value,
          wait: wait.value,
          auto:autostream.checked,
          time: launch.value
        });
      };

      const sendStart = () => {
        ipcRenderer.send('scenes.start', {
          scene: start.value,
          between:between.value
        });
      };

      const sendEnd = () => {
        ipcRenderer.send('scenes.end', {
          ending: {
            scene:end.value, 
            duration:delay.value
          },
          delay: durEnd.value,
        });
      };

      const sendEvent = () => {
        events = events.filter(function( obj ) {
          return obj.event !== event.value;
        });

        let obj = {
          event:event.value,
          delay:delayEvent.value, 
          scene:scene.value, 
          duration:dur.value, 
          used:state.checked, 
          canClip:false
        };
        if(clips.style.display == 'block') {
          obj = {
            event:event.value,
            delay:delayEvent.value, 
            scene:scene.value, 
            duration:dur.value, 
            used:state.checked, 
            canClip:true, 
            clip:buffer.checked
          };
        } 

        events.push(obj);

        ipcRenderer.send('scenes.events', {
          events:events
        });
      };

      const switchEvent = (event) => {
        let data = events.find(element => element.event === event);
        if (data.canClip) {
          clips.style.display = 'block';
          buffer.checked = data.clip;
        } else {
          clips.style.display = 'none';
          buffer.checked = false;
        }
        state.checked = data.used;
        dur.value = data.duration;
        scene.value = data.scene;
        delayEvent.value = data.delay;
      };

      buffer.addEventListener('change',sendEvent);
      event.addEventListener('change', (event) => {
        switchEvent(event.target.value);
      });
      between.addEventListener('change',sendStart);
      state.addEventListener('change', sendEvent);
      dur.oninput = () => {sendEvent();};
      delayEvent.oninput = () => {sendEvent();};
      scene.addEventListener('change', sendEvent);
      event.addEventListener('change', sendEvent);
      end.addEventListener('change', sendEnd);
      durEnd.oninput = () => {sendEnd();};
      delay.oninput = () => {sendEnd();};
      start.addEventListener('change', sendStart);
      main.addEventListener('change', sendAuto);
      wait.addEventListener('change', sendAuto);
      launch.oninput = () => {sendAuto();};
      autostream.addEventListener('change', sendAuto);

      initAuto = true;

    }
  });
};

window.addEventListener('DOMContentLoaded', () => {
  const body = document.getElementById('body');
  const dashboard = document.getElementById('dashboard');
  const scenes = document.getElementById('scenes');
  const dashWrapper = document.getElementById('dashboard-wrapper');
  const scenesWrapper = document.getElementById('autostream-wrapper');
  const echoArenaPortInput = document.getElementById('echo-arena-port');
  const echoArenaUrlInput = document.getElementById('echo-arena-url');
  const echoArenaAutoConnectInput = document.getElementById('echo-arena-autoconnect');
  const echoArenaConnectButton = document.getElementById('echo-arena-connect');
  const echoArenaSession = document.getElementById('echo-arena-session');

  const loader = document.getElementById('loader');
  const anonymous = document.getElementById('anonymous');
  const echoPath = document.getElementById('echo-path');
  const spectateMe = document.getElementById('echo-spectateMe');
  const ui = document.getElementById('UI');
  const plates = document.getElementById('namePlates');
  const minimap = document.getElementById('minimap');
  const mute = document.getElementById('muteTeams');
  const camera = document.getElementById('cameraMode');
  const join = document.getElementById('echo-arena-joinSessionButton');
  const idJoin = document.getElementById('echo-arena-joinSession');
  const BetweenRoundDur = document.getElementById('BetweenRoundDur');

  body.style.overflow = "hidden";
  loader.style.display = "flex";

  const startEchoArena = () => {
    ipcRenderer.send('spectate.start', {
      id:idJoin.value
    });
  };

  ipcRenderer.on('echoArena.eventsLoaded', () => {
    loader.style.display = "none";
    body.style.overflow = "auto";
  });

  join.addEventListener('click', startEchoArena);

  const updateSpectate = () => {
    ipcRenderer.send('spectate.updateConfig', {
      spectateMe: spectateMe.checked,
      path: echoPath.value,
      settings: {
        ui: ui.checked,
        plate: plates.checked,
        map: minimap.checked,
        mute: mute.checked,
        anonymous: anonymous.checked,
        camera: camera.value
      }
    });
  }; 

  const echoArenaConfig = () => {
    ipcRenderer.send('echoArena.edit', {
      ip: echoArenaUrlInput.value,
      port: echoArenaPortInput.value,
      autoConnect: echoArenaAutoConnectInput.checked,
    });
  };
  
  const updateDurBetweenRound = () => {
    ipcRenderer.send('echoArena.updateDurBetweenRound', {
      dur: BetweenRoundDur.value
    });
  };

  ipcRenderer.on('echoArena.sessionID', (event, data) => {
    echoArenaSession.value = data.sessionID;
  });

  BetweenRoundDur.addEventListener('change', updateDurBetweenRound);
  echoArenaUrlInput.addEventListener('change', echoArenaConfig);
  echoArenaPortInput.addEventListener('change', echoArenaConfig);
  echoArenaAutoConnectInput.addEventListener('change', echoArenaConfig);

  anonymous.addEventListener('click', updateSpectate);
  ui.addEventListener('click', updateSpectate);
  plates.addEventListener('click', updateSpectate);
  minimap.addEventListener('click', updateSpectate);
  mute.addEventListener('click', updateSpectate);
  camera.addEventListener('change', updateSpectate);
  echoPath.addEventListener('change', updateSpectate);
  spectateMe.addEventListener('click', () => {
    if(spectateMe.checked) {
      if (echoArenaSession.value !== '') {
        ipcRenderer.send('spectate.start', {
          id:echoArenaSession.value
        });
      }
    }
    updateSpectate();
  });

  const echoArenaConnect = () => {
    ipcRenderer.send('echoArena.connect', {
      ip: echoArenaUrlInput.value,
      port: echoArenaPortInput.value,
      autoConnect: echoArenaAutoConnectInput.checked,
    });
  };

  dashboard.addEventListener('click', () => {
    dashWrapper.classList.remove('hidden');
    scenesWrapper.classList.add('hidden');
    dashboard.classList.add('active');
    scenes.classList.remove('active');
  });

  scenes.addEventListener('click', () => {
    scenesWrapper.classList.remove('hidden');
    dashboard.classList.remove('active');
    scenes.classList.add('active');
    dashWrapper.classList.add('hidden');
  });
  
  echoArenaConnectButton.addEventListener('click', echoArenaConnect);

  ipcRenderer.on('echoArena.connected', () => {
    echoArenaConnectButton.disabled = true;
    ipcRenderer.send("log", `Echo Arena connected`);
  });

  initAutoStream(document);

const initVrmlMatchMode = (document) => {
  const matchDataBlock = document.getElementById('matchData');
  const autoLoad = document.getElementById('vrml-autoconnect');
  const teamSelect = document.getElementById('teams');
  
  const vrmlNext = (value) => {
    if(value) {
      ipcRenderer.send('vrml.isVrmlMatch', {
        teamId: teamSelect.value
      });
    }
  };

  autoLoad.addEventListener('change', (event) => {
    if(!autoLoad.checked) {
      ipcRenderer.send('vrml.disabled');
    }
    ipcRenderer.send('vrml.autoLoad', autoLoad.checked); 
    vrmlNext(event.target.checked);
  });

  ipcRenderer.on('vrml.teamListLoaded', (event, data) => {
    autoLoad.checked = data.auto;

    data.teams.map((team) => {
      const opt = document.createElement('option');
      opt.value = team.id;
      opt.innerHTML = team.name;
      if (data.teamId === team.id) {
        opt.selected = true;
      }
      teamSelect.appendChild(opt);
      return 0;
    });

    if(data.auto) {
      vrmlNext(data.auto);
    }
  });

  teamSelect.addEventListener('change', (event) => {
    ipcRenderer.send('vrml.teamSelected', {
      teamId: event.target.value
    });
    if(autoLoad.checked) {
      vrmlNext(true);
    }
  });

  ipcRenderer.on('vrml.matchDataLoaded', (event, data) => {
    matchDataBlock.innerHTML = `${data.teams.home.name} vs. ${data.teams.away.name}`;
    matchDataBlock.classList.remove('hidden');
  });

  ipcRenderer.on('vrml.matchDataNotFound', () => {
    matchDataBlock.innerHTML = `No match found`;
    matchDataBlock.classList.remove('hidden');
  });
};

  const blueCustom = document.getElementById('customBlueName');
  const orangeCustom = document.getElementById('customOrangeName');
  const obsSceneCreate = document.getElementById('createScenes');
  const obsWebsocketUrlInput = document.getElementById('obs-websocket-url');
  const obsWebsocketPortInput = document.getElementById('obs-websocket-port');
  const obsWebsocketPasswordInput = document.getElementById('obs-websocket-password');
  const obsWebsocketAutoConnectInput = document.getElementById('obs-websocket-autoconnect');
  const obsWebsocketConnectButton = document.getElementById('obs-websocket-connect');
  const obsWebsocketAutoBufferInput = document.getElementById('obs-buffer-autolaunch');
  const obsWebsocketStartBufferButton = document.getElementById('obs-start-buffer');
  const obsPath = document.getElementById('obs-path');
  const obsSoftAuto = document.getElementById('obs-software-auto');
  const obsStart = document.getElementById('obs-start');
  const obsW = document.getElementById('obs-width');
  const obsH = document.getElementById('obs-height');
  
  const softOBS = () => {
    ipcRenderer.send('obs.soft', {
      path:obsPath.value, 
      auto: obsSoftAuto.checked
    });
  };

  obsWebsocketStartBufferButton.disabled = true;
  const obsWebsocketConnect = () => {
    ipcRenderer.send('obsWebsocket.connect', {
      ip: obsWebsocketUrlInput.value,
      port: obsWebsocketPortInput.value,
      password: obsWebsocketPasswordInput.value,
      autoConnect: obsWebsocketAutoConnectInput.checked,
      autoBuffer:obsWebsocketAutoBufferInput.checked,
    });
  };

  const editAutoOBS = () => {
    ipcRenderer.send('obsWebsocket.autoConnect', obsWebsocketAutoConnectInput.checked);
  };
  
  const startBuffer = () => {
    ipcRenderer.send('obsWebsocket.startBuffer');
    obsWebsocketStartBufferButton.disabled = true;
  };

  const autoBuffer = () => {
    ipcRenderer.send('obsWebsocket.autoBuffer', obsWebsocketAutoBufferInput.checked);
  };

  const customTeamName = () => {
    ipcRenderer.send('mixed.customTeam', {
      blue: blueCustom.value, 
      orange: orangeCustom.value
    });
  };

  const startOBS = () => {
    ipcRenderer.send('obs.start');
    obsStart.disabled = true;
  };

  const updateScreen = () => {
    ipcRenderer.send('obs.screen', {
      width:obsW.value,
      height:obsH.value
    });
  };

  ipcRenderer.on('obs.error', (event, data) => {
    obsStart.disabled = false;
    ipcRenderer.send("log", `OBS Error: ${data.error}`);
  });

  obsH.addEventListener('change', updateScreen);
  obsW.addEventListener('change', updateScreen);
  obsPath.addEventListener('change', softOBS);
  obsSoftAuto.addEventListener('click', softOBS);
  blueCustom.addEventListener('change', customTeamName);
  orangeCustom.addEventListener('change', customTeamName);
  obsWebsocketStartBufferButton.addEventListener('click', startBuffer);
  obsWebsocketAutoBufferInput.addEventListener('change',  autoBuffer);
  obsWebsocketAutoConnectInput.addEventListener('change',  editAutoOBS);
  obsWebsocketConnectButton.addEventListener('click', obsWebsocketConnect);
  obsStart.addEventListener('click', startOBS);

  obsSceneCreate.addEventListener('click', () => {
    ipcRenderer.send('obsWebsocket.createScenes', {});
  });

  ipcRenderer.on('obsWebsocket.connected', () => {
    obsWebsocketConnectButton.disabled = true;
    obsWebsocketStartBufferButton.disabled = false;
    if(obsWebsocketAutoBufferInput.checked) {
      startBuffer();
      obsWebsocketStartBufferButton.disabled = true;
    }
    ipcRenderer.send("log", `OBS Websocket connected`);
  });

  const overlayPortInput = document.getElementById('overlay-port');
  const overlayAutoLaunchInput = document.getElementById('overlay-autolaunch');
  const launchOverlayServerButton = document.getElementById('launch-overlay-server');
  const launch = () => {
    ipcRenderer.send('overlayWs.launchServer', {
      autoLaunch: overlayAutoLaunchInput.checked,
      port: overlayPortInput.value
    });
  };

  const edit = () => {
    ipcRenderer.send('overlayWs.config', {
      autoLaunch: overlayAutoLaunchInput.checked,
      port: overlayPortInput.value
    });
  };

  overlayPortInput.addEventListener('change', edit);
  overlayAutoLaunchInput.addEventListener('change', edit);
  launchOverlayServerButton.addEventListener('click', launch);

  ipcRenderer.on('overlayWs.listening', (event, args) => {
    launchOverlayServerButton.disabled = true;
    ipcRenderer.send("log", `Overlay server listening on http:/127.0.0.1:${args.port}`);
  });

  ipcRenderer.on('overlayWs.launchFailed', () => {
    launchOverlayServerButton.disabled = false;
  });

  ipcRenderer.on('config.loaded', (event, data) => {
    blueCustom.value = data.mixed.blue;
    orangeCustom.value = data.mixed.orange;

    obsPath.value = data.obs.path;
    obsSoftAuto.checked = data.obs.autoStart;
    if(obsSoftAuto.checked) {
      ipcRenderer.on('all.ready', () => {
        startOBS();
      });
    }
    echoArenaUrlInput.value = data.echoArena.ip;
    echoArenaPortInput.value = data.echoArena.port;
    echoArenaAutoConnectInput.checked = data.echoArena.autoConnect;

    echoPath.value = data.echoArena.path;
    spectateMe.checked = data.echoArena.autoStart;
    camera.value = data.echoArena.settings.camera;
    ui.checked = data.echoArena.settings.ui;
    minimap.checked = data.echoArena.settings.map;
    plates.checked = data.echoArena.settings.plate;
    mute.checked = data.echoArena.settings.mute;
    camera.checked = data.echoArena.settings.camera;
    anonymous.checked = data.echoArena.settings.anonymous;
    obsH.value = data.obs.height;
    obsW.value = data.obs.width;

    if (data.echoArena.autoConnect) {
      const echoArenaAutoConnect = setInterval(echoArenaConnect, 10000);
      ipcRenderer.on('echoArena.connected', () => {
        clearInterval(echoArenaAutoConnect);
      });
    }
    
    obsWebsocketUrlInput.value = data.obs.ip;
    obsWebsocketPortInput.value = data.obs.port;
    obsWebsocketPasswordInput.value = data.obs.password;
    obsWebsocketAutoConnectInput.checked = data.obs.autoConnect;
    if (data.obs.autoConnect) {
      const obsWebsocketAutoConnect = setInterval(obsWebsocketConnect, 10000);
      ipcRenderer.on('obsWebsocket.connected', () => {
        clearInterval(obsWebsocketAutoConnect);
      });
    }
    if(data.obs.autoBuffer) {
      obsWebsocketAutoBufferInput.checked = true;
    }
    overlayAutoLaunchInput.checked = data.overlayWs.autoLaunch;
    overlayPortInput.value = data.overlayWs.port;
    if (data.overlayWs.autoLaunch) {
      ipcRenderer.on('all.ready', () => {
        ipcRenderer.send('overlayWs.launchServer', {
          autoLaunch: overlayAutoLaunchInput.checked,
          port: overlayPortInput.value
        });
      });
    }
  });

  ipcRenderer.on('scenes.loaded', (event, data) => {
    const sceneSelects = document.querySelectorAll('.scene-select');
    const main = document.getElementById('main-scene');
    const wait = document.getElementById('wait-scene');
    const autostream = document.getElementById('autostream');
    const launch = document.getElementById('launch-time');
    const start = document.getElementById('start-scene[0]');
    const end = document.getElementById('end-scene[0]');
    const delay = document.getElementById('end-duration[0]');
    const durEnd = document.getElementById('delay-after-end-game');
    const between = document.getElementById('between-scene[0]');

    sceneSelects && [...sceneSelects].forEach((sceneSelect) => {
      const noSwitch = document.createElement('option');
      noSwitch.value = 'DO NOT SWITCH SCENE';
      noSwitch.innerHTML = 'DO NOT SWITCH SCENE';
      sceneSelect.appendChild(noSwitch);

      data.scenes.map((scene) => {
        const opt = document.createElement('option');
        opt.value = scene;
        opt.innerHTML = scene;
        sceneSelect.appendChild(opt);
        return 0;
      });
    });

    ipcRenderer.on('autoStream.configLoaded', (event, data) => {
      main.value = data.autoStart.main;
      wait.value = data.autoStart.wait;
      autostream.checked = data.autoStart.auto;
      launch.value = data.autoStart.time;
      start.value = data.start.scene;
      end.value = data.end.ending.scene;
      durEnd.value = data.end.ending.duration;
      delay.value = data.end.delay;
      events = data.game.events;
      between.value = data.start.between;
      BetweenRoundDur.value = data.start.dur;
    });
    ipcRenderer.send("log", 'OBS Scenes loaded');
  });

  ipcRenderer.on('overlayWs.launchFailed', (event, data) => {
    ipcRenderer.send("log", `Overlay server launch failed (${data.error.message})`);
  });

  initVrmlMatchMode(document);
});
