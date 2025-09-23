import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const GlobalSearch = ({
  onSearch,
  onResultSelect,
  placeholder = 'Search everything...',
  showCategories = true,
  showRecent = true,
  maxResults = 50,
  debounceMs = 300,
  className = '',
  ...props
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchStats, setSearchStats] = useState({});
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All', icon: 'search', color: 'gray' },
    { id: 'messages', label: 'Messages', icon: 'messageSquare', color: 'blue' },
    { id: 'files', label: 'Files', icon: 'file', color: 'green' },
    { id: 'users', label: 'Users', icon: 'users', color: 'purple' },
    { id: 'numbers', label: 'Numbers', icon: 'phone', color: 'orange' },
    { id: 'campaigns', label: 'Campaigns', icon: 'megaphone', color: 'red' },
    { id: 'analytics', label: 'Analytics', icon: 'barChart', color: 'indigo' }
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentGlobalSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery, category) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Mock search results - in a real app, this would be an API call
        const mockResults = await performGlobalSearch(searchQuery, category);
        setResults(mockResults);
        setSearchStats({
          total: mockResults.length,
          categories: mockResults.reduce((acc, result) => {
            acc[result.category] = (acc[result.category] || 0) + 1;
            return acc;
          }, {}),
          searchTime: Math.random() * 100 + 50 // Mock search time
        });
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Mock search function - replace with real API call
  const performGlobalSearch = async (query, category) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockData = {
      messages: [
        { id: 1, title: 'Welcome message template', content: 'Hello and welcome to our service...', type: 'template', date: '2024-01-15' },
        { id: 2, title: 'Follow-up campaign', content: 'Thank you for your interest...', type: 'campaign', date: '2024-01-14' },
        { id: 3, title: 'Support conversation', content: 'How can I help you today?', type: 'conversation', date: '2024-01-13' }
      ],
      files: [
        { id: 4, title: 'Campaign Report Q1.pdf', content: 'Quarterly campaign performance report', type: 'pdf', size: '2.4 MB', date: '2024-01-12' },
        { id: 5, title: 'Customer List.csv', content: 'Updated customer contact information', type: 'csv', size: '856 KB', date: '2024-01-11' },
        { id: 6, title: 'Brand Guidelines.docx', content: 'Company branding and style guide', type: 'docx', size: '1.2 MB', date: '2024-01-10' }
      ],
      users: [
        { id: 7, title: 'John Smith', content: 'Marketing Manager - john.smith@company.com', type: 'user', role: 'manager', date: '2024-01-09' },
        { id: 8, title: 'Sarah Johnson', content: 'Sales Representative - sarah.j@company.com', type: 'user', role: 'sales', date: '2024-01-08' },
        { id: 9, title: 'Mike Davis', content: 'Customer Support - mike.davis@company.com', type: 'user', role: 'support', date: '2024-01-07' }
      ],
      numbers: [
        { id: 10, title: '+1 (555) 123-4567', content: 'Primary business line - Active', type: 'phone', status: 'active', date: '2024-01-06' },
        { id: 11, title: '+1 (555) 987-6543', content: 'Campaign line - Available', type: 'phone', status: 'available', date: '2024-01-05' },
        { id: 12, title: '+1 (555) 456-7890', content: 'Support line - In use', type: 'phone', status: 'busy', date: '2024-01-04' }
      ],
      campaigns: [
        { id: 13, title: 'Spring Sale 2024', content: 'Seasonal promotion campaign', type: 'campaign', status: 'active', date: '2024-01-03' },
        { id: 14, title: 'New Customer Welcome', content: 'Onboarding message sequence', type: 'campaign', status: 'draft', date: '2024-01-02' },
        { id: 15, title: 'Holiday Greetings', content: 'End of year customer appreciation', type: 'campaign', status: 'completed', date: '2024-01-01' }
      ],
      analytics: [
        { id: 16, title: 'Message Delivery Report', content: 'Daily delivery statistics and metrics', type: 'report', date: '2024-01-15' },
        { id: 17, title: 'User Engagement Analysis', content: 'Weekly user activity and engagement data', type: 'analysis', date: '2024-01-14' },
        { id: 18, title: 'Revenue Dashboard', content: 'Monthly revenue and growth metrics', type: 'dashboard', date: '2024-01-13' }
      ]
    };

    let searchResults = [];
    const queryLower = query.toLowerCase();

    // Search in selected category or all categories
    const categoriesToSearch = category === 'all' ? Object.keys(mockData) : [category];

    categoriesToSearch.forEach(cat => {
      if (mockData[cat]) {
        const categoryResults = mockData[cat]
          .filter(item => 
            item.title.toLowerCase().includes(queryLower) ||
            item.content.toLowerCase().includes(queryLower)
          )
          .map(item => ({
            ...item,
            category: cat,
            relevance: calculateRelevance(item, queryLower),
            highlights: highlightMatches(item, queryLower)
          }));
        
        searchResults = [...searchResults, ...categoryResults];
      }
    });

    // Sort by relevance and limit results
    return searchResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  };

  const calculateRelevance = (item, query) => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();

    // Title matches are more relevant
    if (titleLower.includes(query)) {
      score += titleLower.indexOf(query) === 0 ? 100 : 50;
    }

    // Content matches
    if (contentLower.includes(query)) {
      score += 25;
    }

    // Exact matches get higher scores
    if (titleLower === query || contentLower === query) {
      score += 200;
    }

    // Recent items get slight boost
    const itemDate = new Date(item.date);
    const daysSinceCreated = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSinceCreated);

    return score;
  };

  const highlightMatches = (item, query) => {
    const highlightText = (text, query) => {
      if (!query || !text) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    return {
      title: highlightText(item.title, query),
      content: highlightText(item.content, query)
    };
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
      debouncedSearch(value, selectedCategory);
    } else {
      setIsOpen(false);
      setResults([]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultSelect = (result) => {
    saveToRecentSearches(query);
    setIsOpen(false);
    setQuery('');
    onResultSelect?.(result);
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveToRecentSearches(query);
      setIsOpen(false);
      onSearch?.({
        query: query.trim(),
        category: selectedCategory,
        results: results
      });
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (query.trim()) {
      debouncedSearch(query, categoryId);
    }
  };

  const saveToRecentSearches = (searchQuery) => {
    if (!searchQuery.trim()) return;

    const newRecent = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 10);

    setRecentSearches(newRecent);
    localStorage.setItem('recentGlobalSearches', JSON.stringify(newRecent));
  };

  const selectRecentSearch = (recentQuery) => {
    setQuery(recentQuery);
    setIsOpen(true);
    debouncedSearch(recentQuery, selectedCategory);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentGlobalSearches');
  };

  const getResultIcon = (result) => {
    const iconMap = {
      messages: 'messageSquare',
      files: 'file',
      users: 'user',
      numbers: 'phone',
      campaigns: 'megaphone',
      analytics: 'barChart'
    };
    return iconMap[result.category] || 'search';
  };

  const getResultColor = (result) => {
    const category = categories.find(cat => cat.id === result.category);
    return category?.color || 'gray';
  };

  const formatResultDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef} {...props}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() || recentSearches.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        />
        
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="search" size="sm" className="text-gray-400" />
        </div>

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <Icon name="x" size="sm" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Categories */}
          {showCategories && (
            <div className="flex items-center space-x-1 p-3 border-b border-gray-200 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? `bg-${category.color}-100 text-${category.color}-700`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon name={category.icon} size="xs" />
                  <span>{category.label}</span>
                  {searchStats.categories?.[category.id] && (
                    <span className="ml-1 px-1 bg-white rounded-full text-xs">
                      {searchStats.categories[category.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && results.length > 0 && (
              <>
                {/* Search Stats */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      {searchStats.total} result{searchStats.total !== 1 ? 's' : ''} found
                    </span>
                    <span>
                      {searchStats.searchTime?.toFixed(0)}ms
                    </span>
                  </div>
                </div>

                {/* Results List */}
                <div className="py-1">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className={`w-full text-left px-3 py-3 hover:bg-gray-50 flex items-start space-x-3 transition-colors ${
                        index === selectedIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${getResultColor(result)}-100 flex items-center justify-center`}>
                        <Icon 
                          name={getResultIcon(result)} 
                          size="sm" 
                          className={`text-${getResultColor(result)}-600`}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div 
                          className="text-sm font-medium text-gray-900 truncate"
                          dangerouslySetInnerHTML={{ __html: result.highlights?.title || result.title }}
                        />
                        <div 
                          className="text-xs text-gray-600 truncate mt-1"
                          dangerouslySetInnerHTML={{ __html: result.highlights?.content || result.content }}
                        />
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${getResultColor(result)}-100 text-${getResultColor(result)}-800`}>
                            {result.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatResultDate(result.date)}
                          </span>
                          {result.size && (
                            <span className="text-xs text-gray-500">
                              {result.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* No Results */}
            {!isLoading && query.trim() && results.length === 0 && (
              <div className="text-center py-8">
                <Icon name="search" size="lg" className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-600">No results found for "{query}"</p>
                <p className="text-xs text-gray-500 mt-1">Try different keywords or check spelling</p>
              </div>
            )}

            {/* Recent Searches */}
            {!query.trim() && showRecent && recentSearches.length > 0 && (
              <div className="py-1">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Recent Searches</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => selectRecentSearch(recentQuery)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Icon name="clock" size="sm" className="text-gray-400" />
                    <span className="text-sm text-gray-700">{recentQuery}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!query.trim() && (!showRecent || recentSearches.length === 0) && (
              <div className="text-center py-8">
                <Icon name="search" size="lg" className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-600">Start typing to search</p>
                <p className="text-xs text-gray-500 mt-1">Search across messages, files, users, and more</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {(results.length > 0 || query.trim()) && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Use ↑↓ to navigate, Enter to select, Esc to close
                </div>
                {query.trim() && (
                  <Button
                    size="xs"
                    onClick={handleSearch}
                    className="text-xs"
                  >
                    View all results
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for highlighting */}
      <style jsx>{`
        mark {
          background-color: #fef08a;
          color: #92400e;
          padding: 0 2px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

GlobalSearch.propTypes = {
  onSearch: PropTypes.func,
  onResultSelect: PropTypes.func,
  placeholder: PropTypes.string,
  showCategories: PropTypes.bool,
  showRecent: PropTypes.bool,
  maxResults: PropTypes.number,
  debounceMs: PropTypes.number,
  className: PropTypes.string
};

export default GlobalSearch;