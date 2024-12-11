import React, { useState, useEffect } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library'; // Importar BarcodeFormat
import './App.css';

function App() {
  const [data, setData] = useState(null);  // Guardar los datos del codigo escaneado
  const [scanning, setScanning] = useState(true);  // El escaneo se iniciara de inmediato
  const [decodedInfo, setDecodedInfo] = useState({});  // Para almacenar los datos desglosados
  const [documentMatch, setDocumentMatch] = useState(false);  // Para verificar si el documento coincide

  // Formatos de codigos que deseas soportar
  const formsToSupport = [
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ];

  // Funcion para desglosar los datos escaneados
  const parseData = (dataString) => {
    const dataArray = dataString.split('@');  // Separamos la cadena por el simbolo '@'
    return {
      dni: dataArray[0],
      apellido: dataArray[1],
      nombre: dataArray[2],
      sexo: dataArray[3],
      numDocumento: dataArray[4],
      categoria: dataArray[5],
      fechaNacimiento: dataArray[6],
      fechaEmision: dataArray[7],
      codigoAdicional: dataArray[8],
    };
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();  // Crear el lector de codigos

    const videoElement = document.getElementById('video');  // Elemento donde se mostrara el video

    // Funcion para comenzar el escaneo
    const startScanning = async () => {
      try {
        await codeReader.decodeFromVideoDevice(
          null,  // Usar la camara predeterminada
          videoElement,  // Elemento de video donde se visualizara
          (result, error) => {
            if (result) {
              // Si se detecta un codigo y esta en los formatos soportados
              if (result.getText() && formsToSupport.includes(result.getBarcodeFormat())) {
                const parsedData = parseData(result.getText());  // Desglosar los datos
                setData(result.getText());  // Mostrar el codigo escaneado completo
                setDecodedInfo(parsedData);  // Mostrar los datos desglosados

                // Verificar si el número de documento coincide
                if (parsedData.numDocumento === '42333481') {
                  setDocumentMatch(true);  // Establecer que el documento coincide
                } else {
                  setDocumentMatch(false);  // Establecer que el documento no coincide
                }
              }
            }
            if (error) {
              // Suprimir el error específico
              if (error.message !== 'No MultiFormat Readers were able to detect the code') {
                console.error(error);  // Mostrar solo otros errores en la consola
              }
            }
          }
        );
      } catch (error) {
        console.error('Error al iniciar el escaneo:', error);
      }
    };

    if (scanning) {
      startScanning();  // Iniciar escaneo automaticamente
    }

    return () => {
      if (codeReader) {
        codeReader.reset();  // Detener el escaneo cuando el componente se desmonta
      }
    };
  }, [scanning]);  // Ejecutar cuando el estado de scanning cambie

  return (
    <div className="App">
      <h1>Lector de Codigos Automatico</h1>

      <div className="video-container">
        <video
          id="video"
          className="video"
        />
      </div>

      {/* Mostrar los datos desglosados o el circulo con check */}
      <div>
        {documentMatch ? (
          // Si el documento coincide, mostrar el circulo verde con check
          <div className="check-circle">
            <span className="check-icon">✔</span>
          </div>
        ) : 
        (
          <div className="cross-circle">
            <span className="cross-icon">✔</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
