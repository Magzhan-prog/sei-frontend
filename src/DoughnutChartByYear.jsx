import React, { useState, useMemo, useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import domtoimage from "dom-to-image";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";

// Регистрируем необходимые элементы Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Вспомогательная функция для выбора цвета из палитры
const getColor = (index) => {
  const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "rgba(199, 199, 199, 0.7)",
  ];
  return colors[index % colors.length];
};

const DoughnutChartByYear = ({ data }) => {
  // Если данные переданы в виде строки, преобразуем их в объект
  data = typeof data === "string" ? JSON.parse(data) : data;

  // Если данных нет или массив пуст, выводим сообщение
  if (!data || data.length === 0) {
    return <div>Нет данных для отображения графика</div>;
  }

  // Вычисляем уникальные доступные года из ключей первого объекта
  const availableYears = useMemo(() => {
    const keys = Object.keys(data[0]);
    const years = keys.reduce((acc, key) => {
      // Ищем 4-значное число в конце строки (после пробела и "г." или "год")
      const match = key.match(/(\d{4})\s*г(?:од)?\.?$/i);
      if (match) {
        acc.push(match[1]);
      }
      return acc;
    }, []);
    // Оставляем уникальные года и сортируем по возрастанию
    return [...new Set(years)].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [data]);

  // Состояние для выбранного года (строка, например "2011")
  const [selectedYear, setSelectedYear] = useState("");

  // Устанавливаем выбранный год по умолчанию – последний из доступных – если он ещё не выбран
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Для каждого объекта данных агрегируем (суммируем) все значения, ключи которых соответствуют выбранному году.
  // Используем регулярное выражение, которое ищет выбранный год в конце строки.
  const aggregatedValues = data.map((item) => {
    let sum = 0;
    Object.keys(item).forEach((key) => {
      const regex = new RegExp(`\\b${selectedYear}\\s*г(?:од)?\\.?$`, "i");
      if (regex.test(key)) {
        const value = parseFloat(item[key]);
        if (!isNaN(value)) {
          sum += value;
        }
      }
    });
    return sum;
  });

  // Формируем данные для графика:
  // - labels: названия регионов (поле text)
  // - dataset: агрегированные значения за выбранный год
  const chartData = {
    labels: data.map((item) => item.text),
    datasets: [
      {
        label: selectedYear,
        data: aggregatedValues,
        backgroundColor: data.map((_, index) => getColor(index)),
        borderColor: data.map((_, index) =>
          getColor(index).replace("0.7", "1")
        ),
        borderWidth: 1,
      },
    ],
  };

  // Опции графика, включая tooltip с процентами
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      title: {
        display: true,
        text: `Распределение значений за ${selectedYear}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, cur) => acc + cur, 0);
            const currentValue = dataset.data[context.dataIndex];
            const percentage = total
              ? ((currentValue / total) * 100).toFixed(2)
              : 0;
            return `${context.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Создаем ref для области графика (без кнопок)
  const chartContainerRef = useRef(null);

  // Функция для скачивания графика в выбранном формате (PNG, JPG, SVG)
  const handleDownloadImage = (format) => {
    if (!chartContainerRef.current) return;
    let promise;
    if (format === "png") {
      promise = domtoimage.toPng(chartContainerRef.current);
    } else if (format === "jpg") {
      promise = domtoimage.toJpeg(chartContainerRef.current, { quality: 0.95 });
    } else if (format === "svg") {
      promise = domtoimage.toSvg(chartContainerRef.current);
    }
    promise
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `chart.${format}`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Ошибка при экспорте графика:", error);
      });
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Выберите год:
      </Typography>
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="year-select-label">Год</InputLabel>
        <Select
          labelId="year-select-label"
          id="year-select"
          value={selectedYear}
          label="Год"
          onChange={handleYearChange}
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Область графика, которая будет экспортироваться */}
      <Box
        ref={chartContainerRef}
        sx={{
          p: 2,
          backgroundColor: "#fff",
        }}
      >
        {selectedYear && <Doughnut data={chartData} options={options} />}
      </Box>
      
      {/* Кнопки скачивания расположены вне экспортируемой области */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button variant="contained" onClick={() => handleDownloadImage("png")}>
          Скачать PNG
        </Button>
        <Button variant="contained" onClick={() => handleDownloadImage("jpg")}>
          Скачать JPG
        </Button>
        <Button variant="contained" onClick={() => handleDownloadImage("svg")}>
          Скачать SVG
        </Button>
      </Box>
    </Box>
  );
};

export default DoughnutChartByYear;
