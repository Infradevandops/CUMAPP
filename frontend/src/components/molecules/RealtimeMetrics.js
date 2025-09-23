import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../atoms';

const RealtimeMetrics = ({
  metrics = [],
  updateInterval = 5000,
  showSparklines = true,
  className = '',
  ...props
}) => {
  const [currentMetrics, setCurrentMetrics] = useState(metrics);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: generateRealtimeValue(metric),
          history: [...(metric.history || []).slice(-20), {
            timestamp: new Date(),
            value: generateRealtimeValue(metric)
          }]
        }))
      );
      setLastUpdate(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const generateRealtimeValue = (metric) => {
    const baseValue = metric.value || 0;
    const variance = metric.variance || 0.1;
    const change = (Math.random() - 0.5) * 2 * variance * baseValue;
    return Math.max(0, baseValue + change);
  };

  const formatValue = (value, format) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
        return value.toLocaleString();
      case 'bytes':
        if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)}GB`;
        if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}MB`;
        if (value >= 1024) return `${(value / 1024).toFixed(1)}KB`;
        return `${value}B`;
      case 'time':
        return `${value.toFixed(0)}ms`;
      default:
        return value.toFixed(2);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderSparkline = (history) => {
    if (!history || history.length < 2) return null;

    const values = history.map(h => h.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = history.map((h, i) => {
      const x = (i / (history.length - 1)) * 60;
      const y = 20 - ((h.value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="20" className="ml-2">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-60"
        />
      </svg>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Metrics</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMetrics.map((metric, index) => (
            <div
              key={metric.id || index}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {metric.icon && (
                    <Icon name={metric.icon} size="sm" className="text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                </div>
                {metric.status && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.value, metric.format)}
                  </div>
                  {metric.target && (
                    <div className="text-xs text-gray-500">
                      Target: {formatValue(metric.target, metric.format)}
                    </div>
                  )}
                </div>
                
                {showSparklines && metric.history && (
                  <div className="text-gray-400">
                    {renderSparkline(metric.history)}
                  </div>
                )}
              </div>

              {metric.change !== undefined && (
                <div className={`flex items-center space-x-1 mt-2 text-sm ${
                  metric.change > 0 ? 'text-green-600' : 
                  metric.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <Icon 
                    name={metric.change > 0 ? 'trendingUp' : metric.change < 0 ? 'trendingDown' : 'minus'} 
                    size="xs" 
                  />
                  <span>{Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Last Update Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <span>Updates every {updateInterval / 1000}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

RealtimeMetrics.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    format: PropTypes.oneOf(['percentage', 'currency', 'number', 'bytes', 'time']),
    icon: PropTypes.string,
    status: PropTypes.oneOf(['good', 'warning', 'critical']),
    target: PropTypes.number,
    change: PropTypes.number,
    variance: PropTypes.number,
    history: PropTypes.arrayOf(PropTypes.shape({
      timestamp: PropTypes.instanceOf(Date),
      value: PropTypes.number
    }))
  })),
  updateInterval: PropTypes.number,
  showSparklines: PropTypes.bool,
  className: PropTypes.string
};

export default RealtimeMetrics;