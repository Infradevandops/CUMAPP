import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Type your message...',
  maxLength = 1000,
  showToolbar = true,
  showEmojiPicker = true,
  showAttachments = true,
  onSend,
  disabled = false,
  className = '',
  ...props
}) => {
  const [content, setContent] = useState(value);
  const [showEmojis, setShowEmojis] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
  ];

  useEffect(() => {
    setContent(value);
    setCharCount(value.length);
  }, [value]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (content.trim() && onSend) {
      onSend(content.trim());
      setContent('');
      setCharCount(0);
      onChange?.('');
    }
  };

  const insertEmoji = (emoji) => {
    const newContent = content + emoji;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
    }
    setShowEmojis(false);
    editorRef.current?.focus();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle file upload logic here
    console.log('Files selected:', files);
    // Reset file input
    e.target.value = '';
  };

  const formatText = (command) => {
    // Simple text formatting for textarea
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = selectedText;
    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      default:
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 ${className}`} {...props}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('bold')}
              disabled={disabled}
              title="Bold (Ctrl+B)"
            >
              <Icon name="edit" size="sm" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('italic')}
              disabled={disabled}
              title="Italic (Ctrl+I)"
            >
              <Icon name="edit" size="sm" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('code')}
              disabled={disabled}
              title="Code"
            >
              <Icon name="settings" size="sm" />
            </Button>
            
            {showEmojiPicker && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojis(!showEmojis)}
                  disabled={disabled}
                  title="Add emoji"
                >
                  😀
                </Button>
                
                {showEmojis && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                    <div className="grid grid-cols-10 gap-1 max-w-xs">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 rounded text-lg"
                          type="button"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {showAttachments && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  title="Attach file"
                >
                  <Icon name="plus" size="sm" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </span>
          </div>
        </div>
      )}
      
      {/* Editor Area */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border-0 resize-none focus:outline-none bg-transparent min-h-[100px] max-h-[300px]"
          style={{ resize: 'vertical' }}
        />
        
        {/* Send Button */}
        {onSend && (
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={handleSend}
              disabled={!content.trim() || disabled}
              size="sm"
              title="Send message (Ctrl+Enter)"
            >
              <Icon name="chevronRight" size="sm" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <span>Press Ctrl+Enter to send</span>
          <span>Markdown supported</span>
        </div>
      </div>
    </div>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  showToolbar: PropTypes.bool,
  showEmojiPicker: PropTypes.bool,
  showAttachments: PropTypes.bool,
  onSend: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default RichTextEditor;