# Database Commands Cheat Sheet

## 🚀 Quick Reference

### Essential Commands

```bash
# Navigate to server directory first
cd server

# First time setup (creates everything)
npm run db:init

# First time with sample data
npm run db:setup

# Add sample/test data
npm run db:seed

# Reset everything (⚠️ DESTRUCTIVE)
npm run db:reset

# Start the server
npm run dev
```

---

## 📝 Complete Command List

| Command            | What It Does                                  | Safe?  | When to Use          |
| ------------------ | --------------------------------------------- | ------ | -------------------- |
| `npm run db:init`  | Creates DB, tables, seeds users & departments | ✅ Yes | First time setup     |
| `npm run db:reset` | Deletes everything, recreates from scratch    | ❌ No  | Testing, fresh start |
| `npm run db:seed`  | Adds sample sales & expenses (90 days)        | ✅ Yes | Need test data       |
| `npm run db:setup` | Runs db:init + db:seed together               | ✅ Yes | Complete first setup |
| `npm run dev`      | Starts development server                     | ✅ Yes | Normal development   |
| `npm start`        | Starts production server                      | ✅ Yes | Production           |

---

## 🎯 Common Workflows

### New Project Setup

```bash
cd server
npm install
npm run db:setup    # Creates everything + sample data
npm run dev         # Start server
```

### Daily Development

```bash
cd server
npm run dev         # Just start the server
```

### Fresh Testing Environment

```bash
cd server
npm run db:reset    # Clean slate (asks confirmation)
npm run db:seed     # New sample data
npm run dev         # Test away!
```

### Add More Test Data

```bash
cd server
npm run db:seed     # Adds MORE data (doesn't replace)
```

### Production Deployment

```bash
cd server
npm run db:init     # Setup only (no sample data)
npm start           # Production mode
```

---

## 🔐 Default Credentials

After running `npm run db:init`:

**Admin Login:**

```
Username: admin
Password: password123
```

**Test Users:**

```
Username: johndoe
Password: password123

Username: janesmith
Password: password123
```

⚠️ **Change these passwords immediately after first login!**

---

## 📊 What Each Command Creates

### `npm run db:init`

- ✅ Database: `dashboard_db`
- ✅ Tables: users, departments, sales, expenses
- ✅ Users: 3 (1 admin + 2 regular)
- ✅ Departments: 8 service types
- ❌ Sales: none
- ❌ Expenses: none

### `npm run db:seed`

- ❌ Database: (assumes exists)
- ❌ Tables: (assumes exists)
- ❌ Users: (assumes exists)
- ❌ Departments: (assumes exists)
- ✅ Sales: ~90-270 records (last 3 months)
- ✅ Expenses: ~90-180 records (last 3 months)

### `npm run db:reset`

- ✅ Drops all tables
- ✅ Recreates all tables
- ✅ Users: 3 (fresh)
- ✅ Departments: 8 (fresh)
- ❌ Sales: none (must run db:seed after)
- ❌ Expenses: none (must run db:seed after)

---

## ⚙️ Environment Variables Required

Your `server/.env` must have:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dashboard_db

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

PORT=3001
NODE_ENV=development
```

---

## 🐛 Troubleshooting Quick Fixes

### "Cannot connect to database"

```bash
# Check MySQL is running
# Verify .env credentials
# Test: mysql -u root -p
```

### "Permission denied"

```sql
-- In MySQL console:
GRANT ALL PRIVILEGES ON dashboard_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### "Table already exists"

```bash
# This is normal if running db:init again
# To start fresh: npm run db:reset
```

### "Module not found"

```bash
cd server
npm install
```

---

## ⚡ Power User Shortcuts

### One-Liner Complete Setup

```bash
cd server && npm install && npm run db:setup && npm run dev
```

### Quick Reset & Test

```bash
cd server && npm run db:reset && npm run db:seed && npm run dev
```

### Check Database Status

```bash
cd server
node -e "require('./config/database').testConnection()"
```

---

## 📈 Sample Data Details

When you run `npm run db:seed`:

**Sales Data:**

- 1-3 sales per day
- $500-$5,000 per sale
- Distributed across all departments
- Last 90 days
- ~180 records average

**Expense Data:**

- 0-2 expenses per day
- Various categories with realistic amounts:
  - Salaries: $3,000-$15,000
  - Rent: $2,000-$5,000
  - Equipment: $500-$3,000
  - Utilities: $100-$500
  - Others: $50-$500
- Last 90 days
- ~90 records average

---

## 🎓 Pro Tips

1. **First Time?** Use `npm run db:setup` - it does everything
2. **Testing?** Use `npm run db:reset` before each test cycle
3. **Need More Data?** Run `npm run db:seed` multiple times
4. **Production?** Only use `npm run db:init`, never db:seed
5. **Backup First!** Before db:reset, always backup if you have important data

---

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Start server without errors
- [ ] Login with admin credentials
- [ ] See 8 departments in Services page
- [ ] See sales data (if you ran db:seed)
- [ ] See expenses data (if you ran db:seed)
- [ ] Create new sales/expenses
- [ ] View dashboard charts

---

## 📞 Getting Help

**Documentation:**

- Quick Start: `QUICK_START_DATABASE.md`
- Full Guide: `server/scripts/README.md`
- Summary: `DATABASE_SETUP_SUMMARY.md`
- Flow Diagram: `DATABASE_FLOW_DIAGRAM.md`

**Check Logs:**

```bash
# Server logs show initialization status
npm run dev

# Look for:
# ✅ Database connection established
# ✅ Database synchronized
```

---

## 🎯 Remember

- ✅ `db:init` is safe - run anytime
- ✅ `db:seed` is safe - adds data
- ⚠️ `db:reset` is DESTRUCTIVE - asks confirmation
- 🚫 Never use `db:reset` in production
- 🔐 Always change default passwords

---

**Print this out or bookmark it!** 📌

Happy coding! 🚀
