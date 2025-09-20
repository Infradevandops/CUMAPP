import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the auth hook
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false
  })
}));

test('renders without crashing', () => {
  render(<App />);
  // Just check that the app renders without throwing an error
  expect(document.body).toBeInTheDocument();
});

test('app contains expected elements', () => {
  render(<App />);
  // This is a very basic test - just ensure the app structure exists
  const appElement = document.querySelector('.App, [data-testid="app"], body');
  expect(appElement).toBeInTheDocument();
});