const libOBS = require('./index')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const dev = false
const config = {
    overlayWs : {
        port: 4545,
        overlays: [
            {path: '/wait', template: 'wait'},
            {path: '/starting', template: 'starting'},
            {path: '/roundStart', template: 'roundStart'},
            {path: '/roundWin', template: 'roundWin'},
            {path: '/betwenRound', template: 'betwenRound'},
            {path: '/game', template: 'game'},
            {path: '/ot',   template: 'overTime'},
        ]
    }
}

const start = (webContents) => {
    const overlayEventEmitter = {
        send: (channel, args) => {
            if ((typeof webContents.send) === 'function') {
              webContents.send(channel, args)
            } else {
              console.log('can not send event')
            }
        },
        on: (channel, callable) => {
            ipcMain.on(channel, function (event, arg) {
              callable(arg, event)
            })
        }
    }

    new libOBS.OBSPlayer(
        new libOBS.OBSClient(),
        new libOBS.OverlayWS(config.overlayWs, overlayEventEmitter, __dirname),
        '127.0.0.1',
        'Ump8RAT5HYFXgHE1WLU9Eg2'
        // '192.168.1.77'
    )
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'ui/preload.js')
    }
  })

  ipcMain.on('config.setted', (event, data) => {
    console.log('setted')
    event.reply('config.validated', {
      echoApiUrl: true
    })
  })

  mainWindow.loadFile('ui/index.html').then(() => {
    dev && mainWindow.webContents.openDevTools()
    start(mainWindow.webContents)
  })
  .catch((err) => console.error(err))
}

app.whenReady().then(() => {
  createWindow()
  // to do config loader 
    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// faire visu + regler bug img dupliquée