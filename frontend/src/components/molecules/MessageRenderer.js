import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../atoms';

const MessageRenderer = ({ message, className = '' }) => {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Replace markdown with HTML
    let parsed = text
      // Bold: **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      // Italic: *text*
      .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>')
      // Strikethrough: ~~text~~
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Code: `text`
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return parsed;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'image'; // Using image icon for video too
    if (fileType.includes('pdf')) return 'attachment';
    if (fileType.includes('document') || fileType.includes('word')) return 'attachment';
    return 'attachment';
  };

  return (
    <div className={className}>
      {/* Message Text */}
      {message.text && (
        <div 
          className="message-content"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
        />
      )}
      
      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              {attachment.type && attachment.type.startsWith('image/') ? (
                // Image attachment
                <div className="relative">
                  <img
                    src={attachment.preview || attachment.url}
                    alt={attachment.name}
                    className="max-w-xs max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // Open image in new tab or modal
                      if (attachment.url) {
                        window.open(attachment.url, '_blank');
                      }
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                    {attachment.name}
                  </div>
                </div>
              ) : (
                // File attachment
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-xs">
                  <Icon name={getFileIcon(attachment.type)} size="md" className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  {attachment.url && (
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download file"
                    >
                      <Icon name="chevronRight" size="sm" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

MessageRenderer.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      size: PropTypes.number,
      url: PropTypes.string,
      preview: PropTypes.string
    }))
  }).isRequired,
  className: PropTypes.string
};

export default MessageRenderer;