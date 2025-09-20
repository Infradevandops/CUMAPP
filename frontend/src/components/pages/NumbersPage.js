import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Badge } from '../atoms';
import { DataTable, SearchBar } from '../molecules';
import BaseLayout from '../templates/BaseLayout';

const NumbersPage = () => {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNumbers();
  }, []);

  const fetchNumbers = async () => {
    try {
      const response = await fetch('/api/numbers');
      const data = await response.json();
      setNumbers(data);
    } catch (error) {
      console.error('Failed to fetch numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNumbers = numbers.filter(number =>
    number.phone_number?.includes(searchTerm) ||
    number.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'phone_number', label: 'Phone Number' },
    { key: 'country', label: 'Country' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'warning'}>
          {value}
        </Badge>
      )
    },
    { key: 'created_at', label: 'Created' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Release</Button>
          <Button size="sm">Extend</Button>
        </div>
      )
    }
  ];

  return (
    <BaseLayout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h1">Phone Numbers</Typography>
          <Button>Get New Number</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="p-4">
            <Typography variant="h3">Total Numbers</Typography>
            <Typography variant="h2">{numbers.length}</Typography>
          </Card>
          <Card className="p-4">
            <Typography variant="h3">Active</Typography>
            <Typography variant="h2" className="text-green-600">
              {numbers.filter(n => n.status === 'active').length}
            </Typography>
          </Card>
          <Card className="p-4">
            <Typography variant="h3">Pending</Typography>
            <Typography variant="h2" className="text-yellow-600">
              {numbers.filter(n => n.status === 'pending').length}
            </Typography>
          </Card>
          <Card className="p-4">
            <Typography variant="h3">Expired</Typography>
            <Typography variant="h2" className="text-red-600">
              {numbers.filter(n => n.status === 'expired').length}
            </Typography>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h2">Your Numbers</Typography>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search numbers..."
            />
          </div>
          
          <DataTable 
            data={filteredNumbers}
            columns={columns}
            loading={loading}
          />
        </Card>
      </div>
    </BaseLayout>
  );
};

export default NumbersPage;