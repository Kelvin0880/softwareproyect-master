'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

export default function UserReportButton({ user }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // En lugar de generar el PDF directamente, usaremos una API del servidor
      const response = await fetch(`/api/reports/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }
      
      // Obtener el blob del PDF
      const blob = await response.blob();
      
      // Crear un URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento de enlace para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-detallado-${user.username || 'usuario'}.pdf`;
      
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
    <div className="relative group">
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        title="Generar reporte detallado de usuario"
      >
        {isGenerating ? (
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </button>
      <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        Reporte Global
      </div>
    </div>
  );
}