import { useState, useMemo } from 'react';

const DataTable = ({ 
  columns, 
  data, 
  defaultSortKey = 'id', 
  defaultSortOrder = 'desc',
  className = '',
  emptyMessage = 'No data available',
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  searchable = true,
  searchPlaceholder = 'Search...'
}) => {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key) => {
    if (sortKey === key) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return data.filter(row => {
      return columns.some(column => {
        // Skip non-searchable columns (like actions)
        if (column.sortable === false && column.accessor === 'actions') return false;
        
        const value = row[column.accessor];
        
        // Handle nested values (like department.name)
        if (column.accessor === 'department_id' && row.department) {
          const deptName = row.department?.name || row.Department?.name || '';
          return deptName.toLowerCase().includes(lowerSearchTerm);
        }
        
        if (value === null || value === undefined) return false;
        
        return String(value).toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortOrder === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortOrder === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-200 select-none' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable !== false && <SortIcon columnKey={column.accessor} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="border-t hover:bg-gray-50 transition">
                {columns.map((column) => (
                  <td key={column.accessor} className="px-6 py-4 text-sm text-gray-800">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="bg-white rounded-xl shadow-lg px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          {/* Page info */}
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : page === '...'
                    ? 'border-transparent text-gray-400 cursor-default'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
