import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const MessageReactions = ({
  messageId,
  reactions = [],
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  showAddButton = true,
  className = '',
  ...props
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common reaction emojis
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasUserReacted: false
      };
    }
    
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasUserReacted = true;
    }
    
    return acc;
  }, {});

  const handleReactionClick = (emoji) => {
    const reactionGroup = groupedReactions[emoji];
    
    if (reactionGroup?.hasUserReacted) {
      onRemoveReaction?.(messageId, emoji);
    } else {
      onAddReaction?.(messageId, emoji);
    }
  };

  const handleQuickReaction = (emoji) => {
    handleReactionClick(emoji);
    setShowEmojiPicker(false);
  };

  const formatUserList = (users) => {
    if (users.length === 0) return '';
    if (users.length === 1) return users[0].name;
    if (users.length === 2) return `${users[0].name} and ${users[1].name}`;
    return `${users[0].name}, ${users[1].name} and ${users.length - 2} others`;
  };

  return (
    <div className={`flex items-center flex-wrap gap-1 ${className}`} {...props}>
      {/* Existing Reactions */}
      {Object.values(groupedReactions).map((reactionGroup) => (
        <button
          key={reactionGroup.emoji}
          onClick={() => handleReactionClick(reactionGroup.emoji)}
          title={`${reactionGroup.emoji} ${formatUserList(reactionGroup.users)}`}
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            reactionGroup.hasUserReacted
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <span>{reactionGroup.emoji}</span>
          <span>{reactionGroup.count}</span>
        </button>
      ))}

      {/* Add Reaction Button */}
      {showAddButton && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Add reaction"
          >
            <Icon name="emoji" size="sm" />
          </Button>

          {/* Quick Reactions Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
              <div className="flex space-x-1">
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuickReaction(emoji)}
                    className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside handler */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

MessageReactions.propTypes = {
  messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  reactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    emoji: PropTypes.string.isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    createdAt: PropTypes.string
  })),
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onAddReaction: PropTypes.func,
  onRemoveReaction: PropTypes.func,
  showAddButton: PropTypes.bool,
  className: PropTypes.string
};

export default MessageReactions;