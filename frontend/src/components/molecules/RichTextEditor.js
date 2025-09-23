import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '../atoms';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Type your message...',
  maxLength = 2000,
  showToolbar = true,
  showEmojiPicker = true,
  showAttachments = true,
  showMentions = true,
  showThreading = false,
  onSend,
  onMention,
  onReaction,
  replyToMessage = null,
  onCancelReply,
  users = [],
  disabled = false,
  className = '',
  ...props
}) => {
  const [content, setContent] = useState(value);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState(new Set());
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showMentionsDropdown, setShowMentionsDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const mentionsRef = useRef(null);
  const recordingInterval = useRef(null);

  // Extended emoji collection
  const emojiCategories = {
    'Smileys': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'
    ],
    'Gestures': [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
      '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶'
    ],
    'Hearts': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
    ],
    'Objects': [
      '💻', '📱', '⌚', '📷', '📹', '🎥', '📞', '☎️', '📠', '📺',
      '📻', '🎵', '🎶', '🎤', '🎧', '📢', '📣', '📯', '🔔', '🔕'
    ]
  };

  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Smileys');

  useEffect(() => {
    setContent(value);
    setCharCount(value.length);
  }, [value]);

  // Filter users for mentions
  useEffect(() => {
    if (mentionQuery) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(mentionQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      setSelectedMentionIndex(0);
    } else {
      setFilteredUsers([]);
    }
  }, [mentionQuery, users]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingInterval.current);
      setRecordingTime(0);
    }

    return () => clearInterval(recordingInterval.current);
  }, [isRecording]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
      updateActiveFormats();
      
      // Check for @mentions
      if (showMentions) {
        checkForMentions(newContent, e.target.selectionStart);
      }
    }
  };

  const checkForMentions = (text, cursorPosition) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(mentionMatch.index);
      setShowMentionsDropdown(true);
    } else {
      setShowMentionsDropdown(false);
      setMentionQuery('');
    }
  };

  const handleKeyDown = (e) => {
    // Handle mentions dropdown navigation
    if (showMentionsDropdown && filteredUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          return;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          insertMention(filteredUsers[selectedMentionIndex]);
          return;
        case 'Escape':
          setShowMentionsDropdown(false);
          return;
      }
    }

    // Send on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }

    // Handle keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
        default:
          break;
      }
    }
  };

  const handleSend = () => {
    if (content.trim() || attachedFiles.length > 0) {
      const messageData = {
        text: content.trim(),
        attachments: attachedFiles,
        replyTo: replyToMessage?.id || null,
        mentions: extractMentions(content)
      };
      
      onSend?.(messageData);
      setContent('');
      setCharCount(0);
      setAttachedFiles([]);
      onChange?.('');
      onCancelReply?.();
    }
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const user = users.find(u => u.username === username || u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase());
      if (user) {
        mentions.push({
          userId: user.id,
          username: user.username || user.name,
          position: match.index,
          length: match[0].length
        });
      }
    }
    
    return mentions;
  };

  const insertMention = (user) => {
    const textarea = editorRef.current;
    const beforeMention = content.substring(0, mentionPosition);
    const afterMention = content.substring(textarea.selectionStart);
    const username = user.username || user.name.toLowerCase().replace(/\s+/g, '');
    
    const newContent = beforeMention + `@${username} ` + afterMention;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
      
      // Set cursor position after mention
      setTimeout(() => {
        const newPosition = mentionPosition + username.length + 2;
        textarea.selectionStart = textarea.selectionEnd = newPosition;
        textarea.focus();
      }, 0);
    }
    
    setShowMentionsDropdown(false);
    setMentionQuery('');
    onMention?.(user);
  };

  const insertEmoji = (emoji) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = content.substring(0, start) + emoji + content.substring(end);
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojis(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeAttachment = (fileId) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Clean up object URLs
      const removed = prev.find(f => f.id === fileId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const updateActiveFormats = useCallback(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const formats = new Set();
    
    // Check for bold
    if ((beforeText.endsWith('**') && afterText.startsWith('**')) ||
        selectedText.startsWith('**') && selectedText.endsWith('**')) {
      formats.add('bold');
    }
    
    // Check for italic
    if ((beforeText.endsWith('*') && afterText.startsWith('*') && !beforeText.endsWith('**')) ||
        (selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**'))) {
      formats.add('italic');
    }
    
    // Check for code
    if ((beforeText.endsWith('`') && afterText.startsWith('`')) ||
        selectedText.startsWith('`') && selectedText.endsWith('`')) {
      formats.add('code');
    }

    setActiveFormats(formats);
  }, [content]);

  const formatText = (command) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = selectedText;
    let wrapper = '';
    
    switch (command) {
      case 'bold':
        wrapper = '**';
        break;
      case 'italic':
        wrapper = '*';
        break;
      case 'underline':
        wrapper = '__';
        break;
      case 'strikethrough':
        wrapper = '~~';
        break;
      case 'code':
        wrapper = '`';
        break;
      default:
        return;
    }
    
    // Check if text is already formatted
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    const wrapperLength = wrapper.length;
    
    if (beforeText.endsWith(wrapper) && afterText.startsWith(wrapper)) {
      // Remove formatting
      const newContent = beforeText.slice(0, -wrapperLength) + selectedText + afterText.slice(wrapperLength);
      if (newContent.length <= maxLength) {
        setContent(newContent);
        setCharCount(newContent.length);
        onChange?.(newContent);
        
        setTimeout(() => {
          textarea.selectionStart = start - wrapperLength;
          textarea.selectionEnd = end - wrapperLength;
          textarea.focus();
        }, 0);
      }
    } else {
      // Add formatting
      formattedText = `${wrapper}${selectedText || 'text'}${wrapper}`;
      const newContent = content.substring(0, start) + formattedText + content.substring(end);
      
      if (newContent.length <= maxLength) {
        setContent(newContent);
        setCharCount(newContent.length);
        onChange?.(newContent);
        
        setTimeout(() => {
          if (selectedText) {
            textarea.selectionStart = start + wrapperLength;
            textarea.selectionEnd = end + wrapperLength;
          } else {
            textarea.selectionStart = textarea.selectionEnd = start + wrapperLength;
          }
          textarea.focus();
        }, 0);
      }
    }
  };

  const insertLink = () => {
    if (!linkUrl) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const displayText = linkText || selectedText || linkUrl;
    const linkMarkdown = `[${displayText}](${linkUrl})`;
    
    const newContent = content.substring(0, start) + linkMarkdown + content.substring(end);
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    textarea.focus();
  };

  const insertList = (type) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const lines = selectedText.split('\n');
    const prefix = type === 'bullet' ? '• ' : '1. ';
    const formattedLines = lines.map((line, index) => {
      if (line.trim()) {
        const listPrefix = type === 'bullet' ? '• ' : `${index + 1}. `;
        return listPrefix + line.trim();
      }
      return line;
    });
    
    const newContent = content.substring(0, start) + formattedLines.join('\n') + content.substring(end);
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCharCount(newContent.length);
      onChange?.(newContent);
    }
    
    textarea.focus();
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = {
          id: Date.now(),
          file: blob,
          name: `voice-message-${Date.now()}.webm`,
          size: blob.size,
          type: 'audio/webm',
          duration: recordingTime,
          isVoiceMessage: true
        };
        
        setAttachedFiles(prev => [...prev, audioFile]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`} {...props}>
      {/* Reply Message Display */}
      {replyToMessage && (
        <div className="px-3 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="reply" size="sm" className="text-blue-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-800">
                Replying to {replyToMessage.senderName || 'Unknown'}
              </p>
              <p className="text-xs text-blue-600 truncate max-w-xs">
                {replyToMessage.text}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="text-blue-600 hover:text-blue-800"
          >
            <Icon name="x" size="sm" />
          </Button>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-1">
            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                disabled={disabled}
                title="Bold (Ctrl+B)"
                className={activeFormats.has('bold') ? 'bg-blue-100 text-blue-600' : ''}
              >
                <Icon name="bold" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                disabled={disabled}
                title="Italic (Ctrl+I)"
                className={activeFormats.has('italic') ? 'bg-blue-100 text-blue-600' : ''}
              >
                <Icon name="italic" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                disabled={disabled}
                title="Underline (Ctrl+U)"
                className={activeFormats.has('underline') ? 'bg-blue-100 text-blue-600' : ''}
              >
                <Icon name="underline" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('strikethrough')}
                disabled={disabled}
                title="Strikethrough"
                className={activeFormats.has('strikethrough') ? 'bg-blue-100 text-blue-600' : ''}
              >
                <Icon name="strikethrough" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('code')}
                disabled={disabled}
                title="Code"
                className={activeFormats.has('code') ? 'bg-blue-100 text-blue-600' : ''}
              >
                <Icon name="code" size="sm" />
              </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertList('bullet')}
                disabled={disabled}
                title="Bullet List"
              >
                <Icon name="listBullet" size="sm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertList('number')}
                disabled={disabled}
                title="Numbered List"
              >
                <Icon name="listNumber" size="sm" />
              </Button>
            </div>

            {/* Link */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkDialog(true)}
                disabled={disabled}
                title="Insert Link (Ctrl+K)"
              >
                <Icon name="link" size="sm" />
              </Button>
            </div>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojis(!showEmojis)}
                  disabled={disabled}
                  title="Add emoji"
                  className={showEmojis ? 'bg-blue-100 text-blue-600' : ''}
                >
                  <Icon name="emoji" size="sm" />
                </Button>
                
                {showEmojis && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-80">
                    {/* Emoji Categories */}
                    <div className="flex border-b border-gray-200">
                      {Object.keys(emojiCategories).map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedEmojiCategory(category)}
                          className={`px-3 py-2 text-xs font-medium ${
                            selectedEmojiCategory === category
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          type="button"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    
                    {/* Emoji Grid */}
                    <div className="p-3 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-8 gap-1">
                        {emojiCategories[selectedEmojiCategory].map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => insertEmoji(emoji)}
                            className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                            type="button"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* File Attachments */}
            {showAttachments && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  title="Attach file"
                  className={attachedFiles.length > 0 ? 'bg-blue-100 text-blue-600' : ''}
                >
                  <Icon name="attachment" size="sm" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
              </>
            )}

            {/* Voice Recording */}
            {showAttachments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={disabled}
                title={isRecording ? 'Stop recording' : 'Record voice message'}
                className={isRecording ? 'bg-red-100 text-red-600 animate-pulse' : ''}
              >
                <Icon name={isRecording ? 'stop' : 'microphone'} size="sm" />
              </Button>
            )}

            {/* @Mentions */}
            {showMentions && users.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const textarea = editorRef.current;
                  const cursorPos = textarea.selectionStart;
                  const newContent = content.substring(0, cursorPos) + '@' + content.substring(cursorPos);
                  setContent(newContent);
                  setCharCount(newContent.length);
                  onChange?.(newContent);
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
                    textarea.focus();
                  }, 0);
                }}
                disabled={disabled}
                title="Mention someone (@)"
              >
                <Icon name="at" size="sm" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">
                  Recording {formatRecordingTime(recordingTime)}
                </span>
              </div>
            )}
            <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </span>
          </div>
        </div>
      )}

      {/* File Attachments Preview */}
      {attachedFiles.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                {file.isVoiceMessage ? (
                  <div className="flex items-center space-x-2">
                    <Icon name="microphone" size="sm" className="text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Voice Message</p>
                      <p className="text-xs text-gray-500">{formatRecordingTime(file.duration || 0)}</p>
                    </div>
                  </div>
                ) : file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
                ) : (
                  <Icon 
                    name={file.type.startsWith('audio/') ? 'microphone' : 'attachment'} 
                    size="sm" 
                    className={file.type.startsWith('audio/') ? 'text-blue-600' : 'text-gray-400'} 
                  />
                )}
                {!file.isVoiceMessage && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(file.id)}
                  title="Remove attachment"
                  className="text-red-500 hover:text-red-700"
                >
                  <Icon name="x" size="sm" />
                </Button>
              </div>
            ))}
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
          onSelect={updateActiveFormats}
          onClick={updateActiveFormats}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border-0 resize-none focus:outline-none bg-transparent min-h-[120px] max-h-[300px] font-mono text-sm leading-relaxed"
          style={{ resize: 'vertical' }}
        />

        {/* Mentions Dropdown */}
        {showMentionsDropdown && filteredUsers.length > 0 && (
          <div 
            ref={mentionsRef}
            className="absolute bottom-full left-3 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-w-xs"
          >
            <div className="py-1 max-h-48 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Mention someone
              </div>
              {filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2 ${
                    index === selectedMentionIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    {user.username && (
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Send Button */}
        {onSend && (
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={handleSend}
              disabled={(!content.trim() && attachedFiles.length === 0) || disabled}
              size="sm"
              title="Send message (Ctrl+Enter)"
              className="shadow-lg"
            >
              <Icon name="send" size="sm" />
            </Button>
          </div>
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={insertLink}
                disabled={!linkUrl}
              >
                Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <span>Press Ctrl+Enter to send • Markdown supported</span>
          <div className="flex items-center space-x-4">
            {attachedFiles.length > 0 && (
              <span>{attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''} attached</span>
            )}
            <span>Ctrl+B Bold • Ctrl+I Italic • Ctrl+K Link</span>
          </div>
        </div>
      </div>

      {/* Click outside handler for emoji picker */}
      {showEmojis && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowEmojis(false)}
        />
      )}
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
  showMentions: PropTypes.bool,
  showThreading: PropTypes.bool,
  onSend: PropTypes.func,
  onMention: PropTypes.func,
  onReaction: PropTypes.func,
  replyToMessage: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    senderName: PropTypes.string
  }),
  onCancelReply: PropTypes.func,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string
  })),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default RichTextEditor;