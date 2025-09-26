import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'alex.thompson@company.com',
    name: 'Alex Thompson',
    department: 'Engineering',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'sarah.johnson@company.com',
    name: 'Sarah Johnson',
    department: 'Engineering',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    email: 'mike.chen@company.com',
    name: 'Mike Chen',
    department: 'Marketing',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    email: 'emma.wilson@company.com',
    name: 'Emma Wilson',
    department: 'HR',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    employeeId: 'EMP005',
    email: 'david.lee@company.com',
    name: 'David Lee',
    department: 'Sales',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '6',
    employeeId: 'ADM001',
    email: 'admin@company.com',
    name: 'System Administrator',
    department: 'IT',
    role: 'admin',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '7',
    employeeId: 'EMP006',
    email: 'jessica.martinez@company.com',
    name: 'Jessica Martinez',
    department: 'Design',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '8',
    employeeId: 'EMP007',
    email: 'robert.brown@company.com',
    name: 'Robert Brown',
    department: 'Finance',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-10.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '9',
    employeeId: 'EMP008',
    email: 'lisa.garcia@company.com',
    name: 'Lisa Garcia',
    department: 'Operations',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-11.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '10',
    employeeId: 'EMP009',
    email: 'james.wilson@company.com',
    name: 'James Wilson',
    department: 'Engineering',
    role: 'employee',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-12.jpg',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

export const getCurrentUser = (): User => {
  // For demo purposes, return the first user as current user
  return mockUsers[0];
};

export const getAdminUser = (): User => {
  return mockUsers.find(user => user.role === 'admin') || mockUsers[5];
};

export const findUserByEmployeeId = (employeeId: string): User | undefined => {
  return mockUsers.find(user => user.employeeId === employeeId);
};

export const findUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getDepartments = (): string[] => {
  return Array.from(new Set(mockUsers.map(user => user.department)));
};
