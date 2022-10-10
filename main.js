const { OBSPlayer } = require('./index');
const ChainEventEmitter = require('./src/ChainEventEmitter');
const EventEmitter = require('events');
require('update-electron-app')();
const { app, BrowserWindow, ipcMain, dialog, autoUpdater } = require('electron');
const path = require('path');
const ChildProcess = require('child_process');
const appFolder = path.resolve(process.execPath, '..');
const rootAtomFolder = path.resolve(appFolder, '..');
const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
const exeName = path.basename(process.execPath);
const isDev = require('electron-is-dev');

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  // eslint-disable-next-line func-style
  const spawn = function(command, args) {
    // eslint-disable-next-line no-unused-vars
    let error, spawnedProcess;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    // eslint-disable-next-line no-empty
    } catch (error) {}

    return spawnedProcess;
  };

  // eslint-disable-next-line func-style
  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }
}

if (handleSquirrelEvent()) {
  return;
}

if(!isDev) {
  const server = 'https://east-releases.vercel.app/';
  const url = `${server}/update/${process.platform}/${app.getVersion()}`;
  autoUpdater.setFeedURL({ url });
  autoUpdater.checkForUpdates();
}

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application');
  console.error(message);
});

setInterval(() => {
  autoUpdater.checkForUpdates();
}, 60000);

const uiEventEmitter = (webContents) => {
  return {
    send: (channel, args) => {
      if ((typeof webContents.send) === 'function') {
        webContents.send(channel, args);
        // console.log('event send ', channel, args)
      } else {
        console.log('can not send event');
      }
    },
    on: (channel, callable) => {
      ipcMain.on(channel, function (event, args) {
        // console.log('event received ', channel)
        callable(args, event);
      });
    }
  };
};

const stdEventEmitter = () => {
  const eventEmitter = new EventEmitter();
  return {
    send: eventEmitter.emit,
    on: eventEmitter.on,
  };
};

const start = (webContents) => {
    const eventEmitter = new ChainEventEmitter();
    eventEmitter.add(stdEventEmitter());
    eventEmitter.add(uiEventEmitter(webContents));
    

    const player = new OBSPlayer(
        __dirname,
        eventEmitter
    );
    player.start();
};

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
  });

  mainWindow.loadFile('ui/index.html').then(() => {
    isDev && mainWindow.webContents.openDevTools();
    start(mainWindow.webContents);
  })
  .catch((err) => console.error(err));
};

app.whenReady().then(() => {
  createWindow();
  // to do config loader 
    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stdEventEmitter().send('app.kill');
    app.quit();
  }
});

