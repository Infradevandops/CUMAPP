import React, { useState, useEffect } from 'react';
import BaseLayout from '../templates/BaseLayout';
import { LoadingSpinner, Typography } from '../atoms';
import { DashboardWidget, ActivityWidget, QuickActionsWidget } from '../organisms/DashboardWidget';
import { DataTable } from '../molecules';

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalMessages: 1234,
        activeNumbers: 5,
        monthlyUsage: 89.5,
        unreadMessages: 12,
        successRate: 98.2,
        totalCost: 45.67
      });
      setLoading(false);
    }, 1000);
  }, []);
  
  const recentActivities = [
    {
      message: 'New message received from +1234567890',
      timestamp: '2 minutes ago',
      type: 'success',
      badge: { text: 'SMS', variant: 'info' }
    },
    {
      message: 'Phone number +1987654321 purchased',
      timestamp: '15 minutes ago',
      type: 'success',
      badge: { text: 'Purchase', variant: 'success' }
    },
    {
      message: 'Verification failed for WhatsApp',
      timestamp: '1 hour ago',
      type: 'error',
      badge: { text: 'Failed', variant: 'error' }
    },
    {
      message: 'Monthly usage limit warning',
      timestamp: '2 hours ago',
      type: 'warning',
      badge: { text: 'Warning', variant: 'warning' }
    }
  ];
  
  const quickActions = [
    {
      title: 'Send SMS',
      description: 'Send a new message',
      icon: 'chat',
      color: 'bg-blue-100 text-blue-600',
      onClick: () => console.log('Send SMS')
    },
    {
      title: 'Buy Number',
      description: 'Purchase phone number',
      icon: 'phone',
      color: 'bg-green-100 text-green-600',
      onClick: () => console.log('Buy Number')
    },
    {
      title: 'View Analytics',
      description: 'Check usage stats',
      icon: 'dashboard',
      color: 'bg-purple-100 text-purple-600',
      onClick: () => console.log('View Analytics')
    },
    {
      title: 'Settings',
      description: 'Manage account',
      icon: 'settings',
      color: 'bg-gray-100 text-gray-600',
      onClick: () => console.log('Settings')
    }
  ];
  
  const recentMessages = [
    {
      id: 1,
      from: '+1234567890',
      message: 'Hello, this is a test message',
      timestamp: '2024-01-15 10:30',
      status: 'delivered',
      type: 'received'
    },
    {
      id: 2,
      from: '+1987654321',
      message: 'Your verification code is 123456',
      timestamp: '2024-01-15 09:15',
      status: 'read',
      type: 'sent'
    }
  ];
  
  const messageColumns = [
    { key: 'from', title: 'From/To', sortable: true },
    { key: 'message', title: 'Message', sortable: false },
    { key: 'timestamp', title: 'Time', type: 'date', sortable: true },
    { 
      key: 'status', 
      title: 'Status', 
      type: 'badge',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'delivered' ? 'bg-green-100 text-green-800' :
          value === 'read' ? 'bg-blue-100 text-blue-800' :
          value === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    }
  ];
  
  const handleSearch = (query) => {
    setNotification({
      message: `Searching for: ${query}`,
      type: 'info',
      show: true
    });
  };
  
  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };
  
  if (loading) {
    return (
      <BaseLayout user={user} currentPath="/dashboard">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </BaseLayout>
    );
  }
  
  return (
    <BaseLayout 
      user={user} 
      currentPath="/dashboard"
      notification={notification}
      onNotificationClose={() => setNotification(null)}
      onSearch={handleSearch}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h1" className="text-gray-900">
              Dashboard
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your account.
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="caption" className="text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <DashboardWidget
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            change="+12%"
            changeType="positive"
            icon="chat"
            color="blue"
            loading={loading}
          />
          
          <DashboardWidget
            title="Active Numbers"
            value={stats.activeNumbers}
            change="+2"
            changeType="positive"
            icon="phone"
            color="green"
            loading={loading}
          />
          
          <DashboardWidget
            title="Monthly Usage"
            value={`${stats.monthlyUsage}%`}
            change="+5.2%"
            changeType="positive"
            icon="dashboard"
            color="purple"
            loading={loading}
          />
          
          <DashboardWidget
            title="Unread Messages"
            value={stats.unreadMessages}
            change="-3"
            changeType="negative"
            icon="mail"
            color="red"
            loading={loading}
          />
          
          <DashboardWidget
            title="Success Rate"
            value={`${stats.successRate}%`}
            change="+0.8%"
            changeType="positive"
            icon="check"
            color="green"
            loading={loading}
          />
          
          <DashboardWidget
            title="Total Cost"
            value={`$${stats.totalCost}`}
            change="+$12.34"
            changeType="neutral"
            icon="settings"
            color="gray"
            loading={loading}
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <ActivityWidget 
              activities={recentActivities}
              loading={loading}
            />
          </div>
          
          {/* Quick Actions */}
          <div>
            <QuickActionsWidget actions={quickActions} />
          </div>
        </div>
        
        {/* Recent Messages Table */}
        <div>
          <Typography variant="h4" className="text-gray-900 mb-4">
            Recent Messages
          </Typography>
          <DataTable
            data={recentMessages}
            columns={messageColumns}
            searchable={true}
            sortable={true}
            pagination={false}
            onRowClick={(row) => console.log('Message clicked:', row)}
            emptyMessage="No messages found"
          />
        </div>
      </div>
    </BaseLayout>
  );
};

export default DashboardPage;