# Dashboard Application

A modern, full-stack dashboard application built with React + Vite (frontend) and Node.js + Express (backend).

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 5** - Build tool
- **TailwindCSS 3** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Chart.js + react-chartjs-2** - Data visualization
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express 4** - Web framework
- **Sequelize 6** - ORM
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **express-validator** - Input validation

## Project Structure

```
dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Buttons, inputs, modals, etc.
│   │   │   ├── layout/     # Sidebar, Header, Footer
│   │   │   ├── charts/     # Chart components
│   │   │   ├── dashboard/  # Dashboard-specific components
│   │   │   ├── sales/      # Sales components
│   │   │   ├── expenses/   # Expense components
│   │   │   └── services/   # Service dashboard components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # API service modules
│   │   └── utils/          # Utility functions
│   ├── index.html
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── seeders/            # Database seeders
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── validators/         # Input validators
│   ├── server.js           # Entry point
│   └── package.json
│
└── docker-compose.yml      # Docker configuration
```

## Features

### User Authentication
- JWT-based authentication
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt

### Dashboards
- **Main Dashboard** (Admin only): Revenue trends, income analysis, service breakdowns, YTD comparisons
- **Services Dashboard** (All users): Per-service performance tracking with daily breakdowns

### Data Management
- **Sales**: Create, read, update, delete sales records
- **Expenses**: Manage expenses by category
- **Services**: Admin management of department/services
- **Users**: User administration (Admin only)

### Additional Features
- Auto-refresh every 30 seconds
- Responsive design (mobile-friendly)
- Beautiful charts and visualizations
- Email notifications via Nodemailer

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd dashboard
```

2. **Set up the backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database and mail credentials
```

3. **Set up the frontend**
```bash
cd ../client
npm install
cp .env.example .env
# Edit .env if needed
```

4. **Create the database**
```sql
CREATE DATABASE dashboard_db;
```

5. **Run database migrations and seeders**
```bash
cd ../server
npm run seed
```

### Running the Application

1. **Start the backend**
```bash
cd server
npm run dev
```
The API will be available at `http://localhost:5000`

2. **Start the frontend** (in a new terminal)
```bash
cd client
npm run dev
```
The app will be available at `http://localhost:5173`

### Using Docker

```bash
docker-compose up -d
```

This will start:
- MySQL database
- Backend API
- Frontend application

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your-email-password
MAIL_FROM=Dashboard <noreply@example.com>
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Sales
- `GET /api/sales` - List sales (with filters)
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department (Admin)
- `PUT /api/departments/:id` - Update department (Admin)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Users
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary (Admin)
- `GET /api/dashboard/revenue-trends` - Revenue trends (Admin)
- `GET /api/dashboard/income-trends` - Income trends (Admin)
- `GET /api/dashboard/service-breakdown` - Service breakdown (Admin)
- `GET /api/dashboard/month-comparison` - Month comparison (Admin)
- `GET /api/dashboard/ytd-comparison` - YTD comparison (Admin)

### Contact
- `POST /api/contact` - Send contact email

## Default Users

After running seeders:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| user@example.com | password123 | User |

## Scripts

### Backend
```bash
npm run dev      # Start development server
npm start        # Start production server
npm run seed     # Run database seeders
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
