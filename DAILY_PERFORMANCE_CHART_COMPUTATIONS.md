# Daily Performance Chart - Data Computations Documentation

## Overview

The DailyPerformanceChart component processes and visualizes daily sales performance data, comparing actual sales against targets with cumulative calculations.

## Input Data Structure

```javascript
{
  data: [
    { day: 1, total: 1500.00 },
    { day: 2, total: 2200.50 },
    // ... more daily records
  ],
  targetMonth: 12,        // Target month (1-12)
  targetYear: 2024,       // Target year
  targetAmount: 50000,    // Monthly target amount
  dailyTarget: 1612.90,   // Optional: Daily target from backend
  stats: {                // Optional: Pre-calculated stats from backend
    sales: 48500.00,
    target: 50000,
    percentOfTarget: 97.0,
    difference: -1500.00
  }
}
```

## Core Computations

### 1. Running Total Calculation

**Purpose**: Convert daily sales into cumulative totals for trend visualization

```javascript
let runningTotal = 0;
const runningTotals = data.map((day) => {
  runningTotal += day.total;
  return runningTotal;
});
```

**Process**:

- Initializes accumulator at 0
- Iterates through daily data in order
- Adds each day's total to running sum
- Returns array of cumulative values

**Example**:

```
Day 1: 1500 → Running Total: 1500
Day 2: 2200 → Running Total: 3700
Day 3: 1800 → Running Total: 5500
```

### 2. Daily Target Calculation

**Purpose**: Calculate expected daily performance targets

```javascript
const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
const calculatedDailyTarget = dailyTarget || targetAmount / daysInMonth;
```

**Process**:

- Gets actual days in the target month (handles leap years)
- Uses backend-provided dailyTarget if available
- Falls back to dividing monthly target by days in month
- Accounts for varying month lengths (28-31 days)

**Example** (December 2024):

```
Monthly Target: $50,000
Days in December: 31
Daily Target: $50,000 ÷ 31 = $1,612.90
```

### 3. Target Line Generation

**Purpose**: Create cumulative target line for comparison visualization

```javascript
const targetLine = data.map((_, index) => calculatedDailyTarget * (index + 1));
```

**Process**:

- Multiplies daily target by day number (1-based)
- Creates progressive target expectations
- Aligns with actual data length

**Example**:

```
Day 1: $1,612.90 × 1 = $1,612.90
Day 2: $1,612.90 × 2 = $3,225.80
Day 3: $1,612.90 × 3 = $4,838.70
```

### 4. Performance Statistics

**Purpose**: Calculate key performance indicators

#### Total Sales

```javascript
const totalSales =
  stats?.sales ?? (runningTotals[runningTotals.length - 1] || 0);
```

- Uses backend stats if available
- Falls back to last running total value
- Defaults to 0 if no data

#### Target Amount

```javascript
const target = stats?.target ?? targetAmount;
```

- Prefers backend-calculated target
- Uses input target amount as fallback

#### Percentage of Target

```javascript
const percentOfTarget =
  stats?.percentOfTarget ??
  (target > 0 ? Math.round((totalSales / target) * 100 * 10) / 10 : 0);
```

- Calculates: (Total Sales ÷ Target) × 100
- Rounds to 1 decimal place for precision
- Prevents division by zero
- **Fixed**: Added rounding to avoid floating-point precision issues

#### Variance Calculation

```javascript
const difference = stats?.difference ?? totalSales - target;
```

- Simple difference: Actual - Target
- Positive = over target, Negative = under target

## Data Visualization Processing

### Chart Data Structure

```javascript
const chartData = {
  labels: data.map((d) => d.day.toString()),
  datasets: [
    {
      label: "Sales",
      data: runningTotals, // Cumulative sales
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      fill: true,
      tension: 0.3,
    },
    {
      label: "Target",
      data: targetLine, // Cumulative targets
      borderColor: "#ef4444",
      backgroundColor: "transparent",
      borderDash: [5, 5],
      tension: 0,
    },
  ],
};
```

### Chart Configuration

- **Y-axis**: Begins at zero, formatted with currency
- **X-axis**: Day of month labels
- **Tooltips**: Custom currency formatting
- **Legend**: Top position
- **Fill**: Area under sales line

## Error Handling & Edge Cases

### Empty Data Protection

```javascript
if (!data || data.length === 0) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Daily Performance
      </h3>
      <p className="text-gray-500 text-center py-8">
        No data available for this period
      </p>
    </div>
  );
}
```

### Division by Zero Prevention

- Target percentage calculation checks `target > 0`
- Returns 0% if no target is set

### Month Length Handling

- Uses `new Date(targetYear, targetMonth, 0).getDate()`
- Correctly handles leap years and varying month lengths

## Performance Considerations

### Backend vs Frontend Calculations

- **Backend Preferred**: Pre-calculated stats reduce client processing
- **Frontend Fallback**: Ensures functionality when backend stats unavailable
- **Hybrid Approach**: Combines reliability with performance

### Memory Efficiency

- Uses `map()` operations for single-pass transformations
- Avoids nested loops for large datasets
- Minimal state mutations

## Usage Examples

### Complete Month Data

```javascript
<DailyPerformanceChart
  data={[
    { day: 1, total: 1500 },
    { day: 2, total: 2200 },
    // ... 31 days
  ]}
  targetMonth={12}
  targetYear={2024}
  targetAmount={50000}
  dailyTarget={1612.9}
/>
```

### Partial Month with Backend Stats

```javascript
<DailyPerformanceChart
  data={[
    { day: 1, total: 1500 },
    { day: 2, total: 2200 },
    // ... partial month
  ]}
  targetMonth={12}
  targetYear={2024}
  targetAmount={50000}
  stats={{
    sales: 15000,
    target: 50000,
    percentOfTarget: 30.0,
    difference: -35000,
  }}
/>
```

## Recent Fixes Applied

### Percentage Precision Fix

- **Issue**: Floating-point arithmetic causing imprecise percentages
- **Solution**: Added `Math.round(((totalSales / target) * 100) * 10) / 10`
- **Benefit**: Consistent 1-decimal precision (e.g., 97.0% not 96.99999%)

## Integration Points

### Data Sources

- **Daily Sales**: From sales database aggregated by day
- **Targets**: From business configuration or department settings
- **Stats**: Optional pre-computed values from analytics service

### Dependencies

- **LineChart**: Chart.js wrapper component
- **Formatters**: Currency and number formatting utilities
- **Date Utilities**: Built-in JavaScript Date object

## Maintenance Notes

- Verify month calculations during leap year testing
- Monitor performance with large datasets (>365 days)
- Update currency formatting for internationalization needs
- Consider caching computed values for repeated renders
