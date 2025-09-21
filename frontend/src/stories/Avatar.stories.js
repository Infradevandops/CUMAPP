import { Avatar } from '../components/atoms';

export default {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible avatar component that displays user images or initials with multiple size options and fallback colors.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL'
    },
    alt: {
      control: 'text',
      description: 'Alt text for the image'
    },
    name: {
      control: 'text',
      description: 'Name to generate initials from'
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size'
    },
    fallbackColor: {
      control: 'text',
      description: 'Background color when no image is provided'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
};

export const Default = {
  args: {
    name: 'John Doe'
  },
};

export const WithImage = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    alt: 'Profile picture',
    name: 'John Doe'
  },
};

export const Sizes = {
  render: () => (
    <div className="flex items-end space-x-4">
      <Avatar size="xs" name="JD" />
      <Avatar size="sm" name="JD" />
      <Avatar size="md" name="JD" />
      <Avatar size="lg" name="JD" />
      <Avatar size="xl" name="JD" />
      <Avatar size="2xl" name="JD" />
    </div>
  ),
};

export const FallbackColors = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar name="JD" fallbackColor="bg-blue-500" />
      <Avatar name="JD" fallbackColor="bg-green-500" />
      <Avatar name="JD" fallbackColor="bg-purple-500" />
      <Avatar name="JD" fallbackColor="bg-red-500" />
      <Avatar name="JD" fallbackColor="bg-yellow-500" />
      <Avatar name="JD" fallbackColor="bg-indigo-500" />
    </div>
  ),
};

export const UserProfiles = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Avatar
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
          name="Sarah Johnson"
          size="lg"
        />
        <div>
          <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
          <p className="text-sm text-gray-600">Product Manager</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Avatar
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          name="Michael Chen"
          size="lg"
        />
        <div>
          <h4 className="font-semibold text-gray-900">Michael Chen</h4>
          <p className="text-sm text-gray-600">Software Engineer</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Avatar name="Emily Rodriguez" size="lg" fallbackColor="bg-pink-500" />
        <div>
          <h4 className="font-semibold text-gray-900">Emily Rodriguez</h4>
          <p className="text-sm text-gray-600">UX Designer</p>
        </div>
      </div>
    </div>
  ),
};

export const TeamGrid = {
  render: () => (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      <Avatar name="Alice" size="lg" fallbackColor="bg-blue-500" />
      <Avatar name="Bob" size="lg" fallbackColor="bg-green-500" />
      <Avatar name="Charlie" size="lg" fallbackColor="bg-purple-500" />
      <Avatar name="Diana" size="lg" fallbackColor="bg-red-500" />
      <Avatar name="Eve" size="lg" fallbackColor="bg-yellow-500" />
      <Avatar name="Frank" size="lg" fallbackColor="bg-indigo-500" />
    </div>
  ),
};

export const InitialsExamples = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar name="John Doe" size="md" />
        <span className="text-sm text-gray-600">Single space</span>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar name="Mary Jane Watson" size="md" />
        <span className="text-sm text-gray-600">Multiple words</span>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar name="A" size="md" />
        <span className="text-sm text-gray-600">Single character</span>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar name="" size="md" />
        <span className="text-sm text-gray-600">Empty name (fallback)</span>
      </div>
    </div>
  ),
};

export const CustomStyling = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar
        name="JD"
        size="lg"
        className="ring-2 ring-blue-500 ring-offset-2"
        fallbackColor="bg-gradient-to-br from-blue-500 to-purple-600"
      />
      <Avatar
        name="SM"
        size="lg"
        className="ring-2 ring-green-500 ring-offset-2"
        fallbackColor="bg-gradient-to-br from-green-500 to-teal-600"
      />
      <Avatar
        name="AR"
        size="lg"
        className="ring-2 ring-purple-500 ring-offset-2"
        fallbackColor="bg-gradient-to-br from-purple-500 to-pink-600"
      />
    </div>
  ),
};
