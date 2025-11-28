# Backend - College Finance Planner API

Express.js server with MongoDB integration for the College Finance Planner application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in this directory:
```bash
cp .env.example .env
```

Edit `.env` and configure your MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/financeplanner
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
```

### 3. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 📡 API Endpoints

### Test Routes
- **GET** `/api` - API status check
  ```json
  {
    "message": "Financial Planner API is running",
    "status": "success",
    "timestamp": "2025-11-28T05:51:28.000Z"
  }
  ```

- **GET** `/api/health` - Health check with database status
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "uptime": 123.456
  }
  ```

## 🗄️ Database

### MongoDB Connection Options

**Option 1: Local MongoDB**
```javascript
mongodb://localhost:27017/financeplanner
```

**Option 2: MongoDB Atlas (Cloud)**
```javascript
mongodb+srv://<username>:<password>@cluster.mongodb.net/financeplanner?retryWrites=true&w=majority
```

### Database Name
`financeplanner`

## 📁 Project Structure

```
backend/
├── index.js              # Main server file
├── server.js             # Alternative server file (legacy)
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── models/               # Mongoose schemas
│   ├── User.js          # User model
│   └── Budget.js        # Budget model
├── routes/              # API route handlers
├── controllers/         # Business logic
└── middleware/          # Custom middleware
```

## 🔧 Technologies

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Request validation

## 🛠️ Development

### Testing the API

**Using curl:**
```bash
curl http://localhost:5000/api
```

**Using browser:**
Navigate to `http://localhost:5000/api`

### Adding New Routes

1. Create route file in `routes/` directory
2. Create controller in `controllers/` directory
3. Import and use in `index.js`

Example:
```javascript
// In index.js
const budgetRoutes = require('./routes/budgets');
app.use('/api/budgets', budgetRoutes);
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/financeplanner` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret key for JWT | - |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Enable rate limiting for production
- Validate all user inputs
- Use HTTPS in production

## 📚 Next Steps

- [ ] Implement user authentication routes
- [ ] Create budget CRUD operations
- [ ] Add expense tracking endpoints
- [ ] Implement financial goal management
- [ ] Add data validation middleware
- [ ] Write API tests
- [ ] Add API documentation (Swagger/OpenAPI)

---

**Server Status:** Ready for development 🎉
