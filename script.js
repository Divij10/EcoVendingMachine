// State management
const state = {
  user: {
    name: localStorage.getItem('userName') || 'Sustainability Star',
    points: parseInt(localStorage.getItem('points')) || 120, // Start with placeholder value
    co2Saved: parseFloat(localStorage.getItem('co2Saved')) || 6.3, // Start with placeholder value
    plasticsDiverted: parseInt(localStorage.getItem('plasticsDiverted')) || 42, // Start with placeholder value
    impactHistory: JSON.parse(localStorage.getItem('impactHistory')) || [2, 4, 5, 6, 8, 9], // Placeholder data
    redeemedRewards: JSON.parse(localStorage.getItem('redeemedRewards')) || []
  },
  rewards: [
    {
      id: 'coffee',
      title: 'Barista Coffee',
      description: 'Redeem 40 EcoPoints for any 12‑oz drink.',
      points: 40,
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80' // Coffee cup
    },
    {
      id: 'tote',
      title: 'Canvas Tote Bag',
      description: 'Carry your books the sustainable way. 60 EcoPoints.',
      points: 60,
      image: 'https://resourceboy.com/wp-content/uploads/2023/05/3-canvas-tote-bag-mockups-in-varied-views-2.jpg' // Tote bag from ResourceBoy
    },
    {
      id: 'straw',
      title: 'Reusable Straw Pack',
      description: 'Stainless‑steel straw + brush. 25 EcoPoints.',
      points: 25,
      image: 'https://playroomcollective.com/cdn/shop/products/silicone-straws-stone-mix-6-pack-1_1200x1200.jpg?v=1629393072' // Silicone straws from Playroom Collective
    }
  ],
  leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [
    { name: 'You', points: 120 },
    { name: 'Leena R.', points: 95 },
    { name: 'Aditya P.', points: 88 }
  ]
};

// Utility functions
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function saveState() {
  // Only save user's data, not the placeholder data
  localStorage.setItem('userName', state.user.name);
  localStorage.setItem('points', state.user.points);
  localStorage.setItem('co2Saved', state.user.co2Saved);
  localStorage.setItem('plasticsDiverted', state.user.plasticsDiverted);
  localStorage.setItem('impactHistory', JSON.stringify(state.user.impactHistory));
  localStorage.setItem('redeemedRewards', JSON.stringify(state.user.redeemedRewards));
  
  // Update leaderboard with current user points
  state.leaderboard[0].points = state.user.points;
  localStorage.setItem('leaderboard', JSON.stringify(state.leaderboard));
  
  updateUI();
}

function updateUI() {
  // Update dashboard
  document.getElementById('userName').textContent = state.user.name;
  document.getElementById('points').textContent = state.user.points;
  document.getElementById('co2').textContent = state.user.co2Saved.toFixed(1);
  document.getElementById('plastics').textContent = state.user.plasticsDiverted;

  // Update leaderboard
  const lbBody = document.getElementById('lb-body');
  lbBody.innerHTML = state.leaderboard
    .map((user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${user.name}</td>
        <td>${user.points}</td>
      </tr>
    `).join('');

  // Update rewards
  const rewardsGrid = document.getElementById('rewards-grid');
  rewardsGrid.innerHTML = state.rewards.map(reward => `
    <div>
      <div class="uk-card uk-card-default uk-card-hover">
        <div class="uk-card-media-top">
          <img src="${reward.image}" alt="${reward.title}">
        </div>
        <div class="uk-card-body">
          <h4 class="uk-card-title">${reward.title}</h4>
          <p>${reward.description}</p>
          <button 
            class="uk-button uk-button-primary uk-width-1-1"
            ${state.user.points >= reward.points ? '' : 'disabled'}
            onclick="redeemReward('${reward.id}')"
          >
            ${reward.points} Points
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Update impact chart
  updateImpactChart();
}

function updateImpactChart() {
  const ctx = document.getElementById('impactChart');
  if (window.impactChart) {
    window.impactChart.destroy();
  }
  window.impactChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Kg CO₂ saved',
        data: state.user.impactHistory,
        backgroundColor: 'rgba(0, 140, 158, 0.5)',
        borderColor: 'rgb(0, 140, 158)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// QR Code Scanner
function initQRScanner() {
  const html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    (decodedText) => {
      handleScan(decodedText);
      html5QrCode.stop();
    },
    (errorMessage) => {
      // Ignore errors
    }
  );
}

// Event Handlers
function handleScan(code) {
  // Simulate different types of scans with consistent point values
  const scanTypes = [
    { points: 5, co2: 0.3, plastics: 2 },
    { points: 10, co2: 0.5, plastics: 3 },
    { points: 15, co2: 0.8, plastics: 5 }
  ];
  const scan = scanTypes[Math.floor(Math.random() * scanTypes.length)];

  // Update user's data
  state.user.points += scan.points;
  state.user.co2Saved += scan.co2;
  state.user.plasticsDiverted += scan.plastics;
  
  // Update impact history
  const currentMonth = new Date().getMonth();
  state.user.impactHistory[currentMonth] += scan.co2;

  // Update leaderboard
  state.leaderboard[0].points = state.user.points;
  state.leaderboard.sort((a, b) => b.points - a.points);

  saveState();
  showToast(`Earned ${scan.points} points! Keep up the good work!`);
}

function redeemReward(rewardId) {
  const reward = state.rewards.find(r => r.id === rewardId);
  if (!reward) return;

  if (state.user.points >= reward.points) {
    state.user.points -= reward.points;
    state.user.redeemedRewards.push(rewardId);
    saveState();
    showToast(`Successfully redeemed ${reward.title}!`);
  } else {
    showToast('Not enough points!', 'error');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if this is the first visit
  const isFirstVisit = !localStorage.getItem('points');
  
  if (isFirstVisit) {
    // Set initial placeholder data
    state.user.points = 120;
    state.user.co2Saved = 6.3;
    state.user.plasticsDiverted = 42;
    state.user.impactHistory = [2, 4, 5, 6, 8, 9];
    state.leaderboard = [
      { name: 'You', points: 120 },
      { name: 'Leena R.', points: 95 },
      { name: 'Aditya P.', points: 88 }
    ];
    saveState();
  }

  updateUI();
  initQRScanner();

  // Form submission handler
  document.getElementById('scan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const code = input.value.trim();
    if (code) {
      handleScan(code);
      input.value = '';
    }
  });
}); 