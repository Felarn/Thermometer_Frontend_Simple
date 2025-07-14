console.log('script loaded');

let chart = null;
// Пример данных
const pointsTarget = 1000;

const median = (arr) => arr.sort().at(Math.floor(arr.length / 2));

const decemate = (data) => {
  const dataLen = data.temp.length;
  console.log('DEC' + dataLen);
  const step = Math.floor(dataLen / pointsTarget);
  const decematedData = { time: [], min: [], median: [], max: [], mean: [] };
  for (let i = 0; i < dataLen; i += step) {
    const slice = data.temp.slice(i, i + step);
    decematedData.time.push(data.time.at(i));
    decematedData.max.push(Math.max(...slice));
    decematedData.median.push(median(slice));
    decematedData.mean.push(
      slice.reduce((acc, item) => acc + item, 0) / slice.length
    );
    decematedData.min.push(Math.min(...slice));
  }

  return decematedData;
};

const doShit = (data) => {
  console.log(data.time.length);
  // const timeData = data.time.slice(-100);
  // const tempData = data.temp.slice(-100);
  const timeData = data.time;
  const dataMin = data.min;
  const dataMean = data.mean;
  const dataMedian = data.median;
  const dataMax = data.max;
  const minTemp = Math.min(data.temp) - 2;
  const maxTemp = Math.max(data.temp) + 2;

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
          lineTension: 0,
          label: 'среднее (°C)',
          data: dataMean,
          borderColor: 'rgba(230, 181, 22, 1)',
          backgroundColor: 'rgba(230, 181, 22, 1)',
          borderWidth: 4,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
        {
          lineTension: 0,
          label: 'Медиана (°C)',
          data: dataMedian,
          borderColor: 'rgba(79, 221, 44, 1)',
          backgroundColor: 'rgba(79, 221, 44, 1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
        {
          lineTension: 0,
          label: 'Минимум (°C)',
          data: dataMin,
          borderColor: 'rgba(44, 180, 221, 1)',
          backgroundColor: 'rgba(44, 180, 221, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
        {
          lineTension: 0,
          label: 'Максимум (°C)',
          data: dataMax,
          borderColor: 'rgba(255, 0, 0, 1)',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: '-1',
          tension: 0,
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
          suggestedMin: minTemp,
          suggestedMax: maxTemp,
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
    // .then((data) =>
    //   decemate({ time: data.time.slice(-1000), temp: data.temp.slice(-1000) })
    // )
    .then(decemate)
    .then(doShit)
    .then(() => setTimeout(refreshData, 1000));
};

refreshData();
