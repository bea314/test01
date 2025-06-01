
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
  specialInstructions?: string; // Kept for general instructions
  observations?: string; // For specific item observations/notes
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

export interface Order {
  id: string;
  tableId?: string; // For Dine-in
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
  dteInvoiceInfo?: DTEInvoiceInfo; // For El Salvador DTE
  dteType?: 'consumidor_final' | 'credito_fiscal';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
  imageUrl?: string;
  availability: 'available' | 'unavailable';
  number?: string; // For searching by number
  allergiesNotes?: string; // For allergy information
}

export interface Waiter {
  id: string;
  name: string;
}

// For settings page - financial documents
export interface BusinessFinancialInfo {
  businessName: string; // Nombre Comercial
  legalName: string; // Nombre o Razón Social
  nit: string; // NIT
  nrc: string; // NRC
  taxpayerType: string; // Tipo de Contribuyente (e.g., Persona Natural, Sociedad)
  economicActivity: string; // Actividad Económica (Giro)
  email: string;
  phone: string;
  address?: string; // Might be useful
  municipality?: string;
  department?: string;
}
