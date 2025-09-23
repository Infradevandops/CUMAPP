import React, { useState, useEffect, useRef } from 'react';
import BaseLayout from '../templates/BaseLayout';
import SearchBar from '../molecules/SearchBar';
import RichTextEditor from '../molecules/RichTextEditor';
import MessageRenderer from '../molecules/MessageRenderer';
import MessageReactions from '../molecules/MessageReactions';
import MessageThread from '../molecules/MessageThread';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

const ChatPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState({});
  const [reactions, setReactions] = useState({});
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Mock data
  useEffect(() => {
    setContacts([
      { id: 1, name: 'John Doe', phone: '+1234567890', lastMessage: 'Hey there!', timestamp: '2 min ago', unread: 2 },
      { id: 2, name: 'Jane Smith', phone: '+1987654321', lastMessage: 'Thanks for the update', timestamp: '1 hour ago', unread: 0 },
      { id: 3, name: 'Support Team', phone: '+1555000123', lastMessage: 'Your issue has been resolved', timestamp: '3 hours ago', unread: 1 },
    ]);
    
    setUsers([
      { id: 1, name: 'John Doe', username: 'johndoe' },
      { id: 2, name: 'Jane Smith', username: 'janesmith' },
      { id: 3, name: 'Support Team', username: 'support' },
      { id: 'me', name: user?.name || 'You', username: 'me' }
    ]);
    
    setSelectedContact(1);
    setMessages([
      { 
        id: 1, 
        senderId: 1, 
        text: 'Hey there! 👋 Welcome to our enhanced chat system!', 
        attachments: [], 
        timestamp: new Date(Date.now() - 600000).toISOString(), 
        type: 'received',
        reactions: []
      },
      { 
        id: 2, 
        senderId: 'me', 
        text: 'Hi! How can I help you? This looks amazing with all the new features!', 
        attachments: [], 
        timestamp: new Date(Date.now() - 480000).toISOString(), 
        type: 'sent',
        reactions: []
      },
      { 
        id: 3, 
        senderId: 1, 
        text: 'I need help with my **account setup**. Can you help me with *formatting* and `code` examples? Also, can you @me when you have updates?', 
        attachments: [], 
        timestamp: new Date(Date.now() - 420000).toISOString(), 
        type: 'received',
        reactions: [],
        mentions: [{ userId: 'me', username: 'me', position: 95, length: 3 }]
      },
    ]);

    // Initialize reactions for messages
    setReactions({
      1: [
        { id: 'r1', emoji: '👍', userId: 'me', user: { id: 'me', name: 'You' }, createdAt: new Date().toISOString() }
      ],
      2: [
        { id: 'r2', emoji: '❤️', userId: 1, user: { id: 1, name: 'John Doe' }, createdAt: new Date().toISOString() }
      ]
    });
  }, [user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (messageData) => {
    // Handle both string (legacy) and object (new) message formats
    const messageText = typeof messageData === 'string' ? messageData : messageData.text;
    const attachments = typeof messageData === 'object' ? messageData.attachments || [] : [];
    const mentions = typeof messageData === 'object' ? messageData.mentions || [] : [];
    const replyTo = typeof messageData === 'object' ? messageData.replyTo : null;
    
    if (!messageText.trim() && attachments.length === 0) return;
    
    const message = {
      id: Date.now(),
      senderId: 'me',
      text: messageText,
      attachments: attachments,
      mentions: mentions,
      replyTo: replyTo,
      timestamp: new Date().toISOString(),
      type: 'sent',
      reactions: []
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyToMessage(null);
    
    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = {
        id: Date.now() + 1,
        senderId: selectedContact,
        text: 'Thanks for your message! I love the new rich text features! 🎉',
        attachments: [],
        timestamp: new Date().toISOString(),
        type: 'received',
        reactions: []
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleAddReaction = (messageId, emoji) => {
    const reactionId = `r_${Date.now()}`;
    const newReaction = {
      id: reactionId,
      emoji: emoji,
      userId: 'me',
      user: { id: 'me', name: 'You' },
      createdAt: new Date().toISOString()
    };

    setReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), newReaction]
    }));
  };

  const handleRemoveReaction = (messageId, emoji) => {
    setReactions(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || []).filter(r => !(r.emoji === emoji && r.userId === 'me'))
    }));
  };

  const handleReplyToMessage = (message) => {
    setReplyToMessage({
      id: message.id,
      text: message.text,
      senderName: message.senderId === 'me' ? 'You' : getMessageSender(message.senderId)
    });
  };

  const handleStartThread = (message) => {
    setSelectedThread(message);
  };

  const handleSendThreadReply = (replyData) => {
    const threadId = replyData.threadId;
    const newReply = {
      id: Date.now(),
      senderId: 'me',
      text: replyData.text,
      attachments: replyData.attachments || [],
      parentId: replyData.parentId,
      threadId: threadId,
      timestamp: new Date().toISOString(),
      reactions: []
    };

    setThreadMessages(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newReply]
    }));
  };

  const handleMention = (user) => {
    console.log('User mentioned:', user);
    // In a real app, this could trigger notifications
  };

  const getMessageSender = (senderId) => {
    if (senderId === 'me') return 'You';
    const contact = contacts.find(c => c.id === senderId);
    return contact?.name || 'Unknown User';
  };
  
  const handleContactSelect = (contactId) => {
    setSelectedContact(contactId);
    // In a real app, this would load messages for the selected contact
  };
  
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );
  
  const selectedContactInfo = contacts.find(c => c.id === selectedContact);
  
  return (
    <BaseLayout user={user} currentPath="/chat">
      <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <SearchBar
              placeholder="Search conversations..."
              onSearch={setSearchQuery}
              showButton={false}
            />
          </div>
          
          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedContact === contact.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{contact.timestamp}</p>
                    {contact.unread > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {contact.lastMessage}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContactInfo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedContactInfo.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedContactInfo.name}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedContactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    {/* Reply indicator */}
                    {message.replyTo && (
                      <div className="mb-2 ml-12">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Icon name="reply" size="xs" />
                          <span>Replying to {getMessageSender(messages.find(m => m.id === message.replyTo)?.senderId)}</span>
                        </div>
                        <div className="bg-gray-100 border-l-2 border-gray-300 pl-3 py-1 mt-1 rounded">
                          <p className="text-xs text-gray-600 truncate">
                            {messages.find(m => m.id === message.replyTo)?.text}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                        {message.type === 'received' && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-700">
                              {getMessageSender(message.senderId).charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col space-y-1">
                          <div
                            className={`px-4 py-3 rounded-lg relative ${
                              message.type === 'sent'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            {/* Message Actions (visible on hover) */}
                            <div className={`absolute top-0 ${message.type === 'sent' ? 'left-0' : 'right-0'} transform ${message.type === 'sent' ? '-translate-x-full' : 'translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1`}>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleAddReaction(message.id, '👍')}
                                title="Add reaction"
                              >
                                <Icon name="emoji" size="xs" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleReplyToMessage(message)}
                                title="Reply"
                              >
                                <Icon name="reply" size="xs" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleStartThread(message)}
                                title="Start thread"
                              >
                                <Icon name="messageSquare" size="xs" />
                              </Button>
                            </div>

                            <MessageRenderer 
                              message={message} 
                              className={`text-sm ${message.type === 'sent' ? 'text-white' : 'text-gray-900'}`}
                            />
                            
                            <p className={`text-xs mt-2 ${
                              message.type === 'sent' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* Message Reactions */}
                          {reactions[message.id] && reactions[message.id].length > 0 && (
                            <div className={`${message.type === 'sent' ? 'self-end' : 'self-start'}`}>
                              <MessageReactions
                                messageId={message.id}
                                reactions={reactions[message.id]}
                                currentUserId="me"
                                onAddReaction={handleAddReaction}
                                onRemoveReaction={handleRemoveReaction}
                                showAddButton={false}
                              />
                            </div>
                          )}

                          {/* Thread indicator */}
                          {threadMessages[message.id] && threadMessages[message.id].length > 0 && (
                            <div className={`${message.type === 'sent' ? 'self-end' : 'self-start'}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedThread(message)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Icon name="messageSquare" size="sm" className="mr-1" />
                                {threadMessages[message.id].length} {threadMessages[message.id].length === 1 ? 'reply' : 'replies'}
                              </Button>
                            </div>
                          )}
                        </div>

                        {message.type === 'sent' && (
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-white">
                              {getMessageSender(message.senderId).charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {getMessageSender(selectedContact).charAt(0)}
                        </span>
                      </div>
                      <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Rich Text Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <RichTextEditor
                  value={newMessage}
                  onChange={setNewMessage}
                  placeholder="Type a message... Use **bold**, *italic*, `code`, @mentions or add emojis 😊"
                  maxLength={2000}
                  showToolbar={true}
                  showEmojiPicker={true}
                  showAttachments={true}
                  showMentions={true}
                  users={users}
                  replyToMessage={replyToMessage}
                  onSend={handleSendMessage}
                  onMention={handleMention}
                  onCancelReply={() => setReplyToMessage(null)}
                  className="border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>

        {/* Thread Sidebar */}
        {selectedThread && (
          <div className="w-1/3 border-l border-gray-200">
            <MessageThread
              parentMessage={selectedThread}
              threadMessages={threadMessages[selectedThread.id] || []}
              currentUserId="me"
              users={users}
              onSendReply={handleSendThreadReply}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              onClose={() => setSelectedThread(null)}
            />
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ChatPage;