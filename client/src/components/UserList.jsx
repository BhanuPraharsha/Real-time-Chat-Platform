import React from 'react';
import '../styles/UserList.css';

function UserList({ onlineUsers, recentChats, currentUserId, onSelectUser }) {
    const filteredOnlineUsers = onlineUsers.filter(user => user.userId !== currentUserId);
    
    const onlineUserIds = new Set(filteredOnlineUsers.map(u => u.userId));
    const offlineRecentChats = (recentChats || []).filter(
        user => user.userId !== currentUserId && !onlineUserIds.has(user.userId)
    );

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <h3>Online Users</h3>
                <span className="user-count">{filteredOnlineUsers.length}</span>
            </div>

            <div className="user-list">
                {filteredOnlineUsers.length === 0 ? (
                    <div className="no-users">
                        <p>No other users online</p>
                    </div>
                ) : (
                    filteredOnlineUsers.map((user) => (
                        <div
                            key={user.userId}
                            className="user-item"
                            onClick={() => onSelectUser(user)}
                        >
                            <div className="user-avatar">
                                <div className="avatar-circle">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="online-indicator"></span>
                            </div>
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                                <span className="status">Online</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {offlineRecentChats.length > 0 && (
                <>
                    <div className="user-list-header" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <h3>Recent Chats</h3>
                        <span className="user-count">{offlineRecentChats.length}</span>
                    </div>
                    <div className="user-list">
                        {offlineRecentChats.map((user) => (
                            <div
                                key={user.userId}
                                className="user-item offline-item"
                                onClick={() => onSelectUser(user)}
                            >
                                <div className="user-avatar">
                                    <div className="avatar-circle" style={{ background: '#475569' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="online-indicator" style={{ background: '#64748b', boxShadow: 'none' }}></span>
                                </div>
                                <div className="user-info">
                                    <span className="username" style={{ color: '#94a3b8' }}>{user.username}</span>
                                    <span className="status" style={{ color: '#64748b' }}>Offline</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default UserList;
