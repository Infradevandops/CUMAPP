import { Card } from '../components/atoms';

export default {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible card component with multiple variants, padding options, and shadow effects. Supports compound components for structured content.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'elevated'],
      description: 'Card visual style variant'
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Internal padding of the card'
    },
    shadow: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Shadow depth of the card'
    },
    hover: {
      control: 'boolean',
      description: 'Enable hover effect for shadow increase'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
};

export const Default = {
  args: {
    children: 'This is a default card with medium padding and shadow.'
  },
};

export const Outlined = {
  args: {
    variant: 'outlined',
    children: 'This is an outlined card variant.'
  },
};

export const Elevated = {
  args: {
    variant: 'elevated',
    children: 'This is an elevated card variant with subtle styling.'
  },
};

export const NoShadow = {
  args: {
    shadow: 'none',
    children: 'Card without any shadow effect.'
  },
};

export const SmallShadow = {
  args: {
    shadow: 'sm',
    children: 'Card with small shadow effect.'
  },
};

export const LargeShadow = {
  args: {
    shadow: 'lg',
    children: 'Card with large shadow effect.'
  },
};

export const ExtraLargeShadow = {
  args: {
    shadow: 'xl',
    children: 'Card with extra large shadow effect.'
  },
};

export const NoPadding = {
  args: {
    padding: 'none',
    children: 'Card with no internal padding.'
  },
};

export const SmallPadding = {
  args: {
    padding: 'sm',
    children: 'Card with small internal padding.'
  },
};

export const LargePadding = {
  args: {
    padding: 'lg',
    children: 'Card with large internal padding.'
  },
};

export const ExtraLargePadding = {
  args: {
    padding: 'xl',
    children: 'Card with extra large internal padding.'
  },
};

export const WithHover = {
  args: {
    hover: true,
    children: 'Card with hover effect - hover to see shadow increase.'
  },
};

export const CustomStyling = {
  args: {
    className: 'border-blue-500 bg-blue-50',
    children: 'Card with custom CSS classes applied.'
  },
};

export const WithHeader = {
  render: () => (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">Card Title</h3>
        <p className="text-sm text-gray-600">Card subtitle or description</p>
      </Card.Header>
      <Card.Content>
        <p>This card uses the compound component pattern with separate header, content, and footer sections.</p>
      </Card.Content>
      <Card.Footer>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Action Button
        </button>
      </Card.Footer>
    </Card>
  ),
};

export const ProductCard = {
  render: () => (
    <Card className="max-w-sm">
      <Card.Content>
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📱</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Smartphone</h3>
        <p className="text-gray-600 text-sm mb-4">
          High-quality smartphone with advanced features and premium build quality.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">$999</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </Card.Content>
    </Card>
  ),
};

export const ProfileCard = {
  render: () => (
    <Card className="max-w-md">
      <Card.Content>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-semibold">JD</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
            <p className="text-gray-600">Senior Software Engineer</p>
            <p className="text-sm text-gray-500">San Francisco, CA</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-700 text-sm">
            Passionate about creating beautiful and functional user experiences.
            5+ years of experience in React and modern web technologies.
          </p>
        </div>
      </Card.Content>
    </Card>
  ),
};

export const VariantsGrid = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <Card.Header>
          <h4 className="font-semibold">Default Card</h4>
        </Card.Header>
        <Card.Content>
          <p className="text-sm text-gray-600">Standard card styling with default variant.</p>
        </Card.Content>
      </Card>

      <Card variant="outlined">
        <Card.Header>
          <h4 className="font-semibold">Outlined Card</h4>
        </Card.Header>
        <Card.Content>
          <p className="text-sm text-gray-600">Card with outlined border style.</p>
        </Card.Content>
      </Card>

      <Card variant="elevated">
        <Card.Header>
          <h4 className="font-semibold">Elevated Card</h4>
        </Card.Header>
        <Card.Content>
          <p className="text-sm text-gray-600">Card with elevated subtle styling.</p>
        </Card.Content>
      </Card>
    </div>
  ),
};

export const ShadowsGrid = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card shadow="none">
        <Card.Content>
          <p className="text-center text-sm">No Shadow</p>
        </Card.Content>
      </Card>

      <Card shadow="sm">
        <Card.Content>
          <p className="text-center text-sm">Small</p>
        </Card.Content>
      </Card>

      <Card shadow="md">
        <Card.Content>
          <p className="text-center text-sm">Medium</p>
        </Card.Content>
      </Card>

      <Card shadow="lg">
        <Card.Content>
          <p className="text-center text-sm">Large</p>
        </Card.Content>
      </Card>

      <Card shadow="xl">
        <Card.Content>
          <p className="text-center text-sm">Extra Large</p>
        </Card.Content>
      </Card>
    </div>
  ),
};