import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import UserList from './components/UserList';
import './styles/Chat.css';

function Chat({ socket }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [room, setRoom] = useState('');
  const [showRoomJoin, setShowRoomJoin] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
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

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' && socket) {
      // Sanitize message
      const sanitizedMessage = DOMPurify.sanitize(currentMessage.trim());

      if (selectedUser) {
        // Send private message
        socket.emit('send_private_message', {
          recipientId: selectedUser.userId,
          message: sanitizedMessage
        });
      } else {
        // Send public message
        const messageData = {
          room: room,
          message: sanitizedMessage
        };
        socket.emit('send_message', messageData);
      }

      setCurrentMessage('');
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
  };

  const handleBackToPublic = () => {
    setSelectedUser(null);
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

  if (showRoomJoin) {
    return (
      <div className="join-room-container">
        <div className="join-room-card">
          <div className="join-room-header">
            <h2>Welcome, {user.username}!</h2>
            <p>Enter a room to start chatting</p>
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
          <button onClick={handleLogout} className="logout-button-alt">
            Logout
          </button>
        </div>
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
            <div className="user-avatar-large">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{user.username}</h3>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <UserList
          onlineUsers={onlineUsers}
          currentUserId={user.id}
          onSelectUser={handleSelectUser}
        />
      </div>

      <div className="chat-main">
        <div className="chat-header">
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

        <div className="chat-body">
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
                    <p className="message-text">{msg.message}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}

          {!selectedUser && typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <input
            type="text"
            value={currentMessage}
            placeholder={selectedUser ? `Message ${selectedUser.username}...` : 'Type a message...'}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            maxLength="2000"
          />
          <button onClick={sendMessage} disabled={!currentMessage.trim()}>
            <span className="send-icon">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;