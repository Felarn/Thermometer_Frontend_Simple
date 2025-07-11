console.log('script loaded');

let chart = null;
// Пример данных
const doShit = (data) => {
  const timeData = data.time; // Unix Epoch
  const tempData = data.temp; // °C

  // Конвертация времени в читаемый формат
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Создание графика
  const ctx = document.getElementById('tempChart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeData.map(formatDate),
      datasets: [
        {
          label: 'Температура (°C)',
          data: tempData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Время',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Температура (°C)',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          suggestedMin: Math.min(...tempData) - 2,
          suggestedMax: Math.max(...tempData) + 2,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => formatDate(timeData[items[0].dataIndex]),
            label: (context) => `Температура: ${context.parsed.y}°C`,
          },
        },
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
  chart.update();
};

function addDataPoint(timestamp, temperature) {
  // Добавляем новую точку в конец набора данных
  chart.data.datasets[0].data.push({
    x: timestamp,
    y: temperature,
  });

  // Обновляем график с анимацией
  chart.update();
}

setInterval(() => {
  addDataPoint(Date.now(), Math.random() * 50);
}, 1000);
setInterval(() => {
  fetch('https://82.202.142.29:443')
    .then((resp) => resp.json())
    .then(doShit);
}, 1000);
