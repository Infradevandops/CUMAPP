// Test utilities for common testing patterns

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../../contexts/NotificationContext';

// Custom render function that includes providers
export const renderWithProviders = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </BrowserRouter>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

// Mock user for testing
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
};

// Mock admin user for testing
export const mockAdminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};

// Common test data
export const mockMessages = [
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

export const mockStats = {
  totalMessages: 1234,
  activeNumbers: 5,
  monthlyUsage: 89.5,
  unreadMessages: 12,
  successRate: 98.2,
  totalCost: 45.67
};

// Helper to create mock functions with tracking
export const createMockFn = () => {
  const mockFn = jest.fn();
  mockFn.mockClear = jest.fn();
  return mockFn;
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to create component props with defaults
export const createComponentProps = (overrides = {}) => ({
  onClick: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  ...overrides
});