import { useState, useRef, useEffect } from 'react';

const AccountSelect = ({
  label,
  value,
  onChange,
  options = [],
  onAddAccount,
  onDeleteAccount,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an account',
  loadingAdd = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountDesc, setNewAccountDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddForm(false);
        setDeleteConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when add form opens
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optValue) => {
    onChange({ target: { value: optValue } });
    setIsOpen(false);
    setDeleteConfirm(null);
  };

  const handleAddSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newAccountName.trim()) return;
    
    await onAddAccount({
      name: newAccountName.trim(),
      description: newAccountDesc.trim()
    });
    
    setNewAccountName('');
    setNewAccountDesc('');
    setShowAddForm(false);
  };

  const handleDelete = async (e, accountValue) => {
    e.stopPropagation();
    if (deleteConfirm === accountValue) {
      await onDeleteAccount(accountValue);
      setDeleteConfirm(null);
      // Clear selection if deleted account was selected
      if (value === accountValue) {
        onChange({ target: { value: '' } });
      }
    } else {
      setDeleteConfirm(accountValue);
    }
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Selected Value Display */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2 border rounded-lg text-left
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200 bg-white
            flex items-center justify-between
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-primary-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
            {/* Add New Account Button/Form */}
            {!showAddForm ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddForm(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-b border-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Account
              </button>
            ) : (
              <div className="p-3 bg-green-50 border-b border-green-200">
                <div className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSubmit(e);
                      }
                    }}
                    placeholder="Account name *"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    value={newAccountDesc}
                    onChange={(e) => setNewAccountDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSubmit(e);
                      }
                    }}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddSubmit}
                      disabled={!newAccountName.trim() || loadingAdd}
                      className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingAdd ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddForm(false);
                        setNewAccountName('');
                        setNewAccountDesc('');
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Account number auto-generated</p>
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No accounts available
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      flex items-center justify-between px-4 py-2 cursor-pointer
                      ${value === option.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
                      ${deleteConfirm === option.value ? 'bg-red-50' : ''}
                    `}
                  >
                    <div 
                      className="flex-1 text-sm"
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </div>
                    
                    {/* Delete button */}
                    {deleteConfirm === option.value ? (
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-red-600">Delete?</span>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, option.value)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Confirm delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, option.value)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        style={{ opacity: 1 }}
                        title="Delete account"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default AccountSelect;
