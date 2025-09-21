import React, { useState } from 'react';
import SearchBar from '../components/molecules/SearchBar';
import { Button } from '../components/atoms';

export default {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible search bar component with optional search button and customizable placeholder text.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input'
    },
    onSearch: {
      action: 'searched',
      description: 'Callback function called when search is performed'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    },
    showButton: {
      control: 'boolean',
      description: 'Show search button'
    }
  },
};

const Template = (args) => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    args.onSearch(query);
    // Simulate search results
    if (query.trim()) {
      setSearchResults([
        { id: 1, title: `Result for "${query}" 1` },
        { id: 2, title: `Result for "${query}" 2` },
        { id: 3, title: `Result for "${query}" 3` }
      ]);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar {...args} onSearch={handleSearch} />
      {searchResults.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Search Results:</h3>
          <ul className="space-y-1">
            {searchResults.map((result) => (
              <li key={result.id} className="text-sm text-gray-600">
                {result.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Search...',
  showButton: true
};

export const WithoutButton = Template.bind({});
WithoutButton.args = {
  placeholder: 'Search without button...',
  showButton: false
};

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholder: 'Search for users, posts, or tags...',
  showButton: true
};

export const UserSearch = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    console.log('Searching for users:', query);
    // Simulate user search
    if (query.trim()) {
      setSearchResults([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
      ].filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Search users by name or email..."
        onSearch={handleSearch}
        showButton={true}
      />
      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((user) => (
              <div key={user.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProductSearch = () => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    console.log('Searching for products:', query);
    // Simulate product search
    if (query.trim()) {
      setSearchResults([
        { id: 1, name: 'Wireless Headphones', price: '$99.99', category: 'Electronics' },
        { id: 2, name: 'Smart Watch', price: '$299.99', category: 'Electronics' },
        { id: 3, name: 'Coffee Maker', price: '$79.99', category: 'Kitchen' },
        { id: 4, name: 'Bluetooth Speaker', price: '$49.99', category: 'Electronics' }
      ].filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Search products..."
        onSearch={handleSearch}
        showButton={true}
      />
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <p className="text-lg font-semibold text-blue-600">{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CompactSearch = Template.bind({});
CompactSearch.args = {
  placeholder: 'Quick search...',
  showButton: false,
  className: 'max-w-md'
};

export const FullWidthSearch = Template.bind({});
FullWidthSearch.args = {
  placeholder: 'Search across all content...',
  showButton: true,
  className: 'w-full'
};

export const SearchWithFilters = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (query) => {
    console.log('Searching with filters:', { query, category: selectedCategory });
    // Simulate filtered search
    if (query.trim()) {
      const mockData = [
        { id: 1, title: 'React Tutorial', category: 'programming', type: 'article' },
        { id: 2, title: 'JavaScript Guide', category: 'programming', type: 'guide' },
        { id: 3, title: 'Design Patterns', category: 'design', type: 'book' },
        { id: 4, title: 'UI Components', category: 'design', type: 'article' },
        { id: 5, title: 'Database Design', category: 'database', type: 'course' }
      ];

      let filtered = mockData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }

      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'database', label: 'Database' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search content..."
            onSearch={handleSearch}
            showButton={true}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SearchWithSuggestions = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    'React components',
    'JavaScript tutorials',
    'CSS styling',
    'API integration',
    'Database queries',
    'User authentication'
  ];

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <SearchBar
        placeholder="Search with suggestions..."
        onSearch={(searchQuery) => console.log('Search:', searchQuery)}
        showButton={true}
      />

      {/* Custom input override for suggestions */}
      <div className="relative">
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search with suggestions..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
          <div className="py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};