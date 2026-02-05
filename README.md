# Real-Time Chat Platform

A web-based chat application with real-time messaging, user authentication, and private messaging capabilities.

## Features

- User registration and login with JWT authentication
- Real-time public chat rooms
- Private messaging between users
- Online user list
- Typing indicators
- Message history
- Input sanitization for security

## Tech Stack 

**Backend:**
- Node.js & Express
- Socket.io for real-time communication
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

**Frontend:**
- React
- Socket.io Client
- React Router
- Axios
- DOMPurify for XSS prevention

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd Real-time-Chat-Platform
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Configure environment variables

Create `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_secret_key_here
PORT=5000
```

Create `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Start the server
```bash
cd server
npm start
```

### Start the client
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Network Access

To allow others on your network to connect:

1. Update `client/.env` with your IP address:
```
REACT_APP_API_URL=http://YOUR_IP:5000
REACT_APP_SOCKET_URL=http://YOUR_IP:5000
```

2. Restart the client

3. Share `http://YOUR_IP:3000` with others

The server will display your network IP when it starts.

## API Endpoints

### Authentication

**POST** `/api/auth/register`
- Body: `{ username, email, password }`
- Returns: `{ token, user }`

**POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ token, user }`

## Socket Events

### Client to Server
- `join_room` - Join a chat room
- `send_message` - Send public message
- `send_private_message` - Send private message
- `typing` - Typing indicator

### Server to Client
- `load_messages` - Message history
- `receive_message` - New public message
- `receive_private_message` - New private message
- `online_users` - Updated user list
- `user_joined` - User joined notification
- `user_typing` - Typing indicator

## Security

- Passwords hashed with bcrypt
- JWT token authentication
- Input sanitization (server and client)
- XSS protection with DOMPurify
- CORS configured

## License

MIT
