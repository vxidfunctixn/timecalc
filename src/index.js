const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ipc = ipcMain

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

let helpWindow = null
const createHelpWindow = () => {
  if(helpWindow !== null) return
  helpWindow = new BrowserWindow({
    width: 450,
    height: 600,
    title: 'Pomoc',
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  helpWindow.loadFile(path.join(__dirname, 'help.html'))

  helpWindow.on('closed', () => {
    helpWindow = null;
  });
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 520,
    height: 514,
    title: 'Time Calc',
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))
  // win.webContents.openDevTools()

  ipc.on('closeApp', () => {
    win.close()
  })

  ipc.on('minimizeApp', () => {
    win.minimize()
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

// Only dev
try {
  require('electron-reloader')(module)
} catch (_) {}