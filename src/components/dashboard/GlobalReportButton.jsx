'use client';

import { useState } from 'react';
import { FileText, Download } from 'lucide-react';

export default function GlobalReportButton({ className }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Generar el PDF mediante una API del servidor
      const response = await fetch('/api/reports/global', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el reporte global');
      }
      
      // Obtener el blob del PDF
      const blob = await response.blob();
      
      // Crear un URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento de enlace para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-global-detallado.pdf';
      
      // Añadir el enlace al DOM y hacer clic en él
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Ocurrió un error al generar el PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 ${className}`}
      title="Generar reporte global detallado"
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Generando...</span>
        </>
      ) : (
        <>
          <FileText className="h-5 w-5" />
          <span>Reporte Global</span>
        </>
      )}
    </button>
  );
}