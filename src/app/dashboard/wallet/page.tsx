'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  userService,
  walletService
} from '@/lib/services/mockApiService';
import { User, UserWallet } from '@/lib/types';

const PersonalWalletPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received' | 'redeemed'>('all');
  const [activeNav] = useState('profile');

  useEffect(() => {
    loadWalletData();
  }, []);



  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
        
        const walletResponse = await walletService.getUserWallet(userResponse.data.id);
        if (walletResponse.success && walletResponse.data) {
          setWallet(walletResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
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
              <h1 className="text-xl font-bold">D-Wallet</h1>
              <p className="text-sm text-white/80">Digital Currency & History</p>
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

        {/* Current Balance Card */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="fa-solid fa-coins text-yellow-300 text-2xl"></i>
              <span className="text-3xl font-bold">{wallet?.totalPoints?.toLocaleString() || '1,247'}</span>
            </div>
            <p className="text-white/80 text-sm mb-3">Total Points Available</p>
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <p className="text-white/60">This Month</p>
                <p className="font-semibold">+{wallet?.thisMonthReceived?.toLocaleString() || '185'}</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-white/60">Lifetime</p>
                <p className="font-semibold">{wallet?.lifetimeReceived?.toLocaleString() || '3,420'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 -mt-4 relative z-10 mb-6">
        <div className="bg-white card-shadow rounded-2xl p-2">
          <div className="flex">
            {[
              { key: 'all', label: 'All' },
              { key: 'received', label: 'Received' },
              { key: 'redeemed', label: 'Redeemed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-all ${
                  filter === tab.key
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-6 mb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <i className="fa-solid fa-filter"></i>
            <span>Filter</span>
          </div>
        </div>

        {/* Today Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-600">Today</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="space-y-3">
            <div className="bg-white card-shadow rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-plus text-green-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Received from Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Engineering Team</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+25</p>
                      <p className="text-xs text-gray-400">2:30 PM</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">"Great work on the new feature implementation! Your attention to detail is amazing."</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white card-shadow rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-plus text-green-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Anonymous Recognition</p>
                      <p className="text-xs text-gray-500">From colleague</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+15</p>
                      <p className="text-xs text-gray-400">11:45 AM</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">"Thank you for always being helpful and supportive!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yesterday Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-600">Yesterday</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="space-y-3">
            <div className="bg-white card-shadow rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-gift text-purple-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Reward Redeemed</p>
                      <p className="text-xs text-gray-500">Coffee Voucher - $10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-purple-600">-50</p>
                      <p className="text-xs text-gray-400">3:15 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Fulfilled</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white card-shadow rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-plus text-green-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Received from Mike Chen</p>
                      <p className="text-xs text-gray-500">Marketing Team</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+30</p>
                      <p className="text-xs text-gray-400">10:20 AM</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">"Excellent presentation at the team meeting. Your insights were valuable!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            onClick={() => router.push('/dashboard/give-coins')}
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
            onClick={() => {}}
          >
            <i className="fa-solid fa-user text-lg mb-1"></i>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalWalletPage;
