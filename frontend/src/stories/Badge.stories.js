import { Badge } from '../components/atoms';

export default {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible badge component for displaying status, labels, or counts with multiple variants and sizes.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
      description: 'Badge color variant'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Badge size'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
};

export const Default = {
  args: {
    children: 'Default'
  },
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary'
  },
};

export const Success = {
  args: {
    variant: 'success',
    children: 'Success'
  },
};

export const Warning = {
  args: {
    variant: 'warning',
    children: 'Warning'
  },
};

export const Error = {
  args: {
    variant: 'error',
    children: 'Error'
  },
};

export const Info = {
  args: {
    variant: 'info',
    children: 'Info'
  },
};

export const Sizes = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const VariantsGrid = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const StatusBadges = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Status:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Status:</span>
        <Badge variant="warning">Pending</Badge>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Status:</span>
        <Badge variant="error">Inactive</Badge>
      </div>
    </div>
  ),
};

export const CountBadges = {
  render: () => (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          🔔
        </div>
        <Badge
          variant="error"
          className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center px-1"
        >
          3
        </Badge>
      </div>

      <div className="relative">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          📧
        </div>
        <Badge
          variant="primary"
          className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center px-1"
        >
          12
        </Badge>
      </div>

      <div className="relative">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          💬
        </div>
        <Badge
          variant="success"
          className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center px-1"
        >
          5
        </Badge>
      </div>
    </div>
  ),
};

export const CategoryBadges = {
  render: () => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">Technology</Badge>
        <Badge variant="success">Health</Badge>
        <Badge variant="warning">Finance</Badge>
        <Badge variant="error">Urgent</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary">New</Badge>
        <Badge variant="default">Archive</Badge>
        <Badge variant="info">Featured</Badge>
      </div>
    </div>
  ),
};

export const CustomStyling = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Badge
        variant="success"
        className="bg-gradient-to-r from-green-400 to-green-600 text-white border-0"
      >
        Premium
      </Badge>
      <Badge
        variant="primary"
        className="bg-gradient-to-r from-red-400 to-red-600 text-white border-0 shadow-lg"
      >
        Hot
      </Badge>
      <Badge
        variant="info"
        className="bg-gradient-to-r from-blue-400 to-purple-600 text-white border-0"
      >
        Special
      </Badge>
    </div>
  ),
};

export const InteractiveExample = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Task Management</h4>
          <p className="text-sm text-gray-600">Complete your daily tasks</p>
        </div>
        <Badge variant="success">Complete</Badge>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Email Campaign</h4>
          <p className="text-sm text-gray-600">Send newsletter to subscribers</p>
        </div>
        <Badge variant="warning">In Progress</Badge>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h4 className="font-semibold">Bug Report</h4>
          <p className="text-sm text-gray-600">Fix critical application bug</p>
        </div>
        <Badge variant="error">Urgent</Badge>
      </div>
    </div>
  ),
};