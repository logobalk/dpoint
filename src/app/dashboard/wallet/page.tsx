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
  walletService, 
  coinService 
} from '@/lib/services/mockApiService';
import { User, UserWallet, CoinTransaction } from '@/lib/types';

const PersonalWalletPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [activeNav, setActiveNav] = useState('profile');

  useEffect(() => {
    loadWalletData();
  }, []);

  useEffect(() => {
    loadTransactions(true);
  }, [filter]);

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

  const loadTransactions = async (reset = false) => {
    if (!user) return;
    
    try {
      if (reset) {
        setCurrentPage(1);
        setTransactions([]);
      }
      
      setLoadingMore(true);
      const page = reset ? 1 : currentPage;
      
      const response = await coinService.getTransactionHistory(user.id, page, 10);
      
      if (response.success && response.data) {
        let filteredTransactions = response.data.transactions;
        
        // Apply filter
        if (filter === 'received') {
          filteredTransactions = filteredTransactions.filter(t => t.receiverId === user.id);
        } else if (filter === 'sent') {
          filteredTransactions = filteredTransactions.filter(t => t.senderId === user.id);
        }
        
        if (reset) {
          setTransactions(filteredTransactions);
        } else {
          setTransactions(prev => [...prev, ...filteredTransactions]);
        }
        
        setHasMore(filteredTransactions.length === 10);
        setCurrentPage(page + 1);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreTransactions = () => {
    if (!loadingMore && hasMore) {
      loadTransactions(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
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
    console.log(`Navigate to: ${itemId}`);
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
      <Header
        title="My Wallet"
        subtitle="Points & Transactions"
        leftIcon={<i className="fa-solid fa-arrow-left text-white text-lg"></i>}
        onLeftIconClick={() => window.history.back()}
        variant="gradient"
      />

      {/* Wallet Summary */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <Card variant="glass" padding="lg" className="text-white">
          <div className="text-center mb-4">
            <p className="text-sm text-white/80 mb-2">Total Balance</p>
            <div className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-coins text-yellow-300 text-2xl"></i>
              <span className="text-4xl font-bold">{wallet?.totalPoints?.toLocaleString() || '0'}</span>
            </div>
            <p className="text-sm text-white/80">Points</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{wallet?.thisMonthReceived?.toLocaleString() || '0'}</p>
              <p className="text-xs text-white/80">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{wallet?.lifetimeReceived?.toLocaleString() || '0'}</p>
              <p className="text-xs text-white/80">Lifetime</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'received', label: 'Received' },
            { key: 'sent', label: 'Sent' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-6 mb-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
          <Badge variant="secondary">{transactions.length} transactions</Badge>
        </div>
        
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const isReceived = transaction.receiverId === user?.id;
            const otherUser = isReceived ? transaction.sender : transaction.receiver;
            
            return (
              <Card key={transaction.id} hover="lift">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isReceived ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <i className={`fa-solid ${
                      isReceived ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-blue-600'
                    } text-lg`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {isReceived ? 'Received' : 'Sent'}
                      </p>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      {otherUser && !transaction.isAnonymous ? (
                        <>
                          <Avatar size="sm">
                            <AvatarImage src={otherUser.avatar} />
                            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium text-gray-700">{otherUser.name}</p>
                            <p className="text-xs text-gray-500">{otherUser.department}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-user-secret text-xs text-gray-600"></i>
                          </div>
                          <p className="text-xs text-gray-500">Anonymous</p>
                        </div>
                      )}
                    </div>
                    
                    {transaction.message && (
                      <p className="text-xs text-gray-600 italic mt-1 line-clamp-2">
                        "{transaction.message}"
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isReceived ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {isReceived ? '+' : '-'}{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-400">coins</p>
                  </div>
                </div>
              </Card>
            );
          })}
          
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={loadMoreTransactions}
                loading={loadingMore}
              >
                Load More
              </Button>
            </div>
          )}
          
          {transactions.length === 0 && !loadingMore && (
            <Card className="text-center py-8">
              <i className="fa-solid fa-receipt text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions</h3>
              <p className="text-sm text-gray-500">
                {filter === 'all' 
                  ? 'No transactions found'
                  : filter === 'received'
                  ? 'No coins received yet'
                  : 'No coins sent yet'
                }
              </p>
            </Card>
          )}
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

export default PersonalWalletPage;
