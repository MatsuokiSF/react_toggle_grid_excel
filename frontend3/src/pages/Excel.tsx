//src /pages /Excel.tsx
import React, { useEffect, useState } from 'react';
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import TextEditor from 'react-data-grid';

interface ExcelProps {
  selectedFile: string;
  sheetName: string;
  data: Record<string, any>[];
}

const Excel: React.FC<ExcelProps> = ({ data, sheetName }) => {
  const [excelData, setExcelData] = useState<Record<string, any>[]>(data);

  useEffect(() => {
    if (data && data.length > 0) {
      setExcelData(data);
    }
  }, [data]);

  if (!excelData || excelData.length === 0) {
    return <div>Seleccione la planilla a mostrar.</div>;
  }

  // Definir columnas con textEditor habilitado para edición
  const columns = Object.keys(excelData[0]).map((key) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    editor: TextEditor,  // Habilitar edición en todas las celdas
  }));

  // Función para manejar cambios en las filas editadas
  const handleRowsChange = (updatedRows: Record<string, any>[], { indexes }: any) => {
    const updatedData = [...excelData];
    indexes.forEach((index: number) => {
        updatedData[index] = { ...updatedRows[index] };
    });
    setExcelData(updatedData);
};

  const exportToCSV = () => {
    const headers = columns.map(col => col.name).join(',');
    const rows = excelData.map(row =>
      columns.map(col => `"${row[col.key] || ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${sheetName || 'data'}.csv`);
    link.click();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Datos de la Hoja</h2>
      <button 
        onClick={exportToCSV} 
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Exportar a CSV
      </button>
      <DataGrid
        columns={columns}
        rows={excelData}
        onRowsChange={handleRowsChange}
      />
    </div>
  );
};

export default Excel;