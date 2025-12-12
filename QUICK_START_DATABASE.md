# Quick Start: Database Auto-Generation

This guide shows you how to automatically generate and populate your database using Node.js scripts.

## 🚀 Quick Setup (3 Steps)

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Initialize Database

```bash
npm run db:init
```

This will:

- ✅ Create the `dashboard_db` database
- ✅ Create all tables (users, departments, sales, expenses)
- ✅ Insert 8 default departments
- ✅ Insert 3 default users (including admin)

### Step 3: Add Sample Data (Optional)

```bash
npm run db:seed
```

This will:

- ✅ Generate 90+ sales records (last 3 months)
- ✅ Generate 90+ expense records (last 3 months)
- ✅ Create realistic demo data for testing

---

## 📋 Default Credentials

After initialization, you can login with:

**Admin Account:**

- Username: `admin`
- Password: `password123`

**Regular Users:**

- Username: `johndoe` / Password: `password123`
- Username: `janesmith` / Password: `password123`

⚠️ **Important:** Change the admin password after first login!

---

## 🔄 Available Commands

| Command            | Description                      | Safe?          |
| ------------------ | -------------------------------- | -------------- |
| `npm run db:init`  | Initialize database (first time) | ✅ Safe        |
| `npm run db:seed`  | Add sample data                  | ✅ Safe        |
| `npm run db:setup` | Init + Seed in one command       | ✅ Safe        |
| `npm run db:reset` | ⚠️ Delete all data and rebuild   | ❌ Destructive |

---

## 🎯 Common Scenarios

### First Time Setup

```bash
cd server
npm run db:setup
npm run dev
```

### Reset Everything (Testing)

```bash
cd server
npm run db:reset
npm run db:seed
```

### Add More Sample Data

```bash
cd server
npm run db:seed
```

---

## 🛠️ What Gets Created

### Database Schema

**Users Table:**

- Admin and regular user accounts
- Password hashing (bcrypt)
- Admin role flags

**Departments Table:**

- 8 service departments
- Web Dev, Mobile Apps, Cloud, etc.
- Target amounts for tracking

**Sales Table:**

- Daily sales by department
- Amount and date tracking
- Foreign key to departments

**Expenses Table:**

- Business expenses
- 10 categories (Salaries, Rent, etc.)
- Date and amount tracking

---

## 📊 Sample Data Overview

When you run `npm run db:seed`, you get:

**Sales Data:**

- 90-270 records (1-3 per day)
- Last 3 months
- Random amounts: $500-$5,000 per sale
- Distributed across all departments

**Expense Data:**

- 0-180 records (0-2 per day)
- Last 3 months
- Realistic categories and amounts
- Salaries: $3,000-$15,000
- Rent: $2,000-$5,000
- Equipment: $500-$3,000
- Other: $50-$500

---

## 🔍 Verify Installation

After running the scripts, verify everything worked:

```bash
# Check if database was created
node -e "require('./config/database').testConnection()"

# Or just start the server
npm run dev
```

If successful, you should see:

```
✅ Database connection established successfully.
✅ Database synchronized successfully.
🚀 Server running on port 3001
```

---

## ⚠️ Troubleshooting

### "Cannot connect to database"

1. Check if MySQL/MariaDB is running
2. Verify `.env` file has correct credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=dashboard_db
   ```

### "Table already exists"

- This is normal if you've run the script before
- The script will skip existing data
- To start fresh, use `npm run db:reset`

### "Permission denied"

Grant permissions to your MySQL user:

```sql
GRANT ALL PRIVILEGES ON dashboard_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📝 Environment Setup

Make sure your `.env` file exists in the `server/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dashboard_db

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development
```

---

## 🎓 Next Steps

1. ✅ Run `npm run db:setup` to initialize
2. 🚀 Start the server with `npm run dev`
3. 🌐 Test the API at `http://localhost:3001`
4. 💻 Start the frontend client
5. 🔐 Login with admin credentials
6. ⚠️ Change default passwords!

---

## 📚 Additional Resources

- Full script documentation: `server/scripts/README.md`
- Database schema details: `SQL/database_schema.sql`
- API documentation: `DATABASE_DOCUMENTATION.md`
- Model definitions: `server/models/`

---

## 💡 Tips

- Run `db:seed` multiple times to add more test data
- Use `db:reset` before demos to ensure clean data
- Keep `db:init` safe - it won't overwrite existing data
- Sample data is randomized each time you run the seed script

---

That's it! Your database is now ready to use. Happy coding! 🎉
