let loadChart;
let labels = [];
let loadData = [];

function createGraph() {
  const ctx = document.getElementById("loadChart");
  if (!ctx) return;

  loadChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Load Consumption (W)",
        data: loadData,
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          title: {
            display: true,
            text: "Power (W)"
          }
        },
        x: {
          title: {
            display: true,
            text: "Time"
          }
        }
      }
    }
  });
}

async function fetchData() {
  try {
    // Since dashboard is running on your laptop browser
    const res = await fetch("http://localhost:3000/data");

    if (!res.ok) {
      throw new Error("Server response error");
    }

    const data = await res.json();
    console.log("Dashboard received:", data);

    const voltage = Number(data.voltage) || 0;
    const power = Number(data.power) || 0;
    const current = Number(data.current) || 0;
    const energy = Number(data.energy) || 0;

    // Works for both predictedCost and bill
    const predictedCost = Number(data.predictedCost ?? data.bill) || 0;

    const voltageEl = document.getElementById("voltage");
    const powerEl = document.getElementById("power");
    const currentEl = document.getElementById("current");
    const energyEl = document.getElementById("energy");
    const predictionEl = document.getElementById("prediction");

    if (voltageEl) voltageEl.innerText = voltage.toFixed(2) + " V";
    if (powerEl) powerEl.innerText = power.toFixed(2) + " W";
    if (currentEl) currentEl.innerText = current.toFixed(2) + " A";
    if (energyEl) energyEl.innerText = energy.toFixed(6) + " kWh";
    if (predictionEl) predictionEl.innerText = "Rs " + predictedCost.toFixed(0);

    const usageFill = document.getElementById("usageFill");
    const usageStatus = document.getElementById("usageStatus");

    let usagePercent = Math.min(power, 100);

    if (usageFill) {
      usageFill.style.width = usagePercent + "%";
    }

    if (usageStatus) {
      if (power < 20) {
        usageStatus.innerText = "Current usage is under normal range.";
      } else if (power < 60) {
        usageStatus.innerText = "Moderate load detected. Monitor usage.";
      } else {
        usageStatus.innerText = "High load detected. Reduce unnecessary usage.";
      }
    }

    const time = new Date().toLocaleTimeString();

    labels.push(time);
    loadData.push(power);

    if (labels.length > 12) {
      labels.shift();
      loadData.shift();
    }

    if (loadChart) {
      loadChart.update();
    }

  } catch (err) {
    console.log("Error fetching data:", err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  createGraph();
  fetchData();
  setInterval(fetchData, 1000);
});