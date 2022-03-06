const { ipcRenderer } = require('electron')

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

    overlayAutoLaunchInput.checked = data.overlay.autoLaunch
    overlayPortInput.value = data.overlay.port
    if (data.overlay.autoLaunch) {
      ipcRenderer.send('overlayWs.launchServer', {
        autoLaunch: overlayAutoLaunchInput.checked,
        port: overlayPortInput.value
      })
    }
  })

  ipcRenderer.on('scenes.loaded', (event, data) => {
    const sceneSelects = document.querySelectorAll('.scene-select')
    sceneSelects && [...sceneSelects].forEach((sceneSelect) => {
      data.scenes.map((scene) => {
        const opt = document.createElement('option');
        opt.value = scene;
        opt.innerHTML = scene;
        sceneSelect.appendChild(opt);
      })
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
  const teamSelect = document.getElementById('teams')
  isVrmlMatchInput.addEventListener('change', (event) => {
    const value = event.target.checked
    if (!value) {
      matchDataBlock.classList.add('hidden')
      return
    } 
    ipcRenderer.send('vrml.isVrmlMatch', {
      teamId: teamSelect.value
    })
  })

  ipcRenderer.on('vrml.teamListLoaded', (event, data) => {
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

const initAutoStream = (document) => {
  ipcRenderer.on('echoArena.eventsLoaded', (event, data) => {
    const echoEventSelects = document.querySelectorAll('.echo-arena-event-select')
    echoEventSelects && [...echoEventSelects].forEach((echoEventSelect) => {
      data.events.map((eventName) => {    
        const opt = document.createElement('option');
        opt.value = eventName;
        opt.innerHTML = eventName;
        echoEventSelect.appendChild(opt);
      })
    })
  })
}

const log = (message) => {
  const logOutput = document.getElementById('logs')
  logOutput.innerText = message + "\n" + logOutput.innerText
}
