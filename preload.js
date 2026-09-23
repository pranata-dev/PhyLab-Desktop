const { contextBridge, ipcRenderer } = require('electron');

// Mengekspos API yang aman ke tampilan Renderer (index.html / renderer.js)
contextBridge.exposeInMainWorld('electronAPI', {
  // Menerima pembaruan daftar perangkat Bluetooth dari Main Process
  onBluetoothDevices: (callback) => {
    ipcRenderer.removeAllListeners('bluetooth-devices-found');
    ipcRenderer.on('bluetooth-devices-found', (_event, devices) => callback(devices));
  },
  
  // Mengirim ID perangkat yang dipilih pengguna ke Main Process
  selectBluetoothDevice: (deviceId) => {
    ipcRenderer.send('select-bluetooth-device-id', deviceId);
  },
  
  // Mengirim sinyal pembatalan jika pengguna menutup modal
  cancelBluetoothDevice: () => {
    ipcRenderer.send('cancel-bluetooth-scan');
  },

  // Mengirim data eksperimen ke Main Process untuk diekspor ke Excel (.xlsx)
  exportXLSX: (data) => {
    return ipcRenderer.invoke('export-xlsx', data);
  }
});