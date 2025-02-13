import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import * as XLSX from "xlsx";

const DataTableComponent = ({ data }) => {
  // Если данные переданы в виде строки, пытаемся их распарсить
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      return <div>Ошибка парсинга данных</div>;
    }
  }

  // Если данных нет или они не являются массивом, выводим сообщение
  if (!Array.isArray(data) || data.length === 0) {
    return <div>Нет данных для отображения</div>;
  }

  // Получаем список всех столбцов из ключей первого объекта,
  // исключая "id" и "leaf"
  const allColumns = Object.keys(data[0]).filter(
    (col) => col !== "id" && col !== "leaf"
  );

  // Отделяем столбец "text" (который будет показан как "Наименование")
  const textColumn = allColumns.find((col) => col === "text");
  let otherColumns = allColumns.filter((col) => col !== "text");

  // Сортируем остальные столбцы по возрастанию года, извлекая 4-значное число
  // Предполагается, что столбцы содержат год в формате "2010 г." или "2010 год"
  otherColumns.sort((a, b) => {
    const matchA = a.match(/(\d{4})/);
    const matchB = b.match(/(\d{4})/);
    const yearA = matchA ? parseInt(matchA[1], 10) : 0;
    const yearB = matchB ? parseInt(matchB[1], 10) : 0;
    return yearA - yearB;
  });

  // Состояние для выбора количества отображаемых столбцов (без столбца "text")
  const [visibleCount, setVisibleCount] = useState("7");

  // Вычисляем видимые столбцы из остальных: если выбрано "all" — показываем все,
  // иначе берем последние N элементов (ближе к актуальной дате)
  const visibleDataColumns =
    visibleCount === "all"
      ? otherColumns
      : otherColumns.slice(-parseInt(visibleCount, 10));

  // Итоговый список столбцов: столбец "text" всегда первым, затем выбранные столбцы данных
  const visibleColumns = textColumn
    ? [textColumn, ...visibleDataColumns]
    : visibleDataColumns;

  // Обработчик изменения количества отображаемых столбцов
  const handleVisibleCountChange = (event) => {
    setVisibleCount(event.target.value);
  };

  // Функция для скачивания таблицы в Excel формате
  const downloadExcel = () => {
    // Создаем заголовок для файла (если столбец равен "text", заменяем на "Наименование")
    const header = visibleColumns.map((col) =>
      col === "text" ? "Наименование" : col
    );

    // Формируем массив строк из данных – только видимые столбцы
    const rows = data.map((row) => {
      const rowObj = {};
      visibleColumns.forEach((col) => {
        rowObj[col === "text" ? "Наименование" : col] = row[col];
      });
      return rowObj;
    });

    // Создаем рабочий лист и книгу
    const worksheet = XLSX.utils.json_to_sheet(rows, { header });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    // Сохраняем книгу как data.xlsx
    XLSX.writeFile(workbook, "data.xlsx");
  };

  return (
    <div>
      {/* Выпадающий список для выбора количества столбцов */}
      <FormControl
        variant="outlined"
        style={{ minWidth: 120, marginBottom: 16, marginRight: 16 }}
      >
        <InputLabel id="column-select-label">Столбцов</InputLabel>
        <Select
          labelId="column-select-label"
          id="column-select"
          value={visibleCount}
          onChange={handleVisibleCountChange}
          label="Столбцов"
        >
          <MenuItem value="7">7</MenuItem>
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="all">Все</MenuItem>
        </Select>
      </FormControl>

      

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => {
                const headerTitle = col === "text" ? "Наименование" : col;
                return (
                  <TableCell key={col} sx={{ fontWeight: "bold" }}>
                    {headerTitle}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex}>
                {visibleColumns.map((col) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Кнопка для скачивания таблицы в Excel */}
      <Button
        variant="contained"
        onClick={downloadExcel}
        style={{ marginTop: 16 }}
      >
        Скачать в Excel
      </Button>
    </div>
  );
};

export default DataTableComponent;
