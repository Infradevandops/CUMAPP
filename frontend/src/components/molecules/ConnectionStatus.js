import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../atoms';

const ConnectionStatus = ({
  wsUrl = 'ws://localhost:8000/ws',
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
  onConnectionChange,
  showDetails = false,
  className = '',
  ...props
}) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastConnected, setLastConnected] = useState(null);
  const [latency, setLatency] = useState(null);
  const [wsInstance, setWsInstance] = useState(null);

  const connectionStates = {
    connected: {
      color: 'green',
      icon: 'wifi',
      label: 'Connected',
      description: 'Real-time connection active'
    },
    connecting: {
      color: 'yellow',
      icon: 'loader',
      label: 'Connecting',
      description: 'Establishing connection...'
    },
    disconnected: {
      color: 'red',
      icon: 'wifiOff',
      label: 'Disconnected',
      description: 'No real-time connection'
    },
    reconnecting: {
      color: 'yellow',
      icon: 'refreshCw',
      label: 'Reconnecting',
      description: `Attempt ${reconnectAttempts}/${maxReconnectAttempts}`
    },
    error: {
      color: 'red',
      icon: 'alertTriangle',
      label: 'Connection Error',
      description: 'Failed to establish connection'
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsInstance) {
        wsInstance.close();
      }
    };
  }, []);

  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connectionState, {
        reconnectAttempts,
        lastConnected,
        latency
      });
    }
  }, [connectionState, reconnectAttempts, lastConnected, latency]);

  const connectWebSocket = () => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    
    try {
      const ws = new WebSocket(wsUrl);
      const pingStart = Date.now();

      ws.onopen = () => {
        setConnectionState('connected');
        setReconnectAttempts(0);
        setLastConnected(new Date());
        
        // Send ping to measure latency
        ws.send(JSON.stringify({ type: 'ping', timestamp: pingStart }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            const latencyMs = Date.now() - data.timestamp;
            setLatency(latencyMs);
          }
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setConnectionState('disconnected');
        
        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            setConnectionState('reconnecting');
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, reconnectInterval);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionState('error');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
      };

      setWsInstance(ws);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
    }
  };

  const handleReconnect = () => {
    setReconnectAttempts(0);
    connectWebSocket();
  };

  const handleDisconnect = () => {
    if (wsInstance) {
      wsInstance.close(1000, 'Manual disconnect');
      setWsInstance(null);
    }
    setConnectionState('disconnected');
  };

  const currentState = connectionStates[connectionState];

  return (
    <div className={`flex items-center space-x-2 ${className}`} {...props}>
      {/* Connection Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full bg-${currentState.color}-500 ${
          connectionState === 'connecting' || connectionState === 'reconnecting' 
            ? 'animate-pulse' 
            : connectionState === 'connected' 
              ? 'animate-pulse' 
              : ''
        }`}></div>
        
        <Icon 
          name={currentState.icon} 
          size="sm" 
          className={`text-${currentState.color}-500 ${
            connectionState === 'connecting' || connectionState === 'reconnecting'
              ? 'animate-spin'
              : ''
          }`}
        />
        
        <span className={`text-sm font-medium text-${currentState.color}-600`}>
          {currentState.label}
        </span>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {latency && connectionState === 'connected' && (
            <span>
              {latency}ms
            </span>
          )}
          
          {lastConnected && (
            <span>
              Last: {lastConnected.toLocaleTimeString()}
            </span>
          )}
          
          {connectionState === 'reconnecting' && (
            <span>
              Attempt {reconnectAttempts}/{maxReconnectAttempts}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        {(connectionState === 'disconnected' || connectionState === 'error') && (
          <button
            onClick={handleReconnect}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reconnect"
          >
            <Icon name="refresh" size="xs" />
          </button>
        )}
        
        {connectionState === 'connected' && (
          <button
            onClick={handleDisconnect}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Disconnect"
          >
            <Icon name="x" size="xs" />
          </button>
        )}
      </div>

      {/* Tooltip/Popover for detailed status */}
      {showDetails && (
        <div className="relative group">
          <Icon 
            name="info" 
            size="xs" 
            className="text-gray-400 cursor-help"
          />
          
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <div className="space-y-1">
              <div>{currentState.description}</div>
              {connectionState === 'connected' && latency && (
                <div>Latency: {latency}ms</div>
              )}
              {lastConnected && (
                <div>Connected: {lastConnected.toLocaleString()}</div>
              )}
              <div>URL: {wsUrl}</div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

ConnectionStatus.propTypes = {
  wsUrl: PropTypes.string,
  reconnectInterval: PropTypes.number,
  maxReconnectAttempts: PropTypes.number,
  onConnectionChange: PropTypes.func,
  showDetails: PropTypes.bool,
  className: PropTypes.string
};

export default ConnectionStatus;