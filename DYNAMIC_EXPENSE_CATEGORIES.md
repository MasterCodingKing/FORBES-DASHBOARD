# Dynamic Expense Categories Implementation

This implementation allows you to manage expense categories dynamically instead of using hardcoded values.

## Database Setup

1. Run the SQL migration to create the expense_categories table:

   ```bash
   mysql -u your_user -p your_database < SQL/create-expense-categories.sql
   ```

   This will:

   - Create the `expense_categories` table
   - Insert default categories (General, Utilities, Supplies, etc.)

## Features

### 1. **Add New Category**

- In the "Add Expenses" modal, click "Add New Category"
- Enter:
  - **Category Name**: e.g., "Office Supplies"
  - **Category Code**: e.g., "OFFSUP" (will be auto-converted to uppercase)
  - **Description**: Optional brief description
- Click "Save Category"
- The new category will immediately appear in the dropdown

### 2. **Category Properties**

Each category has:

- **ID**: Auto-incremented unique identifier
- **Name**: Display name (must be unique)
- **Code**: Short code for the category (must be unique)
- **Description**: Optional description
- **Active Status**: Can be activated/deactivated

### 3. **API Endpoints**

**Get all categories:**

```
GET /api/expense-categories?active_only=true
```

**Create category:**

```
POST /api/expense-categories
Body: { name, code, description }
```

**Update category:**

```
PUT /api/expense-categories/:id
Body: { name, code, description, isActive }
```

**Delete category:**

```
DELETE /api/expense-categories/:id
```

Note: Cannot delete if used by existing expenses

### 4. **Client Implementation**

- AddExpenseModal: Fetches and allows adding categories
- EditExpenseModal: Shows dynamic categories
- Expenses Page: Filter by dynamic categories

## Default Categories

The following categories are created by default:

1. General (GEN)
2. Utilities (UTIL)
3. Supplies (SUP)
4. Marketing (MKT)
5. Salaries (SAL)
6. Rent (RENT)
7. Equipment (EQP)
8. Travel (TRV)
9. Maintenance (MNT)
10. Other (OTH)

## Usage Example

1. Open "Add Expenses" modal
2. Click "Add New Category" (if needed)
3. Enter category details:
   - Name: "13th Month Bonus"
   - Code: "13TH"
   - Description: "Year-end 13th month salary bonus"
4. Save the category
5. Select it from the dropdown when adding expenses
6. The expense code will auto-increment (10000, 10001, etc.)

## Notes

- Category codes are always stored in uppercase
- Cannot delete categories that are in use by existing expenses
- Inactive categories can be hidden from dropdown by setting `active_only=false`
- All expense forms now fetch categories dynamically on load
