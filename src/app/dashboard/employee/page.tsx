'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/ui/Header';
import { BottomNavigation, NavigationItem } from '@/components/ui/BottomNavigation';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { 
  userService, 
  walletService, 
  coinService, 
  analyticsService 
} from '@/lib/services/mockApiService';
import { User, UserWallet, CoinAllocation, LeaderboardEntry, CoinTransaction } from '@/lib/types';

const EmployeeDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [allocation, setAllocation] = useState<CoinAllocation | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
        
        // Load wallet data
        const walletResponse = await walletService.getUserWallet(userResponse.data.id);
        if (walletResponse.success && walletResponse.data) {
          setWallet(walletResponse.data);
        }
        
        // Load coin allocation
        const allocationResponse = await coinService.getUserCoinAllocation(userResponse.data.id);
        if (allocationResponse.success && allocationResponse.data) {
          setAllocation(allocationResponse.data);
        }
        
        // Load recent transactions
        const transactionsResponse = await coinService.getTransactionHistory(userResponse.data.id, 1, 3);
        if (transactionsResponse.success && transactionsResponse.data) {
          setRecentTransactions(transactionsResponse.data.transactions);
        }
      }
      
      // Load leaderboard
      const leaderboardResponse = await analyticsService.getLeaderboard();
      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <i className="fa-solid fa-house"></i>,
    },
    {
      id: 'give',
      label: 'Give',
      icon: <i className="fa-solid fa-paper-plane"></i>,
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: <i className="fa-solid fa-gift"></i>,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <i className="fa-solid fa-user"></i>,
    },
  ];

  const handleNavigation = (itemId: string) => {
    setActiveNav(itemId);
    // In a real app, this would handle routing
    console.log(`Navigate to: ${itemId}`);
  };

  const handleGiveCoins = () => {
    // Navigate to give coins page
    console.log('Navigate to Give Coins');
  };

  const handleRewards = () => {
    // Navigate to rewards page
    console.log('Navigate to Rewards');
  };

  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <Header
        title="D-Point"
        subtitle="Recognition Platform"
        leftIcon={<i className="fa-solid fa-coins text-white text-lg"></i>}
        avatarSrc={user?.avatar}
        avatarFallback={user?.name?.charAt(0) || 'U'}
        onAvatarClick={() => console.log('Profile clicked')}
        onNotificationClick={() => console.log('Notifications clicked')}
      />

      {/* Wallet Balance Card */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <Card variant="glass" padding="lg" className="text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white/80 mb-1">Your Balance</p>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-coins text-yellow-300 text-lg"></i>
                <span className="text-2xl font-bold">{wallet?.totalPoints?.toLocaleString() || '0'}</span>
                <span className="text-sm text-white/80">Points</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">This Month</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{allocation?.remainingAmount || 0}</span>
                <span className="text-sm text-white/80">to give</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card hover="lift" className="text-center cursor-pointer" onClick={handleGiveCoins}>
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-paper-plane text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Give Coins</h3>
            <p className="text-xs text-gray-500">Send appreciation</p>
          </Card>
          
          <Card hover="lift" className="text-center cursor-pointer" onClick={handleRewards}>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-gift text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Rewards</h3>
            <p className="text-xs text-gray-500">Redeem points</p>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.receiverId === user?.id 
                    ? 'bg-green-100' 
                    : 'bg-blue-100'
                }`}>
                  <i className={`fa-solid ${
                    transaction.receiverId === user?.id 
                      ? 'fa-plus text-green-600' 
                      : 'fa-minus text-blue-600'
                  } text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {transaction.receiverId === user?.id 
                      ? `Received from ${transaction.isAnonymous ? 'Anonymous' : transaction.sender?.name}`
                      : `Sent to ${transaction.receiver?.name}`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.receiverId === user?.id 
                      ? transaction.sender?.department || 'Unknown'
                      : transaction.receiver?.department || 'Unknown'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    transaction.receiverId === user?.id 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  }`}>
                    {transaction.receiverId === user?.id ? '+' : '-'}{transaction.amount}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="px-6 mb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Top Contributors</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <Card>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.user.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                    entry.rank === 1 ? 'bg-yellow-500' : 
                    entry.rank === 2 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    {entry.rank}
                  </span>
                  <Avatar size="sm">
                    <AvatarImage src={entry.user.avatar} />
                    <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{entry.user.name}</p>
                  <p className="text-xs text-gray-500">{entry.user.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        items={navigationItems}
        activeItem={activeNav}
        onItemClick={handleNavigation}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<i className="fa-solid fa-plus text-xl"></i>}
        onClick={handleGiveCoins}
      />
    </div>
  );
};

export default EmployeeDashboard;
