import React from 'react';
import '../styles/UserList.css';

function UserList({ onlineUsers, currentUserId, onSelectUser }) {
    const filteredUsers = onlineUsers.filter(user => user.userId !== currentUserId);

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <h3>Online Users</h3>
                <span className="user-count">{filteredUsers.length}</span>
            </div>

            <div className="user-list">
                {filteredUsers.length === 0 ? (
                    <div className="no-users">
                        <p>No other users online</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
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
        </div>
    );
}

export default UserList;
