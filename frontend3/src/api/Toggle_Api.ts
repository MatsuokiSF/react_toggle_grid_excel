//src /api / Toggle_Api.ts
import axios from 'axios';

export interface CSVFile {
  name: string;
}

export const fetchCSVFiles = async (): Promise<CSVFile[]> => {
  try {
    const response = await axios.get('http://localhost:4000/api/excel-files');
    return (response.data as string[]).map((file: string) => ({ name: file }));
  } catch (error) {
    console.error('Error al obtener los archivos CSV:', error);
    throw error;
  }
};

export const fetchExcelSheets = async (fileName: string): Promise<string[]> => {
  try {
    const response = await axios.get(`http://localhost:4000/api/excel-sheets/${fileName}`);
    return response.data as string[];
  } catch (error) {
    console.error('Error al obtener las hojas del archivo Excel:', error);
    throw error;
  }
};

export const fetchExcelData = async (fileName: string, sheetName: string): Promise<Record<string, any>[]> => {
  try {
    const response = await axios.get(`http://localhost:4000/api/excel-data/csv/${fileName}/${sheetName}`);
    const data = response.data as string;

    // Procesar los datos CSV
    const rows = data.split('\n').map(row => row.split(',')).filter(row => row.length > 1);
    if (rows.length === 0) return [];

    const headers = rows[0].map(header => header.trim());
    return rows.slice(1).map(row => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index] ? row[index].trim() : '';
        return acc;
      }, {} as Record<string, any>);
    });
  } catch (error) {
    console.error('Error al obtener los datos de la hoja Excel:', error);
    throw error;
  }
};
