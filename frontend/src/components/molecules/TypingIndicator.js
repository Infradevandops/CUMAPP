import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../atoms';

const TypingIndicator = ({
  users = [],
  showAvatars = true,
  maxDisplayUsers = 3,
  typingTimeout = 3000,
  className = '',
  size = 'md',
  ...props
}) => {
  const [displayUsers, setDisplayUsers] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const sizeClasses = {
    sm: {
      container: 'text-xs',
      avatar: 'w-4 h-4',
      dot: 'w-1 h-1',
      spacing: 'space-x-1'
    },
    md: {
      container: 'text-sm',
      avatar: 'w-6 h-6',
      dot: 'w-1.5 h-1.5',
      spacing: 'space-x-2'
    },
    lg: {
      container: 'text-base',
      avatar: 'w-8 h-8',
      dot: 'w-2 h-2',
      spacing: 'space-x-3'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    if (users.length > 0) {
      setDisplayUsers(users.slice(0, maxDisplayUsers));
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [users, maxDisplayUsers]);

  // Auto-hide typing indicator after timeout
  useEffect(() => {
    if (users.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, typingTimeout);

      return () => clearTimeout(timer);
    }
  }, [users, typingTimeout]);

  const formatTypingText = () => {
    const userCount = users.length;
    const displayCount = displayUsers.length;
    const hiddenCount = userCount - displayCount;

    if (userCount === 0) return '';

    if (userCount === 1) {
      return `${users[0].name || 'Someone'} is typing...`;
    }

    if (userCount === 2) {
      return `${users[0].name || 'Someone'} and ${users[1].name || 'someone else'} are typing...`;
    }

    if (userCount <= maxDisplayUsers) {
      const names = users.slice(0, -1).map(user => user.name || 'Someone').join(', ');
      const lastName = users[users.length - 1].name || 'someone else';
      return `${names}, and ${lastName} are typing...`;
    }

    const names = displayUsers.map(user => user.name || 'Someone').join(', ');
    return `${names} and ${hiddenCount} other${hiddenCount > 1 ? 's' : ''} are typing...`;
  };

  const TypingDots = () => (
    <div className={`flex ${currentSize.spacing} items-center`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${currentSize.dot} bg-gray-400 rounded-full animate-bounce
          `}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const UserAvatar = ({ user, index }) => (
    <div
      key={user.id || index}
      className={`
        ${currentSize.avatar} rounded-full bg-gray-300 flex items-center justify-center
        text-white font-medium overflow-hidden relative
        ${index > 0 ? '-ml-2' : ''}
      `}
      style={{ zIndex: maxDisplayUsers - index }}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || 'User'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}>
          {(user.name || 'U').charAt(0).toUpperCase()}
        </span>
      )}
      
      {/* Typing indicator dot */}
      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse" />
    </div>
  );

  if (!isVisible || users.length === 0) {
    return null;
  }

  return (
    <div 
      className={`
        flex items-center ${currentSize.spacing} ${currentSize.container} 
        text-gray-600 animate-fade-in ${className}
      `}
      {...props}
    >
      {/* User Avatars */}
      {showAvatars && displayUsers.length > 0 && (
        <div className="flex items-center">
          {displayUsers.map((user, index) => (
            <UserAvatar key={user.id || index} user={user} index={index} />
          ))}
          
          {/* Additional users count */}
          {users.length > maxDisplayUsers && (
            <div
              className={`
                ${currentSize.avatar} rounded-full bg-gray-500 flex items-center justify-center
                text-white font-medium -ml-2
              `}
              style={{ zIndex: 0 }}
            >
              <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}>
                +{users.length - maxDisplayUsers}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Typing Text */}
      <div className="flex items-center space-x-2">
        <span className="font-medium">
          {formatTypingText()}
        </span>
        
        {/* Animated Typing Dots */}
        <TypingDots />
      </div>

      {/* Keyboard Icon */}
      <Icon 
        name="edit3" 
        size={size === 'sm' ? 'xs' : 'sm'} 
        className="text-gray-400 animate-pulse" 
      />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Hook for managing typing state
export const useTypingIndicator = (wsConnection, currentUser) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);

  const startTyping = () => {
    if (!isTyping && wsConnection && currentUser) {
      setIsTyping(true);
      wsConnection.send(JSON.stringify({
        type: 'typing_start',
        user: currentUser
      }));
    }

    // Reset the typing timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    const timer = setTimeout(() => {
      stopTyping();
    }, 3000);

    setTypingTimer(timer);
  };

  const stopTyping = () => {
    if (isTyping && wsConnection && currentUser) {
      setIsTyping(false);
      wsConnection.send(JSON.stringify({
        type: 'typing_stop',
        user: currentUser
      }));
    }

    if (typingTimer) {
      clearTimeout(typingTimer);
      setTypingTimer(null);
    }
  };

  useEffect(() => {
    if (!wsConnection) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'typing_start') {
          setTypingUsers(prev => {
            const exists = prev.find(user => user.id === data.user.id);
            if (!exists) {
              return [...prev, data.user];
            }
            return prev;
          });
        } else if (data.type === 'typing_stop') {
          setTypingUsers(prev => 
            prev.filter(user => user.id !== data.user.id)
          );
        }
      } catch (error) {
        // Not a JSON message, ignore
      }
    };

    wsConnection.addEventListener('message', handleMessage);

    return () => {
      wsConnection.removeEventListener('message', handleMessage);
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [wsConnection, typingTimer]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping
  };
};

TypingIndicator.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string
  })),
  showAvatars: PropTypes.bool,
  maxDisplayUsers: PropTypes.number,
  typingTimeout: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default TypingIndicator;