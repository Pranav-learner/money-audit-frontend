// Mock data for development without backend

export const mockUser = {
  id: 1,
  name: 'Pranav Sharma',
  email: 'pranav@example.com',
  phone: '+91 9876543210',
};

export const mockCategories = [
  { id: 1, name: 'Food & Dining', icon: '🍕' },
  { id: 2, name: 'Transport', icon: '🚗' },
  { id: 3, name: 'Shopping', icon: '🛍️' },
  { id: 4, name: 'Entertainment', icon: '🎬' },
  { id: 5, name: 'Bills & Utilities', icon: '💡' },
  { id: 6, name: 'Health', icon: '💊' },
  { id: 7, name: 'Education', icon: '📚' },
  { id: 8, name: 'Travel', icon: '✈️' },
  { id: 9, name: 'Groceries', icon: '🛒' },
  { id: 10, name: 'Rent', icon: '🏠' },
];

export const mockExpenses = [
  { id: 1, amount: 450, categoryId: 1, category: 'Food & Dining', date: '2026-04-28', description: 'Dinner at restaurant' },
  { id: 2, amount: 1200, categoryId: 2, category: 'Transport', date: '2026-04-27', description: 'Uber rides' },
  { id: 3, amount: 3500, categoryId: 3, category: 'Shopping', date: '2026-04-26', description: 'Amazon order' },
  { id: 4, amount: 299, categoryId: 4, category: 'Entertainment', date: '2026-04-25', description: 'Netflix subscription' },
  { id: 5, amount: 2100, categoryId: 5, category: 'Bills & Utilities', date: '2026-04-24', description: 'Electricity bill' },
  { id: 6, amount: 850, categoryId: 1, category: 'Food & Dining', date: '2026-04-23', description: 'Zomato orders' },
  { id: 7, amount: 5000, categoryId: 10, category: 'Rent', date: '2026-04-22', description: 'Monthly rent share' },
  { id: 8, amount: 750, categoryId: 9, category: 'Groceries', date: '2026-04-21', description: 'BigBasket delivery' },
  { id: 9, amount: 400, categoryId: 6, category: 'Health', date: '2026-04-20', description: 'Pharmacy' },
  { id: 10, amount: 1500, categoryId: 7, category: 'Education', date: '2026-04-19', description: 'Course subscription' },
];

export const mockSavings = [
  { id: 1, amount: 5000, date: '2026-04-01', description: 'Emergency fund' },
  { id: 2, amount: 3000, date: '2026-04-10', description: 'Vacation fund' },
  { id: 3, amount: 2000, date: '2026-04-15', description: 'Investment deposit' },
  { id: 4, amount: 1500, date: '2026-04-20', description: 'Tech gadget fund' },
];

export const mockDashboard = {
  totalBalance: 185420,
  totalSavings: 42500,
  totalExpenses: 16049,
  monthlyBudget: 25000,
  budgetUsed: 16049,
};

export const mockSpendingTrend = [
  { month: 'Jan', amount: 12400 },
  { month: 'Feb', amount: 15800 },
  { month: 'Mar', amount: 11200 },
  { month: 'Apr', amount: 16049 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 0 },
  { month: 'Aug', amount: 0 },
  { month: 'Sep', amount: 0 },
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },
  { month: 'Dec', amount: 0 },
];

export const mockCategoryDistribution = [
  { name: 'Food & Dining', value: 4200, color: '#2dd4a8' },
  { name: 'Transport', value: 2800, color: '#6366f1' },
  { name: 'Shopping', value: 3500, color: '#f59e0b' },
  { name: 'Entertainment', value: 1200, color: '#ef4444' },
  { name: 'Bills & Utilities', value: 2100, color: '#22c55e' },
  { name: 'Rent', value: 5000, color: '#8b5cf6' },
  { name: 'Groceries', value: 1800, color: '#ec4899' },
  { name: 'Others', value: 1449, color: '#94a3b8' },
];

export const mockExpenseTrend = [
  { date: '1 Apr', amount: 850 },
  { date: '5 Apr', amount: 2100 },
  { date: '8 Apr', amount: 1200 },
  { date: '12 Apr', amount: 3500 },
  { date: '15 Apr', amount: 4200 },
  { date: '18 Apr', amount: 5800 },
  { date: '20 Apr', amount: 7300 },
  { date: '22 Apr', amount: 9500 },
  { date: '25 Apr', amount: 12800 },
  { date: '28 Apr', amount: 16049 },
];

export const mockFriends = [
  { id: 1, name: 'Aarav Patel', phone: '+91 9876543211', email: 'aarav@example.com' },
  { id: 2, name: 'Diya Sharma', phone: '+91 9876543212', email: 'diya@example.com' },
  { id: 3, name: 'Rohan Gupta', phone: '+91 9876543213', email: 'rohan@example.com' },
  { id: 4, name: 'Ananya Singh', phone: '+91 9876543214', email: 'ananya@example.com' },
  { id: 5, name: 'Vikram Reddy', phone: '+91 9876543215', email: 'vikram@example.com' },
];

export const mockFriendRequests = [
  { id: 1, senderName: 'Neha Kumar', senderPhone: '+91 9876543216', status: 'PENDING' },
  { id: 2, senderName: 'Arjun Nair', senderPhone: '+91 9876543217', status: 'PENDING' },
];

export const mockGroups = [
  {
    id: 1,
    name: 'Flat Expenses',
    members: ['Pranav', 'Aarav', 'Rohan'],
    totalExpenses: 24500,
    createdAt: '2026-03-01',
  },
  {
    id: 2,
    name: 'Goa Trip',
    members: ['Pranav', 'Diya', 'Ananya', 'Vikram'],
    totalExpenses: 45000,
    createdAt: '2026-04-10',
  },
  {
    id: 3,
    name: 'Office Lunch Group',
    members: ['Pranav', 'Aarav', 'Diya'],
    totalExpenses: 8700,
    createdAt: '2026-02-15',
  },
];

export const mockGroupExpenses = [
  { id: 1, description: 'Electricity bill', amount: 3200, paidBy: 'Pranav', splitWith: ['Aarav', 'Rohan'], date: '2026-04-25' },
  { id: 2, description: 'WiFi bill', amount: 1500, paidBy: 'Aarav', splitWith: ['Pranav', 'Rohan'], date: '2026-04-20' },
  { id: 3, description: 'Groceries', amount: 2800, paidBy: 'Rohan', splitWith: ['Pranav', 'Aarav'], date: '2026-04-18' },
];

export const mockGroupBalances = [
  { userId: 1, userName: 'Pranav', balance: 1200 },
  { userId: 2, userName: 'Aarav', balance: -500 },
  { userId: 3, userName: 'Rohan', balance: -700 },
];

export const mockDirectExpenses = [
  { id: 1, amount: 500, description: 'Coffee', paidBy: 'Pranav', owedBy: 'Aarav Patel', date: '2026-04-27' },
  { id: 2, amount: 1200, description: 'Movie tickets', paidBy: 'Aarav Patel', owedBy: 'Pranav', date: '2026-04-25' },
  { id: 3, amount: 800, description: 'Lunch', paidBy: 'Pranav', owedBy: 'Aarav Patel', date: '2026-04-22' },
];

export const mockBudgets = [
  { id: 1, categoryId: 1, categoryName: 'Food & Dining', limit: 5000, spent: 4200 },
  { id: 2, categoryId: 2, categoryName: 'Transport', limit: 3000, spent: 2800 },
  { id: 3, categoryId: 3, categoryName: 'Shopping', limit: 4000, spent: 3500 },
  { id: 4, categoryId: 4, categoryName: 'Entertainment', limit: 2000, spent: 1200 },
  { id: 5, categoryId: 10, categoryName: 'Rent', limit: 6000, spent: 5000 },
];

export const mockSavingsTrend = [
  { month: 'Jan', amount: 8000 },
  { month: 'Feb', amount: 15000 },
  { month: 'Mar', amount: 28000 },
  { month: 'Apr', amount: 42500 },
];

export const mockBudgetUsage = [
  { category: 'Food', budget: 5000, spent: 4200 },
  { category: 'Transport', budget: 3000, spent: 2800 },
  { category: 'Shopping', budget: 4000, spent: 3500 },
  { category: 'Fun', budget: 2000, spent: 1200 },
  { category: 'Rent', budget: 6000, spent: 5000 },
];
