'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Header } from '@/components/ui/Header';
import { BottomNavigation, NavigationItem } from '@/components/ui/BottomNavigation';
import { 
  userService, 
  coinService 
} from '@/lib/services/mockApiService';
import { User, CoinAllocation, SendCoinsForm } from '@/lib/types';

const GiveCoinsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allocation, setAllocation] = useState<CoinAllocation | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeNav, setActiveNav] = useState('give');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const userResponse = await userService.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setCurrentUser(userResponse.data);
        
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

  const searchEmployee = async () => {
    if (!employeeId.trim()) return;
    
    try {
      setSearching(true);
      const response = await userService.searchUserByEmployeeId(employeeId.trim());
      
      if (response.success && response.data) {
        setSelectedEmployee(response.data);
      } else {
        alert('Employee not found. Please check the Employee ID.');
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      alert('Error searching for employee. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseInt(value);
    if (amount && amount > 0 && amount <= (allocation?.remainingAmount || 0)) {
      setSelectedAmount(amount);
    }
  };

  const handleSendCoins = async () => {
    if (!selectedEmployee || selectedAmount <= 0) return;
    
    try {
      setSending(true);
      
      const form: SendCoinsForm = {
        recipientEmployeeId: selectedEmployee.employeeId,
        amount: selectedAmount,
        message: message.trim(),
        isAnonymous,
      };
      
      const response = await coinService.sendCoins(form);
      
      if (response.success) {
        alert('Coins sent successfully!');
        // Reset form
        setSelectedEmployee(null);
        setEmployeeId('');
        setSelectedAmount(0);
        setCustomAmount('');
        setMessage('');
        setIsAnonymous(false);
        // Reload allocation
        loadUserData();
      } else {
        alert(response.error || 'Failed to send coins. Please try again.');
      }
    } catch (error) {
      console.error('Error sending coins:', error);
      alert('Error sending coins. Please try again.');
    } finally {
      setSending(false);
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

  const isFormValid = selectedEmployee && selectedAmount > 0 && selectedAmount <= (allocation?.remainingAmount || 0);

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
      <Header
        title="Send Coins"
        subtitle="Share appreciation"
        leftIcon={<i className="fa-solid fa-arrow-left text-white text-lg"></i>}
        onLeftIconClick={() => window.history.back()}
        variant="gradient"
      />

      {/* Available Coins */}
      <div className="px-6 -mt-8 relative z-10 mb-6">
        <Card variant="glass" padding="lg" className="text-white text-center">
          <p className="text-sm text-white/80 mb-2">Available to Give</p>
          <div className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-coins text-yellow-300 text-xl"></i>
            <span className="text-3xl font-bold">{allocation?.remainingAmount || 0}</span>
            <span className="text-lg text-white/80">coins</span>
          </div>
          <p className="text-xs text-white/60 mt-1">Resets monthly</p>
        </Card>
      </div>

      {/* Send Form */}
      <div className="px-6 mb-24">
        {/* Recipient Selection */}
        <Card className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Recipient</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter employee ID (e.g. EMP001)"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchEmployee()}
                className="flex-1"
              />
              <Button 
                onClick={searchEmployee} 
                loading={searching}
                disabled={!employeeId.trim()}
                size="md"
              >
                <i className="fa-solid fa-search"></i>
              </Button>
            </div>
          </div>
          
          {selectedEmployee && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-primary-200">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback>{selectedEmployee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{selectedEmployee.name}</h4>
                  <p className="text-sm text-gray-500">{selectedEmployee.department}</p>
                  <p className="text-xs text-gray-400">{selectedEmployee.employeeId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setEmployeeId('');
                  }}
                >
                  <i className="fa-solid fa-times"></i>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Coin Amount */}
        <Card className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Coin Amount</h3>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[1, 5, 10, 15].map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'primary' : 'secondary'}
                size="md"
                onClick={() => handleAmountSelect(amount)}
                disabled={amount > (allocation?.remainingAmount || 0)}
              >
                {amount}
              </Button>
            ))}
          </div>
          
          <Input
            type="number"
            placeholder="Enter custom amount"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            min="1"
            max={allocation?.remainingAmount || 0}
            className="mb-4"
          />
          
          {selectedAmount > 0 && (
            <div className="p-3 bg-primary-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">Sending</p>
              <p className="text-2xl font-bold text-primary-600">{selectedAmount} coins</p>
            </div>
          )}
        </Card>

        {/* Appreciation Message */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appreciation Message</h3>
          <p className="text-sm text-gray-500 mb-3">Add a personal note (optional)</p>
          
          <textarea
            rows={4}
            placeholder="Write your appreciation message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{message.length}/200 characters</span>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Anonymous</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Send Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSendCoins}
          disabled={!isFormValid}
          loading={sending}
        >
          <i className="fa-solid fa-paper-plane mr-2"></i>
          Send Coins
        </Button>
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

export default GiveCoinsPage;
