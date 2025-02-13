import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Box,
  Checkbox,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import * as XLSX from "xlsx";
import domtoimage from "dom-to-image";
import GetIndexAttributes from "./components/GetInfexAttributes";
import useFetchData from "./hooks/useFetchData";
import { BACKEND_API } from "./constants/constants";
import { Item } from "./components/Item";

// Импорт для линейного графика
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Компонент для работы с вкладками (Tabs)
import PropTypes from "prop-types";
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// Основной компонент DataTable
// Принимает опциональный пропс queryParams, если они не переданы – используются значения по умолчанию.
const DataTable = ({ queryParams }) => {
  // Деструктуризация входящих параметров с указанием значений по умолчанию
  const {
    p_index_id = 18789901,
    p_period_id = 8,
    p_terms = "247783,741917",
    p_term_id = 247783,
    p_dicIds = "67,749",
    idx = 0,
  } = queryParams || {};

  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [columns, setColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [numberFormat, setNumberFormat] = useState("default");
  const [selectedRows, setSelectedRows] = useState([]); // Выбранные строки (чекбоксы)
  const [value, setValue] = useState(0); // для Tabs

  // ref для контейнера графика (для экспорта)
  const chartRef = useRef(null);

  // Получаем атрибуты показателя (например, название, иерархию и т.д.)
  const { data: indexAttributes, loading: loadingIndexAttributes } =
    useFetchData(
      p_index_id && p_period_id
        ? BACKEND_API +
            `get_index_attributes?indexId=${p_index_id}&periodId=${p_period_id}`
        : null,
      []
    );

  // Загрузка данных таблицы (дерева) при монтировании компонента
  useEffect(() => {
    fetchData();
  }, []);

  // Функция запроса данных (дерево) с использованием axios
  const fetchData = (parentId = null) => {
    const url = `http://localhost:8080/new_get_index_tree_data?p_measure_id=1&p_index_id=${p_index_id}&p_period_id=${p_period_id}&p_terms=${p_terms}&p_term_id=${p_term_id}&p_dicIds=${p_dicIds}&idx=${idx}${
      parentId ? `&p_parent_id=${parentId}` : ""
    }`;

    axios
      .get(url)
      .then((response) => {
        const fetchedData = response.data;
        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          if (parentId) {
            setData((prevData) =>
              updateChildData(prevData, parentId, fetchedData)
            );
          } else {
            setData(fetchedData);
            extractColumns(fetchedData);
          }
        }
      })
      .catch((error) => console.error("Ошибка при получении данных:", error));
  };

  // Рекурсивное обновление дочерних строк
  const updateChildData = (data, parentId, children) => {
    return data.map((row) => {
      if (row.id === parentId) {
        return { ...row, children };
      } else if (row.children) {
        return {
          ...row,
          children: updateChildData(row.children, parentId, children),
        };
      }
      return row;
    });
  };

  // Извлечение столбцов из данных (например, содержащих "год" или "Январь")
  const extractColumns = (fetchedData) => {
    const extractedColumns = Array.from(
      new Set(
        fetchedData.flatMap((row) =>
          Object.keys(row).filter(
            (key) => key.includes("год") || key.includes("Январь")
          )
        )
      )
    );
    setColumns(extractedColumns);
    setVisibleColumns(extractedColumns.slice(-5)); // По умолчанию показываем последние 5 столбцов
  };

  // Раскрытие строки (если у строки есть дочерние данные)
  const handleRowExpand = (id, leaf) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(id)) {
        newExpandedRows.delete(id);
      } else {
        newExpandedRows.add(id);
        if (leaf === "false") {
          fetchData(id);
        }
      }
      return newExpandedRows;
    });
  };

  // Переключение выбора строки (чекбокс)
  const toggleRowSelection = (row) => {
    setSelectedRows((prevSelected) => {
      const isSelected = prevSelected.some((r) => r.id === row.id);
      if (isSelected) {
        return prevSelected.filter((r) => r.id !== row.id);
      } else {
        return [...prevSelected, row];
      }
    });
  };

  const isRowSelected = (row) => {
    return selectedRows.some((r) => r.id === row.id);
  };

  // Рендер строк таблицы с объединённой ячейкой: чекбокс + наименование + кнопка раскрытия
  const renderRows = (rows, level = 0) => {
    return rows.map((row) => (
      <React.Fragment key={row.id}>
        <TableRow
          sx={{
            backgroundColor: level === 0 ? "#f9f9f9" : "#ffffff",
            "&:hover": {
              backgroundColor: "#f1f1f1",
            },
            transition: "background-color 0.3s ease",
          }}
        >
          <TableCell
            sx={{
              paddingLeft: `${level * 16}px`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: level === 0 ? "bold" : "normal",
              paddingY: "6px",
            }}
          >
            <Checkbox
              checked={isRowSelected(row)}
              onChange={(e) => {
                e.stopPropagation();
                toggleRowSelection(row);
              }}
            />
            {row.leaf === "false" && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowExpand(row.id, row.leaf);
                }}
                sx={{ padding: "6px", fontSize: "18px" }}
              >
                {expandedRows.has(row.id) ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </IconButton>
            )}
            {row.text}
          </TableCell>
          {visibleColumns.map((column) => (
            <TableCell
              key={column}
              sx={{ padding: "6px 12px", fontSize: "14px" }}
            >
              {row[column] ? formatNumber(row[column]) : "--"}
            </TableCell>
          ))}
        </TableRow>
        {expandedRows.has(row.id) &&
          row.children &&
          renderRows(row.children, level + 1)}
      </React.Fragment>
    ));
  };

  // Форматирование чисел для таблицы
  const formatNumber = (num) => {
    if (isNaN(num)) return num;
    const n = parseFloat(num);
    switch (numberFormat) {
      case "thousands":
        return (
          new Intl.NumberFormat("ru-RU", {
            maximumFractionDigits: 0,
          }).format(n / 1_000) + " тыс"
        );
      case "millions":
        return (
          new Intl.NumberFormat("ru-RU", {
            maximumFractionDigits: 0,
          }).format(n / 1_000_000) + " млн"
        );
      default:
        return new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: 2,
        }).format(n);
    }
  };

  // Выбор количества отображаемых столбцов
  const handleColumnSelect = (event) => {
    const selectedValue = event.target.value;
    let newVisibleColumns = [];
    if (selectedValue === "3") {
      newVisibleColumns = columns.slice(-3);
    } else if (selectedValue === "5") {
      newVisibleColumns = columns.slice(0, 5);
    } else if (selectedValue === "7") {
      newVisibleColumns = columns.slice(0, 7);
    } else if (selectedValue === "10") {
      newVisibleColumns = columns.slice(0, 10);
    } else if (selectedValue === "all") {
      newVisibleColumns = columns;
    }
    setVisibleColumns(newVisibleColumns);
  };

  const handleNumberFormatChange = (event) => {
    setNumberFormat(event.target.value);
  };

  // Рекурсивная функция для подготовки данных для экспорта в Excel
  const getExcelRows = (rows, level = 0) => {
    return rows
      .map((row) => {
        const rowData = visibleColumns.reduce((acc, col) => {
          acc[col] = row[col] ? formatNumber(row[col]) : "--";
          return acc;
        }, {});
        rowData["text"] = row.text;
        const children = row.children
          ? getExcelRows(row.children, level + 1)
          : [];
        const rowWithLevel = { ...rowData, level };
        return [rowWithLevel, ...children];
      })
      .flat();
  };

  // Экспорт в Excel
  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = getExcelRows(data);
    const header = ["Уровень", "Наименование", ...visibleColumns];
    const ws = XLSX.utils.json_to_sheet(
      wsData.map((row) => ({
        Уровень: row.level,
        Наименование: row.text,
        ...visibleColumns.reduce((acc, col) => {
          acc[col] = row[col] || "--";
          return acc;
        }, {}),
      })),
      { header }
    );
    XLSX.utils.book_append_sheet(wb, ws, "Таблица");
    XLSX.writeFile(wb, "data_table.xlsx");
  };

  // Формирование данных для линейного графика на основе выбранных строк
  const getSelectedRowsChartData = () => {
    if (selectedRows.length === 0) return null;
    const colors = [
      "rgba(75,192,192,1)",
      "rgba(255,99,132,1)",
      "rgba(54,162,235,1)",
      "rgba(255,206,86,1)",
      "rgba(153,102,255,1)",
      "rgba(255,159,64,1)",
    ];
    const datasets = selectedRows.map((row, index) => ({
      label: row.text,
      data: visibleColumns.map((col) => {
        const value = parseFloat(row[col]);
        return isNaN(value) ? 0 : value;
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      fill: false,
      tension: 0.3,
    }));
    return {
      labels: visibleColumns,
      datasets,
    };
  };

  // Форматирование значений оси Y графика
  const formatYAxisTick = (value) => {
    const n = parseFloat(value);
    switch (numberFormat) {
      case "thousands":
        return (
          new Intl.NumberFormat("ru-RU", {
            maximumFractionDigits: 0,
          }).format(n / 1000) + " тыс"
        );
      case "millions":
        return (
          new Intl.NumberFormat("ru-RU", {
            maximumFractionDigits: 0,
          }).format(n / 1000000) + " млн"
        );
      default:
        return new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: 2,
        }).format(n);
    }
  };

  // Настройки для линейного графика с кастомизацией оси Y
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Линейный график выбранных строк",
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatYAxisTick(value),
        },
      },
    },
  };

  // Функция для скачивания графика в выбранном формате (PNG, JPG, SVG)
  const handleDownloadImage = (format) => {
    if (!chartRef.current) return;
    let promise;
    if (format === "png") {
      promise = domtoimage.toPng(chartRef.current);
    } else if (format === "jpg") {
      promise = domtoimage.toJpeg(chartRef.current, { quality: 0.95 });
    } else if (format === "svg") {
      promise = domtoimage.toSvg(chartRef.current);
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

  // Обработка переключения вкладок
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Item>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Таблица" {...a11yProps(0)} />
            <Tab label="График" {...a11yProps(1)} />
            <Tab label="Паспорт показателя" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Box sx={{ paddingBottom: 2 }}>
            {indexAttributes && (
              <>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  {indexAttributes.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Иерархия:</strong> {indexAttributes.namePath}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Единица измерения:</strong>{" "}
                  {indexAttributes.preferredMeasureName || "Не указано"}
                </Typography>
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              flexWrap: "wrap",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="number-format-label">Формат чисел</InputLabel>
              <Select
                labelId="number-format-label"
                value={numberFormat}
                onChange={handleNumberFormatChange}
                label="Формат чисел"
              >
                <MenuItem value="default">Без изменений</MenuItem>
                <MenuItem value="thousands">Тысячи</MenuItem>
                <MenuItem value="millions">Миллионы</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="column-select-label">
                Выберите количество столбцов
              </InputLabel>
              <Select
                labelId="column-select-label"
                value={
                  visibleColumns.length === columns.length
                    ? "all"
                    : visibleColumns.length
                }
                onChange={handleColumnSelect}
                label="Выберите количество столбцов"
              >
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="5">5</MenuItem>
                <MenuItem value="7">7</MenuItem>
                <MenuItem value="10">10</MenuItem>
                <MenuItem value="all">Все</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "8px",
              maxHeight: "500px",
              boxShadow: 2,
              marginBottom: 2,
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", padding: "8px 16px" }}>
                    Наименование
                  </TableCell>
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column}
                      sx={{ fontWeight: "bold", padding: "8px 16px" }}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>{renderRows(data)}</TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
            <Button
              variant="contained"
              onClick={downloadExcel}
              sx={{
                backgroundColor: "#00796b",
                "&:hover": {
                  backgroundColor: "#004d40",
                },
              }}
            >
              Скачать в Excel
            </Button>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {selectedRows.length > 0 ? (
            <div ref={chartRef}>
              <Line data={getSelectedRowsChartData()} options={chartOptions} />
              <Box sx={{ display: "flex", gap: 2, margin: 3, justifyContent: "end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownloadImage("png")}
                >
                  Скачать PNG
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownloadImage("jpg")}
                >
                  Скачать JPG
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownloadImage("svg")}
                >
                  Скачать SVG
                </Button>
              </Box>
              {console.log(selectedRows)}
            </div>
          ) : (
            <Box sx={{ padding: 2, marginBottom: 2, textAlign: "center" }}>
              <div>Выберите строки для отображения графика</div>
            </Box>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <GetIndexAttributes indexAttributes={indexAttributes} />
        </CustomTabPanel>
      </Box>
    </Item>
  );
};

DataTable.propTypes = {
  // Опциональный пропс для передачи внешних параметров запроса.
  queryParams: PropTypes.shape({
    p_index_id: PropTypes.number,
    p_period_id: PropTypes.number,
    p_terms: PropTypes.string,
    p_term_id: PropTypes.number,
    p_dicIds: PropTypes.string,
    idx: PropTypes.number,
  }),
};

export default DataTable;
