import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import UserList from './components/UserList';
import ThemeSwitcher from './components/ThemeSwitcher';
import './styles/Chat.css';

function Chat({ socket }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [room, setRoom] = useState('');
  const [showRoomJoin, setShowRoomJoin] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [privateMessagePage, setPrivateMessagePage] = useState({});
  const [hasMorePrivate, setHasMorePrivate] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatBodyRef = React.useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!socket) return;

    // Load message history
    socket.on('load_messages', (data) => {
      setMessageList(data);
    });

    // Receive public messages
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Receive private messages
    socket.on('receive_private_message', (data) => {
      const senderId = data.userId;
      setPrivateMessages((prev) => ({
        ...prev,
        [senderId]: [...(prev[senderId] || []), { ...data, isSender: false }]
      }));
    });

    // Confirmation of sent private message
    socket.on('private_message_sent', (data) => {
      const recipientId = data.recipientId;
      setPrivateMessages((prev) => ({
        ...prev,
        [recipientId]: [...(prev[recipientId] || []), { ...data, isSender: true }]
      }));
    });

    // Online users update
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Recent chats update
    socket.on('recent_chats', (chats) => {
      setRecentChats(chats);
    });

    // Load private messages history
    socket.on('load_private_messages', (data) => {
      setPrivateMessages((prev) => {
        const existing = prev[data.recipientId] || [];
        if (data.page === 1) {
            return { ...prev, [data.recipientId]: data.messages };
        }
        // Prepend older messages
        return { ...prev, [data.recipientId]: [...data.messages, ...existing] };
      });
      setHasMorePrivate(prev => ({ ...prev, [data.recipientId]: data.hasMore }));
      setIsLoadingMore(false);
    });

    // User joined notification
    socket.on('user_joined', (data) => {
      setMessageList((list) => [
        ...list,
        {
          author: 'System',
          message: data.message,
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isSystem: true
        }
      ]);
    });

    // Typing indicator
    socket.on('user_typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...new Set([...prev, data.username])]);
      } else {
        setTypingUsers((prev) => prev.filter(u => u !== data.username));
      }
    });

    // Error handling
    socket.on('error', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('load_messages');
      socket.off('receive_message');
      socket.off('receive_private_message');
      socket.off('private_message_sent');
      socket.off('online_users');
      socket.off('recent_chats');
      socket.off('load_private_messages');
      socket.off('user_joined');
      socket.off('user_typing');
      socket.off('error');
    };
  }, [socket]);

  // Add connection timeout
  useEffect(() => {
    if (!socket) return;

    const timeout = setTimeout(() => {
      if (!socket.connected) {
        setConnectionError('Unable to connect to chat server. Please check your network connection and try refreshing the page.');
      }
    }, 10000); // 10 second timeout

    socket.on('connect', () => {
      setConnectionError(null);
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, [socket]);

  const joinRoom = () => {
    if (room !== '' && socket) {
      socket.emit('join_room', room);
      setShowRoomJoin(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if ((currentMessage.trim() !== '' || selectedFile) && socket) {
      setIsUploading(true);
      let uploadedFileData = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            uploadedFileData = {
              fileUrl: result.fileUrl,
              fileName: result.fileName,
              fileType: result.fileType
            };
          } else {
            alert(result.message || 'File upload failed');
            setIsUploading(false);
            return;
          }
        } catch (err) {
          console.error('Upload error', err);
          alert('Failed to upload file');
          setIsUploading(false);
          return;
        }
      }

      const sanitizedMessage = DOMPurify.sanitize(currentMessage.trim());

      if (selectedUser) {
        // Send private message
        socket.emit('send_private_message', {
          recipientId: selectedUser.userId,
          message: sanitizedMessage,
          ...(uploadedFileData || {})
        });
      } else {
        // Send public message
        const messageData = {
          room: room,
          message: sanitizedMessage,
          ...(uploadedFileData || {})
        };
        socket.emit('send_message', messageData);
      }

      setCurrentMessage('');
      removeFile();
      setIsUploading(false);
      socket.emit('typing', { room, isTyping: false });
    }
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);

    if (socket && !selectedUser) {
      socket.emit('typing', { room, isTyping: e.target.value.length > 0 });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) {
      socket.disconnect();
    }
    navigate('/login');
  };

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setShowRoomJoin(false);
    
    // Fetch private history if not loaded yet
    if (socket && !privateMessages[selectedUser.userId]) {
        socket.emit('fetch_private_history', { recipientId: selectedUser.userId, page: 1, limit: 50 });
        setPrivateMessagePage(prev => ({ ...prev, [selectedUser.userId]: 1 }));
    }
  };

  const handleBackToPublic = () => {
    setSelectedUser(null);
    if (!room) {
      setShowRoomJoin(true);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && selectedUser && hasMorePrivate[selectedUser.userId] && !isLoadingMore) {
        setIsLoadingMore(true);
        const nextPage = (privateMessagePage[selectedUser.userId] || 1) + 1;
        setPrivateMessagePage(prev => ({ ...prev, [selectedUser.userId]: nextPage }));
        socket.emit('fetch_private_history', { recipientId: selectedUser.userId, page: nextPage, limit: 50 });
    }
  };

  if (!socket || !socket.connected) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to chat server...</p>
        {connectionError && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#ff4444', borderRadius: '8px', maxWidth: '400px' }}>
            <p style={{ color: 'white', margin: 0 }}>❌ {connectionError}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '10px', padding: '8px 16px', background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Refresh Page
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentMessages = selectedUser
    ? privateMessages[selectedUser.userId] || []
    : messageList;

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar-large" onClick={() => navigate('/profile')} style={{cursor: 'pointer'}} title="Edit Profile">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 onClick={() => navigate('/profile')} style={{cursor: 'pointer', margin: 0}} title="Edit Profile">{user.username}</h3>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <UserList
          onlineUsers={onlineUsers}
          recentChats={recentChats}
          currentUserId={user.id}
          onSelectUser={handleSelectUser}
        />
      </div>

      <div className="chat-main">
        {showRoomJoin ? (
          <div className="join-room-container" style={{height: '100%', width: '100%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="join-room-card" style={{margin: '0', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'}}>
              <div className="join-room-header">
                <h2>Welcome, {user.username}!</h2>
                <p>Select a user to chat with or enter a public room</p>
              </div>
              <div className="join-room-form">
                <input
                  type="text"
                  placeholder="Enter Room ID (e.g., general, tech, random)"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                />
                <button onClick={joinRoom} disabled={!room.trim()}>
                  Join Room
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-actions">
                <ThemeSwitcher />
              </div>
              {selectedUser ? (
                <div className="chat-header-content">
                  <button onClick={handleBackToPublic} className="back-button">
                    ← Back
                  </button>
                  <h3>Private Chat with {selectedUser.username}</h3>
                </div>
              ) : (
                <div className="chat-header-content">
                  <h3>Room: {room}</h3>
                  <span className="online-count">
                    {onlineUsers.length} online
                  </span>
                </div>
              )}
            </div>

            <div className="chat-body" ref={chatBodyRef} onScroll={handleScroll}>
              {isLoadingMore && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#64748b', fontSize: '14px' }}>
                  Loading older messages...
                </div>
              )}
              {currentMessages.length === 0 ? (
                <div className="no-messages">
                  <p>
                    {selectedUser
                      ? `Start a conversation with ${selectedUser.username}`
                      : 'No messages yet. Be the first to say something!'}
                  </p>
                </div>
              ) : (
                currentMessages.map((msg, index) => {
                  const isOwnMessage = selectedUser
                    ? msg.isSender
                    : msg.author === user.username;

                  return (
                    <div
                      key={index}
                      className={`message ${isOwnMessage ? 'own-message' : 'other-message'} ${msg.isSystem ? 'system-message' : ''}`}
                    >
                      {!msg.isSystem && !isOwnMessage && (
                        <div className="message-author">{msg.author}</div>
                      )}
                      <div className="message-bubble">
                        {msg.message && <p className="message-text">{msg.message}</p>}
                        {msg.fileUrl && (
                          <div className="message-attachment">
                            {msg.fileType?.startsWith('image/') ? (
                              <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${msg.fileUrl}`} alt={msg.fileName} className="message-image" />
                            ) : (
                              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" className="message-file-link">
                                📎 {msg.fileName}
                              </a>
                            )}
                          </div>
                        )}
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
              {typingUsers.length > 0 && !selectedUser && (
                <div className="typing-indicator">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
            </div>

            <div className="chat-footer">
              {selectedFile && (
                <div className="selected-file-preview">
                  <span className="file-name">📎 {selectedFile.name}</span>
                  <button onClick={removeFile} className="remove-file-btn">×</button>
                </div>
              )}
              <div className="chat-input-wrapper">
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="file-upload-btn">
                  📎
                </label>
                <input
                  type="text"
                  value={currentMessage}
                  placeholder={selectedUser ? `Message ${selectedUser.username}...` : 'Type a message...'}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  maxLength="2000"
                  disabled={isUploading}
                />
                <button onClick={sendMessage} disabled={(!currentMessage.trim() && !selectedFile) || isUploading}>
                  <span className="send-icon">{isUploading ? '⏳' : '➤'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;