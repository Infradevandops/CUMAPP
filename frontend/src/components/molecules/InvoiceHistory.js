import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const InvoiceHistory = ({
  invoices = [],
  onDownloadInvoice,
  onViewInvoice,
  onPayInvoice,
  className = '',
  ...props
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }

    // Filter by year
    if (filterYear !== 'all') {
      filtered = filtered.filter(invoice => 
        new Date(invoice.date).getFullYear().toString() === filterYear
      );
    }

    // Sort invoices
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [invoices, filterStatus, filterYear, sortBy]);

  // Get unique years from invoices
  const availableYears = useMemo(() => {
    const years = [...new Set(invoices.map(invoice => 
      new Date(invoice.date).getFullYear()
    ))];
    return years.sort((a, b) => b - a);
  }, [invoices]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return 'check';
      case 'pending':
        return 'clock';
      case 'overdue':
        return 'alertCircle';
      case 'draft':
        return 'edit';
      default:
        return 'file';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotals = () => {
    const totals = filteredInvoices.reduce((acc, invoice) => {
      acc.total += invoice.amount;
      acc[invoice.status] = (acc[invoice.status] || 0) + invoice.amount;
      return acc;
    }, { total: 0, paid: 0, pending: 0, overdue: 0 });

    return totals;
  };

  const totals = calculateTotals();

  const handleDownloadAll = () => {
    if (window.confirm(`Download ${filteredInvoices.length} invoices as a ZIP file?`)) {
      // In a real app, this would trigger a bulk download
      console.log('Downloading all invoices:', filteredInvoices.map(i => i.id));
    }
  };

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
          <p className="text-sm text-gray-600">View and download your billing history</p>
        </div>
        
        {filteredInvoices.length > 0 && (
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            className="flex items-center"
          >
            <Icon name="download" size="sm" className="mr-2" />
            Download All
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Billed</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmount(totals.total)}</p>
              </div>
              <Icon name="dollarSign" size="lg" className="text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(totals.paid || 0)}</p>
              </div>
              <Icon name="check" size="lg" className="text-green-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{formatAmount(totals.pending || 0)}</p>
              </div>
              <Icon name="clock" size="lg" className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatAmount(totals.overdue || 0)}</p>
              </div>
              <Icon name="alertCircle" size="lg" className="text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {invoices.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      )}

      {/* Invoice List */}
      {filteredInvoices.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Icon name="file" size="sm" className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{invoice.number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                      {invoice.dueDate && (
                        <div className="text-sm text-gray-500">
                          Due: {formatDate(invoice.dueDate)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{invoice.description}</div>
                      {invoice.items && (
                        <div className="text-sm text-gray-500">
                          {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(invoice.amount)}
                      </div>
                      {invoice.tax && (
                        <div className="text-sm text-gray-500">
                          +{formatAmount(invoice.tax)} tax
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        <Icon name={getStatusIcon(invoice.status)} size="xs" className="mr-1" />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewInvoice?.(invoice)}
                          title="View invoice"
                        >
                          <Icon name="eye" size="sm" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownloadInvoice?.(invoice)}
                          title="Download PDF"
                        >
                          <Icon name="download" size="sm" />
                        </Button>
                        
                        {invoice.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onPayInvoice?.(invoice)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Icon name="file" size="lg" className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
          <p className="text-gray-600 mb-4">Your billing history will appear here once you start using our services</p>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Icon name="search" size="lg" className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterStatus('all');
              setFilterYear('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

InvoiceHistory.propTypes = {
  invoices: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    number: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    dueDate: PropTypes.string,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    tax: PropTypes.number,
    status: PropTypes.oneOf(['paid', 'pending', 'overdue', 'draft']).isRequired,
    items: PropTypes.array
  })),
  onDownloadInvoice: PropTypes.func,
  onViewInvoice: PropTypes.func,
  onPayInvoice: PropTypes.func,
  className: PropTypes.string
};

export default InvoiceHistory;