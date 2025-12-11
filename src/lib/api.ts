export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  buyPrice: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Stat {
  label: string;
  value: string;
  trend?: string;
  positive?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  customer: string;
  items: number;
  total: number;
  profit: number;
  paymentMethod: string;
}

export interface PartnerSplit {
  name: string;
  percentage: number;
  amount: number;
}

export interface Reminder {
  id: string;
  clientName: string;
  clientPhone: string;
  product: string;
  saleDate: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'snoozed';
}

// Products that trigger follow-up reminders
export const FOLLOWUP_PRODUCTS = [
  { keyword: 'oil', days: 60, message: 'Mobil Change Reminder' },
  { keyword: 'filter', days: 90, message: 'Filter Check Reminder' },
  { keyword: 'brake', days: 180, message: 'Brake Service Reminder' },
  { keyword: 'chain', days: 120, message: 'Chain Service Reminder' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Engine Oil (Shell Advance)', category: 'Lubricants', price: 550, buyPrice: 420, stock: 50 },
  { id: '2', name: 'Brake Pad (Yamaha FZ)', category: 'Brakes', price: 350, buyPrice: 200, stock: 20 },
  { id: '3', name: 'Chain Set (Generic)', category: 'Drivetrain', price: 1200, buyPrice: 900, stock: 15 },
  { id: '4', name: 'Air Filter', category: 'Filters', price: 250, buyPrice: 150, stock: 30 },
  { id: '5', name: 'Spark Plug (NGK)', category: 'Ignition', price: 150, buyPrice: 80, stock: 100 },
  { id: '6', name: 'Headlight Bulb (LED)', category: 'Electrical', price: 450, buyPrice: 300, stock: 25 },
  { id: '7', name: 'Side Mirror', category: 'Body', price: 200, buyPrice: 120, stock: 40 },
  { id: '8', name: 'Clutch Cable', category: 'Controls', price: 180, buyPrice: 100, stock: 15 },
  { id: '9', name: 'Car Wash', category: 'Service', price: 150, buyPrice: 20, stock: 999 },
  { id: '10', name: 'Full Service', category: 'Service', price: 800, buyPrice: 200, stock: 999 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN001', date: '2025-12-11', time: '19:15', customer: 'Rahim Ahmed', items: 3, total: 1250, profit: 380, paymentMethod: 'Cash' },
  { id: 'TXN002', date: '2025-12-11', time: '18:42', customer: 'Karim Hossain', items: 2, total: 800, profit: 200, paymentMethod: 'bKash' },
  { id: 'TXN003', date: '2025-12-11', time: '17:30', customer: 'Fahim Islam', items: 5, total: 2150, profit: 650, paymentMethod: 'Cash' },
  { id: 'TXN004', date: '2025-12-11', time: '16:20', customer: 'Tanvir Rahman', items: 1, total: 550, profit: 130, paymentMethod: 'Card' },
  { id: 'TXN005', date: '2025-12-11', time: '15:05', customer: 'Shakib Hasan', items: 4, total: 1800, profit: 520, paymentMethod: 'bKash' },
  { id: 'TXN006', date: '2025-12-10', time: '19:50', customer: 'Mehedi Alam', items: 2, total: 700, profit: 180, paymentMethod: 'Cash' },
  { id: 'TXN007', date: '2025-12-10', time: '18:15', customer: 'Nasir Uddin', items: 3, total: 1100, profit: 320, paymentMethod: 'Cash' },
];

const MOCK_TOP_ITEMS = [
  { name: 'Engine Oil (Shell Advance)', sold: 45, revenue: 24750 },
  { name: 'Full Service', sold: 32, revenue: 25600 },
  { name: 'Brake Pad (Yamaha FZ)', sold: 28, revenue: 9800 },
  { name: 'Car Wash', sold: 25, revenue: 3750 },
  { name: 'Air Filter', sold: 20, revenue: 5000 },
];

export async function getProducts(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_PRODUCTS;
}

export async function processSale(cart: CartItem[]): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Processing sale:', cart);
  return { success: true, message: 'Sale processed successfully!' };
}

export async function getDashboardStats(): Promise<Stat[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { label: "Today's Sales", value: '৳12,450', trend: '+15% vs yesterday', positive: true },
    { label: 'Net Profit', value: '৳4,200', trend: '+8% vs yesterday', positive: true },
    { label: 'Expenses', value: '৳1,500', trend: '-2% vs yesterday', positive: true },
    { label: 'Low Stock Items', value: '3', trend: 'Needs restock', positive: false },
  ];
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TRANSACTIONS;
}

export async function getTopItems(): Promise<{ name: string; sold: number; revenue: number }[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TOP_ITEMS;
}

export async function getPartnerSplits(): Promise<PartnerSplit[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const todayProfit = 4200;
  return [
    { name: 'Partner A (Dhaka)', percentage: 50, amount: todayProfit * 0.5 },
    { name: 'Partner B (Shop)', percentage: 50, amount: todayProfit * 0.5 },
  ];
}

export function calculateMetrics(sales: number, profit: number, expenses: number) {
  return {
    profitMargin: ((profit / sales) * 100).toFixed(1),
    expenseRatio: ((expenses / sales) * 100).toFixed(1),
  };
}
