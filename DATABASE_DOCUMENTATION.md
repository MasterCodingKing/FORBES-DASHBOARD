# Forbes Dashboard - Database Schema Documentation

## Database Overview

**Database Name:** `dashboard_db`  
**Character Set:** `utf8mb4`  
**Collation:** `utf8mb4_unicode_ci`  
**Engine:** InnoDB

## Database Diagram

```
┌─────────────┐
│    users    │
└─────────────┘
      
┌──────────────┐         ┌─────────────┐
│ departments  │◄────────│    sales    │
└──────────────┘ 1     * └─────────────┘
                         
┌─────────────┐
│  expenses   │
└─────────────┘
```

## Tables

### 1. users
**Purpose:** Stores user account information and authentication credentials

| Column Name    | Data Type      | Constraints              | Description                          |
|---------------|----------------|--------------------------|--------------------------------------|
| id            | INT(11)        | PK, AUTO_INCREMENT       | Unique user identifier               |
| first_name    | VARCHAR(100)   | NOT NULL                 | User's first name                    |
| last_name     | VARCHAR(100)   | NOT NULL                 | User's last name                     |
| username      | VARCHAR(255)   | NOT NULL, UNIQUE         | Unique username for login            |
| password      | VARCHAR(255)   | NOT NULL                 | Hashed password (bcrypt)             |
| is_admin      | TINYINT(1)     | DEFAULT 0                | Admin flag (1=admin, 0=regular)      |
| remember_token| VARCHAR(255)   | NULL                     | Token for remember me functionality  |
| createdAt     | TIMESTAMP      | NOT NULL, DEFAULT NOW    | Record creation timestamp            |
| updatedAt     | TIMESTAMP      | NOT NULL, AUTO UPDATE    | Record last update timestamp         |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE KEY: `username_unique` (`username`)
- INDEX: `idx_username` (`username`)
- INDEX: `idx_is_admin` (`is_admin`)

**Business Rules:**
- Passwords are hashed using bcrypt (salt rounds: 10)
- Username must be at least 3 characters
- Username can only contain letters, numbers, and underscores
- Password must be at least 6 characters

---

### 2. departments
**Purpose:** Stores department/service information

| Column Name | Data Type      | Constraints            | Description                    |
|------------|----------------|------------------------|--------------------------------|
| id         | INT(11)        | PK, AUTO_INCREMENT     | Unique department identifier   |
| name       | VARCHAR(255)   | NOT NULL               | Department/service name        |
| description| TEXT           | NULL                   | Department description         |
| createdAt  | TIMESTAMP      | NOT NULL, DEFAULT NOW  | Record creation timestamp      |
| updatedAt  | TIMESTAMP      | NOT NULL, AUTO UPDATE  | Record last update timestamp   |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `idx_name` (`name`)

**Sample Data:**
- Acrylic Nails
- Gel Nails
- Manicure
- Pedicure
- Nail Art
- Other

---

### 3. sales
**Purpose:** Stores daily sales records by department

| Column Name   | Data Type      | Constraints            | Description                    |
|--------------|----------------|------------------------|--------------------------------|
| id           | INT(11)        | PK, AUTO_INCREMENT     | Unique sale identifier         |
| department_id| INT(11)        | NOT NULL, FK           | Foreign key to departments     |
| amount       | DECIMAL(10,2)  | NOT NULL               | Sale amount                    |
| date         | DATE           | NOT NULL               | Sale date                      |
| createdAt    | TIMESTAMP      | NOT NULL, DEFAULT NOW  | Record creation timestamp      |
| updatedAt    | TIMESTAMP      | NOT NULL, AUTO UPDATE  | Record last update timestamp   |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `idx_department_id` (`department_id`)
- INDEX: `idx_date` (`date`)
- INDEX: `idx_department_date` (`department_id`, `date`)
- INDEX: `idx_sales_date_amount` (`date`, `amount`)

**Foreign Keys:**
- `fk_sales_department`: `department_id` -> `departments.id` (CASCADE on DELETE/UPDATE)

**Business Rules:**
- Amount must be positive
- Amount must be a valid decimal number
- Date is required and must be a valid date

---

### 4. expenses
**Purpose:** Stores expense records with categories

| Column Name | Data Type      | Constraints            | Description                    |
|------------|----------------|------------------------|--------------------------------|
| id         | INT(11)        | PK, AUTO_INCREMENT     | Unique expense identifier      |
| description| VARCHAR(255)   | NOT NULL               | Expense description            |
| amount     | DECIMAL(10,2)  | NOT NULL               | Expense amount                 |
| date       | DATE           | NOT NULL               | Expense date                   |
| category   | VARCHAR(100)   | DEFAULT 'General'      | Expense category               |
| createdAt  | TIMESTAMP      | NOT NULL, DEFAULT NOW  | Record creation timestamp      |
| updatedAt  | TIMESTAMP      | NOT NULL, AUTO UPDATE  | Record last update timestamp   |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `idx_date` (`date`)
- INDEX: `idx_category` (`category`)
- INDEX: `idx_date_category` (`date`, `category`)
- INDEX: `idx_expenses_date_amount` (`date`, `amount`)

**Valid Categories:**
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

**Business Rules:**
- Description cannot exceed 255 characters
- Amount must be positive
- Category must be one of the predefined values

---

## Database Views

### v_daily_sales_summary
**Purpose:** Provides daily sales summary by department

**Columns:**
- `date`: Sale date
- `department_name`: Department name
- `total_sales`: Sum of sales for the day
- `transaction_count`: Number of transactions

---

### v_monthly_sales_by_department
**Purpose:** Provides monthly sales aggregated by department

**Columns:**
- `year`: Year
- `month`: Month (1-12)
- `year_month`: YYYY-MM format
- `department_name`: Department name
- `total_sales`: Sum of sales for the month
- `transaction_count`: Number of transactions

---

### v_monthly_expense_summary
**Purpose:** Provides monthly expense summary by category

**Columns:**
- `year`: Year
- `month`: Month (1-12)
- `year_month`: YYYY-MM format
- `category`: Expense category
- `total_amount`: Sum of expenses
- `expense_count`: Number of expense records

---

### v_monthly_profit_loss
**Purpose:** Calculates monthly profit/loss statement

**Columns:**
- `year`: Year
- `month`: Month (1-12)
- `year_month`: YYYY-MM format
- `total_revenue`: Total sales revenue
- `total_expenses`: Total expenses
- `net_profit`: Revenue minus expenses

---

## Stored Procedures

### sp_get_department_performance
**Purpose:** Get department performance metrics for a date range

**Parameters:**
- `p_start_date` (DATE): Start date
- `p_end_date` (DATE): End date

**Returns:**
- Department ID
- Department name
- Total transactions
- Total sales
- Average sale amount

**Usage:**
```sql
CALL sp_get_department_performance('2025-01-01', '2025-12-31');
```

---

## Relationships

### One-to-Many Relationships

1. **departments → sales**
   - One department can have many sales
   - Cascade delete: Deleting a department removes all associated sales
   - Foreign key: `sales.department_id` references `departments.id`

---

## Security Considerations

1. **Password Storage**
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Never store plain text passwords
   - Passwords are automatically hashed on user creation and update

2. **SQL Injection Prevention**
   - All queries use parameterized statements via Sequelize ORM
   - Input validation on all user inputs

3. **Access Control**
   - Admin flag (`is_admin`) for role-based access control
   - JWT tokens for authentication

---

## Performance Optimization

### Indexes
- All primary keys are indexed automatically
- Foreign keys have dedicated indexes
- Date columns are indexed for faster date range queries
- Composite indexes on frequently queried column combinations

### Best Practices
- Use prepared statements
- Avoid SELECT * queries
- Use views for complex reporting queries
- Regular database maintenance (optimize tables)

---

## Backup and Maintenance

### Recommended Backup Strategy
```bash
# Full backup
mysqldump -u root -p dashboard_db > dashboard_db_backup_$(date +%Y%m%d).sql

# Tables only (no data)
mysqldump -u root -p --no-data dashboard_db > dashboard_db_schema.sql

# Specific table backup
mysqldump -u root -p dashboard_db sales > sales_backup.sql
```

### Maintenance Queries
```sql
-- Optimize all tables
OPTIMIZE TABLE users, departments, sales, expenses;

-- Check table integrity
CHECK TABLE users, departments, sales, expenses;

-- Repair tables if needed
REPAIR TABLE table_name;

-- Analyze tables for query optimization
ANALYZE TABLE users, departments, sales, expenses;
```

---

## Migration Guide

### Initial Setup
1. Create the database:
   ```sql
   CREATE DATABASE dashboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Import the schema:
   ```bash
   mysql -u root -p dashboard_db < database_schema.sql
   ```

3. Or let Sequelize handle it (recommended for development):
   - The application will automatically sync models on startup
   - Set `NODE_ENV=development` in `.env` for auto-sync with alter mode

### Adding New Tables
1. Create the model in `server/models/`
2. Define associations in `server/models/index.js`
3. Restart the application in development mode
4. Export the updated schema using `mysqldump`

---

## Query Examples

### Get total sales for current month by department
```sql
SELECT 
  d.name,
  SUM(s.amount) as total_sales
FROM departments d
LEFT JOIN sales s ON d.id = s.department_id
WHERE MONTH(s.date) = MONTH(CURRENT_DATE())
  AND YEAR(s.date) = YEAR(CURRENT_DATE())
GROUP BY d.id, d.name
ORDER BY total_sales DESC;
```

### Get monthly profit/loss
```sql
SELECT 
  DATE_FORMAT(date, '%Y-%m') as month,
  SUM(CASE WHEN type = 'sale' THEN amount ELSE 0 END) as revenue,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
  SUM(CASE WHEN type = 'sale' THEN amount ELSE -amount END) as profit
FROM (
  SELECT date, amount, 'sale' as type FROM sales
  UNION ALL
  SELECT date, amount, 'expense' as type FROM expenses
) combined
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month DESC;
```

### Get top performing departments (Year to Date)
```sql
SELECT 
  d.name,
  COUNT(s.id) as transaction_count,
  SUM(s.amount) as total_sales,
  AVG(s.amount) as avg_sale
FROM departments d
INNER JOIN sales s ON d.id = s.department_id
WHERE YEAR(s.date) = YEAR(CURRENT_DATE())
GROUP BY d.id, d.name
ORDER BY total_sales DESC
LIMIT 10;
```

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0.0   | 2025-11-28 | Initial schema creation          |

---

## Support

For questions or issues related to the database schema, please refer to:
- `PROJECT_REBUILD_GUIDE.md` for application setup
- `README.md` for general application documentation
