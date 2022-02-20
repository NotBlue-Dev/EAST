const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  const echoArenaUrlInput = document.getElementById('echo-arena-url')
  const echoArenaPortInput = document.getElementById('echo-arena-port')
  const echoArenaAutoConnectInput = document.getElementById('echo-arena-autoconnect')
  const echoArenaConnectButton = document.getElementById('echo-arena-connect')
  echoArenaConnectButton.addEventListener('click', () => {
    ipcRenderer.send('echoArena.connect', {
      ip: echoArenaUrlInput.value,
      port: echoArenaPortInput.value,
      autoConnect: echoArenaAutoConnectInput.checked,
    })
  })

  ipcRenderer.on('echoArena.connected', () => {
    echoArenaConnectButton.disabled = true
  })

  const obsWebsocketUrlInput = document.getElementById('obs-websocket-url')
  const obsWebsocketPortInput = document.getElementById('obs-websocket-port')
  const obsWebsocketPasswordInput = document.getElementById('obs-websocket-password')
  const obsWebsocketAutoConnectInput = document.getElementById('obs-websocket-autoconnect')
  const obsWebsocketConnectButton = document.getElementById('obs-websocket-connect')
  obsWebsocketConnectButton.addEventListener('click', () => {
    ipcRenderer.send('obsWebsocket.connect', {
      ip: obsWebsocketUrlInput.value,
      port: obsWebsocketPortInput.value,
      password: obsWebsocketPasswordInput.value,
      autoConnect: obsWebsocketAutoConnectInput.checked,
    })
  })

  ipcRenderer.on('obsWebsocket.connected', () => {
    obsWebsocketConnectButton.disabled = true
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
  })

  ipcRenderer.on('config.loaded', (event, data) => {
    echoArenaUrlInput.value = data.echoArena.ip
    echoArenaPortInput.value = data.echoArena.port
    echoArenaAutoConnectInput.value = data.echoArena.autoConnect
    if (data.echoArena.autoConnect) {
      ipcRenderer.send('echoArena.connect', {
        ip: echoArenaUrlInput.value,
        port: echoArenaPortInput.value,
        autoConnect: echoArenaAutoConnectInput.checked,
      })
    }
    
    obsWebsocketUrlInput.value = data.obs.ip
    obsWebsocketPortInput.value = data.obs.port
    obsWebsocketPasswordInput.value = data.obs.password
    obsWebsocketAutoConnectInput.checked = data.obs.autoConnect
    if (data.obs.autoConnect) {
      ipcRenderer.send('obsWebsocket.connect', {
        ip: obsWebsocketUrlInput.value,
        port: obsWebsocketPortInput.value,
        password: obsWebsocketPasswordInput.value,
        autoConnect: obsWebsocketAutoConnectInput.checked,
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
})
  