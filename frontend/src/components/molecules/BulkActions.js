import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const BulkActions = ({
  selectedItems = [],
  totalItems = 0,
  onSelectAll,
  onDeselectAll,
  onBulkAction,
  actions = [],
  className = '',
  ...props
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const defaultActions = [
    {
      id: 'release',
      label: 'Release Numbers',
      icon: 'trash',
      variant: 'outline',
      color: 'red',
      confirmMessage: 'Are you sure you want to release the selected phone numbers? This action cannot be undone.',
      requiresConfirmation: true
    },
    {
      id: 'extend',
      label: 'Extend Lease',
      icon: 'calendar',
      variant: 'outline',
      color: 'blue',
      confirmMessage: 'Extend the lease for selected phone numbers by 30 days?',
      requiresConfirmation: true
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: 'play',
      variant: 'outline',
      color: 'green',
      confirmMessage: 'Activate the selected phone numbers?',
      requiresConfirmation: false
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: 'pause',
      variant: 'outline',
      color: 'yellow',
      confirmMessage: 'Deactivate the selected phone numbers?',
      requiresConfirmation: true
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'download',
      variant: 'outline',
      color: 'gray',
      confirmMessage: null,
      requiresConfirmation: false
    },
    {
      id: 'tag',
      label: 'Add Tags',
      icon: 'tag',
      variant: 'outline',
      color: 'purple',
      confirmMessage: null,
      requiresConfirmation: false
    }
  ];

  const availableActions = actions.length > 0 ? actions : defaultActions;
  const isAllSelected = selectedItems.length === totalItems && totalItems > 0;
  const isSomeSelected = selectedItems.length > 0 && selectedItems.length < totalItems;

  const handleActionClick = (action) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmDialog(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action) => {
    onBulkAction?.(action.id, selectedItems);
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const getActionButtonClass = (action) => {
    const baseClass = "flex items-center space-x-1";
    const colorClasses = {
      red: 'border-red-300 text-red-700 hover:bg-red-50',
      blue: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      green: 'border-green-300 text-green-700 hover:bg-green-50',
      yellow: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50',
      purple: 'border-purple-300 text-purple-700 hover:bg-purple-50',
      gray: 'border-gray-300 text-gray-700 hover:bg-gray-50'
    };
    
    return `${baseClass} ${colorClasses[action.color] || colorClasses.gray}`;
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`} {...props}>
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="check" size="sm" className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} of {totalItems} selected
              </span>
            </div>
            
            {/* Select All/None */}
            <div className="flex items-center space-x-2">
              {!isAllSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  Select All ({totalItems})
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                className="text-blue-700 hover:bg-blue-100"
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            {availableActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleActionClick(action)}
                className={getActionButtonClass(action)}
                disabled={selectedItems.length === 0}
              >
                <Icon name={action.icon} size="sm" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-blue-700 mb-1">
            <span>Selection Progress</span>
            <span>{Math.round((selectedItems.length / totalItems) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedItems.length / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  pendingAction.color === 'red' ? 'bg-red-100' : 
                  pendingAction.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <Icon 
                    name={pendingAction.icon} 
                    size="sm" 
                    className={
                      pendingAction.color === 'red' ? 'text-red-600' : 
                      pendingAction.color === 'yellow' ? 'text-yellow-600' : 'text-blue-600'
                    } 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm {pendingAction.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-6">
                {pendingAction.confirmMessage}
              </p>
              
              {/* Selected Items Preview */}
              {selectedItems.length <= 5 ? (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Selected Items:</h4>
                  <div className="space-y-1">
                    {selectedItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {item.phone_number || item.id}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-xs text-gray-600">
                    {selectedItems.length} items selected (showing first 3):
                  </p>
                  <div className="space-y-1 mt-2">
                    {selectedItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        {item.phone_number || item.id}
                      </div>
                    ))}
                    {selectedItems.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        ...and {selectedItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className={
                  pendingAction.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                  pendingAction.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }
              >
                Confirm {pendingAction.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

BulkActions.propTypes = {
  selectedItems: PropTypes.array,
  totalItems: PropTypes.number,
  onSelectAll: PropTypes.func,
  onDeselectAll: PropTypes.func,
  onBulkAction: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    variant: PropTypes.string,
    color: PropTypes.string,
    confirmMessage: PropTypes.string,
    requiresConfirmation: PropTypes.bool
  })),
  className: PropTypes.string
};

export default BulkActions;