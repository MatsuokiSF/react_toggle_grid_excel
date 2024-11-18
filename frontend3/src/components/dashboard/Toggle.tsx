//src / components / dashboard / Toggle.tsx
import { useEffect, useState } from 'react';
import Excel from '../../pages/Excel';
import { fetchCSVFiles, fetchExcelSheets, fetchExcelData, CSVFile } from '../../api/Toggle_Api';

function Toggle() {
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);
  const [mostrarArchivos, setMostrarArchivos] = useState(false);
  const [excelData, setExcelData] = useState<Record<string, any>[]>([]);
  const [hojas, setHojas] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  useEffect(() => {
    const loadCSVFiles = async () => {
      if (mostrarArchivos && csvFiles.length === 0) {
        try {
          const files = await fetchCSVFiles();
          setCSVFiles(files);
        } catch (error) {
          console.error('Error al cargar archivos CSV:', error);
        }
      }
    };
    loadCSVFiles();
  }, [mostrarArchivos]);

  const seleccionarArchivo = async (fileName: string) => {
    setSelectedFile(fileName);
    setSelectedSheet(null); // Restablecer la hoja seleccionada
    setExcelData([]); // Limpiar los datos de la hoja anterior

    try {
      const sheets = await fetchExcelSheets(fileName);
      setHojas(sheets);
    } catch (error) {
      console.error('Error al obtener las hojas:', error);
    }
  };

  const seleccionarHoja = async (sheetName: string) => {
    if (!selectedFile) return;

    setSelectedSheet(sheetName); // Configurar la hoja seleccionada
    setMostrarArchivos(false); // Ocultar el toggle de archivos

    try {
      const data = await fetchExcelData(selectedFile, sheetName);
      setExcelData(data);
    } catch (error) {
      console.error('Error al obtener los datos de la hoja:', error);
    }
  };

  const volverAMostrarArchivos = () => {
    // Restablece el estado para volver a la lista de archivos
    setSelectedFile(null);
    setSelectedSheet(null);
    setExcelData([]);
    setMostrarArchivos(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Archivos Excel</h2>
        {!selectedSheet && (
          <button
            onClick={() => setMostrarArchivos(prev => !prev)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {mostrarArchivos ? 'Ocultar archivos' : 'Mostrar archivos'}
          </button>
        )}
      </div>

      {mostrarArchivos && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Archivos disponibles:</h3>
          <ul className="list-disc pl-5">
            {csvFiles.map(file => (
              <li key={file.name} className="mb-2">
                <span
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() => seleccionarArchivo(file.name)}
                >
                  {file.name}
                </span>
              </li>
            ))}
          </ul>

          {selectedFile && hojas.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Hojas en {selectedFile}:</h4>
              <ul className="list-disc pl-5">
                {hojas.map(sheet => (
                  <li key={sheet} className="mb-2">
                    <span
                      className="cursor-pointer hover:text-blue-500"
                      onClick={() => seleccionarHoja(sheet)}
                    >
                      {sheet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {excelData.length > 0 && selectedSheet ? (
        <div>
          <button
            onClick={volverAMostrarArchivos}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 mb-4"
          >
            Volver a seleccionar archivo
          </button>
          {selectedFile && selectedSheet && (
            <Excel selectedFile={selectedFile} sheetName={selectedSheet} data={excelData} />
          )}
        </div>
      ) : (
        !mostrarArchivos && <div>No hay datos para mostrar.</div>
      )}
    </div>
  );
}

export default Toggle;
