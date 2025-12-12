# 📚 Database Documentation Index

Welcome! This is your central hub for all database-related documentation.

---

## 🚀 Quick Start (New Users Start Here!)

**Just want to get started?** → [`QUICK_START_DATABASE.md`](QUICK_START_DATABASE.md)

**Want a command reference?** → [`DATABASE_COMMANDS.md`](DATABASE_COMMANDS.md)

---

## 📖 Complete Documentation Guide

### 1. Getting Started

- **[Quick Start Guide](QUICK_START_DATABASE.md)** ⭐ **START HERE**
  - First time setup in 3 steps
  - Common scenarios
  - Environment setup
  - Default credentials

### 2. Command Reference

- **[Commands Cheat Sheet](DATABASE_COMMANDS.md)** 🎯 **MOST USEFUL**
  - All available commands
  - Common workflows
  - Troubleshooting quick fixes
  - Pro tips

### 3. Setup Summary

- **[Database Setup Summary](DATABASE_SETUP_SUMMARY.md)** 📋
  - What was created
  - How it works
  - Benefits overview
  - Important notes

### 4. Visual Guide

- **[Flow Diagrams](DATABASE_FLOW_DIAGRAM.md)** 📊
  - Setup process flow
  - Command decision tree
  - Table relationships
  - Usage scenarios

### 5. Technical Documentation

- **[Database Schema](SQL/database_schema.sql)** 🔧

  - Complete SQL schema
  - Table definitions
  - Relationships
  - Indexes and constraints

- **[Database Documentation](DATABASE_DOCUMENTATION.md)** 📚
  - Detailed schema documentation
  - API endpoints
  - Business logic

### 6. Scripts Documentation

- **[Scripts README](server/scripts/README.md)** 🛠️
  - Detailed script documentation
  - Usage examples
  - Troubleshooting guide
  - Default data details

---

## 🎯 Find What You Need

### I want to...

#### ...set up the database for the first time

→ Read: [`QUICK_START_DATABASE.md`](QUICK_START_DATABASE.md)  
→ Run: `cd server && npm run db:setup`

#### ...see all available commands

→ Read: [`DATABASE_COMMANDS.md`](DATABASE_COMMANDS.md)

#### ...understand how it works

→ Read: [`DATABASE_SETUP_SUMMARY.md`](DATABASE_SETUP_SUMMARY.md)

#### ...reset my database for testing

→ Read: [`DATABASE_COMMANDS.md`](DATABASE_COMMANDS.md) (Reset section)  
→ Run: `cd server && npm run db:reset && npm run db:seed`

#### ...add sample/test data

→ Run: `cd server && npm run db:seed`

#### ...see the database schema

→ Read: [`SQL/database_schema.sql`](SQL/database_schema.sql)

#### ...understand the flow visually

→ Read: [`DATABASE_FLOW_DIAGRAM.md`](DATABASE_FLOW_DIAGRAM.md)

#### ...troubleshoot connection issues

→ Read: [`DATABASE_COMMANDS.md`](DATABASE_COMMANDS.md) (Troubleshooting section)  
→ Read: [`server/scripts/README.md`](server/scripts/README.md) (Troubleshooting section)

#### ...know what data gets created

→ Read: [`QUICK_START_DATABASE.md`](QUICK_START_DATABASE.md) (Data Overview section)  
→ Read: [`server/scripts/README.md`](server/scripts/README.md) (Default Seeded Data section)

---

## 📁 File Structure

```
dashboard/
├── DATABASE_COMMANDS.md           ← Command cheat sheet
├── DATABASE_FLOW_DIAGRAM.md       ← Visual flow diagrams
├── DATABASE_SETUP_SUMMARY.md      ← Setup overview
├── DATABASE_DOCUMENTATION.md      ← Full documentation
├── QUICK_START_DATABASE.md        ← Quick start guide
│
├── SQL/
│   └── database_schema.sql        ← SQL schema definition
│
└── server/
    ├── package.json               ← npm scripts defined here
    │
    └── scripts/
        ├── README.md              ← Scripts documentation
        ├── initDatabase.js        ← Initialize database
        ├── resetDatabase.js       ← Reset database (destructive)
        └── seedSampleData.js      ← Add sample data
```

---

## ⚡ Quick Commands

```bash
# First time setup
cd server
npm run db:setup

# Daily development
cd server
npm run dev

# Reset for testing
cd server
npm run db:reset
npm run db:seed
```

---

## 🔐 Default Credentials

After initialization:

```
Admin Account:
  Username: admin
  Password: password123

Test Users:
  Username: johndoe / janesmith
  Password: password123
```

⚠️ **Always change default passwords!**

---

## 📊 Available Scripts

| Script             | Description         | Documentation                              |
| ------------------ | ------------------- | ------------------------------------------ |
| `npm run db:init`  | Initialize database | [Quick Start](QUICK_START_DATABASE.md)     |
| `npm run db:reset` | Reset database      | [Commands](DATABASE_COMMANDS.md)           |
| `npm run db:seed`  | Add sample data     | [Scripts README](server/scripts/README.md) |
| `npm run db:setup` | Complete setup      | [Quick Start](QUICK_START_DATABASE.md)     |

---

## 🎓 Learning Path

**Complete Beginner?**

1. Read: [Quick Start Guide](QUICK_START_DATABASE.md)
2. Run: `npm run db:setup`
3. Bookmark: [Commands Cheat Sheet](DATABASE_COMMANDS.md)

**Need to Reset?**

1. Check: [Commands Cheat Sheet](DATABASE_COMMANDS.md)
2. Run: `npm run db:reset && npm run db:seed`

**Want to Understand Everything?**

1. [Quick Start Guide](QUICK_START_DATABASE.md)
2. [Setup Summary](DATABASE_SETUP_SUMMARY.md)
3. [Flow Diagrams](DATABASE_FLOW_DIAGRAM.md)
4. [Scripts Documentation](server/scripts/README.md)
5. [Database Schema](SQL/database_schema.sql)

---

## 🆘 Help & Support

**Having Issues?**

1. Check [Commands Cheat Sheet](DATABASE_COMMANDS.md) - Troubleshooting section
2. Check [Scripts README](server/scripts/README.md) - Troubleshooting section
3. Review [Quick Start Guide](QUICK_START_DATABASE.md) - Environment setup

**Common Issues:**

- Connection failed → Check `.env` file
- Permission denied → Check MySQL user privileges
- Table exists → This is normal, or use `db:reset`
- Module not found → Run `npm install` first

---

## ✅ Success Checklist

After setup, you should have:

- [ ] Database `dashboard_db` created
- [ ] 4 tables: users, departments, sales, expenses
- [ ] 8 departments seeded
- [ ] 3 users seeded (1 admin + 2 regular)
- [ ] Sample data (if you ran `db:seed`)
- [ ] Ability to login with admin credentials
- [ ] Server starting without errors

---

## 🎯 Most Important Files

For 90% of use cases, you only need these:

1. **[DATABASE_COMMANDS.md](DATABASE_COMMANDS.md)** - Quick command reference
2. **[QUICK_START_DATABASE.md](QUICK_START_DATABASE.md)** - Setup instructions
3. **server/scripts/** - The actual scripts you run

Bookmark these! 📌

---

## 💡 Pro Tips

- Keep `DATABASE_COMMANDS.md` open while developing
- Use `npm run db:reset` before demos for clean data
- Run `npm run db:seed` multiple times for more test data
- Never use `db:reset` in production
- Always change default passwords

---

## 🚀 Ready to Go?

**Your next step:**

```bash
cd server
npm run db:setup
npm run dev
```

Then open your browser and login with `admin` / `password123`

Happy coding! 🎉

---

_Last Updated: December 2025_
