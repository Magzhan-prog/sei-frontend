import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Вспомогательная функция для получения цвета из палитры
const getColor = (index) => {
  const colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
  ];
  return colors[index % colors.length];
};

const LineChart = ({ data }) => {
  // Если данных нет или массив пуст, возвращаем сообщение
  if (!data || data.length === 0) {
    return <div>Нет данных для отображения графика</div>;
  }

  // Если данные переданы в виде строки, парсим их
  data = typeof data === "string" ? JSON.parse(data) : data;

  const sampleObj = data[0];

  // Фильтруем ключи, оставляя те, которые содержат 4 цифры и символы "г" или "год"
  // Регулярное выражение: ищем 4 цифры, затем возможный пробел и "г" или "год" с опциональной точкой.
  let years = Object.keys(sampleObj).filter((key) =>
    /(\d{4})\s*г(?:од)?\.?/i.test(key)
  );

  // Сортируем ключи по возрастанию, извлекая 4-значное число (год) из строки
  years.sort((a, b) => {
    const matchA = a.match(/(\d{4})/);
    const matchB = b.match(/(\d{4})/);
    const yearA = matchA ? parseInt(matchA[1], 10) : 0;
    const yearB = matchB ? parseInt(matchB[1], 10) : 0;
    return yearA - yearB;
  });

  // Состояние для количества отображаемых столбцов: "7", "10" или "all"
  const [visibleCount, setVisibleCount] = useState("7");

  // Если выбрано "all", показываем все, иначе берем последние N ключей
  const visibleYears = visibleCount === "all" ? years : years.slice(-parseInt(visibleCount));

  // Формируем datasets для каждого объекта
  const datasets = data.map((item, index) => {
    const seriesData = visibleYears.map((year) => parseFloat(item[year]));
    return {
      label: item.text || `Серия ${index + 1}`,
      data: seriesData,
      borderColor: getColor(index),
      backgroundColor: getColor(index),
      fill: false,
    };
  });

  // Объект с данными для графика
  const chartData = {
    labels: visibleYears, // ось X – выбранные годы
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Линейный график' },
    },
  };

  // Обработчик изменения количества отображаемых столбцов
  const handleVisibleCountChange = (event) => {
    setVisibleCount(event.target.value);
  };

  return (
    <div>
      <FormControl variant="outlined" style={{ minWidth: 120, marginBottom: 16 }}>
        <InputLabel id="visible-count-label">Столбцов</InputLabel>
        <Select
          labelId="visible-count-label"
          id="visible-count-select"
          value={visibleCount}
          onChange={handleVisibleCountChange}
          label="Столбцов"
        >
          <MenuItem value="7">7</MenuItem>
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="all">Все</MenuItem>
        </Select>
      </FormControl>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
