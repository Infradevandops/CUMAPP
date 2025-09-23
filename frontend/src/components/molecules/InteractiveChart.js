import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const InteractiveChart = ({
  type = 'line',
  data = [],
  options = {},
  title = '',
  subtitle = '',
  height = 300,
  showControls = true,
  showExport = true,
  onDataPointClick,
  onExport,
  className = '',
  ...props
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Chart.js would be imported here in a real implementation
  // For now, we'll create a custom SVG-based chart system

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: 'trendingUp' },
    { value: 'bar', label: 'Bar Chart', icon: 'barChart' },
    { value: 'pie', label: 'Pie Chart', icon: 'pieChart' },
    { value: 'area', label: 'Area Chart', icon: 'activity' },
    { value: 'scatter', label: 'Scatter Plot', icon: 'circle' }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  // Process data based on chart type and time range
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Filter data based on time range
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '24h':
        cutoffDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date || item.timestamp || item.x);
      return itemDate >= cutoffDate;
    });
  }, [data, timeRange]);

  // Calculate chart dimensions and scales
  const chartDimensions = {
    width: 800,
    height: height,
    margin: { top: 20, right: 30, bottom: 40, left: 50 }
  };

  const innerWidth = chartDimensions.width - chartDimensions.margin.left - chartDimensions.margin.right;
  const innerHeight = chartDimensions.height - chartDimensions.margin.top - chartDimensions.margin.bottom;

  // Get min/max values for scaling
  const getDataRange = () => {
    if (processedData.length === 0) return { min: 0, max: 100 };
    
    const values = processedData.map(d => d.value || d.y || 0);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const dataRange = getDataRange();

  // Scale functions
  const scaleX = (index) => (index / (processedData.length - 1)) * innerWidth;
  const scaleY = (value) => innerHeight - ((value - dataRange.min) / (dataRange.max - dataRange.min)) * innerHeight;

  // Generate chart elements based on type
  const renderChart = () => {
    if (processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Icon name="barChart" size="lg" className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      case 'scatter':
        return renderScatterChart();
      default:
        return renderLineChart();
    }
  };

  const renderLineChart = () => {
    const pathData = processedData.map((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.value || d.y || 0);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <g>
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = (innerHeight / 4) * i;
          return (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={innerWidth}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          );
        })}
        
        {/* Data line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Data points */}
        {processedData.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.value || d.y || 0)}
            r="4"
            fill="#3b82f6"
            className="cursor-pointer hover:r-6 transition-all"
            onClick={() => onDataPointClick?.(d, i)}
          />
        ))}
      </g>
    );
  };

  const renderBarChart = () => {
    const barWidth = innerWidth / processedData.length * 0.8;
    const barSpacing = innerWidth / processedData.length * 0.2;

    return (
      <g>
        {processedData.map((d, i) => {
          const x = scaleX(i) - barWidth / 2;
          const y = scaleY(d.value || d.y || 0);
          const height = innerHeight - y;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill="#3b82f6"
              className="cursor-pointer hover:fill-blue-700 transition-colors"
              onClick={() => onDataPointClick?.(d, i)}
            />
          );
        })}
      </g>
    );
  };

  const renderAreaChart = () => {
    const pathData = processedData.map((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.value || d.y || 0);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const areaPath = `${pathData} L ${scaleX(processedData.length - 1)} ${innerHeight} L 0 ${innerHeight} Z`;

    return (
      <g>
        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          className="transition-all duration-300"
        />
        
        {/* Area line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </g>
    );
  };

  const renderPieChart = () => {
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const radius = Math.min(innerWidth, innerHeight) / 2 - 20;
    
    const total = processedData.reduce((sum, d) => sum + (d.value || d.y || 0), 0);
    let currentAngle = 0;

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    return (
      <g>
        {processedData.map((d, i) => {
          const value = d.value || d.y || 0;
          const percentage = value / total;
          const angle = percentage * 2 * Math.PI;
          
          const x1 = centerX + Math.cos(currentAngle) * radius;
          const y1 = centerY + Math.sin(currentAngle) * radius;
          const x2 = centerX + Math.cos(currentAngle + angle) * radius;
          const y2 = centerY + Math.sin(currentAngle + angle) * radius;
          
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          const result = (
            <path
              key={i}
              d={pathData}
              fill={colors[i % colors.length]}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onDataPointClick?.(d, i)}
            />
          );
          
          currentAngle += angle;
          return result;
        })}
      </g>
    );
  };

  const renderScatterChart = () => {
    return (
      <g>
        {processedData.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.value || d.y || 0)}
            r={Math.sqrt((d.size || 10)) * 2}
            fill="#3b82f6"
            fillOpacity="0.6"
            className="cursor-pointer hover:fill-blue-700 transition-colors"
            onClick={() => onDataPointClick?.(d, i)}
          />
        ))}
      </g>
    );
  };

  const handleExport = () => {
    if (onExport) {
      onExport(chartType, processedData);
    } else {
      // Default export as SVG
      const svg = canvasRef.current;
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `chart-${Date.now()}.svg`;
        downloadLink.click();
        
        URL.revokeObjectURL(svgUrl);
      }
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toFixed(0);
    }
    return value;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              
              {/* Chart Type Selector */}
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              {showExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Icon name="download" size="sm" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        <div className="relative" style={{ height: `${height}px` }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <svg
              ref={canvasRef}
              width="100%"
              height="100%"
              viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
              className="overflow-visible"
            >
              <g transform={`translate(${chartDimensions.margin.left}, ${chartDimensions.margin.top})`}>
                {renderChart()}
                
                {/* Y-axis labels */}
                {[...Array(5)].map((_, i) => {
                  const value = dataRange.min + (dataRange.max - dataRange.min) * (4 - i) / 4;
                  const y = (innerHeight / 4) * i;
                  return (
                    <text
                      key={i}
                      x={-10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {formatValue(value)}
                    </text>
                  );
                })}
                
                {/* X-axis labels */}
                {processedData.map((d, i) => {
                  if (i % Math.ceil(processedData.length / 6) === 0) {
                    return (
                      <text
                        key={i}
                        x={scaleX(i)}
                        y={innerHeight + 20}
                        textAnchor="middle"
                        className="text-xs fill-gray-500"
                      >
                        {d.label || new Date(d.date || d.timestamp).toLocaleDateString()}
                      </text>
                    );
                  }
                  return null;
                })}
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Chart Statistics */}
      {processedData.length > 0 && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatValue(Math.max(...processedData.map(d => d.value || d.y || 0)))}
              </div>
              <div className="text-sm text-gray-600">Peak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatValue(processedData.reduce((sum, d) => sum + (d.value || d.y || 0), 0) / processedData.length)}
              </div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatValue(Math.min(...processedData.map(d => d.value || d.y || 0)))}
              </div>
              <div className="text-sm text-gray-600">Minimum</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {processedData.length}
              </div>
              <div className="text-sm text-gray-600">Data Points</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

InteractiveChart.propTypes = {
  type: PropTypes.oneOf(['line', 'bar', 'pie', 'area', 'scatter']),
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    timestamp: PropTypes.string,
    value: PropTypes.number,
    y: PropTypes.number,
    x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    size: PropTypes.number
  })),
  options: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  height: PropTypes.number,
  showControls: PropTypes.bool,
  showExport: PropTypes.bool,
  onDataPointClick: PropTypes.func,
  onExport: PropTypes.func,
  className: PropTypes.string
};

export default InteractiveChart;