const { contextBridge, ipcRenderer } = require('electron');

// Mengekspos API Bluetooth yang aman ke tampilan HTML (index.html)
contextBridge.exposeInMainWorld('electronAPI', {
  // Menerima pembaruan daftar perangkat Bluetooth dari Main Process
  onBluetoothDevices: (callback) => {
    ipcRenderer.removeAllListeners('bluetooth-device-list');
    ipcRenderer.on('bluetooth-device-list', (_event, devices) => callback(devices));
  },
  
  // Mengirim ID perangkat yang dipilih pengguna ke Main Process
  selectBluetoothDevice: (deviceId) => {
    ipcRenderer.send('bluetooth-device-selected', deviceId);
  },
  
  // Mengirim sinyal pembatalan jika pengguna menutup modal
  cancelBluetoothDevice: () => {
    ipcRenderer.send('bluetooth-device-cancel');
  }
});