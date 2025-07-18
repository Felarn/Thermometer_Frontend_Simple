console.log('script loaded');

let chart = null;
// Пример данных
const pointsTarget = 1000;

const median = (arr) => arr.sort().at(Math.floor(arr.length / 2));

// Конвертация времени в читаемый формат
const formatDateShort = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
const formatDateFull = (timestamp) =>
  new Date(timestamp).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
  });

const decemate = (data) => {
  const dataLen = data.temp.length;
  const pointsNumber = Math.min(dataLen, pointsTarget);
  console.log('DEC' + dataLen);
  const step = Math.floor(dataLen / pointsNumber);
  const decematedData = {
    time: [],
    min: [],
    median: [],
    max: [],
    mean: [],
    restartTime: [], // Новое поле для времени перезапусков
    restartCount: [], // Новое поле для счетчиков перезапусков
    latestUpadate: '',
    absMin: 2000,
    absMax: -273,
  };
  for (let i = 0; i < dataLen; i += step) {
    const slice = data.temp.slice(i, i + step);
    decematedData.time.push(data.time.at(i));
    decematedData.max.push(Math.max(...slice));
    decematedData.median.push(median(slice));
    decematedData.mean.push(
      slice.reduce((acc, item) => acc + item, 0) / slice.length
    );
    decematedData.min.push(Math.min(...slice));
    decematedData.latestUpadate = String(formatDateFull(data.time.at(-1)));
    decematedData.absMax = Math.max(
      decematedData.absMax,
      decematedData.max.at(-1)
    );
    decematedData.absMin = Math.min(
      decematedData.absMin,
      decematedData.min.at(-1)
    );
  }

  // Добавляем данные о перезапусках
  if (data.restartTime && data.restartCount) {
    decematedData.restartTime = data.restartTime;
    // decematedData.restartTime = new Date();
    decematedData.restartCount = data.restartCount;
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
  const minTemp = data.absMin - 1;
  const maxTemp = data.absMax + 1;

  // Создание графика
  const ctx = document.getElementById('tempChart').getContext('2d');
  const textHeader = document.getElementById('textHeader');
  textHeader.innerText = `Последние данные от: ${data.latestUpadate}`;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeData.map(formatDateShort),
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
        {
          type: 'scatter', // Тип графика - точечный
          label: 'Перезапуски',
          data: data.restartTime.map((time, index) => ({
            x: formatDateShort(time), // Время перезапуска
            y: 28, // Счетчик перезапусков
            // y: data.restartCount[index], // Счетчик перезапусков
          })),
          borderColor: 'rgba(153, 102, 255, 1)', // Цвет границы точек
          backgroundColor: 'rgba(153, 102, 255, 0.5)', // Цвет заливки точек
          pointRadius: 5, // Размер точек
          pointHoverRadius: 7, // Размер при наведении
          showLine: false, // Не соединять точки линиями
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
            title: (items) => formatDateShort(timeData[items[0].dataIndex]),
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
    .then(() => setTimeout(refreshData, 30000));
};

refreshData();
