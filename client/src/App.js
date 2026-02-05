import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './Chat';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection with authentication
    const token = localStorage.getItem('token');

    if (token) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      console.log('Connecting to socket at:', socketUrl);

      const newSocket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'] // Try websocket first, fallback to polling
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully!');
        setSocketConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setSocketConnected(false);

        // If authentication fails, clear token and redirect to login
        if (error.message.includes('Authentication error')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat socket={socket} />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;