import {
  User,
  CoinTransaction,
  UserWallet,
  Reward,
  RewardRedemption,
  AnalyticsData,
  SystemSettings,
  Notification,
  LeaderboardEntry,
  ApiResponse,
  SendCoinsForm,
  RedeemRewardForm,
  CoinAllocation
} from '../types';
import { mockUsers, getCurrentUser, findUserByEmployeeId, findUserById } from '../mock-data/users';
import { getActiveRewards, findRewardById } from '../mock-data/rewards';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (in real app, this would be in a database)
let coinTransactions: CoinTransaction[] = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    amount: 25,
    message: 'Great work on the new feature implementation! Your attention to detail is amazing.',
    isAnonymous: false,
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    senderId: '3',
    receiverId: '1',
    amount: 15,
    message: 'Thank you for always being helpful and supportive!',
    isAnonymous: true,
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    senderId: '1',
    receiverId: '3',
    amount: 10,
    message: 'Thanks for the quick turnaround on the client request!',
    isAnonymous: false,
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
];

let rewardRedemptions: RewardRedemption[] = [
  {
    id: '1',
    userId: '1',
    rewardId: '1',
    pointsSpent: 50,
    status: 'fulfilled',
    redeemedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    fulfilledAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
];

let userWallets: Record<string, UserWallet> = {
  '1': {
    userId: '1',
    totalPoints: 1247,
    thisMonthReceived: 185,
    lifetimeReceived: 3420,
    lastUpdated: new Date().toISOString(),
  },
  '2': {
    userId: '2',
    totalPoints: 890,
    thisMonthReceived: 120,
    lifetimeReceived: 2180,
    lastUpdated: new Date().toISOString(),
  },
  '3': {
    userId: '3',
    totalPoints: 1520,
    thisMonthReceived: 200,
    lifetimeReceived: 1920,
    lastUpdated: new Date().toISOString(),
  },
};

let coinAllocations: Record<string, CoinAllocation> = {
  '1': {
    id: '1',
    userId: '1',
    monthYear: '2024-01',
    allocatedAmount: 20,
    remainingAmount: 15,
    expiresAt: new Date(2024, 1, 1).toISOString(), // End of January
    createdAt: new Date(2024, 0, 1).toISOString(), // Start of January
  },
};

let notifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'coin_received',
    title: 'Coins Received!',
    message: 'You received 25 coins from Sarah Johnson',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: { transactionId: '1', amount: 25, senderId: '2' },
  },
];

let systemSettings: SystemSettings = {
  monthlyCoinsAllocation: 20,
  coinExpirationDays: 30,
  maxCoinsPerTransaction: 50,
  enableAnonymousGiving: true,
  enableContentFiltering: true,
  maintenanceMode: false,
};

// User Service
export const userService = {
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay();
    return { success: true, data: getCurrentUser() };
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    await delay();
    const user = findUserById(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  },

  async searchUserByEmployeeId(employeeId: string): Promise<ApiResponse<User>> {
    await delay();
    const user = findUserByEmployeeId(employeeId);
    if (!user) {
      return { success: false, error: 'Employee not found' };
    }
    return { success: true, data: user };
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    await delay();
    return { success: true, data: mockUsers };
  },
};

// Coin Service
export const coinService = {
  async getUserCoinAllocation(userId: string): Promise<ApiResponse<CoinAllocation>> {
    await delay();
    const allocation = coinAllocations[userId];
    if (!allocation) {
      return { success: false, error: 'No allocation found for this month' };
    }
    return { success: true, data: allocation };
  },

  async sendCoins(form: SendCoinsForm): Promise<ApiResponse<CoinTransaction>> {
    await delay();
    
    // Validate recipient
    const recipient = findUserByEmployeeId(form.recipientEmployeeId);
    if (!recipient) {
      return { success: false, error: 'Recipient not found' };
    }

    // Check sender's allocation
    const currentUser = getCurrentUser();
    const allocation = coinAllocations[currentUser.id];
    if (!allocation || allocation.remainingAmount < form.amount) {
      return { success: false, error: 'Insufficient coins available' };
    }

    // Create transaction
    const transaction: CoinTransaction = {
      id: (coinTransactions.length + 1).toString(),
      senderId: currentUser.id,
      receiverId: recipient.id,
      amount: form.amount,
      message: form.message,
      isAnonymous: form.isAnonymous,
      status: 'completed',
      createdAt: new Date().toISOString(),
      sender: currentUser,
      receiver: recipient,
    };

    // Update allocation
    allocation.remainingAmount -= form.amount;

    // Update recipient wallet
    if (!userWallets[recipient.id]) {
      userWallets[recipient.id] = {
        userId: recipient.id,
        totalPoints: 0,
        thisMonthReceived: 0,
        lifetimeReceived: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    userWallets[recipient.id].totalPoints += form.amount;
    userWallets[recipient.id].thisMonthReceived += form.amount;
    userWallets[recipient.id].lifetimeReceived += form.amount;
    userWallets[recipient.id].lastUpdated = new Date().toISOString();

    // Add transaction
    coinTransactions.unshift(transaction);

    return { success: true, data: transaction };
  },

  async getTransactionHistory(userId: string, page = 1, limit = 10): Promise<ApiResponse<{ transactions: CoinTransaction[], totalCount: number }>> {
    await delay();
    
    const userTransactions = coinTransactions
      .filter(t => t.senderId === userId || t.receiverId === userId)
      .map(t => ({
        ...t,
        sender: findUserById(t.senderId),
        receiver: findUserById(t.receiverId),
      }));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = userTransactions.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        transactions: paginatedTransactions,
        totalCount: userTransactions.length,
      },
    };
  },
};

// Wallet Service
export const walletService = {
  async getUserWallet(userId: string): Promise<ApiResponse<UserWallet>> {
    await delay();
    const wallet = userWallets[userId];
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }
    return { success: true, data: wallet };
  },
};

// Reward Service
export const rewardService = {
  async getAllRewards(): Promise<ApiResponse<Reward[]>> {
    await delay();
    return { success: true, data: getActiveRewards() };
  },

  async getRewardsByCategory(category: string): Promise<ApiResponse<Reward[]>> {
    await delay();
    const rewards = getActiveRewards().filter(r => r.category === category);
    return { success: true, data: rewards };
  },

  async redeemReward(form: RedeemRewardForm): Promise<ApiResponse<RewardRedemption>> {
    await delay();

    const reward = findRewardById(form.rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    if (reward.stockQuantity <= 0) {
      return { success: false, error: 'Reward out of stock' };
    }

    const currentUser = getCurrentUser();
    const wallet = userWallets[currentUser.id];

    if (!wallet || wallet.totalPoints < reward.pointCost) {
      return { success: false, error: 'Insufficient points' };
    }

    // Create redemption
    const redemption: RewardRedemption = {
      id: (rewardRedemptions.length + 1).toString(),
      userId: currentUser.id,
      rewardId: form.rewardId,
      pointsSpent: reward.pointCost,
      status: 'pending',
      redeemedAt: new Date().toISOString(),
      user: currentUser,
      reward: reward,
    };

    // Update wallet
    wallet.totalPoints -= reward.pointCost;
    wallet.lastUpdated = new Date().toISOString();

    // Update reward stock
    reward.stockQuantity -= 1;

    // Add redemption
    rewardRedemptions.unshift(redemption);

    return { success: true, data: redemption };
  },

  async getRedemptionHistory(userId: string): Promise<ApiResponse<RewardRedemption[]>> {
    await delay();
    const userRedemptions = rewardRedemptions
      .filter(r => r.userId === userId)
      .map(r => ({
        ...r,
        user: findUserById(r.userId),
        reward: findRewardById(r.rewardId),
      }));

    return { success: true, data: userRedemptions };
  },
};

// Analytics Service
export const analyticsService = {
  async getAnalyticsData(): Promise<ApiResponse<AnalyticsData>> {
    await delay();

    const analyticsData: AnalyticsData = {
      totalUsers: mockUsers.length,
      activeUsersToday: 89,
      activeUsersThisMonth: 247,
      totalCoinsGiven: coinTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalCoinsGivenThisMonth: 1847,
      totalRewardsRedeemed: rewardRedemptions.length,
      totalRewardsRedeemedThisMonth: 156,
      participationRate: 0.85,
      topGivers: [
        { user: mockUsers[0], coinsGiven: 85 },
        { user: mockUsers[1], coinsGiven: 72 },
        { user: mockUsers[2], coinsGiven: 68 },
      ],
      topReceivers: [
        { user: mockUsers[0], coinsReceived: 92 },
        { user: mockUsers[3], coinsReceived: 88 },
        { user: mockUsers[4], coinsReceived: 76 },
      ],
      coinDistributionTrend: [
        { date: '2024-01-01', coinsGiven: 420 },
        { date: '2024-01-08', coinsGiven: 380 },
        { date: '2024-01-15', coinsGiven: 450 },
        { date: '2024-01-22', coinsGiven: 520 },
      ],
      departmentStats: [
        { department: 'Engineering', userCount: 3, coinsGiven: 245, coinsReceived: 280 },
        { department: 'Marketing', userCount: 1, coinsGiven: 72, coinsReceived: 88 },
        { department: 'Sales', userCount: 1, coinsGiven: 68, coinsReceived: 76 },
        { department: 'HR', userCount: 1, coinsGiven: 45, coinsReceived: 88 },
      ],
    };

    return { success: true, data: analyticsData };
  },

  async getLeaderboard(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay();

    const leaderboard: LeaderboardEntry[] = [
      { rank: 1, user: mockUsers[0], points: 2450, coinsReceived: 92, change: 0 },
      { rank: 2, user: mockUsers[3], points: 2180, coinsReceived: 88, change: 1 },
      { rank: 3, user: mockUsers[4], points: 1920, coinsReceived: 76, change: -1 },
      { rank: 4, user: mockUsers[1], points: 1650, coinsReceived: 65, change: 2 },
      { rank: 5, user: mockUsers[2], points: 1420, coinsReceived: 58, change: -1 },
    ];

    return { success: true, data: leaderboard };
  },
};

// Notification Service
export const notificationService = {
  async getUserNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    await delay();
    const userNotifications = notifications.filter(n => n.userId === userId);
    return { success: true, data: userNotifications };
  },

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    await delay();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      return { success: true, data: true };
    }
    return { success: false, error: 'Notification not found' };
  },
};

// System Settings Service
export const systemService = {
  async getSystemSettings(): Promise<ApiResponse<SystemSettings>> {
    await delay();
    return { success: true, data: systemSettings };
  },

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    await delay();
    systemSettings = { ...systemSettings, ...settings };
    return { success: true, data: systemSettings };
  },
};
