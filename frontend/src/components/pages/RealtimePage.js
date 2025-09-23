import React, { useState, useEffect } from 'react';
import { Header } from '../organisms';
import { 
  ConnectionStatus, 
  NotificationSystem, 
  TypingIndicator, 
  LiveCollaboration,
  RealtimeMetrics 
} from '../molecules';
import { Button, Icon } from '../atoms';

const RealtimePage = () => {
  const [activeDemo, setActiveDemo] = useState('connection');
  const [currentUser] = useState({
    id: 'user-123',
    name: 'Demo User',
    avatar: null
  });
  const [wsConnection, setWsConnection] = useState(null);
  const [connectionStats, setConnectionStats] = useState({});

  const demoSections = [
    {
      id: 'connection',
      title: 'Connection Status',
      icon: 'wifi',
      description: 'WebSocket connection monitoring and auto-reconnection'
    },
    {
      id: 'notifications',
      title: 'Real-time Notifications',
      icon: 'bell',
      description: 'Live notification system with sound and visual alerts'
    },
    {
      id: 'typing',
      title: 'Typing Indicators',
      icon: 'edit3',
      description: 'Live typing indicators for collaborative features'
    },
    {
      id: 'collaboration',
      title: 'Live Collaboration',
      icon: 'users',
      description: 'Real-time collaborative editing with operational transform'
    },
    {
      id: 'metrics',
      title: 'Live Metrics',
      icon: 'activity',
      description: 'Real-time system metrics and performance monitoring'
    }
  ];

  // Mock typing users for demo
  const [typingUsers, setTypingUsers] = useState([]);
  const [demoMetrics, setDemoMetrics] = useState([
    {
      id: 'active-connections',
      label: 'Active Connections',
      value: 1247,
      format: 'number',
      icon: 'wifi',
      status: 'good',
      change: 12.5,
      variance: 0.1
    },
    {
      id: 'messages-per-second',
      label: 'Messages/sec',
      value: 89,
      format: 'number',
      icon: 'messageSquare',
      status: 'good',
      change: 5.2,
      variance: 0.15
    },
    {
      id: 'response-time',
      label: 'Response Time',
      value: 45,
      format: 'time',
      icon: 'clock',
      status: 'good',
      target: 50,
      change: -8.3,
      variance: 0.2
    }
  ]);

  useEffect(() => {
    // Initialize WebSocket connection for demos
    const ws = new WebSocket('ws://localhost:8000/ws/realtime-demo');
    setWsConnection(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleConnectionChange = (state, stats) => {
    setConnectionStats(stats);
  };

  const triggerDemoNotification = (type) => {
    const notifications = {
      success: {
        type: 'success',
        title: 'Success!',
        message: 'Your action was completed successfully.',
        duration: 3000
      },
      error: {
        type: 'error',
        title: 'Error Occurred',
        message: 'Something went wrong. Please try again.',
        duration: 5000,
        actions: [
          {
            label: 'Retry',
            primary: true,
            handler: () => console.log('Retry clicked')
          },
          {
            label: 'Dismiss',
            handler: () => console.log('Dismissed')
          }
        ]
      },
      warning: {
        type: 'warning',
        title: 'Warning',
        message: 'Your session will expire in 5 minutes.',
        persistent: true,
        actions: [
          {
            label: 'Extend Session',
            primary: true,
            handler: () => console.log('Session extended')
          }
        ]
      },
      info: {
        type: 'info',
        title: 'New Feature Available',
        message: 'Check out our new real-time collaboration tools!',
        duration: 4000
      },
      message: {
        type: 'message',
        title: 'New Message',
        message: 'You have received a new message from John Doe.',
        duration: 4000,
        actions: [
          {
            label: 'View',
            primary: true,
            handler: () => console.log('View message')
          }
        ]
      }
    };

    if (window.showNotification) {
      window.showNotification(notifications[type]);
    }
  };

  const simulateTyping = () => {
    const mockUsers = [
      { id: 1, name: 'Alice Johnson', avatar: null },
      { id: 2, name: 'Bob Smith', avatar: null },
      { id: 3, name: 'Carol Davis', avatar: null }
    ];

    // Add random users to typing
    const randomUsers = mockUsers
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    setTypingUsers(randomUsers);

    // Clear typing after 3 seconds
    setTimeout(() => {
      setTypingUsers([]);
    }, 3000);
  };

  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'connection':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                WebSocket Connection Status
              </h3>
              
              <div className="space-y-4">
                <ConnectionStatus
                  wsUrl="ws://localhost:8000/ws/demo"
                  showDetails={true}
                  onConnectionChange={handleConnectionChange}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Reconnect Attempts</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {connectionStats.reconnectAttempts || 0}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Latency</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {connectionStats.latency ? `${connectionStats.latency}ms` : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Last Connected</div>
                    <div className="text-sm font-medium text-gray-900">
                      {connectionStats.lastConnected 
                        ? connectionStats.lastConnected.toLocaleTimeString()
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Automatic reconnection with exponential backoff</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Real-time latency monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Connection state visualization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Manual connect/disconnect controls</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Real-time Notification System
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {['success', 'error', 'warning', 'info', 'message'].map(type => (
                  <Button
                    key={type}
                    onClick={() => triggerDemoNotification(type)}
                    variant="outline"
                    className="capitalize"
                  >
                    <Icon name={
                      type === 'success' ? 'check' :
                      type === 'error' ? 'x' :
                      type === 'warning' ? 'alertTriangle' :
                      type === 'info' ? 'info' : 'messageSquare'
                    } size="sm" className="mr-2" />
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Multiple notification types with custom styling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Sound notifications with different tones</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Action buttons for interactive notifications</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Auto-dismiss with progress indicators</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Persistent notifications for important alerts</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'typing':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Typing Indicators
              </h3>
              
              <div className="space-y-4">
                <Button onClick={simulateTyping} variant="outline">
                  <Icon name="edit3" size="sm" className="mr-2" />
                  Simulate Typing
                </Button>
                
                <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] flex items-center">
                  {typingUsers.length > 0 ? (
                    <TypingIndicator
                      users={typingUsers}
                      showAvatars={true}
                      maxDisplayUsers={3}
                      size="md"
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Click "Simulate Typing" to see typing indicators in action
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Real-time typing detection and broadcast</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>User avatars with typing indicators</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Animated typing dots and smooth transitions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Smart text formatting for multiple users</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Automatic timeout and cleanup</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Live Collaboration Demo
              </h3>
              
              <LiveCollaboration
                documentId="demo-document-123"
                currentUser={currentUser}
                onContentChange={(change, user) => {
                  console.log('Content changed by:', user.name, change);
                }}
                onUserJoin={(user) => {
                  console.log('User joined:', user.name);
                }}
                onUserLeave={(user) => {
                  console.log('User left:', user.name);
                }}
                showCursors={true}
                showPresence={true}
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Real-time collaborative text editing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Operational Transform for conflict resolution</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Live cursor positions and selections</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>User presence indicators</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Automatic synchronization and recovery</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            <RealtimeMetrics
              metrics={demoMetrics}
              updateInterval={2000}
              showSparklines={true}
            />

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Real-time metric updates with configurable intervals</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Sparkline charts showing metric trends</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Status indicators (good/warning/critical)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Multiple format support (percentage, currency, bytes, time)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="check" size="sm" className="text-green-500" />
                  <span>Target tracking and change indicators</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real-time Features</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive real-time functionality including WebSocket connections, 
            live notifications, typing indicators, and collaborative features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Demo Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Sections</h3>
              
              <nav className="space-y-2">
                {demoSections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveDemo(section.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-colors
                      ${activeDemo === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={section.icon} 
                        size="sm" 
                        className={activeDemo === section.id ? 'text-blue-600' : 'text-gray-500'}
                      />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Demo Content */}
          <div className="lg:col-span-3">
            {renderDemoContent()}
          </div>
        </div>
      </div>

      {/* Global Notification System */}
      <NotificationSystem
        maxNotifications={5}
        defaultDuration={5000}
        position="top-right"
        enableSound={true}
      />
    </div>
  );
};

export default RealtimePage;