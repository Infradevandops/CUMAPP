import React, { useState, useEffect } from 'react';
import { Header } from '../organisms';
import { AnalyticsDashboard, RealtimeMetrics, DataExporter, InteractiveChart } from '../molecules';
import { Button, Icon } from '../atoms';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [showExporter, setShowExporter] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'pieChart' },
    { id: 'messaging', label: 'Messaging', icon: 'messageSquare' },
    { id: 'performance', label: 'Performance', icon: 'activity' },
    { id: 'realtime', label: 'Real-time', icon: 'zap' }
  ];

  const realtimeMetrics = [
    {
      id: 'active-users',
      label: 'Active Users',
      value: 1247,
      format: 'number',
      icon: 'users',
      status: 'good',
      change: 12.5,
      variance: 0.1
    },
    {
      id: 'messages-per-minute',
      label: 'Messages/Min',
      value: 89,
      format: 'number',
      icon: 'messageSquare',
      status: 'good',
      change: 5.2,
      variance: 0.15
    },
    {
      id: 'success-rate',
      label: 'Success Rate',
      value: 98.7,
      format: 'percentage',
      icon: 'target',
      status: 'good',
      target: 95,
      change: 0.8,
      variance: 0.02
    },
    {
      id: 'avg-response-time',
      label: 'Avg Response Time',
      value: 245,
      format: 'time',
      icon: 'clock',
      status: 'warning',
      target: 200,
      change: -8.3,
      variance: 0.2
    },
    {
      id: 'error-rate',
      label: 'Error Rate',
      value: 1.3,
      format: 'percentage',
      icon: 'alertTriangle',
      status: 'warning',
      target: 1,
      change: 15.2,
      variance: 0.3
    },
    {
      id: 'bandwidth-usage',
      label: 'Bandwidth Usage',
      value: 2.4 * 1024 * 1024 * 1024,
      format: 'bytes',
      icon: 'wifi',
      status: 'good',
      change: 3.7,
      variance: 0.1
    }
  ];

  useEffect(() => {
    // Generate sample analytics data for export
    const sampleData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - (99 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      messages_sent: Math.floor(Math.random() * 1000) + 500,
      success_rate: (Math.random() * 10 + 90).toFixed(2),
      response_time: Math.floor(Math.random() * 200) + 150,
      revenue: (Math.random() * 1000 + 500).toFixed(2),
      active_users: Math.floor(Math.random() * 500) + 800,
      error_count: Math.floor(Math.random() * 50),
      bandwidth_gb: (Math.random() * 10 + 5).toFixed(2)
    }));
    setAnalyticsData(sampleData);
  }, []);

  const handleExportData = async (format, data, options) => {
    console.log('Exporting data:', { format, dataLength: data.length, options });
    // In a real app, this would call an API endpoint
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Export completed');
        resolve();
      }, 2000);
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AnalyticsDashboard
            dashboardType="overview"
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onExportDashboard={() => setShowExporter(true)}
          />
        );
      
      case 'messaging':
        return (
          <div className="space-y-6">
            <AnalyticsDashboard
              dashboardType="messaging"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveChart
                type="line"
                title="Message Volume Trend"
                data={[
                  { date: '2024-01-01', value: 1200 },
                  { date: '2024-01-02', value: 1350 },
                  { date: '2024-01-03', value: 1180 },
                  { date: '2024-01-04', value: 1420 },
                  { date: '2024-01-05', value: 1380 },
                  { date: '2024-01-06', value: 1550 },
                  { date: '2024-01-07', value: 1480 }
                ]}
                height={300}
              />
              
              <InteractiveChart
                type="bar"
                title="Messages by Hour"
                data={[
                  { date: '00:00', value: 45 },
                  { date: '04:00', value: 23 },
                  { date: '08:00', value: 156 },
                  { date: '12:00', value: 234 },
                  { date: '16:00', value: 189 },
                  { date: '20:00', value: 167 }
                ]}
                height={300}
              />
            </div>
          </div>
        );
      
      case 'performance':
        return (
          <div className="space-y-6">
            <AnalyticsDashboard
              dashboardType="performance"
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveChart
                type="area"
                title="Response Time Distribution"
                data={[
                  { date: '2024-01-01', value: 245 },
                  { date: '2024-01-02', value: 230 },
                  { date: '2024-01-03', value: 255 },
                  { date: '2024-01-04', value: 220 },
                  { date: '2024-01-05', value: 210 },
                  { date: '2024-01-06', value: 235 },
                  { date: '2024-01-07', value: 225 }
                ]}
                height={300}
              />
              
              <InteractiveChart
                type="scatter"
                title="Error Rate vs Load"
                data={[
                  { date: 'Low Load', value: 0.5, size: 10 },
                  { date: 'Medium Load', value: 1.2, size: 15 },
                  { date: 'High Load', value: 2.8, size: 20 },
                  { date: 'Peak Load', value: 4.1, size: 25 }
                ]}
                height={300}
              />
            </div>
          </div>
        );
      
      case 'realtime':
        return (
          <div className="space-y-6">
            <RealtimeMetrics
              metrics={realtimeMetrics}
              updateInterval={3000}
              showSparklines={true}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Message Queue</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-yellow-600">Degraded</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">External APIs</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">All Systems Go</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">High traffic detected</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Auto-scaling triggered</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Queue processing delayed</p>
                      <p className="text-xs text-gray-500">12 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Database optimization completed</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights and performance metrics for your communication platform
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExporter(true)}
              >
                <Icon name="download" size="sm" className="mr-2" />
                Export Data
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <Icon name="refresh" size="sm" className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name={tab.icon} size="sm" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {renderTabContent()}
        </div>

        {/* Data Exporter Modal */}
        {showExporter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Export Analytics Data</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExporter(false)}
                >
                  <Icon name="x" size="sm" />
                </Button>
              </div>
              
              <div className="p-6">
                <DataExporter
                  data={analyticsData}
                  filename={`analytics-${activeTab}-${new Date().toISOString().split('T')[0]}`}
                  availableFormats={['csv', 'json', 'pdf']}
                  onExport={handleExportData}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;