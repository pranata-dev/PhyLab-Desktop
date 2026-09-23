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

  document.getElementById('active-module-title').innerText = module.title;
  document.getElementById('active-module-subtitle').innerText = module.subtitle;
}

// 3. Inisialisasi Chart.js
function initChart() {
  const ctx = document.getElementById('realtimeChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Jarak Terukur (cm)',
        data: [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Waktu / Sampel' } },
        y: { title: { display: true, text: 'Jarak (cm)' }, min: 0, max: 100 }
      }
    }
  });
}

// 4. Mock Data Generator (Simulasi Data Sensor)
function toggleSimulation() {
  const btn = document.getElementById('btn-toggle-sim');
  const status = document.getElementById('mode-status');

  if (!isSimulating) {
    // Mulai Simulasi
    isSimulating = true;
    btn.innerText = 'Hentikan Simulasi';
    btn.className = 'btn btn-primary';
    status.innerText = 'Mode Simulasi Aktif';
    status.classList.add('simulating');

    simulationInterval = setInterval(() => {
      stepCounter += 0.2;
      // Rumus Simulasi: Gelombang Sinus + Sedikit Noise Acak
      const simulatedDistance = (30 + 15 * Math.sin(stepCounter) + (Math.random() - 0.5) * 1.5).toFixed(1);
      const simulatedTime = (simulatedDistance / 0.0343).toFixed(2); // V_udara = 343 m/s

      // Update Metrik Kartu UI
      document.getElementById('val-distance').innerHTML = `${simulatedDistance} <span class="unit">cm</span>`;
      document.getElementById('val-time').innerHTML = `${simulatedTime} <span class="unit">ms</span>`;

      // Update Grafik Live
      const timeLabel = new Date().toLocaleTimeString();
      chartInstance.data.labels.push(timeLabel);
      chartInstance.data.datasets[0].data.push(simulatedDistance);

      // Batasi tampilan maksimal 20 data pada grafik agar tidak berat
      if (chartInstance.data.labels.length > 20) {
        chartInstance.data.labels.shift();
        chartInstance.data.datasets[0].data.shift();
      }

      chartInstance.update();
    }, 500); // Update setiap 500ms
  } else {
    // Hentikan Simulasi
    isSimulating = false;
    clearInterval(simulationInterval);
    btn.innerText = 'Mulai Simulasi';
    btn.className = 'btn btn-warning';
    status.innerText = 'Mode Standby';
    status.classList.remove('simulating');
  }
}

// Inisialisasi saat aplikasi pertama dibuka
window.addEventListener('DOMContentLoaded', () => {
  loadLabModules();
  initChart();

  document.getElementById('btn-toggle-sim').addEventListener('click', toggleSimulation);
});