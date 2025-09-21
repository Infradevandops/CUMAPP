import React, { useState } from 'react';
import Modal from '../components/molecules/Modal';
import { Button } from '../components/atoms';

export default {
  title: 'Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible modal component with multiple sizes, overlay click handling, and compound components for structured content.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility'
    },
    title: {
      control: 'text',
      description: 'Modal title'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size'
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header'
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Close modal when clicking overlay'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
};

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p className="text-gray-600">
          This is a sample modal content. You can put any content here including forms,
          images, or other components.
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Default Modal',
  children: 'This is the default modal content.'
};

export const Sizes = () => {
  const [selectedSize, setSelectedSize] = useState('md');
  const [isOpen, setIsOpen] = useState(false);

  const sizes = [
    { key: 'sm', label: 'Small', width: 'max-w-md' },
    { key: 'md', label: 'Medium', width: 'max-w-lg' },
    { key: 'lg', label: 'Large', width: 'max-w-2xl' },
    { key: 'xl', label: 'Extra Large', width: 'max-w-4xl' },
    { key: 'full', label: 'Full Width', width: 'max-w-full mx-4' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Button
            key={size.key}
            variant={selectedSize === size.key ? 'primary' : 'outline'}
            onClick={() => setSelectedSize(size.key)}
          >
            {size.label}
          </Button>
        ))}
      </div>

      <Button onClick={() => setIsOpen(true)}>Open {sizes.find(s => s.key === selectedSize)?.label} Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${sizes.find(s => s.key === selectedSize)?.label} Modal`}
        size={selectedSize}
      >
        <p className="text-gray-600 mb-4">
          This modal demonstrates the <strong>{selectedSize.toUpperCase()}</strong> size variant.
          The modal width adjusts based on the selected size.
        </p>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600">
            Modal content area adapts to the container size while maintaining proper spacing and layout.
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export const WithoutCloseButton = Template.bind({});
WithoutCloseButton.args = {
  title: 'Modal Without Close Button',
  showCloseButton: false,
  children: 'This modal has no close button in the header.'
};

export const WithoutOverlayClick = Template.bind({});
WithoutOverlayClick.args = {
  title: 'Modal Without Overlay Click',
  closeOnOverlayClick: false,
  children: 'This modal cannot be closed by clicking the overlay.'
};

export const SimpleAlert = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Show Alert</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Alert"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Warning</h3>
          <p className="text-sm text-gray-600 mb-4">
            This is an important alert message that requires your attention.
          </p>
          <Button onClick={() => setIsOpen(false)} className="w-full">
            I Understand
          </Button>
        </div>
      </Modal>
    </>
  );
};

export const ConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Delete Item</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="text-2xl">🗑️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Item</h3>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setIsOpen(false)} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const FormModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Form</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Contact Form"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export const CompoundComponents = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal with Compound Components</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Compound Modal">
        <Modal.Header>
          <h3 className="text-lg font-medium text-gray-900">Custom Header</h3>
          <p className="text-sm text-gray-600">This header is using the compound component pattern.</p>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-600">
              The compound component pattern allows for more flexible and semantic modal structures.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Better semantic structure</li>
                <li>• More flexible styling options</li>
                <li>• Clear separation of concerns</li>
                <li>• Easier to customize</li>
              </ul>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const NestedModals = () => {
  const [isOuterOpen, setIsOuterOpen] = useState(false);
  const [isInnerOpen, setIsInnerOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOuterOpen(true)}>Open Nested Modals</Button>

      <Modal
        isOpen={isOuterOpen}
        onClose={() => setIsOuterOpen(false)}
        title="Outer Modal"
        size="lg"
      >
        <p className="text-gray-600 mb-4">
          This is the outer modal. You can open an inner modal from here.
        </p>
        <Button onClick={() => setIsInnerOpen(true)}>Open Inner Modal</Button>

        <Modal
          isOpen={isInnerOpen}
          onClose={() => setIsInnerOpen(false)}
          title="Inner Modal"
          size="sm"
        >
          <p className="text-gray-600 mb-4">
            This is the inner modal. It's nested within the outer modal.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsInnerOpen(false)}>
              Close Inner
            </Button>
            <Button onClick={() => {
              setIsInnerOpen(false);
              setIsOuterOpen(false);
            }}>
              Close Both
            </Button>
          </div>
        </Modal>
      </Modal>
    </>
  );
};