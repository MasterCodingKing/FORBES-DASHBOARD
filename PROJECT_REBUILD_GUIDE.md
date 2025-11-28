# Dashboard Project - Rebuild Guide

> **Original Stack:** Laravel + PHP + MySQL + Blade + Chart.js  
> **New Stack:** React (Vite + TailwindCSS) + Node.js + Express + Sequelize ORM + MySQL + JWT Authentication + Nodemailer

---

## 📁 Project Structure (New Stack)

```
dashboard-project/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── charts/
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── DoughnutChart.jsx
│   │   │   │   └── ComparativeChart.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── IncomeChart.jsx
│   │   │   │   ├── ServiceBreakdown.jsx
│   │   │   │   ├── MonthToMonthComparison.jsx
│   │   │   │   └── YTDComparative.jsx
│   │   │   ├── sales/
│   │   │   │   ├── SalesTable.jsx
│   │   │   │   └── AddSaleModal.jsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpensesTable.jsx
│   │   │   │   └── AddExpenseModal.jsx
│   │   │   ├── users/
│   │   │   │   ├── UsersTable.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── UserCard.jsx
│   │   │   └── services/
│   │   │       ├── ServicesDashboard.jsx
│   │   │       ├── ServiceSelector.jsx
│   │   │       └── DailyPerformanceChart.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ServicesDashboard.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── UserCreate.jsx
│   │   │   ├── UserEdit.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   └── useAutoRefresh.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── salesService.js
│   │   │   ├── expenseService.js
│   │   │   ├── userService.js
│   │   │   ├── departmentService.js
│   │   │   └── dashboardService.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── routes/
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── AppRoutes.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js Backend (Express)
│   ├── config/
│   │   ├── database.js              # Sequelize configuration
│   │   ├── jwt.js                   # JWT configuration
│   │   └── mail.js                  # Nodemailer configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── salesController.js
│   │   ├── expenseController.js
│   │   ├── departmentController.js
│   │   ├── dashboardController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── adminMiddleware.js       # Admin role check
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── models/
│   │   ├── index.js                 # Sequelize models index
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Sale.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── contactRoutes.js
│   ├── seeders/
│   │   ├── departmentSeeder.js
│   │   └── userSeeder.js
│   ├── services/
│   │   ├── emailService.js          # Nodemailer service
│   │   └── dashboardService.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── hashPassword.js
│   │   └── dateHelpers.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── salesValidator.js
│   │   └── expenseValidator.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── README.md
└── docker-compose.yml               # Optional: for MySQL container
```

---

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    remember_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Departments Table (Services)
```sql
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication System (JWT)

### Features
- User login with username/password
- JWT token generation on successful login
- Token stored in localStorage/httpOnly cookie
- Protected routes requiring valid JWT
- Admin role-based access control
- Auto logout on token expiration
- Remember me functionality

### JWT Payload Structure
```javascript
{
  userId: number,
  username: string,
  isAdmin: boolean,
  iat: timestamp,
  exp: timestamp
}
```

### Auth Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Protected |
| GET | `/api/auth/me` | Get current user | Protected |
| POST | `/api/auth/refresh` | Refresh token | Protected |

---

## 📊 Features & Pages

### 1. Home Page (Public)
- **Route:** `/`
- **Access:** Public
- **Features:**
  - Welcome page with company branding
  - Login button for authenticated access
  - Basic company information

### 2. Login Page
- **Route:** `/login`
- **Access:** Guest only (redirect if authenticated)
- **Features:**
  - Username/password form
  - Remember me checkbox
  - Form validation
  - Error messages display
  - Redirect based on role (admin → dashboard, user → services dashboard)

### 3. Main Dashboard (Admin Only)
- **Route:** `/dashboard`
- **Access:** Admin only
- **Features:**

#### 3.1 Monthly Revenue Trend
- Line chart showing revenue by month
- Table with monthly breakdown and yearly total
- Currency format: ₱ (Philippine Peso)

#### 3.2 Monthly Income Trend
- Line chart showing income (revenue - expenses) by month
- Table with monthly breakdown and yearly total

#### 3.3 Month-to-Month Comparative
- Comparison table (current vs previous month by service)
- Columns: Service, Previous Month, Current Month, Inc/Dec Amount, Inc/Dec %
- Total row with overall comparison
- Bar chart for visual comparison
- Revenue statistics cards

#### 3.4 Service Breakdown (Current Month)
- Doughnut/pie chart showing revenue by service
- Table with service name, revenue, and percentage

#### 3.5 Year-to-Date Sales Comparative
- Bar chart comparing current year vs previous year by month
- Table with monthly breakdown for both years
- Variance row showing differences

#### 3.6 Year-to-Date Income Comparative
- Bar chart comparing current year vs previous year income
- Table with monthly breakdown
- Variance calculations

#### Dashboard Features:
- **Auto-refresh:** Every 30 seconds
- **Manual refresh button**
- **Last updated indicator**
- **Responsive design**

### 4. Services Dashboard (Authenticated Users)
- **Route:** `/services/dashboard`
- **Access:** All authenticated users
- **Features:**

#### 4.1 Control Panel
- Service selector dropdown
- Display month selector
- Target month selector

#### 4.2 Performance Stats Cards
- **Sales:** Total sales for selected month
- **Target:** Target amount from selected target month
- **% of Target:** Achievement percentage
- **Difference $:** Variance (positive/negative with color coding)

#### 4.3 Daily Performance Chart
- Bar chart showing daily variance from target
- Green bars for above target, red for below
- Target baseline line
- Tooltips with detailed info

#### 4.4 Daily Breakdown Table
- Split into two halves (Days 1-15, Days 16-31)
- Color-coded variance values
- Monthly total variance

### 5. Sales Management
- **Route:** `/sales`
- **Access:** Authenticated users
- **Features:**
  - Table listing all sales records
  - Columns: ID, Service, Amount, Date, Actions (admin only)
  - Add new sale modal
  - Delete sale (admin only)
  - Form fields: Service dropdown, Amount, Date

### 6. Expense Management
- **Route:** `/expenses`
- **Access:** Authenticated users
- **Features:**
  - Table listing all expenses
  - Columns: ID, Description, Category, Amount, Date, Actions (admin only)
  - Add new expense modal
  - Delete expense (admin only)
  - Form fields: Description, Category dropdown, Amount, Date
  - **Expense Categories:**
    - General
    - Utilities
    - Supplies
    - Marketing
    - Salaries
    - Rent
    - Equipment
    - Travel
    - Maintenance
    - Other

### 7. Services/Departments Management (Admin Only)
- **Route:** `/services`
- **Access:** Admin only
- **Features:**
  - List all services/departments
  - Add new service
  - Edit service details
  - Delete service

### 8. User Management (Admin Only)
- **Route:** `/users`
- **Access:** Admin only
- **Features:**

#### User List
- Table: ID, First Name, Last Name, Username, Role (Admin/User), Actions
- Edit and Delete buttons

#### Create User (`/users/create`)
- Form fields:
  - First Name (letters and spaces only)
  - Last Name (letters and spaces only)
  - Username (alphanumeric + underscore, min 3 chars, unique)
  - Password (min 6 chars)
  - Confirm Password
  - Is Admin checkbox

#### Edit User (`/users/:id/edit`)
- Same fields as create
- Password optional (only update if provided)
- Cannot change own admin status

#### Delete User
- Confirmation required
- Cannot delete last admin
- Cannot delete own account

---

## 🔌 API Endpoints

### Authentication Routes
```
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user profile
```

### Dashboard Routes
```
GET    /api/dashboard           - Get main dashboard data (admin)
GET    /api/dashboard/services  - Get services dashboard data
```

### Sales Routes
```
GET    /api/sales               - List all sales
POST   /api/sales               - Create new sale
DELETE /api/sales/:id           - Delete sale (admin only)
```

### Expense Routes
```
GET    /api/expenses            - List all expenses
POST   /api/expenses            - Create new expense
DELETE /api/expenses/:id        - Delete expense (admin only)
```

### Department Routes
```
GET    /api/departments         - List all departments
POST   /api/departments         - Create department (admin)
PUT    /api/departments/:id     - Update department (admin)
DELETE /api/departments/:id     - Delete department (admin)
```

### User Routes
```
GET    /api/users               - List all users (admin)
POST   /api/users               - Create user (admin)
GET    /api/users/:id           - Get user details (admin)
PUT    /api/users/:id           - Update user (admin)
DELETE /api/users/:id           - Delete user (admin)
```

### Contact Routes (Nodemailer)
```
POST   /api/contact             - Send contact form email
```

---

## 📧 Nodemailer Configuration

### Use Cases
1. **Contact Form Notifications** - Send email when contact form submitted
2. **User Registration Notifications** - Welcome email to new users
3. **Password Reset** (future enhancement)
4. **Performance Alerts** (optional) - Notify when below target

### Email Templates
- Contact form submission notification
- New user welcome email
- Password reset email (optional)

---

## 🎨 UI/UX Specifications

### Color Palette
```css
/* Primary Colors */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Status Colors */
--success: #2ecc71;
--danger: #e74c3c;
--warning: #f39c12;
--info: #3498db;

/* Chart Colors */
--chart-red: #e74c3c;
--chart-green: #2ecc71;
--chart-blue: #3498db;
--chart-purple: #9b59b6;
--chart-orange: #f39c12;
--chart-teal: #1abc9c;
--chart-dark: #34495e;
--chart-gold: #e67e22;

/* Neutral Colors */
--text-primary: #2c3e50;
--text-secondary: #7f8c8d;
--background: #f8f9fa;
--border: #dee2e6;
```

### Typography
- **Primary Font:** System font stack
- **Currency Format:** ₱ (Philippine Peso)
- **Number Format:** Comma-separated with 2 decimal places

### Components Style
- Rounded corners (border-radius: 8px-15px)
- Box shadows for depth
- Gradient backgrounds for cards
- Hover effects and transitions
- Responsive grid layouts

---

## 📦 Dependencies

### Frontend (client/package.json)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "chart.js": "^4.x",
    "react-chartjs-2": "^5.x",
    "date-fns": "^2.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "tailwindcss": "^3.x",
    "vite": "^5.x"
  }
}
```

### Backend (server/package.json)
```json
{
  "dependencies": {
    "express": "^4.x",
    "sequelize": "^6.x",
    "mysql2": "^3.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "nodemailer": "^6.x",
    "express-validator": "^7.x",
    "helmet": "^7.x",
    "morgan": "^1.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

---

## 🚀 Setup Instructions

### 1. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE dashboard_db;
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure .env with database credentials and JWT secret
npm run migrate
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Configure API URL in .env
npm run dev
```

### Environment Variables

#### Server (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@yourdomain.com
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔒 Security Considerations

1. **Password Hashing:** bcryptjs with salt rounds
2. **JWT Security:** 
   - Short expiration time
   - HTTP-only cookies option
   - Refresh token rotation
3. **Input Validation:** express-validator
4. **CORS Configuration:** Whitelist allowed origins
5. **Rate Limiting:** Implement for login attempts
6. **Helmet.js:** Security headers
7. **SQL Injection Prevention:** Sequelize parameterized queries

---

## 📝 Validation Rules

### User Registration/Update
- **first_name:** Required, letters and spaces only, max 255 chars
- **last_name:** Required, letters and spaces only, max 255 chars
- **username:** Required, alphanumeric + underscore, min 3 chars, unique
- **password:** Required for create, min 6 chars, confirmed

### Sales
- **department_id:** Required, must exist in departments table
- **amount:** Required, positive number, max 2 decimal places
- **date:** Required, valid date format

### Expenses
- **description:** Required, max 255 chars
- **amount:** Required, positive number, max 2 decimal places
- **date:** Required, valid date format
- **category:** Required, must be from allowed categories list

---

## 🧪 Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Protected route access without token
- [ ] Admin-only route access as regular user
- [ ] Token expiration handling

### Dashboard
- [ ] Data loads correctly
- [ ] Auto-refresh works
- [ ] Charts render properly
- [ ] Currency formatting correct
- [ ] Date filtering works

### CRUD Operations
- [ ] Create, Read, Delete sales
- [ ] Create, Read, Delete expenses
- [ ] Create, Read, Update, Delete users
- [ ] Validation error handling
- [ ] Admin-only actions restricted

### Email (Nodemailer)
- [ ] Contact form sends email
- [ ] Email template renders correctly

---

## 🔄 Migration Notes (Laravel → Node.js)

| Laravel | Node.js/Express |
|---------|-----------------|
| Eloquent ORM | Sequelize ORM |
| Blade Templates | React Components |
| Laravel Auth | JWT Authentication |
| Laravel Mail | Nodemailer |
| Laravel Validation | express-validator |
| Middleware | Express Middleware |
| Routes (web.php) | Express Router |
| Controllers | Controllers |
| Models | Sequelize Models |
| Migrations | Sequelize Migrations |
| Seeders | Sequelize Seeders |

---

## 📌 Key Implementation Notes

1. **Chart.js Integration:** Use react-chartjs-2 wrapper for React
2. **Date Handling:** Use date-fns for consistent date manipulation
3. **API Calls:** Centralize in services folder with axios interceptors
4. **State Management:** React Context for auth, local state for components
5. **Responsive Design:** Mobile-first approach with Tailwind breakpoints
6. **Error Handling:** Global error boundary in React, error middleware in Express

---

## 📅 Recommended Build Order

1. **Phase 1: Backend Foundation**
   - Express server setup
   - Database connection & models
   - JWT authentication
   - Basic API routes

2. **Phase 2: Frontend Foundation**
   - Vite + React setup
   - TailwindCSS configuration
   - Auth context & routing
   - Login page

3. **Phase 3: Core Features**
   - Dashboard page with charts
   - Sales management
   - Expense management

4. **Phase 4: Advanced Features**
   - Services dashboard
   - User management
   - Auto-refresh functionality

5. **Phase 5: Polish**
   - Nodemailer integration
   - Error handling
   - Responsive design
   - Testing

---

**Document Version:** 1.0  
**Created:** November 27, 2025  
**Original Project:** Laravel Dashboard  
**Target Stack:** React + Node.js + Express + Sequelize + JWT + Nodemailer
