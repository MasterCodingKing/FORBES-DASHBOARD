import { useState, useEffect, useMemo } from 'react';
import salesService from '../../services/salesService';
import departmentService from '../../services/departmentService';
import ExportButton from '../common/ExportButton';
import { formatCurrency } from '../../utils/formatters';

const MonthlySalesTable = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salesData, setSalesData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Predefined order for services (used for sorting, but all departments will be shown)
  const predefinedServiceOrder = [
    'Field Credit Investigation',
    'Tele Credit Investigation',
    'Business Reports',
    'Appraisals',
    'Negative Records',
    'Foreign',
    'Collection',
    'Marketing',
    'Financial Check',
    'Foreign Exchange Gain'
  ];

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [selectedMonth, selectedYear, viewMode]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      const depts = response.data?.departments || response.data || [];
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    try {
      // In monthly view, fetch all sales for the entire year
      // In daily view, fetch only the selected month
      const params = {
        year: selectedYear,
        limit: 10000
      };
      
      // Only add month filter in daily view
      if (viewMode === 'daily') {
        params.month = selectedMonth;
      }
      
      const response = await salesService.getAll(params);
      setSalesData(response.data?.sales || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  // Get days in the selected month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

  // Process yearly data by month
  const processYearlyData = () => {
    // Initialize all departments with empty data
    const serviceMap = {};
    
    departments.forEach(dept => {
      const deptName = dept.name?.trim();
      if (deptName) {
        serviceMap[deptName] = {
          service: deptName,
          departmentId: dept.id,
          target: dept.target || null,
          months: {}, // Will hold data for each month (1-12)
          yearTotal: 0
        };
      }
    });

    // Process all sales and group by month
    salesData.forEach((sale) => {
      // Parse date properly to avoid timezone issues
      const [year, month, day] = sale.date.split('-').map(Number);
      const saleDate = new Date(year, month - 1, day);
      const monthNum = saleDate.getMonth() + 1; // 1-12
      const service = sale.department?.name?.trim() || null;

      if (!service) return;

      if (!serviceMap[service]) {
        serviceMap[service] = {
          service,
          departmentId: sale.department?.id,
          target: null,
          months: {},
          yearTotal: 0
        };
      }

      if (!serviceMap[service].months[monthNum]) {
        serviceMap[service].months[monthNum] = 0;
      }

      const amount = parseFloat(sale.amount) || 0;
      serviceMap[service].months[monthNum] += amount;
      serviceMap[service].yearTotal += amount;
    });

    // Sort services
    const orderedServices = [];
    const addedServices = new Set();
    
    predefinedServiceOrder.forEach(serviceName => {
      if (serviceMap[serviceName]) {
        orderedServices.push(serviceMap[serviceName]);
        addedServices.add(serviceName);
      }
    });
    
    Object.keys(serviceMap)
      .filter(serviceName => !addedServices.has(serviceName))
      .sort()
      .forEach(serviceName => {
        orderedServices.push(serviceMap[serviceName]);
      });

    return orderedServices;
  };

  // Process data by service and day
  const processData = () => {
    // Initialize all departments with empty data
    const serviceMap = {};
    
    // Initialize from fetched departments
    departments.forEach(dept => {
      const deptName = dept.name?.trim();
      if (deptName) {
        serviceMap[deptName] = {
          service: deptName,
          departmentId: dept.id,
          target: dept.target || null,
          days: {},
          total: 0
        };
      }
    });

    console.log('Sales Data:', salesData);
    console.log('Processing', salesData.length, 'sales records');
    console.log('Departments:', departments);

    salesData.forEach((sale) => {
      const saleDate = new Date(sale.date);
      const day = saleDate.getDate();
      // Use department name and trim whitespace
      const service = sale.department?.name?.trim() || null;

      console.log('Processing sale:', {
        date: sale.date,
        day,
        departmentName: service,
        amount: sale.amount
      });

      // Skip if no valid service/department name
      if (!service) {
        console.warn('Sale without department name:', sale);
        return;
      }

      // If service is not in the map, add it (handles new services)
      if (!serviceMap[service]) {
        console.log('Service not in departments list, adding:', service);
        serviceMap[service] = {
          service,
          departmentId: sale.department?.id,
          target: null,
          days: {},
          total: 0
        };
      }

      if (!serviceMap[service].days[day]) {
        serviceMap[service].days[day] = 0;
      }

      const amount = parseFloat(sale.amount) || 0;
      serviceMap[service].days[day] += amount;
      serviceMap[service].total += amount;
    });

    console.log('Service Map after processing:', serviceMap);

    // Sort services: predefined order first, then alphabetically for any new ones
    const orderedServices = [];
    const addedServices = new Set();
    
    // Add services in predefined order first
    predefinedServiceOrder.forEach(serviceName => {
      if (serviceMap[serviceName]) {
        orderedServices.push(serviceMap[serviceName]);
        addedServices.add(serviceName);
      }
    });
    
    // Add any remaining services not in predefined order (new departments)
    Object.keys(serviceMap)
      .filter(serviceName => !addedServices.has(serviceName))
      .sort()
      .forEach(serviceName => {
        orderedServices.push(serviceMap[serviceName]);
      });

    console.log('Ordered Services:', orderedServices);

    return orderedServices;
  };

  // Memoize processed data to recalculate when salesData or departments change
  const processedData = useMemo(() => processData(), [salesData, departments]);
  
  // Memoize yearly processed data
  const yearlyProcessedData = useMemo(() => processYearlyData(), [salesData, departments]);

  // Calculate daily totals
  const { dailyTotals, grandTotal } = useMemo(() => {
    const dailyTotals = {};
    let grandTotal = 0;

    processedData.forEach((serviceData) => {
      Object.entries(serviceData.days).forEach(([day, amount]) => {
        if (!dailyTotals[day]) {
          dailyTotals[day] = 0;
        }
        dailyTotals[day] += amount;
      });
      grandTotal += serviceData.total;
    });

    return { dailyTotals, grandTotal };
  }, [processedData]);
  
  // Calculate monthly totals for yearly view
  const { monthlyTotals, yearlyGrandTotal } = useMemo(() => {
    const monthlyTotals = {};
    let yearlyGrandTotal = 0;

    yearlyProcessedData.forEach((serviceData) => {
      Object.entries(serviceData.months).forEach(([month, amount]) => {
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0;
        }
        monthlyTotals[month] += amount;
      });
      yearlyGrandTotal += serviceData.yearTotal;
    });

    return { monthlyTotals, yearlyGrandTotal };
  }, [yearlyProcessedData]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6" id="monthly-sales-table-export">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Monthly Sales by Service</h2>
          <p className="text-gray-500 text-sm">
            {viewMode === 'daily' ? 'Daily breakdown' : 'Monthly total'} of sales by service category
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* View Mode Toggle */}
          <ExportButton
            elementId="monthly-sales-table-export"
            filename={`monthly-sales-${months.find(m => m.value === selectedMonth)?.label}-${selectedYear}`}
            title={`Monthly Sales - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
            data={processedData?.map(row => {
              const obj = { Service: row.serviceName };
              if (row.dailySales && Array.isArray(row.dailySales)) {
                row.dailySales.forEach((sale, idx) => {
                  obj[`Day ${idx + 1}`] = sale;
                });
              }
              obj.Total = row.total || 0;
              obj.Variance = row.variance || 0;
              return obj;
            }) || []}
            type="table"
          />
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Day-to-Day
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly Total
            </button>
          </div>
          
          {/* Only show month filter in Day-to-Day view */}
          {viewMode === 'daily' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          )}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (viewMode === 'daily' ? processedData.length === 0 : yearlyProcessedData.length === 0) ? (
        <div className="text-center py-12 text-gray-500">
          No sales data available for {viewMode === 'monthly' ? selectedYear : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
        </div>
      ) : viewMode === 'monthly' ? (
        /* Monthly Total View - Shows all 12 months across the year */
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">
                  Service
                </th>
                {months.map((month) => (
                  <th
                    key={month.value}
                    className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 min-w-[100px]"
                  >
                    {month.label.substring(0, 3)}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 bg-yellow-100">
                  Year Total
                </th>
              </tr>
            </thead>
            <tbody>
              {yearlyProcessedData.map((serviceData) => {
                return (
                  <tr
                    key={serviceData.service}
                    className="bg-yellow-100"
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800 sticky left-0 bg-yellow-100 z-10">
                      {serviceData.service}
                    </td>
                    {months.map((month) => {
                      const amount = serviceData.months[month.value] || 0;
                      return (
                        <td
                          key={month.value}
                          className="border border-gray-300 px-3 py-2 text-right text-sm bg-white"
                        >
                          {amount > 0 ? (
                            <span className="text-gray-800">
                              {formatCurrency(amount)}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-4 py-2 text-right font-bold text-gray-800 bg-yellow-100">
                      {formatCurrency(serviceData.yearTotal)}
                    </td>
                  </tr>
                );
              })}
              {/* Totals Row */}
              <tr className="bg-blue-100 font-bold">
                <td className="border border-gray-300 px-4 py-2 text-gray-800 sticky left-0 bg-blue-100 z-10">
                  TOTAL
                </td>
                {months.map((month) => {
                  const monthTotal = monthlyTotals[month.value] || 0;
                  return (
                    <td
                      key={month.value}
                      className="border border-gray-300 px-3 py-2 text-right text-sm"
                    >
                      {monthTotal > 0 ? (
                        <span className="text-gray-800">
                          {formatCurrency(monthTotal)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-gray-800 bg-yellow-100">
                  {formatCurrency(yearlyGrandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Day-to-Day View */
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">
                  Service
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">
                  Target
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">
                  Weekly Target
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <th
                    key={day}
                    className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 min-w-[80px]"
                  >
                    {months.find(m => m.value === selectedMonth)?.label.substring(0, 3)} {day}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 bg-yellow-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((serviceData, index) => (
                <tr
                  key={serviceData.service}
                  className="bg-yellow-100"
                >
                  <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800 sticky left-0 bg-yellow-100 z-10">
                    {serviceData.service}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-800">
                    {serviceData.target ? formatCurrency(serviceData.target) : '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-800">
                    {serviceData.target ? formatCurrency(serviceData.target / 4) : '-'}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <td
                      key={day}
                      className="border border-gray-300 px-3 py-2 text-right text-sm bg-white"
                    >
                      {serviceData.days[day] ? (
                        <span className="text-gray-800">
                          {formatCurrency(serviceData.days[day])}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold text-gray-800 bg-yellow-100">
                    {formatCurrency(serviceData.total)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-blue-100 font-bold">
                <td className="border border-gray-300 px-4 py-2 text-gray-800 sticky left-0 bg-blue-100 z-10">
                  TOTAL
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <td
                    key={day}
                    className="border border-gray-300 px-3 py-2 text-right text-sm"
                  >
                    {dailyTotals[day] ? (
                      <span className="text-gray-800">
                        {formatCurrency(dailyTotals[day])}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-gray-800 bg-yellow-100">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlySalesTable;
