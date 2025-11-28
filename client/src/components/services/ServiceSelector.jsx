import Select from '../common/Select';
import { MONTHS, getYears } from '../../utils/constants';

const ServiceSelector = ({
  departments,
  selectedDepartment,
  displayMonth,
  displayYear,
  targetMonth,
  targetYear,
  onDepartmentChange,
  onDisplayMonthChange,
  onDisplayYearChange,
  onTargetMonthChange,
  onTargetYearChange
}) => {
  const years = getYears();

  const departmentOptions = departments.map(d => ({
    value: d.id,
    label: d.name
  }));

  const monthOptions = MONTHS.map(m => ({
    value: m.value,
    label: m.label
  }));

  const yearOptions = years.map(y => ({
    value: y,
    label: y.toString()
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Control Panel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select
          label="Service"
          options={departmentOptions}
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          placeholder="Select a service"
        />
        <Select
          label="Display Month"
          options={monthOptions}
          value={displayMonth}
          onChange={(e) => onDisplayMonthChange(parseInt(e.target.value))}
        />
        <Select
          label="Display Year"
          options={yearOptions}
          value={displayYear}
          onChange={(e) => onDisplayYearChange(parseInt(e.target.value))}
        />
        <Select
          label="Target Month"
          options={monthOptions}
          value={targetMonth}
          onChange={(e) => onTargetMonthChange(parseInt(e.target.value))}
        />
        <Select
          label="Target Year"
          options={yearOptions}
          value={targetYear}
          onChange={(e) => onTargetYearChange(parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};

export default ServiceSelector;
