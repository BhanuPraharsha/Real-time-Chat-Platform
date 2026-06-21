# Real-Time Chat Platform

A comprehensive Full-Stack real-time chat platform engineered end-to-end with the MERN stack. This project showcases a robust backend architecture featuring secure RESTful APIs and bidirectional WebSocket data flow, seamlessly integrated with a highly responsive, state-driven React frontend.

## ✨ Features

**Core Functionality**
- **Secure JWT Authentication** - Complete user registration/login with Socket.IO JWT verification
- **Real-time Messaging** - Instant messaging with authenticated Socket.IO connections (Public Rooms & Private DMs)
- **Media Support** - File and image uploads with strict validation (25MB limit)
- **Profile Management** - Profile updates with avatar URL and bio
- **Real-time Presence** - Authenticated user online/offline status with secure socket tracking

**Advanced Features**
- **Message History Pagination** - Efficient historical message loading to reduce database load
- **Rich UI Components** - Fully responsive, minimal dark-mode-first interface using custom CSS variables
- **Optimized Storage** - DiskStorage using `multer` with secure static file serving

## 🛠 Tech Stack

- **Frontend:** React + Vite + CSS
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcryptjs
- **File Upload:** Multer

## ✅ Recent Security & Performance Improvements

**Enhancements (Recently Fixed)**
- ✅ **Socket Authentication Secured** - JWT verification in Socket.IO middleware with database user validation. Every socket connection is validated against JWT + database, ensuring only logged-in users participate.
- ✅ **Enhanced File Upload Security** - Comprehensive server-side validation (25MB limit) ensuring stability against large payload attacks.
- ✅ **DiskStorage Implementation** - Standardized `multer` disk storage for better memory management during high-throughput file sharing.
- ✅ **XSS Prevention** - Client-side message sanitization using `DOMPurify` to mitigate cross-site scripting vulnerabilities.



## 📁 Project Structure

```text
Real-time-Chat-Platform/
├── README.md                    # This file
├── server/                      # Node.js/Express backend
│   ├── server.js                # Main server file with Socket.IO initialization
│   ├── package.json             # Backend dependencies
│   ├── models/                  # MongoDB Mongoose schemas
│   │   ├── Message.js           
│   │   └── User.js              
│   ├── middleware/              # Express middlewares
│   │   └── authMiddleware.js    # JWT verification
│   └── routes/                  # REST API routes
│       ├── authRoutes.js        
│       ├── uploadRoutes.js      
│       └── userRoutes.js        
└── client/                      # React frontend
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite configuration
    ├── index.html               # Main HTML entry
    └── src/
        ├── App.jsx              # Main app component & routing
        ├── Chat.jsx             # Core Socket.IO chat interface
        ├── components/          # Reusable UI components
        │   ├── Login.jsx        
        │   ├── Register.jsx     
        │   ├── Profile.jsx      
        │   └── UserList.jsx     
        └── styles/              # Scoped CSS styles
            ├── Auth.css         
            ├── Chat.css         
            └── Profile.css      
```

## 🔌 API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**User Management (Protected)**
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile bio and avatar

**Uploads (Protected)**
- `POST /api/upload` - Upload media file (multipart/form-data)

*Note: Protected endpoints require `Authorization: Bearer <token>` header.*

## 🚀 Installation & Setup

### Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/chatapp

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:
```bash
npm start
```

### Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
# Backend Connection
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 🙏 Acknowledgments
- Socket.IO for secure real-time communication
- Multer for efficient file upload handling
- The React and Node.js communities for excellent tooling
