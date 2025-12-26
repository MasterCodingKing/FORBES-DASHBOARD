# Audit Trail Testing Guide

## Overview

The audit trail system tracks all CREATE, UPDATE, and DELETE operations performed by users and admins across all modules (Sales, Expenses, Users, Departments, Targets).

## Features Implemented

### 1. Module Access Control

- **User Model**: Added `allowed_modules` JSON field

  - `null` = Access to all modules
  - `["expenses"]` = Access only to Expenses module
  - `["sales", "expenses"]` = Access to Sales and Expenses modules

- **Middleware**: `checkModuleAccess(moduleName)` validates user's module permissions
- **Frontend**:
  - UserPermissions page allows admins to assign modules to users
  - Sidebar dynamically filters navigation based on allowed modules

### 2. Audit Trail System

- **Automatic Logging**: All CRUD operations are logged automatically
- **Detailed Descriptions**:

  - Sales: Includes amount and date
  - Expenses: Includes amount and category
  - Users: Includes username and permission changes
  - Departments: Includes department name
  - Targets: Includes target amount and month/year

- **Captured Data**:

  - User who performed the action
  - Action type (CREATE, UPDATE, DELETE, LOGIN)
  - Entity type (Sale, Expense, User, Department, Target)
  - Old values (for UPDATE/DELETE)
  - New values (for CREATE/UPDATE)
  - IP address and User Agent
  - Timestamp

- **Admin-Only Access**: Only administrators can view audit logs

## Fixed Issues

### 1. Route 404 Error

**Problem**: `/api/users/permissions/available` was returning 404

**Root Cause**: Express route matching was evaluating routes sequentially, and "permissions" was being matched as an ID parameter in `/:id` route

**Solution**: Moved specific routes BEFORE parameterized routes in both `userRoutes.js` and `auditRoutes.js`

```javascript
// CORRECT ORDER
router.get('/permissions/available', ...); // Specific route first
router.get('/:id', ...);                   // Parameterized route after
```

### 2. API Response Handling

**Problem**: Services were extracting `.data` twice, causing undefined responses

**Root Cause**: Axios interceptor already extracts `response.data`, but services were doing `response.data.data`

**Solution**: Removed `.data` extraction from service return statements in:

- `client/src/services/permissionService.js`
- `client/src/services/auditService.js`

### 3. Missing Audit Trail UI

**Created**: Full-featured audit trail page at `client/src/pages/AuditTrail.jsx` with:

- Filters (action type, entity type, date range)
- Pagination
- Color-coded action badges
- Entity-specific icons
- IP address tracking
- Real-time refresh capability

## How to Test

### Step 1: Restart Both Server and Client

```powershell
# Stop all Node processes
Stop-Process -Name node -Force

# Start Server (in server directory)
cd c:\Users\ITDev\Desktop\projects\dashboard\server
node server.js

# Start Client (in new terminal, in client directory)
cd c:\Users\ITDev\Desktop\projects\dashboard\client
npm run dev
```

### Step 2: Test Module Access Control

1. **Login as Admin**
2. **Navigate to**: Settings → User Permissions
3. **Select a user** (e.g., user1)
4. **Set Module Access**:
   - Uncheck "All Modules Allowed"
   - Select only "Expenses" checkbox
   - Click "Save Changes"
5. **Logout and login as user1**
6. **Verify**: Only "Expenses" appears in sidebar navigation

### Step 3: Test Audit Trail Logging

1. **Login as Admin**
2. **Create a new sale**:
   - Navigate to Sales → Add New Sale
   - Fill in: Amount = $5000, Date = Today, Department = Sales
   - Click "Save"
3. **Update an expense**:
   - Navigate to Expenses
   - Click Edit on any expense
   - Change amount from $1000 to $1500
   - Click "Update"
4. **Delete a department** (if you have permission):
   - Navigate to Departments
   - Click Delete on a test department
   - Confirm deletion

### Step 4: View Audit Trail

1. **Navigate to**: Settings → Audit Trail
2. **Verify you see**:
   - CREATE Sale entry with amount $5000
   - UPDATE Expense entry showing old amount ($1000) and new amount ($1500)
   - DELETE Department entry with department details
   - Color-coded badges: Green (CREATE), Blue (UPDATE), Red (DELETE)
3. **Test Filters**:
   - Filter by Action Type: Select "CREATE" - should show only create operations
   - Filter by Entity: Select "Sale" - should show only sale-related actions
   - Filter by Date: Select today's date - should show only today's activities
4. **Test Pagination**: If more than 20 entries, navigate through pages

### Step 5: Verify Admin-Only Access

1. **Logout from admin account**
2. **Login as regular user** (user1)
3. **Try to access**: http://localhost:5173/audit
4. **Expected**: You should be redirected to dashboard (unauthorized)
5. **Verify**: "Audit Trail" link should NOT appear in sidebar for regular users

## Troubleshooting

### Issue: Still getting 404 on permissions/available

**Solution**:

1. Completely stop all Node processes
2. Clear browser cache or use incognito mode
3. Restart server and client
4. Hard refresh browser (Ctrl+Shift+R)

### Issue: Audit logs not showing up

**Checks**:

1. Verify `audit_logs` table exists in database:
   ```sql
   SHOW TABLES LIKE 'audit_logs';
   SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
   ```
2. Check server console for audit log errors
3. Ensure user is authenticated (audit logs require user.id)
4. Verify auditMiddleware is applied to route in route file

### Issue: Module access not working

**Checks**:

1. Verify `allowed_modules` column exists in users table:
   ```sql
   DESCRIBE users;
   ```
2. Check user's allowed_modules value:
   ```sql
   SELECT username, allowed_modules FROM users WHERE username = 'user1';
   ```
3. Clear localStorage and login again
4. Check browser console for permission errors

### Issue: Wrong IP address in requests

**Solution**:

1. Check server network IP in server console output
2. Update `client/.env` file:
   ```
   VITE_API_URL=http://[SERVER_IP]:5000/api
   ```
3. Restart client (Vite must restart to pick up env changes)

## Database Verification

### Check Audit Logs Table

```sql
SELECT
  id,
  username,
  action,
  entity,
  description,
  ip_address,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Check User's Allowed Modules

```sql
SELECT
  id,
  username,
  role,
  allowed_modules
FROM users;
```

### Verify All Tables Exist

```sql
SHOW TABLES;
```

Expected tables:

- users
- departments
- sales
- expenses
- monthly_targets
- audit_logs

## API Endpoints

### Audit Trail Endpoints (Admin Only)

- `GET /api/audit` - Get all audit logs with filters
  - Query params: `action`, `entity`, `startDate`, `endDate`, `page`, `limit`
- `GET /api/audit/stats` - Get audit statistics
- `GET /api/audit/:id` - Get specific audit log by ID

### User Permission Endpoints (Admin Only)

- `GET /api/users/permissions/available` - Get available permissions and modules
- `PUT /api/users/:id/permissions` - Update user's permissions and allowed modules

## Expected Behavior Summary

### For Regular Users:

- ✅ Can only access modules in their `allowed_modules` array
- ✅ Sidebar shows only allowed modules
- ✅ Attempting to access forbidden module redirects to dashboard
- ❌ Cannot view Audit Trail
- ❌ Cannot modify other users' permissions

### For Administrators:

- ✅ Can access all modules (regardless of allowed_modules)
- ✅ Can view and manage user permissions
- ✅ Can view complete audit trail
- ✅ Can filter and search audit logs
- ✅ Can see detailed action descriptions with amounts, dates, etc.

## Next Steps

1. **Test all scenarios** listed above
2. **Verify audit logs** are being created for all CRUD operations
3. **Check module restrictions** work for test users
4. **Review audit descriptions** for clarity and completeness
5. **Report any issues** you encounter

## Notes

- All audit logs are created asynchronously to avoid blocking API responses
- Module access check happens BEFORE permission checks
- Audit middleware captures old values BEFORE the operation executes
- The audit trail page auto-refreshes every 30 seconds (optional)
- IP addresses are extracted from request headers (supports proxies)
