import React, { useState, useMemo, useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
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

const PieChartByYear = ({ data }) => {
  // Преобразуем данные, если они переданы в виде строки
  data = typeof data === "string" ? JSON.parse(data) : data;

  // Состояние для выбранного года
  const [selectedYear, setSelectedYear] = useState("");

  // Вычисляем доступные года из ключей первого объекта данных
  const availableYears = useMemo(() => {
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]);
      // Регулярное выражение для ключей, содержащих 4 цифры и "г" или "год"
      const years = keys.filter((key) => /(\d{4})\s*г(?:од)?\.?/i.test(key));
      years.sort(
        (a, b) =>
          parseInt(a.match(/(\d{4})/)[1], 10) -
          parseInt(b.match(/(\d{4})/)[1], 10)
      );
      return years;
    }
    return [];
  }, [data]);

  // При наличии доступных лет устанавливаем выбранный год по умолчанию (последний)
  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      const defaultYear = availableYears[availableYears.length - 1];
      setSelectedYear(defaultYear);
    }
  }, [availableYears, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Формируем данные для графика: подписи – названия регионов, значения – данные для выбранного года
  const chartData = {
    labels: data.map((item) => item.text),
    datasets: [
      {
        label: selectedYear,
        data: data.map((item) => parseFloat(item[selectedYear])),
        backgroundColor: data.map((_, index) => getColor(index)),
        borderColor: data.map((_, index) =>
          getColor(index).replace("0.7", "1")
        ),
        borderWidth: 1,
      },
    ],
  };

  // Опции графика, включая вычисление процентов в tooltip
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

  // Ref для контейнера, который будет экспортирован (только область графика)
  const chartContainerRef = useRef(null);

  // Функция для скачивания изображения без кнопок
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
    <Box
      sx={{ maxWidth: 600, margin: "0 auto", p: 2, backgroundColor: "#fff" }}
    >
      {/* Область экспорта: только выбор года и график */}
      <Typography variant="h6">Выберите год:</Typography>
      <FormControl fullWidth sx={{ mt: 2 }}>
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
      <Box ref={chartContainerRef} sx={{marginLeft:2}}>
        {selectedYear && <Pie data={chartData} options={options} />}
      </Box>

      {/* Кнопки скачивания расположены вне экспортируемой области */}
      <Box
        sx={{
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

export default PieChartByYear;
