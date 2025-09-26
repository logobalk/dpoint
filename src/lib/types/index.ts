// D-Point Platform Types

export interface User {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  department: string;
  role: 'employee' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoinAllocation {
  id: string;
  userId: string;
  monthYear: string; // Format: "2024-01"
  allocatedAmount: number;
  remainingAmount: number;
  expiresAt: string;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface UserWallet {
  userId: string;
  totalPoints: number;
  thisMonthReceived: number;
  lifetimeReceived: number;
  lastUpdated: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  category: string;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  redeemedAt: string;
  fulfilledAt?: string;
  user?: User;
  reward?: Reward;
}

export interface SystemSettings {
  monthlyCoinsAllocation: number;
  coinExpirationDays: number;
  maxCoinsPerTransaction: number;
  enableAnonymousGiving: boolean;
  enableContentFiltering: boolean;
  maintenanceMode: boolean;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersThisMonth: number;
  totalCoinsGiven: number;
  totalCoinsGivenThisMonth: number;
  totalRewardsRedeemed: number;
  totalRewardsRedeemedThisMonth: number;
  participationRate: number;
  topGivers: Array<{
    user: User;
    coinsGiven: number;
  }>;
  topReceivers: Array<{
    user: User;
    coinsReceived: number;
  }>;
  coinDistributionTrend: Array<{
    date: string;
    coinsGiven: number;
  }>;
  departmentStats: Array<{
    department: string;
    userCount: number;
    coinsGiven: number;
    coinsReceived: number;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'coin_received' | 'reward_redeemed' | 'system_announcement' | 'monthly_allocation';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  points: number;
  coinsGiven?: number;
  coinsReceived?: number;
  change?: number; // Position change from previous period
}

export interface TransactionHistory {
  transactions: CoinTransaction[];
  totalCount: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  department?: string;
  category?: string;
  status?: string;
}

// Form Types
export interface SendCoinsForm {
  recipientEmployeeId: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
}

export interface RedeemRewardForm {
  rewardId: string;
  confirmPoints: number;
}

export interface CreateRewardForm {
  name: string;
  description: string;
  pointCost: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface CreateUserForm {
  employeeId: string;
  email: string;
  name: string;
  department: string;
  role: 'employee' | 'admin';
}

export interface UpdateSystemSettingsForm {
  monthlyCoinsAllocation?: number;
  coinExpirationDays?: number;
  maxCoinsPerTransaction?: number;
  enableAnonymousGiving?: boolean;
  enableContentFiltering?: boolean;
  maintenanceMode?: boolean;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Auth Types
export interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  avatar?: string;
  department: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
