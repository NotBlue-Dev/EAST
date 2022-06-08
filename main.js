const { OBSPlayer } = require('./index')
const ChainEventEmitter = require('./src/ChainEventEmitter')
const EventEmitter = require('events')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const dev = false

const uiEventEmitter = (webContents) => {
  return {
    send: (channel, args) => {
      if ((typeof webContents.send) === 'function') {
        webContents.send(channel, args)
        // console.log('event send ', channel, args)
      } else {
        console.log('can not send event')
      }
    },
    on: (channel, callable) => {
      ipcMain.on(channel, function (event, args) {
        // console.log('event received ', channel)
        callable(args, event)
      })
    }
  }
}

const stdEventEmitter = () => {
  const eventEmitter = new EventEmitter()
  return {
    send: eventEmitter.emit,
    on: eventEmitter.on,
  }
}

const start = (webContents) => {
    const eventEmitter = new ChainEventEmitter()
    eventEmitter.add(stdEventEmitter())
    eventEmitter.add(uiEventEmitter(webContents))
    

    const player = new OBSPlayer(
        __dirname,
        eventEmitter
    )
    player.start()
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    minWidth:600,
    minHeight: 500,
    maxHeight:900,
    maxWidth: 730,
    width: 730,
    height: 900,
    autoHideMenuBar: true,
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
