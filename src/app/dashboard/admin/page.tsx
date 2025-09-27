'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  userService,
  analyticsService
} from '@/lib/services/mockApiService';
import { User, AnalyticsData } from '@/lib/types';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('admin');
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'analytics' | 'rewards' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: '',
    role: 'employee' as 'employee' | 'admin'
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }
      
      // Load analytics data
      const analyticsResponse = await analyticsService.getAnalyticsData();
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      }
      

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (itemId: string) => {
    setActiveNav(itemId);

    switch (itemId) {
      case 'home':
        router.push('/dashboard/admin');
        break;
      case 'give':
        router.push('/dashboard/give-coins');
        break;
      case 'rewards':
        router.push('/dashboard/rewards');
        break;
      case 'profile':
        router.push('/dashboard/wallet');
        break;
      default:
        console.log(`Navigate to: ${itemId}`);
    }
  };

  const handleAddUser = () => {
    setCurrentView('users');
  };

  const handleManageRewards = () => {
    setCurrentView('rewards');
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  const handleSystemSettings = () => {
    setCurrentView('settings');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const loadUsers = async () => {
    try {
      // In a real app, this would fetch from an API
      const mockUsersData = await import('@/lib/mock-data/users');
      setUsers(mockUsersData.mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateUser = () => {
    // In a real app, this would make an API call
    const newUserId = `user-${Date.now()}`;
    const userToAdd: User = {
      id: newUserId,
      employeeId: `EMP${String(users.length + 1).padStart(3, '0')}`,
      name: newUser.name,
      email: newUser.email,
      department: newUser.department,
      role: newUser.role,
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, userToAdd]);
    setNewUser({ name: '', email: '', department: '', role: 'employee' });
    setShowAddUserModal(false);
    alert('User created successfully!');
  };

  // Load users when entering user management view
  useEffect(() => {
    if (currentView === 'users') {
      loadUsers();
    }
  }, [currentView]);

  // Render User Management View
  const renderUserManagement = () => (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackToDashboard}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-sm text-white/80">Manage employees and admins</p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-white/80 mb-1">Total Users</p>
              <span className="text-xl font-bold">{users.length}</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/80 mb-1">Active Users</p>
              <span className="text-xl font-bold">{users.filter(u => u.role === 'employee').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Button */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <button
          onClick={() => setShowAddUserModal(true)}
          className="w-full bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
        >
          <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fa-solid fa-user-plus text-white text-lg"></i>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Add New User</h3>
          <p className="text-xs text-gray-500">Create employee or admin account</p>
        </button>
      </div>

      {/* Users List */}
      <div className="px-6 mb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">All Users</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="bg-white card-shadow rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"}
                  className="w-12 h-12 rounded-full"
                  alt={user.name}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.employeeId} • {user.department}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New User</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />

              <input
                type="text"
                placeholder="Department"
                value={newUser.department}
                onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />

              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'employee' | 'admin' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || !newUser.department}
                className="flex-1 py-3 px-4 gradient-bg text-white rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Analytics View
  const renderAnalytics = () => (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackToDashboard}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">Analytics Dashboard</h1>
            <p className="text-sm text-white/80">Detailed insights and reports</p>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="px-6 -mt-8 relative z-10 mb-20">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white card-shadow rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-users text-white text-lg"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analytics?.totalUsers || 247}</h3>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>

          <div className="bg-white card-shadow rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-chart-line text-white text-lg"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analytics?.activeUsersToday || 89}</h3>
            <p className="text-sm text-gray-500">Active Today</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white card-shadow rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-coins text-white text-lg"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analytics?.totalCoinsGiven || 15420}</h3>
            <p className="text-sm text-gray-500">Total Coins</p>
          </div>

          <div className="bg-white card-shadow rounded-2xl p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-gift text-white text-lg"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analytics?.totalRewardsRedeemed || 342}</h3>
            <p className="text-sm text-gray-500">Rewards Redeemed</p>
          </div>
        </div>

        {/* Participation Rate */}
        <div className="bg-white card-shadow rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Participation Rate</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="gradient-bg h-3 rounded-full transition-all duration-500"
                style={{ width: `${analytics?.participationRate || 78}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-primary-600">{analytics?.participationRate || 78}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Users active this month</p>
        </div>

        {/* Department Stats */}
        <div className="bg-white card-shadow rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Department Activity</h3>
          <div className="space-y-3">
            {(analytics?.departmentStats || [
              { department: 'Engineering', userCount: 45, coinsGiven: 2340, coinsReceived: 2180 },
              { department: 'Marketing', userCount: 23, coinsGiven: 1560, coinsReceived: 1720 },
              { department: 'Sales', userCount: 31, coinsGiven: 1890, coinsReceived: 1650 },
              { department: 'HR', userCount: 12, coinsGiven: 780, coinsReceived: 890 }
            ]).map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-gray-800">{dept.department}</h4>
                  <p className="text-sm text-gray-500">{dept.userCount} users</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">+{dept.coinsGiven}</p>
                  <p className="text-xs text-gray-500">coins given</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white card-shadow rounded-2xl p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Trend</h3>
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => {
              const value = [85, 92, 78, 95, 88][index];
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-8">{month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="gradient-bg h-2 rounded-full transition-all duration-500"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Rewards Management View
  const renderRewardsManagement = () => (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackToDashboard}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">Rewards Management</h1>
            <p className="text-sm text-white/80">Manage reward catalog</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/dashboard/rewards')}
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-eye text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">View Catalog</h3>
            <p className="text-xs text-gray-500">Browse rewards</p>
          </button>

          <button
            onClick={() => alert('Add Reward feature - Coming soon!')}
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-plus text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Add Reward</h3>
            <p className="text-xs text-gray-500">New item</p>
          </button>
        </div>
      </div>

      {/* Rewards Stats */}
      <div className="px-6 mb-6">
        <div className="bg-white card-shadow rounded-2xl p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Rewards Overview</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">24</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-sm text-gray-500">In Stock</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">342</p>
              <p className="text-sm text-gray-500">Redeemed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Rewards */}
      <div className="px-6 mb-20">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Popular Rewards</h2>
        <div className="space-y-3">
          {[
            { name: 'Amazon Gift Card $25', redeemed: 45, stock: 20, points: 2500 },
            { name: 'Coffee Shop Voucher', redeemed: 38, stock: 15, points: 500 },
            { name: 'Extra PTO Day', redeemed: 32, stock: 50, points: 1000 },
            { name: 'Team Lunch Voucher', redeemed: 28, stock: 10, points: 1500 }
          ].map((reward, index) => (
            <div key={index} className="bg-white card-shadow rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                  <p className="text-sm text-gray-500">{reward.points} points</p>
                  <p className="text-xs text-gray-400">Stock: {reward.stock} • Redeemed: {reward.redeemed}</p>
                </div>
                <div className="text-right">
                  <button className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Settings View
  const renderSettings = () => (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackToDashboard}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">System Settings</h1>
            <p className="text-sm text-white/80">Configure platform settings</p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-6 -mt-8 relative z-10 mb-20">
        {/* General Settings */}
        <div className="bg-white card-shadow rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Monthly Coin Allocation</p>
                <p className="text-sm text-gray-500">Coins given to each user monthly</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary-600">100</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Max Coins Per Transaction</p>
                <p className="text-sm text-gray-500">Maximum coins in single transfer</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary-600">25</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Coin Expiration</p>
                <p className="text-sm text-gray-500">Days before coins expire</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary-600">90</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white card-shadow rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Feature Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Anonymous Giving</p>
                <p className="text-sm text-gray-500">Allow users to send coins anonymously</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Content Filtering</p>
                <p className="text-sm text-gray-500">Filter inappropriate messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Maintenance Mode</p>
                <p className="text-sm text-gray-500">Temporarily disable platform</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white card-shadow rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Version</span>
              <span className="font-medium">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="font-medium">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database Status</span>
              <span className="font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="font-medium">89</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => alert('Export Data feature - Coming soon!')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="fa-solid fa-download mr-2"></i>
            Export Data
          </button>

          <button
            onClick={() => alert('System Backup feature - Coming soon!')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <i className="fa-solid fa-shield-alt mr-2"></i>
            Create Backup
          </button>

          <button
            onClick={() => alert('Clear Cache feature - Coming soon!')}
            className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
          >
            <i className="fa-solid fa-broom mr-2"></i>
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'users') {
    return renderUserManagement();
  }

  if (currentView === 'analytics') {
    return renderAnalytics();
  }

  if (currentView === 'rewards') {
    return renderRewardsManagement();
  }

  if (currentView === 'settings') {
    return renderSettings();
  }

  // Default dashboard view
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-wallet text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">D-Wallet Admin</h1>
              <p className="text-sm text-white/80">Digital Wallet Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-bell text-sm"></i>
            </div>
            <img
              src={user?.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg"}
              className="w-8 h-8 rounded-full border-2 border-white/30"
              alt="Profile"
            />
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-white/80 mb-1">Total Users</p>
              <div className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-users text-white text-sm"></i>
                <span className="text-xl font-bold">{analytics?.totalUsers || 247}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/80 mb-1">Active Today</p>
              <div className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-chart-line text-green-300 text-sm"></i>
                <span className="text-xl font-bold">{analytics?.activeUsersToday || 89}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            onClick={handleAddUser}
          >
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-user-plus text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Add User</h3>
            <p className="text-xs text-gray-500">New employee</p>
          </button>

          <button
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            onClick={handleManageRewards}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-gift text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Rewards</h3>
            <p className="text-xs text-gray-500">Manage catalog</p>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            onClick={handleViewAnalytics}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-chart-pie text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Analytics</h3>
            <p className="text-xs text-gray-500">View reports</p>
          </button>

          <button
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            onClick={handleSystemSettings}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-cog text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Settings</h3>
            <p className="text-xs text-gray-500">System config</p>
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Analytics Overview</h2>
          <select className="text-primary-600 text-sm font-medium bg-transparent border-none outline-none">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white card-shadow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-coins text-green-600 text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Coins Given</p>
                <p className="text-lg font-bold text-gray-800">{analytics?.totalCoinsGivenThisMonth?.toLocaleString() || '1,847'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white card-shadow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-trophy text-purple-600 text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rewards Claimed</p>
                <p className="text-lg font-bold text-gray-800">{analytics?.totalRewardsRedeemedThisMonth || '156'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admin Activities */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
          <button className="text-primary-600 text-sm font-medium">View All</button>
        </div>

        <div className="space-y-3">
          <div className="bg-white card-shadow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-user-plus text-blue-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">New user added</p>
                <p className="text-xs text-gray-500">Jessica Martinez joined</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">1h ago</p>
              </div>
            </div>
          </div>

          <div className="bg-white card-shadow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-gift text-orange-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Reward redeemed</p>
                <p className="text-xs text-gray-500">Coffee voucher by Alex</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">3h ago</p>
              </div>
            </div>
          </div>

          <div className="bg-white card-shadow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-cog text-green-600 text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Settings updated</p>
                <p className="text-xs text-gray-500">Monthly coin allocation changed</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">1d ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="px-6 mb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Top Performers</h2>
          <button className="text-primary-600 text-sm font-medium">Full Report</button>
        </div>

        <div className="bg-white card-shadow rounded-2xl p-4">
          <div className="space-y-3">
            {analytics?.topGivers?.slice(0, 3).map((giver, index) => {
              let rankBgColor = 'bg-orange-500';
              if (index === 0) {
                rankBgColor = 'bg-yellow-500';
              } else if (index === 1) {
                rankBgColor = 'bg-gray-400';
              }

              return (
                <div key={giver.user.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${rankBgColor}`}>
                      {index + 1}
                    </span>
                    <img
                      src={giver.user.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"}
                      className="w-8 h-8 rounded-full"
                      alt={giver.user.name}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{giver.user.name}</p>
                    <p className="text-xs text-gray-500">Most coins given: {giver.coinsGiven}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">{giver.coinsGiven}</p>
                    <p className="text-xs text-gray-400">total pts</p>
                  </div>
                </div>
              );
            }) || (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 py-2">
          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'admin' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('admin')}
          >
            <i className="fa-solid fa-chart-line text-lg mb-1"></i>
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'users' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('users')}
          >
            <i className="fa-solid fa-users text-lg mb-1"></i>
            <span className="text-xs font-medium">Users</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'rewards' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('rewards')}
          >
            <i className="fa-solid fa-gift text-lg mb-1"></i>
            <span className="text-xs font-medium">Rewards</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'settings' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('settings')}
          >
            <i className="fa-solid fa-cog text-lg mb-1"></i>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-20 right-6 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-20"
        onClick={() => console.log('Open Quick Admin Actions')}
      >
        <i className="fa-solid fa-plus text-xl"></i>
      </button>
    </div>
  );
};

export default AdminDashboard;
