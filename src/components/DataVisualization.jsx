import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const DataVisualization = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [yearFilter, setYearFilter] = useState(7);
  const chartRef = useRef(null);

  useEffect(() => {
    if (data?.length && data[0].children) {
      const years = Object.keys(data[0])
        .filter((key) => key.includes("год"))
        .sort((a, b) => a.localeCompare(b)) // Сортировка по возрастанию
        .slice(0, yearFilter === "all" ? undefined : yearFilter);

      setChartData(
        years.map((year) => ({
          year,
          ...Object.fromEntries(
            data[0].children.map((region) => [
              region.text,
              Number(region[year]) || 0,
            ])
          ),
        }))
      );
    }
  }, [data, yearFilter]);

  const downloadChart = (format) => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.href =
          format === "svg"
            ? canvas.toDataURL("image/svg+xml")
            : canvas.toDataURL(`image/${format}`);
        link.download = `chart.${format}`;
        link.click();
      });
    }
  };

  const downloadPDF = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 10, 10, 180, 160); // Добавляем картинку на PDF
        pdf.save("chart.pdf"); // Сохраняем PDF
      });
    }
  };

  const actions = [
    {
      icon: <InsertPhotoIcon />,
      name: "PNG",
      onclick: () => downloadChart("png"),
    },
    {
      icon: <InsertDriveFileIcon />,
      name: "SVG",
      onclick: () => downloadChart("svg"),
    },
    { icon: <PictureAsPdfIcon />, name: "PDF", onclick: downloadPDF },
  ];

  if (!chartData.length)
    return <Typography sx={{ p: 1, fontSize: 14 }}>Нет данных</Typography>;

  return (
    <Card sx={{ boxShadow: 3, p: 1, m: 1 }}>
      <CardContent sx={{ p: 1 }}>
        <Typography variant="h6" sx={{ fontSize: 16, mb: 1 }}>
          Линейный график
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "right", mb: 1 }}>
          {/* Кнопка выбора формата отображения */}
          <FormControl size="small" sx={{ fontSize: 12, mr: 1 }}>
            <InputLabel id="gperiod-label">Период</InputLabel>
            <Select
              labelId="gperiod-label"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              label="Формат"
              size="small"
              sx={{ fontSize: 12, mb: 1 }}
            >
              <MenuItem value={3}>Последние 3 года</MenuItem>
              <MenuItem value={5}>Последние 5 лет</MenuItem>
              <MenuItem value={7}>Последние 7 лет</MenuItem>
              <MenuItem value="all">Все года</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ left: 30, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={60} />
              <Tooltip itemStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {data[0].children.map((region, i) => (
                <Line
                  key={region.id || i}
                  type="monotone"
                  dataKey={region.text}
                  stroke={`hsl(${i * 30}, 70%, 50%)`}
                  strokeWidth={1.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Box
          sx={{
            marginTop: 10,
            height: 0,
            transform: "translateZ(0px)",
            flexGrow: 1,
          }}
        >
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: "absolute", bottom: 1, right: 16 }}
            icon={<SaveIcon />}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.onclick}
              />
            ))}
          </SpeedDial>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataVisualization;
