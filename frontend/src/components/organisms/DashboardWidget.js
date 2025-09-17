import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Typography, Badge } from '../atoms';

const DashboardWidget = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon, 
  color = 'gray',
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const colors = {
    gray: 'text-gray-600',
    red: 'text-red-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };
  
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  const changeIcons = {
    positive: 'chevronUp',
    negative: 'chevronDown',
    neutral: 'minus'
  };
  
  return (
    <Card 
      hover={!!onClick}
      className={`cursor-${onClick ? 'pointer' : 'default'} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Typography variant="body2" className="text-gray-600 font-medium">
            {title}
          </Typography>
          
          {loading ? (
            <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="mt-2 flex items-baseline">
              <Typography variant="h3" className="text-gray-900">
                {value}
              </Typography>
              
              {change && (
                <div className={`ml-2 flex items-center ${changeColors[changeType]}`}>
                  <Icon 
                    name={changeIcons[changeType]} 
                    size="xs" 
                    className="mr-1" 
                  />
                  <Typography variant="caption" className={changeColors[changeType]}>
                    {change}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-full bg-gray-100 ${colors[color]}`}>
            <Icon name={icon} size="lg" />
          </div>
        )}
      </div>
    </Card>
  );
};

const ActivityWidget = ({ activities = [], loading = false, className = '' }) => {
  if (loading) {
    return (
      <Card className={className}>
        <Card.Header>
          <Typography variant="h5">Recent Activity</Typography>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <Card.Header>
        <Typography variant="h5">Recent Activity</Typography>
      </Card.Header>
      <Card.Content>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="info" className="mx-auto text-gray-400 mb-2" size="xl" />
            <Typography variant="body2" className="text-gray-500">
              No recent activity
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex space-x-3">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100 text-green-600' :
                  activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Icon 
                    name={
                      activity.type === 'success' ? 'check' :
                      activity.type === 'warning' ? 'warning' :
                      activity.type === 'error' ? 'x' :
                      'info'
                    } 
                    size="sm" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography variant="body2" className="text-gray-900">
                    {activity.message}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {activity.timestamp}
                  </Typography>
                </div>
                {activity.badge && (
                  <Badge variant={activity.badge.variant} size="sm">
                    {activity.badge.text}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

const QuickActionsWidget = ({ actions = [], className = '' }) => (
  <Card className={className}>
    <Card.Header>
      <Typography variant="h5">Quick Actions</Typography>
    </Card.Header>
    <Card.Content>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-md ${action.color || 'bg-gray-100 text-gray-600'}`}>
                <Icon name={action.icon} size="sm" />
              </div>
              <div>
                <Typography variant="body2" className="font-medium text-gray-900">
                  {action.title}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {action.description}
                </Typography>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card.Content>
  </Card>
);

DashboardWidget.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes.string,
  color: PropTypes.oneOf(['gray', 'red', 'green', 'blue', 'yellow', 'purple']),
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

ActivityWidget.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
    badge: PropTypes.shape({
      text: PropTypes.string,
      variant: PropTypes.string
    })
  })),
  loading: PropTypes.bool,
  className: PropTypes.string
};

QuickActionsWidget.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string,
    onClick: PropTypes.func.isRequired
  })),
  className: PropTypes.string
};

export { DashboardWidget, ActivityWidget, QuickActionsWidget };
export default DashboardWidget;