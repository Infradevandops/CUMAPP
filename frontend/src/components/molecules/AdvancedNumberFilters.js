import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const AdvancedNumberFilters = ({
  onFiltersChange,
  initialFilters = {},
  availableCountries = [],
  availableStatuses = [],
  availableTags = [],
  className = '',
  ...props
}) => {
  const [filters, setFilters] = useState({
    search: '',
    countries: [],
    statuses: [],
    tags: [],
    dateRange: { from: '', to: '' },
    performanceRange: { min: 0, max: 100 },
    costRange: { min: 0, max: 1000 },
    messageVolume: { min: 0, max: 10000 },
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);

  useEffect(() => {
    // Load saved filters from localStorage
    const saved = localStorage.getItem('phoneNumberFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterChange = (key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
  };

  const handleRangeChange = (key, subKey, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [subKey]: value
      }
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      countries: [],
      statuses: [],
      tags: [],
      dateRange: { from: '', to: '' },
      performanceRange: { min: 0, max: 100 },
      costRange: { min: 0, max: 1000 },
      messageVolume: { min: 0, max: 10000 },
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
  };

  const saveCurrentFilters = () => {
    const name = prompt('Enter a name for this filter set:');
    if (!name) return;

    const newSavedFilter = {
      id: Date.now(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };

    const updatedSaved = [...savedFilters, newSavedFilter];
    setSavedFilters(updatedSaved);
    localStorage.setItem('phoneNumberFilters', JSON.stringify(updatedSaved));
  };

  const loadSavedFilters = (savedFilter) => {
    setFilters(savedFilter.filters);
  };

  const deleteSavedFilter = (filterId) => {
    const updatedSaved = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedSaved);
    localStorage.setItem('phoneNumberFilters', JSON.stringify(updatedSaved));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.countries.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.performanceRange.min > 0 || filters.performanceRange.max < 100) count++;
    if (filters.costRange.min > 0 || filters.costRange.max < 1000) count++;
    if (filters.messageVolume.min > 0 || filters.messageVolume.max < 10000) count++;
    return count;
  };

  const defaultCountries = availableCountries.length > 0 ? availableCountries : [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Brazil'
  ];

  const defaultStatuses = availableStatuses.length > 0 ? availableStatuses : [
    'active', 'pending', 'expired', 'suspended'
  ];

  const defaultTags = availableTags.length > 0 ? availableTags : [
    'high-volume', 'marketing', 'support', 'verification', 'alerts', 'testing'
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'phone_number', label: 'Phone Number' },
    { value: 'country', label: 'Country' },
    { value: 'status', label: 'Status' },
    { value: 'performance', label: 'Performance' },
    { value: 'cost', label: 'Cost' },
    { value: 'message_count', label: 'Message Volume' }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`} {...props}>
      {/* Basic Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search phone numbers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Status Filters */}
        <div className="flex items-center space-x-2">
          {defaultStatuses.map(status => (
            <label key={status} className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={(e) => handleArrayFilterChange('statuses', status, e.target.checked)}
                className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 capitalize">{status}</span>
            </label>
          ))}
        </div>

        {/* Advanced Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
        >
          <Icon name="settings" size="sm" className="mr-1" />
          Advanced
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                {defaultCountries.map(country => (
                  <label key={country} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(country)}
                      onChange={(e) => handleArrayFilterChange('countries', country, e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{country}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                {defaultTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={(e) => handleArrayFilterChange('tags', tag, e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => handleRangeChange('dateRange', 'from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => handleRangeChange('dateRange', 'to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Performance Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Range ({filters.performanceRange.min}% - {filters.performanceRange.max}%)
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.performanceRange.min}
                  onChange={(e) => handleRangeChange('performanceRange', 'min', parseInt(e.target.value))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.performanceRange.max}
                  onChange={(e) => handleRangeChange('performanceRange', 'max', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Cost Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Cost (${filters.costRange.min} - ${filters.costRange.max})
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.costRange.min}
                  onChange={(e) => handleRangeChange('costRange', 'min', parseInt(e.target.value))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.costRange.max}
                  onChange={(e) => handleRangeChange('costRange', 'max', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Message Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Volume ({filters.messageVolume.min} - {filters.messageVolume.max})
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.messageVolume.min}
                  onChange={(e) => handleRangeChange('messageVolume', 'min', parseInt(e.target.value))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.messageVolume.max}
                  onChange={(e) => handleRangeChange('messageVolume', 'max', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                <Icon name="x" size="sm" className="mr-1" />
                Clear All
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={saveCurrentFilters}
                disabled={getActiveFilterCount() === 0}
              >
                <Icon name="bookmark" size="sm" className="mr-1" />
                Save Filters
              </Button>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Saved:</span>
                {savedFilters.map(savedFilter => (
                  <div key={savedFilter.id} className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSavedFilters(savedFilter)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {savedFilter.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => deleteSavedFilter(savedFilter.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon name="x" size="xs" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <Icon name="x" size="xs" />
              </button>
            </span>
          )}
          
          {filters.countries.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Countries: {filters.countries.length}
              <button
                onClick={() => handleFilterChange('countries', [])}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <Icon name="x" size="xs" />
              </button>
            </span>
          )}
          
          {filters.statuses.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Status: {filters.statuses.length}
              <button
                onClick={() => handleFilterChange('statuses', [])}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                <Icon name="x" size="xs" />
              </button>
            </span>
          )}
          
          {filters.tags.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Tags: {filters.tags.length}
              <button
                onClick={() => handleFilterChange('tags', [])}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <Icon name="x" size="xs" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

AdvancedNumberFilters.propTypes = {
  onFiltersChange: PropTypes.func,
  initialFilters: PropTypes.object,
  availableCountries: PropTypes.array,
  availableStatuses: PropTypes.array,
  availableTags: PropTypes.array,
  className: PropTypes.string
};

export default AdvancedNumberFilters;