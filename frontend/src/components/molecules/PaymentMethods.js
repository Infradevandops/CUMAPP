import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const PaymentMethods = ({
  paymentMethods = [],
  onAddPaymentMethod,
  onRemovePaymentMethod,
  onSetDefault,
  onEditPaymentMethod,
  className = '',
  ...props
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const cardTypes = {
    visa: { name: 'Visa', icon: '💳' },
    mastercard: { name: 'Mastercard', icon: '💳' },
    amex: { name: 'American Express', icon: '💳' },
    discover: { name: 'Discover', icon: '💳' }
  };

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const formatCardNumber = (value) => {
    const number = value.replace(/\s/g, '');
    const formatted = number.replace(/(.{4})/g, '$1 ');
    return formatted.trim();
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewPaymentMethod(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewPaymentMethod(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddPaymentMethod = () => {
    // Validate form
    const errors = [];
    if (!newPaymentMethod.cardNumber || newPaymentMethod.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Valid card number is required');
    }
    if (!newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear) {
      errors.push('Expiry date is required');
    }
    if (!newPaymentMethod.cvv || newPaymentMethod.cvv.length < 3) {
      errors.push('Valid CVV is required');
    }
    if (!newPaymentMethod.cardholderName) {
      errors.push('Cardholder name is required');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const paymentMethod = {
      id: Date.now(),
      type: 'card',
      cardType: getCardType(newPaymentMethod.cardNumber),
      last4: newPaymentMethod.cardNumber.slice(-4),
      expiryMonth: newPaymentMethod.expiryMonth,
      expiryYear: newPaymentMethod.expiryYear,
      cardholderName: newPaymentMethod.cardholderName,
      billingAddress: newPaymentMethod.billingAddress,
      isDefault: paymentMethods.length === 0,
      createdAt: new Date().toISOString()
    };

    onAddPaymentMethod?.(paymentMethod);
    setShowAddForm(false);
    setNewPaymentMethod({
      type: 'card',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    });
  };

  const handleRemovePaymentMethod = (methodId) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      onRemovePaymentMethod?.(methodId);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Manage your payment methods and billing information</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center"
        >
          <Icon name="plus" size="sm" className="mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Existing Payment Methods */}
      {paymentMethods.length > 0 ? (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white border rounded-lg p-4 ${
                method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-lg">
                      {cardTypes[method.cardType]?.icon || '💳'}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {cardTypes[method.cardType]?.name || 'Card'} ending in {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear} • {method.cardholderName}
                    </div>
                    {method.billingAddress && (
                      <div className="text-xs text-gray-500 mt-1">
                        {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.zipCode}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault?.(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPaymentMethod?.(method)}
                  >
                    <Icon name="edit" size="sm" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Icon name="trash" size="sm" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Icon name="creditCard" size="lg" className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
          <p className="text-gray-600 mb-4">Add a payment method to manage your subscription</p>
          <Button onClick={() => setShowAddForm(true)}>
            Add Your First Payment Method
          </Button>
        </div>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Add Payment Method</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <Icon name="x" size="sm" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Card Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={formatCardNumber(newPaymentMethod.cardNumber)}
                onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Month
                </label>
                <select
                  value={newPaymentMethod.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Year
                </label>
                <select
                  value={newPaymentMethod.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Year</option>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={newPaymentMethod.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={newPaymentMethod.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Billing Address */}
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Billing Address</h5>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={newPaymentMethod.billingAddress.street}
                    onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                    placeholder="123 Main St"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.billingAddress.city}
                      onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                      placeholder="New York"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.billingAddress.state}
                      onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                      placeholder="NY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.billingAddress.zipCode}
                      onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                      placeholder="10001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={newPaymentMethod.billingAddress.country}
                      onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPaymentMethod}>
                Add Payment Method
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Icon name="shield" size="sm" className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Secure Payment Processing</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your payment information is encrypted and securely processed. We never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

PaymentMethods.propTypes = {
  paymentMethods: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    cardType: PropTypes.string,
    last4: PropTypes.string,
    expiryMonth: PropTypes.string,
    expiryYear: PropTypes.string,
    cardholderName: PropTypes.string,
    isDefault: PropTypes.bool,
    billingAddress: PropTypes.object
  })),
  onAddPaymentMethod: PropTypes.func,
  onRemovePaymentMethod: PropTypes.func,
  onSetDefault: PropTypes.func,
  onEditPaymentMethod: PropTypes.func,
  className: PropTypes.string
};

export default PaymentMethods;