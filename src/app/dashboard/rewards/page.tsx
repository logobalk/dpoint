'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Header } from '@/components/ui/Header';
import { BottomNavigation, NavigationItem } from '@/components/ui/BottomNavigation';
import {
  userService,
  walletService,
  rewardService
} from '@/lib/services/mockApiService';
import { User, UserWallet, Reward, RedeemRewardForm } from '@/lib/types';
import { getRewardCategories } from '@/lib/mock-data/rewards';

const RewardsPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('rewards');

  useEffect(() => {
    loadRewardsData();
  }, []);

  useEffect(() => {
    filterRewards();
  }, [selectedCategory, rewards]);

  const loadRewardsData = async () => {
    try {
      setLoading(true);

      // Load user and wallet data
      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);

        const walletResponse = await walletService.getUserWallet(userResponse.data.id);
        if (walletResponse.success && walletResponse.data) {
          setWallet(walletResponse.data);
        }
      }

      // Load rewards
      const rewardsResponse = await rewardService.getAllRewards();
      if (rewardsResponse.success && rewardsResponse.data) {
        setRewards(rewardsResponse.data);
      }

      // Load categories
      const allCategories = ['All', ...getRewardCategories()];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRewards = () => {
    if (selectedCategory === 'All') {
      setFilteredRewards(rewards);
    } else {
      setFilteredRewards(rewards.filter(reward => reward.category === selectedCategory));
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!wallet || wallet.totalPoints < reward.pointCost) {
      alert('Insufficient points to redeem this reward.');
      return;
    }

    if (reward.stockQuantity <= 0) {
      alert('This reward is currently out of stock.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to redeem "${reward.name}" for ${reward.pointCost} points?`
    );

    if (!confirmed) return;

    try {
      setRedeeming(reward.id);

      const form: RedeemRewardForm = {
        rewardId: reward.id,
        confirmPoints: reward.pointCost,
      };

      const response = await rewardService.redeemReward(form);

      if (response.success) {
        alert('Reward redeemed successfully! You will receive it shortly.');
        // Reload data to update wallet balance and stock
        loadRewardsData();
      } else {
        alert(response.error || 'Failed to redeem reward. Please try again.');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Error redeeming reward. Please try again.');
    } finally {
      setRedeeming(null);
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

  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="gradient-bg  text-white relative">
        <Header
          title="Rewards"
          subtitle="Redeem your wallet points"
          leftIcon={<i className="fa-solid fa-arrow-left text-white text-lg"></i>}
          onLeftIconClick={() => window.history.back()}
          variant="gradient"
        />

        {/* Points Balance */}
        <div className="px-6 -mt-8 relative z-10 mb-6 pb-4">
          <Card variant="glass" padding="lg" className="text-white text-center">
            <p className="text-sm text-white/80 mb-2">Available Points</p>
            <div className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-coins text-yellow-300 text-xl"></i>
              <span className="text-3xl font-bold">{wallet?.totalPoints?.toLocaleString() || '0'}</span>
            </div>
            <p className="text-xs text-white/60 mt-1">Ready to redeem</p>
          </Card>
        </div>
      </div>




      {/* Category Filter */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="px-6 mb-24">
        <div className="grid gap-4">
          {filteredRewards.map((reward) => {
            const canAfford = wallet && wallet.totalPoints >= reward.pointCost;
            const inStock = reward.stockQuantity > 0;
            const canRedeem = canAfford && inStock;

            return (
              <Card key={reward.id} hover="lift">
                <div className="flex gap-4">
                  {/* Reward Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <i className="fa-solid fa-gift text-2xl text-gray-400"></i>
                    )}
                  </div>

                  {/* Reward Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {reward.name}
                      </h3>
                      <Badge
                        variant={inStock ? 'success' : 'error'}
                        size="sm"
                      >
                        {inStock ? `${reward.stockQuantity} left` : 'Out of stock'}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {reward.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-coins text-yellow-500 text-sm"></i>
                        <span className={`text-sm font-bold ${canAfford ? 'text-primary-600' : 'text-red-500'
                          }`}>
                          {reward.pointCost.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">points</span>
                      </div>

                      <Button
                        size="sm"
                        variant={canRedeem ? 'primary' : 'secondary'}
                        disabled={!canRedeem}
                        loading={redeeming === reward.id}
                        onClick={() => handleRedeemReward(reward)}
                      >
                        {!canAfford ? 'Need more points' :
                          !inStock ? 'Out of stock' :
                            'Redeem'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredRewards.length === 0 && (
            <Card className="text-center py-8">
              <i className="fa-solid fa-gift text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Rewards Available</h3>
              <p className="text-sm text-gray-500">
                {selectedCategory === 'All'
                  ? 'No rewards are currently available'
                  : `No rewards available in ${selectedCategory} category`
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

export default RewardsPage;
