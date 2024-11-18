const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx'); // Librería para leer archivos Excel
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());

const storageDir = path.join(__dirname, 'storage'); // Directorio donde se almacenan los archivos Excel

// Ruta para obtener todos los archivos Excel
app.get('/api/excel-files', (req, res) => {
  fs.readdir(storageDir, (err, files) => {
    if (err) {
      console.error('Error al leer el directorio:', err);
      return res.status(500).json({ error: 'Error al leer el directorio' });
    }

    const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
    res.json(excelFiles);
  });
});

// Ruta para obtener las hojas de un archivo Excel específico
app.get('/api/excel-sheets/:filename', (req, res) => {
  const filePath = path.join(storageDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  // Leer el archivo Excel
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;

  res.json(sheetNames);
});

// Ruta para obtener los datos de una hoja específica de un archivo Excel
app.get('/api/excel-data/:filename/:sheetName', (req, res) => {
  const filePath = path.join(storageDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[req.params.sheetName];

  if (!worksheet) {
    return res.status(404).json({ error: 'Hoja no encontrada' });
  }

  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  console.log('Datos en formato JSON:', jsonData); // Depuración: muestra los datos en JSON
  res.json(jsonData);
});

// Ruta para obtener los datos de una hoja específica de un archivo Excel y devolverla como CSV con encabezados numéricos
app.get('/api/excel-data/csv/:filename/:sheetName', (req, res) => {
  const filePath = path.join(storageDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[req.params.sheetName];

  if (!worksheet) {
    return res.status(404).json({ error: 'Hoja no encontrada' });
  }

  // Paso 1: Obtiene los datos de la hoja como matriz
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  console.log('Datos en formato de matriz:', data); // Depuración

  // Paso 2: Calcular la longitud de la fila más larga
  const maxLength = Math.max(...data.map(row => row.length));
  console.log('Longitud de la fila más larga:', maxLength); // Depuración

  // Paso 3: Generar encabezados tipo Excel: A, B, C, ..., Z, AA, AB, ...
  const generateExcelHeaders = (length) => {
    const headers = [];
    for (let i = 0; i < length; i++) {
      let column = '';
      let current = i;
      // Generar las letras de las columnas
      while (current >= 0) {
        column = String.fromCharCode((current % 26) + 65) + column;
        current = Math.floor(current / 26) - 1;
      }
      headers.push(column);
    }
    return headers;
  };

  const headers = generateExcelHeaders(maxLength);


  // Paso 4: Preparar el CSV con encabezado
  const csvRows = [headers, ...data]; // Mantener los datos originales
  const csvData = csvRows.map(row => row.join(',')).join('\n');

  // Paso 5: Depuración
  console.log('Datos en formato CSV con encabezados numéricos:', csvData); // Depuración

  // Paso 6: Establecer el tipo de contenido
  res.setHeader('Content-Type', 'text/csv'); // Establece el tipo de contenido a CSV
  
  // Paso 7: Enviar CSV al frontend
  res.send(csvData); // Enviar CSV al frontend
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
