import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { validateUser } from '../utils/validators';
import userService from '../services/userService';

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await userService.getById(id);
        console.log('User API Response:', response);
        
        // Handle different response structures
        const user = response.data?.data?.user || response.data?.user || response.data;
        
        if (!user) {
          throw new Error('User data not found in response');
        }
        
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'user'
        });
      } catch (err) {
        console.error('Error loading user:', err);
        console.error('Error details:', err.response?.data);
        setApiError(err.response?.data?.message || err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const validation = validateUser(formData, false);
    
    // Password validation only if password is provided
    if (formData.password) {
      if (formData.password.length < 6) {
        validation.errors.password = 'Password must be at least 6 characters';
        validation.isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        validation.errors.confirmPassword = 'Passwords do not match';
        validation.isValid = false;
      }
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    try {
      setSaving(true);
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        role: formData.role
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await userService.update(id, updateData);
      navigate('/users', { state: { success: 'User updated successfully' } });
    } catch (err) {
      console.error('Error updating user:', err);
      setApiError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
        <p className="text-gray-500">Update user information</p>
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
            type="text"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            placeholder="user@example.com"
          />

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Leave password fields empty to keep the current password
            </p>
          </div>

          <Input
            label="New Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Minimum 6 characters (optional)"
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter password"
          />

          <Select
            label="Role"
            name="role"
            options={roleOptions}
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/users')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
