import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { validateUser } from '../utils/validators';
import userService from '../services/userService';

const UserCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    is_admin: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const validation = validateUser(formData, true);
    
    // Additional confirm password check
    if (formData.password !== formData.confirmPassword) {
      validation.errors.confirmPassword = 'Passwords do not match';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      setLoading(true);
      await userService.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        is_admin: formData.is_admin
      });
      navigate('/users', { state: { success: 'User created successfully' } });
    } catch (err) {
      console.error('Error creating user:', err);
      setApiError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/users')}
          className="mb-4"
        >
          ← Back to Users
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
        <p className="text-gray-500">Add a new user to the system</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {apiError && (
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
            required
            placeholder="Enter first name"
          />

          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
            placeholder="Enter last name"
          />

          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            placeholder="Enter username"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            placeholder="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            placeholder="Re-enter password"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_admin"
              name="is_admin"
              checked={formData.is_admin}
              onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-700">
              Administrator
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreate;
