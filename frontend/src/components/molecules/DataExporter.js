import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const DataExporter = ({
  data = [],
  filename = 'export',
  availableFormats = ['csv', 'json', 'pdf'],
  onExport,
  className = '',
  ...props
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(availableFormats[0]);
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    dateRange: 'all',
    columns: 'all'
  });

  const formatOptions = {
    csv: { label: 'CSV', icon: 'fileText', description: 'Comma-separated values' },
    json: { label: 'JSON', icon: 'code', description: 'JavaScript Object Notation' },
    pdf: { label: 'PDF', icon: 'file', description: 'Portable Document Format' },
    xlsx: { label: 'Excel', icon: 'grid', description: 'Microsoft Excel format' }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (onExport) {
        await onExport(selectedFormat, data, exportOptions);
      } else {
        await performDefaultExport();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const performDefaultExport = async () => {
    const processedData = processDataForExport();
    
    switch (selectedFormat) {
      case 'csv':
        exportAsCSV(processedData);
        break;
      case 'json':
        exportAsJSON(processedData);
        break;
      case 'pdf':
        exportAsPDF(processedData);
        break;
      case 'xlsx':
        exportAsExcel(processedData);
        break;
      default:
        exportAsCSV(processedData);
    }
  };

  const processDataForExport = () => {
    let processedData = [...data];

    // Apply date range filter
    if (exportOptions.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (exportOptions.dateRange) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      processedData = processedData.filter(item => {
        const itemDate = new Date(item.date || item.timestamp || item.createdAt);
        return itemDate >= cutoffDate;
      });
    }

    // Apply column filter
    if (exportOptions.columns !== 'all' && Array.isArray(exportOptions.columns)) {
      processedData = processedData.map(item => {
        const filteredItem = {};
        exportOptions.columns.forEach(col => {
          if (item.hasOwnProperty(col)) {
            filteredItem[col] = item[col];
          }
        });
        return filteredItem;
      });
    }

    return processedData;
  };

  const exportAsCSV = (data) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    let csvContent = '';

    if (exportOptions.includeHeaders) {
      csvContent += headers.join(',') + '\n';
    }

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const exportAsJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const exportAsPDF = (data) => {
    // Simple PDF generation - in a real app, you'd use a library like jsPDF
    const htmlContent = generateHTMLTable(data);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportAsExcel = (data) => {
    // Simple Excel export using CSV format with .xlsx extension
    // In a real app, you'd use a library like SheetJS
    exportAsCSV(data);
  };

  const generateHTMLTable = (data) => {
    if (data.length === 0) return '<p>No data to export</p>';

    const headers = Object.keys(data[0]);
    
    let html = '<table>';
    
    if (exportOptions.includeHeaders) {
      html += '<thead><tr>';
      headers.forEach(header => {
        html += `<th>${header}</th>`;
      });
      html += '</tr></thead>';
    }
    
    html += '<tbody>';
    data.forEach(row => {
      html += '<tr>';
      headers.forEach(header => {
        html += `<td>${row[header] || ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getAvailableColumns = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`} {...props}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data</h3>
          <p className="text-sm text-gray-600">
            Export {data.length} records in your preferred format
          </p>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableFormats.map(format => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedFormat === format
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name={formatOptions[format]?.icon || 'file'} size="sm" />
                  <span className="font-medium">{formatOptions[format]?.label || format.toUpperCase()}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatOptions[format]?.description || `Export as ${format.toUpperCase()}`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Export Options</h4>
          
          {/* Include Headers */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeHeaders}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeHeaders: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include column headers</span>
          </label>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={exportOptions.dateRange}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                dateRange: e.target.value
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All data</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Column Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns to Export
            </label>
            <select
              value={exportOptions.columns === 'all' ? 'all' : 'custom'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setExportOptions(prev => ({ ...prev, columns: 'all' }));
                } else {
                  setExportOptions(prev => ({ ...prev, columns: getAvailableColumns() }));
                }
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All columns</option>
              <option value="custom">Select columns</option>
            </select>
          </div>

          {/* Custom Column Selection */}
          {exportOptions.columns !== 'all' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Select columns to include:</p>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {getAvailableColumns().map(column => (
                  <label key={column} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={exportOptions.columns.includes(column)}
                      onChange={(e) => {
                        const newColumns = e.target.checked
                          ? [...exportOptions.columns, column]
                          : exportOptions.columns.filter(col => col !== column);
                        setExportOptions(prev => ({ ...prev, columns: newColumns }));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{column}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {data.length} records ready for export
          </div>
          
          <Button
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Icon name="download" size="sm" className="mr-2" />
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

DataExporter.propTypes = {
  data: PropTypes.array.isRequired,
  filename: PropTypes.string,
  availableFormats: PropTypes.arrayOf(PropTypes.oneOf(['csv', 'json', 'pdf', 'xlsx'])),
  onExport: PropTypes.func,
  className: PropTypes.string
};

export default DataExporter;