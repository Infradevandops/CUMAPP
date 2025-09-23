import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const PhoneNumberMap = ({
  phoneNumbers = [],
  onNumberSelect,
  onNumberAction,
  showControls = true,
  showFilters = true,
  mapHeight = 400,
  className = '',
  ...props
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [mapView, setMapView] = useState('world');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapData, setMapData] = useState({});
  const mapRef = useRef(null);
  const svgRef = useRef(null);

  // Geographic regions for phone numbers
  const regions = {
    'US': { name: 'United States', coords: [39.8283, -98.5795], color: '#3b82f6' },
    'CA': { name: 'Canada', coords: [56.1304, -106.3468], color: '#10b981' },
    'UK': { name: 'United Kingdom', coords: [55.3781, -3.4360], color: '#f59e0b' },
    'AU': { name: 'Australia', coords: [-25.2744, 133.7751], color: '#ef4444' },
    'DE': { name: 'Germany', coords: [51.1657, 10.4515], color: '#8b5cf6' },
    'FR': { name: 'France', coords: [46.2276, 2.2137], color: '#06b6d4' },
    'JP': { name: 'Japan', coords: [36.2048, 138.2529], color: '#f97316' },
    'BR': { name: 'Brazil', coords: [-14.2350, -51.9253], color: '#84cc16' }
  };

  // Process phone numbers by region
  useEffect(() => {
    const processedData = phoneNumbers.reduce((acc, number) => {
      const region = getRegionFromNumber(number.number);
      if (!acc[region]) {
        acc[region] = {
          count: 0,
          active: 0,
          available: 0,
          busy: 0,
          numbers: []
        };
      }
      
      acc[region].count++;
      acc[region][number.status]++;
      acc[region].numbers.push(number);
      
      return acc;
    }, {});

    setMapData(processedData);
  }, [phoneNumbers]);

  const getRegionFromNumber = (phoneNumber) => {
    // Simple region detection based on country code
    if (phoneNumber.startsWith('+1')) {
      // Check if it's Canada (specific area codes) or US
      const areaCode = phoneNumber.substring(2, 5);
      const canadianAreaCodes = ['204', '226', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', '639', '647', '672', '705', '709', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'];
      return canadianAreaCodes.includes(areaCode) ? 'CA' : 'US';
    }
    if (phoneNumber.startsWith('+44')) return 'UK';
    if (phoneNumber.startsWith('+61')) return 'AU';
    if (phoneNumber.startsWith('+49')) return 'DE';
    if (phoneNumber.startsWith('+33')) return 'FR';
    if (phoneNumber.startsWith('+81')) return 'JP';
    if (phoneNumber.startsWith('+55')) return 'BR';
    return 'OTHER';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'available': return '#3b82f6';
      case 'busy': return '#f59e0b';
      case 'inactive': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getRegionStats = (regionCode) => {
    return mapData[regionCode] || { count: 0, active: 0, available: 0, busy: 0, numbers: [] };
  };

  const handleNumberSelect = (number) => {
    setSelectedNumbers(prev => {
      const isSelected = prev.find(n => n.id === number.id);
      if (isSelected) {
        return prev.filter(n => n.id !== number.id);
      } else {
        return [...prev, number];
      }
    });
    onNumberSelect?.(number);
  };

  const handleBulkAction = (action) => {
    if (selectedNumbers.length === 0) return;
    
    onNumberAction?.(action, selectedNumbers);
    setSelectedNumbers([]);
  };

  const filteredNumbers = phoneNumbers.filter(number => {
    if (filterStatus === 'all') return true;
    return number.status === filterStatus;
  });

  const renderWorldMap = () => (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1000 500"
        className="w-full h-full"
      >
        {/* World map background */}
        <rect width="1000" height="500" fill="#f8fafc" />
        
        {/* Simplified world map regions */}
        {Object.entries(regions).map(([code, region]) => {
          const stats = getRegionStats(code);
          const hasNumbers = stats.count > 0;
          
          return (
            <g key={code}>
              {/* Region representation (simplified rectangles for demo) */}
              <rect
                x={getRegionX(code)}
                y={getRegionY(code)}
                width={60}
                height={40}
                fill={hasNumbers ? region.color : '#e5e7eb'}
                fillOpacity={hasNumbers ? 0.7 : 0.3}
                stroke="#374151"
                strokeWidth="1"
                rx="4"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setMapView(code)}
              />
              
              {/* Region label */}
              <text
                x={getRegionX(code) + 30}
                y={getRegionY(code) + 25}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {code}
              </text>
              
              {/* Number count */}
              {hasNumbers && (
                <text
                  x={getRegionX(code) + 30}
                  y={getRegionY(code) + 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {stats.count}
                </text>
              )}
              
              {/* Status indicators */}
              {hasNumbers && (
                <g>
                  <circle
                    cx={getRegionX(code) + 50}
                    cy={getRegionY(code) + 10}
                    r="3"
                    fill="#10b981"
                    opacity={stats.active > 0 ? 1 : 0.3}
                  />
                  <circle
                    cx={getRegionX(code) + 50}
                    cy={getRegionY(code) + 20}
                    r="3"
                    fill="#3b82f6"
                    opacity={stats.available > 0 ? 1 : 0.3}
                  />
                  <circle
                    cx={getRegionX(code) + 50}
                    cy={getRegionY(code) + 30}
                    r="3"
                    fill="#f59e0b"
                    opacity={stats.busy > 0 ? 1 : 0.3}
                  />
                </g>
              )}
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform="translate(20, 420)">
          <rect width="200" height="60" fill="white" fillOpacity="0.9" stroke="#d1d5db" rx="4" />
          <text x="10" y="15" className="text-xs font-medium fill-gray-700">Status Legend</text>
          
          <circle cx="15" cy="25" r="3" fill="#10b981" />
          <text x="25" y="29" className="text-xs fill-gray-600">Active</text>
          
          <circle cx="15" cy="35" r="3" fill="#3b82f6" />
          <text x="25" y="39" className="text-xs fill-gray-600">Available</text>
          
          <circle cx="15" cy="45" r="3" fill="#f59e0b" />
          <text x="25" y="49" className="text-xs fill-gray-600">Busy</text>
          
          <circle cx="80" cy="25" r="3" fill="#6b7280" />
          <text x="90" y="29" className="text-xs fill-gray-600">Inactive</text>
        </g>
      </svg>
      
      {/* Heatmap overlay */}
      {showHeatmap && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-green-500/20 to-red-500/20 pointer-events-none" />
      )}
    </div>
  );

  const getRegionX = (code) => {
    const positions = {
      'US': 200, 'CA': 180, 'UK': 480, 'AU': 800, 
      'DE': 500, 'FR': 460, 'JP': 850, 'BR': 300
    };
    return positions[code] || 400;
  };

  const getRegionY = (code) => {
    const positions = {
      'US': 180, 'CA': 120, 'UK': 140, 'AU': 350, 
      'DE': 120, 'FR': 160, 'JP': 160, 'BR': 280
    };
    return positions[code] || 200;
  };

  const renderRegionDetail = (regionCode) => {
    const stats = getRegionStats(regionCode);
    const region = regions[regionCode];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMapView('world')}
            >
              <Icon name="arrowLeft" size="sm" />
            </Button>
            <h3 className="text-lg font-semibold text-gray-900">{region?.name || regionCode}</h3>
          </div>
          <div className="text-sm text-gray-600">
            {stats.count} number{stats.count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Region Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-700">Active</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
            <div className="text-sm text-blue-700">Available</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.busy}</div>
            <div className="text-sm text-yellow-700">Busy</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.count}</div>
            <div className="text-sm text-gray-700">Total</div>
          </div>
        </div>

        {/* Numbers List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Phone Numbers</h4>
          </div>
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {stats.numbers.map(number => (
              <div
                key={number.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedNumbers.find(n => n.id === number.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNumberSelect(number)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNumbers.find(n => n.id === number.id) !== undefined}
                      onChange={() => handleNumberSelect(number)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{number.number}</div>
                      <div className="text-sm text-gray-600">{number.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        number.status === 'active' ? 'bg-green-100 text-green-800' :
                        number.status === 'available' ? 'bg-blue-100 text-blue-800' :
                        number.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {number.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNumberAction?.('view', [number]);
                      }}
                    >
                      <Icon name="externalLink" size="xs" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Phone Number Map</h3>
            <p className="text-sm text-gray-600">
              Geographic distribution of {phoneNumbers.length} phone numbers
            </p>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <Button
                variant={showHeatmap ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Icon name="thermometer" size="sm" className="mr-1" />
                Heatmap
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMapView('world')}
              >
                <Icon name="globe" size="sm" className="mr-1" />
                World View
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            {selectedNumbers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedNumbers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Content */}
      <div className="p-4">
        <div style={{ height: `${mapHeight}px` }} ref={mapRef}>
          {mapView === 'world' ? renderWorldMap() : renderRegionDetail(mapView)}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{phoneNumbers.length}</div>
            <div className="text-xs text-gray-600">Total Numbers</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {phoneNumbers.filter(n => n.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {phoneNumbers.filter(n => n.status === 'available').length}
            </div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {phoneNumbers.filter(n => n.status === 'busy').length}
            </div>
            <div className="text-xs text-gray-600">Busy</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">
              {Object.keys(mapData).length}
            </div>
            <div className="text-xs text-gray-600">Regions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

PhoneNumberMap.propTypes = {
  phoneNumbers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    number: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['active', 'available', 'busy', 'inactive']).isRequired,
    description: PropTypes.string
  })),
  onNumberSelect: PropTypes.func,
  onNumberAction: PropTypes.func,
  showControls: PropTypes.bool,
  showFilters: PropTypes.bool,
  mapHeight: PropTypes.number,
  className: PropTypes.string
};

export default PhoneNumberMap;