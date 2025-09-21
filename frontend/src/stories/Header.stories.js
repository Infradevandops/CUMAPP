import React, { useState } from 'react';
import Header from '../components/organisms/Header';
import Button from '../components/atoms/Button';

export default {
  title: 'Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive header component with navigation, search, user profile, and mobile responsiveness.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'object',
      description: 'User object with name and email'
    },
    onLogout: {
      action: 'logout',
      description: 'Logout callback function'
    },
    onSearch: {
      action: 'search',
      description: 'Search callback function'
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
        { id: 2, title: `Result for "${query}" 2` }
      ]);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header {...args} onSearch={handleSearch} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Main Content Area</h2>
              <p className="text-gray-600">This is where your page content would go</p>
              {searchResults.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com'
  }
};

export const WithoutUser = Template.bind({});
WithoutUser.args = {
  user: null
};

export const LongUserName = Template.bind({});
LongUserName.args = {
  user: {
    name: 'Dr. Emily Sarah Johnson-Smith',
    email: 'emily.johnson-smith@university.edu'
  }
};

export const DifferentUser = Template.bind({});
DifferentUser.args = {
  user: {
    name: 'Alice Cooper',
    email: 'alice.cooper@company.com'
  }
};

export const AdminUser = Template.bind({});
AdminUser.args = {
  user: {
    name: 'Admin User',
    email: 'admin@platform.com'
  }
};

export const GuestUser = Template.bind({});
GuestUser.args = {
  user: {
    name: 'Guest User',
    email: 'guest@example.com'
  }
};

export const CustomCallbacks = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [logoutCount, setLogoutCount] = useState(0);

  const handleSearch = (query) => {
    console.log('Search performed:', query);
    setSearchHistory(prev => [...prev, query]);
  };

  const handleLogout = () => {
    console.log('User logged out');
    setLogoutCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={{
          name: 'Test User',
          email: 'test@example.com'
        }}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Callback Testing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Search History:</h3>
                <ul className="mt-2 space-y-1">
                  {searchHistory.map((query, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {query}
                    </li>
                  ))}
                  {searchHistory.length === 0 && (
                    <li className="text-sm text-gray-500">No searches yet</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Logout Count:</h3>
                <p className="mt-2 text-sm text-gray-600">{logoutCount} logout(s)</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Use the search bar and logout button above to test the callbacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const MobileView = () => {
  const [isMobile, setIsMobile] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={isMobile ? 'primary' : 'outline'}
          onClick={() => setIsMobile(true)}
        >
          Mobile View
        </Button>
        <Button
          variant={!isMobile ? 'primary' : 'outline'}
          onClick={() => setIsMobile(false)}
        >
          Desktop View
        </Button>
      </div>

      <div className={isMobile ? 'max-w-sm mx-auto' : 'max-w-7xl mx-auto'}>
        <div className={`bg-gray-50 ${isMobile ? 'overflow-hidden rounded-lg' : 'min-h-screen'}`}>
          <Header
            user={{
              name: 'Mobile User',
              email: 'mobile@example.com'
            }}
            onSearch={(query) => console.log('Mobile search:', query)}
            onLogout={() => console.log('Mobile logout')}
          />
          {isMobile && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">
                Mobile menu is collapsed by default. Click the hamburger menu to expand.
              </p>
            </div>
          )}
          {!isMobile && (
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Desktop Content</h2>
                    <p className="text-gray-600">Full desktop layout with expanded navigation</p>
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
};

export const NavigationStates = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pages = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { key: 'chat', label: 'Chat', path: '/chat' },
    { key: 'numbers', label: 'Numbers', path: '/numbers' },
    { key: 'billing', label: 'Billing', path: '/billing' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <Button
            key={page.key}
            variant={currentPage === page.key ? 'primary' : 'outline'}
            onClick={() => setCurrentPage(page.key)}
          >
            {page.label}
          </Button>
        ))}
      </div>

      <div className="min-h-screen bg-gray-50">
        <Header
          user={{
            name: 'Navigation Test',
            email: 'nav@example.com'
          }}
          onSearch={(query) => console.log('Search from', currentPage, ':', query)}
          onLogout={() => console.log('Logout from', currentPage)}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Current Page: {pages.find(p => p.key === currentPage)?.label}
              </h2>
              <p className="text-gray-600">
                The header navigation reflects the current page state. Click different page buttons above to see the active state change.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const ProfileMenuStates = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
        Toggle Profile Menu
      </Button>

      <div className="min-h-screen bg-gray-50">
        <Header
          user={{
            name: 'Profile Test',
            email: 'profile@example.com'
          }}
          onSearch={(query) => console.log('Search:', query)}
          onLogout={() => console.log('Logout')}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Menu Testing</h2>
              <p className="text-gray-600">
                The profile menu dropdown shows user information and navigation options.
                Click the avatar in the header to toggle the profile menu.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const SearchIntegration = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Searching for:', query);

    // Simulate search results
    if (query.trim()) {
      const mockResults = [
        { id: 1, title: 'Dashboard Overview', type: 'page', url: '/dashboard' },
        { id: 2, title: 'Chat Messages', type: 'feature', url: '/chat' },
        { id: 3, title: 'Phone Numbers', type: 'section', url: '/numbers' },
        { id: 4, title: 'Billing History', type: 'page', url: '/billing' },
        { id: 5, title: 'User Profile Settings', type: 'page', url: '/profile' }
      ].filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.type.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={{
          name: 'Search Integration',
          email: 'search@example.com'
        }}
        onSearch={handleSearch}
        onLogout={() => console.log('Logout')}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Search Integration</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Query: <span className="font-mono">{searchQuery || 'none'}</span></p>
                <p className="text-sm text-gray-600">Results: {searchResults.length} found</p>
              </div>

              {searchResults.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Search Results:</h3>
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{result.title}</h4>
                          <p className="text-sm text-gray-600">Type: {result.type}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {result.url}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Use the search bar in the header to test search functionality.
                  Try searching for "dashboard", "chat", "profile", etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
