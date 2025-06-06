
export type UserRole = 'admin' | 'cashier' | 'waiter' | 'kitchen';

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
  assignedGuest?: string;
  isCourtesy?: boolean; // For item-specific courtesy
}

export interface DTEInvoiceInfo {
  nit: string;
  nrc: string;
  customerName: string;
  // Add other DTE specific fields as required
}

export type PaymentSplitType = 'none' | 'equal' | 'by_item' | 'by_customer_bill';

export interface ProcessedPaymentSplit {
  id: string; // temp id for the split
  amountPaid: number;
  paymentMethod: string;
  itemsCovered?: string[]; // item IDs if split by item
  shareNumber?: number; // if split equally
  dteType?: 'consumidor_final' | 'credito_fiscal';
  dteInvoiceInfo?: DTEInvoiceInfo;
}

export interface OrderTotals {
  subtotal: number; // Subtotal *after* item-level courtesies
  taxAmount: number;
  tipAmount: number;
  discountAmount: number; // Total value of all discounts applied
  totalAmount: number; // Grand total after all calculations
  appliedPresetDiscountValue: number; // Value of the preset discount applied
  appliedManualDiscountValue: number; // Value of the manual discount applied
  // manualDiscountAmount?: number; // This was confusing, using appliedManualDiscountValue instead
}


export interface Order extends OrderTotals {
  id: string;
  tableId?: string;
  waiterId: string;
  orderType: OrderType;
  numberOfGuests?: number;
  items: OrderItem[];
  status: 'open' | 'pending_payment' | 'paid' | 'completed' | 'cancelled' | 'on_hold';
  paymentMethod?: 'cash' | 'credit_card' | 'digital_wallet'; // Overall if not split
  dteInvoiceInfo?: DTEInvoiceInfo; // Overall if not split
  dteType?: 'consumidor_final' | 'credito_fiscal'; // Overall if not split
  createdAt: string;
  updatedAt: string;
  isCourtesy?: boolean; // For overall order courtesy
  isOnHold?: boolean;
  disableReceiptPrint?: boolean;
  
  // These represent the discounts *selected* or *entered* by the user, not necessarily applied yet
  selectedDiscountId?: string; 
  appliedCouponCode?: string;
  manualDiscountAmount?: number; // The raw manual discount amount entered by user

  // These represent the discounts that have been confirmed and *applied* to the current calculation
  appliedPresetDiscount?: DiscountPreset | null; // Store the actual preset object
  
  paymentSplitType?: PaymentSplitType;
  paymentSplitWays?: number; // For 'equal' split
  processedSplits?: ProcessedPaymentSplit[];
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

export interface BusinessFinancialInfo {
  businessName: string;
  legalName: string;
  nrc: string; // Registro Nacional de Contribuyente
  nit: string; // Número de Identificación Tributaria
  taxpayerType: string; // e.g., "Gran Contribuyente", "Mediano Contribuyente", "Pequeño Contribuyente", "Otro"
  economicActivity: string; // Giro o Actividad Económica
  address: string; // Dirección completa
  municipality: string; // Municipio
  department: string; // Departamento
  phone: string;
  email: string;
}

export interface KitchenPrinter {
  id: string;
  name: string;
  ipAddress: string;
}

export interface DiscountPreset {
  id: string;
  name: string;
  percentage: number; // e.g., 15 for 15%
  couponCode?: string;
  description?: string;
  applicableItemIds?: string[];
  applicableCategoryIds?: string[];
}

// Tip mode for checkout
export type TipMode = 'default' | 'percentage' | 'manual';
