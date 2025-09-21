/**
 * @fileoverview Comprehensive unit tests for Input component
 * Tests all variants, states, and interactions of the Input atom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Input from './Input';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Input Component', () => {
  const defaultProps = {
    placeholder: 'Enter text here',
    'data-testid': 'input-test',
  };

  describe('Rendering', () => {
    test('renders with default props', () => {
      render(<Input {...defaultProps} />);

      const input = screen.getByTestId('input-test');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter text here');
      expect(input.tagName).toBe('INPUT');
    });

    test('renders with different input types', () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'];

      types.forEach(type => {
        const { rerender } = render(<Input {...defaultProps} type={type} />);
        const input = screen.getByTestId('input-test');
        expect(input).toHaveAttribute('type', type);
        rerender(<Input {...defaultProps} />); // Reset for next iteration
      });
    });

    test('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'];

      sizes.forEach(size => {
        const { rerender } = render(<Input {...defaultProps} size={size} />);
        const input = screen.getByTestId('input-test');
        expect(input).toHaveClass(`input-${size}`);
        rerender(<Input {...defaultProps} />); // Reset for next iteration
      });
    });

    test('renders with custom className', () => {
      const customClass = 'custom-input-class';
      render(<Input {...defaultProps} className={customClass} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveClass(customClass);
    });

    test('renders with id attribute', () => {
      const testId = 'test-input-id';
      render(<Input {...defaultProps} id={testId} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('id', testId);
    });
  });

  describe('States and Variants', () => {
    test('renders disabled state', () => {
      render(<Input {...defaultProps} disabled />);

      const input = screen.getByTestId('input-test');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('input-disabled');
    });

    test('renders error state', () => {
      render(<Input {...defaultProps} error />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveClass('input-error');
    });

    test('renders with value', () => {
      const value = 'Test value';
      render(<Input {...defaultProps} value={value} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveValue(value);
    });

    test('renders with default value', () => {
      const defaultValue = 'Default value';
      render(<Input {...defaultProps} defaultValue={defaultValue} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveValue(defaultValue);
    });

    test('renders with maxLength', () => {
      const maxLength = 10;
      render(<Input {...defaultProps} maxLength={maxLength} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('maxLength', maxLength.toString());
    });

    test('renders as required', () => {
      render(<Input {...defaultProps} required />);

      const input = screen.getByTestId('input-test');
      expect(input).toBeRequired();
    });

    test('renders as readonly', () => {
      render(<Input {...defaultProps} readOnly />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('User Interactions', () => {
    test('handles onChange event', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onChange={handleChange} />);

      const input = screen.getByTestId('input-test');
      const testValue = 'Hello World';

      await user.type(input, testValue);

      expect(handleChange).toHaveBeenCalledTimes(testValue.length);
      expect(input).toHaveValue(testValue);
    });

    test('handles onFocus event', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onFocus={handleFocus} />);

      const input = screen.getByTestId('input-test');

      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
      expect(input).toHaveFocus();
    });

    test('handles onBlur event', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onBlur={handleBlur} />);

      const input = screen.getByTestId('input-test');

      await user.click(input);
      await user.click(document.body); // Click outside to blur

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('handles onKeyDown event', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onKeyDown={handleKeyDown} />);

      const input = screen.getByTestId('input-test');

      await user.type(input, 'a');

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'a',
          code: 'KeyA',
        })
      );
    });

    test('handles onKeyUp event', async () => {
      const handleKeyUp = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onKeyUp={handleKeyUp} />);

      const input = screen.getByTestId('input-test');

      await user.type(input, 'a');

      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });

    test('handles onInput event', async () => {
      const handleInput = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onInput={handleInput} />);

      const input = screen.getByTestId('input-test');

      await user.type(input, 'test');

      expect(handleInput).toHaveBeenCalledTimes(4); // t-e-s-t
    });
  });

  describe('Form Integration', () => {
    test('works with form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      const handleFormChange = jest.fn();
      const user = userEvent.setup();

      render(
        <form onSubmit={handleSubmit}>
          <Input
            {...defaultProps}
            name="testInput"
            onChange={handleFormChange}
          />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByTestId('input-test');
      const submitButton = screen.getByText('Submit');

      await user.type(input, 'Test value');
      await user.click(submitButton);

      expect(handleFormChange).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('respects form validation', () => {
      render(
        <form>
          <Input {...defaultProps} name="testInput" required />
        </form>
      );

      const input = screen.getByTestId('input-test');
      expect(input).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(<Input {...defaultProps} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('has proper ARIA attributes when error', () => {
      const errorMessage = 'This field is required';
      render(
        <>
          <Input {...defaultProps} error aria-describedby="error-message" />
          <div id="error-message">{errorMessage}</div>
        </>
      );

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });

    test('has proper ARIA attributes when disabled', () => {
      render(<Input {...defaultProps} disabled />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('aria-disabled', 'true');
    });

    test('has proper ARIA attributes when required', () => {
      render(<Input {...defaultProps} required />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('is keyboard accessible', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onFocus={handleFocus} />);

      const input = screen.getByTestId('input-test');

      await user.tab();
      expect(input).toHaveFocus();
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    test('maintains focus management', async () => {
      const user = userEvent.setup();

      render(<Input {...defaultProps} />);

      const input = screen.getByTestId('input-test');

      await user.click(input);
      expect(input).toHaveFocus();

      await user.tab();
      expect(input).not.toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty value correctly', () => {
      render(<Input {...defaultProps} value="" />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveValue('');
    });

    test('handles undefined value correctly', () => {
      render(<Input {...defaultProps} value={undefined} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveValue('');
    });

    test('handles null value correctly', () => {
      render(<Input {...defaultProps} value={null} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveValue('');
    });

    test('handles very long placeholder text', () => {
      const longPlaceholder = 'This is a very long placeholder text that should still be handled correctly by the input component';
      render(<Input {...defaultProps} placeholder={longPlaceholder} />);

      const input = screen.getByTestId('input-test');
      expect(input).toHaveAttribute('placeholder', longPlaceholder);
    });

    test('handles special characters in value', async () => {
      const specialValue = 'Test@#$%^&*()_+{}|:"<>?[]\\;\',./';
      const user = userEvent.setup();

      render(<Input {...defaultProps} />);

      const input = screen.getByTestId('input-test');
      await user.type(input, specialValue);

      expect(input).toHaveValue(specialValue);
    });

    test('handles numeric input correctly', async () => {
      const user = userEvent.setup();

      render(<Input {...defaultProps} type="number" />);

      const input = screen.getByTestId('input-test');
      await user.type(input, '12345');

      expect(input).toHaveValue(12345);
    });

    test('handles paste events', async () => {
      const handlePaste = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onPaste={handlePaste} />);

      const input = screen.getByTestId('input-test');

      const pasteData = 'Pasted content';
      await user.click(input);
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      expect(handlePaste).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance', () => {
    test('renders efficiently with many props', () => {
      const manyProps = {
        ...defaultProps,
        type: 'text',
        size: 'lg',
        disabled: false,
        error: false,
        required: true,
        maxLength: 100,
        autoComplete: 'off',
        autoFocus: false,
        spellCheck: false,
        className: 'custom-class',
        id: 'test-id',
        name: 'test-name',
        'data-testid': 'input-test',
      };

      const startTime = performance.now();
      const { rerender } = render(<Input {...manyProps} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should render in less than 10ms

      // Test re-rendering performance
      const newStartTime = performance.now();
      rerender(<Input {...manyProps} value="test" />);
      const newEndTime = performance.now();

      expect(newEndTime - newStartTime).toBeLessThan(5); // Re-render should be even faster
    });

    test('handles rapid typing efficiently', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input {...defaultProps} onChange={handleChange} />);

      const input = screen.getByTestId('input-test');
      const longText = 'This is a very long text that would be typed quickly to test performance';

      const startTime = performance.now();
      await user.type(input, longText);
      const endTime = performance.now();

      // Should handle rapid typing efficiently
      expect(endTime - startTime).toBeLessThan(100);
      expect(handleChange).toHaveBeenCalledTimes(longText.length);
    });
  });

  describe('Browser Compatibility', () => {
    test('works with different input types across browsers', () => {
      const browserSpecificTypes = [
        { type: 'email', expected: 'email' },
        { type: 'number', expected: 'number' },
        { type: 'tel', expected: 'tel' },
        { type: 'url', expected: 'url' },
        { type: 'search', expected: 'search' },
      ];

      browserSpecificTypes.forEach(({ type, expected }) => {
        const { rerender } = render(<Input {...defaultProps} type={type} />);
        const input = screen.getByTestId('input-test');
        expect(input).toHaveAttribute('type', expected);
        rerender(<Input {...defaultProps} />); // Reset for next iteration
      });
    });

    test('handles autocomplete attributes', () => {
      const autocompleteValues = [
        'name', 'email', 'username', 'new-password',
        'current-password', 'organization', 'street-address'
      ];

      autocompleteValues.forEach(value => {
        const { rerender } = render(<Input {...defaultProps} autoComplete={value} />);
        const input = screen.getByTestId('input-test');
        expect(input).toHaveAttribute('autocomplete', value);
        rerender(<Input {...defaultProps} />); // Reset for next iteration
      });
    });
  });
});