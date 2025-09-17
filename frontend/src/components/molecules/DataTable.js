import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon, Button, Badge } from '../atoms';

const DataTable = ({ 
  data = [], 
  columns = [], 
  sortable = true,
  pagination = true,
  pageSize = 10,
  searchable = false,
  selectable = false,
  onRowClick,
  onSelectionChange,
  className = '',
  emptyMessage = 'No data available',
  ...props 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, columns, searchTerm]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);
  
  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  const handleSort = (key) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleRowSelect = (rowId, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };
  
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((_, index) => index));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };
  
  const renderCellContent = (row, column) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.type === 'badge') {
      return <Badge variant={column.badgeVariant || 'default'}>{value}</Badge>;
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    return value;
  };
  
  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`} {...props}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="sm" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        <Icon 
                          name="chevronUp" 
                          size="xs" 
                          className={`${
                            sortConfig.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-red-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <Icon 
                          name="chevronDown" 
                          size="xs" 
                          className={`${
                            sortConfig.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-red-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => handleRowSelect(index, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCellContent(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    type: PropTypes.oneOf(['text', 'badge', 'date']),
    badgeVariant: PropTypes.string,
    render: PropTypes.func
  })).isRequired,
  sortable: PropTypes.bool,
  pagination: PropTypes.bool,
  pageSize: PropTypes.number,
  searchable: PropTypes.bool,
  selectable: PropTypes.bool,
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func,
  className: PropTypes.string,
  emptyMessage: PropTypes.string
};

export default DataTable;