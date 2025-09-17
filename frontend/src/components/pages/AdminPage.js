import React, { useState, useEffect } from 'react';
import BaseLayout from '../templates/BaseLayout';
import { Typography, Button, Badge, Card } from '../atoms';
import { DataTable, Modal } from '../molecules';
import { DashboardWidget } from '../organisms/DashboardWidget';

const AdminPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalMessages: 45678,
        revenue: 12450.67,
        systemHealth: 98.5,
        apiCalls: 234567
      });
      
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          plan: 'Pro',
          joinDate: '2024-01-15',
          lastActive: '2024-01-20',
          messages: 1234,
          spent: 45.67
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          status: 'inactive',
          plan: 'Free',
          joinDate: '2024-01-10',
          lastActive: '2024-01-18',
          messages: 567,
          spent: 0
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          status: 'suspended',
          plan: 'Enterprise',
          joinDate: '2023-12-01',
          lastActive: '2024-01-19',
          messages: 5678,
          spent: 234.56
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const userColumns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { 
      key: 'status', 
      title: 'Status',
      render: (value) => (
        <Badge 
          variant={
            value === 'active' ? 'success' :
            value === 'inactive' ? 'warning' :
            'error'
          }
        >
          {value}
        </Badge>
      )
    },
    { 
      key: 'plan', 
      title: 'Plan',
      render: (value) => (
        <Badge variant={value === 'Enterprise' ? 'primary' : value === 'Pro' ? 'info' : 'default'}>
          {value}
        </Badge>
      )
    },
    { key: 'messages', title: 'Messages', sortable: true },
    { 
      key: 'spent', 
      title: 'Spent',
      render: (value) => `$${value.toFixed(2)}`,
      sortable: true 
    },
    { key: 'lastActive', title: 'Last Active', type: 'date', sortable: true }
  ];

  const handleUserAction = (action, userId) => {
    console.log(`${action} user:`, userId);
    // Implement user actions (suspend, activate, delete, etc.)
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'settings' },
    { id: 'messages', label: 'Messages', icon: 'chat' },
    { id: 'billing', label: 'Billing', icon: 'settings' },
    { id: 'system', label: 'System', icon: 'settings' }
  ];

  if (loading) {
    return (
      <BaseLayout user={user} currentPath="/admin">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout user={user} currentPath="/admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h1" className="text-gray-900">
              Admin Dashboard
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Manage users, monitor system health, and oversee platform operations
            </Typography>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <Button size="sm">
              System Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <DashboardWidget
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                change="+12%"
                changeType="positive"
                icon="settings"
                color="blue"
              />
              
              <DashboardWidget
                title="Active Users"
                value={stats.activeUsers.toLocaleString()}
                change="+8%"
                changeType="positive"
                icon="settings"
                color="green"
              />
              
              <DashboardWidget
                title="Total Messages"
                value={stats.totalMessages.toLocaleString()}
                change="+25%"
                changeType="positive"
                icon="chat"
                color="purple"
              />
              
              <DashboardWidget
                title="Revenue"
                value={`$${stats.revenue.toLocaleString()}`}
                change="+15%"
                changeType="positive"
                icon="settings"
                color="green"
              />
              
              <DashboardWidget
                title="System Health"
                value={`${stats.systemHealth}%`}
                change="+0.2%"
                changeType="positive"
                icon="check"
                color="green"
              />
              
              <DashboardWidget
                title="API Calls"
                value={stats.apiCalls.toLocaleString()}
                change="+18%"
                changeType="positive"
                icon="settings"
                color="blue"
              />
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <Card.Header>
                  <Typography variant="h5">System Status</Typography>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Server</span>
                      <Badge variant="success">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Database</span>
                      <Badge variant="success">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">SMS Gateway</span>
                      <Badge variant="success">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">WebSocket</span>
                      <Badge variant="warning">Degraded</Badge>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Header>
                  <Typography variant="h5">Recent Admin Actions</Typography>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">User suspended:</span> john@example.com
                      <div className="text-gray-500">2 minutes ago</div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">System backup:</span> Completed successfully
                      <div className="text-gray-500">1 hour ago</div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Rate limit updated:</span> API throttling
                      <div className="text-gray-500">3 hours ago</div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h4">User Management</Typography>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Export Users
                </Button>
                <Button size="sm">
                  Add User
                </Button>
              </div>
            </div>
            
            <DataTable
              data={users}
              columns={userColumns}
              searchable={true}
              sortable={true}
              selectable={true}
              onRowClick={handleUserClick}
              onSelectionChange={(selected) => console.log('Selected users:', selected)}
              emptyMessage="No users found"
            />
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <Typography variant="h4" className="mb-6">Message Analytics</Typography>
            <Card>
              <Card.Content>
                <Typography variant="body1" className="text-gray-600">
                  Message analytics and monitoring tools will be displayed here.
                </Typography>
              </Card.Content>
            </Card>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <Typography variant="h4" className="mb-6">Billing & Revenue</Typography>
            <Card>
              <Card.Content>
                <Typography variant="body1" className="text-gray-600">
                  Billing analytics and revenue tracking will be displayed here.
                </Typography>
              </Card.Content>
            </Card>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <Typography variant="h4" className="mb-6">System Configuration</Typography>
            <Card>
              <Card.Content>
                <Typography variant="body1" className="text-gray-600">
                  System settings and configuration options will be displayed here.
                </Typography>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="body2" className="text-gray-600">Name</Typography>
                <Typography variant="body1">{selectedUser.name}</Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-600">Email</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-600">Status</Typography>
                <Badge variant={selectedUser.status === 'active' ? 'success' : 'error'}>
                  {selectedUser.status}
                </Badge>
              </div>
              <div>
                <Typography variant="body2" className="text-gray-600">Plan</Typography>
                <Typography variant="body1">{selectedUser.plan}</Typography>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleUserAction('suspend', selectedUser.id)}
              >
                Suspend User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleUserAction('reset', selectedUser.id)}
              >
                Reset Password
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleUserAction('delete', selectedUser.id)}
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </BaseLayout>
  );
};

export default AdminPage;