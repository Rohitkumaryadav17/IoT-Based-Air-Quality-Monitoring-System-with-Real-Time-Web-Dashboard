// ===============================
// SAMPLE SENSOR DATA
// ===============================

const temperatureData = [
    30, 29, 28, 28, 27, 26, 28, 30, 32, 30,
    29, 28, 29, 30, 32, 33, 32
];


const humidityData = [
    52, 54, 56, 57, 59, 61, 63, 61, 58,
    71, 67, 59, 52, 48, 55, 62, 64
];


const airQualityData = [
    980, 950, 1020, 1100, 1080, 1060,
    1000, 1120, 1300, 1250, 1050,
    1100, 1150, 1200, 1130, 1180, 1100
];


const timeLabels = [
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00"
];


// ===============================
// TEMPERATURE GRAPH
// ===============================

new Chart(

    document.getElementById("temperatureChart"),

    {
        type: "line",

        data: {

            labels: timeLabels,

            datasets: [

                {
                    label: "Temperature",

                    data: temperatureData,

                    borderColor: "#e52b20",

                    backgroundColor: "transparent",

                    tension: 0.3,

                    pointRadius: 3,

                    borderWidth: 2
                }

            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {

                    min: 20,

                    max: 40
                },

                x: {

                    ticks: {

                        maxTicksLimit: 7
                    }
                }

            }
        }
    }

);


// ===============================
// HUMIDITY GRAPH
// ===============================

new Chart(

    document.getElementById("humidityChart"),

    {

        type: "line",

        data: {

            labels: timeLabels,

            datasets: [

                {

                    label: "Humidity",

                    data: humidityData,

                    borderColor: "#249447",

                    backgroundColor: "transparent",

                    tension: 0.3,

                    pointRadius: 3,

                    borderWidth: 2

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    min: 30,

                    max: 80

                },

                x: {

                    ticks: {

                        maxTicksLimit: 7

                    }

                }

            }

        }

    }

);


// ===============================
// AIR QUALITY GRAPH
// ===============================

new Chart(

    document.getElementById("airQualityChart"),

    {

        type: "line",

        data: {

            labels: timeLabels,

            datasets: [

                {

                    label: "Air Quality",

                    data: airQualityData,

                    borderColor: "#086bc5",

                    backgroundColor: "transparent",

                    tension: 0.3,

                    pointRadius: 3,

                    borderWidth: 2

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    min: 400,

                    max: 1400

                },

                x: {

                    ticks: {

                        maxTicksLimit: 7

                    }

                }

            }

        }

    }

);


// ===============================
// AIR QUALITY STATUS
// ===============================

function updateStatus(value) {

    const statusElement =
        document.getElementById("status");


    statusElement.classList.remove(
        "good",
        "moderate",
        "poor"
    );


    if (value < 1000) {

        statusElement.innerText = "GOOD";

        statusElement.classList.add("good");

    }

    else if (value < 2000) {

        statusElement.innerText = "MODERATE";

        statusElement.classList.add("moderate");

    }

    else {

        statusElement.innerText = "POOR";

        statusElement.classList.add("poor");

    }

}


// Initial status

updateStatus(812);


// ===============================
// CURRENT TIME
// ===============================

function updateTime() {

    const now = new Date();

    const time =
        now.toLocaleTimeString();

    document.getElementById(
        "lastUpdated"
    ).innerText = time;
}


updateTime();

const CHANNEL_ID = "3556105";

const API_URL =
  `https://api.thingspeak.com/update?api_key=U6E6DCMHQX62A9PE&field1=0`;

function createChart(canvasId, label, color) {
  return new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

const gasChart = createChart(
  "gasChart", "Gas Level (Raw ADC)", "#ef4444"
);

const tempChart = createChart(
  "tempChart", "Temperature (°C)", "#f59e0b"
);

const humChart = createChart(
  "humChart", "Humidity (%)", "#3b82f6"
);

function updateChart(chart, labels, values) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.update();
}

async function fetchSensorData() {
  const status = document.getElementById("connectionStatus");

  try {
    const response = await fetch(API_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    const feeds = result.feeds || [];

    if (feeds.length === 0) {
      status.textContent = "No sensor data available";
      return;
    }

    const labels = feeds.map(item =>
      new Date(item.created_at).toLocaleTimeString()
    );

    const values = (field) =>
      feeds.map(item =>
        item[field] == null ? null : Number(item[field])
      );

    updateChart(gasChart, labels, values("field1"));
    updateChart(tempChart, labels, values("field2"));
    updateChart(humChart, labels, values("field3"));

    const latest = feeds[feeds.length - 1];

    document.getElementById("gasValue").textContent =
      latest.field1 ?? "--";

    document.getElementById("tempValue").textContent =
      latest.field2 ?? "--";

    document.getElementById("humValue").textContent =
      latest.field3 ?? "--";

    const lastUpdate = new Date(latest.created_at);
    status.textContent =
      "Last sensor update: " + lastUpdate.toLocaleString();

  } catch (error) {
    status.textContent = "Cloud connection failed";
    console.error(error);
  }
}

fetchSensorData();
setInterval(fetchSensorData, 20000);
