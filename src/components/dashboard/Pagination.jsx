'use client';

export default function Pagination(
    { currentPage, totalItems, perPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / perPage);
    
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
        <div className="flex items-center">
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{Math.min(currentPage * perPage, totalItems) - perPage + 1}</span>
            {' '}-{' '}
            <span className="font-medium">{Math.min(currentPage * perPage, totalItems)}</span>
            {' '}de{' '}
            <span className="font-medium">{totalItems}</span>
            {' '}resultados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }