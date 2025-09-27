'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  userService,
  coinService
} from '@/lib/services/mockApiService';
import { User, CoinAllocation, SendCoinsForm } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data/users';

const GiveCoinsPage: React.FC = () => {
  const router = useRouter();
  const [allocation, setAllocation] = useState<CoinAllocation | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Array<{user: User, amount: number}>>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Autocomplete state
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeNav] = useState('give');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        const allocationResponse = await coinService.getUserCoinAllocation(userResponse.data.id);
        if (allocationResponse.success && allocationResponse.data) {
          setAllocation(allocationResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleSendCoins = async () => {
    if (selectedEmployees.length === 0 || getTotalAmount() <= 0) return;

    try {
      setSending(true);

      // Send to each employee
      const sendPromises = selectedEmployees.map(async (item) => {
        const form: SendCoinsForm = {
          recipientEmployeeId: item.user.employeeId,
          amount: item.amount,
          message: message.trim(),
          isAnonymous,
        };

        return await coinService.sendCoins(form);
      });

      const responses = await Promise.all(sendPromises);
      const failedSends = responses.filter(response => !response.success);

      if (failedSends.length === 0) {
        alert(`Digital currency sent successfully to ${selectedEmployees.length} employee(s)!`);
        // Reset form
        setSelectedEmployees([]);
        setEmployeeId('');
        setSelectedAmount(5);
        setMessage('');
        setIsAnonymous(false);
        // Reload allocation
        loadUserData();
      } else {
        alert(`Failed to send currency to ${failedSends.length} employee(s). Please try again.`);
      }
    } catch (error) {
      console.error('Error sending coins:', error);
      alert('Error sending currency. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Autocomplete search functions
  const handleSearchInputChange = (value: string) => {
    setEmployeeId(value);

    if (value.trim().length >= 2) {
      const filtered = mockUsers.filter(user =>
        user.role === 'employee' && (
          user.employeeId.toLowerCase().includes(value.toLowerCase()) ||
          user.name.toLowerCase().includes(value.toLowerCase()) ||
          user.department.toLowerCase().includes(value.toLowerCase())
        )
      );
      setSearchResults(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          selectEmployee(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectEmployee = (employee: User) => {
    // Check if employee is already selected
    const isAlreadySelected = selectedEmployees.some(item => item.user.id === employee.id);

    if (!isAlreadySelected) {
      setSelectedEmployees(prev => [...prev, { user: employee, amount: selectedAmount }]);
    }

    // Clear search
    setEmployeeId('');
    setShowDropdown(false);
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  const removeEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(item => item.user.id !== employeeId));
  };

  const updateEmployeeAmount = (employeeId: string, amount: number) => {
    setSelectedEmployees(prev =>
      prev.map(item =>
        item.user.id === employeeId ? { ...item, amount } : item
      )
    );
  };

  const getTotalAmount = () => {
    return selectedEmployees.reduce((total, item) => total + item.amount, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const isFormValid = selectedEmployees.length > 0 && getTotalAmount() > 0 && getTotalAmount() <= (allocation?.remainingAmount || 0);

  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <i className="fa-solid fa-arrow-left text-white text-lg"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold">Send Currency</h1>
              <p className="text-sm text-white/80">Digital Transfer</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Available</p>
            <p className="text-xl font-bold">{allocation?.remainingAmount || 0}</p>
          </div>
        </div>
      </div>

      {/* Send Form */}
      <div className="px-6 mb-24">
        {/* Recipient Selection */}
        <div className="bg-white card-shadow rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Recipient</h3>

          <div className="mb-4 relative" ref={dropdownRef}>
            <label htmlFor="employee-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Employee
            </label>
            <div className="relative">
              <input
                id="employee-search"
                type="text"
                placeholder="Type employee ID, name, or department..."
                value={employeeId}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                autoComplete="off"
              />
              <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((employee, index) => (
                  <div
                    key={employee.id}
                    onClick={() => selectEmployee(employee)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary-50 border-l-4 border-primary-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={employee.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"}
                      className="w-10 h-10 rounded-full"
                      alt={employee.name}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.employeeId} • {employee.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {showDropdown && searchResults.length === 0 && employeeId.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500">
                No employees found matching "{employeeId}"
              </div>
            )}
          </div>

          {/* Selected Employees List */}
          {selectedEmployees.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Selected Recipients ({selectedEmployees.length})</h4>
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-primary-600">{getTotalAmount()}</span> points
                </div>
              </div>

              {selectedEmployees.map((item) => (
                <div key={item.user.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.user.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"}
                      className="w-10 h-10 rounded-full"
                      alt={item.user.name}
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">{item.user.name}</h5>
                      <p className="text-sm text-gray-500">{item.user.employeeId} • {item.user.department}</p>
                    </div>

                    {/* Amount selector for this employee */}
                    <div className="flex items-center gap-2">
                      <select
                        value={item.amount}
                        onChange={(e) => updateEmployeeAmount(item.user.id, parseInt(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                      </select>
                      <span className="text-sm text-gray-500">pts</span>
                    </div>

                    <button
                      onClick={() => removeEmployee(item.user.id)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <i className="fa-solid fa-times text-red-600 text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Amount for New Employees */}
        <div className="bg-white card-shadow rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Default Amount for New Recipients</h3>
          <p className="text-sm text-gray-600 mb-4">Select the default amount that will be assigned to newly added employees</p>

          <div className="grid grid-cols-5 gap-3 mb-4">
            {[1, 5, 10, 15, 25].map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                disabled={amount > (allocation?.remainingAmount || 0)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedAmount === amount
                    ? 'gradient-bg text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-xl font-bold text-primary-700">{selectedEmployees.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-primary-700">{getTotalAmount()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-bold text-gray-700">{(allocation?.remainingAmount || 0) - getTotalAmount()}</p>
              </div>
            </div>
          </div>

          {selectedAmount > 0 && (
            <div className="p-4 bg-primary-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">Sending</p>
              <p className="text-2xl font-bold text-primary-600">{selectedAmount} points</p>
            </div>
          )}
        </div>

        {/* Appreciation Message */}
        <div className="bg-white card-shadow rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appreciation Message</h3>
          <p className="text-sm text-gray-500 mb-3">Add a personal note (optional)</p>

          <textarea
            rows={4}
            placeholder="Write your appreciation message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{message.length}/200 characters</span>

            <div className="flex items-center gap-2">
              <label htmlFor="anonymous-toggle" className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">Anonymous</span>
                <div className="relative inline-flex items-center">
                  <input
                    id="anonymous-toggle"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendCoins}
          disabled={!isFormValid || sending}
          className="w-full py-4 gradient-bg text-white rounded-xl font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {sending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-paper-plane"></i>
              <span>
                {selectedEmployees.length === 0
                  ? 'Send Currency'
                  : `Send to ${selectedEmployees.length} Employee${selectedEmployees.length > 1 ? 's' : ''}`
                }
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 py-2">
          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'home' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => router.push('/dashboard/employee')}
          >
            <i className="fa-solid fa-house text-lg mb-1"></i>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'give' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => {}}
          >
            <i className="fa-solid fa-paper-plane text-lg mb-1"></i>
            <span className="text-xs font-medium">Give</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'rewards' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => router.push('/dashboard/rewards')}
          >
            <i className="fa-solid fa-gift text-lg mb-1"></i>
            <span className="text-xs font-medium">Rewards</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'profile' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => router.push('/dashboard/profile')}
          >
            <i className="fa-solid fa-user text-lg mb-1"></i>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveCoinsPage;
