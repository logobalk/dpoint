# D-Wallet Demo Navigation Guide

## 🚀 **Getting Started**

### **Demo Credentials**
- **Admin User**: `admin@dwallet.demo` / `Admin123!`
- **Employee User**: `employee@dwallet.demo` / `Employee123!`

### **Starting the Demo**
1. Run `npm run dev` to start the development server
2. Navigate to `http://localhost:3000`
3. Use the demo credentials to log in

---

## 🧭 **Navigation Flow**

### **1. Login Process**
- **URL**: `/login`
- **Actions**: 
  - Enter email and password
  - Click "Sign In" button
  - Automatically redirects based on user role:
    - Admin → `/dashboard/admin`
    - Employee → `/dashboard/employee`

### **2. Employee Dashboard**
- **URL**: `/dashboard/employee`
- **Key Features**:
  - View personal stats and recent transactions
  - Quick actions: Send Currency, Rewards
  - Leaderboard display
  - Bottom navigation bar

#### **Navigation Options**:
- **Send Currency Button** → `/dashboard/give-coins`
- **Rewards Button** → `/dashboard/rewards`
- **View All (Transactions)** → `/dashboard/wallet`
- **Bottom Nav - Home** → `/dashboard/employee`
- **Bottom Nav - Give** → `/dashboard/give-coins`
- **Bottom Nav - Rewards** → `/dashboard/rewards`
- **Bottom Nav - Profile** → `/dashboard/wallet`
- **Floating Action Button (+)** → `/dashboard/give-coins`

### **3. Admin Dashboard**
- **URL**: `/dashboard/admin`
- **Key Features**:
  - System analytics and metrics
  - Admin quick actions
  - Top givers leaderboard
  - Bottom navigation bar

#### **Navigation Options**:
- **Add User Button** → Shows demo alert (feature coming soon)
- **Rewards Button** → `/dashboard/rewards`
- **Analytics Button** → Shows demo alert (feature coming soon)
- **Settings Button** → Shows demo alert (feature coming soon)
- **Bottom Nav - Home** → `/dashboard/admin`
- **Bottom Nav - Give** → `/dashboard/give-coins`
- **Bottom Nav - Rewards** → `/dashboard/rewards`
- **Bottom Nav - Profile** → `/dashboard/wallet`

### **4. Send Currency Page**
- **URL**: `/dashboard/give-coins`
- **Key Features**:
  - Employee search functionality
  - Amount selection (5, 10, 15, 25 points)
  - Message input
  - Anonymous sending option

#### **Navigation Options**:
- **Back Button** → Returns to previous page
- **Send Currency Button** → Processes transaction and shows success
- **Bottom Nav** → Navigate to other sections

### **5. Personal Wallet**
- **URL**: `/dashboard/wallet`
- **Key Features**:
  - Balance overview (total, monthly, lifetime)
  - Transaction history with filters
  - Grouped by date (Today, Yesterday)

#### **Navigation Options**:
- **Back Button** → Returns to previous page
- **Filter Tabs** → All, Received, Redeemed
- **Bottom Nav** → Navigate to other sections

### **6. Rewards Catalog**
- **URL**: `/dashboard/rewards`
- **Key Features**:
  - Browse available rewards
  - Category filtering
  - Redeem rewards with points
  - Stock availability

#### **Navigation Options**:
- **Category Filters** → Filter rewards by type
- **Redeem Button** → Process reward redemption
- **Bottom Nav** → Navigate to other sections

---

## 🎯 **Demo Scenarios**

### **Scenario 1: Employee Sending Currency**
1. Login as employee (`employee@dwallet.demo` / `Employee123!`)
2. Click "Send Currency" button or FAB (+)
3. Search for employee ID (try: `EMP001`, `EMP002`, `EMP003`)
4. Select amount (5, 10, 15, or 25 points)
5. Add appreciation message
6. Toggle anonymous if desired
7. Click "Send Currency"
8. View success confirmation

### **Scenario 2: Admin Overview**
1. Login as admin (`admin@dwallet.demo` / `Admin123!`)
2. View system analytics dashboard
3. Check top givers leaderboard
4. Click "Rewards" to manage reward catalog
5. Try other admin actions (shows demo alerts)

### **Scenario 3: Wallet Management**
1. From any dashboard, click profile icon or "View All"
2. Navigate to wallet page
3. View balance and transaction history
4. Use filter tabs to see different transaction types
5. Scroll through grouped transactions

### **Scenario 4: Rewards Browsing**
1. Navigate to rewards page
2. Browse different categories (All, Gift Cards, Electronics, etc.)
3. Check reward details and point requirements
4. Try redeeming a reward (if sufficient points)

---

## 🔧 **Technical Features Demonstrated**

### **Authentication**
- JWT-based login system
- Role-based access control
- Session management
- Secure password handling

### **Navigation**
- Next.js App Router
- Programmatic navigation
- Back button functionality
- Bottom navigation consistency

### **State Management**
- React Context for auth
- Local state for components
- Form state management
- Loading states

### **UI/UX**
- Responsive design
- Gradient backgrounds
- Card-based layouts
- Interactive animations
- FontAwesome icons

### **Mock API Integration**
- Simulated backend services
- Realistic API delays
- Error handling
- Data persistence (session-based)

---

## 🐛 **Troubleshooting**

### **Common Issues**
- **401 Error**: Check demo credentials are correct
- **Navigation Not Working**: Ensure JavaScript is enabled
- **Missing Data**: Refresh page to reload mock data
- **Styling Issues**: Check if Tailwind CSS is loaded

### **Demo Limitations**
- Data resets on page refresh
- Some admin features show alerts (coming soon)
- No real backend integration
- Limited to demo user accounts

---

## 📱 **Mobile Experience**

The application is designed mobile-first:
- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Bottom Navigation**: Easy thumb navigation
- **Swipe Gestures**: Natural mobile interactions

Test on different devices or use browser dev tools to simulate mobile experience.
