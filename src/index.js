const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron')
const path = require('path')
const ipc = ipcMain

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

let helpWindow = null
let mainWindow = null
const createHelpWindow = () => {
  if(helpWindow !== null) {
    helpWindow.focus()
    return
  }
  const currentDisplay = screen.getDisplayMatching(mainWindow.getBounds());
  helpWindow = new BrowserWindow({
    width: 520,
    height: 600,
    x: currentDisplay.bounds.x + 100,
    y: currentDisplay.bounds.y + 100,
    title: 'Pomoc',
    frame: false,
    resizable: false,
    show: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  helpWindow.once('ready-to-show', () => {
    helpWindow.show();
  })

  helpWindow.loadFile(path.join(__dirname, 'help.html'))

  helpWindow.on('closed', () => {
    helpWindow = null;
  });
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 565,
    title: 'Time Calc',
    frame: false,
    show: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  // mainWindow.webContents.openDevTools()


  ipc.on('closeApp', () => {
    mainWindow.close()
    if(helpWindow) {
      helpWindow.close()
    }
  })

  ipc.on('minimizeApp', () => {
    mainWindow.minimize()
  })

  ipc.on('openHelp', () => {
    createHelpWindow()
  })

  ipc.on('closeHelp', () => {
    helpWindow.close()
  })
}


app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('getAppVersion', (event) => {
  event.returnValue = app.getVersion();
});

ipc.handle('saveFileDialog', async () => {
  const options = {
    title: 'Zapisz do pliku tekstowego',
    defaultPath: '~/historia.txt',
    buttonLabel: 'Zapisz',
    filters: [{ name: 'Pliki tekstowe', extensions: ['txt'] }]
  }
  const result = await dialog.showSaveDialog(options)
  return result.filePath
})

// Only dev
try {
  require('electron-reloader')(module)
} catch (_) {}