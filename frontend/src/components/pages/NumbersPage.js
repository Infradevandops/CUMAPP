import React, { useState, useEffect } from 'react';
import { Button, Icon } from '../atoms';
import { 
  PhoneNumberMap, 
  BulkActions, 
  NumberPerformanceAnalytics, 
  AdvancedNumberFilters 
} from '../molecules';
import BaseLayout from '../templates/BaseLayout';

const NumbersPage = ({ user }) => {
  const [numbers, setNumbers] = useState([]);
  const [filteredNumbers, setFilteredNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'map'

  useEffect(() => {
    fetchNumbers();
    fetchPerformanceData();
  }, []);

  const fetchNumbers = async () => {
    try {
      // Simulate API call with mock data
      setTimeout(() => {
        const mockNumbers = [
          {
            id: 1,
            phone_number: '+1-555-0123',
            country: 'United States',
            status: 'active',
            created_at: '2024-01-15T10:30:00Z',
            tags: ['marketing', 'high-volume'],
            performance_score: 94,
            monthly_cost: 25.00,
            message_count: 1250
          },
          {
            id: 2,
            phone_number: '+1-555-0124',
            country: 'United States',
            status: 'active',
            created_at: '2024-01-10T14:20:00Z',
            tags: ['support'],
            performance_score: 87,
            monthly_cost: 25.00,
            message_count: 890
          },
          {
            id: 3,
            phone_number: '+44-20-7946-0958',
            country: 'United Kingdom',
            status: 'pending',
            created_at: '2024-01-20T09:15:00Z',
            tags: ['verification'],
            performance_score: 0,
            monthly_cost: 30.00,
            message_count: 0
          },
          {
            id: 4,
            phone_number: '+49-30-12345678',
            country: 'Germany',
            status: 'active',
            created_at: '2024-01-05T16:45:00Z',
            tags: ['alerts', 'testing'],
            performance_score: 91,
            monthly_cost: 28.00,
            message_count: 567
          },
          {
            id: 5,
            phone_number: '+1-416-555-0199',
            country: 'Canada',
            status: 'expired',
            created_at: '2023-12-15T11:30:00Z',
            tags: ['marketing'],
            performance_score: 0,
            monthly_cost: 0,
            message_count: 2340
          }
        ];
        
        setNumbers(mockNumbers);
        setFilteredNumbers(mockNumbers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch numbers:', error);
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    // Mock performance data
    setPerformanceData({
      successful_deliveries: 8750,
      total_attempts: 9200,
      avg_response_time: 225,
      cost_per_message: 0.012,
      success_rate_trend: 2.3,
      active_numbers_trend: 1.2,
      response_time_trend: -8.5,
      cost_trend: -3.1,
      delivery_rate_trend: 1.8,
      uptime: 99.7,
      uptime_trend: 0.2
    });
  };

  // Apply filters to numbers
  useEffect(() => {
    let filtered = [...numbers];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(number =>
        number.phone_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        number.country.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply country filter
    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter(number => filters.countries.includes(number.country));
    }

    // Apply status filter
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(number => filters.statuses.includes(number.status));
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(number => 
        filters.tags.some(tag => number.tags.includes(tag))
      );
    }

    // Apply performance range filter
    if (filters.performanceRange) {
      filtered = filtered.filter(number => 
        number.performance_score >= filters.performanceRange.min &&
        number.performance_score <= filters.performanceRange.max
      );
    }

    // Apply cost range filter
    if (filters.costRange) {
      filtered = filtered.filter(number => 
        number.monthly_cost >= filters.costRange.min &&
        number.monthly_cost <= filters.costRange.max
      );
    }

    // Apply message volume filter
    if (filters.messageVolume) {
      filtered = filtered.filter(number => 
        number.message_count >= filters.messageVolume.min &&
        number.message_count <= filters.messageVolume.max
      );
    }

    // Apply date range filter
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      filtered = filtered.filter(number => {
        const numberDate = new Date(number.created_at);
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : new Date('1900-01-01');
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : new Date();
        return numberDate >= fromDate && numberDate <= toDate;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];
        
        if (filters.sortBy === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    setFilteredNumbers(filtered);
  }, [numbers, filters]);

  // Handler functions
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleNumberSelect = (numberId, checked) => {
    if (checked) {
      setSelectedNumbers(prev => [...prev, numberId]);
    } else {
      setSelectedNumbers(prev => prev.filter(id => id !== numberId));
    }
  };

  const handleSelectAll = () => {
    setSelectedNumbers(filteredNumbers.map(n => n.id));
  };

  const handleDeselectAll = () => {
    setSelectedNumbers([]);
  };

  const handleBulkAction = (actionId, selectedItems) => {
    console.log('Bulk action:', actionId, selectedItems);
    
    switch (actionId) {
      case 'release':
        // Simulate releasing numbers
        setNumbers(prev => prev.filter(n => !selectedItems.includes(n.id)));
        setSelectedNumbers([]);
        break;
      case 'extend':
        // Simulate extending lease
        console.log('Extending lease for numbers:', selectedItems);
        setSelectedNumbers([]);
        break;
      case 'activate':
        // Simulate activating numbers
        setNumbers(prev => prev.map(n => 
          selectedItems.includes(n.id) ? { ...n, status: 'active' } : n
        ));
        setSelectedNumbers([]);
        break;
      case 'deactivate':
        // Simulate deactivating numbers
        setNumbers(prev => prev.map(n => 
          selectedItems.includes(n.id) ? { ...n, status: 'suspended' } : n
        ));
        setSelectedNumbers([]);
        break;
      case 'export':
        // Simulate export
        const exportData = numbers.filter(n => selectedItems.includes(n.id));
        console.log('Exporting:', exportData);
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  const handleCountrySelect = (country, countryData) => {
    console.log('Country selected:', country, countryData);
    setFilters(prev => ({
      ...prev,
      countries: [country]
    }));
  };

  const handleTimeRangeChange = (timeRange) => {
    console.log('Time range changed:', timeRange);
  };

  const handleExportData = () => {
    console.log('Exporting performance data');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'home' },
    { id: 'map', name: 'Global Map', icon: 'globe' },
    { id: 'analytics', name: 'Analytics', icon: 'barChart' },
    { id: 'management', name: 'Management', icon: 'settings' }
  ];

  if (loading) {
    return (
      <BaseLayout user={user} currentPath="/numbers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading phone numbers...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout user={user} currentPath="/numbers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Phone Number Management</h1>
            <p className="text-gray-600">
              Manage your phone numbers with advanced analytics and bulk operations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Icon name="upload" size="sm" className="mr-2" />
              Import Numbers
            </Button>
            <Button>
              <Icon name="plus" size="sm" className="mr-2" />
              Get New Number
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name={tab.icon} size="sm" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Numbers</p>
                      <p className="text-2xl font-bold text-gray-900">{numbers.length}</p>
                    </div>
                    <Icon name="phone" size="lg" className="text-blue-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {numbers.filter(n => n.status === 'active').length}
                      </p>
                    </div>
                    <Icon name="check" size="lg" className="text-green-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Countries</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {[...new Set(numbers.map(n => n.country))].length}
                      </p>
                    </div>
                    <Icon name="globe" size="lg" className="text-purple-500" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${numbers.reduce((sum, n) => sum + n.monthly_cost, 0).toFixed(0)}
                      </p>
                    </div>
                    <Icon name="dollarSign" size="lg" className="text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <AdvancedNumberFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />

              {/* Bulk Actions */}
              <BulkActions
                selectedItems={selectedNumbers.map(id => numbers.find(n => n.id === id)).filter(Boolean)}
                totalItems={filteredNumbers.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkAction={handleBulkAction}
              />

              {/* Numbers Table/Cards */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Phone Numbers ({filteredNumbers.length})
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'table' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                      >
                        <Icon name="list" size="sm" />
                      </Button>
                      <Button
                        variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                      >
                        <Icon name="grid" size="sm" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedNumbers.length === filteredNumbers.length && filteredNumbers.length > 0}
                                onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                                className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Country
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Performance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredNumbers.map((number) => (
                            <tr key={number.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedNumbers.includes(number.id)}
                                  onChange={(e) => handleNumberSelect(number.id, e.target.checked)}
                                  className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Icon name="phone" size="sm" className="text-gray-400 mr-2" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {number.phone_number}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {number.country}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(number.status)}`}>
                                  {number.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${number.performance_score}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-900">{number.performance_score}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${number.monthly_cost.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(number.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Icon name="edit" size="sm" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Icon name="moreHorizontal" size="sm" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredNumbers.map((number) => (
                        <div key={number.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <input
                              type="checkbox"
                              checked={selectedNumbers.includes(number.id)}
                              onChange={(e) => handleNumberSelect(number.id, e.target.checked)}
                              className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(number.status)}`}>
                              {number.status}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex items-center mb-1">
                              <Icon name="phone" size="sm" className="text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">{number.phone_number}</span>
                            </div>
                            <p className="text-sm text-gray-600">{number.country}</p>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Performance:</span>
                              <span className="font-medium">{number.performance_score}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Monthly Cost:</span>
                              <span className="font-medium">${number.monthly_cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Messages:</span>
                              <span className="font-medium">{number.message_count.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Icon name="edit" size="sm" className="mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Icon name="moreHorizontal" size="sm" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <PhoneNumberMap
              numbers={numbers}
              onNumberSelect={handleNumberSelect}
              onCountrySelect={handleCountrySelect}
              selectedNumbers={selectedNumbers}
            />
          )}

          {activeTab === 'analytics' && (
            <NumberPerformanceAnalytics
              numbers={numbers}
              performanceData={performanceData}
              onTimeRangeChange={handleTimeRangeChange}
              onExportData={handleExportData}
            />
          )}

          {activeTab === 'management' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Number Management Tools</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <Icon name="refresh" size="lg" className="text-blue-500 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Auto Rotation</h4>
                    <p className="text-sm text-gray-600 mb-4">Automatically rotate underperforming numbers</p>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <Icon name="upload" size="lg" className="text-green-500 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Bulk Import</h4>
                    <p className="text-sm text-gray-600 mb-4">Import numbers from CSV or Excel files</p>
                    <Button variant="outline" size="sm">Import</Button>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <Icon name="download" size="lg" className="text-purple-500 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Export number data and analytics</p>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default NumbersPage;