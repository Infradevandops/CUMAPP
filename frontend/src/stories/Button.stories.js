import React from 'react';
import { action } from '@storybook/addon-actions';
import Button from '../components/atoms/Button';

/**
 * A versatile button component with multiple variants, sizes, and states.
 *
 * Features:
 * - Multiple visual variants (primary, secondary, outline, ghost, danger, success)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Loading state with spinner
 * - Full width option
 * - Icon support (start and end icons)
 * - Disabled state
 * - Custom styling support
 */
export default {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A comprehensive button component that supports multiple variants, sizes, and states.

**Key Features:**
- **6 Variants**: primary, secondary, outline, ghost, danger, success
- **5 Sizes**: xs, sm, md, lg, xl
- **Loading State**: Built-in spinner animation
- **Icon Support**: Start and end icon positions
- **Full Width**: Optional full-width layout
- **Disabled State**: Proper disabled styling
- **Custom Styling**: Additional className support

**Usage:**
\`\`\`jsx
import Button from './components/atoms/Button';

// Basic usage
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>

// With icons
<Button
  variant="outline"
  startIcon={<PlusIcon />}
  endIcon={<ArrowRightIcon />}
>
  Add Item
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>
\`\`\`
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'],
      description: 'Visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      }
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      }
    },
    children: {
      control: 'text',
      description: 'Button content (replaces label prop)',
      table: {
        type: { summary: 'ReactNode' },
      }
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
      table: {
        type: { summary: 'function' },
      }
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      }
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading spinner',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      }
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether button should take full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      }
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      description: 'Button type attribute',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'button' },
      }
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
      }
    },
    startIcon: {
      control: 'object',
      description: 'Icon to display before button text',
      table: {
        type: { summary: 'ReactNode' },
      }
    },
    endIcon: {
      control: 'object',
      description: 'Icon to display after button text',
      table: {
        type: { summary: 'ReactNode' },
      }
    }
  },
  args: {
    onClick: action('clicked'),
    children: 'Button'
  },
};

// Base story with all variants
export const Variants = {
  render: (args) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Primary</h3>
        <Button {...args} variant="primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Secondary</h3>
        <Button {...args} variant="secondary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Outline</h3>
        <Button {...args} variant="outline" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Ghost</h3>
        <Button {...args} variant="ghost" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Danger</h3>
        <Button {...args} variant="danger" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Success</h3>
        <Button {...args} variant="success" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants displayed together for comparison.'
      }
    }
  }
};

// Size variations
export const Sizes = {
  render: (args) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Extra Small (xs)</h3>
        <Button {...args} size="xs" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Small (sm)</h3>
        <Button {...args} size="sm" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Medium (md) - Default</h3>
        <Button {...args} size="md" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Large (lg)</h3>
        <Button {...args} size="lg" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Extra Large (xl)</h3>
        <Button {...args} size="xl" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes displayed together for comparison.'
      }
    }
  }
};

// State variations
export const States = {
  render: (args) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Default</h3>
        <Button {...args} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Disabled</h3>
        <Button {...args} disabled />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Loading</h3>
        <Button {...args} loading />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Full Width</h3>
        <Button {...args} fullWidth />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button states including disabled, loading, and full-width modes.'
      }
    }
  }
};

// Interactive playground
export const Playground = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all button props and combinations.'
      }
    }
  }
};

// With icons
export const WithIcons = {
  render: (args) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Start Icon</h3>
        <Button
          {...args}
          startIcon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
        >
          Success
        </Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">End Icon</h3>
        <Button
          {...args}
          endIcon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          }
        >
          Next
        </Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Both Icons</h3>
        <Button
          {...args}
          startIcon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          }
          endIcon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          }
        >
          Menu
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button examples with start icons, end icons, and both icons together.'
      }
    }
  }
};

// Form examples
export const FormExamples = {
  render: (args) => (
    <form className="space-y-4 max-w-md">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Submit Button
        </label>
        <Button {...args} type="submit" variant="primary">
          Submit Form
        </Button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Reset Button
        </label>
        <Button {...args} type="reset" variant="outline">
          Reset Form
        </Button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cancel Button
        </label>
        <Button {...args} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button examples in a form context with different types and purposes.'
      }
    }
  }
};
