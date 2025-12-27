# NOI Implementation - Quick Start Guide

## What Was Added

**NOI (Net Operating Income)** - A monthly field where admins can manually enter additional income that should be added to the total revenue displayed in all charts and graphs.

## Step-by-Step Implementation

### Step 1: Update Database

Run this SQL command to add the NOI column:

```sql
USE `dashboard_db`;

ALTER TABLE `monthly_targets`
ADD COLUMN IF NOT EXISTS `noi_amount` DECIMAL(20, 2) DEFAULT 0
COMMENT 'Monthly Net Operating Income (manually entered)'
AFTER `target_amount`;
```

### Step 2: Restart Backend Server

The changes to the MonthlyTarget model will be automatically recognized by Sequelize.

### Step 3: Use the Monthly Targets Page

1. Navigate to **Monthly Targets** page from the admin panel
2. Click **+ Add Target** or **Edit** an existing target
3. Fill in the form including the new **NOI Amount (Net Operating Income)** field
4. Save the target

### Step 4: Verify in Charts

- Go to any dashboard or report
- Monthly revenue totals will now include the NOI values
- Both charts and tables will show the combined revenue (Sales + NOI)

## Example Usage

**Scenario:** For January 2025, Service A has:

- Sales Revenue: ₱100,000
- NOI (Manual Entry): ₱15,000
- Total Revenue Displayed: ₱115,000

**How to Enter:**

1. Go to Monthly Targets
2. Click Add Target
3. Select: Service A, Year 2025, Month January
4. Target Amount: 100,000
5. **NEW** NOI Amount: 15,000
6. Save

**Result:**

- All charts will show ₱115,000 as the January revenue for Service A
- Income calculations will subtract expenses from ₱115,000
- Reports will reflect the combined total

## Files Changed

**Backend:**

- `/server/models/MonthlyTarget.js` - Added noi_amount field
- `/server/services/dashboardService.js` - Updated revenue calculations
- `/server/controllers/targetController.js` - Updated API endpoints

**Frontend:**

- `/client/src/pages/MonthlyTargets.jsx` - Added NOI input fields and column

**Database:**

- `/SQL/create-monthly-targets.sql` - Updated schema definition
- `/SQL/add-noi-column.sql` - Migration script (NEW)

## Automatic Features

Once implemented, NOI will automatically:
✅ Add to total revenue in all monthly revenue charts
✅ Add to monthly revenue in income calculations
✅ Include in year-to-date comparisons
✅ Display in service breakdowns
✅ Appear in all report exports
✅ Update in real-time when values change

## No User Training Needed

The interface is straightforward:

- Users see a new "NOI Amount" input field
- They enter a number (same as Target Amount)
- System automatically handles the rest

## Backward Compatibility

- Existing targets without NOI work fine (defaults to 0)
- No data loss or migration needed
- All existing functionality preserved
- Can add NOI to targets at any time

## Common Questions

**Q: Can NOI be negative?**
A: No, validation ensures NOI >= 0. Only positive values are allowed.

**Q: What if I don't enter an NOI?**
A: It defaults to 0, and revenue calculations work normally.

**Q: Does NOI affect expense calculations?**
A: No, NOI only affects revenue. Income = (Sales Revenue + NOI) - Expenses

**Q: Can I see which revenue is from sales vs NOI?**
A: Yes, the data structure tracks both separately. Sales Revenue and NOI are stored separately and can be accessed for detailed reporting.

**Q: How do I edit/delete NOI?**
A: Same way as targets - go to Monthly Targets page, find the target, click Edit or Delete.

## Support Notes

All dashboards and charts have been tested to ensure:

- NOI displays correctly
- Revenue totals are accurate
- Income calculations are correct
- Comparisons work properly
- Exports include NOI values

No special handling needed in frontend components - they automatically display whatever revenue total the backend provides.
