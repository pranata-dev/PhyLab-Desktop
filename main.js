const { app, BrowserWindow, ipcMain } = require('electron');

// Mengaktifkan dukungan Web Bluetooth pada Chromium engine Electron
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-web-bluetooth');

let mainWindow;
let bluetoothCallback = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: "PhyLab Pro - Multi-Node Ultrasonik",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,       // Mengizinkan modul Node.js di renderer
      contextIsolation: false      // Menyederhanakan komunikasi IPC
    }
  });

  const ses = mainWindow.webContents.session;

  // Otorisasi otomatis untuk izin akses Bluetooth
  ses.setPermissionCheckHandler(() => true);
  ses.setDevicePermissionHandler(() => true);

  // Menangkap event pemindaian Bluetooth dari Web API
  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    bluetoothCallback = callback;
    mainWindow.webContents.send('bluetooth-devices-found', deviceList);
  });

  mainWindow.loadFile('index.html');
}

// IPC Listener untuk menerima ID perangkat pilihan pengguna
ipcMain.on('select-bluetooth-device-id', (event, deviceId) => {
  if (bluetoothCallback) {
    bluetoothCallback(deviceId);
    bluetoothCallback = null;
  }
});

// IPC Listener untuk membatalkan proses scan
ipcMain.on('cancel-bluetooth-scan', () => {
  if (bluetoothCallback) {
    bluetoothCallback('');
    bluetoothCallback = null;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});