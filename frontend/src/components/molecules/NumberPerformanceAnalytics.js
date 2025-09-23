import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';
import { InteractiveChart, DataExporter } from './';

const NumberPerformanceAnalytics = ({
  phoneNumbers = [],
  timeRange = '30d',
  onTimeRangeChange,
  showExport = true,
  showFilters = true,
  className = '',
  ...props
}) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState('delivery_rate');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const metrics = {
    delivery_rate: {
      label: 'Delivery Rate',
      description: 'Percentage of messages successfully delivered',
      unit: '%',
      color: '#10b981',
      target: 95
    },
    response_rate: {
      label: 'Response Rate',
      description: 'Percentage of messages that received responses',
      unit: '%',
      color: '#3b82f6',
      target: 15
    },
    spam_score: {
      label: 'Spam Score',
      description: 'Average spam score (lower is better)',
      unit: '/10',
      color: '#ef4444',
      target: 2,
      inverse: true
    },
    cost_per_message: {
      label: 'Cost per Message',
      description: 'Average cost per message sent',
      unit: '$',
      color: '#f59e0b',
      target: 0.05
    },
    throughput: {
      label: 'Throughput',
      description: 'Messages sent per hour',
      unit: 'msg/h',
      color: '#8b5cf6',
      target: 1000
    },
    uptime: {
      label: 'Uptime',
      description: 'Percentage of time number was available',
      unit: '%',
      color: '#06b6d4',
      target: 99
    }
  };

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    generateAnalyticsData();
  }, [phoneNumbers, timeRange, selectedMetric]);

  const generateAnalyticsData = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = {
        summary: generateSummaryData(),
        trends: generateTrendData(),
        comparison: generateComparisonData(),
        insights: generateInsights()
      };
      
      setAnalyticsData(data);
      setIsLoading(false);
    }, 1000);
  };

  const generateSummaryData = () => {
    return phoneNumbers.map(number => {
      const basePerformance = Math.random() * 0.3 + 0.7; // 70-100% base performance
      
      return {
        id: number.id,
        number: number.number,
        metrics: {
          delivery_rate: Math.min(100, (basePerformance * 100) + (Math.random() * 10 - 5)),
          response_rate: Math.min(30, (basePerformance * 20) + (Math.random() * 5 - 2.5)),
          spam_score: Math.max(0, (1 - basePerformance) * 8 + (Math.random() * 2 - 1)),
          cost_per_message: 0.03 + (Math.random() * 0.04),
          throughput: Math.floor(basePerformance * 1200 + (Math.random() * 200 - 100)),
          uptime: Math.min(100, (basePerformance * 100) + (Math.random() * 5 - 2.5))
        },
        status: number.status,
        lastUpdated: new Date()
      };
    });
  };

  const generateTrendData = () => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const interval = timeRange === '24h' ? 'hour' : 'day';
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      if (interval === 'hour') {
        date.setHours(date.getHours() - (days - 1 - i));
      } else {
        date.setDate(date.getDate() - (days - 1 - i));
      }
      
      const baseValue = metrics[selectedMetric].target || 50;
      const variance = baseValue * 0.2;
      const value = baseValue + (Math.random() * variance * 2 - variance);
      
      return {
        date: date.toISOString(),
        value: Math.max(0, value),
        label: interval === 'hour' ? date.toLocaleTimeString() : date.toLocaleDateString()
      };
    });
  };

  const generateComparisonData = () => {
    if (selectedNumbers.length === 0) return [];
    
    return selectedNumbers.map(numberId => {
      const number = phoneNumbers.find(n => n.id === numberId);
      const summary = analyticsData.summary?.find(s => s.id === numberId);
      
      return {
        id: numberId,
        number: number?.number || 'Unknown',
        value: summary?.metrics[selectedMetric] || 0,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: (Math.random() * 10 - 5).toFixed(1)
      };
    });
  };

  const generateInsights = () => {
    const insights = [];
    
    // Performance insights
    const avgDeliveryRate = analyticsData.summary?.reduce((sum, item) => sum + item.metrics.delivery_rate, 0) / (analyticsData.summary?.length || 1);
    if (avgDeliveryRate < 90) {
      insights.push({
        type: 'warning',
        title: 'Low Delivery Rate',
        message: `Average delivery rate is ${avgDeliveryRate.toFixed(1)}%. Consider reviewing number reputation.`,
        action: 'Review Numbers'
      });
    }
    
    // Cost insights
    const avgCost = analyticsData.summary?.reduce((sum, item) => sum + item.metrics.cost_per_message, 0) / (analyticsData.summary?.length || 1);
    if (avgCost > 0.06) {
      insights.push({
        type: 'info',
        title: 'High Messaging Costs',
        message: `Average cost per message is $${avgCost.toFixed(3)}. Consider optimizing number usage.`,
        action: 'Optimize Costs'
      });
    }
    
    // Spam score insights
    const highSpamNumbers = analyticsData.summary?.filter(item => item.metrics.spam_score > 5).length || 0;
    if (highSpamNumbers > 0) {
      insights.push({
        type: 'error',
        title: 'High Spam Scores',
        message: `${highSpamNumbers} numbers have high spam scores. Immediate action required.`,
        action: 'Review Spam Issues'
      });
    }
    
    return insights;
  };

  const handleNumberSelect = (numberId) => {
    setSelectedNumbers(prev => {
      if (prev.includes(numberId)) {
        return prev.filter(id => id !== numberId);
      } else {
        return [...prev, numberId];
      }
    });
  };

  const handleExportData = () => {
    const exportData = {
      summary: analyticsData.summary,
      trends: analyticsData.trends,
      timeRange,
      selectedMetric,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `number-analytics-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getMetricColor = (value, metric) => {
    const config = metrics[metric];
    const target = config.target;
    const isInverse = config.inverse;
    
    let performance;
    if (isInverse) {
      performance = value <= target ? 'good' : value <= target * 1.5 ? 'warning' : 'poor';
    } else {
      performance = value >= target ? 'good' : value >= target * 0.8 ? 'warning' : 'poor';
    }
    
    switch (performance) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatMetricValue = (value, metric) => {
    const config = metrics[metric];
    const unit = config.unit;
    
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === '$') {
      return `$${value.toFixed(3)}`;
    } else if (unit === '/10') {
      return `${value.toFixed(1)}/10`;
    } else if (unit === 'msg/h') {
      return `${Math.round(value)} msg/h`;
    } else {
      return value.toFixed(1);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing number performance...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Number Performance Analytics</h3>
            <p className="text-sm text-gray-600">
              Analyzing {phoneNumbers.length} phone numbers over {timeRanges.find(t => t.value === timeRange)?.label.toLowerCase()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
              >
                <Icon name="download" size="sm" className="mr-1" />
                Export
              </Button>
            )}
            
            <Button
              variant={comparisonMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setComparisonMode(!comparisonMode)}
            >
              <Icon name="gitCompare" size="sm" className="mr-1" />
              Compare
            </Button>
          </div>
        </div>

        {/* Controls */}
        {showFilters && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(metrics).map(([key, metric]) => (
                  <option key={key} value={key}>{metric.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange?.(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {analyticsData.insights && analyticsData.insights.length > 0 && (
        <div className="space-y-3">
          {analyticsData.insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'error' ? 'bg-red-50 border-red-400' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon 
                    name={insight.type === 'error' ? 'alertTriangle' : insight.type === 'warning' ? 'alertCircle' : 'info'} 
                    size="sm" 
                    className={
                      insight.type === 'error' ? 'text-red-600' :
                      insight.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => console.log('Action:', insight.action)}
                >
                  {insight.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <InteractiveChart
          type="line"
          title={`${metrics[selectedMetric].label} Trend`}
          subtitle={metrics[selectedMetric].description}
          data={analyticsData.trends || []}
          height={300}
          showControls={false}
        />
      </div>

      {/* Performance Summary */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Performance Summary</h4>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {comparisonMode && (
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNumbers(phoneNumbers.map(n => n.id));
                          } else {
                            setSelectedNumbers([]);
                          }
                        }}
                      />
                    )}
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {metrics[selectedMetric].label}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spam Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.summary?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {comparisonMode && (
                          <input
                            type="checkbox"
                            checked={selectedNumbers.includes(item.id)}
                            onChange={() => handleNumberSelect(item.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {item.number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' :
                        item.status === 'available' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        getMetricColor(item.metrics[selectedMetric], selectedMetric)
                      }`}>
                        {formatMetricValue(item.metrics[selectedMetric], selectedMetric)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMetricValue(item.metrics.delivery_rate, 'delivery_rate')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMetricValue(item.metrics.response_rate, 'response_rate')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMetricValue(item.metrics.spam_score, 'spam_score')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => console.log('View details for', item.number)}
                      >
                        <Icon name="externalLink" size="xs" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      {comparisonMode && selectedNumbers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <InteractiveChart
            type="bar"
            title={`${metrics[selectedMetric].label} Comparison`}
            subtitle={`Comparing ${selectedNumbers.length} selected numbers`}
            data={analyticsData.comparison || []}
            height={300}
            showControls={false}
          />
        </div>
      )}
    </div>
  );
};

NumberPerformanceAnalytics.propTypes = {
  phoneNumbers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    number: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  })),
  timeRange: PropTypes.string,
  onTimeRangeChange: PropTypes.func,
  showExport: PropTypes.bool,
  showFilters: PropTypes.bool,
  className: PropTypes.string
};

export default NumberPerformanceAnalytics;