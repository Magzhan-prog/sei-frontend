import React, { useState } from "react";
import DataTable from "./TestTable";

const ParentComponent = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  // Функция, которая будет вызвана из DataTable при изменении выбранных строк
  const handleSelectedRowsChange = (rows) => {
    setSelectedRows(rows);
  };

  return (
    <div>
      <h1>Родительский компонент</h1>
      {/* Передаём DataTable необходимые параметры и callback */}
      <DataTable 
        queryParams={{ /* здесь можно передать необходимые параметры запроса */ }} 
        onSelectedRowsChange={handleSelectedRowsChange} 
      />

      <div style={{ marginTop: "20px" }}>
        <h2>Выбранные строки:</h2>
        <ul>
          {selectedRows.map((row) => (
            <li key={row.id}>
              {row.text} (ID: {row.id})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ParentComponent;
