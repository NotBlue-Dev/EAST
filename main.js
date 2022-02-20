const { OBSPlayer } = require('./index')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const dev = false

const start = (webContents) => {
    const overlayEventEmitter = {
        send: (channel, args) => {
            if ((typeof webContents.send) === 'function') {
              webContents.send(channel, args)
              console.log('event send ', channel)
            } else {
              console.log('can not send event')
            }
        },
        on: (channel, callable) => {
            ipcMain.on(channel, function (event, args) {
                console.log('event received ', channel)
              callable(args, event)
            })
        }
    }

    new OBSPlayer(
        __dirname,
        overlayEventEmitter
    )
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'ui', 'preload.js')
    }
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