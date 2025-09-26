# D-Point: Peer Recognition Platform - Requirements Document

## 1. Project Overview

**Project Name:** D-Point  
**Type:** Peer-to-Peer Recognition Platform  
**Purpose:** Create a positive corporate culture through employee recognition and reward system

### 1.1 Main Objectives
- Promote mutual appreciation and recognition in the workplace
- Increase employee motivation and organizational engagement
- Provide a tool to measure and celebrate outstanding employee performance through peer recognition

## 2. User Roles & Permissions

### 2.1 Employee (End User)
- **Primary Functions:**
  - Give and receive coins/points
  - Redeem rewards from catalog
  - View personal wallet and transaction history
  - Send appreciation messages with coins

### 2.2 Administrator (Admin)
- **Primary Functions:**
  - System configuration and management
  - View analytics dashboard and reports
  - Manage reward catalog
  - User management (add/remove employees)
  - System settings configuration

## 3. Core System Features

### 3.1 Coin Distribution System

#### 3.1.1 Monthly Coin Allocation
- **Frequency:** Every 1st day of the month
- **Amount:** Limited number of "giving coins" per employee (e.g., 20 coins)
- **Purpose:** Coins for giving to other employees

#### 3.1.2 Coin Expiration Policy
- **Expiration Period:** 30 days from allocation date
- **Reset Policy:** Unused coins reset to 0 at month end
- **Accumulation:** Cannot accumulate unused giving coins across months
- **New Allocation:** Fresh quota provided each month

#### 3.1.3 Coin Giving Features
- **Recipient Selection:** Choose any fellow employee
- **Identity Options:**
  - Anonymous giving (sender identity hidden)
  - Named giving (sender identity revealed)
- **Message Attachment:** Optional short appreciation message
- **Content Filtering:** AI-powered profanity detection and blocking system

### 3.2 Wallet & Point System

#### 3.2.1 Personal Wallet
- **Function:** Store received coins (converted to "Points")
- **Accumulation:** Points never expire
- **Display Requirements:**
  - Current point balance
  - Transaction history (sender, date, message)
  - Received coin details

#### 3.2.2 Point Accumulation
- **Conversion:** Received coins become permanent Points
- **Usage:** Points used for reward redemption
- **History Tracking:** Complete record of all received points

### 3.3 Reward Redemption System

#### 3.3.1 Reward Catalog
- **Display:** List of available rewards with point costs
- **Management:** Admin-controlled reward inventory
- **Point Requirements:** Each reward has specific point cost

#### 3.3.2 Redemption Process
- **Selection:** Employee chooses desired reward
- **Confirmation:** System confirms sufficient points
- **Automatic Deduction:** Points automatically deducted from wallet
- **Notification System:** Alert admin/relevant department for reward fulfillment

### 3.4 Admin Dashboard

#### 3.4.1 Analytics Dashboard
- **Data Visualization:** Charts and graphs for easy understanding
- **Leaderboard Features:**
  - Top point recipients ranking
  - Filtering options (weekly, monthly, yearly)
- **Statistics Display:**
  - Coin giving/receiving statistics
  - Employee participation rates
  - Engagement metrics

#### 3.4.2 System Configuration
- **Coin Allocation Settings:**
  - Adjust monthly coin allocation per employee
  - Configure coin types (future expansion capability)
- **Feature Management:**
  - Enable/disable coin categories
  - System-wide settings control

#### 3.4.3 Reward Management
- **Catalog Control:**
  - Add new rewards
  - Remove existing rewards
  - Edit reward details and point costs
- **Inventory Management:** Track reward availability

#### 3.4.4 User Management
- **Employee Database:**
  - Add new employees to system
  - Remove employees from system
  - Manage employee profiles

## 4. Technical Requirements

### 4.1 User Interface
- Modern, responsive design
- Gradient background colors
- Consistent design tokens across all pages
- Mobile-friendly interface

### 4.2 System Architecture
- Well-structured, maintainable code
- Following best practices
- Scalable architecture
- Secure data handling

### 4.3 Content Filtering
- AI-powered profanity detection
- Real-time message filtering
- Maintain positive workplace environment

## 5. Business Rules

### 5.1 Coin Management
- Monthly allocation cannot be carried over
- Received points never expire
- Anonymous giving option available
- Message attachment optional but encouraged

### 5.2 Reward System
- Point deduction is immediate upon redemption
- Admin notification required for physical reward fulfillment
- Catalog managed exclusively by administrators

### 5.3 User Access
- All employees have equal giving/receiving capabilities
- Admin functions restricted to authorized personnel
- System maintains complete transaction history

## 6. Success Metrics
- Employee participation rate in giving/receiving coins
- Frequency of reward redemptions
- User engagement with appreciation messages
- Overall employee satisfaction with recognition system
