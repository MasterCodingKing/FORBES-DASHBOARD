import { useState, useEffect } from 'react';
import { ServiceSelector, DailyPerformanceChart, DailyBreakdownTable } from '../components/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import departmentService from '../services/departmentService';
import dashboardService from '../services/dashboardService';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { Link } from 'react-router-dom';

const ServicesDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [dailyData, setDailyData] = useState([]);
  const [stats, setStats] = useState(null);
  const [dailyTarget, setDailyTarget] = useState(0);
  const [targetSource, setTargetSource] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize with current month
  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [targetMonth, setTargetMonth] = useState(currentDate.getMonth() + 1);
  const [targetYear, setTargetYear] = useState(currentDate.getFullYear());

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentService.getAll();
        const depts = response?.data?.departments || [];
        setDepartments(depts);
        if (depts.length > 0) {
          setSelectedDepartment(depts[0].id.toString());
        }
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };
    loadDepartments();
  }, []);

  // Load dashboard data when selection changes
  const loadData = async () => {
    if (!selectedDepartment) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the dashboard service endpoint
      const response = await dashboardService.getServicesDashboard({
        department_id: selectedDepartment,
        display_month: displayMonth,
        display_year: displayYear,
        target_month: targetMonth,
        target_year: targetYear
      });

      const data = response?.data;

      if (data) {
        // Transform daily breakdown for the chart/table components
        const transformedDaily = data.dailyBreakdown.map(item => {
          const dayDate = new Date(displayYear, displayMonth - 1, item.day);
          return {
            day: item.day,
            date: dayDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            }),
            total: item.sales,
            target: item.target,
            variance: item.variance
          };
        });

        setDailyData(transformedDaily);
        setStats(data.stats);
        setDailyTarget(data.dailyTarget);
        setTargetSource(data.targetSource || 'none');
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDepartment, displayMonth, displayYear, targetMonth, targetYear, departments]);

  // Auto-refresh every 30 seconds
  useAutoRefresh(loadData, 30000);

  const selectedDeptName = departments.find(d => d.id.toString() === selectedDepartment)?.name;

  if (error) {
    return (
      <div className="p-4">
        <Alert type="error" message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Services Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link 
            to="/monthly-targets" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Manage Monthly Targets
          </Link>
          <p className="text-sm text-gray-500">
            Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>

      {/* Target Source Indicator */}
      {selectedDepartment && !loading && (
        <div className={`text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2 ${
          targetSource === 'monthly' 
            ? 'bg-green-100 text-green-800' 
            : targetSource === 'department'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          <span className="font-medium">Target Source:</span>
          {targetSource === 'monthly' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Monthly Target Set
            </>
          )}
          {targetSource === 'department' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
              Using Default Department Target
            </>
          )}
          {targetSource === 'none' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span>
              No Target Set - <Link to="/monthly-targets" className="underline">Set one now</Link>
            </>
          )}
        </div>
      )}

      <ServiceSelector
        departments={departments}
        selectedDepartment={selectedDepartment}
        displayMonth={displayMonth}
        displayYear={displayYear}
        targetMonth={targetMonth}
        targetYear={targetYear}
        onDepartmentChange={setSelectedDepartment}
        onDisplayMonthChange={setDisplayMonth}
        onDisplayYearChange={setDisplayYear}
        onTargetMonthChange={setTargetMonth}
        onTargetYearChange={setTargetYear}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {!selectedDepartment ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500">Please select a service to view its performance</p>
            </div>
          ) : (
            <div className="space-y-6">
              <DailyPerformanceChart
                data={dailyData}
                targetMonth={displayMonth}
                targetYear={displayYear}
                targetAmount={stats?.target || 0}
                dailyTarget={dailyTarget}
                stats={stats}
                targetSource={targetSource}
              />

              <DailyBreakdownTable
                data={dailyData}
                serviceName={selectedDeptName}
                stats={stats}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesDashboard;
