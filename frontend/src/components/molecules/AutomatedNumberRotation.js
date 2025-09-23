import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const AutomatedNumberRotation = ({
  phoneNumbers = [],
  onRotationUpdate,
  onConfigurationSave,
  className = '',
  ...props
}) => {
  const [rotationConfig, setRotationConfig] = useState({
    enabled: false,
    strategy: 'performance_based',
    thresholds: {
      delivery_rate: 85,
      spam_score: 5,
      response_rate: 10,
      cost_per_message: 0.08
    },
    rotation_frequency: 'daily',
    backup_pool_size: 3,
    notification_settings: {
      email_alerts: true,
      slack_notifications: false,
      webhook_url: ''
    },
    advanced_settings: {
      warmup_period: 24,
      cooldown_period: 72,
      max_rotations_per_day: 5,
      preserve_high_performers: true
    }
  });

  const [rotationHistory, setRotationHistory] = useState([]);
  const [activeRotations, setActiveRotations] = useState([]);
  const [rotationStats, setRotationStats] = useState({});
  const [isConfiguring, setIsConfiguring] = useState(false);

  const strategies = {
    performance_based: {
      name: 'Performance Based',
      description: 'Rotate numbers based on delivery rates, spam scores, and response rates',
      icon: 'trendingUp',
      color: 'blue'
    },
    round_robin: {
      name: 'Round Robin',
      description: 'Evenly distribute traffic across all available numbers',
      icon: 'rotate',
      color: 'green'
    },
    cost_optimized: {
      name: 'Cost Optimized',
      description: 'Prioritize numbers with lower cost per message',
      icon: 'dollarSign',
      color: 'yellow'
    },
    geographic: {
      name: 'Geographic',
      description: 'Route based on recipient location and number origin',
      icon: 'map',
      color: 'purple'
    },
    time_based: {
      name: 'Time Based',
      description: 'Rotate numbers based on time zones and business hours',
      icon: 'clock',
      color: 'indigo'
    }
  };

  const frequencies = [
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom Schedule' }
  ];

  useEffect(() => {
    generateRotationStats();
    loadRotationHistory();
  }, [phoneNumbers, rotationConfig]);

  const generateRotationStats = () => {
    const stats = {
      total_numbers: phoneNumbers.length,
      active_in_rotation: phoneNumbers.filter(n => n.status === 'active').length,
      pending_rotation: Math.floor(Math.random() * 3),
      avg_performance_improvement: 12.5,
      cost_savings: 8.3,
      delivery_rate_improvement: 4.2
    };
    setRotationStats(stats);
  };

  const loadRotationHistory = () => {
    // Mock rotation history
    const history = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: 'rotated_out',
        number: '+1-555-0123',
        reason: 'Low delivery rate (82%)',
        replacement: '+1-555-0199',
        impact: '+5.2% delivery improvement'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        action: 'rotated_in',
        number: '+1-555-0156',
        reason: 'Warmup period completed',
        replacement: null,
        impact: 'Added to active pool'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        action: 'rotated_out',
        number: '+44-20-7946-0958',
        reason: 'High spam score (6.2)',
        replacement: '+44-20-7946-0999',
        impact: '-2.1 spam score improvement'
      }
    ];
    setRotationHistory(history);
  };

  const handleConfigurationChange = (section, key, value) => {
    setRotationConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveConfiguration = () => {
    onConfigurationSave?.(rotationConfig);
    setIsConfiguring(false);
    
    // Show success notification
    if (window.showNotification) {
      window.showNotification({
        type: 'success',
        title: 'Configuration Saved',
        message: 'Automated rotation settings have been updated successfully.'
      });
    }
  };

  const handleManualRotation = (numberId) => {
    const number = phoneNumbers.find(n => n.id === numberId);
    if (!number) return;

    // Simulate manual rotation
    const newRotation = {
      id: Date.now(),
      timestamp: new Date(),
      action: 'manual_rotation',
      number: number.number,
      reason: 'Manual rotation requested',
      replacement: 'Selecting optimal replacement...',
      impact: 'Pending analysis'
    };

    setRotationHistory(prev => [newRotation, ...prev]);
    onRotationUpdate?.(newRotation);

    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        title: 'Manual Rotation Started',
        message: `Rotating ${number.number} - replacement will be selected automatically.`
      });
    }
  };

  const handleTestRotation = () => {
    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        title: 'Test Rotation Started',
        message: 'Running test rotation with current configuration...'
      });
    }

    // Simulate test rotation
    setTimeout(() => {
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: 'Test Completed',
          message: 'Test rotation completed successfully. Configuration is working properly.'
        });
      }
    }, 3000);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'rotated_out': return 'arrowDown';
      case 'rotated_in': return 'arrowUp';
      case 'manual_rotation': return 'user';
      default: return 'rotate';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'rotated_out': return 'text-red-600';
      case 'rotated_in': return 'text-green-600';
      case 'manual_rotation': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              rotationConfig.enabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Icon 
                name="refresh" 
                size="sm" 
                className={rotationConfig.enabled ? 'text-green-600' : 'text-gray-400'}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Automated Number Rotation</h3>
              <p className="text-sm text-gray-600">
                {rotationConfig.enabled ? 'Active' : 'Inactive'} • {strategies[rotationConfig.strategy].name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestRotation}
              disabled={!rotationConfig.enabled}
            >
              <Icon name="play" size="sm" className="mr-1" />
              Test Rotation
            </Button>
            
            <Button
              variant={isConfiguring ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsConfiguring(!isConfiguring)}
            >
              <Icon name="settings" size="sm" className="mr-1" />
              Configure
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{rotationStats.active_in_rotation}</div>
            <div className="text-sm text-gray-600">Active Numbers</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{rotationStats.pending_rotation}</div>
            <div className="text-sm text-gray-600">Pending Rotation</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+{rotationStats.avg_performance_improvement}%</div>
            <div className="text-sm text-gray-600">Avg Improvement</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${rotationStats.cost_savings}K</div>
            <div className="text-sm text-gray-600">Cost Savings</div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {isConfiguring && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Rotation Configuration</h4>
          
          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Enable Automated Rotation</h5>
                <p className="text-sm text-gray-600">Automatically rotate underperforming numbers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rotationConfig.enabled}
                  onChange={(e) => setRotationConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Rotation Strategy</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(strategies).map(([key, strategy]) => (
                  <button
                    key={key}
                    onClick={() => setRotationConfig(prev => ({ ...prev, strategy: key }))}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      rotationConfig.strategy === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon name={strategy.icon} size="sm" className={`text-${strategy.color}-600`} />
                      <span className="font-medium text-gray-900">{strategy.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Thresholds */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Performance Thresholds</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minimum Delivery Rate (%)</label>
                  <input
                    type="number"
                    value={rotationConfig.thresholds.delivery_rate}
                    onChange={(e) => handleConfigurationChange('thresholds', 'delivery_rate', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Maximum Spam Score</label>
                  <input
                    type="number"
                    value={rotationConfig.thresholds.spam_score}
                    onChange={(e) => handleConfigurationChange('thresholds', 'spam_score', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minimum Response Rate (%)</label>
                  <input
                    type="number"
                    value={rotationConfig.thresholds.response_rate}
                    onChange={(e) => handleConfigurationChange('thresholds', 'response_rate', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Maximum Cost per Message ($)</label>
                  <input
                    type="number"
                    value={rotationConfig.thresholds.cost_per_message}
                    onChange={(e) => handleConfigurationChange('thresholds', 'cost_per_message', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rotation Frequency</label>
              <select
                value={rotationConfig.rotation_frequency}
                onChange={(e) => setRotationConfig(prev => ({ ...prev, rotation_frequency: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Advanced Settings</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Warmup Period (hours)</label>
                  <input
                    type="number"
                    value={rotationConfig.advanced_settings.warmup_period}
                    onChange={(e) => handleConfigurationChange('advanced_settings', 'warmup_period', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Cooldown Period (hours)</label>
                  <input
                    type="number"
                    value={rotationConfig.advanced_settings.cooldown_period}
                    onChange={(e) => handleConfigurationChange('advanced_settings', 'cooldown_period', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Rotations per Day</label>
                  <input
                    type="number"
                    value={rotationConfig.advanced_settings.max_rotations_per_day}
                    onChange={(e) => handleConfigurationChange('advanced_settings', 'max_rotations_per_day', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Backup Pool Size</label>
                  <input
                    type="number"
                    value={rotationConfig.backup_pool_size}
                    onChange={(e) => setRotationConfig(prev => ({ ...prev, backup_pool_size: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsConfiguring(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveConfiguration}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Recent Rotation Activity</h4>
        </div>
        
        <div className="p-6">
          {rotationHistory.length > 0 ? (
            <div className="space-y-4">
              {rotationHistory.map(entry => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border ${getActionColor(entry.action)}`}>
                    <Icon name={getActionIcon(entry.action)} size="sm" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.number} {entry.action.replace('_', ' ')}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                    {entry.replacement && (
                      <p className="text-sm text-blue-600 mt-1">
                        → Replaced with {entry.replacement}
                      </p>
                    )}
                    <p className="text-sm text-green-600 mt-1">{entry.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="clock" size="lg" className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No rotation activity yet</p>
              <p className="text-sm text-gray-400">Enable automated rotation to see activity here</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Rotation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Manual Rotation</h4>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Manually rotate specific numbers that need immediate attention.
          </p>
          
          <div className="space-y-3">
            {phoneNumbers.filter(n => n.status === 'active').slice(0, 5).map(number => (
              <div key={number.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="phone" size="sm" className="text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-900">{number.number}</span>
                    <div className="text-sm text-gray-600">
                      Performance: {number.performance_score || 'N/A'}% • 
                      Cost: ${(number.monthly_cost || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManualRotation(number.id)}
                >
                  <Icon name="refresh" size="sm" className="mr-1" />
                  Rotate
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

AutomatedNumberRotation.propTypes = {
  phoneNumbers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    number: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    performance_score: PropTypes.number,
    monthly_cost: PropTypes.number
  })),
  onRotationUpdate: PropTypes.func,
  onConfigurationSave: PropTypes.func,
  className: PropTypes.string
};

export default AutomatedNumberRotation;