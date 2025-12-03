import { useState, useEffect, useCallback } from 'react';
import { AddSaleModal, EditSaleModal, SalesTable, DailyComparisonChart } from '../components/sales';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import salesService from '../services/salesService';
import departmentService from '../services/departmentService';
import { formatCurrency } from '../utils/formatters';
import { MONTHS, getYears } from '../utils/constants';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [allSalesForChart, setAllSalesForChart] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
  const [filterDepartment, setFilterDepartment] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data?.departments || []);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        month: filterMonth,
        year: filterYear
      };

      if (filterDepartment) {
        params.departmentId = filterDepartment;
      }

      const response = await salesService.getAll({ ...params, limit: 10000 });
      const currentSales = response.data?.sales || [];
      setSales(currentSales);

      // Load previous month data for chart comparison
      const prevMonth = filterMonth === 1 ? 12 : filterMonth - 1;
      const prevYear = filterMonth === 1 ? filterYear - 1 : filterYear;

      const prevParams = {
        month: prevMonth,
        year: prevYear
      };

      if (filterDepartment) {
        prevParams.departmentId = filterDepartment;
      }

      const prevResponse = await salesService.getAll({ ...prevParams, limit: 10000 });
      const prevSales = prevResponse.data?.sales || [];

      // Combine both months for the chart
      setAllSalesForChart([...currentSales, ...prevSales]);

    } catch (err) {
      console.error('Error loading sales:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, filterDepartment]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setEditModalOpen(true);
  };

  const handleDelete = (sale) => {
    setSelectedSale(sale);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await salesService.delete(selectedSale.id);
      setSuccess('Sale deleted successfully');
      setDeleteModalOpen(false);
      setSelectedSale(null);
      loadSales();
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError('Failed to delete sale');
    }
  };

  const handleSuccess = () => {
    setSuccess('Sale saved successfully');
    loadSales();
  };

  const years = getYears();
  const monthOptions = MONTHS.map(m => ({ value: m.value, label: m.label }));
  const yearOptions = years.map(y => ({ value: y, label: y.toString() }));
  const departmentOptions = [
    { value: '', label: 'All Services' },
    ...departments.map(d => ({ value: d.id, label: d.name }))
  ];

  // Calculate total
  const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-500">Manage sales records</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          + Add Sale
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Month"
            options={monthOptions}
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
          />
          <Select
            label="Year"
            options={yearOptions}
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
          />
          <Select
            label="Service"
            options={departmentOptions}
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          />
          <div className="flex items-end">
            <div className="bg-blue-50 rounded-lg p-4 w-full">
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(totalSales)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Day-to-Day Comparison Chart */}
      {!loading && (
        <DailyComparisonChart
          sales={allSalesForChart}
          currentMonth={filterMonth}
          currentYear={filterYear}
        />
      )}

      {/* Sales Table */}
      <SalesTable
        sales={sales}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Add Modal */}
      <AddSaleModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        departments={departments}
        onSuccess={handleSuccess}
      />

      {/* Edit Modal */}
      {selectedSale && (
        <EditSaleModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedSale(null);
          }}
          sale={selectedSale}
          departments={departments}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this sale of{' '}
            <span className="font-semibold">{formatCurrency(selectedSale?.amount || 0)}</span>?
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
