# CoBuilder

A real-time collaborative code building platform with AI assistance.

## Features

- Real-time collaboration on code projects
- AI-powered code generation and assistance
- User authentication and project management
- Live chat with AI integration
- File tree visualization
- Build and start command suggestions

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB (Mongoose)
- JWT Authentication
- Google Generative AI

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database
- Google AI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CoBuilder
   ```

2. **Set up Backend**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   cp env.example .env.local
   # Edit .env.local with your backend URL
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Environment Variables

### Backend (.env)
```bash
PORT=3001
MONGO_URI=mongodb://localhost:27017/cobuilder
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_API_KEY=your-google-ai-api-key
FRONTEND_URLS=http://localhost:5173,http://localhost:5174
```

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:3001
```

## Deployment

This application is configured for deployment on Render. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Steps

1. **Deploy Backend to Render**
   - Connect your repository
   - Set root directory to `backend`
   - Configure environment variables
   - Deploy

2. **Deploy Frontend to Render**
   - Create a static site
   - Set root directory to `frontend`
   - Set `VITE_API_URL` to your backend URL
   - Deploy

3. **Update CORS**
   - Update `FRONTEND_URLS` in backend with your frontend URL

## Project Structure

```
CoBuilder/
├── backend/                 # Backend API server
│   ├── controller/         # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── server.js          # Socket.IO server
│   └── app.js             # Express app
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── screens/       # Page components
│   │   └── config/        # Configuration files
│   └── package.json
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/profile` - Get user profile

### Projects
- `GET /projects` - Get user projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### AI
- `POST /ai/generate` - Generate AI response

## Socket.IO Events

- `project-message` - Send/receive project messages
- `@ai` - Trigger AI processing in messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).
For general questions, please open an issue on GitHub. 