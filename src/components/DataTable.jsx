import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  Box,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  TableFooter,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import * as XLSX from "xlsx";

const DataTable = ({ data, indexAttributes }) => {
  if (!data || data.length === 0)
    return (
      <Typography variant="h6" gutterBottom>
        Нет данных
      </Typography>
    );

  // Получаем список всех годов и сортируем по возрастанию
  const allYears = [
    ...new Set(
      data.flatMap((region) =>
        Object.keys(region).filter((key) => key.includes("год"))
      )
    ),
  ].sort();

  // По умолчанию берем последние 7 лет
  const [visibleYearsCount, setVisibleYearsCount] = useState(7);
  const visibleYears = allYears.slice(-visibleYearsCount);

  // Состояние для хранения открытых регионов
  const [expandedRows, setExpandedRows] = useState({});

  // Состояние для формата отображения (тысячи или миллионы)
  const [numberFormat, setNumberFormat] = useState("thousands"); // "thousands" или "millions"

  // Функция переключения состояния (открыть/закрыть)
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Функция форматирования числа в зависимости от формата (тысячи или миллионы)
  const formatNumber = (num) => {
    if (num === "-" || num == null) return "-";
    const value = parseFloat(num);
    if (numberFormat === "millions") {
      return (value / 1000000).toFixed(2) + " млн.";
    } else if (numberFormat === "thousands") {
      return (value / 1000).toFixed(2) + " тыс.";
    } else if (numberFormat === "nochanges") {
      return value;
    }
    return num;
  };

  // Функция экспорта данных в Excel
  const exportToExcel = () => {
    const formattedData = [];

    data.forEach((region) => {
      // Добавляем родительский регион
      const row = { Наименование: region.text };
      visibleYears.forEach((year) => {
        row[year] = formatNumber(region[year]);
      });
      formattedData.push(row);

      // Добавляем дочерние регионы
      region.children?.forEach((subRegion) => {
        const subRow = { Наименование: `  ${subRegion.text}` };
        visibleYears.forEach((year) => {
          subRow[year] = formatNumber(subRegion[year]);
        });
        formattedData.push(subRow);
      });
    });

    // Создаем лист Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Данные");

    // Скачиваем файл
    XLSX.writeFile(workbook, "данные.xlsx");
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "99%", maxHeight: "99%", margin: "auto", mt: 1, p: 1 }}
    >
      <Box sx={{ display: "flex", justifyContent: "right", mb: 1 }}>
        {/* Кнопка выбора формата отображения */}
        <FormControl size="small" sx={{ fontSize: 12, mr: 1 }}>
          <InputLabel id="number-format-label">Формат</InputLabel>
          <Select
            labelId="number-format-label"
            value={numberFormat}
            onChange={(e) => setNumberFormat(e.target.value)}
            label="Формат"
            size="small"
            sx={{ fontSize: 12 }}
          >
            <MenuItem value="nochanges">Без изменений</MenuItem>
            <MenuItem value="thousands">Тысячи</MenuItem>
            <MenuItem value="millions">Миллионы</MenuItem>
          </Select>
        </FormControl>

        {/* Фильтр количества отображаемых лет */}
        <FormControl size="small" sx={{ fontSize: 12 }}>
          <InputLabel id="number-format-label">Период</InputLabel>
          <Select
            value={visibleYearsCount}
            onChange={(e) => setVisibleYearsCount(e.target.value)}
            size="small"
            sx={{ fontSize: 12 }}
            label="Период"
          >
            {[3, 5, 7, allYears.length].map((num) => (
              <MenuItem key={num} value={num}>
                Последние {num} {num === 3 ? "года" : "лет"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", fontSize: 13, py: 0.5 }}>
              Наименование
            </TableCell>
            {visibleYears.map((year) => (
              <TableCell
                key={year}
                align="right"
                sx={{ fontWeight: "bold", fontSize: 13, py: 0.5 }}
              >
                {year}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((region) => {
            const isExpanded = expandedRows[region.id] || false;

            return (
              <React.Fragment key={region.id}>
                {/* Основной регион */}
                <TableRow
                  sx={{ backgroundColor: "#f5f5f5", cursor: "pointer" }}
                  onClick={() => toggleRow(region.id)}
                >
                  <TableCell sx={{ fontWeight: "bold", fontSize: 12, py: 0.5 }}>
                    <IconButton size="small">
                      {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    {region.text}
                  </TableCell>
                  {visibleYears.map((year) => (
                    <TableCell
                      key={year}
                      align="right"
                      sx={{ fontSize: 12, py: 0.5 }}
                    >
                      {formatNumber(region[year])}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Дочерние регионы (показываем только если isExpanded === true) */}
                {isExpanded &&
                  region.children?.map((subRegion) => (
                    <TableRow key={subRegion.id}>
                      <TableCell sx={{ pl: 4, fontSize: 12, py: 0.5 }}>
                        {subRegion.text}
                      </TableCell>
                      {visibleYears.map((year) => (
                        <TableCell
                          key={year}
                          align="right"
                          sx={{ fontSize: 12, py: 0.5 }}
                        >
                          {formatNumber(subRegion[year])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </React.Fragment>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <Typography variant="body2" color="textSecondary">
                Наименование единицы измерения:
              </Typography>
              <Typography
                variant="body2"
                style={{ fontStyle: "italic", color: "#007bff" }}
              >
                {indexAttributes["measureName"]}
              </Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Box sx={{ display: "flex", justifyContent: "right", mt: 1 }}>
        {/* Кнопка экспорта в Excel */}
        <Button variant="contained" size="small" onClick={exportToExcel}>
          Экспорт в Excel
        </Button>
      </Box>
    </TableContainer>
  );
};

export default DataTable;
