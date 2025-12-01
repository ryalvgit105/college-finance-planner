# College Finance Planner

A comprehensive financial planning tool designed for teens entering the workforce or college. This application helps young adults understand budgeting, track expenses, plan for college costs, and develop healthy financial habits early in their journey to financial independence.

## Purpose

The College Finance Planner empowers teens and young adults to:
- **Budget Effectively**: Create and manage monthly budgets tailored to student life
- **Track Expenses**: Monitor spending across categories like tuition, books, food, and entertainment
- **Plan for College**: Estimate college costs and create savings plans
- **Build Financial Literacy**: Learn essential money management skills through interactive tools
- **Set Financial Goals**: Define and track progress toward short-term and long-term financial objectives

## Tech Stack

This is a full-stack MERN application:
- **Frontend**: React.js - Modern, responsive user interface
- **Backend**: Express.js - RESTful API server
- **Database**: MongoDB - Flexible data storage for user profiles and financial data
- **Runtime**: Node.js - JavaScript runtime environment

## Project Structure

```
college-finance-planner/
├── frontend/          # React application
├── backend/           # Express server and MongoDB integration
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ryalvgit105/college-finance-planner.git
   cd college-finance-planner
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set Up Environment Variables**
   - Create a `.env` file in the `backend` directory
   - Add your MongoDB connection string and other configuration:
     ```
     MONGODB_URI=your_mongodb_connection_string
     PORT=5000
     JWT_SECRET=your_secret_key
     ```

5. **Run the Application**
   
   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   In another terminal (frontend):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Pushing to GitHub

### First Time Setup

1. **Initialize Git Repository** (if not already done)
   ```bash
   git init
   ```

2. **Add All Files**
   ```bash
   git add .
   ```

3. **Create Initial Commit**
   ```bash
   git commit -m "Initial commit: Project structure and setup"
   ```

4. **Create a New Repository on GitHub**
   - Go to https://github.com/new
   - Name it `college-finance-planner`
   - Do NOT initialize with README (we already have one)
   - Click "Create repository"

5. **Link Local Repository to GitHub**
   ```bash
   git remote add origin https://github.com/ryalvgit105/college-finance-planner.git
   git branch -M main
   git push -u origin main
   ```

### Subsequent Updates

```bash
git add .
git commit -m "Your commit message"
git push
```

## Features (Planned)

- [ ] User authentication and profiles
- [ ] Income and expense tracking
- [ ] Budget creation and management
- [ ] College cost calculator
- [ ] Savings goal tracker
- [ ] Financial education resources
- [ ] Data visualization (charts and graphs)
- [ ] Mobile-responsive design

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the next generation of financially savvy students**
