
export type UserRole = 'admin' | 'cashier' | 'waiter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RestaurantTable {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  currentOrderId?: string;
  position?: { x: number; y: number }; // For visual table management
}

export type OrderType = 'Dine-in' | 'Takeout' | 'Delivery';

export interface OrderItemModifier {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  modifiers: OrderItemModifier[];
  specialInstructions?: string; 
  observations?: string; 
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

export interface Order {
  id: string;
  tableId?: string; 
  waiterId: string;
  orderType: OrderType;
  items: OrderItem[];
  status: 'open' | 'pending_payment' | 'paid' | 'completed' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod?: 'cash' | 'credit_card' | 'digital_wallet';
  dteInvoiceInfo?: DTEInvoiceInfo; 
  dteType?: 'consumidor_final' | 'credito_fiscal';
  createdAt: string; 
  updatedAt: string; 
}

export interface DTEInvoiceInfo {
  nit: string;
  nrc: string;
  customerName: string;
  // Add other DTE specific fields as required
}

export interface MenuItemCategory {
  id: string;
  name: string;
}

export type AllergyTag = 
  | 'gluten-free' 
  | 'vegan' 
  | 'vegetarian' 
  | 'nut-free' 
  | 'dairy-free' 
  | 'shellfish-free';

export const ALLERGY_TAG_OPTIONS: AllergyTag[] = [
  'gluten-free', 
  'vegan', 
  'vegetarian', 
  'nut-free', 
  'dairy-free', 
  'shellfish-free'
];


export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
  imageUrl?: string;
  dataAiHint?: string;
  availability: 'available' | 'unavailable';
  number?: string; 
  allergiesNotes?: string;
  allergyTags?: AllergyTag[];
}

export interface Waiter {
  id: string;
  name: string;
}

// For settings page - financial documents
export interface BusinessFinancialInfo {
  businessName: string; 
  legalName: string; 
  nit: string;
  nrc: string;
  taxpayerType: string; 
  economicActivity: string; 
  email: string;
  phone: string;
  address?: string; 
  municipality?: string;
  department?: string;
}

export interface KitchenPrinter {
  id: string;
  name: string;
  ipAddress: string;
}
