# Chat Application Features Documentation

## ✅ Implemented Features

### 🔐 Authentication & User Management
- **User Registration**: Create new account with name, email, and password
- **User Login**: Secure login with email and password
- **User Logout**: Logout functionality with cookie clearing
- **Password Security**: Bcrypt password hashing (10 rounds)
- **JWT Authentication**: Token-based authentication stored in HTTP-only cookies
- **Input Validation**: Express-validator for registration and login forms
- **Email Uniqueness**: Validation to prevent duplicate email registration
- **Password Requirements**: Minimum 5 characters validation

### 👥 User Features
- **User Search**: Search users by name (returns up to 10 results)
- **User Listing**: View all users with pagination
- **User Profile**: View user avatar, name, email
- **Online Status**: Track if user is online or offline
- **Last Seen**: Display when user was last active
- **User Avatars**: Support for custom avatars with default fallback

### 💬 Conversations
- **Private Conversations**: One-on-one private chat conversations
- **Conversation List**: View all conversations for authenticated user
- **Conversation Participants**: See all participants in a conversation
- **Last Message Preview**: Show last message text and timestamp in conversation list
- **Message Status**: Track message status per user (SENT, DELIVERED, SEEN)
- **Conversation Search**: UI ready for searching conversations (backend pending)

### 📨 Messaging
- **Send Messages**: Send text messages in conversations
- **Load Chat History**: Fetch all messages for a conversation
- **Message Types**: Database support for TEXT, IMAGE, and FILE messages
- **Message Timestamps**: Display when messages were sent
- **Message Status Tracking**: Per-user message status (SENT, DELIVERED, SEEN)
- **Message UI**: Distinct styling for sent vs received messages
- **Auto-scroll**: Auto-scroll to bottom when messages load

### 🎨 User Interface
- **Three-Pane Layout**: 
  - Left: Conversations sidebar
  - Center: User search modal
  - Right: Chat area with messages
- **Responsive Design**: Tailwind CSS for modern, responsive UI
- **Login/Register Forms**: Toggle between login and registration
- **User Search Modal**: Modal to search and start new conversations
- **Empty States**: Friendly empty state messages
- **Online Indicators**: Green indicators for online users
- **Avatar Display**: User avatars throughout the interface
- **Toast Notifications**: Success/error notifications using react-toastify

### 🔧 Technical Features
- **Backend Stack**: Node.js + Express + TypeScript
- **Frontend Stack**: React 19 + TypeScript + Vite
- **Database**: Prisma ORM with MySQL/PostgreSQL support
- **State Management**: React Context API for global state
- **API Client**: Axios with credentials support
- **CORS Configuration**: Configured for localhost:5173
- **Cookie Authentication**: HTTP-only cookies for security
- **LocalStorage Persistence**: Store user and conversation data
- **Error Handling**: Centralized error and success response handlers
- **Docker Support**: Dockerfiles for both frontend and backend

### 🗄️ Database Schema
- **User Model**: Complete user information with authentication fields
- **Conversation Model**: Support for different conversation types
- **ConversationParticipant Model**: Many-to-many relationship for participants
- **Message Model**: Support for multiple message types (TEXT, IMAGE, FILE)
- **MessageStatus Model**: Per-user message status tracking
- **UserBlock Model**: Schema for user blocking functionality

### 🔒 Security Features
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Authentication middleware for protected endpoints
- **SameSite Cookies**: Lax sameSite policy for CSRF protection

## 🚧 Partially Implemented / Planned Features

### Real-time Features
- **WebSocket/Socket.IO**: Mentioned in design documents but not yet implemented
- **Real-time Messaging**: Messages currently update UI but don't persist to backend
- **Real-time Status Updates**: Online/offline status not updated in real-time

### Messaging Features
- **Message Sending**: UI updates locally but backend API not fully connected
- **Image Messages**: Schema supports it, UI/backend not implemented
- **File Messages**: Schema supports it, UI/backend not implemented
- **Message Status Updates**: Schema ready but automatic status updates not implemented

### Conversation Features
- **Create Conversation**: API endpoint exists but implementation is commented out
- **Start Conversation**: Function exists but logic not implemented
- **Conversation Search**: UI input exists but search logic commented out
- **Unread Message Count**: Marked as "next step" in code, not implemented

### User Features
- **User Blocking**: Database schema ready but functionality not implemented
- **Avatar Upload**: Avatar field exists but upload functionality not implemented
- **Profile Editing**: No profile update endpoints

## 📊 API Endpoints

### Authentication (`/api/auth/`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /logout` - User logout

### Users (`/api/users`)
- `GET /users?search={query}` - Search users (protected)

### Conversations (`/api/conversations`)
- `POST /` - Create conversation (protected, partially implemented)
- `GET /` - Get all conversations for user (protected)
- `GET /:id/messages` - Load messages for conversation (protected)

### Profile
- `GET /api/profile` - Get user profile (protected, placeholder)

## 📁 Project Structure

```
13_rasChat/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── validations/     # Input validation
│   │   ├── utils/           # Utilities (JWT, Response)
│   │   └── types/           # TypeScript types
│   └── prisma/
│       └── schema.prisma    # Database schema
│
└── frontend/
    └── src/
        ├── context/         # React Context (ChatContext)
        ├── pages/           # Page components
        ├── hooks/           # Custom React hooks
        ├── requests/        # API request handlers
        ├── types/           # TypeScript types
        └── utils/           # Utility functions
```

## 🛠️ Dependencies

### Backend
- Express 5.1.0
- Prisma 5.22.0
- JWT 9.0.3
- Bcrypt 6.0.0
- Express-validator 7.3.1

### Frontend
- React 19.2.0
- React Router 7.9.6
- Axios 1.13.2
- Tailwind CSS 4.1.17
- React Toastify 11.0.5

## 📝 Notes

- The application has a solid foundation with authentication, user management, and conversation structure
- Real-time features are planned but not yet implemented
- Several UI components are ready but backend logic needs to be connected
- Database schema supports advanced features like message types and user blocking, but UI/backend implementation is pending
