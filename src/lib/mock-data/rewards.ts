import { Reward } from '../types';

export const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Premium Coffee Voucher',
    description: 'Starbucks Gift Card - $25',
    pointCost: 250,
    category: 'Food & Drinks',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/dac1c04eb7-4ad1bc137dcbd805673b.png',
    stockQuantity: 50,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    name: 'Amazon Gift Card',
    description: '$50 Value',
    pointCost: 500,
    category: 'Shopping',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/87447114fa-de9055d7583ddae9172c.png',
    stockQuantity: 25,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    description: 'Sony WH-1000XM4',
    pointCost: 1200,
    category: 'Electronics',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/714d0225c5-7d86621c2e495b7a5030.png',
    stockQuantity: 2,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    name: 'Spa Day Voucher',
    description: 'Full Day Experience',
    pointCost: 800,
    category: 'Experiences',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2795d48735-cd65243e9346e1e9545f.png',
    stockQuantity: 10,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    name: 'Movie Tickets',
    description: '2 Premium Seats',
    pointCost: 150,
    category: 'Entertainment',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/a8c1ded44f-bc0481228241612a8295.png',
    stockQuantity: 20,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '6',
    name: 'Gym Membership',
    description: '1 Month Pass',
    pointCost: 600,
    category: 'Health & Fitness',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/98e8c6d1f4-5cc55a2352b62a509606.png',
    stockQuantity: 15,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '7',
    name: 'Dinner Voucher',
    description: '2-Person Meal',
    pointCost: 400,
    category: 'Food & Drinks',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e9ab44aae3-c05df6351679bfc7ebfc.png',
    stockQuantity: 0,
    isActive: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '8',
    name: 'Lunch Voucher',
    description: 'Local Restaurant - $15',
    pointCost: 100,
    category: 'Food & Drinks',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/dac1c04eb7-4ad1bc137dcbd805673b.png',
    stockQuantity: 100,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '9',
    name: 'Bluetooth Speaker',
    description: 'JBL Charge 5',
    pointCost: 700,
    category: 'Electronics',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/714d0225c5-7d86621c2e495b7a5030.png',
    stockQuantity: 5,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '10',
    name: 'Team Building Activity',
    description: 'Escape Room for 4 people',
    pointCost: 300,
    category: 'Experiences',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2795d48735-cd65243e9346e1e9545f.png',
    stockQuantity: 8,
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

export const getRewardCategories = (): string[] => {
  return Array.from(new Set(mockRewards.map(reward => reward.category)));
};

export const getActiveRewards = (): Reward[] => {
  return mockRewards.filter(reward => reward.isActive);
};

export const getRewardsByCategory = (category: string): Reward[] => {
  return mockRewards.filter(reward => reward.category === category && reward.isActive);
};

export const getFeaturedRewards = (): Reward[] => {
  // Return first 3 active rewards as featured
  return getActiveRewards().slice(0, 3);
};

export const findRewardById = (id: string): Reward | undefined => {
  return mockRewards.find(reward => reward.id === id);
};
