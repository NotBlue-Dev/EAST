const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }

  const echoApiUrlInput = document.getElementById('echo-api-url')
  echoApiUrlInput && echoApiUrlInput.addEventListener('change', (event) => {
    console.log('change')
    ipcRenderer.send('config.setted', {
      echoApiUrl: event.target.value
    })
  })

  ipcRenderer.on('config.validated', (event, data) => {
    if (data.echoApiUrl) {
      console.log(data)
      echoApiUrlInput && (echoApiUrlInput.classList.add('valid'))
    }
  })


  launchOverlayServerButton = document.getElementById('launch-overlay-server')
  launchOverlayServerButton && launchOverlayServerButton.addEventListener('click', (event) => {
    ipcRenderer.on('overlayWs.listening', (event, args) => {
      launchOverlayServerButton.disabled = true
      console.log(args)
    })

    const portInput = document.getElementById('overlay-port')
    const port = portInput && portInput.value

    ipcRenderer.send('overlayWs.launchServer', {
      port,
    })
  })
})
  