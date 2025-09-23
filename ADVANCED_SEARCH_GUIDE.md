# Advanced Search and Filtering Implementation Guide

## Overview

This guide covers the implementation of advanced search and filtering capabilities in the React application. The system provides comprehensive search functionality with multiple filter types, sorting options, and result display modes.

## Components

### 1. AdvancedSearchBar Component

**Location**: `frontend/src/components/molecules/AdvancedSearchBar.js`

**Features**:
- Real-time search with debouncing
- Advanced search panel with multiple filter types
- Search history and suggestions
- Saved searches functionality
- Export search configurations
- Multiple filter types (text, date, file type, author, size)

**Props**:
```javascript
{
  placeholder: string,
  onSearch: function,
  onFilterChange: function,
  filters: array,
  sortOptions: array,
  showFilters: boolean,
  showSort: boolean,
  showAdvanced: boolean,
  initialQuery: string,
  initialFilters: object,
  initialSort: string
}
```

**Usage Example**:
```javascript
import { AdvancedSearchBar } from '../molecules';

const filters = [
  {
    key: 'type',
    label: 'Content Type',
    multiple: true,
    options: [
      { value: 'file', label: 'Files', count: 15 },
      { value: 'folder', label: 'Folders', count: 8 }
    ]
  }
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date-desc', label: 'Newest First' }
];

<AdvancedSearchBar
  placeholder="Search for documents..."
  onSearch={handleSearch}
  filters={filters}
  sortOptions={sortOptions}
  showAdvanced={true}
/>
```

### 2. SearchResults Component

**Location**: `frontend/src/components/molecules/SearchResults.js`

**Features**:
- Multiple view modes (list, grid, table)
- Result grouping options
- Pagination support
- Bulk selection and actions
- Search term highlighting
- Responsive design

**Props**:
```javascript
{
  results: array,
  loading: boolean,
  error: string,
  searchQuery: string,
  totalCount: number,
  currentPage: number,
  pageSize: number,
  onPageChange: function,
  onResultClick: function,
  onResultSelect: function,
  selectedResults: array,
  showSelection: boolean,
  showPreview: boolean,
  highlightTerms: array
}
```

### 3. SearchPage Component

**Location**: `frontend/src/components/pages/SearchPage.js`

**Features**:
- Complete search interface
- Integration of search bar and results
- Bulk actions (download, delete)
- Search tips and help
- Mock data for demonstration

## Advanced Search Features

### 1. Query Building

The system supports advanced query building:

```javascript
// Basic search
"react components"

// Exact phrase
"advanced search"

// Exclude words
javascript -framework

// Combined
"react components" -old -deprecated
```

### 2. Filter Types

#### Text Filters
- **Exact Phrase**: Search for exact text matches
- **Exclude Words**: Exclude specific terms from results
- **Author**: Filter by content author

#### Date Filters
- **Date Range**: Filter by creation/modification date
- **Quick Presets**: Last 24 hours, week, month

#### File Filters
- **File Type**: Filter by file extension or type
- **File Size**: Filter by minimum/maximum file size

### 3. Sorting Options

- **Relevance**: Default search relevance scoring
- **Date**: Newest/oldest first
- **Name**: Alphabetical sorting
- **Size**: Largest/smallest first

### 4. View Modes

#### List View
- Detailed result information
- Preview thumbnails
- Metadata display

#### Grid View
- Compact card layout
- Visual file type indicators
- Quick selection

#### Table View
- Spreadsheet-like layout
- Sortable columns
- Bulk selection

### 5. Saved Searches

Users can save frequently used searches:

```javascript
const savedSearch = {
  id: Date.now(),
  name: "React Documentation",
  query: "react components",
  filters: { type: ['file'], fileType: ['pdf', 'md'] },
  sort: "date-desc",
  advanced: { author: "tech team" }
};
```

### 6. Search History

Automatic search history with suggestions:
- Stores last 10 searches
- Provides autocomplete suggestions
- Persists in localStorage

## Implementation Details

### 1. Search Data Structure

The search function receives a comprehensive search object:

```javascript
const searchData = {
  query: "built search query",
  originalQuery: "user input",
  filters: {
    type: ['file', 'folder'],
    author: 'john-doe'
  },
  sort: 'date-desc',
  advanced: {
    exactPhrase: 'advanced search',
    excludeWords: 'old deprecated',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    fileType: 'pdf',
    author: 'tech team',
    minSize: '1024',
    maxSize: '10485760'
  }
};
```

### 2. Result Data Structure

Search results follow a standardized format:

```javascript
const result = {
  id: 1,
  title: "Document Title",
  description: "Document description",
  type: "file", // file, folder, image, etc.
  fileType: "pdf",
  size: 2048576, // bytes
  path: "/documents/guides",
  author: "John Doe",
  createdAt: "2024-01-15T10:30:00Z",
  preview: {
    type: "image", // image, document
    url: "/preview/1.jpg"
  }
};
```

### 3. Filter Configuration

Filters are configured as arrays of filter objects:

```javascript
const filterConfig = [
  {
    key: 'type',
    label: 'Content Type',
    multiple: true, // Allow multiple selections
    options: [
      { value: 'file', label: 'Files', count: 15 },
      { value: 'folder', label: 'Folders', count: 8 }
    ]
  }
];
```

## Integration Guide

### 1. Backend Integration

To integrate with a backend API:

```javascript
const performSearch = async (searchData) => {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    });
    
    const results = await response.json();
    return results;
  } catch (error) {
    throw new Error('Search failed');
  }
};
```

### 2. State Management

For complex applications, consider using Redux or Context:

```javascript
// Search Context
const SearchContext = createContext();

const SearchProvider = ({ children }) => {
  const [searchState, setSearchState] = useState({
    query: '',
    filters: {},
    results: [],
    loading: false
  });
  
  return (
    <SearchContext.Provider value={{ searchState, setSearchState }}>
      {children}
    </SearchContext.Provider>
  );
};
```

### 3. URL State Synchronization

Sync search state with URL for bookmarkable searches:

```javascript
import { useSearchParams } from 'react-router-dom';

const useSearchURL = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const updateURL = (searchData) => {
    const params = new URLSearchParams();
    if (searchData.query) params.set('q', searchData.query);
    if (searchData.filters) params.set('filters', JSON.stringify(searchData.filters));
    setSearchParams(params);
  };
  
  return { searchParams, updateURL };
};
```

## Performance Optimization

### 1. Debouncing

Search input is debounced to prevent excessive API calls:

```javascript
const [debouncedQuery] = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

### 2. Result Caching

Implement result caching for better performance:

```javascript
const searchCache = new Map();

const cachedSearch = async (searchData) => {
  const cacheKey = JSON.stringify(searchData);
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }
  
  const results = await performSearch(searchData);
  searchCache.set(cacheKey, results);
  
  return results;
};
```

### 3. Virtual Scrolling

For large result sets, implement virtual scrolling:

```javascript
import { FixedSizeList as List } from 'react-window';

const VirtualizedResults = ({ results }) => (
  <List
    height={600}
    itemCount={results.length}
    itemSize={100}
    itemData={results}
  >
    {ResultItem}
  </List>
);
```

## Testing

### 1. Component Testing

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedSearchBar } from '../AdvancedSearchBar';

test('performs search on input', async () => {
  const mockSearch = jest.fn();
  
  render(
    <AdvancedSearchBar onSearch={mockSearch} />
  );
  
  const input = screen.getByPlaceholderText(/search/i);
  fireEvent.change(input, { target: { value: 'test query' } });
  
  await waitFor(() => {
    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'test query'
      })
    );
  });
});
```

### 2. Integration Testing

Use the provided test script:

```bash
python test_advanced_search.py
```

## Accessibility

### 1. Keyboard Navigation

- All interactive elements are keyboard accessible
- Proper tab order and focus management
- ARIA labels and descriptions

### 2. Screen Reader Support

```javascript
<input
  type="text"
  aria-label="Search input"
  aria-describedby="search-help"
  role="searchbox"
/>

<div id="search-help" className="sr-only">
  Enter search terms to find documents and files
</div>
```

### 3. Color Contrast

- All text meets WCAG AA contrast requirements
- Focus indicators are clearly visible
- Color is not the only way to convey information

## Future Enhancements

### 1. AI-Powered Search

- Natural language query processing
- Semantic search capabilities
- Auto-suggestion improvements

### 2. Analytics

- Search query analytics
- Result click tracking
- Performance monitoring

### 3. Advanced Operators

- Boolean operators (AND, OR, NOT)
- Wildcard and regex support
- Field-specific searches

### 4. Collaborative Features

- Shared saved searches
- Team search spaces
- Search result annotations

## Troubleshooting

### Common Issues

1. **Search not working**: Check API endpoint and network connectivity
2. **Filters not applying**: Verify filter configuration format
3. **Performance issues**: Implement debouncing and caching
4. **UI not responsive**: Check CSS breakpoints and flexbox usage

### Debug Mode

Enable debug logging:

```javascript
const DEBUG_SEARCH = process.env.NODE_ENV === 'development';

if (DEBUG_SEARCH) {
  console.log('Search data:', searchData);
  console.log('Results:', results);
}
```

## Conclusion

The Advanced Search and Filtering system provides a comprehensive solution for content discovery with:

- ✅ Powerful search capabilities
- ✅ Flexible filtering options
- ✅ Multiple display modes
- ✅ Performance optimization
- ✅ Accessibility compliance
- ✅ Extensible architecture

This implementation serves as a solid foundation for advanced search functionality that can be extended and customized based on specific application needs.