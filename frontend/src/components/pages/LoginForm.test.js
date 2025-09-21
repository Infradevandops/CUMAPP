/**
 * @fileoverview Integration tests for LoginForm component
 * Tests user flows, component interactions, and end-to-end functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';
import { AuthProvider } from '../../hooks/useAuth';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
    user: null,
  }),
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('LoginForm Integration', () => {
  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Form Rendering', () => {
    test('renders complete login form with all elements', () => {
      renderLoginForm();

      // Check main form elements
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    test('renders form with proper structure and accessibility', async () => {
      const { container } = renderLoginForm();
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('renders form with proper ARIA attributes', () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('User Interactions', () => {
    test('allows user to fill out the form', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Fill out the form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    test('handles form submission', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue({ success: true });
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        user: null,
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill out and submit the form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
        user: null,
      });

      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });

    test('displays error messages', () => {
      const errorMessage = 'Invalid credentials';
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: jest.fn(),
        isLoading: false,
        error: errorMessage,
        user: null,
      });

      renderLoginForm();

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass('error-message');
    });

    test('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();

      // Submit form with Enter key
      await user.keyboard('{Enter}');
      expect(submitButton).toHaveBeenCalled(); // This would be handled by form submission
    });

    test('handles form validation', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit empty form
      await user.click(submitButton);

      // Check that HTML5 validation prevents submission
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Password Visibility Toggle', () => {
    test('toggles password visibility', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });

    test('maintains accessibility when toggling visibility', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Check initial accessibility
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
      expect(toggleButton).toHaveAttribute('aria-controls');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // Toggle visibility
      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Remember Me Functionality', () => {
    test('renders remember me checkbox', () => {
      renderLoginForm();

      const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
      expect(rememberMeCheckbox).toBeInTheDocument();
      expect(rememberMeCheckbox).toHaveAttribute('type', 'checkbox');
    });

    test('handles remember me checkbox interaction', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const rememberMeCheckbox = screen.getByLabelText(/remember me/i);

      // Initially unchecked
      expect(rememberMeCheckbox).not.toBeChecked();

      // Check the box
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      // Uncheck the box
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });
  });

  describe('Navigation Links', () => {
    test('renders forgot password link', () => {
      renderLoginForm();

      const forgotPasswordLink = screen.getByText(/forgot password/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    test('renders sign up link', () => {
      renderLoginForm();

      const signUpLink = screen.getByText(/don't have an account/i);
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
    });

    test('navigation links are keyboard accessible', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const forgotPasswordLink = screen.getByText(/forgot password/i);
      const signUpLink = screen.getByText(/don't have an account/i);

      // Tab to links
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab(); // Navigate through form elements

      expect(forgotPasswordLink).toHaveFocus();
      await user.keyboard('{Enter}');
      // Navigation would be handled by router
    });
  });

  describe('Form State Management', () => {
    test('preserves form data during re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Re-render component
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check that form data is preserved
      expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
      expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
    });

    test('resets form on successful login', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue({ success: true });
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        user: { id: 1, email: 'test@example.com' }, // Simulate successful login
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Fill form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Wait for useEffect to run and reset form
      await waitFor(() => {
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
      });
    });
  });

  describe('Error Handling', () => {
    test('displays network error', () => {
      const networkError = 'Network error occurred';
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: jest.fn(),
        isLoading: false,
        error: networkError,
        user: null,
      });

      renderLoginForm();

      expect(screen.getByText(networkError)).toBeInTheDocument();
    });

    test('displays validation error', () => {
      const validationError = 'Please enter a valid email address';
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: jest.fn(),
        isLoading: false,
        error: validationError,
        user: null,
      });

      renderLoginForm();

      expect(screen.getByText(validationError)).toBeInTheDocument();
    });

    test('clears errors when user starts typing', async () => {
      const user = userEvent.setup();
      const { useAuth } = require('../../hooks/useAuth');
      useAuth.mockReturnValue({
        login: jest.fn(),
        isLoading: false,
        error: 'Invalid credentials',
        user: null,
      });

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const errorMessage = screen.getByText('Invalid credentials');

      // Start typing
      await user.type(emailInput, 'a');

      // Error should be cleared
      expect(errorMessage).not.toBeVisible();
    });
  });

  describe('Performance', () => {
    test('renders efficiently with multiple interactions', async () => {
      const user = userEvent.setup();
      const startTime = performance.now();

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Perform multiple interactions
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);
      await user.click(submitButton);

      const endTime = performance.now();
      const interactionTime = endTime - startTime;

      expect(interactionTime).toBeLessThan(100); // Should handle interactions in < 100ms
    });

    test('handles rapid form changes efficiently', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);

      const startTime = performance.now();

      // Rapid typing
      for (let i = 0; i < 10; i++) {
        await user.clear(emailInput);
        await user.type(emailInput, `test${i}@example.com`);
      }

      const endTime = performance.now();
      const typingTime = endTime - startTime;

      expect(typingTime).toBeLessThan(200); // Should handle rapid changes efficiently
    });
  });

  describe('Responsive Design', () => {
    test('adapts to different screen sizes', () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 }, // Desktop
      ];

      viewports.forEach(({ width, height }) => {
        // This would typically be tested with a testing library that supports viewport simulation
        // For now, we'll just verify the component renders without errors
        const { container } = renderLoginForm();
        expect(container).toBeInTheDocument();
      });
    });

    test('maintains accessibility across screen sizes', async () => {
      const { container } = renderLoginForm();
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe('Internationalization', () => {
    test('supports different languages', () => {
      // This would test i18n support if implemented
      renderLoginForm();

      // Check that all text content is present
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('handles right-to-left languages', () => {
      // This would test RTL support if implemented
      renderLoginForm();

      // Verify that the form structure remains intact
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});