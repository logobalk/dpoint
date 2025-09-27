'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  userService,
  walletService,
  coinService,
  analyticsService
} from '@/lib/services/mockApiService';
import { User, UserWallet, CoinAllocation, LeaderboardEntry, CoinTransaction } from '@/lib/types';

const EmployeeDashboard: React.FC = () => {
  const router = useRouter();
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



  const handleNavigation = (itemId: string) => {
    setActiveNav(itemId);

    switch (itemId) {
      case 'home':
        router.push('/dashboard/employee');
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

  const handleGiveCoins = () => {
    router.push('/dashboard/give-coins');
  };

  const handleRewards = () => {
    router.push('/dashboard/rewards');
  };

  const handleViewAllTransactions = () => {
    router.push('/dashboard/wallet');
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
      <div className="gradient-bg px-6 pt-12 pb-6 text-white relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-wallet text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">D-Wallet</h1>
              <p className="text-sm text-white/80">Digital Wallet Platform</p>
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

        {/* Wallet Balance */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white/80 mb-1">Your Balance</p>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-wallet text-yellow-300 text-lg"></i>
                <span className="text-2xl font-bold">{wallet?.totalPoints?.toLocaleString() || '1,247'}</span>
                <span className="text-sm text-white/80">Points</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">This Month</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{allocation?.remainingAmount || 15}</span>
                <span className="text-sm text-white/80">to give</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            onClick={handleGiveCoins}
          >
            <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-paper-plane text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Send Currency</h3>
            <p className="text-xs text-gray-500">Digital transfer</p>
          </button>

          <button
            className="bg-white card-shadow rounded-2xl p-4 text-center hover:scale-105 transition-transform"
            onClick={handleRewards}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-gift text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Rewards</h3>
            <p className="text-xs text-gray-500">Redeem points</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
          <button
            className="text-primary-600 text-sm font-medium"
            onClick={handleViewAllTransactions}
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {recentTransactions.length > 0 ? recentTransactions.map((transaction) => {
            const isReceived = transaction.receiverId === user?.id;
            const senderName = transaction.isAnonymous ? 'Anonymous' : transaction.sender?.name;
            const displayText = isReceived
              ? `Received from ${senderName}`
              : `Sent to ${transaction.receiver?.name}`;
            const department = isReceived
              ? transaction.sender?.department || 'Unknown'
              : transaction.receiver?.department || 'Unknown';

            return (
              <div key={transaction.id} className="bg-white card-shadow rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isReceived ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <i className={`fa-solid ${
                      isReceived ? 'fa-plus text-green-600' : 'fa-minus text-blue-600'
                    } text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{displayText}</p>
                    <p className="text-xs text-gray-500">{department}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      isReceived ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {isReceived ? '+' : '-'}{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white card-shadow rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="px-6 mb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Top Contributors</h2>
          <button className="text-primary-600 text-sm font-medium">View All</button>
        </div>

        <div className="bg-white card-shadow rounded-2xl p-4">
          <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.map((entry) => {
              let rankBgColor = 'bg-orange-500';
              if (entry.rank === 1) {
                rankBgColor = 'bg-yellow-500';
              } else if (entry.rank === 2) {
                rankBgColor = 'bg-gray-400';
              }

              return (
                <div key={entry.user.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${rankBgColor}`}>
                      {entry.rank}
                    </span>
                    <img
                      src={entry.user.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"}
                      className="w-8 h-8 rounded-full"
                      alt={entry.user.name}
                    />
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
              );
            }) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No leaderboard data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 py-2">
          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'home' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('home')}
          >
            <i className="fa-solid fa-house text-lg mb-1"></i>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'give' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('give')}
          >
            <i className="fa-solid fa-paper-plane text-lg mb-1"></i>
            <span className="text-xs font-medium">Give</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'rewards' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('rewards')}
          >
            <i className="fa-solid fa-gift text-lg mb-1"></i>
            <span className="text-xs font-medium">Rewards</span>
          </button>

          <button
            className={`flex flex-col items-center py-3 px-2 ${activeNav === 'profile' ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            onClick={() => handleNavigation('profile')}
          >
            <i className="fa-solid fa-user text-lg mb-1"></i>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-20 right-6 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-20"
        onClick={handleGiveCoins}
      >
        <i className="fa-solid fa-plus text-xl"></i>
      </button>
    </div>
  );
};

export default EmployeeDashboard;
