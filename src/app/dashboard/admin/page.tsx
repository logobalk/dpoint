'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/ui/Header';
import { BottomNavigation, NavigationItem } from '@/components/ui/BottomNavigation';
import { 
  userService, 
  analyticsService,
  systemService 
} from '@/lib/services/mockApiService';
import { User, AnalyticsData, SystemSettings } from '@/lib/types';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
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
      
      // Load system settings
      const settingsResponse = await systemService.getSystemSettings();
      if (settingsResponse.success && settingsResponse.data) {
        setSystemSettings(settingsResponse.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'admin',
      label: 'Admin',
      icon: <i className="fa-solid fa-chart-line"></i>,
    },
    {
      id: 'users',
      label: 'Users',
      icon: <i className="fa-solid fa-users"></i>,
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: <i className="fa-solid fa-gift"></i>,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <i className="fa-solid fa-cog"></i>,
    },
  ];

  const handleNavigation = (itemId: string) => {
    setActiveNav(itemId);
    console.log(`Navigate to: ${itemId}`);
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
      <Header
        title="Admin Dashboard"
        subtitle="System Overview"
        leftIcon={<i className="fa-solid fa-shield-halved text-white text-lg"></i>}
        avatarSrc={user?.avatar}
        avatarFallback={user?.name?.charAt(0) || 'A'}
        onAvatarClick={() => console.log('Profile clicked')}
        onNotificationClick={() => console.log('Notifications clicked')}
      />

      {/* Key Metrics */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card variant="glass" padding="md" className="text-white text-center">
            <i className="fa-solid fa-users text-2xl text-white/80 mb-2"></i>
            <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
            <p className="text-xs text-white/80">Total Users</p>
          </Card>
          
          <Card variant="glass" padding="md" className="text-white text-center">
            <i className="fa-solid fa-coins text-2xl text-yellow-300 mb-2"></i>
            <p className="text-2xl font-bold">{analytics?.totalCoinsGivenThisMonth?.toLocaleString() || 0}</p>
            <p className="text-xs text-white/80">Coins This Month</p>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <div className="px-6 mb-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">System Status</h2>
            <Badge variant={systemSettings?.maintenanceMode ? 'warning' : 'success'}>
              {systemSettings?.maintenanceMode ? 'Maintenance' : 'Active'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users Today</span>
              <span className="font-semibold">{analytics?.activeUsersToday || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Participation Rate</span>
              <span className="font-semibold">{((analytics?.participationRate || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rewards Redeemed</span>
              <span className="font-semibold">{analytics?.totalRewardsRedeemedThisMonth || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card hover="lift" className="text-center cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-users text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Manage Users</h3>
            <p className="text-xs text-gray-500">Add, edit, or remove users</p>
          </Card>
          
          <Card hover="lift" className="text-center cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-gift text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Manage Rewards</h3>
            <p className="text-xs text-gray-500">Add or update rewards</p>
          </Card>
          
          <Card hover="lift" className="text-center cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-chart-bar text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Analytics</h3>
            <p className="text-xs text-gray-500">View detailed reports</p>
          </Card>
          
          <Card hover="lift" className="text-center cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-cog text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Settings</h3>
            <p className="text-xs text-gray-500">System configuration</p>
          </Card>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Top Contributors</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <Card>
          <div className="space-y-3">
            {analytics?.topGivers?.slice(0, 3).map((giver, index) => (
              <div key={giver.user.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    {index + 1}
                  </span>
                  <Avatar size="sm">
                    <AvatarImage src={giver.user.avatar} />
                    <AvatarFallback>{giver.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{giver.user.name}</p>
                  <p className="text-xs text-gray-500">{giver.user.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">{giver.coinsGiven}</p>
                  <p className="text-xs text-gray-400">given</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Department Overview */}
      <div className="px-6 mb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Department Overview</h2>
          <Button variant="ghost" size="sm">View Details</Button>
        </div>
        
        <div className="space-y-3">
          {analytics?.departmentStats?.map((dept) => (
            <Card key={dept.department}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{dept.department}</h3>
                  <p className="text-sm text-gray-500">{dept.userCount} users</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-blue-600">{dept.coinsGiven}</p>
                      <p className="text-xs text-gray-400">Given</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-600">{dept.coinsReceived}</p>
                      <p className="text-xs text-gray-400">Received</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={navigationItems}
        activeItem={activeNav}
        onItemClick={handleNavigation}
      />
    </div>
  );
};

export default AdminDashboard;
