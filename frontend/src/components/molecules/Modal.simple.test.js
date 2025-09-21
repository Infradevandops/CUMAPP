import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal Component (Simple)', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when overlay is clicked and closeOnOverlayClick is true', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);

    const overlay = screen.getByRole('dialog').parentElement;
    await user.click(overlay);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when overlay is clicked and closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} closeOnOverlayClick={false} />);

    const overlay = screen.getByRole('dialog').parentElement;
    await user.click(overlay);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  test('calls onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    const modal = screen.getByRole('dialog').parentElement;
    expect(modal).toHaveClass('max-w-md');

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(modal).toHaveClass('max-w-2xl');
  });

  test('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  test('renders without title', () => {
    render(<Modal {...defaultProps} title={undefined} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal-class" />);
    const modal = screen.getByRole('dialog').parentElement;
    expect(modal).toHaveClass('custom-modal-class');
  });

  test('forwards additional props to modal container', () => {
    render(<Modal {...defaultProps} data-testid="custom-modal" />);
    expect(screen.getByTestId('custom-modal')).toBeInTheDocument();
  });

  test('has correct ARIA attributes', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.parentElement).toHaveAttribute('role', 'dialog');
  });

  test('renders compound components correctly', () => {
    render(
      <Modal {...defaultProps}>
        <Modal.Header>Header Content</Modal.Header>
        <Modal.Body>Body Content</Modal.Body>
        <Modal.Footer>Footer Content</Modal.Footer>
      </Modal>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
});