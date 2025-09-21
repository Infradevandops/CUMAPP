/**
 * @fileoverview Comprehensive unit tests for Card component
 * Tests all variants, compound components, and interactions of the Card atom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Card, { CardHeader, CardContent, CardFooter } from './Card';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Card Component', () => {
  const defaultProps = {
    'data-testid': 'card-test',
  };

  describe('Basic Card Rendering', () => {
    test('renders basic card with default props', () => {
      render(<Card {...defaultProps}>Card content</Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('card');
      expect(card).toHaveTextContent('Card content');
    });

    test('renders with different variants', () => {
      const variants = ['default', 'outlined', 'elevated'];

      variants.forEach(variant => {
        const { rerender } = render(
          <Card {...defaultProps} variant={variant}>
            Card content
          </Card>
        );
        const card = screen.getByTestId('card-test');
        expect(card).toHaveClass(`card-${variant}`);
        rerender(<Card {...defaultProps}>Card content</Card>); // Reset for next iteration
      });
    });

    test('renders with different padding options', () => {
      const paddings = ['none', 'sm', 'md', 'lg', 'xl'];

      paddings.forEach(padding => {
        const { rerender } = render(
          <Card {...defaultProps} padding={padding}>
            Card content
          </Card>
        );
        const card = screen.getByTestId('card-test');
        expect(card).toHaveClass(`card-padding-${padding}`);
        rerender(<Card {...defaultProps}>Card content</Card>); // Reset for next iteration
      });
    });

    test('renders with different shadow effects', () => {
      const shadows = ['none', 'sm', 'md', 'lg', 'xl'];

      shadows.forEach(shadow => {
        const { rerender } = render(
          <Card {...defaultProps} shadow={shadow}>
            Card content
          </Card>
        );
        const card = screen.getByTestId('card-test');
        expect(card).toHaveClass(`card-shadow-${shadow}`);
        rerender(<Card {...defaultProps}>Card content</Card>); // Reset for next iteration
      });
    });

    test('renders with hover effects', () => {
      render(<Card {...defaultProps} hover>Card content</Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toHaveClass('card-hover');
    });

    test('renders with custom className', () => {
      const customClass = 'custom-card-class';
      render(<Card {...defaultProps} className={customClass}>Card content</Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toHaveClass(customClass);
    });

    test('renders with custom styles', () => {
      const customStyles = { backgroundColor: 'red', borderRadius: '10px' };
      render(<Card {...defaultProps} style={customStyles}>Card content</Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toHaveStyle(customStyles);
    });
  });

  describe('Compound Components', () => {
    test('renders with CardHeader', () => {
      render(
        <Card {...defaultProps}>
          <CardHeader>Header Content</CardHeader>
          <CardContent>Body Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Header Content')).toBeInTheDocument();
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    test('renders with CardFooter', () => {
      render(
        <Card {...defaultProps}>
          <CardContent>Body Content</CardContent>
          <CardFooter>Footer Content</CardFooter>
        </Card>
      );

      expect(screen.getByText('Body Content')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    test('renders complete card with all compound components', () => {
      render(
        <Card {...defaultProps}>
          <CardHeader>Header</CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByText('Footer actions')).toBeInTheDocument();
    });

    test('renders multiple cards with different structures', () => {
      render(
        <div>
          <Card data-testid="card-1">
            <CardHeader>Card 1 Header</CardHeader>
            <CardContent>Card 1 Content</CardContent>
          </Card>
          <Card data-testid="card-2">
            <CardContent>Card 2 Content</CardContent>
            <CardFooter>Card 2 Footer</CardFooter>
          </Card>
          <Card data-testid="card-3">
            <CardHeader>Card 3 Header</CardHeader>
            <CardContent>Card 3 Content</CardContent>
            <CardFooter>Card 3 Footer</CardFooter>
          </Card>
        </div>
      );

      expect(screen.getByTestId('card-1')).toHaveTextContent('Card 1 Header');
      expect(screen.getByTestId('card-2')).toHaveTextContent('Card 2 Footer');
      expect(screen.getByTestId('card-3')).toHaveTextContent('Card 3 Header');
      expect(screen.getByTestId('card-3')).toHaveTextContent('Card 3 Footer');
    });
  });

  describe('User Interactions', () => {
    test('handles click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Card {...defaultProps} onClick={handleClick}>Clickable Card</Card>);

      const card = screen.getByTestId('card-test');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('handles hover events', async () => {
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();
      const user = userEvent.setup();

      render(
        <Card
          {...defaultProps}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Hoverable Card
        </Card>
      );

      const card = screen.getByTestId('card-test');

      await user.hover(card);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      await user.unhover(card);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    test('handles keyboard navigation', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();

      render(<Card {...defaultProps} onKeyDown={handleKeyDown} tabIndex={0}>Keyboard Card</Card>);

      const card = screen.getByTestId('card-test');
      card.focus();

      await user.keyboard('{Enter}');
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter',
          code: 'Enter',
        })
      );
    });

    test('handles focus events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(
        <Card
          {...defaultProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0}
        >
          Focusable Card
        </Card>
      );

      const card = screen.getByTestId('card-test');

      await user.click(card);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <Card {...defaultProps}>
          <CardHeader>Accessible Header</CardHeader>
          <CardContent>Accessible content</CardContent>
          <CardFooter>Accessible footer</CardFooter>
        </Card>
      );
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('has proper ARIA attributes when interactive', () => {
      render(
        <Card {...defaultProps} role="button" aria-label="Click me" tabIndex={0}>
          Interactive Card
        </Card>
      );

      const card = screen.getByTestId('card-test');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('aria-label', 'Click me');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    test('has proper semantic structure', () => {
      render(
        <Card {...defaultProps}>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      // Check that compound components render with proper structure
      const header = screen.getByText('Header');
      const content = screen.getByText('Content');
      const footer = screen.getByText('Footer');

      expect(header.closest('.card-header')).toBeInTheDocument();
      expect(content.closest('.card-content')).toBeInTheDocument();
      expect(footer.closest('.card-footer')).toBeInTheDocument();
    });

    test('maintains focus management', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Before</button>
          <Card {...defaultProps} tabIndex={0}>Focusable Card</Card>
          <button>After</button>
        </div>
      );

      const card = screen.getByTestId('card-test');

      await user.tab();
      expect(card).toHaveFocus();
    });

    test('has proper heading hierarchy', () => {
      render(
        <Card {...defaultProps}>
          <CardHeader>
            <h1>Level 1 Heading</h1>
            <h2>Level 2 Heading</h2>
          </CardHeader>
          <CardContent>
            <h3>Level 3 Heading</h3>
          </CardContent>
        </Card>
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('renders with empty content', () => {
      render(<Card {...defaultProps}></Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });

    test('renders with only whitespace content', () => {
      render(<Card {...defaultProps}>   </Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toBeInTheDocument();
    });

    test('renders with very long content', () => {
      const longContent = 'A'.repeat(1000);
      render(<Card {...defaultProps}>{longContent}</Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toHaveTextContent(longContent);
    });

    test('renders with special characters', () => {
      const specialContent = 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      render(<Card {...defaultProps}>{specialContent}</Card>);

      const card = screen.getByTestId('card-test');
      expect(card).toHaveTextContent(specialContent);
    });

    test('renders with nested interactive elements', () => {
      render(
        <Card {...defaultProps}>
          <button>Button 1</button>
          <a href="#test">Link</a>
          <input type="text" placeholder="Input" />
          <button>Button 2</button>
        </Card>
      );

      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Input')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
    });

    test('handles rapid style changes', () => {
      const { rerender } = render(<Card {...defaultProps}>Card</Card>);

      const card = screen.getByTestId('card-test');

      // Rapidly change variants
      rerender(<Card {...defaultProps} variant="outlined">Card</Card>);
      expect(card).toHaveClass('card-outlined');

      rerender(<Card {...defaultProps} variant="elevated">Card</Card>);
      expect(card).toHaveClass('card-elevated');

      rerender(<Card {...defaultProps} variant="default">Card</Card>);
      expect(card).toHaveClass('card-default');
    });
  });

  describe('Performance', () => {
    test('renders efficiently with many props', () => {
      const manyProps = {
        ...defaultProps,
        variant: 'elevated',
        padding: 'lg',
        shadow: 'md',
        hover: true,
        className: 'custom-class',
        style: { backgroundColor: 'blue' },
        'data-test': 'value',
      };

      const startTime = performance.now();
      const { rerender } = render(<Card {...manyProps}>Card content</Card>);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10); // Should render in less than 10ms

      // Test re-rendering performance
      const newStartTime = performance.now();
      rerender(<Card {...manyProps}>Updated content</Card>);
      const newEndTime = performance.now();

      expect(newEndTime - newStartTime).toBeLessThan(5); // Re-render should be even faster
    });

    test('handles many cards efficiently', () => {
      const cards = Array.from({ length: 100 }, (_, i) => (
        <Card key={i} data-testid={`card-${i}`}>
          Card {i + 1}
        </Card>
      ));

      const startTime = performance.now();
      render(<div>{cards}</div>);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render 100 cards in less than 100ms

      // Verify all cards are rendered
      for (let i = 0; i < 10; i++) { // Check first 10 cards
        expect(screen.getByTestId(`card-${i}`)).toBeInTheDocument();
      }
    });

    test('handles frequent updates efficiently', () => {
      const { rerender } = render(<Card {...defaultProps}>Initial</Card>);

      const startTime = performance.now();

      // Rapidly update content multiple times
      for (let i = 0; i < 50; i++) {
        rerender(<Card {...defaultProps}>Update {i}</Card>);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // 50 updates should take less than 200ms
    });
  });

  describe('Browser Compatibility', () => {
    test('works with different shadow values across browsers', () => {
      const shadowValues = ['none', 'sm', 'md', 'lg', 'xl'];

      shadowValues.forEach(shadow => {
        const { rerender } = render(
          <Card {...defaultProps} shadow={shadow}>
            Card with {shadow} shadow
          </Card>
        );
        const card = screen.getByTestId('card-test');
        expect(card).toHaveClass(`card-shadow-${shadow}`);
        rerender(<Card {...defaultProps}>Card content</Card>); // Reset for next iteration
      });
    });

    test('handles hover effects across browsers', async () => {
      const user = userEvent.setup();

      render(<Card {...defaultProps} hover>Hover Card</Card>);

      const card = screen.getByTestId('card-test');

      await user.hover(card);
      expect(card).toHaveClass('card-hover');

      await user.unhover(card);
      expect(card).not.toHaveClass('card-hover');
    });

    test('maintains styles with CSS custom properties', () => {
      const customStyles = {
        '--card-border-radius': '20px',
        '--card-padding': '2rem',
      };

      render(
        <Card {...defaultProps} style={customStyles}>
          Custom styled card
        </Card>
      );

      const card = screen.getByTestId('card-test');
      expect(card).toHaveStyle(customStyles);
    });
  });

  describe('Integration with Other Components', () => {
    test('works with form elements', () => {
      render(
        <Card {...defaultProps}>
          <form>
            <input type="text" placeholder="Form input" />
            <button type="submit">Submit</button>
          </form>
        </Card>
      );

      expect(screen.getByPlaceholderText('Form input')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    test('works with lists', () => {
      render(
        <Card {...defaultProps}>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </Card>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    test('works with images', () => {
      render(
        <Card {...defaultProps}>
          <img src="test-image.jpg" alt="Test image" />
          <p>Image caption</p>
        </Card>
      );

      const image = screen.getByAltText('Test image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'test-image.jpg');
      expect(screen.getByText('Image caption')).toBeInTheDocument();
    });

    test('works with links', () => {
      render(
        <Card {...defaultProps}>
          <a href="https://example.com">External Link</a>
          <a href="#internal">Internal Link</a>
        </Card>
      );

      expect(screen.getByText('External Link')).toHaveAttribute('href', 'https://example.com');
      expect(screen.getByText('Internal Link')).toHaveAttribute('href', '#internal');
    });
  });
});