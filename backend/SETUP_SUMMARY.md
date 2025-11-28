# ✅ Express + MongoDB Backend - Complete Setup

## Project Overview
A Node.js backend server for a **Financial Planner Web App** using Express, Mongoose, CORS, and dotenv.

## ✅ What's Configured

### 1. Environment Variables (`.env`)
- ✅ Reads from `.env` file using `dotenv`
- ✅ Port defaults to `5000` if not specified
- ✅ MongoDB URI configurable via environment variable

### 2. Express Server
- ✅ Listens on port from `.env` or defaults to `5000`
- ✅ JSON body parsing enabled
- ✅ URL-encoded body parsing enabled

### 3. CORS Middleware
- ✅ Configured for local development
- ✅ Default origin: `http://localhost:3000`
- ✅ Credentials enabled for cookie/session support
- ✅ Can be overridden via `FRONTEND_URL` environment variable

### 4. MongoDB Connection
- ✅ Mongoose integration
- ✅ Connects to `financeplanner` database
- ✅ Connection event handlers (connected, error, disconnected)
- ✅ Graceful shutdown on SIGINT

### 5. API Routes

#### Health Check Route
**GET** `/api/health`

Returns:
```json
{
  "status": "OK"
}
```

#### API Status Route
**GET** `/api`

Returns:
```json
{
  "message": "Financial Planner API is running",
  "status": "success",
  "timestamp": "2025-11-28T07:06:13.000Z"
}
```

### 6. Error Handling
- ✅ 404 handler for unknown routes
- ✅ Global error handler middleware
- ✅ Development-friendly error messages

## 📁 Project Structure

```
backend/
├── index.js              # Main server file ⭐
├── package.json          # Dependencies
├── .env                  # Environment variables (gitignored)
├── models/               # Mongoose schemas
│   ├── User.js
│   └── Budget.js
├── routes/               # API routes (ready for development)
├── controllers/          # Business logic (ready for development)
└── middleware/           # Custom middleware (ready for development)
```

## 🚀 Running the Server

### Development Mode (auto-restart on changes):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## 🧪 Testing

### Test Health Check:
```bash
curl http://localhost:5000/api/health
# Response: {"status":"OK"}
```

### Test API Status:
```bash
curl http://localhost:5000/api
```

### Or open in browser:
- http://localhost:5000/api/health
- http://localhost:5000/api

## 📦 Dependencies Installed

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "express-validator": "^7.0.1"
}
```

**Dev Dependencies:**
```json
{
  "nodemon": "^3.0.2"
}
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/financeplanner

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Secret (for future authentication)
JWT_SECRET=your_secret_key_here
```

## ✅ Verification Checklist

- [x] Express server created
- [x] Reads from `.env` file
- [x] Listens on port from `.env` (defaults to 5000)
- [x] Health check route at `/api/health` returns `{"status": "OK"}`
- [x] CORS configured for `http://localhost:3000`
- [x] Mongoose/MongoDB integration
- [x] Error handling middleware
- [x] Graceful shutdown
- [x] All dependencies installed
- [x] Server tested and working

## 🎯 Next Steps

1. **Start MongoDB** (if using local):
   ```bash
   # Install MongoDB Community Edition
   # Then start the service
   ```

2. **Run the server**:
   ```bash
   npm run dev
   ```

3. **Add API routes** in the `routes/` directory
4. **Create controllers** in the `controllers/` directory
5. **Add authentication** using JWT
6. **Connect frontend** from `http://localhost:3000`

---

**Status:** ✅ Backend is fully configured and ready for development!
