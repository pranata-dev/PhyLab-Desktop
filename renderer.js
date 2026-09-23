// Variable Global State
let chartInstance = null;
let simulationInterval = null;
let isSimulating = false;
let stepCounter = 0;

// 1. Memuat Materi Praktikum dari materi.json
async function loadLabModules() {
  try {
    const response = await fetch('materi.json');
    const data = await response.json();
    
    const container = document.getElementById('module-list-container');
    if (!container) return;
    container.innerHTML = '';

    data.modules.forEach((module, index) => {
      const li = document.createElement('li');
      li.className = `module-item ${index === 0 ? 'active' : ''}`;
      li.innerText = module.title;
      li.onclick = () => selectModule(module, li);
      container.appendChild(li);
    });

    // Set modul pertama sebagai aktif secara default
    if (data.modules.length > 0) {
      selectModule(data.modules[0], container.children[0]);
    }
  } catch (error) {
    console.error('Gagal memuat materi.json:', error);
  }
}

// 2. Fungsi Memilih Modul Praktikum
function selectModule(module, element) {
  document.querySelectorAll('.module-item').forEach(el => el.classList.remove('active'));
  if (element) element.classList.add('active');

  const titleEl = document.getElementById('active-module-title');
  const subtitleEl = document.getElementById('active-module-subtitle');
  if (titleEl) titleEl.innerText = module.title;
  if (subtitleEl) subtitleEl.innerText = module.subtitle;
}

// 3. Inisialisasi Chart.js (Standar Ilmiah: Tanpa Gridline)
function initChart() {
  const canvas = document.getElementById('realtimeChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Jarak Terukur (cm)',
        data: [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.04)',
        fill: true,
        tension: 0.15,
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          grid: { display: false, drawBorder: true },
          border: { display: true, color: '#94a3b8', width: 1.5 },
          ticks: { color: '#475569', font: { size: 10, weight: '500' } },
          title: { display: true, text: 'Waktu / Sampel', color: '#64748b', font: { size: 11, weight: '600' } }
        },
        y: { 
          grid: { display: false, drawBorder: true },
          border: { display: true, color: '#94a3b8', width: 1.5 },
          ticks: { color: '#475569', font: { size: 10, weight: '500' } },
          title: { display: true, text: 'Jarak (cm)', color: '#64748b', font: { size: 11, weight: '600' } },
          min: 0, 
          max: 100 
        }
      }
    }
  });
}

// 4. Toggle Collapsible Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 320);
  }
}

// 5. Mock Data Generator (Simulasi Data Sensor)
function toggleSimulation() {
  const btn = document.getElementById('btn-toggle-sim');
  const status = document.getElementById('mode-status');

  if (!isSimulating) {
    // Mulai Simulasi
    isSimulating = true;
    if (btn) {
      btn.innerText = 'Hentikan Simulasi';
      btn.className = 'btn btn-primary';
    }
    if (status) {
      status.innerText = 'Mode Simulasi Aktif';
      status.classList.add('simulating');
    }

    simulationInterval = setInterval(() => {
      stepCounter += 0.2;
      // Rumus Simulasi: Gelombang Sinus + Sedikit Noise Acak
      const simulatedDistance = (30 + 15 * Math.sin(stepCounter) + (Math.random() - 0.5) * 1.5).toFixed(1);
      const simulatedTime = (simulatedDistance / 0.0343).toFixed(2); // V_udara = 343 m/s

      // Update Metrik Kartu UI
      const valDistEl = document.getElementById('val-distance');
      const valTimeEl = document.getElementById('val-time');
      if (valDistEl) valDistEl.innerHTML = `${simulatedDistance} <span class="unit">cm</span>`;
      if (valTimeEl) valTimeEl.innerHTML = `${simulatedTime} <span class="unit">µs</span>`;

      // Update Grafik Live
      if (chartInstance) {
        const timeLabel = new Date().toLocaleTimeString();
        chartInstance.data.labels.push(timeLabel);
        chartInstance.data.datasets[0].data.push(simulatedDistance);

        // Batasi tampilan maksimal 30 data pada grafik
        if (chartInstance.data.labels.length > 30) {
          chartInstance.data.labels.shift();
          chartInstance.data.datasets[0].data.shift();
        }

        chartInstance.update();
      }
    }, 500);
  } else {
    // Hentikan Simulasi
    isSimulating = false;
    clearInterval(simulationInterval);
    if (btn) {
      btn.innerText = 'Mulai Simulasi';
      btn.className = 'btn btn-warning';
    }
    if (status) {
      status.innerText = 'Mode Standby';
      status.classList.remove('simulating');
    }
  }
}

// 6. Ekspor Data ke Format CSV
function downloadCSV(data) {
  const exportData = data || [];
  if (exportData.length === 0) {
    alert('Belum ada data direkam untuk diekspor!');
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Waktu,Jarak (cm),Time of Flight (us)\n";
  exportData.forEach(row => {
    csvContent += `${row.timestamp},${row.distance},${row.timeOfFlight}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PhyLab_Data_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 7. Ekspor Data ke Format Excel (.xlsx) melalui IPC
async function exportXLSX(data) {
  const exportData = data || [];
  if (exportData.length === 0) {
    alert('Belum ada data direkam untuk diekspor!');
    return;
  }
  try {
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('export-xlsx', exportData);
    if (result && result.success) {
      alert(`Data berhasil diekspor ke file Excel:\n${result.filePath}`);
    } else if (result && !result.canceled && result.error) {
      alert(`Gagal mengekspor file Excel: ${result.error}`);
    }
  } catch (err) {
    console.error('Error saat invoke export-xlsx:', err);
    alert('Terjadi kesalahan saat memproses ekspor Excel.');
  }
}

// Inisialisasi saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
  loadLabModules();
  initChart();

  const btnSim = document.getElementById('btn-toggle-sim');
  if (btnSim) btnSim.addEventListener('click', toggleSimulation);

  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  if (btnToggleSidebar) btnToggleSidebar.addEventListener('click', toggleSidebar);

  // Dropdown Export Menu Event Listeners
  const btnExportToggle = document.getElementById('btn-export-toggle');
  const exportMenu = document.getElementById('export-menu');
  if (btnExportToggle && exportMenu) {
    btnExportToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      exportMenu.classList.add('hidden');
    });
  }
});