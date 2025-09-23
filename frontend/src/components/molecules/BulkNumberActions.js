import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const BulkNumberActions = ({
  selectedNumbers = [],
  onAction,
  onSelectionChange,
  availableActions = ['activate', 'deactivate', 'delete', 'assign', 'release', 'export'],
  showProgress = true,
  className = '',
  ...props
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const actionConfigs = {
    activate: {
      label: 'Activate Numbers',
      icon: 'play',
      color: 'green',
      description: 'Make selected numbers active and available for use',
      requiresConfirmation: false,
      batchSize: 10
    },
    deactivate: {
      label: 'Deactivate Numbers',
      icon: 'pause',
      color: 'yellow',
      description: 'Temporarily disable selected numbers',
      requiresConfirmation: true,
      batchSize: 10
    },
    delete: {
      label: 'Delete Numbers',
      icon: 'trash',
      color: 'red',
      description: 'Permanently remove selected numbers from your account',
      requiresConfirmation: true,
      batchSize: 5
    },
    assign: {
      label: 'Assign to Campaign',
      icon: 'userPlus',
      color: 'blue',
      description: 'Assign selected numbers to a specific campaign',
      requiresConfirmation: false,
      batchSize: 20
    },
    release: {
      label: 'Release Numbers',
      icon: 'userMinus',
      color: 'purple',
      description: 'Release selected numbers from current assignments',
      requiresConfirmation: true,
      batchSize: 15
    },
    export: {
      label: 'Export Numbers',
      icon: 'download',
      color: 'gray',
      description: 'Export selected numbers to CSV or other formats',
      requiresConfirmation: false,
      batchSize: 100
    },
    rotate: {
      label: 'Rotate Numbers',
      icon: 'refreshCw',
      color: 'indigo',
      description: 'Automatically rotate numbers for better delivery',
      requiresConfirmation: false,
      batchSize: 25
    },
    analyze: {
      label: 'Analyze Performance',
      icon: 'barChart',
      color: 'teal',
      description: 'Generate performance analysis for selected numbers',
      requiresConfirmation: false,
      batchSize: 50
    }
  };

  useEffect(() => {
    if (isProcessing && currentAction) {
      simulateProgress();
    }
  }, [isProcessing, currentAction]);

  const simulateProgress = () => {
    const action = actionConfigs[currentAction];
    const totalNumbers = selectedNumbers.length;
    const batchSize = action.batchSize;
    const totalBatches = Math.ceil(totalNumbers / batchSize);
    
    let currentBatch = 0;
    const interval = setInterval(() => {
      currentBatch++;
      const newProgress = (currentBatch / totalBatches) * 100;
      setProgress(newProgress);
      
      if (currentBatch >= totalBatches) {
        clearInterval(interval);
        completeAction();
      }
    }, 500); // Simulate processing time
  };

  const completeAction = () => {
    const successCount = Math.floor(selectedNumbers.length * 0.95); // 95% success rate
    const failureCount = selectedNumbers.length - successCount;
    
    setResults({
      success: successCount,
      failed: failureCount,
      total: selectedNumbers.length,
      action: currentAction
    });
    
    setIsProcessing(false);
    setCurrentAction(null);
    setProgress(0);
    
    // Clear selection after successful action
    if (successCount > 0) {
      onSelectionChange?.([]);
    }
  };

  const handleActionClick = (actionType) => {
    const action = actionConfigs[actionType];
    
    if (action.requiresConfirmation) {
      setPendingAction(actionType);
      setShowConfirmDialog(true);
    } else {
      executeAction(actionType);
    }
  };

  const executeAction = (actionType) => {
    setCurrentAction(actionType);
    setIsProcessing(true);
    setResults(null);
    setShowConfirmDialog(false);
    setPendingAction(null);
    
    // Call the parent action handler
    onAction?.(actionType, selectedNumbers);
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleSelectAll = () => {
    // This would typically be handled by the parent component
    console.log('Select all numbers');
  };

  const handleClearSelection = () => {
    onSelectionChange?.([]);
  };

  const getActionButton = (actionType) => {
    const action = actionConfigs[actionType];
    const isDisabled = selectedNumbers.length === 0 || isProcessing;
    
    return (
      <Button
        key={actionType}
        variant={action.color === 'red' ? 'outline' : 'primary'}
        size="sm"
        onClick={() => handleActionClick(actionType)}
        disabled={isDisabled}
        className={`
          ${action.color === 'red' ? 'border-red-300 text-red-700 hover:bg-red-50' : ''}
          ${action.color === 'green' ? 'bg-green-600 hover:bg-green-700' : ''}
          ${action.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          ${action.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          ${action.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          ${action.color === 'gray' ? 'bg-gray-600 hover:bg-gray-700' : ''}
          ${action.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          ${action.color === 'teal' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        `}
        title={action.description}
      >
        <Icon name={action.icon} size="sm" className="mr-1" />
        {action.label}
      </Button>
    );
  };

  const formatActionResult = (result) => {
    const action = actionConfigs[result.action];
    return `${action.label}: ${result.success} successful, ${result.failed} failed out of ${result.total} numbers`;
  };

  if (selectedNumbers.length === 0 && !results) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 text-center ${className}`}>
        <Icon name="mousePointer" size="lg" className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Select phone numbers to perform bulk actions</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="layers" size="sm" className="text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">Bulk Actions</h3>
              <p className="text-sm text-gray-600">
                {selectedNumbers.length} number{selectedNumbers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={isProcessing}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              disabled={isProcessing}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {availableActions.map(actionType => getActionButton(actionType))}
        </div>
      </div>

      {/* Progress Indicator */}
      {isProcessing && showProgress && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Processing {actionConfigs[currentAction]?.label}...
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Processing {selectedNumbers.length} numbers in batches...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="px-4 pb-4">
          <div className={`rounded-lg p-4 ${
            results.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start space-x-3">
              <Icon 
                name={results.failed === 0 ? 'checkCircle' : 'alertTriangle'} 
                size="sm" 
                className={results.failed === 0 ? 'text-green-600' : 'text-yellow-600'}
              />
              <div className="flex-1">
                <h4 className={`font-medium ${
                  results.failed === 0 ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  Action Completed
                </h4>
                <p className={`text-sm mt-1 ${
                  results.failed === 0 ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {formatActionResult(results)}
                </p>
                
                {results.failed > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => console.log('View failed items')}
                    >
                      View Failed Items
                    </Button>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setResults(null)}
              >
                <Icon name="x" size="xs" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Numbers Preview */}
      {selectedNumbers.length > 0 && selectedNumbers.length <= 10 && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Numbers:</h4>
            <div className="flex flex-wrap gap-1">
              {selectedNumbers.map(number => (
                <span
                  key={number.id}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {number.number}
                  <button
                    onClick={() => {
                      const newSelection = selectedNumbers.filter(n => n.id !== number.id);
                      onSelectionChange?.(newSelection);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <Icon name="x" size="xs" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Icon 
                  name="alertTriangle" 
                  size="lg" 
                  className="text-yellow-600" 
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Action
                </h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to {actionConfigs[pendingAction].label.toLowerCase()} {selectedNumbers.length} phone number{selectedNumbers.length !== 1 ? 's' : ''}?
              </p>
              
              <p className="text-sm text-gray-500 mb-6">
                {actionConfigs[pendingAction].description}
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelAction}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmAction}
                  className={
                    actionConfigs[pendingAction].color === 'red' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : ''
                  }
                >
                  Confirm {actionConfigs[pendingAction].label}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BulkNumberActions.propTypes = {
  selectedNumbers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    number: PropTypes.string.isRequired,
    status: PropTypes.string
  })),
  onAction: PropTypes.func.isRequired,
  onSelectionChange: PropTypes.func,
  availableActions: PropTypes.arrayOf(PropTypes.string),
  showProgress: PropTypes.bool,
  className: PropTypes.string
};

export default BulkNumberActions;