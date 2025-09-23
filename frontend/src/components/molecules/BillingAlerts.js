import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const BillingAlerts = ({
  alerts = [],
  settings = {},
  onUpdateSettings,
  onDismissAlert,
  onSnoozeAlert,
  className = '',
  ...props
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    usageThreshold: settings.usageThreshold || 80,
    costThreshold: settings.costThreshold || 100,
    emailNotifications: settings.emailNotifications !== false,
    smsNotifications: settings.smsNotifications || false,
    slackNotifications: settings.slackNotifications || false,
    webhookUrl: settings.webhookUrl || '',
    ...settings
  });

  const alertTypes = {
    usage: {
      icon: 'barChart',
      color: 'yellow',
      title: 'Usage Alert'
    },
    cost: {
      icon: 'dollarSign',
      color: 'red',
      title: 'Cost Alert'
    },
    payment: {
      icon: 'creditCard',
      color: 'red',
      title: 'Payment Alert'
    },
    limit: {
      icon: 'alertCircle',
      color: 'red',
      title: 'Limit Alert'
    },
    info: {
      icon: 'info',
      color: 'blue',
      title: 'Information'
    }
  };

  const getAlertColor = (type, severity = 'medium') => {
    const colors = {
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      }
    };
    
    return colors[alertTypes[type]?.color || 'blue'];
  };

  const handleSettingsChange = (key, value) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    onUpdateSettings?.(alertSettings);
    setShowSettings(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertPriority = (alert) => {
    if (alert.severity === 'high' || alert.type === 'payment') return 'high';
    if (alert.severity === 'medium' || alert.type === 'cost') return 'medium';
    return 'low';
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[getAlertPriority(a)];
    const bPriority = priorityOrder[getAlertPriority(b)];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Billing Alerts</h3>
          <p className="text-sm text-gray-600">
            Stay informed about your usage, costs, and billing status
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="flex items-center"
        >
          <Icon name="settings" size="sm" className="mr-2" />
          Alert Settings
        </Button>
      </div>

      {/* Active Alerts */}
      {sortedAlerts.length > 0 ? (
        <div className="space-y-3">
          {sortedAlerts.map((alert) => {
            const colors = getAlertColor(alert.type, alert.severity);
            
            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Icon 
                      name={alertTypes[alert.type]?.icon || 'info'} 
                      size="sm" 
                      className={`mt-0.5 mr-3 ${colors.icon}`} 
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`text-sm font-medium ${colors.text}`}>
                          {alertTypes[alert.type]?.title || 'Alert'}
                        </h4>
                        {alert.severity === 'high' && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                            High Priority
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm ${colors.text} mb-2`}>
                        {alert.message}
                      </p>
                      
                      {alert.details && (
                        <div className={`text-xs ${colors.text} opacity-75 mb-2`}>
                          {alert.details}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDate(alert.createdAt)}</span>
                        {alert.category && (
                          <span className="capitalize">{alert.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {alert.actionUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(alert.actionUrl, '_blank')}
                        className={`${colors.border} ${colors.text} hover:${colors.bg}`}
                      >
                        {alert.actionText || 'View Details'}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSnoozeAlert?.(alert.id)}
                      title="Snooze for 24 hours"
                    >
                      <Icon name="clock" size="sm" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissAlert?.(alert.id)}
                      title="Dismiss alert"
                    >
                      <Icon name="x" size="sm" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Icon name="check" size="lg" className="text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All good!</h3>
          <p className="text-gray-600">No active billing alerts at the moment</p>
        </div>
      )}

      {/* Alert Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alert Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <Icon name="x" size="sm" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Threshold Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Alert Thresholds</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Alert Threshold
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={alertSettings.usageThreshold}
                        onChange={(e) => handleSettingsChange('usageThreshold', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {alertSettings.usageThreshold}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Get notified when usage reaches this percentage of your plan limit
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Cost Alert ($)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={alertSettings.costThreshold}
                      onChange={(e) => handleSettingsChange('costThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get notified when monthly costs exceed this amount
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Notification Channels */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.emailNotifications}
                      onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.smsNotifications}
                      onChange={(e) => handleSettingsChange('smsNotifications', e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alertSettings.slackNotifications}
                      onChange={(e) => handleSettingsChange('slackNotifications', e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Slack notifications</span>
                  </label>
                </div>
              </div>
              
              {/* Webhook Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Webhook Integration</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL (optional)
                  </label>
                  <input
                    type="url"
                    value={alertSettings.webhookUrl}
                    onChange={(e) => handleSettingsChange('webhookUrl', e.target.value)}
                    placeholder="https://your-app.com/webhooks/billing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Receive billing alerts via webhook for integration with your systems
                  </p>
                </div>
              </div>
              
              {/* Alert Types */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Alert Types</h4>
                <div className="space-y-2">
                  {Object.entries(alertTypes).map(([type, config]) => (
                    <label key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon name={config.icon} size="sm" className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{config.title}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={alertSettings[`${type}Alerts`] !== false}
                        onChange={(e) => handleSettingsChange(`${type}Alerts`, e.target.checked)}
                        className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Icon name="bell" size="sm" className="mr-1" />
            Test Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="download" size="sm" className="mr-1" />
            Export Alert History
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="refresh" size="sm" className="mr-1" />
            Check Usage Now
          </Button>
        </div>
      </div>
    </div>
  );
};

BillingAlerts.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(['usage', 'cost', 'payment', 'limit', 'info']).isRequired,
    severity: PropTypes.oneOf(['low', 'medium', 'high']),
    message: PropTypes.string.isRequired,
    details: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    category: PropTypes.string,
    actionUrl: PropTypes.string,
    actionText: PropTypes.string
  })),
  settings: PropTypes.object,
  onUpdateSettings: PropTypes.func,
  onDismissAlert: PropTypes.func,
  onSnoozeAlert: PropTypes.func,
  className: PropTypes.string
};

export default BillingAlerts;