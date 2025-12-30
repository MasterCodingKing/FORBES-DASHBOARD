# NOI Separation Implementation - Summary

## Overview

Separated NOI (Net Operating Income) from the monthly sales targets system. NOI is now stored in its own dedicated table and managed through separate API endpoints, controllers, and services.

## Changes Made

### Backend Changes

#### 1. New NOI Model

**File**: `server/models/NOI.js`

- Created new Sequelize model for NOI
- Table: `noi` with fields: id, year, month, noi_amount
- Unique constraint on (year, month) - NOI is global per month/year, not per department
- Timestamps: created_at, updated_at

#### 2. Updated MonthlyTarget Model

**File**: `server/models/MonthlyTarget.js`

- Removed `noi_amount` column
- Kept existing structure for department-specific sales targets
- Remains per department, year, and month

#### 3. New NOI Controller

**File**: `server/controllers/noiController.js`
**Endpoints**:

- `GET /api/noi` - Get all NOI records with filters
- `GET /api/noi/:year/:month` - Get specific NOI
- `POST /api/noi` - Create or update NOI (admin only)
- `PUT /api/noi/:id` - Update NOI by ID (admin only)
- `DELETE /api/noi/:id` - Delete NOI (admin only)

#### 4. Updated Target Controller

**File**: `server/controllers/targetController.js`

- Removed noi_amount handling from createOrUpdateTarget()
- Removed noi_amount handling from updateTarget()
- Now handles only sales targets per department

#### 5. New NOI Routes

**File**: `server/routes/noiRoutes.js`

- Separate route file for NOI endpoints
- Requires authentication and TARGETS module access
- Audit middleware for CREATE, UPDATE, DELETE operations

#### 6. Updated Route Index

**File**: `server/routes/index.js`

- Added NOI routes mounting at `/noi` endpoint
- Imported noiRoutes module

#### 7. Updated Models Index

**File**: `server/models/index.js`

- Added NOI model import and export
- Removed NOI associations from MonthlyTarget

### Frontend Changes

#### 1. New NOI Service

**File**: `client/src/services/noiService.js`
**Methods**:

- `getAll(params)` - Get all NOI records
- `get(year, month)` - Get specific NOI
- `createOrUpdate(data)` - Create or update NOI
- `update(id, data)` - Update NOI by ID
- `delete(id)` - Delete NOI

#### 2. Updated MonthlyTargets Component

**File**: `client/src/pages/MonthlyTargets.jsx`

- Added import for `noiService`
- Updated `handleAddNoi()` - Now uses `noiService.createOrUpdate()`
- Updated `handleUpdateNoi()` - Now uses `noiService.update()`
- Updated `handleAdd()` - Removed noi_amount field
- Updated `handleUpdate()` - Removed noi_amount field

### Database Changes

#### SQL Migration

**File**: `SQL/create-noi-table.sql`

```sql
-- Creates new noi table
-- Drops noi_amount column from monthly_targets
-- Updates unique constraints
```

## API Endpoint Changes

### Before (Mixed in Targets)

```javascript
POST /api/targets
{
  department_id: 1,
  year: 2025,
  month: 12,
  target_amount: 10000,
  noi_amount: 50000  // NOI mixed with targets
}
```

### After (Separated)

```javascript
// Sales Targets (per department)
POST /api/targets
{
  department_id: 1,
  year: 2025,
  month: 12,
  target_amount: 10000
}

// NOI (global per month)
POST /api/noi
{
  year: 2025,
  month: 12,
  noi_amount: 50000
}
```

## Key Differences

| Aspect           | Sales Target                 | NOI              |
| ---------------- | ---------------------------- | ---------------- |
| **Table**        | monthly_targets              | noi              |
| **Scope**        | Per Department               | Global (Monthly) |
| **Unique Key**   | (department_id, year, month) | (year, month)    |
| **API Endpoint** | /api/targets                 | /api/noi         |
| **Controller**   | targetController             | noiController    |
| **Service**      | targetService                | noiService       |

## Running the Migration

Execute the SQL migration file to update the database:

```bash
mysql -u root -p dashboard < SQL/create-noi-table.sql
```

Or run through your database tool and execute:

```sql
-- From SQL/create-noi-table.sql
```

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] NOI can be created via POST /api/noi
- [ ] NOI can be retrieved via GET /api/noi
- [ ] NOI can be updated via PUT /api/noi/:id
- [ ] NOI can be deleted via DELETE /api/noi/:id
- [ ] Sales targets work independently without NOI fields
- [ ] Frontend form for NOI saves to correct endpoint
- [ ] Frontend form for Sales targets works correctly
- [ ] Audit logs created for NOI operations
- [ ] Authorization checks working for both services

## Files Modified Summary

| File                                   | Type     | Changes                   |
| -------------------------------------- | -------- | ------------------------- |
| server/models/NOI.js                   | New      | Created NOI model         |
| server/models/MonthlyTarget.js         | Modified | Removed noi_amount field  |
| server/models/index.js                 | Modified | Added NOI import/export   |
| server/controllers/noiController.js    | New      | NOI CRUD operations       |
| server/controllers/targetController.js | Modified | Removed NOI handling      |
| server/routes/noiRoutes.js             | New      | NOI endpoints             |
| server/routes/index.js                 | Modified | Added noiRoutes           |
| client/src/services/noiService.js      | New      | NOI API service           |
| client/src/pages/MonthlyTargets.jsx    | Modified | Updated to use noiService |
| SQL/create-noi-table.sql               | New      | Database migration        |
