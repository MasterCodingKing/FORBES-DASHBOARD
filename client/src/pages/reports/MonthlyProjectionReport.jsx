import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import projectionService from '../../services/projectionService';
import departmentService from '../../services/departmentService';
import { formatCurrency } from '../../utils/formatters';
import { exportToPNG, exportToExcel, exportToPDF } from '../../utils/exportUtils';

const MonthlyProjectionReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [serviceBreakdown, setServiceBreakdown] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [projections, setProjections] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  
  const reportRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = useMemo(() => {
    const result = [];
    const cy = new Date().getFullYear();
    for (let y = cy - 4; y <= cy + 1; y++) result.push(y);
    return result;
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [breakdownResp, projectionsResp, deptResp] = await Promise.all([
        dashboardService.getServiceBreakdown(selectedYear, selectedMonth),
        projectionService.getByMonth(selectedYear, selectedMonth),
        departmentService.getAll()
      ]);

      setServiceBreakdown(breakdownResp.data);
      setDepartments(deptResp.data?.departments || []);
      
      const projData = projectionsResp.data?.projections || [];
      setProjections(projData);
      
      // Initialize edit data with existing projections
      const initialEditData = {};
      projData.forEach(p => {
        initialEditData[p.department_id] = {
          avg_monthly: parseFloat(p.avg_monthly || 0),
          monthly_target: parseFloat(p.monthly_target || 0)
        };
      });
      setEditData(initialEditData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNum = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
  };

  // Get projection data for a department
  const getProjectionData = (departmentId) => {
    const projection = projections.find(p => p.department_id === departmentId);
    return {
      avg_monthly: parseFloat(projection?.avg_monthly || 0),
      monthly_target: parseFloat(projection?.monthly_target || 0)
    };
  };

  // Get actual revenue for a department from service breakdown
  const getActualRevenue = (departmentId) => {
    const service = serviceBreakdown?.breakdown?.find(s => s.departmentId === departmentId);
    return parseFloat(service?.revenue || 0);
  };

  const handleEditChange = (departmentId, field, value) => {
    setEditData(prev => ({
      ...prev,
      [departmentId]: {
        ...prev[departmentId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSaveProjections = async () => {
    try {
      setSaving(true);
      setError(null);

      const projectionsToSave = departments.map(dept => ({
        department_id: dept.id,
        avg_monthly: editData[dept.id]?.avg_monthly || 0,
        monthly_target: editData[dept.id]?.monthly_target || 0
      }));

      await projectionService.bulkCreate(selectedYear, selectedMonth, projectionsToSave);
      
      setSuccess('Projections saved successfully!');
      setEditMode(false);
      fetchData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save projections');
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let avgMonthlyTotal = 0;
    let monthlyTargetTotal = 0;
    let actualTotal = 0;

    departments.forEach(dept => {
      const projData = editMode ? (editData[dept.id] || {}) : getProjectionData(dept.id);
      avgMonthlyTotal += projData.avg_monthly || 0;
      monthlyTargetTotal += projData.monthly_target || 0;
      actualTotal += getActualRevenue(dept.id);
    });

    return { avgMonthlyTotal, monthlyTargetTotal, actualTotal };
  };

  const handleExport = async (format) => {
    const filename = `Monthly-Projection-${months[selectedMonth - 1]}-${selectedYear}`;
    const totals = calculateTotals();
    
    if (format === 'png') {
      await exportToPNG('report-content', filename);
    } else if (format === 'pdf') {
      await exportToPDF('report-content', filename, `Monthly Projection as of ${months[selectedMonth - 1]}`);
    } else if (format === 'excel') {
      const data = departments.map(dept => {
        const projData = getProjectionData(dept.id);
        return {
          Services: dept.name,
          'Avg Monthly': projData.avg_monthly,
          'Monthly Target': projData.monthly_target,
          'Actual': getActualRevenue(dept.id)
        };
      });
      // Add total row
      data.push({
        Services: 'Total',
        'Avg Monthly': totals.avgMonthlyTotal,
        'Monthly Target': totals.monthlyTargetTotal,
        'Actual': totals.actualTotal
      });
      exportToExcel(data, filename);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">MONTHLY PROJECTION AS OF {months[selectedMonth - 1].toUpperCase()}</h1>
            <p className="text-gray-500">View monthly projections and targets</p>
          </div>
        </div>
        
        {/* Filters and Export */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Projections
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveProjections}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  fetchData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          <button
            onClick={() => handleExport('png')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            PNG
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Report Content */}
      <div id="report-content" ref={reportRef} className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h3 className="text-center font-bold mb-6 text-xl border-b pb-4">
          MONTHLY PROJECTION as of {months[selectedMonth - 1].toUpperCase()} {selectedYear}
        </h3>
        
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="font-bold">
              <th className="border border-gray-400 bg-gray-200 px-4 py-3 text-left">SERVICES</th>
              <th className="border border-gray-400 bg-gray-200 px-4 py-3 text-right">AVG MONTHLY</th>
              <th className="border border-gray-400 bg-gray-200 px-4 py-3 text-right">MONTHLY TARGET</th>
              <th className="border border-gray-400 bg-gray-200 px-4 py-3 text-right">ACTUAL</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, idx) => {
              const projData = editMode ? (editData[dept.id] || { avg_monthly: 0, monthly_target: 0 }) : getProjectionData(dept.id);
              const actualRevenue = getActualRevenue(dept.id);
              
              return (
                <tr key={dept.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-4 py-2 italic">{dept.name}</td>
                  <td className="border border-gray-400 px-4 py-2 text-right">
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={projData.avg_monthly || ''}
                        onChange={(e) => handleEditChange(dept.id, 'avg_monthly', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    ) : (
                      formatNum(projData.avg_monthly)
                    )}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-right">
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={projData.monthly_target || ''}
                        onChange={(e) => handleEditChange(dept.id, 'monthly_target', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    ) : (
                      formatNum(projData.monthly_target)
                    )}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-right">{formatNum(actualRevenue)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100">
              <td className="border border-gray-400 px-4 py-3 text-center">TOTAL</td>
              <td className="border border-gray-400 px-4 py-3 text-right">
                {formatNum(totals.avgMonthlyTotal)}
              </td>
              <td className="border border-gray-400 px-4 py-3 text-right">
                {formatNum(totals.monthlyTargetTotal)}
              </td>
              <td className="border border-gray-400 px-4 py-3 text-right">
                {formatNum(totals.actualTotal)}
              </td>
            </tr>
            <tr className="font-bold border-t-2 bg-gray-50">
              <td className="border border-gray-400 px-4 py-3 text-center">% of Target</td>
              <td className="border border-gray-400 px-4 py-3 text-right">-</td>
              <td className="border border-gray-400 px-4 py-3 text-right text-blue-600">100%</td>
              <td className="border border-gray-400 px-4 py-3 text-right text-green-600">
                {totals.monthlyTargetTotal > 0 
                  ? `${((totals.actualTotal / totals.monthlyTargetTotal) * 100).toFixed(1)}%`
                  : '-'}
              </td>
            </tr>
          </tfoot>
        </table>

        {editMode && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Edit Mode:</strong> Enter the Average Monthly and Monthly Target values for each service, then click Save to store the projections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyProjectionReport;
