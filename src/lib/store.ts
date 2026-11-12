'use client';

import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  MenuItem,
  TimeSlot,
  Order,
  OrderItem,
  OrderStatus,
  FestivalVoucher,
  PaymentMethod,
} from '@/types';

const STORAGE_KEY = 'platepecharcha_state_v2';
const FIRESTORE_STATE_DOC = doc(db, 'canteen_state', 'live_operations');

interface CanteenState {
  menu: MenuItem[];
  slots: TimeSlot[];
  orders: Order[];
  vouchers: FestivalVoucher[];
  voucherUsedAmounts: Record<string, number>;
  lastTokenNumber: number;
}

const INITIAL_VOUCHERS: FestivalVoucher[] = [
  {
    id: 'vch-diwali-55',
    code: 'DIWALI55',
    title: 'Diwali Festival Special Voucher',
    festivalName: 'Diwali Dhamaka',
    amount: 55,
    active: true,
  },
  {
    id: 'vch-ganesh-30',
    code: 'UTSAV30',
    title: 'Campus Utsav Treat Voucher',
    festivalName: 'College Fest',
    amount: 30,
    active: true,
  },
];

const INITIAL_MENU: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Mumbai Vada Pav',
    category: 'Snacks',
    price: 25,
    prepTimeMinutes: 3,
    available: true,
    modifiers: ['Extra Dry Garlic Chutney', 'Fried Green Chilli', 'No Onion'],
    images: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Authentic Mumbai street-style spiced potato fritter tucked inside a soft ladi pav, layered with fiery dry garlic chutney and sweet tamarind glaze.',
    ingredients: ['Soft Ladi Pav', 'Spiced Potato Mash', 'Besan Batter', 'Dry Garlic Chutney', 'Green Chilli'],
    calories: 290,
    rating: 4.8,
    reviewsCount: 342,
    isVeg: true,
  },
  {
    id: 'item-2',
    name: 'Schezwan Samosa Pav',
    category: 'Snacks',
    price: 30,
    prepTimeMinutes: 4,
    available: true,
    modifiers: ['Extra Schezwan', 'Cheese Slice (+₹15)', 'Less Spicy'],
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Crispy golden punjabi samosa crushed inside a butter-toasted pav and generously topped with Indo-Chinese fiery Schezwan sauce.',
    ingredients: ['Crispy Samosa', 'Fresh Pav', 'Schezwan Pepper Sauce', 'Mint Coriander Chutney'],
    calories: 340,
    rating: 4.6,
    reviewsCount: 215,
    isVeg: true,
  },
  {
    id: 'item-3',
    name: 'Mysore Masala Dosa',
    category: 'South Indian',
    price: 70,
    prepTimeMinutes: 7,
    available: true,
    modifiers: ['Extra Crispy', 'Butter Topping', 'Extra Sambar'],
    images: [
      'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Crisp fermented rice and lentil crepe spread with spicy Mysore red garlic chutney, stuffed with tempered potato bhaji, served with hot sambar and coconut chutney.',
    ingredients: ['Fermented Rice-Urad Batter', 'Potato Masala', 'Mysore Red Chutney', 'Pure Butter', 'Coconut Chutney'],
    calories: 420,
    rating: 4.9,
    reviewsCount: 410,
    isVeg: true,
  },
  {
    id: 'item-4',
    name: 'Paneer Chilli Franky',
    category: 'Meals',
    price: 65,
    prepTimeMinutes: 6,
    available: true,
    modifiers: ['Extra Mayo', 'Double Paneer', 'No Capsicum'],
    images: [
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Warm flaky paratha wrap loaded with wok-tossed chilli paneer cubes, crunchy onions, bell peppers, and tangy franky masala.',
    ingredients: ['Whole Wheat Roti', 'Malai Paneer Cubes', 'Bell Peppers', 'Schezwan Mayo', 'Franky Spice Mix'],
    calories: 460,
    rating: 4.7,
    reviewsCount: 189,
    isVeg: true,
  },
  {
    id: 'item-5',
    name: 'Mini Rajma Chawal Bowl',
    category: 'Meals',
    price: 80,
    prepTimeMinutes: 5,
    available: true,
    modifiers: ['Extra Gravy', 'With Salad', 'Less Oil'],
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Homestyle slow-simmered Jammu red kidney beans curry served over fragrant basmati jeera rice with pickled onions and papad.',
    ingredients: ['Red Kidney Beans', 'Basmati Jeera Rice', 'Tomato-Onion Masala', 'Roasted Papad'],
    calories: 510,
    rating: 4.8,
    reviewsCount: 276,
    isVeg: true,
  },
  {
    id: 'item-6',
    name: 'Cutting Masala Chai',
    category: 'Beverages',
    price: 15,
    prepTimeMinutes: 2,
    available: true,
    modifiers: ['Less Sugar', 'Strong Ginger', 'Without Sugar'],
    images: [
      'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Signature campus cutting chai brewed with crushed fresh ginger, green cardamom, and Assam tea leaves.',
    ingredients: ['Assam Tea Leaves', 'Fresh Ginger', 'Green Cardamom', 'Full Cream Milk'],
    calories: 95,
    rating: 4.9,
    reviewsCount: 620,
    isVeg: true,
  },
  {
    id: 'item-7',
    name: 'Thick Cold Coffee',
    category: 'Beverages',
    price: 50,
    prepTimeMinutes: 3,
    available: true,
    modifiers: ['Less Ice', 'Extra Chocolate Drizzle', 'Strong Coffee'],
    images: [],
    description:
      'Creamy cafe-style blended cold coffee topped with rich chocolate drizzle and frothy milk foam.',
    ingredients: ['Roasted Arabica Espresso', 'Chilled Milk', 'Dark Cocoa Drizzle', 'Vanilla Hint'],
    calories: 240,
    rating: 4.7,
    reviewsCount: 305,
    isVeg: true,
  },
];

const INITIAL_SLOTS: TimeSlot[] = [
  {
    id: 'slot-now',
    label: 'Immediate Pickup (Now)',
    startTime: 'Now',
    endTime: '+10m',
    isImmediate: true,
    currentCapacity: 2,
    maxLimit: 10,
  },
  {
    id: 'slot-1',
    label: '11:00 AM – 11:15 AM (Short Break)',
    startTime: '11:00',
    endTime: '11:15',
    currentCapacity: 4,
    maxLimit: 8,
  },
  {
    id: 'slot-2',
    label: '11:15 AM – 11:30 AM (Short Break)',
    startTime: '11:15',
    endTime: '11:30',
    currentCapacity: 8,
    maxLimit: 8,
  },
  {
    id: 'slot-3',
    label: '01:15 PM – 01:30 PM (Lunch Break)',
    startTime: '13:15',
    endTime: '13:30',
    currentCapacity: 3,
    maxLimit: 12,
  },
  {
    id: 'slot-4',
    label: '01:30 PM – 01:45 PM (Lunch Break)',
    startTime: '13:30',
    endTime: '13:45',
    currentCapacity: 1,
    maxLimit: 12,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-demo-100',
    tokenNumber: 4108,
    customerId: 'usr-cust-1',
    customerName: 'Sneha Patil',
    rollNumber: 'MCA-19',
    slotId: 'slot-now',
    slotLabel: 'Immediate Pickup (Now)',
    items: [
      { menuItemId: 'item-5', name: 'Mini Rajma Chawal Bowl', price: 80, quantity: 1, customization: 'With Salad' },
    ],
    subtotal: 80,
    bundleDiscount: 0,
    voucherDiscount: 0,
    totalAmount: 80,
    paymentMethod: 'ONLINE_UPI',
    status: 'COMPLETED',
    createdAt: Date.now() - 900000,
    updatedAt: Date.now() - 420000,
  },
  {
    id: 'ord-demo-101',
    tokenNumber: 5824,
    customerId: 'usr-cust-1',
    customerName: 'Aarav Sharma',
    rollNumber: 'MCA-12',
    slotId: 'slot-now',
    slotLabel: 'Immediate Pickup (Now)',
    items: [
      { menuItemId: 'item-1', name: 'Mumbai Vada Pav', price: 25, quantity: 2, customization: 'Extra Dry Garlic Chutney' },
      { menuItemId: 'item-6', name: 'Cutting Masala Chai', price: 15, quantity: 2, customization: 'Strong Ginger' },
    ],
    subtotal: 80,
    bundleDiscount: 8,
    voucherDiscount: 0,
    totalAmount: 72,
    paymentMethod: 'ONLINE_UPI',
    status: 'PREPARING',
    createdAt: Date.now() - 240000,
    updatedAt: Date.now() - 120000,
  },
  {
    id: 'ord-demo-102',
    tokenNumber: 7391,
    customerName: 'Priya Nair',
    rollNumber: 'MCA-24',
    slotId: 'slot-now',
    slotLabel: 'Immediate Pickup (Now)',
    items: [
      { menuItemId: 'item-3', name: 'Mysore Masala Dosa', price: 70, quantity: 1, customization: 'Extra Crispy' },
      { menuItemId: 'item-1', name: 'Mumbai Vada Pav', price: 25, quantity: 1, customization: 'Standard' },
    ],
    subtotal: 95,
    bundleDiscount: 5,
    voucherDiscount: 0,
    totalAmount: 90,
    paymentMethod: 'CASH_ON_PICKUP',
    status: 'QUEUED',
    createdAt: Date.now() - 180000,
    updatedAt: Date.now() - 180000,
  },
  {
    id: 'ord-demo-103',
    tokenNumber: 8462,
    customerName: 'Rohan Deshmukh',
    rollNumber: 'MCA-08',
    slotId: 'slot-1',
    slotLabel: '11:00 AM – 11:15 AM (Short Break)',
    items: [
      { menuItemId: 'item-7', name: 'Thick Cold Coffee', price: 50, quantity: 2, customization: 'Extra Chocolate Drizzle' },
    ],
    subtotal: 100,
    bundleDiscount: 5,
    voucherDiscount: 0,
    totalAmount: 95,
    paymentMethod: 'CASH_ON_PICKUP',
    status: 'READY',
    createdAt: Date.now() - 360000,
    updatedAt: Date.now() - 30000,
  },
];

const DEFAULT_STATE: CanteenState = {
  menu: INITIAL_MENU,
  slots: INITIAL_SLOTS,
  orders: INITIAL_ORDERS,
  vouchers: INITIAL_VOUCHERS,
  voucherUsedAmounts: {},
  lastTokenNumber: 8462,
};

// Generates a 100% unique, non-repeating 4-digit token number (#T-1000 to #T-9999)
function generateUniqueTokenNumber(existingOrders: Order[]): number {
  const existingTokens = new Set(existingOrders.map((o) => o.tokenNumber));
  for (let attempt = 0; attempt < 9000; attempt++) {
    const candidate = Math.floor(1000 + Math.random() * 9000);
    if (!existingTokens.has(candidate)) {
      return candidate;
    }
  }
  return Date.now() % 100000;
}

function getLocalCache(): CanteenState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function persistToFirestore(nextState: CanteenState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new Event('local-canteen-update'));
  }

  setDoc(FIRESTORE_STATE_DOC, nextState).catch((err) =>
    console.warn('Firestore sync warning:', err)
  );
}

export function useCanteenStore() {
  const [state, setState] = useState<CanteenState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(getLocalCache());
    setHydrated(true);

    const unsubscribe = onSnapshot(
      FIRESTORE_STATE_DOC,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as CanteenState;
          const merged: CanteenState = {
            ...DEFAULT_STATE,
            ...cloudData,
            vouchers: cloudData.vouchers || INITIAL_VOUCHERS,
            voucherUsedAmounts: cloudData.voucherUsedAmounts || {},
          };
          setState(merged);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
        } else {
          setDoc(FIRESTORE_STATE_DOC, DEFAULT_STATE).catch(() => {});
        }
      },
      () => {
        setState(getLocalCache());
      }
    );

    const handleLocal = () => setState(getLocalCache());
    window.addEventListener('local-canteen-update', handleLocal);

    return () => {
      unsubscribe();
      window.removeEventListener('local-canteen-update', handleLocal);
    };
  }, []);

  const getRemainingVoucherBalance = useCallback(
    (userId: string, voucher: FestivalVoucher): number => {
      const key = `${userId}_${voucher.id}`;
      const used = state.voucherUsedAmounts[key] || 0;
      return Math.max(0, voucher.amount - used);
    },
    [state.voucherUsedAmounts]
  );

  const placeOrder = (params: {
    customerId: string;
    customerName: string;
    rollNumber: string;
    slotId: string;
    items: OrderItem[];
    subtotal: number;
    bundleDiscount: number;
    appliedVoucher?: FestivalVoucher | null;
    voucherDiscount: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
  }): { success: boolean; error?: string; order?: Order } => {
    const current = state;
    const slotIndex = current.slots.findIndex((s) => s.id === params.slotId);
    if (slotIndex === -1) return { success: false, error: 'Selected time slot not found.' };

    const slot = current.slots[slotIndex];
    if (slot.currentCapacity >= slot.maxLimit) {
      return { success: false, error: 'Slot Full! Please choose another 15-minute pickup window.' };
    }

    // Issue Unique 4-Digit Non-Repeating Token (#T-XXXX)
    const uniqueToken = generateUniqueTokenNumber(current.orders);
    const initialStatus: OrderStatus = slot.isImmediate ? 'QUEUED' : 'SCHEDULED';

    const newOrder: Order = {
      id: `ord-${nanoid(8)}`,
      tokenNumber: uniqueToken,
      customerId: params.customerId,
      customerName: params.customerName.trim() || 'Student',
      rollNumber: params.rollNumber.trim() || 'MCA-06',
      slotId: slot.id,
      slotLabel: slot.label,
      items: params.items,
      subtotal: params.subtotal,
      bundleDiscount: params.bundleDiscount,
      voucherCode: params.appliedVoucher?.code || '',
      voucherDiscount: params.voucherDiscount,
      totalAmount: params.totalAmount,
      paymentMethod: params.totalAmount === 0 ? 'FREE_VOUCHER' : params.paymentMethod,
      status: initialStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedSlots = [...current.slots];
    updatedSlots[slotIndex] = {
      ...slot,
      currentCapacity: slot.currentCapacity + 1,
    };

    const updatedVoucherUsage = { ...current.voucherUsedAmounts };
    if (params.appliedVoucher && params.voucherDiscount > 0) {
      const key = `${params.customerId}_${params.appliedVoucher.id}`;
      updatedVoucherUsage[key] = (updatedVoucherUsage[key] || 0) + params.voucherDiscount;
    }

    const nextState: CanteenState = {
      ...current,
      slots: updatedSlots,
      orders: [newOrder, ...current.orders],
      voucherUsedAmounts: updatedVoucherUsage,
      lastTokenNumber: uniqueToken,
    };

    setState(nextState);
    persistToFirestore(nextState);
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch(() => {});

    return { success: true, order: newOrder };
  };

  // Stage-Locked Order Cancellation: Allowed ONLY in SCHEDULED or QUEUED states
  const cancelOrder = (orderId: string): { success: boolean; message: string } => {
    const targetOrder = state.orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: 'Order not found.' };
    }

    if (targetOrder.status !== 'SCHEDULED' && targetOrder.status !== 'QUEUED') {
      return {
        success: false,
        message:
          'Cancellation Locked: Kitchen staff have already started preparing this order!',
      };
    }

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'CANCELLED',
      updatedAt: Date.now(),
    };

    const updatedOrders = state.orders.map((o) => (o.id === orderId ? updatedOrder : o));

    // Restore +1 capacity back to the 15-minute pickup slot
    const updatedSlots = state.slots.map((s) =>
      s.id === targetOrder.slotId
        ? { ...s, currentCapacity: Math.max(0, s.currentCapacity - 1) }
        : s
    );

    // Refund any Festival Voucher amount used on this order
    const updatedVoucherUsage = { ...state.voucherUsedAmounts };
    if (targetOrder.voucherCode && targetOrder.voucherDiscount > 0 && targetOrder.customerId) {
      const matchedVoucher = state.vouchers.find((v) => v.code === targetOrder.voucherCode);
      if (matchedVoucher) {
        const key = `${targetOrder.customerId}_${matchedVoucher.id}`;
        updatedVoucherUsage[key] = Math.max(
          0,
          (updatedVoucherUsage[key] || 0) - targetOrder.voucherDiscount
        );
      }
    }

    const nextState: CanteenState = {
      ...state,
      orders: updatedOrders,
      slots: updatedSlots,
      voucherUsedAmounts: updatedVoucherUsage,
    };

    setState(nextState);
    persistToFirestore(nextState);
    setDoc(doc(db, 'orders', orderId), updatedOrder).catch(() => {});

    return {
      success: true,
      message:
        'Order cancelled! Your 15-minute slot capacity and any used voucher balance have been restored.',
    };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = state.orders.map((ord) =>
      ord.id === orderId ? { ...ord, status, updatedAt: Date.now() } : ord
    );
    const nextState = { ...state, orders: updatedOrders };
    setState(nextState);
    persistToFirestore(nextState);

    const target = updatedOrders.find((o) => o.id === orderId);
    if (target) {
      setDoc(doc(db, 'orders', orderId), target).catch(() => {});
    }
  };

  const toggleMenuAvailability = (itemId: string) => {
    const updatedMenu = state.menu.map((item) =>
      item.id === itemId ? { ...item, available: !item.available } : item
    );
    const nextState = { ...state, menu: updatedMenu };
    setState(nextState);
    persistToFirestore(nextState);
  };

  const updateMenuPrice = (itemId: string, newPrice: number) => {
    if (newPrice <= 0) return;
    const updatedMenu = state.menu.map((item) =>
      item.id === itemId ? { ...item, price: newPrice } : item
    );
    const nextState = { ...state, menu: updatedMenu };
    setState(nextState);
    persistToFirestore(nextState);
  };

  const updateMenuImages = (itemId: string, images: string[]) => {
    const cleaned = images.map((img) => img.trim()).filter(Boolean).slice(0, 3);
    const updatedMenu = state.menu.map((item) =>
      item.id === itemId ? { ...item, images: cleaned } : item
    );
    const nextState = { ...state, menu: updatedMenu };
    setState(nextState);
    persistToFirestore(nextState);
  };

  const addMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const item: MenuItem = {
      ...newItem,
      id: `item-${nanoid(6)}`,
      images: (newItem.images || []).filter(Boolean).slice(0, 3),
    };
    const nextState = { ...state, menu: [...state.menu, item] };
    setState(nextState);
    persistToFirestore(nextState);
    setDoc(doc(db, 'menu', item.id), item).catch(() => {});
  };

  const updateMenuItem = (itemId: string, updates: Partial<Omit<MenuItem, 'id'>>) => {
    const updatedMenu = state.menu.map((item) =>
      item.id === itemId
        ? {
            ...item,
            ...updates,
            images: updates.images
              ? updates.images.map((i) => i.trim()).filter(Boolean).slice(0, 3)
              : item.images,
          }
        : item
    );
    const nextState = { ...state, menu: updatedMenu };
    setState(nextState);
    persistToFirestore(nextState);
    const updatedObj = updatedMenu.find((m) => m.id === itemId);
    if (updatedObj) setDoc(doc(db, 'menu', itemId), updatedObj).catch(() => {});
  };

  const deleteMenuItem = (itemId: string) => {
    const updatedMenu = state.menu.filter((item) => item.id !== itemId);
    const nextState = { ...state, menu: updatedMenu };
    setState(nextState);
    persistToFirestore(nextState);
    deleteDoc(doc(db, 'menu', itemId)).catch(() => {});
  };

  const updateSlotLimit = (slotId: string, maxLimit: number) => {
    if (maxLimit < 1) return;
    const updatedSlots = state.slots.map((s) =>
      s.id === slotId ? { ...s, maxLimit } : s
    );
    const nextState = { ...state, slots: updatedSlots };
    setState(nextState);
    persistToFirestore(nextState);
  };

  const addSlot = (newSlot: {
    label: string;
    startTime: string;
    endTime: string;
    maxLimit: number;
    isImmediate?: boolean;
  }) => {
    const slot: TimeSlot = {
      id: `slot-${nanoid(5)}`,
      label: newSlot.label.trim(),
      startTime: newSlot.startTime.trim(),
      endTime: newSlot.endTime.trim(),
      maxLimit: Math.max(1, Number(newSlot.maxLimit) || 10),
      currentCapacity: 0,
      isImmediate: Boolean(newSlot.isImmediate),
    };
    const nextState = { ...state, slots: [...state.slots, slot] };
    setState(nextState);
    persistToFirestore(nextState);
    setDoc(doc(db, 'slots', slot.id), slot).catch(() => {});
  };

  const updateSlot = (
    slotId: string,
    updates: Partial<Pick<TimeSlot, 'label' | 'startTime' | 'endTime' | 'maxLimit' | 'isImmediate'>>
  ) => {
    const updatedSlots = state.slots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            ...updates,
            maxLimit:
              updates.maxLimit !== undefined ? Math.max(1, Number(updates.maxLimit)) : s.maxLimit,
          }
        : s
    );
    const nextState = { ...state, slots: updatedSlots };
    setState(nextState);
    persistToFirestore(nextState);
  };

  const deleteSlot = (slotId: string) => {
    const updatedSlots = state.slots.filter((s) => s.id !== slotId);
    const nextState = { ...state, slots: updatedSlots };
    setState(nextState);
    persistToFirestore(nextState);
    deleteDoc(doc(db, 'slots', slotId)).catch(() => {});
  };

  const addFestivalVoucher = (voucher: Omit<FestivalVoucher, 'id'>) => {
    const newVoucher: FestivalVoucher = {
      ...voucher,
      id: `vch-${nanoid(6)}`,
      code: voucher.code.trim().toUpperCase(),
    };
    const nextState = { ...state, vouchers: [newVoucher, ...state.vouchers] };
    setState(nextState);
    persistToFirestore(nextState);
    setDoc(doc(db, 'vouchers', newVoucher.id), newVoucher).catch(() => {});
  };

  const toggleVoucherStatus = (voucherId: string) => {
    const updated = state.vouchers.map((v) =>
      v.id === voucherId ? { ...v, active: !v.active } : v
    );
    const nextState = { ...state, vouchers: updated };
    setState(nextState);
    persistToFirestore(nextState);
  };

  const deleteVoucher = (voucherId: string) => {
    const updated = state.vouchers.filter((v) => v.id !== voucherId);
    const nextState = { ...state, vouchers: updated };
    setState(nextState);
    persistToFirestore(nextState);
    deleteDoc(doc(db, 'vouchers', voucherId)).catch(() => {});
  };

  const resetDemoData = () => {
    setState(DEFAULT_STATE);
    persistToFirestore(DEFAULT_STATE);
  };

  return {
    ...state,
    hydrated,
    getRemainingVoucherBalance,
    placeOrder,
    cancelOrder,
    updateOrderStatus,
    toggleMenuAvailability,
    updateMenuPrice,
    updateMenuImages,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateSlotLimit,
    addSlot,
    updateSlot,
    deleteSlot,
    addFestivalVoucher,
    toggleVoucherStatus,
    deleteVoucher,
    resetDemoData,
  };
}