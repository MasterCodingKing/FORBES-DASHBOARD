# NOI (Net Operating Income) Implementation Summary

## Overview

NOI has been successfully integrated into the Forbes Dashboard. This allows users to manually input monthly Net Operating Income values that are automatically added to the total revenue in all charts and reports.

## Changes Made

### 1. Database Schema Updates

**Files Modified:**

- `SQL/create-monthly-targets.sql` - Updated table definition
- `SQL/add-noi-column.sql` - Created migration script (NEW)

**Changes:**

- Added `noi_amount` column (DECIMAL(20, 2)) to `monthly_targets` table
- Default value: 0
- Added constraint: `chk_noi_amount CHECK (noi_amount >= 0)`
- Column comment: "Monthly Net Operating Income (manually entered)"

### 2. Backend Model Updates

**File: `/server/models/MonthlyTarget.js`**

- Added `noi_amount` field with:
  - Type: DECIMAL(20, 2)
  - Nullable: true (optional)
  - Default: 0
  - Validation: Must be >= 0

### 3. Backend Service Updates

**File: `/server/services/dashboardService.js`**

**getMonthlyRevenue() function:**

- Now queries `MonthlyTarget` table to fetch NOI amounts for each month
- Groups NOI by month and sums them
- Returns data structure with:
  - `salesRevenue`: Revenue from sales only
  - `noi`: NOI amount for the month
  - `total`: Combined revenue (salesRevenue + noi)
- Year total includes all NOI values

**getMonthlyIncome() function:**

- Updated to use the new revenue structure
- Income calculation: (salesRevenue + noi) - expenses
- Returns detailed breakdown showing salesRevenue, noi, and revenue separately

### 4. Backend API Updates

**File: `/server/controllers/targetController.js`**

**createOrUpdateTarget() function:**

- Now accepts `noi_amount` in request body
- Stores NOI value when creating/updating monthly targets
- Defaults to 0 if not provided

**updateTarget() function:**

- Now accepts `noi_amount` for updates
- Allows updating NOI independently

### 5. Frontend UI Updates

**File: `/client/src/pages/MonthlyTargets.jsx`**

**Form State:**

- Added `noi_amount` field to formData state
- New field appears in both Add and Edit modals

**UI Components:**

- Add Modal: New "NOI Amount (Net Operating Income)" input field
- Edit Modal: New "NOI Amount (Net Operating Income)" input field
- Data Table: New "NOI Amount" column displaying NOI values formatted as currency

**API Integration:**

- handleAdd(): Now includes `noi_amount` in POST request
- handleUpdate(): Now includes `noi_amount` in PUT request

## How It Works

1. **Admin Input**: Users navigate to Monthly Targets page and add/edit monthly targets
2. **NOI Entry**: For each month/service combination, users can enter a NOI amount
3. **Automatic Calculation**:
   - When revenue is fetched, NOI is automatically added to sales revenue
   - All charts display the combined total (Sales Revenue + NOI)
4. **Reporting**: All dashboards and reports automatically reflect NOI in:
   - Monthly revenue charts
   - Monthly income calculations
   - Year-to-date comparisons
   - Service breakdowns

## Database Migration Steps

1. Run the migration script:

   ```sql
   -- Run SQL/add-noi-column.sql to add noi_amount column
   ```

2. Or manually execute:
   ```sql
   ALTER TABLE `monthly_targets`
   ADD COLUMN IF NOT EXISTS `noi_amount` DECIMAL(20, 2) DEFAULT 0
   COMMENT 'Monthly Net Operating Income (manually entered)'
   AFTER `target_amount`;
   ```

## API Endpoints Affected

### POST /api/targets (Create/Update)

**New Request Body:**

```json
{
  "department_id": 1,
  "year": 2025,
  "month": 1,
  "target_amount": 50000,
  "noi_amount": 5000
}
```

### PUT /api/targets/:id (Update)

**New Request Body:**

```json
{
  "target_amount": 50000,
  "year": 2025,
  "month": 1,
  "noi_amount": 5000
}
```

## Charts and Reports Affected

All the following now include NOI in their revenue calculations:

- ✅ Monthly Revenue Trend
- ✅ Monthly Income Trend
- ✅ Year-to-Date Comparative Sales
- ✅ Year-to-Date Comparative Income
- ✅ Month-to-Month Comparison
- ✅ Service Breakdown
- ✅ Daily Performance Charts
- ✅ Executive Dashboard Summary
- ✅ All report exports (PNG, PDF, Excel)

## Testing Checklist

- [ ] Database: NOI column added successfully
- [ ] Backend: getMonthlyRevenue() returns combined revenue (sales + NOI)
- [ ] Backend: getMonthlyIncome() calculates income correctly
- [ ] Frontend: Monthly Targets page displays NOI column
- [ ] Frontend: Add Modal accepts NOI input
- [ ] Frontend: Edit Modal accepts NOI updates
- [ ] Frontend: Charts display updated revenue with NOI included
- [ ] Frontend: Reports show NOI-adjusted totals
- [ ] API: POST /api/targets accepts and stores NOI
- [ ] API: PUT /api/targets/:id accepts and updates NOI

## Technical Notes

- NOI is stored at the department level but sums across all departments for revenue totals
- NOI defaults to 0 if not specified, maintaining backward compatibility
- The field is completely optional - existing targets work without NOI
- All existing revenue/income data continues to work as before
- Charts will show 0 NOI for months without manually entered values

## Future Enhancements

Possible future improvements:

1. Add NOI breakdown by department in reports
2. Add historical NOI tracking and comparison
3. Create NOI-specific analytics and trends
4. Add NOI forecasting features
5. Create NOI vs. Actual variance analysis
