import React, { useState, useEffect } from 'react';
import { Card, Button, Typography } from '../atoms';
import { DataTable, Modal } from '../molecules';
import BaseLayout from '../templates/BaseLayout';

const BillingPage = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/payments/history');
      const data = await response.json();
      setBillingData(data);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <BaseLayout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h1">Billing & Payments</Typography>
          <Button onClick={() => setShowPaymentModal(true)}>
            Add Payment Method
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-6">
            <Typography variant="h3">Current Balance</Typography>
            <Typography variant="h2" className="text-green-600">$25.50</Typography>
          </Card>
          <Card className="p-6">
            <Typography variant="h3">This Month</Typography>
            <Typography variant="h2">$142.30</Typography>
          </Card>
          <Card className="p-6">
            <Typography variant="h3">Next Bill</Typography>
            <Typography variant="h2">Dec 15, 2024</Typography>
          </Card>
        </div>

        <Card className="p-6">
          <Typography variant="h2" className="mb-4">Payment History</Typography>
          <DataTable 
            data={billingData}
            columns={columns}
            loading={loading}
          />
        </Card>

        {showPaymentModal && (
          <Modal
            title="Add Payment Method"
            onClose={() => setShowPaymentModal(false)}
          >
            <div className="p-4">
              <Typography>Payment method form would go here</Typography>
            </div>
          </Modal>
        )}
      </div>
    </BaseLayout>
  );
};

export default BillingPage;