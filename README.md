# PhyLab Pro - Desktop

**PhyLab Pro** adalah aplikasi desktop laboratorium fisika berbasis **Electron** yang dirancang untuk pengujian dan praktikum gelombang ultrasonik secara real-time menggunakan koneksi **Bluetooth Low Energy (BLE)** dengan node mikrokontroler (misalnya ESP32 dan sensor HC-SR04).

---

## 🌟 Fitur Utama

- **Konektivitas Bluetooth BLE Otomatis:** Integrasi langsung dengan Web Bluetooth API pada Chromium/Electron untuk memindai, memilih, dan menghubungkan ke node sensor nirkabel.
- **Visualisasi Real-Time:** Menampilkan grafik pergerakan jarak secara dinamis dan mulus menggunakan **Chart.js**.
- **Perhitungan Fisika Terintegrasi:** Mengonversi data jarak objek ($d$) ke Waktu Tempuh (*Time of Flight* / $t$) bolak-balik gelombang suara secara akurat berdasarkan kecepatan rambat di udara ($v \approx 343\text{ m/s}$).
- **Perekaman & Ekspor Data (CSV):** Fitur *Start / Stop Record*, reset data, dan ekspor langsung ke format CSV untuk analisis data laboratorium lebih lanjut (Excel, Python, MATLAB, dll).
- **Modul Praktikum & Panduan Teori Interaktif:** Dilengkapi modul panduan praktikum, tujuan, alat dan bahan, rumus fisika, serta langkah kerja langsung di dalam aplikasi:
  1. *Praktikum 1: Kecepatan Gelombang Ultrasonik (Time of Flight di Udara)*
  2. *Praktikum 2: Pemantulan Gelombang Ultrasonik (Karakteristik Pemantulan Berbagai Penghalang)*

---

## 🛠️ Arsitektur & Teknologi

| Komponen | Teknologi / Keterangan |
|---|---|
| **Framework Desktop** | [Electron](https://www.electronjs.org/) (v28.x) |
| **Protokol Komunikasi** | Bluetooth Low Energy (BLE) GATT Architecture via Web Bluetooth API |
| **Grafik & Visualisasi** | [Chart.js](https://www.chartjs.org/) |
| **Antarmuka Pengguna** | HTML5, Modern Vanilla CSS (Slate Theme), IPC Electron |
| **Pengemasan Aplikasi** | `electron-packager` (Distribusi Windows x64) |

---

## 📁 Struktur Berkas

```text
PhyLab-Desktop/
├── index.html          # Tampilan utama dashboard, panduan teori, koneksi BLE, dan grafik
├── main.js             # Electron Main Process (manajemen window, switch flag Bluetooth, IPC)
├── preload.js          # Skrip preload IPC bridge (opsi context isolation)
├── renderer.js         # Skrip logika terpisah & generator mode simulasi (mock sensor data)
├── styles.css          # Berkas styling CSS terpisah
├── materi.json         # Data JSON modul & kurikulum praktikum
├── package.json        # Konfigurasi dependensi dan skrip npm
├── .gitignore          # Konfigurasi pengabaian berkas git (node_modules, dist, dll.)
└── README.md           # Dokumentasi proyek
```

---

## 🚀 Panduan Penggunaan & Menjalankan

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi LTS yang disarankan, v18+)
- Node sensor perangkat keras (ESP32 + HC-SR04) dengan firmware BLE GATT

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Aplikasi (Mode Pengembangan)
```bash
npm start
```

### 4. Melakukan Build / Packaging ke File Executable (.exe)
```bash
npm run package
```
Hasil build akan tersimpan di dalam folder `dist/PhyLabPro-win32-x64/`.

---

## 📡 Konfigurasi Bluetooth BLE

Aplikasi mendengarkan layanan GATT dengan UUID berikut:
- **Service UUID:** `4880c12c-1030-4740-9f2f-26996929b59a`
- **Characteristic UUID:** `fec26ec4-6d71-4442-9f81-55bc21d658d6`
- **Format Data Sensor:** 4-byte float (Little-Endian, $d$ dalam satuan sentimeter).
