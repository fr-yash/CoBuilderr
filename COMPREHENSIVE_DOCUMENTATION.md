# CoBuilder - Comprehensive System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Real-time Communication](#real-time-communication)
9. [AI Integration](#ai-integration)
10. [Authentication & Security](#authentication--security)
11. [Frontend Components](#frontend-components)
12. [Backend Services](#backend-services)
13. [Deployment](#deployment)
14. [Environment Configuration](#environment-configuration)
15. [Known Issues & TODOs](#known-issues--todos)
16. [Improvement Recommendations](#improvement-recommendations)

---

## System Overview

### What is CoBuilder?

CoBuilder is a **real-time collaborative code building platform** with AI assistance. It enables multiple developers to work together on projects while leveraging AI-powered code generation capabilities.

### Key Features

1. **Real-time Collaboration**
   - Multi-user project workspaces
   - Live chat with Socket.IO
   - Instant message synchronization
   - Team member management

2. **AI-Powered Code Generation**
   - Integration with Google Gemini 2.0 Flash
   - Natural language to code conversion
   - File tree generation
   - Build and start command suggestions
   - Markdown-formatted responses

3. **Project Management**
   - Create and manage multiple projects
   - Add/remove collaborators
   - Project-based access control
   - User authentication with JWT

4. **Code Editor Features**
   - File tree visualization
   - Multi-tab file editing
   - Syntax highlighting (via pre-formatted text)
   - Copy to clipboard functionality
   - File modification tracking

### Target Users

- Development teams working on collaborative projects
- Solo developers seeking AI assistance
- Students learning to code with AI guidance
- Rapid prototyping and proof-of-concept development

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Frontend (Vite)                               │   │
│  │  - User Interface                                    │   │
│  │  - State Management (Context API)                    │   │
│  │  - Real-time Socket.IO Client                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js + Express Backend                           │   │
│  │  - REST API Endpoints                                │   │
│  │  - Socket.IO Server                                  │   │
│  │  - JWT Authentication                                │   │
│  │  - Business Logic Services                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     DATA & SERVICES LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   MongoDB    │  │    Redis     │  │  Google AI API  │   │
│  │  (Database)  │  │  (Optional)  │  │   (Gemini 2.0)  │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Patterns

1. **MVC Pattern** (Backend)
   - **Models**: MongoDB schemas (User, Project)
   - **Controllers**: Request handlers
   - **Services**: Business logic layer

2. **Component-Based Architecture** (Frontend)
   - Reusable React components
   - Context API for global state
   - Custom hooks for logic reuse

3. **Real-time Event-Driven Architecture**
   - Socket.IO for bidirectional communication
   - Event-based message handling
   - Room-based project isolation

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI framework |
| Vite | 6.3.5 | Build tool and dev server |
| Tailwind CSS | 4.1.11 | Utility-first CSS framework |
| React Router DOM | 7.6.2 | Client-side routing |
| Axios | 1.9.0 | HTTP client |
| Socket.IO Client | 4.8.1 | Real-time communication |
| Markdown-to-JSX | 7.7.6 | Markdown rendering |
| Heroicons React | 2.2.0 | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0.0 | Runtime environment |
| Express | 5.1.0 | Web framework |
| Socket.IO | 4.8.1 | WebSocket server |
| Mongoose | 8.15.1 | MongoDB ODM |
| JWT | 9.0.2 | Authentication tokens |
| Bcrypt | 6.0.0 | Password hashing |
| Google Generative AI | 0.24.1 | AI integration |
| Redis | 5.10.0 | Token blacklisting (optional) |
| IORedis | 5.6.1 | Redis client |
| Morgan | 1.10.0 | HTTP request logger |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Express Validator | 7.2.1 | Input validation |

### Database

- **MongoDB**: NoSQL document database
- **Redis** (Optional): In-memory data store for token blacklisting

### External Services

- **Google Gemini 2.0 Flash**: AI model for code generation
- **MongoDB Atlas**: Cloud database hosting (recommended)
- **Render**: Deployment platform

---

## Project Structure

### Complete Directory Tree

```
CoBuilder/
├── backend/                          # Backend API server
│   ├── controller/                   # Route controllers (request handlers)
│   │   ├── ai.controller.js         # AI generation endpoint handler
│   │   ├── project.controller.js    # Project CRUD operations
│   │   └── user.controller.js       # User auth & profile handlers
│   ├── db/                          # Database configuration
│   │   └── db.js                    # MongoDB connection setup
│   ├── middleware/                  # Express middleware
│   │   └── auth.middleware.js       # JWT authentication middleware
│   ├── migrations/                  # Database migrations
│   │   └── migrate-users-field.js   # Users field array migration
│   ├── models/                      # Mongoose schemas
│   │   ├── project.model.js         # Project schema
│   │   └── user.model.js            # User schema with auth methods
│   ├── routes/                      # API route definitions
│   │   ├── ai.routes.js             # AI endpoints
│   │   ├── project.routes.js        # Project endpoints
│   │   └── user.routes.js           # User/auth endpoints
│   ├── services/                    # Business logic layer
│   │   ├── ai.service.js            # Google AI integration
│   │   ├── project.service.js       # Project business logic
│   │   ├── redis.service.js         # Redis client setup
│   │   └── user.service.js          # User business logic
│   ├── app.js                       # Express app configuration
│   ├── server.js                    # HTTP & Socket.IO server
│   ├── package.json                 # Backend dependencies
│   ├── env.example                  # Environment variables template
│   └── render.yaml                  # Render deployment config
│
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── auth/                    # Authentication components
│   │   │   └── UserAuth.jsx         # Protected route wrapper
│   │   ├── config/                  # Configuration files
│   │   │   ├── axios.js             # Axios instance with interceptors
│   │   │   └── socket.js            # Socket.IO client setup
│   │   ├── context/                 # React Context providers
│   │   │   └── user.context.jsx     # User state & auth context
│   │   ├── routes/                  # Routing configuration
│   │   │   └── AppRoutes.jsx        # Route definitions
│   │   ├── screens/                 # Page components
│   │   │   ├── Dashboard.jsx        # Dashboard (redirects to Home)
│   │   │   ├── Home.jsx             # Project list & creation
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Project.jsx          # Main project workspace (885 lines)
│   │   │   └── Register.jsx         # Registration form
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite build configuration
│   ├── package.json                 # Frontend dependencies
│   ├── env.example                  # Environment variables template
│   └── render.yaml                  # Render deployment config
│
├── DEPLOYMENT.md                    # Deployment guide
├── PRODUCTION_READY.md              # Production readiness checklist
├── README.md                        # Project overview
└── COMPREHENSIVE_DOCUMENTATION.md   # This file
```

### Key File Purposes

#### Backend Core Files

- **`server.js`** (137 lines): Main entry point, sets up HTTP server, Socket.IO, and handles real-time messaging
- **`app.js`** (40 lines): Express application configuration with middleware and routes
- **`db/db.js`** (14 lines): MongoDB connection handler

#### Frontend Core Files

- **`Project.jsx`** (885 lines): Most complex component - handles project workspace, chat, file tree, and code editor
- **`user.context.jsx`** (289 lines): Global user state management with authentication logic
- **`axios.js`** (21 lines): Configured HTTP client with token interceptors
- **`socket.js`** (35 lines): Socket.IO client wrapper for real-time communication

---

## Core Components

### Backend Components

#### 1. Express Application (`app.js`)

**Purpose**: Configure Express server with middleware and routes

**Key Features**:
- CORS configuration with environment-based origins
- JSON and URL-encoded body parsing
- Cookie parsing for JWT tokens
- Morgan HTTP request logging
- Route mounting for users, projects, and AI

**Middleware Stack**:
```javascript
morgan("dev")                    // HTTP logging
express.json()                   // JSON body parser
express.urlencoded()             // URL-encoded parser
cookieParser()                   // Cookie parser
cors()                           // CORS handler
```

**Routes**:
- `/users` → User authentication and profile
- `/projects` → Project CRUD operations
- `/ai` → AI code generation

#### 2. Socket.IO Server (`server.js`)

**Purpose**: Handle real-time bidirectional communication

**Key Features**:
- JWT-based socket authentication
- Project-based room isolation
- AI message detection and processing
- Automatic message broadcasting

**Socket Middleware**:
```javascript
// Authentication & project validation
1. Extract JWT token from handshake
2. Validate project ID
3. Fetch project from database
4. Verify JWT token
5. Attach user and project to socket
```

**Socket Events**:
- `connection`: Client connects to project room
- `project-message`: Send/receive messages
- `disconnect`: Client leaves project room

**AI Message Flow**:
```
User sends "@ai create a React app"
    ↓
1. Broadcast original message immediately
    ↓
2. Detect "@ai" in message
    ↓
3. Extract prompt (remove "@ai")
    ↓
4. Call AI service (generateResult)
    ↓
5. Parse AI response (text + fileTree)
    ↓
6. Broadcast AI response with file structure
```

#### 3. Authentication Middleware (`auth.middleware.js`)

**Purpose**: Protect routes with JWT authentication

**Process**:
1. Extract token from cookies or Authorization header
2. Check Redis blacklist (if connected)
3. Verify JWT signature
4. Attach decoded user to request
5. Call next() or return 401

**Error Handling**:
- Graceful degradation if Redis is unavailable
- Continues without blacklist check
- Logs errors but doesn't crash

---

## Database Schema

### User Model (`user.model.js`)

**Schema Definition**:
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 6,
    maxLength: 50
  },
  password: {
    type: String,
    required: true,
    select: false  // Never return password in queries by default
  }
}
```

**Static Methods**:
- `hashPassword(password)`: Bcrypt hash with salt rounds = 10

**Instance Methods**:
- `isValidPassword(password)`: Compare plain text with hashed password
- `generateJWT()`: Create JWT token with email payload, expires in 1 day

**Security Features**:
- Passwords never returned in queries (`select: false`)
- Bcrypt hashing with 10 salt rounds
- Email normalization (lowercase, trimmed)
- JWT expiration (24 hours)

### Project Model (`project.model.js`)

**Schema Definition**:
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true  // Project names must be unique globally
  },
  users: [{
    type: ObjectId,
    ref: "User",
    required: true
  }]
}
```

**Relationships**:
- Many-to-many with Users (array of ObjectIds)
- Populated with user details when fetched

**Constraints**:
- Unique project names (case-insensitive)
- At least one user required (creator)

---

## API Documentation

### Authentication Endpoints

#### POST `/users/register`

**Purpose**: Create a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation**:
- Email must be valid email format
- Password minimum 3 characters

**Response** (201 Created):
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 400: Validation errors
- 500: Server error (e.g., duplicate email)

#### POST `/users/login`

**Purpose**: Authenticate user and get JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 401: Invalid credentials
- 400: Validation errors

#### GET `/users/profile`

**Purpose**: Get current user profile

**Authentication**: Required (JWT)

**Response** (200 OK):
```json
{
  "user": {
    "email": "user@example.com"
  }
}
```

#### GET `/users/logout`

**Purpose**: Logout user and blacklist token

**Authentication**: Required (JWT)

**Side Effects**:
- Adds token to Redis blacklist (if Redis connected)
- Token expires in 24 hours

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

#### GET `/users/all`

**Purpose**: Get all users except current user (for adding collaborators)

**Authentication**: Required (JWT)

**Response** (200 OK):
```json
{
  "allUsers": [
    {
      "_id": "...",
      "email": "other@example.com"
    }
  ]
}
```

### Project Endpoints

#### POST `/projects/create`

**Purpose**: Create a new project

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "name": "my-awesome-project"
}
```

**Validation**:
- Name must be a string

**Response** (201 Created):
```json
{
  "newProject": {
    "_id": "...",
    "name": "my-awesome-project",
    "users": ["user_id"]
  }
}
```

**Errors**:
- 400: Validation errors
- 500: Duplicate project name

#### GET `/projects/all`

**Purpose**: Get all projects for current user

**Authentication**: Required (JWT)

**Response** (200 OK):
```json
{
  "projects": [
    {
      "_id": "...",
      "name": "project1",
      "users": ["user_id"]
    }
  ]
}
```

#### PUT `/projects/add-users`

**Purpose**: Add collaborators to a project

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "projectId": "project_id",
  "users": ["user_id_1", "user_id_2"]
}
```

**Validation**:
- projectId must be a string
- users must be an array of strings (ObjectIds)
- Current user must be a member of the project

**Response** (200 OK):
```json
{
  "project": {
    "_id": "...",
    "name": "project1",
    "users": [
      { "_id": "...", "email": "user1@example.com" },
      { "_id": "...", "email": "user2@example.com" }
    ]
  }
}
```

**Errors**:
- 400: Validation errors
- 500: User not authorized or project not found

#### GET `/projects/get-project/:projectId`

**Purpose**: Get project details with populated users

**Authentication**: Required (JWT)

**Response** (200 OK):
```json
{
  "project": {
    "_id": "...",
    "name": "project1",
    "users": [
      { "_id": "...", "email": "user@example.com" }
    ]
  }
}
```

### AI Endpoints

#### GET `/ai/get-result/:prompt`

**Purpose**: Generate AI response for a prompt

**Authentication**: None (public endpoint - should be protected!)

**URL Parameters**:
- `prompt`: The text prompt for AI

**Response** (200 OK):
```json
{
  "text": "Here's your code...",
  "fileTree": {
    "app.js": {
      "file": {
        "contents": "const express = require('express')..."
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}
```

**Note**: This endpoint is currently unprotected and should have authentication!

---

## Real-time Communication

### Socket.IO Architecture

**Connection Flow**:
```
1. Client connects with JWT token and projectId
2. Server validates token and project
3. Client joins project-specific room
4. Messages broadcast to all room members
5. AI messages trigger additional processing
```

**Room Isolation**:
- Each project has its own room (room ID = project._id)
- Messages only sent to users in the same room
- Prevents cross-project message leakage

**Socket Authentication Middleware**:
```javascript
io.use(async (socket, next) => {
  // 1. Extract token from handshake
  const token = socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(" ")[1];

  // 2. Validate project ID
  const projectId = socket.handshake.query.projectId;
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  // 3. Fetch project
  socket.project = await projectModel.findById(projectId);

  // 4. Verify JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.user = decoded;

  next();
});
```

**Message Structure**:
```javascript
{
  id: "unique-id",              // Generated client-side or server-side
  text: "Message content",      // Plain text or markdown
  sender: "user@example.com",   // Email or "AI"
  timestamp: "10:30 AM",        // Formatted time string
  fileTree: {...},              // Optional: AI-generated file structure
  buildCommand: {...},          // Optional: Build command
  startCommand: {...}           // Optional: Start command
}
```

### AI Message Processing

**Detection**:
- Messages containing "@ai" trigger AI processing
- Original message broadcast immediately
- AI processing happens asynchronously

**Processing Flow**:
```
1. User sends: "@ai create a React app"
2. Server broadcasts original message
3. Server detects "@ai" keyword
4. Extract prompt: "create a React app"
5. Call AI service with prompt
6. Parse AI response (JSON)
7. Extract text, fileTree, commands
8. Broadcast AI message with all data
```

**Error Handling**:
- Try-catch around AI processing
- Send error message to client on failure
- Doesn't crash the socket connection

---

## AI Integration

### Google Gemini 2.0 Flash Configuration

**Model Setup** (`ai.service.js`):
```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",  // Force JSON responses
    temperature: 0.4,                      // Lower = more deterministic
    maxOutputTokens: 8192                  // Maximum response length
  },
  systemInstruction: "..." // Detailed prompt engineering
});
```

**System Instruction Highlights**:
- Expert in MERN stack development
- 10 years of experience persona
- Modular code with best practices
- Proper error handling
- Markdown formatting in JSON
- Always include fileTree for code generation
- Provide build and start commands

**Response Format**:
```json
{
  "text": "Markdown-formatted explanation with code blocks",
  "fileTree": {
    "filename.js": {
      "file": {
        "contents": "file content here"
      }
    },
    "folder": {
      "nested.js": {
        "file": {
          "contents": "nested file content"
        }
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}
```

**Response Parsing**:
1. Try to parse as JSON
2. Extract text field and convert `\n` to newlines
3. Extract fileTree, buildCommand, startCommand
4. Fallback: Use regex to extract text field
5. Advanced regex for fileTree extraction
6. Final fallback: Return raw response

**Error Handling**:
- Quota exceeded (429): User-friendly message
- Access denied (403): API key permission error
- Bad request (400): Invalid prompt error
- Missing API key: Configuration error
- Generic errors: Wrapped with context

**Limitations**:
- 8192 token output limit
- JSON parsing can fail with complex responses
- Regex fallback may not capture all data
- No streaming responses (all-or-nothing)

---

## Authentication & Security

### JWT Authentication

**Token Generation**:
```javascript
jwt.sign(
  { email: user.email },      // Payload
  process.env.JWT_SECRET,     // Secret key
  { expiresIn: "1d" }         // 24-hour expiration
)
```

**Token Storage**:
- Frontend: localStorage (`token` key)
- Backend: Validated on each request
- Socket.IO: Passed in handshake auth

**Token Validation**:
1. Extract from cookies or Authorization header
2. Check Redis blacklist (if available)
3. Verify signature with JWT_SECRET
4. Check expiration
5. Attach decoded payload to request

### Password Security

**Hashing**:
- Algorithm: Bcrypt
- Salt rounds: 10
- Automatic salt generation

**Password Requirements**:
- Minimum 3 characters (should be increased!)
- No complexity requirements (should be added!)

**Password Comparison**:
```javascript
await bcrypt.compare(plainPassword, hashedPassword)
```

### Redis Token Blacklisting

**Purpose**: Invalidate tokens on logout

**Implementation**:
```javascript
// On logout
await redisClient.set(token, 'logout', {
  EX: 60 * 60 * 24  // 24 hours (matches JWT expiration)
});

// On authentication
const isBlackListed = await redisClient.get(token);
if (isBlackListed) {
  return 401 Unauthorized
}
```

**Graceful Degradation**:
- Redis is optional
- App continues without Redis
- Logs errors but doesn't crash
- Skips blacklist check if Redis unavailable

### CORS Configuration

**Development**:
```javascript
origin: ["http://localhost:5173", "http://localhost:5174"]
```

**Production**:
```javascript
origin: process.env.FRONTEND_URLS.split(',')
```

**Security Features**:
- Credentials allowed (cookies, auth headers)
- Specific methods: GET, POST, PUT, DELETE, OPTIONS
- Custom headers: Content-Type, Authorization

### Security Issues & Recommendations

**Critical Issues**:
1. ❌ AI endpoint (`/ai/get-result/:prompt`) is unprotected
2. ❌ Password minimum length is only 3 characters
3. ❌ No rate limiting on any endpoints
4. ❌ No input sanitization for project names
5. ❌ JWT secret should be stronger (min 32 characters)

**Recommendations**:
1. ✅ Add authentication to AI endpoint
2. ✅ Increase password minimum to 8+ characters
3. ✅ Add complexity requirements (uppercase, numbers, symbols)
4. ✅ Implement rate limiting (express-rate-limit)
5. ✅ Add input sanitization (express-mongo-sanitize)
6. ✅ Add helmet.js for security headers
7. ✅ Implement CSRF protection
8. ✅ Add request size limits
9. ✅ Implement account lockout after failed attempts
10. ✅ Add email verification

---

## Frontend Components

### Component Hierarchy

```
App (UserProvider)
  └── AppRoutes (BrowserRouter)
      ├── Login
      ├── Register
      ├── Dashboard (redirects to Home)
      ├── Home (UserAuth)
      └── Project (UserAuth)
          ├── MessageContent
          ├── FileTreePanel
          └── FileViewer
```

### Core Components

#### 1. UserProvider (`user.context.jsx`)

**Purpose**: Global state management for authentication

**State**:
```javascript
{
  user: null | { email: string },
  token: null | string,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: null | string
}
```

**Actions**:
- `login(credentials)`: Authenticate user
- `register(credentials)`: Create new account
- `logout()`: Clear session and blacklist token
- `updateUser(userData)`: Update user profile
- `clearError()`: Clear error messages

**Side Effects**:
- Sets axios Authorization header on token change
- Persists token and user to localStorage
- Validates token on app load
- Auto-logout on invalid token

**Reducer Actions**:
- `SET_LOADING`: Update loading state
- `LOGIN_SUCCESS`: Set user and token
- `LOGOUT`: Clear all user data
- `SET_ERROR`: Set error message
- `CLEAR_ERROR`: Clear error message
- `UPDATE_USER`: Partial user update

#### 2. UserAuth (`UserAuth.jsx`)

**Purpose**: Protected route wrapper

**Behavior**:
- Shows loading spinner while checking auth
- Redirects to `/login` if not authenticated
- Renders children if authenticated

**Usage**:
```jsx
<Route path="/" element={<UserAuth><Home /></UserAuth>} />
```

#### 3. Home (`Home.jsx`)

**Purpose**: Project list and creation

**Features**:
- Display all user projects in grid
- Create new project modal
- Navigate to project workspace
- Show user count per project
- Logout functionality

**State**:
- `projects`: Array of user projects
- `isModalOpen`: Modal visibility
- `formData`: New project form data

**API Calls**:
- `GET /projects/all`: Fetch user projects
- `POST /projects/create`: Create new project

#### 4. Project (`Project.jsx`) - 885 lines

**Purpose**: Main collaborative workspace

**Major Features**:
1. Real-time chat with AI
2. File tree visualization
3. Multi-tab code editor
4. Collaborator management
5. File editing with save/cancel

**State Management** (13 state variables):
```javascript
project              // Current project data
loading              // Loading state
error                // Error messages
messages             // Chat messages array
newMessage           // Current message input
showUserList         // User list popup visibility
showAddCollaboratorModal  // Add user modal visibility
allUsers             // Available users to add
loadingUsers         // Users loading state
currentFileTree      // AI-generated file structure
openFiles            // Array of open file tabs
activeFile           // Currently selected file
editingFiles         // Map of files being edited
buildCommand         // AI-suggested build command
startCommand         // AI-suggested start command
```

**Sub-Components**:

##### MessageContent
- Renders chat messages
- Markdown support for AI messages
- Custom styling for code blocks
- Syntax highlighting via markdown

##### FileTreePanel
- Recursive file tree rendering
- Folder/file icons
- Click to open files
- Build/Start command buttons
- Active file highlighting

##### FileViewer
- Multi-tab interface
- File content display
- Edit mode with textarea
- Save/Cancel buttons
- Copy to clipboard
- Keyboard shortcuts (Ctrl+S, Escape)
- Modified indicator (●)

**Socket.IO Integration**:
```javascript
// Connect to project room
createSocketConnection(projectId)

// Receive messages
receiveMessage('project-message', (message) => {
  // Handle regular and AI messages
  // Update file tree if AI response
})

// Send messages
sendMessage(message)

// Cleanup on unmount
disconnectSocket()
```

**AI Message Handling**:
1. Detect AI message (sender === "AI")
2. Extract fileTree from message
3. Update currentFileTree state
4. Update build/start commands
5. Enable file tree panel

**File Management**:
- Open multiple files in tabs
- Track modifications per file
- Save changes to file content
- Close tabs individually
- Switch between open files
- Keyboard shortcuts for save/cancel

**Collaborator Management**:
- View team members
- Add new collaborators
- Filter already-added users
- Real-time user list updates

#### 5. Login & Register

**Shared Features**:
- Form validation
- Password visibility toggle
- Error display
- Loading states
- Navigation links

**Login Specific**:
- Email and password fields
- Remember credentials (via localStorage)

**Register Specific**:
- Email, password, confirm password
- Password match validation
- Account creation

### Axios Configuration (`axios.js`)

**Base Configuration**:
```javascript
baseURL: import.meta.env.VITE_API_URL
```

**Request Interceptor**:
- Automatically adds Authorization header
- Reads token from localStorage
- Applied to all requests

**Usage**:
```javascript
import axios from '../config/axios'
axios.get('/projects/all')  // Automatically includes token
```

### Socket.IO Configuration (`socket.js`)

**Connection Management**:
- Singleton pattern (one instance per project)
- Automatic token inclusion
- Project-based rooms

**API**:
```javascript
createSocketConnection(projectId)
receiveMessage(eventName, callback)
sendMessage(message)
disconnectSocket()
```

---

## Backend Services

### User Service (`user.service.js`)

**Functions**:

#### `createUser({ email, password })`
- Validates input
- Hashes password
- Creates user in database
- Returns user object

#### `getAllUsers(userId)`
- Fetches all users except current user
- Used for collaborator selection
- Returns array of users

### Project Service (`project.service.js`)

**Functions**:

#### `createProject({ name, userId })`
- Validates input
- Creates project with user as member
- Handles duplicate name errors
- Returns project object

#### `getAllProjects(userId)`
- Fetches projects where user is a member
- Returns array of projects

#### `addUserToProject({ users, projectId, userId })`
- Validates all inputs
- Checks user authorization
- Adds users to project (no duplicates)
- Populates user details
- Returns updated project

#### `getProjectById(projectId)`
- Validates project ID
- Fetches project with populated users
- Returns project object

**Validation**:
- ObjectId validation for all IDs
- Array validation for users
- Authorization checks
- Detailed error messages

### AI Service (`ai.service.js`)

**Main Function**: `generateResult(prompt)`

**Process**:
1. Validate prompt (not empty)
2. Call Google Generative AI
3. Parse JSON response
4. Extract text, fileTree, commands
5. Handle parsing errors with fallbacks
6. Return structured response

**Response Structure**:
```javascript
{
  text: string,              // Markdown-formatted response
  fileTree: object | null,   // File structure
  buildCommand: object | null,
  startCommand: object | null
}
```

**Error Handling**:
- Quota exceeded (429)
- Access denied (403)
- Bad request (400)
- Missing API key
- Generic errors

**Parsing Strategy**:
1. Try JSON.parse
2. Remove markdown code blocks
3. Extract text field
4. Convert escaped newlines
5. Fallback to regex extraction
6. Advanced fileTree parsing
7. Final fallback to raw response

### Redis Service (`redis.service.js`)

**Purpose**: Optional token blacklisting

**Configuration**:
```javascript
{
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  reconnectStrategy: exponential backoff (max 10 retries)
}
```

**Connection Management**:
- Auto-connect on startup
- Graceful error handling
- Connection status tracking
- Event listeners for connect/error/ready/end

**Usage**:
```javascript
// Set token blacklist
await redisClient.set(token, 'logout', { EX: 86400 })

// Check blacklist
const isBlacklisted = await redisClient.get(token)
```

**Graceful Degradation**:
- App works without Redis
- Logs errors but continues
- Skips blacklist checks if unavailable

---

## Deployment

### Platform: Render

**Deployment Architecture**:
- Backend: Web Service (Node.js)
- Frontend: Static Site (Vite build)
- Database: MongoDB Atlas (external)
- Redis: Optional (external)

### Backend Deployment

**Configuration** (`backend/render.yaml`):
```yaml
services:
  - type: web
    name: cobuilder-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
```

**Environment Variables**:
```bash
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GOOGLE_API_KEY=your-api-key
FRONTEND_URLS=https://your-frontend.onrender.com
REDIS_HOST=optional
REDIS_PORT=optional
REDIS_PASSWORD=optional
```

**Build Process**:
1. Clone repository
2. Navigate to `backend` directory
3. Run `npm install`
4. Start with `npm start` (runs `node server.js`)

**Health Check**:
- Endpoint: `GET /`
- Expected: "Hello World"

### Frontend Deployment

**Configuration** (`frontend/render.yaml`):
```yaml
services:
  - type: web
    name: cobuilder-frontend
    env: static
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
```

**Environment Variables**:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

**Build Process**:
1. Clone repository
2. Navigate to `frontend` directory
3. Run `npm install`
4. Run `npm run build` (Vite production build)
5. Serve `dist` directory as static files

**Vite Build Configuration**:
- Output: `dist/`
- Minification: Terser
- Source maps: Disabled
- Code splitting: Vendor, router, UI, utils chunks

### Deployment Steps

1. **Setup MongoDB Atlas**
   - Create free cluster
   - Get connection string
   - Whitelist IP addresses (0.0.0.0/0 for Render)

2. **Deploy Backend**
   - Connect GitHub repository
   - Set root directory: `backend`
   - Configure environment variables
   - Deploy and note URL

3. **Deploy Frontend**
   - Create static site
   - Set root directory: `frontend`
   - Set `VITE_API_URL` to backend URL
   - Deploy and note URL

4. **Update Backend CORS**
   - Update `FRONTEND_URLS` with frontend URL
   - Redeploy backend

5. **Test Deployment**
   - Visit frontend URL
   - Register/login
   - Create project
   - Test real-time chat
   - Test AI features

### Production Considerations

**Free Tier Limitations**:
- Backend spins down after 15 minutes of inactivity
- Cold start takes 30-60 seconds
- 750 hours/month limit
- Limited bandwidth

**Scaling Recommendations**:
- Upgrade to paid plan for production
- Use CDN for frontend assets
- Implement caching strategies
- Add monitoring and logging
- Set up error tracking (Sentry)

**Security Checklist**:
- ✅ Environment variables configured
- ✅ CORS properly set
- ✅ JWT secret is strong
- ✅ MongoDB connection secured
- ❌ Rate limiting not implemented
- ❌ Input sanitization missing
- ❌ Security headers not configured

---

## Environment Configuration

### Backend Environment Variables

**Required**:
```bash
# Server Configuration
PORT=3001                    # Server port (Render overrides to 10000)
NODE_ENV=development         # Environment: development | production

# Database
MONGO_URI=mongodb://localhost:27017/cobuilder

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI Integration
GOOGLE_API_KEY=your-google-ai-api-key

# CORS
FRONTEND_URLS=http://localhost:5173,http://localhost:5174
```

**Optional**:
```bash
# Redis (Token Blacklisting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Environment File**: `backend/.env` (not committed)

**Template**: `backend/env.example`

### Frontend Environment Variables

**Required**:
```bash
# API Configuration
VITE_API_URL=http://localhost:3001
```

**Environment File**: `frontend/.env.local` (not committed)

**Template**: `frontend/env.example`

**Note**: Vite requires `VITE_` prefix for environment variables

### Development vs Production

**Development**:
```bash
# Backend
PORT=3001
MONGO_URI=mongodb://localhost:27017/cobuilder
FRONTEND_URLS=http://localhost:5173,http://localhost:5174

# Frontend
VITE_API_URL=http://localhost:3001
```

**Production**:
```bash
# Backend
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cobuilder
FRONTEND_URLS=https://cobuilder-frontend.onrender.com

# Frontend
VITE_API_URL=https://cobuilder-backend.onrender.com
```

---

## Known Issues & TODOs

### Critical Issues

1. **Unprotected AI Endpoint**
   - **Issue**: `/ai/get-result/:prompt` has no authentication
   - **Impact**: Anyone can use your Google AI quota
   - **Fix**: Add `authMiddleware` to route

2. **Weak Password Requirements**
   - **Issue**: Minimum 3 characters, no complexity
   - **Impact**: Vulnerable to brute force attacks
   - **Fix**: Increase to 8+ chars, add complexity rules

3. **No Rate Limiting**
   - **Issue**: No protection against abuse
   - **Impact**: DDoS vulnerability, API quota exhaustion
   - **Fix**: Implement express-rate-limit

4. **No Input Sanitization**
   - **Issue**: Project names and messages not sanitized
   - **Impact**: Potential NoSQL injection, XSS
   - **Fix**: Add express-mongo-sanitize, DOMPurify

5. **Missing Error Boundaries**
   - **Issue**: Frontend crashes on unhandled errors
   - **Impact**: Poor user experience
   - **Fix**: Add React error boundaries

### Medium Priority Issues

6. **No Email Verification**
   - Users can register with any email
   - No password reset functionality

7. **No File Size Limits**
   - AI can generate unlimited file content
   - No request body size limits

8. **No Logging System**
   - No structured logging
   - Hard to debug production issues

9. **No Monitoring**
   - No uptime monitoring
   - No error tracking
   - No performance metrics

10. **Duplicate Message Prevention**
    - Uses client-generated IDs
    - Potential for duplicates on reconnection

### Low Priority Issues

11. **Dashboard Component Unused**
    - Redirects to Home immediately
    - Should be removed or repurposed

12. **HTML Title Not Updated**
    - Still shows "Vite + React"
    - Should be "CoBuilder"

13. **No Loading States**
    - Some API calls lack loading indicators
    - Poor UX during slow connections

14. **No Pagination**
    - All projects loaded at once
    - All messages loaded at once
    - Will be slow with many items

15. **No Search/Filter**
    - Can't search projects
    - Can't filter messages
    - Can't search files in tree

### Code Quality Issues

16. **Large Component**
    - Project.jsx is 885 lines
    - Should be split into smaller components

17. **Inconsistent Error Handling**
    - Some errors logged, some thrown
    - No consistent error format

18. **Magic Numbers**
    - Hard-coded values (e.g., salt rounds = 10)
    - Should be in config

19. **No TypeScript**
    - No type safety
    - Prone to runtime errors

20. **No Tests**
    - No unit tests
    - No integration tests
    - No E2E tests

### TODOs Found in Code

**None explicitly marked** - but many improvements needed!

---

## Improvement Recommendations

### Security Enhancements (High Priority)

#### 1. Protect AI Endpoint
```javascript
// backend/routes/ai.routes.js
import authMiddleware from '../middleware/auth.middleware.js';

router.get('/get-result/:prompt', authMiddleware, getResult);
```

#### 2. Strengthen Password Requirements
```javascript
// backend/routes/user.routes.js
body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character')
```

#### 3. Add Rate Limiting
```javascript
// backend/app.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // 5 login attempts per 15 minutes
});

app.use('/users/login', authLimiter);
app.use('/users/register', authLimiter);
```

#### 4. Add Input Sanitization
```javascript
// backend/app.js
import mongoSanitize from 'express-mongo-sanitize';

app.use(mongoSanitize()); // Prevent NoSQL injection
```

#### 5. Add Security Headers
```javascript
// backend/app.js
import helmet from 'helmet';

app.use(helmet()); // Sets various HTTP headers
```

#### 6. Add Request Size Limits
```javascript
// backend/app.js
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

### Architecture Improvements (Medium Priority)

#### 7. Split Large Components
```
Project.jsx (885 lines) should be split into:
- ProjectWorkspace.jsx (main container)
- ChatPanel.jsx (messages + input)
- FileTreePanel.jsx (already separate, extract)
- FileViewer.jsx (already separate, extract)
- CollaboratorPanel.jsx (user management)
- CommandPanel.jsx (build/start buttons)
```

#### 8. Add Error Boundaries
```jsx
// frontend/src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### 9. Implement Proper Logging
```javascript
// backend/utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

#### 10. Add Monitoring
```javascript
// backend/app.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Feature Enhancements (Low Priority)

#### 11. Add Pagination
```javascript
// backend/controller/project.controller.js
export const getAllProjects = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const projects = await projectModel
    .find({ users: req.user.email })
    .skip(skip)
    .limit(limit);

  const total = await projectModel.countDocuments({ users: req.user.email });

  res.json({
    projects,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};
```

#### 12. Add Search Functionality
```javascript
// backend/controller/project.controller.js
export const searchProjects = async (req, res) => {
  const { query } = req.query;

  const projects = await projectModel.find({
    users: req.user.email,
    name: { $regex: query, $options: 'i' }
  });

  res.json({ projects });
};
```

#### 13. Add Email Verification
```javascript
// backend/models/user.model.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  verificationExpires: { type: Date, select: false }
});

// Send verification email on registration
// Verify token on email link click
```

#### 14. Add Password Reset
```javascript
// backend/models/user.model.js
const userSchema = new mongoose.Schema({
  // ... existing fields
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false }
});

// Routes:
// POST /users/forgot-password - Send reset email
// POST /users/reset-password/:token - Reset password
```

#### 15. Add File Upload
```javascript
// Allow users to upload files to projects
// Store in cloud storage (AWS S3, Cloudinary)
// Display in file tree alongside AI-generated files
```

### Code Quality Improvements

#### 16. Add TypeScript
```bash
# Convert to TypeScript for type safety
npm install --save-dev typescript @types/react @types/node

# Create tsconfig.json
# Rename .js/.jsx to .ts/.tsx
# Add type definitions
```

#### 17. Add Testing
```javascript
// Unit tests with Jest
// Integration tests with Supertest
// E2E tests with Playwright

// Example:
describe('User Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});
```

#### 18. Add Linting & Formatting
```bash
# ESLint for code quality
npm install --save-dev eslint eslint-config-airbnb

# Prettier for formatting
npm install --save-dev prettier eslint-config-prettier

# Husky for pre-commit hooks
npm install --save-dev husky lint-staged
```

#### 19. Add Documentation
```javascript
// JSDoc comments for functions
/**
 * Create a new project
 * @param {Object} data - Project data
 * @param {string} data.name - Project name
 * @param {string} data.userId - Creator user ID
 * @returns {Promise<Object>} Created project
 * @throws {Error} If project name already exists
 */
export const createProject = async ({ name, userId }) => {
  // ...
};
```

#### 20. Add CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        # ... deployment steps
```

### Performance Optimizations

#### 21. Add Caching
```javascript
// Redis caching for frequently accessed data
import { redisClient } from './services/redis.service.js';

export const getAllProjects = async (req, res) => {
  const cacheKey = `projects:${req.user.email}`;

  // Try cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json({ projects: JSON.parse(cached) });
  }

  // Fetch from database
  const projects = await projectModel.find({ users: req.user.email });

  // Cache for 5 minutes
  await redisClient.set(cacheKey, JSON.stringify(projects), { EX: 300 });

  res.json({ projects });
};
```

#### 22. Optimize Database Queries
```javascript
// Add indexes
userSchema.index({ email: 1 });
projectSchema.index({ users: 1 });
projectSchema.index({ name: 1 });

// Use lean() for read-only queries
const projects = await projectModel.find({ users: userId }).lean();

// Select only needed fields
const users = await userModel.find({}).select('email').lean();
```

#### 23. Add Code Splitting
```javascript
// frontend/src/routes/AppRoutes.jsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('../screens/Home'));
const Project = lazy(() => import('../screens/Project'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<Project />} />
      </Routes>
    </Suspense>
  );
}
```

#### 24. Optimize Bundle Size
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'socket': ['socket.io-client'],
          'markdown': ['markdown-to-jsx']
        }
      }
    }
  }
});
```

### User Experience Improvements

#### 25. Add Notifications
```javascript
// Toast notifications for actions
import { toast } from 'react-hot-toast';

toast.success('Project created successfully!');
toast.error('Failed to save file');
toast.loading('Generating code...');
```

#### 26. Add Keyboard Shortcuts
```javascript
// Global keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

#### 27. Add Dark Mode
```javascript
// Theme context with localStorage persistence
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 28. Add Offline Support
```javascript
// Service worker for offline functionality
// Cache static assets
// Queue API requests when offline
// Sync when back online
```

#### 29. Add Real-time Presence
```javascript
// Show who's currently viewing the project
socket.on('user-joined', (user) => {
  setActiveUsers(prev => [...prev, user]);
});

socket.on('user-left', (user) => {
  setActiveUsers(prev => prev.filter(u => u.id !== user.id));
});
```

#### 30. Add File Download
```javascript
// Download AI-generated files as ZIP
import JSZip from 'jszip';

const downloadProject = async () => {
  const zip = new JSZip();

  // Add files to ZIP
  Object.entries(fileTree).forEach(([path, content]) => {
    zip.file(path, content);
  });

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${project.name}.zip`);
};
```

---

## Summary

### Project Strengths

✅ **Well-structured codebase** with clear separation of concerns
✅ **Modern tech stack** (React 19, Express 5, Socket.IO 4)
✅ **Real-time collaboration** works smoothly
✅ **AI integration** is functional and useful
✅ **Production-ready deployment** configuration
✅ **Environment-based configuration** for flexibility
✅ **Graceful degradation** (Redis optional)

### Critical Improvements Needed

❌ **Security vulnerabilities** (unprotected endpoints, weak passwords)
❌ **No rate limiting** (DDoS vulnerability)
❌ **No input sanitization** (injection risks)
❌ **No testing** (quality assurance)
❌ **Large components** (maintainability)
❌ **No error tracking** (debugging difficulty)

### Recommended Next Steps

1. **Immediate** (Security):
   - Protect AI endpoint
   - Add rate limiting
   - Strengthen password requirements
   - Add input sanitization

2. **Short-term** (Quality):
   - Add error boundaries
   - Implement logging
   - Split large components
   - Add basic tests

3. **Medium-term** (Features):
   - Add pagination
   - Implement search
   - Add email verification
   - Improve UX with notifications

4. **Long-term** (Scale):
   - Convert to TypeScript
   - Add comprehensive testing
   - Implement caching
   - Add monitoring and analytics

### Conclusion

CoBuilder is a **functional and well-architected** collaborative coding platform with AI assistance. The codebase demonstrates good understanding of modern web development practices, with a clean MVC structure on the backend and component-based architecture on the frontend.

However, it requires **significant security hardening** before production use. The unprotected AI endpoint, weak password requirements, and lack of rate limiting are critical vulnerabilities that must be addressed.

With the recommended improvements, CoBuilder has the potential to be a **robust, scalable platform** for collaborative development with AI assistance.

---

## Appendix: Quick Reference

### Start Development

```bash
# Backend
cd backend
npm install
cp env.example .env  # Configure environment
npm run dev

# Frontend
cd frontend
npm install
cp env.example .env.local  # Configure environment
npm run dev
```

### Environment Setup

**Backend** (`.env`):
```bash
PORT=3001
MONGO_URI=mongodb://localhost:27017/cobuilder
JWT_SECRET=your-secret-key-min-32-characters
GOOGLE_API_KEY=your-google-ai-api-key
FRONTEND_URLS=http://localhost:5173
```

**Frontend** (`.env.local`):
```bash
VITE_API_URL=http://localhost:3001
```

### Key Commands

```bash
# Backend
npm start          # Production
npm run dev        # Development (if nodemon configured)

# Frontend
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build

# Database Migration
cd backend
node migrations/migrate-users-field.js
```

### API Endpoints Quick Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/users/register` | No | Create account |
| POST | `/users/login` | No | Login |
| GET | `/users/profile` | Yes | Get profile |
| GET | `/users/logout` | Yes | Logout |
| GET | `/users/all` | Yes | List users |
| POST | `/projects/create` | Yes | Create project |
| GET | `/projects/all` | Yes | List projects |
| PUT | `/projects/add-users` | Yes | Add collaborators |
| GET | `/projects/get-project/:id` | Yes | Get project |
| GET | `/ai/get-result/:prompt` | **No** | Generate code |

### Socket.IO Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `connection` | Client → Server | Join project room |
| `project-message` | Client → Server | Send message |
| `project-message` | Server → Client | Receive message |
| `disconnect` | Client → Server | Leave room |

---

**Documentation Version**: 1.0
**Last Updated**: 2025-12-10
**Project**: CoBuilder
**Author**: AI-Generated Comprehensive Documentation


