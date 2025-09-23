import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const SearchResults = ({
  results = [],
  loading = false,
  error = null,
  searchQuery = '',
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onResultClick,
  onResultSelect,
  selectedResults = [],
  showSelection = false,
  showPreview = true,
  highlightTerms = [],
  className = '',
  ...props
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'table'
  const [sortBy, setSortBy] = useState('relevance');
  const [groupBy, setGroupBy] = useState('none');

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Group results if needed
  const groupedResults = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Results': results };
    }

    return results.reduce((groups, result) => {
      let groupKey = 'Other';
      
      switch (groupBy) {
        case 'type':
          groupKey = result.type || result.fileType || 'Unknown';
          break;
        case 'date':
          const date = new Date(result.createdAt || result.date);
          const today = new Date();
          const diffTime = Math.abs(today - date);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) groupKey = 'Today';
          else if (diffDays <= 7) groupKey = 'This Week';
          else if (diffDays <= 30) groupKey = 'This Month';
          else groupKey = 'Older';
          break;
        case 'author':
          groupKey = result.author || 'Unknown Author';
          break;
        case 'size':
          const size = result.size || 0;
          if (size < 1024) groupKey = 'Small (< 1KB)';
          else if (size < 1024 * 1024) groupKey = 'Medium (< 1MB)';
          else groupKey = 'Large (> 1MB)';
          break;
        default:
          groupKey = 'All Results';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(result);
      return groups;
    }, {});
  }, [results, groupBy]);

  const highlightText = (text, terms) => {
    if (!terms.length || !text) return text;
    
    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const handleSelectAll = () => {
    const allIds = results.map(r => r.id);
    const allSelected = allIds.every(id => selectedResults.includes(id));
    
    if (allSelected) {
      onResultSelect?.(selectedResults.filter(id => !allIds.includes(id)));
    } else {
      onResultSelect?.([...new Set([...selectedResults, ...allIds])]);
    }
  };

  const handleSelectResult = (resultId) => {
    if (selectedResults.includes(resultId)) {
      onResultSelect?.(selectedResults.filter(id => id !== resultId));
    } else {
      onResultSelect?.([...selectedResults, resultId]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Searching...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <Icon name="alertCircle" size="sm" className="text-red-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Search Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Icon name="search" size="lg" className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">
          {searchQuery ? `No results found for "${searchQuery}"` : 'Try adjusting your search terms or filters'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Showing {startIndex}-{endIndex} of {totalCount} results
            {searchQuery && (
              <span className="ml-1">
                for <span className="font-medium">"{searchQuery}"</span>
              </span>
            )}
          </p>
          
          {showSelection && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={results.length > 0 && results.every(r => selectedResults.includes(r.id))}
                onChange={handleSelectAll}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Select all ({selectedResults.length} selected)
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Group By */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="none">No grouping</option>
            <option value="type">Group by type</option>
            <option value="date">Group by date</option>
            <option value="author">Group by author</option>
            <option value="size">Group by size</option>
          </select>
          
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="relevance">Sort by relevance</option>
            <option value="date">Sort by date</option>
            <option value="name">Sort by name</option>
            <option value="size">Sort by size</option>
          </select>
          
          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Icon name="list" size="sm" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 text-sm border-l border-gray-300 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Icon name="grid" size="sm" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 text-sm border-l border-gray-300 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <Icon name="table" size="sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-6">
        {Object.entries(groupedResults).map(([groupName, groupResults]) => (
          <div key={groupName}>
            {groupBy !== 'none' && (
              <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                {groupName} ({groupResults.length})
              </h3>
            )}
            
            {viewMode === 'list' && (
              <div className="space-y-3">
                {groupResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onResultClick?.(result)}
                  >
                    <div className="flex items-start space-x-3">
                      {showSelection && (
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectResult(result.id);
                          }}
                          className="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                      
                      <div className="flex-shrink-0">
                        <Icon 
                          name={result.type === 'file' ? 'document' : result.type === 'folder' ? 'folder' : 'search'} 
                          size="md" 
                          className="text-gray-400" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {highlightText(result.title || result.name, highlightTerms)}
                        </h4>
                        
                        {result.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {highlightText(result.description, highlightTerms)}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {result.path && (
                            <span className="flex items-center">
                              <Icon name="folder" size="xs" className="mr-1" />
                              {result.path}
                            </span>
                          )}
                          
                          {result.size && (
                            <span className="flex items-center">
                              <Icon name="file" size="xs" className="mr-1" />
                              {formatFileSize(result.size)}
                            </span>
                          )}
                          
                          {result.createdAt && (
                            <span className="flex items-center">
                              <Icon name="calendar" size="xs" className="mr-1" />
                              {formatDate(result.createdAt)}
                            </span>
                          )}
                          
                          {result.author && (
                            <span className="flex items-center">
                              <Icon name="user" size="xs" className="mr-1" />
                              {result.author}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {showPreview && result.preview && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border overflow-hidden">
                          {result.preview.type === 'image' ? (
                            <img 
                              src={result.preview.url} 
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="document" size="md" className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onResultClick?.(result)}
                  >
                    {showSelection && (
                      <div className="flex justify-end mb-2">
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectResult(result.id);
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon 
                          name={result.type === 'file' ? 'document' : result.type === 'folder' ? 'folder' : 'search'} 
                          size="lg" 
                          className="text-gray-400" 
                        />
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {highlightText(result.title || result.name, highlightTerms)}
                      </h4>
                      
                      {result.size && (
                        <p className="text-xs text-gray-500">
                          {formatFileSize(result.size)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {viewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {showSelection && (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={groupResults.length > 0 && groupResults.every(r => selectedResults.includes(r.id))}
                            onChange={handleSelectAll}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupResults.map((result) => (
                      <tr 
                        key={result.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onResultClick?.(result)}
                      >
                        {showSelection && (
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(result.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectResult(result.id);
                              }}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <Icon 
                              name={result.type === 'file' ? 'document' : result.type === 'folder' ? 'folder' : 'search'} 
                              size="sm" 
                              className="text-gray-400 mr-2" 
                            />
                            <span className="text-sm text-blue-600 hover:text-blue-800">
                              {highlightText(result.title || result.name, highlightTerms)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.fileType || result.type || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.size ? formatFileSize(result.size) : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.createdAt ? formatDate(result.createdAt) : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.author || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon name="chevronLeft" size="sm" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant={currentPage === totalPages ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onPageChange?.(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <Icon name="chevronRight" size="sm" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

SearchResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    fileType: PropTypes.string,
    size: PropTypes.number,
    path: PropTypes.string,
    author: PropTypes.string,
    createdAt: PropTypes.string,
    preview: PropTypes.shape({
      type: PropTypes.string,
      url: PropTypes.string
    })
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  searchQuery: PropTypes.string,
  totalCount: PropTypes.number,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onResultClick: PropTypes.func,
  onResultSelect: PropTypes.func,
  selectedResults: PropTypes.array,
  showSelection: PropTypes.bool,
  showPreview: PropTypes.bool,
  highlightTerms: PropTypes.array,
  className: PropTypes.string
};

export default SearchResults;