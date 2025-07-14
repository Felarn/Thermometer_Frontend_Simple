console.log('script loaded');

let chart = null;
// Пример данных

const doShit = (data) => {
  const timeData = data.time;
  const tempData = data.temp;
  const minTemp = Math.min(data.temp);
  const maxTemp = Math.max(data.temp);

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
      labels: timeData.map((timestamp) =>
        new Date(timestamp).toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
        })
      ),
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
          suggestedMin: minTemp - 2,
          suggestedMax: maxTemp + 2,
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

const refreshData = () => {
  fetch('https://felarn.fun')
    .then((resp) => resp.json())
    .then(doShit)
    .then(() => setTimeout(refreshData, 1000));
};

refreshData();
