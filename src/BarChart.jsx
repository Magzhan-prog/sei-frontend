import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Регистрируем необходимые элементы для построения столбчатого графика
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Вспомогательная функция для выбора цвета из палитры
const getColor = (index) => {
  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
  ];
  return colors[index % colors.length];
};

const BarChart = ({ data }) => {
  // Если данные переданы как строка, преобразуем их в объект
  data = typeof data === "string" ? JSON.parse(data) : data;
  
  // Если данных нет или массив пуст, возвращаем сообщение
  if (!data || data.length === 0) {
    return <div>Нет данных для отображения графика</div>;
  }

  // Состояние для выбора количества отображаемых столбцов (7, 10 или all)
  const [visibleCount, setVisibleCount] = useState("7");

  const sampleObj = data[0];

  // Фильтруем ключи, оставляя те, которые соответствуют формату: заканчиваются на "г." (например, "Октябрь 2017 г.")
  let keys = Object.keys(sampleObj).filter((key) =>
    /\d{4}\s*г\.?$/i.test(key)
  );

  // Сортируем ключи по возрастанию, извлекая 4-значное число (год) из строки
  keys.sort((a, b) => {
    const matchA = a.match(/(\d{4})/);
    const matchB = b.match(/(\d{4})/);
    const yearA = matchA ? parseInt(matchA[1], 10) : 0;
    const yearB = matchB ? parseInt(matchB[1], 10) : 0;
    return yearA - yearB;
  });

  // Вычисляем видимые ключи:
  // Если выбрано "all", показываем все, иначе берём последние N ключей (ближе к актуальной дате)
  const visibleKeys = visibleCount === "all" ? keys : keys.slice(-parseInt(visibleCount, 10));

  // Формируем подписи оси X на основе выбранных ключей
  const labels = visibleKeys;

  // Формируем наборы данных для каждого объекта с использованием только видимых ключей
  const datasets = data.map((item, index) => {
    const seriesData = visibleKeys.map((key) => parseFloat(item[key]));
    return {
      label: item.text || `Серия ${index + 1}`,
      data: seriesData,
      backgroundColor: getColor(index),
      borderColor: getColor(index),
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Столбчатый график' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Обработчик выбора количества отображаемых столбцов
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
