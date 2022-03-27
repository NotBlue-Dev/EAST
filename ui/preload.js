const { ipcRenderer } = require('electron')
let events;

window.addEventListener('DOMContentLoaded', () => {
  const echoArenaUrlInput = document.getElementById('echo-arena-url')
  const echoArenaPortInput = document.getElementById('echo-arena-port')
  const echoArenaAutoConnectInput = document.getElementById('echo-arena-autoconnect')
  const echoArenaConnectButton = document.getElementById('echo-arena-connect')
  const echoArenaConnect = () => {
    ipcRenderer.send('echoArena.connect', {
      ip: echoArenaUrlInput.value,
      port: echoArenaPortInput.value,
      autoConnect: echoArenaAutoConnectInput.checked,
    })
  }
  
  echoArenaConnectButton.addEventListener('click', echoArenaConnect)

  ipcRenderer.on('echoArena.connected', () => {
    echoArenaConnectButton.disabled = true
    log(`Echo Arena connected`)
  })

  const obsWebsocketUrlInput = document.getElementById('obs-websocket-url')
  const obsWebsocketPortInput = document.getElementById('obs-websocket-port')
  const obsWebsocketPasswordInput = document.getElementById('obs-websocket-password')
  const obsWebsocketAutoConnectInput = document.getElementById('obs-websocket-autoconnect')
  const obsWebsocketConnectButton = document.getElementById('obs-websocket-connect')
  const obsWebsocketConnect = () => {
    ipcRenderer.send('obsWebsocket.connect', {
      ip: obsWebsocketUrlInput.value,
      port: obsWebsocketPortInput.value,
      password: obsWebsocketPasswordInput.value,
      autoConnect: obsWebsocketAutoConnectInput.checked,
    })
  }

  obsWebsocketConnectButton.addEventListener('click', obsWebsocketConnect)

  ipcRenderer.on('obsWebsocket.connected', () => {
    obsWebsocketConnectButton.disabled = true
    log(`OBS Websocket connected`)
  })

  const overlayPortInput = document.getElementById('overlay-port')
  const overlayAutoLaunchInput = document.getElementById('overlay-autolaunch')
  const launchOverlayServerButton = document.getElementById('launch-overlay-server')
  launchOverlayServerButton.addEventListener('click', () => {
    ipcRenderer.send('overlayWs.launchServer', {
      autoLaunch: overlayAutoLaunchInput.checked,
      port: overlayPortInput.value
    })
  })

  ipcRenderer.on('overlayWs.listening', (event, args) => {
    launchOverlayServerButton.disabled = true
    log(`Overlay server listening on http:/127.0.0.1:${args.port}`)
  })

 

  ipcRenderer.on('config.loaded', (event, data) => {
    echoArenaUrlInput.value = data.echoArena.ip
    echoArenaPortInput.value = data.echoArena.port
    echoArenaAutoConnectInput.value = data.echoArena.autoConnect
    if (data.echoArena.autoConnect) {
      const echoArenaAutoConnect = setInterval(echoArenaConnect, 10000)
      ipcRenderer.on('echoArena.connected', () => {
        clearInterval(echoArenaAutoConnect)
      })
    }
    
    obsWebsocketUrlInput.value = data.obs.ip
    obsWebsocketPortInput.value = data.obs.port
    obsWebsocketPasswordInput.value = data.obs.password
    obsWebsocketAutoConnectInput.checked = data.obs.autoConnect
    if (data.obs.autoConnect) {
      const obsWebsocketAutoConnect = setInterval(obsWebsocketConnect, 10000)
      ipcRenderer.on('obsWebsocket.connected', () => {
        clearInterval(obsWebsocketAutoConnect)
      })
    }

    overlayAutoLaunchInput.checked = data.overlayWs.autoLaunch
    overlayPortInput.value = data.overlayWs.port
    if (data.overlayWs.autoLaunch) {
      ipcRenderer.send('overlayWs.launchServer', {
        autoLaunch: overlayAutoLaunchInput.checked,
        port: overlayPortInput.value
      })
    }
  })

  ipcRenderer.on('scenes.loaded', (event, data) => {
    const sceneSelects = document.querySelectorAll('.scene-select')
    const main = document.getElementById('main-scene')
    const wait = document.getElementById('wait-scene')
    const autostream = document.getElementById('autostream')
    const launch = document.getElementById('launch-time')
    const start = document.getElementById('start-scene[0]')
    const durStart = document.getElementById('start-duration[0]')
    const end = document.getElementById('end-scene[0]')
    const delay = document.getElementById('end-duration[0]')
    const durEnd = document.getElementById('delay-after-end-game')

    sceneSelects && [...sceneSelects].forEach((sceneSelect) => {
      data.scenes.map((scene) => {
        const opt = document.createElement('option');
        opt.value = scene;
        opt.innerHTML = scene;
        sceneSelect.appendChild(opt);
      })
    })

    ipcRenderer.on('autoStream.configLoaded', (event, data) => {
      main.value = data.autoStart.main
      wait.value = data.autoStart.wait
      autostream.checked = data.autoStart.auto
      launch.value = data.autoStart.time
      start.value = data.start.scene
      durStart.value = data.start.duration
      end.value = data.end.ending.scene
      durEnd.value = data.end.ending.duration
      delay.value = data.end.delay
      events = data.game.events
    })
    log('OBS Scenes loaded')
  })

  ipcRenderer.on('overlayWs.launchFailed', (event, data) => {
    log(`Overlay server launch failed (${data.error.message})`)
  })

  initVrmlMatchMode(document)
  initAutoStream(document)
})


const initVrmlMatchMode = (document) => {
  const matchDataBlock = document.getElementById('matchData')
  const isVrmlMatchInput = document.getElementById('vrmlMatch')
  const autoLoad = document.getElementById('vrml-autoconnect')
  const teamSelect = document.getElementById('teams')
  
  autoLoad.addEventListener('change', (event) => {
    ipcRenderer.send('vrml.autoLoad', autoLoad.checked) 
    vrmlNext(event.target.checked)
  })

  const vrmlNext = (value) => {
    if(value) {
      ipcRenderer.send('vrml.isVrmlMatch', {
        teamId: teamSelect.value
      })
    }

  }

  isVrmlMatchInput.addEventListener('change', (event) => {
    vrmlNext(event.target.checked)
  })

  ipcRenderer.on('vrml.teamListLoaded', (event, data) => {
    autoLoad.checked = data.auto
    if(data.auto) {
      vrmlNext(data.auto)
    }

    data.teams.map((team) => {
      const opt = document.createElement('option');
      opt.value = team.id;
      opt.innerHTML = team.name;
      if (data.teamId === team.id) {
        opt.selected = true
      }
      teamSelect.appendChild(opt);
    })
  })

  teamSelect.addEventListener('change', (event) => {
    ipcRenderer.send('vrml.teamSelected', {
      teamId: event.target.value
    })
    if(autoLoad.checked) {
      vrmlNext(true)
    }
  })

  ipcRenderer.on('vrml.matchDataLoaded', (event, data) => {
    matchDataBlock.innerHTML = `${data.teams.home.name} vs. ${data.teams.away.name}`
    matchDataBlock.classList.remove('hidden')
  })

  ipcRenderer.on('vrml.matchDataNotFound', (event, data) => {
    matchDataBlock.innerHTML = `No match found`
    matchDataBlock.classList.remove('hidden')
  })
}

let initAuto = false

const initAutoStream = (document) => {
  ipcRenderer.on('echoArena.eventsLoaded', (event, data) => {
    if(!initAuto) {
      const echoEventSelects = document.querySelectorAll('.echo-arena-event-select')
      const main = document.getElementById('main-scene')
      const wait = document.getElementById('wait-scene')
      const autostream = document.getElementById('autostream')
      const launch = document.getElementById('launch-time')
      const start = document.getElementById('start-scene[0]')
      const durStart = document.getElementById('start-duration[0]')
      const end = document.getElementById('end-scene[0]')
      const delay = document.getElementById('end-duration[0]')
      const durEnd = document.getElementById('delay-after-end-game')
      const event = document.getElementById('event[0]')
      const delayEvent = document.getElementById('delay[0]')
      const scene = document.getElementById('scene[0]')
      const dur = document.getElementById('duration[0]')
      const state = document.getElementById('event')

      echoEventSelects && [...echoEventSelects].forEach((echoEventSelect) => {
        data.events.map((eventName) => {    
          const opt = document.createElement('option');
          opt.value = eventName;
          opt.innerHTML = eventName;
          echoEventSelect.appendChild(opt);
        })
      })

      const sendAuto = () => {
        ipcRenderer.send('scenes.autoStart', {
          main: main.value,
          wait: wait.value,
          auto:autostream.checked,
          time: launch.value
        })
      }

      const sendStart = () => {
        ipcRenderer.send('scenes.start', {
          scene: start.value,
          duration: durStart.value,
        })
      }

      const sendEnd = () => {
        ipcRenderer.send('scenes.end', {
          ending: {scene:end.value, duration:durEnd.value},
          delay: delay.value,
        })
      }

      const sendEvent = () => {
        events = events.filter(function( obj ) {
          return obj.event !== event.value;
        })
        events.push({
          event:event.value,delay:delayEvent.value, scene:scene.value, duration:dur.value, used:state.checked
        })

        ipcRenderer.send('scenes.events', {
          events:events
        })
      }

      const switchEvent = (event) => {
        let data = events.find(element => element.event === event)
        state.checked = data.used
        dur.value = data.duration
        scene.value = data.scene
        delayEvent.value = data.delay
      }

      event.addEventListener('change', (event) => {
        switchEvent(event.target.value)
      })

      state.addEventListener('change', sendEvent, false)
      dur.oninput = () => {sendEvent()}
      delayEvent.oninput = () => {sendEvent()}
      scene.addEventListener('change', sendEvent, false)
      event.addEventListener('change', sendEvent, false)
      end.addEventListener('change', sendEnd, false);
      durEnd.oninput = () => {sendEnd()}
      delay.oninput = () => {sendEnd()}
      start.addEventListener('change', sendStart, false);
      durStart.oninput = () => {sendStart()}
      main.addEventListener('change', sendAuto, false);
      wait.addEventListener('change', sendAuto, false);
      launch.oninput = () => {sendAuto()}
      autostream.addEventListener('change', sendAuto, false);

      initAuto = true

    }
  })
}

const log = (message) => {
  const logOutput = document.getElementById('logs')
  logOutput.innerText = message + "\n" + logOutput.innerText
}
