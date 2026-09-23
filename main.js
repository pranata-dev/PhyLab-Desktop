const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const XLSX = require('xlsx');
const fs = require('fs');

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

// IPC Handler untuk Ekspor Data ke Format Excel (.xlsx)
ipcMain.handle('export-xlsx', async (event, data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, error: 'Tidak ada data untuk diekspor.' };
  }

  // Tampilkan Save Dialog agar pengguna dapat memilih lokasi penyimpanan file
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Simpan Data Eksperimen (.xlsx)',
    defaultPath: `PhyLab_Data_${new Date().toISOString().slice(0, 10)}.xlsx`,
    filters: [
      { name: 'Excel Workbook (*.xlsx)', extensions: ['xlsx'] }
    ]
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  try {
    // Format dataset agar tabel di Excel rapi dan berlabel jelas
    const formattedData = data.map((item, index) => ({
      'No': index + 1,
      'Waktu Pengambilan': item.timestamp,
      'Jarak (cm)': parseFloat(item.distance) || item.distance,
      'Time of Flight (µs)': parseFloat(item.timeOfFlight) || item.timeOfFlight
    }));

    // Konversi JSON ke Worksheet Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Konfigurasi lebar kolom otomatis (Column Width)
    worksheet['!cols'] = [
      { wch: 6 },   // Kolom No
      { wch: 22 },  // Kolom Waktu
      { wch: 15 },  // Kolom Jarak
      { wch: 24 }   // Kolom Time of Flight
    ];

    // Buat Workbook baru dan masukkan worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Eksperimen');

    // Tulis buffer ke file menggunakan modul fs
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    fs.writeFileSync(filePath, buffer);

    return { success: true, filePath };
  } catch (error) {
    console.error('Gagal mengekspor file Excel:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});