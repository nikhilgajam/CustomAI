# CustomAI

A full-stack AI application that provides a secure platform for interacting with custom AI models. Built with React frontend and Node.js/Express backend.

**Developer:** Nikhil Gajam

## Deployment URL's:
- Backend:   custom-ai-backend.vercel.app
- Frontend:  custom-ai-ui.vercel.app

## 🚀 Project Overview

CustomAI is a comprehensive AI platform that allows users to register, authenticate, and interact with AI models through a secure API. The application features user management, file uploads, and AI response generation capabilities.

## 📁 Project Structure

```
CustomAI/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
├── .gitignore
└── CustomAI.postman_collection.json
```

## 🖥️ Client (Frontend)

### Technology Stack
- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

### Features
- User authentication and registration
- Responsive user interface
- Real-time notifications
- File upload capabilities
- AI interaction interface

### Development Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Server (Backend)

### Technology Stack
- **Node.js** with **Express** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Google GenAI** - AI model integration
- **CORS** - Cross-origin resource sharing

### Features
- Secure user authentication with JWT
- File upload and processing
- AI response generation
- User profile management
- Health monitoring
- Error handling middleware

### Development Scripts
```bash
npm run dev      # Start development server with nodemon
```

## 🛣️ API Routes Reference

### Base URL
```
http://localhost:PORT/api/v1
```

### Health Check
- **GET** `/api/v1/healthcheck/` - Check API health status

### User Management Routes
#### Public Routes
- **POST** `/api/v1/user/register` - Register new user (with file upload)
- **POST** `/api/v1/user/login` - User login
- **POST** `/api/v1/user/renewAccessToken` - Refresh access token
- **POST** `/api/v1/user/logout` - User logout

#### Protected Routes (Require Authentication)
- **PUT** `/api/v1/user/edit` - Edit user profile (with file upload)
- **DELETE** `/api/v1/user/delete` - Delete user account

### AI/LLM Routes
#### Protected Routes (Require Authentication)
- **POST** `/api/v1/llm/generateAIResponse` - Generate AI response

### Root Endpoint
- **GET** `/` - API information and developer details

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the request headers or cookies.

### Authentication Flow
1. Register or login to receive JWT tokens
2. Include access token in subsequent requests
3. Use refresh token to renew expired access tokens

## 📁 File Upload

The application supports file uploads through Multer middleware with Cloudinary integration for cloud storage. File uploads are available on:
- User registration
- User profile editing

## 🌐 Environment Variables

### Server (.env)
```env
PORT=9999
DB_NAME=CustomAI
MONGODB_SRV=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=custom_ai_access_secret
ACCESS_TOKEN_EXPIRY=18m
REFRESH_TOKEN_SECRET=custom_ai_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
NODE_ENV=development
GOOGLE_GENAI_MODEL=gemini-2.5-flash-lite
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CustomAI
```

2. **Setup Server**
```bash
cd server
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

3. **Setup Client**
```bash
cd client
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

4. **Access the local application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:9999

## 📋 API Testing

Use the included Postman collection (`CustomAI.postman_collection.json`) to test all API endpoints. Import the collection into Postman and configure the base URL variable.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Request rate limiting
- Input validation and sanitization
- Secure file upload handling

## 📝 License

ISC License

## 👨‍💻 Developer

**Nikhil Gajam**
- GitHub: [nikhilgajam](https://github.com/nikhilgajam)
- YouTube: [nikhiltech](https://youtube.com/nikhiltech)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please reach out through the developer's GitHub or YouTube channels.
