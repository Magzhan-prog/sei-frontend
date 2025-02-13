import React, { useState, useEffect } from "react";
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
  Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import * as XLSX from "xlsx";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [columns, setColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [numberFormat, setNumberFormat] = useState("default");

  const p_index_id = 18789901;
  const p_period_id = 8;
  const p_terms = "247783,741917";
  const p_term_id = 247783;
  const p_dicIds = "67,749";
  const idx = 0;

  useEffect(() => {
    fetchData();
  }, []);

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
            {row.leaf === "false" && (
              <IconButton
                onClick={() => handleRowExpand(row.id, row.leaf)}
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
            <TableCell key={column} sx={{ padding: "6px 12px", fontSize: "14px" }}>
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

  const formatNumber = (num) => {
    if (isNaN(num)) return num;

    const n = parseFloat(num);

    switch (numberFormat) {
      case "thousands":
        return (
          new Intl.NumberFormat("ru-RU", {
            style: "decimal",
            maximumFractionDigits: 0,
          }).format(n / 1_000) + " тыс"
        );
      case "millions":
        return (
          new Intl.NumberFormat("ru-RU", {
            style: "decimal",
            maximumFractionDigits: 0,
          }).format(n / 1_000_000) + " млн"
        );
      default:
        return new Intl.NumberFormat("ru-RU", { style: "decimal" }).format(n);
    }
  };

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

  // Рекурсивная функция для подготовки данных в плоский формат для Excel
  const getExcelRows = (rows, level = 0) => {
    return rows.map((row) => {
      const rowData = visibleColumns.reduce((acc, col) => {
        acc[col] = row[col] ? formatNumber(row[col]) : "--";
        return acc;
      }, {});
      rowData["text"] = row.text;

      // Создаем вложенные строки, добавляя уровень
      const children = row.children ? getExcelRows(row.children, level + 1) : [];
      const rowWithLevel = { ...rowData, level };

      return [rowWithLevel, ...children]; // Сначала родитель, потом дети
    }).flat();
  };

  // Функция для скачивания таблицы в Excel
  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const wsData = getExcelRows(data);

    // Формируем заголовки столбцов
    const header = ["Уровень", "Наименование", ...visibleColumns];

    const ws = XLSX.utils.json_to_sheet(
      wsData.map((row) => ({
        "Уровень": row.level,
        "Наименование": row.text,
        ...visibleColumns.reduce((acc, col) => {
          acc[col] = row[col] || "--";
          return acc;
        }, {})
      })),
      { header }
    );
    
    XLSX.utils.book_append_sheet(wb, ws, "Таблица");
    XLSX.writeFile(wb, "data_table.xlsx");
  };

  return (
    <div>
      <FormControl sx={{ marginBottom: 2, marginRight: 2, width: "220px" }}>
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

      <FormControl sx={{ marginBottom: 2, marginRight: 2, width: "220px" }}>
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

      <TableContainer
        component={Paper}
        sx={{ borderRadius: "8px", maxHeight: "500px", boxShadow: 2 }}
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

      <Button
        variant="contained"
        onClick={downloadExcel}
        sx={{
          marginTop: 2,
          backgroundColor: "#00796b",
          "&:hover": {
            backgroundColor: "#004d40",
          },
        }}
      >
        Скачать в Excel
      </Button>
    </div>
  );
};

export default DataTable;
