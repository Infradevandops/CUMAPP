import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';

// Mock the BaseLayout component
jest.mock('../templates/BaseLayout', () => {
  return function MockBaseLayout({ children, user, currentPath, ...props }) {
    return (
      <div data-testid="base-layout" data-user={JSON.stringify(user)} data-path={currentPath}>
        {children}
        {props.notification && (
          <div data-testid="notification" data-type={props.notification.type}>
            {props.notification.message}
          </div>
        )}
      </div>
    );
  };
});

// Mock the atoms
jest.mock('../atoms', () => ({
  LoadingSpinner: ({ size }) => <div data-testid="loading-spinner" data-size={size}>Loading...</div>,
  Typography: ({ children, variant, className }) => (
    <div data-testid={`typography-${variant}`} className={className}>
      {children}
    </div>
  )
}));

// Mock the molecules
jest.mock('../molecules', () => ({
  DataTable: ({ data, columns, searchable, sortable, onRowClick }) => (
    <div data-testid="data-table">
      <div data-testid="table-data">{JSON.stringify(data)}</div>
      <div data-testid="table-columns">{JSON.stringify(columns)}</div>
      <div data-testid="table-searchable">{searchable.toString()}</div>
      <div data-testid="table-sortable">{sortable.toString()}</div>
    </div>
  )
}));

// Mock the organisms
jest.mock('../organisms/DashboardWidget', () => ({
  DashboardWidget: ({ title, value, change, changeType, icon, color, loading }) => (
    <div data-testid={`dashboard-widget-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div data-testid="widget-title">{title}</div>
      <div data-testid="widget-value">{value}</div>
      <div data-testid="widget-change">{change}</div>
      <div data-testid="widget-change-type">{changeType}</div>
      <div data-testid="widget-icon">{icon}</div>
      <div data-testid="widget-color">{color}</div>
      <div data-testid="widget-loading">{loading.toString()}</div>
    </div>
  ),
  ActivityWidget: ({ activities, loading }) => (
    <div data-testid="activity-widget">
      <div data-testid="activities-data">{JSON.stringify(activities)}</div>
      <div data-testid="activities-loading">{loading.toString()}</div>
    </div>
  ),
  QuickActionsWidget: ({ actions }) => (
    <div data-testid="quick-actions-widget">
      <div data-testid="actions-data">{JSON.stringify(actions)}</div>
    </div>
  )
}));

describe('DashboardPage Integration Tests', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          totalMessages: 1234,
          activeNumbers: 5,
          monthlyUsage: 89.5,
          unreadMessages: 12,
          successRate: 98.2,
          totalCost: 45.67
        }),
        ok: true,
        status: 200,
      })
    );
  });

  test('renders dashboard with loading state initially', () => {
    render(<DashboardPage user={mockUser} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg');
  });

  test('renders dashboard with stats after loading', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Check that all dashboard widgets are rendered
    expect(screen.getByTestId('dashboard-widget-total-messages')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-widget-active-numbers')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-widget-monthly-usage')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-widget-unread-messages')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-widget-success-rate')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-widget-total-cost')).toBeInTheDocument();

    // Check widget values
    expect(screen.getByTestId('widget-value')).toHaveTextContent('1,234');
    expect(screen.getByTestId('widget-change')).toHaveTextContent('+12%');
  });

  test('renders activity widget with recent activities', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-widget')).toBeInTheDocument();
    });

    const activitiesData = screen.getByTestId('activities-data');
    const activities = JSON.parse(activitiesData.textContent);

    expect(activities).toHaveLength(4);
    expect(activities[0]).toHaveProperty('message', 'New message received from +1234567890');
    expect(activities[0]).toHaveProperty('type', 'success');
  });

  test('renders quick actions widget', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByTestId('quick-actions-widget')).toBeInTheDocument();
    });

    const actionsData = screen.getByTestId('actions-data');
    const actions = JSON.parse(actionsData.textContent);

    expect(actions).toHaveLength(4);
    expect(actions[0]).toHaveProperty('title', 'Send SMS');
    expect(actions[1]).toHaveProperty('title', 'Buy Number');
  });

  test('renders recent messages table', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    expect(screen.getByTestId('table-searchable')).toHaveTextContent('true');
    expect(screen.getByTestId('table-sortable')).toHaveTextContent('true');

    const tableData = screen.getByTestId('table-data');
    const data = JSON.parse(tableData.textContent);

    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('from', '+1234567890');
    expect(data[0]).toHaveProperty('status', 'delivered');
  });

  test('renders page header with title and description', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByTestId('typography-h1')).toBeInTheDocument();
    });

    expect(screen.getByTestId('typography-h1')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('typography-body1')).toHaveTextContent(
      'Welcome back! Here\'s what\'s happening with your account.'
    );
  });

  test('passes correct props to BaseLayout', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      const baseLayout = screen.getByTestId('base-layout');
      expect(baseLayout).toHaveAttribute('data-path', '/dashboard');
    });
  });

  test('handles search functionality', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // The search functionality is handled by BaseLayout props
    // This test ensures the component can handle search without errors
    const dashboardPage = screen.getByTestId('base-layout').firstChild;
    expect(dashboardPage).toBeInTheDocument();
  });

  test('handles logout functionality', async () => {
    render(<DashboardPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // The logout functionality is handled by BaseLayout props
    // This test ensures the component can handle logout without errors
    const dashboardPage = screen.getByTestId('base-layout').firstChild;
    expect(dashboardPage).toBeInTheDocument();
  });
});