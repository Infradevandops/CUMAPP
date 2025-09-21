import { fn } from 'storybook/test';
import { Input } from '../components/atoms';

export default {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with various types, states, and validation support.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input type'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Input size'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled'
    },
    error: {
      control: 'boolean',
      description: 'Whether to show error state'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
    onFocus: { action: 'focused' }
  },
  args: { onChange: fn() },
};

export const Default = {
  args: {
    placeholder: 'Enter text here...'
  },
};

export const Email = {
  args: {
    type: 'email',
    placeholder: 'user@example.com'
  },
};

export const Password = {
  args: {
    type: 'password',
    placeholder: 'Enter password'
  },
};

export const Number = {
  args: {
    type: 'number',
    placeholder: 'Enter number'
  },
};

export const Search = {
  args: {
    type: 'search',
    placeholder: 'Search...'
  },
};

export const Disabled = {
  args: {
    placeholder: 'Disabled input',
    disabled: true
  },
};

export const Error = {
  args: {
    placeholder: 'Enter valid email',
    error: true
  },
};

export const WithHelperText = {
  args: {
    placeholder: 'Choose a username'
  },
};

export const Required = {
  args: {
    placeholder: 'Enter your full name'
  },
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};

export const FormExample = {
  render: () => (
    <form style={{ width: '400px', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Input
          placeholder="Enter first name"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Input
          type="email"
          placeholder="Enter email address"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Input
          type="tel"
          placeholder="Enter phone number"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <Input
          type="password"
          placeholder="Enter password"
        />
      </div>
      <button
        type="submit"
        style={{
          background: '#dc2626',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Submit Form
      </button>
    </form>
  ),
};