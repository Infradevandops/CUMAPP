import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Badge } from '../atoms';
import { DataTable, SearchBar, Modal } from '../molecules';
import BaseLayout from '../templates/BaseLayout';

const VerificationsPage = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('/api/verification');
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter(verification =>
    verification.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.phone_number?.includes(searchTerm)
  );

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { key: 'service_name', label: 'Service' },
    { key: 'phone_number', label: 'Phone Number' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'created_at', label: 'Created' },
    { key: 'expires_at', label: 'Expires' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">View Messages</Button>
          {row.status === 'pending' && (
            <Button size="sm" variant="error">Cancel</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <BaseLayout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h1">Verifications</Typography>
          <Button onClick={() => setShowCreateModal(true)}>
            New Verification
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="p-4">
            <Typography variant="h3">Total</Typography>
            <Typography variant="h2">{verifications.length}</Typography>
          </Card>
          <Card className="p-4">
            <Typography variant="h3">Completed</Typography>
            <Typography variant="h2" className="text-green-600">
              {verifications.filter(v => v.status === 'completed').length}
            </Typography>
          </Card>
          <Card className="p-4">
            <Typography variant="h3">Pending</Typography>
            <Typography variant="h2" className="text-yellow-600">
              {verifications.filter(v => v.status === 'pending').length}
            </Typography>
          </Card>
          <Card className="p-4">
            <Typography variant="h3">Failed</Typography>
            <Typography variant="h2" className="text-red-600">
              {verifications.filter(v => v.status === 'failed').length}
            </Typography>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h2">Recent Verifications</Typography>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search verifications..."
            />
          </div>
          
          <DataTable 
            data={filteredVerifications}
            columns={columns}
            loading={loading}
          />
        </Card>

        {showCreateModal && (
          <Modal
            title="Create New Verification"
            onClose={() => setShowCreateModal(false)}
          >
            <div className="p-4">
              <Typography>Verification creation form would go here</Typography>
            </div>
          </Modal>
        )}
      </div>
    </BaseLayout>
  );
};

export default VerificationsPage;