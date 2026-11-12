export type OrderStatus = 'SCHEDULED' | 'QUEUED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export type UserRole = 'CUSTOMER' | 'KITCHEN_ADMIN' | 'SUPER_ADMIN';

export type PaymentMethod = 'ONLINE_UPI' | 'CASH_ON_PICKUP' | 'CAMPUS_CARD' | 'FREE_VOUCHER';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  rollNumber?: string;
  phone?: string;
  dietaryPreference?: 'Veg' | 'Non-Veg' | 'Jain';
}

export interface FestivalVoucher {
  id: string;
  code: string;
  title: string;
  festivalName: string;
  amount: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Snacks' | 'South Indian' | 'Meals' | 'Beverages';
  price: number;
  prepTimeMinutes: number;
  available: boolean;
  modifiers: string[];
  images: string[]; // Max 3 images; images[0] is Cover Image
  description: string;
  ingredients: string[];
  calories: number;
  rating: number;
  reviewsCount: number;
  isVeg: boolean;
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  isImmediate?: boolean;
  currentCapacity: number;
  maxLimit: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customization: string;
}

export interface Order {
  id: string;
  tokenNumber: number;
  customerId?: string;
  customerName: string;
  rollNumber: string;
  slotId: string;
  slotLabel: string;
  items: OrderItem[];
  subtotal: number;
  bundleDiscount: number;
  voucherCode?: string;
  voucherDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}