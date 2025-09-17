import React, { useState } from 'react';
import Header from '../organisms/Header';
import Sidebar from '../organisms/Sidebar';
import NotificationToast from '../molecules/NotificationToast';

const BaseLayout = ({ 
  children, 
  user, 
  currentPath = '/', 
  showSidebar = true,
  notification = null,
  onNotificationClose,
  onSearch,
  onLogout 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        user={user}
        onLogout={onLogout}
        onSearch={onSearch}
      />
      
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div 
                  className="fixed inset-0 bg-gray-600 bg-opacity-75"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                  <Sidebar currentPath={currentPath} />
                </div>
              </div>
            )}
            
            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
              <Sidebar currentPath={currentPath} />
            </div>
          </>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={onNotificationClose}
        />
      )}
    </div>
  );
};

export default BaseLayout;