import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import salesService from '../services/salesService';
import departmentService from '../services/departmentService';
import { formatCurrency } from '../utils/formatters';

const AddSales = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  // Number of days to show (configurable)
  const [numDays, setNumDays] = useState(5);
  
  // Selected date (start date)
  const [startDate, setStartDate] = useState(
    dateParam || new Date().toISOString().split('T')[0]
  );
  
  const [departments, setDepartments] = useState([]);
  // salesAmounts structure: { deptId: { date1: amount, date2: amount, ... } }
  const [salesAmounts, setSalesAmounts] = useState({});
  // existingSales structure: { deptId: { date1: saleObj, date2: saleObj, ... } }
  const [existingSales, setExistingSales] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Generate array of dates based on startDate and numDays
  const getDates = useCallback(() => {
    const dates = [];
    
    // Parse the date string directly without timezone conversion
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (isNaN(start.getTime())) {
      return [];
    }
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    
    return dates;
  }, [startDate, numDays]);

  const dates = getDates();

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentService.getAll();
      const depts = response.data?.departments || response.data || [];
      setDepartments(depts);
      
      // Initialize amounts for each department and date
      const initialAmounts = {};
      depts.forEach(dept => {
        initialAmounts[dept.id] = {};
        dates.forEach(date => {
          initialAmounts[dept.id][date] = '';
        });
      });
      setSalesAmounts(initialAmounts);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load services');
    }
  }, []);

  // Load existing sales for the date range
  const loadExistingSales = useCallback(async () => {
    if (departments.length === 0 || dates.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get unique months/years from dates
      const monthYears = new Set();
      dates.forEach(dateStr => {
        const date = new Date(dateStr);
        monthYears.add(`${date.getMonth() + 1}-${date.getFullYear()}`);
      });

      // Fetch sales for each unique month
      const allSales = [];
      for (const my of monthYears) {
        const [month, year] = my.split('-').map(Number);
        const response = await salesService.getAll({
          month,
          year,
          limit: 10000
        });
        allSales.push(...(response.data?.sales || []));
      }

      // Map existing sales by department_id and date
      const existing = {};
      const amounts = {};
      
      departments.forEach(dept => {
        existing[dept.id] = {};
        amounts[dept.id] = {};
        dates.forEach(date => {
          amounts[dept.id][date] = '';
        });
      });

      allSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const dateKey = saleDate.toISOString().split('T')[0];
        
        // Only include sales that are in our date range
        if (dates.includes(dateKey)) {
          const deptId = sale.department_id || sale.departmentId;
          if (deptId) {
            if (!existing[deptId]) {
              existing[deptId] = {};
              amounts[deptId] = {};
            }
            existing[deptId][dateKey] = sale;
            amounts[deptId][dateKey] = sale.amount?.toString() || '';
          }
        }
      });

      setExistingSales(existing);
      setSalesAmounts(amounts);

    } catch (err) {
      console.error('Error loading existing sales:', err);
      setError('Failed to load existing sales data');
    } finally {
      setLoading(false);
    }
  }, [departments, dates]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (departments.length > 0) {
      loadExistingSales();
    }
  }, [departments, startDate, numDays]);

  // Check if a date is editable (only dates from start date going forward are editable)
  // Dates before the start date are NOT editable
  const isDateEditable = (dateStr) => {
    // Parse the start date
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    startDateObj.setHours(0, 0, 0, 0);
    
    // Parse the check date
    const [checkYear, checkMonth, checkDay] = dateStr.split('-').map(Number);
    const checkDateObj = new Date(checkYear, checkMonth - 1, checkDay);
    checkDateObj.setHours(0, 0, 0, 0);
    
    // Allow editing if date is on or after start date
    return checkDateObj >= startDateObj;
  };

  const handleAmountChange = (deptId, date, value) => {
    // Only allow changes if date is editable
    if (!isDateEditable(date)) {
      return;
    }
    
    setSalesAmounts(prev => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        [date]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const promises = [];

      for (const dept of departments) {
        for (const date of dates) {
          const amount = parseFloat(salesAmounts[dept.id]?.[date]) || 0;
          const existingSale = existingSales[dept.id]?.[date];

          if (existingSale) {
            // Update existing sale
            if (amount > 0) {
              promises.push(
                salesService.update(existingSale.id, {
                  department_id: dept.id,
                  amount,
                  sale_date: date,
                  remarks: existingSale.remarks || ''
                })
              );
            } else {
              // Delete if amount is 0 or empty
              promises.push(salesService.delete(existingSale.id));
            }
          } else if (amount > 0) {
            // Create new sale
            promises.push(
              salesService.create({
                department_id: dept.id,
                amount,
                sale_date: date,
                remarks: ''
              })
            );
          }
        }
      }

      await Promise.all(promises);
      setSuccess('Sales saved successfully!');

      // Navigate back to sales list after a short delay
      setTimeout(() => {
        navigate('/sales');
      }, 1500);

    } catch (err) {
      console.error('Error saving sales:', err);
      setError(err.response?.data?.message || 'Failed to save sales');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total per date
  const getDateTotal = (date) => {
    let total = 0;
    departments.forEach(dept => {
      total += parseFloat(salesAmounts[dept.id]?.[date]) || 0;
    });
    return total;
  };

  // Calculate grand total
  const grandTotal = dates.reduce((sum, date) => sum + getDateTotal(date), 0);

  // Format date for header display (MMM D, YYYY)
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return 'Invalid Date';
    
    // Parse date string directly without timezone conversion
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add/Edit Sales</h1>
          <p className="text-gray-500">
            Enter sales for multiple dates at once
          </p>
          <p className="text-sm text-amber-600 font-medium mt-1">
            ⚠️ Only dates from the start date onwards are editable
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/sales')}>
          ← Back to Sales
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Sales Form - Everything inside form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Date Controls */}
          <div className="flex flex-wrap items-end gap-4 mb-6 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={numDays}
                onChange={(e) => setNumDays(parseInt(e.target.value) || 1)}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Selected Range</p>
              <p className="text-sm font-bold text-blue-700">
                {dates.length > 0 ? `${formatDateHeader(dates[0])} - ${formatDateHeader(dates[dates.length - 1])}` : 'Invalid Range'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium">Grand Total</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">
                      Service
                    </th>
                    {dates.map(date => {
                      const editable = isDateEditable(date);
                      return (
                        <th 
                          key={date} 
                          className={`border border-gray-300 px-4 py-3 text-center font-semibold min-w-[120px] ${
                            editable ? 'text-gray-700' : 'text-gray-400 bg-gray-200'
                          }`}
                        >
                          <div>{formatDateHeader(date)}</div>
                          {!editable && (
                            <div className="text-xs font-normal text-red-500 mt-1">
                              Not Editable
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, index) => (
                    <tr
                      key={dept.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                        {dept.name}
                      </td>
                      {dates.map(date => {
                        const editable = isDateEditable(date);
                        const hasValue = salesAmounts[dept.id]?.[date] && parseFloat(salesAmounts[dept.id]?.[date]) > 0;
                        
                        return (
                          <td key={date} className={`border border-gray-300 px-2 py-1 ${
                            !editable ? 'bg-gray-100' : ''
                          }`}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="999999999999.99"
                              placeholder="0"
                              value={salesAmounts[dept.id]?.[date] || ''}
                              onChange={(e) => handleAmountChange(dept.id, date, e.target.value)}
                              disabled={!editable}
                              className={`w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                !editable
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : hasValue
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300 bg-white'
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 sticky left-0 bg-blue-100 z-10">
                      TOTAL
                    </td>
                    {dates.map(date => (
                      <td key={date} className="border border-gray-300 px-4 py-2 text-right text-blue-700">
                        {formatCurrency(getDateTotal(date))}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-center gap-4 mt-6 pt-6 border-t">
            <Button
              type="submit"
              loading={saving}
              disabled={loading || saving}
              className="min-w-[120px]"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/sales')}
              disabled={saving}
              className="min-w-[120px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSales;
