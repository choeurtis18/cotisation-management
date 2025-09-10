import React from 'react';

const Table = ({ columns, data, onRowClick, className = '' }) => {
  return (
    <div className={`overflow-x-auto w-full ${className}`} style={{ maxWidth: '100vw' }}>
      <table className="min-w-[800px] bg-white border border-gray-200 text-xs sm:text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''
              } transition-colors duration-150 ${
                rowIndex % 2 === 1 ? 'bg-gray-50' : ''
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-4 sm:px-6 py-3 text-gray-900 ${
                    column.header === 'Actions' 
                      ? 'whitespace-nowrap min-w-[140px]' 
                      : column.header === 'Description' 
                        ? 'max-w-[200px] truncate' 
                        : 'whitespace-nowrap'
                  }`}
                >
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
};

export default Table;
