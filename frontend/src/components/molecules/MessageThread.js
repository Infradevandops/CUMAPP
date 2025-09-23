import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';
import MessageRenderer from './MessageRenderer';
import MessageReactions from './MessageReactions';
import RichTextEditor from './RichTextEditor';

const MessageThread = ({
  parentMessage,
  threadMessages = [],
  currentUserId,
  users = [],
  onSendReply,
  onAddReaction,
  onRemoveReaction,
  onClose,
  className = '',
  ...props
}) => {
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [threadMessages, isExpanded]);

  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendReply = (messageData) => {
    const replyData = {
      ...messageData,
      parentId: parentMessage.id,
      threadId: parentMessage.threadId || parentMessage.id
    };
    
    onSendReply?.(replyData);
    setReplyText('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageSender = (senderId) => {
    if (senderId === currentUserId) return 'You';
    const user = users.find(u => u.id === senderId);
    return user?.name || 'Unknown User';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {/* Thread Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Icon name="messageSquare" size="sm" className="text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">
            Thread
          </h3>
          <span className="text-xs text-gray-500">
            {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse thread' : 'Expand thread'}
          >
            <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Close thread"
            >
              <Icon name="x" size="sm" />
            </Button>
          )}
        </div>
      </div>

      {/* Parent Message */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-700">
              {getMessageSender(parentMessage.senderId).charAt(0)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {getMessageSender(parentMessage.senderId)}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(parentMessage.timestamp)}
              </span>
            </div>
            
            <MessageRenderer 
              message={parentMessage} 
              className="text-sm text-gray-800"
            />
            
            {/* Parent Message Reactions */}
            <div className="mt-2">
              <MessageReactions
                messageId={parentMessage.id}
                reactions={parentMessage.reactions || []}
                currentUserId={currentUserId}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Thread Messages */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {threadMessages.length > 0 ? (
            <div className="p-4 space-y-4">
              {threadMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-700">
                      {getMessageSender(message.senderId).charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">
                        {getMessageSender(message.senderId)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <MessageRenderer 
                      message={message} 
                      className="text-sm text-gray-800"
                    />
                    
                    {/* Message Reactions */}
                    <div className="mt-1">
                      <MessageReactions
                        messageId={message.id}
                        reactions={message.reactions || []}
                        currentUserId={currentUserId}
                        onAddReaction={onAddReaction}
                        onRemoveReaction={onRemoveReaction}
                        showAddButton={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
          ) : (
            <div className="p-8 text-center">
              <Icon name="messageSquare" size="lg" className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No replies yet</p>
              <p className="text-xs text-gray-400">Be the first to reply to this message</p>
            </div>
          )}
        </div>
      )}

      {/* Reply Input */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <RichTextEditor
            value={replyText}
            onChange={setReplyText}
            placeholder="Reply to thread..."
            maxLength={1000}
            showToolbar={false}
            showEmojiPicker={true}
            showAttachments={true}
            showMentions={true}
            users={users}
            onSend={handleSendReply}
            className="border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
          />
        </div>
      )}

      {/* Quick Reply (when collapsed) */}
      {!isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full text-left justify-start"
          >
            <Icon name="reply" size="sm" className="mr-2" />
            Reply to thread...
          </Button>
        </div>
      )}
    </div>
  );
};

MessageThread.propTypes = {
  parentMessage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    threadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reactions: PropTypes.array
  }).isRequired,
  threadMessages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reactions: PropTypes.array
  })),
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string
  })),
  onSendReply: PropTypes.func,
  onAddReaction: PropTypes.func,
  onRemoveReaction: PropTypes.func,
  onClose: PropTypes.func,
  className: PropTypes.string
};

export default MessageThread;