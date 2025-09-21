import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component (Simple)', () => {
  const defaultProps = {
    children: 'Click me',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders button with children', () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<Button {...defaultProps} />);

    await user.click(screen.getByRole('button'));

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Button {...defaultProps} variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600');

    rerender(<Button {...defaultProps} variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('border', 'border-red-600');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Button {...defaultProps} size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');

    rerender(<Button {...defaultProps} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('applies fullWidth class when fullWidth prop is true', () => {
    render(<Button {...defaultProps} fullWidth={true} />);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  test('forwards additional props to button element', () => {
    render(<Button {...defaultProps} data-testid="custom-button" type="submit" />);
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('handles different button types', () => {
    const { rerender } = render(<Button {...defaultProps} type="submit" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button {...defaultProps} type="reset" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  test('applies custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  test('prevents onClick when disabled', async () => {
    const user = userEvent.setup();
    render(<Button {...defaultProps} disabled={true} />);

    await user.click(screen.getByRole('button'));

    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });
});