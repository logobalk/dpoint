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
    // For demo, we'll show an alert since we don't have a user management page
    alert('User Management feature - Coming soon in full version!');
  };

  const handleManageRewards = () => {
    router.push('/dashboard/rewards');
  };

  const handleViewAnalytics = () => {
    // For demo, we'll show an alert since we don't have a detailed analytics page
    alert('Detailed Analytics feature - Coming soon in full version!');
  };

  const handleSystemSettings = () => {
    // For demo, we'll show an alert since we don't have a settings page
    alert('System Settings feature - Coming soon in full version!');
  };

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
