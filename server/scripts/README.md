# Database Initialization Scripts

This directory contains scripts for initializing, resetting, and seeding your database.

## Prerequisites

Make sure you have:

- MySQL/MariaDB server running
- `.env` file configured with database credentials
- Node.js dependencies installed (`npm install`)

## Available Scripts

### 1. Initialize Database (First Time Setup)

Creates the database, tables, and seeds initial data (departments and users).

```bash
node scripts/initDatabase.js
```

**Or use the npm script:**

```bash
npm run db:init
```

**What it does:**

- ✅ Creates database if it doesn't exist
- ✅ Creates all tables (users, departments, sales, expenses)
- ✅ Seeds default departments (8 departments)
- ✅ Seeds default users (admin + 2 regular users)

**Default Credentials:**

- Username: `admin`
- Password: `password123`

---

### 2. Reset Database (⚠️ Destructive)

Drops all tables and recreates them with fresh data.

```bash
node scripts/resetDatabase.js
```

**Or use the npm script:**

```bash
npm run db:reset
```

**⚠️ WARNING:** This will DELETE ALL DATA!

**What it does:**

- 💣 Drops all existing tables
- ✅ Recreates tables with fresh schema
- ✅ Seeds default departments
- ✅ Seeds default users

**Use when:**

- You need a clean database
- Schema has changed
- Testing from scratch

---

### 3. Seed Sample Data

Adds sample sales and expenses data for the last 90 days.

```bash
node scripts/seedSampleData.js
```

**Or use the npm script:**

```bash
npm run db:seed
```

**What it does:**

- 💰 Creates ~90-270 sales records (1-3 per day)
- 💸 Creates ~0-180 expense records (0-2 per day)
- 📅 Covers the last 3 months
- 📊 Realistic amounts and categories

**Use when:**

- You need demo/test data
- Testing dashboard visualizations
- Developing new features

---

## Complete Setup (Fresh Install)

For a completely fresh database with sample data:

```bash
# Step 1: Initialize database and create tables
npm run db:init

# Step 2: Add sample data (optional)
npm run db:seed
```

---

## Quick Reset for Testing

To start over with a clean database and sample data:

```bash
# Reset everything and reseed
npm run db:reset
npm run db:seed
```

---

## Environment Variables

Make sure your `.env` file has these variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=dashboard_db
```

---

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check if MySQL/MariaDB is running
2. Verify credentials in `.env` file
3. Check firewall settings
4. Ensure user has proper permissions

### Permission Errors

If you get permission errors:

```sql
GRANT ALL PRIVILEGES ON dashboard_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Schema Sync Issues

If Sequelize models don't match database:

1. Run `npm run db:reset` to force sync
2. Check model definitions in `server/models/`
3. Verify foreign key constraints

---

## Default Seeded Data

### Departments (8)

- Web Development
- Mobile Apps
- Cloud Services
- Consulting
- Support
- Training
- Security
- Data Analytics

### Users (3)

1. **Admin User**

   - Username: `admin`
   - Password: `password123`
   - Admin: Yes

2. **John Doe**

   - Username: `johndoe`
   - Password: `password123`
   - Admin: No

3. **Jane Smith**
   - Username: `janesmith`
   - Password: `password123`
   - Admin: No

---

## Script Details

### initDatabase.js

- Safe to run multiple times (checks for existing data)
- Won't overwrite existing records
- Creates database automatically

### resetDatabase.js

- Requires confirmation before running
- Completely wipes and rebuilds database
- Use with caution in production!

### seedSampleData.js

- Adds to existing data (doesn't replace)
- Generates random but realistic data
- Can be run multiple times

---

## Next Steps

After initialization:

1. ⚠️ Change the default admin password
2. 🔐 Update user credentials
3. 📝 Add your real departments if needed
4. 🚀 Start the server: `npm run dev`

---

## Need Help?

- Check `DATABASE_DOCUMENTATION.md` for schema details
- Review `server/models/` for model definitions
- See `server/seeders/` for seeding logic
