import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const AdvancedSearchBar = ({
  placeholder = 'Search...',
  onSearch,
  onFilterChange,
  filters = [],
  sortOptions = [],
  className = '',
  showFilters = true,
  showSort = true,
  showAdvanced = true,
  initialQuery = '',
  initialFilters = {},
  initialSort = null,
  ...props
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    exactPhrase: '',
    excludeWords: '',
    dateFrom: '',
    dateTo: '',
    fileType: '',
    author: '',
    tags: [],
    minSize: '',
    maxSize: ''
  });
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Load search history and saved searches from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    
    const savedSearchesData = localStorage.getItem('savedSearches');
    if (savedSearchesData) {
      setSavedSearches(JSON.parse(savedSearchesData));
    }
  }, []);

  // Save search to history
  const saveToHistory = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const buildSearchQuery = useCallback(() => {
    let searchQuery = query.trim();
    
    // Add advanced filters to query
    if (advancedFilters.exactPhrase) {
      searchQuery += ` "${advancedFilters.exactPhrase}"`;
    }
    
    if (advancedFilters.excludeWords) {
      const excludeWords = advancedFilters.excludeWords.split(' ').filter(word => word.trim());
      excludeWords.forEach(word => {
        searchQuery += ` -${word}`;
      });
    }
    
    return searchQuery;
  }, [query, advancedFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      const searchData = {
        query: buildSearchQuery(),
        originalQuery: query.trim(),
        filters: activeFilters,
        sort: selectedSort,
        advanced: advancedFilters
      };
      
      onSearch(searchData);
      saveToHistory(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Show suggestions when typing
    if (value.length > 0 && searchHistory.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Real-time search (debounced)
    if (onSearch) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        const searchData = {
          query: value.trim(),
          originalQuery: value.trim(),
          filters: activeFilters,
          sort: selectedSort,
          advanced: advancedFilters
        };
        onSearch(searchData);
      }, 300);
    }
  };

  const handleFilterToggle = (filterKey, value) => {
    const newFilters = { ...activeFilters };
    
    if (newFilters[filterKey]) {
      if (Array.isArray(newFilters[filterKey])) {
        if (newFilters[filterKey].includes(value)) {
          newFilters[filterKey] = newFilters[filterKey].filter(v => v !== value);
          if (newFilters[filterKey].length === 0) {
            delete newFilters[filterKey];
          }
        } else {
          newFilters[filterKey].push(value);
        }
      } else {
        if (newFilters[filterKey] === value) {
          delete newFilters[filterKey];
        } else {
          newFilters[filterKey] = value;
        }
      }
    } else {
      newFilters[filterKey] = Array.isArray(filters.find(f => f.key === filterKey)?.options) ? [value] : value;
    }
    
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
    setShowSortDropdown(false);
    
    if (onSearch) {
      onSearch({
        query: query.trim(),
        filters: activeFilters,
        sort: sortOption
      });
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSelectedSort(null);
    onFilterChange?.({});
    
    if (onSearch) {
      const searchData = {
        query: buildSearchQuery(),
        originalQuery: query.trim(),
        filters: {},
        sort: null,
        advanced: advancedFilters
      };
      onSearch(searchData);
    }
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      exactPhrase: '',
      excludeWords: '',
      dateFrom: '',
      dateTo: '',
      fileType: '',
      author: '',
      tags: [],
      minSize: '',
      maxSize: ''
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSelectedSort(null);
    clearAdvancedFilters();
    onFilterChange?.({});
    
    if (onSearch) {
      const searchData = {
        query: query.trim(),
        originalQuery: query.trim(),
        filters: {},
        sort: null,
        advanced: {
          exactPhrase: '',
          excludeWords: '',
          dateFrom: '',
          dateTo: '',
          fileType: '',
          author: '',
          tags: [],
          minSize: '',
          maxSize: ''
        }
      };
      onSearch(searchData);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    
    if (onSearch) {
      const searchData = {
        query: '',
        originalQuery: '',
        filters: activeFilters,
        sort: selectedSort,
        advanced: advancedFilters
      };
      onSearch(searchData);
    }
  };

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    
    if (onSearch) {
      const searchData = {
        query: suggestion,
        originalQuery: suggestion,
        filters: activeFilters,
        sort: selectedSort,
        advanced: advancedFilters
      };
      onSearch(searchData);
    }
  };

  const handleAdvancedFilterChange = (key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveCurrentSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (!searchName) return;
    
    const searchData = {
      id: Date.now(),
      name: searchName,
      query: query.trim(),
      filters: activeFilters,
      sort: selectedSort,
      advanced: advancedFilters,
      createdAt: new Date().toISOString()
    };
    
    const newSavedSearches = [...savedSearches, searchData];
    setSavedSearches(newSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
  };

  const loadSavedSearch = (savedSearch) => {
    setQuery(savedSearch.query);
    setActiveFilters(savedSearch.filters);
    setSelectedSort(savedSearch.sort);
    setAdvancedFilters(savedSearch.advanced);
    setShowSavedSearches(false);
    
    if (onSearch) {
      const searchData = {
        query: savedSearch.query,
        originalQuery: savedSearch.query,
        filters: savedSearch.filters,
        sort: savedSearch.sort,
        advanced: savedSearch.advanced
      };
      onSearch(searchData);
    }
  };

  const deleteSavedSearch = (searchId) => {
    const newSavedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(newSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
  };

  const exportSearchResults = () => {
    const searchData = {
      query: buildSearchQuery(),
      filters: activeFilters,
      sort: selectedSort,
      advanced: advancedFilters,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(searchData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const getSortLabel = () => {
    if (!selectedSort) return 'Sort';
    const option = sortOptions.find(opt => opt.value === selectedSort);
    return option ? option.label : 'Sort';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative" ref={searchRef}>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.length > 0 && searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-gray-400" />
          </div>
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Icon name="x" size="sm" />
            </button>
          )}
          
          {/* Search Suggestions */}
          {showSuggestions && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Recent Searches
                </div>
                {searchHistory
                  .filter(item => item.toLowerCase().includes(query.toLowerCase()))
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Icon name="search" size="sm" className="text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        <Button type="submit" variant="primary">
          <Icon name="search" size="sm" />
        </Button>
        
        {/* Save Search Button */}
        {(query.trim() || Object.keys(activeFilters).length > 0) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={saveCurrentSearch}
            title="Save this search"
          >
            <Icon name="bookmark" size="sm" />
          </Button>
        )}
        
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              title="Saved searches"
            >
              <Icon name="bookmarkFilled" size="sm" />
            </Button>
            
            {showSavedSearches && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-64">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                    Saved Searches
                  </div>
                  {savedSearches.map((savedSearch) => (
                    <div key={savedSearch.id} className="px-3 py-2 hover:bg-gray-50 flex items-center justify-between">
                      <button
                        onClick={() => loadSavedSearch(savedSearch)}
                        className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
                      >
                        <div className="font-medium">{savedSearch.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {savedSearch.query || 'Advanced search'}
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSavedSearch(savedSearch.id)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <Icon name="trash" size="xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Filter and Sort Controls */}
      {(showFilters || showSort || showAdvanced) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Filters */}
            {showFilters && filters.length > 0 && (
              <div className="relative" ref={filterRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={getActiveFilterCount() > 0 ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                  <Icon name="settings" size="sm" />
                  <span className="ml-1">
                    Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                  </span>
                  <Icon name="chevronDown" size="sm" className="ml-1" />
                </Button>
                
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-64">
                    <div className="py-2">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 flex justify-between items-center">
                        <span>Filter Options</span>
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={clearFilters}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {filters.map((filter) => (
                        <div key={filter.key} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {filter.label}
                          </div>
                          <div className="space-y-1">
                            {filter.options.map((option) => {
                              const isActive = activeFilters[filter.key] 
                                ? (Array.isArray(activeFilters[filter.key]) 
                                    ? activeFilters[filter.key].includes(option.value)
                                    : activeFilters[filter.key] === option.value)
                                : false;
                              
                              return (
                                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type={filter.multiple ? 'checkbox' : 'radio'}
                                    name={filter.key}
                                    checked={isActive}
                                    onChange={() => handleFilterToggle(filter.key, option.value)}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-600">{option.label}</span>
                                  {option.count && (
                                    <span className="text-xs text-gray-400">({option.count})</span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Sort */}
            {showSort && sortOptions.length > 0 && (
              <div className="relative" ref={sortRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className={selectedSort ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                >
                  <span>{getSortLabel()}</span>
                  <Icon name="chevronDown" size="sm" className="ml-1" />
                </Button>
                
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-48">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                            selectedSort === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          <span>{option.label}</span>
                          {selectedSort === option.value && (
                            <Icon name="check" size="sm" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Advanced Search Toggle */}
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={showAdvancedSearch ? 'bg-blue-50 text-blue-600' : ''}
              >
                <Icon name="settings" size="sm" className="mr-1" />
                Advanced
              </Button>
            )}
            
            {/* Export Results */}
            <Button
              variant="ghost"
              size="sm"
              onClick={exportSearchResults}
              title="Export search configuration"
            >
              <Icon name="download" size="sm" />
            </Button>
          </div>
          
          {/* Active Filters Display */}
          {(getActiveFilterCount() > 0 || Object.values(advancedFilters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(activeFilters).map(([key, value]) => {
                  const filter = filters.find(f => f.key === key);
                  const values = Array.isArray(value) ? value : [value];
                  
                  return values.map((val) => {
                    const option = filter?.options.find(opt => opt.value === val);
                    return (
                      <span
                        key={`${key}-${val}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {option?.label || val}
                        <button
                          onClick={() => handleFilterToggle(key, val)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <Icon name="x" size="xs" />
                        </button>
                      </span>
                    );
                  });
                })}
                
                {/* Advanced Filter Tags */}
                {advancedFilters.exactPhrase && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Exact: "{advancedFilters.exactPhrase}"
                    <button
                      onClick={() => handleAdvancedFilterChange('exactPhrase', '')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <Icon name="x" size="xs" />
                    </button>
                  </span>
                )}
                
                {advancedFilters.excludeWords && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Exclude: {advancedFilters.excludeWords}
                    <button
                      onClick={() => handleAdvancedFilterChange('excludeWords', '')}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      <Icon name="x" size="xs" />
                    </button>
                  </span>
                )}
                
                {(advancedFilters.dateFrom || advancedFilters.dateTo) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Date: {advancedFilters.dateFrom || '...'} - {advancedFilters.dateTo || '...'}
                    <button
                      onClick={() => {
                        handleAdvancedFilterChange('dateFrom', '');
                        handleAdvancedFilterChange('dateTo', '');
                      }}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <Icon name="x" size="xs" />
                    </button>
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="xs"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Advanced Search Options</h4>
            <Button
              variant="ghost"
              size="xs"
              onClick={clearAdvancedFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear advanced
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Text Filters */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Exact phrase
              </label>
              <input
                type="text"
                value={advancedFilters.exactPhrase}
                onChange={(e) => handleAdvancedFilterChange('exactPhrase', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter exact phrase"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Exclude words
              </label>
              <input
                type="text"
                value={advancedFilters.excludeWords}
                onChange={(e) => handleAdvancedFilterChange('excludeWords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Words to exclude (space separated)"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={advancedFilters.author}
                onChange={(e) => handleAdvancedFilterChange('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Author name"
              />
            </div>
            
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date from
              </label>
              <input
                type="date"
                value={advancedFilters.dateFrom}
                onChange={(e) => handleAdvancedFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date to
              </label>
              <input
                type="date"
                value={advancedFilters.dateTo}
                onChange={(e) => handleAdvancedFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File type
              </label>
              <select 
                value={advancedFilters.fileType}
                onChange={(e) => handleAdvancedFilterChange('fileType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any file type</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="docx">Word Document</option>
                <option value="txt">Text File</option>
                <option value="image">Image</option>
                <option value="jpg">JPEG Image</option>
                <option value="png">PNG Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="zip">Archive</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            {/* Size Filters */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Min size (KB)
              </label>
              <input
                type="number"
                value={advancedFilters.minSize}
                onChange={(e) => handleAdvancedFilterChange('minSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum file size"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max size (KB)
              </label>
              <input
                type="number"
                value={advancedFilters.maxSize}
                onChange={(e) => handleAdvancedFilterChange('maxSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Maximum file size"
                min="0"
              />
            </div>
          </div>
          
          {/* Quick Presets */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Quick presets
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  handleAdvancedFilterChange('dateFrom', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                  handleAdvancedFilterChange('dateTo', new Date().toISOString().split('T')[0]);
                }}
              >
                Last 24 hours
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  handleAdvancedFilterChange('dateFrom', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                  handleAdvancedFilterChange('dateTo', new Date().toISOString().split('T')[0]);
                }}
              >
                Last week
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  handleAdvancedFilterChange('dateFrom', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                  handleAdvancedFilterChange('dateTo', new Date().toISOString().split('T')[0]);
                }}
              >
                Last month
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  handleAdvancedFilterChange('fileType', 'image');
                }}
              >
                Images only
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  handleAdvancedFilterChange('fileType', 'pdf');
                }}
              >
                PDFs only
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdvancedSearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  onFilterChange: PropTypes.func,
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number
    })).isRequired
  })),
  sortOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  className: PropTypes.string,
  showFilters: PropTypes.bool,
  showSort: PropTypes.bool,
  showAdvanced: PropTypes.bool,
  initialQuery: PropTypes.string,
  initialFilters: PropTypes.object,
  initialSort: PropTypes.string,
  onExport: PropTypes.func,
  onSaveSearch: PropTypes.func,
  onLoadSearch: PropTypes.func
};

export default AdvancedSearchBar;