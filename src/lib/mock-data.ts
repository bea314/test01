
import type { MenuItem, MenuItemCategory, User, UserRole, RestaurantTable, Order, DiscountPreset, KitchenPrinter, OrderItem, OrderTotals, ProcessedPaymentSplit } from '@/lib/types';
import { IVA_RATE } from './constants';

export let mockCategories: MenuItemCategory[] = [
  { id: "cat1", name: "Appetizers" },
  { id: "cat2", name: "Main Courses" },
  { id: "cat3", name: "Desserts" },
  { id: "cat4", name: "Beverages" },
  { id: "cat5", name: "Salads" },
  { id: "cat6", name: "Soups" },
];

export const addMockCategory = (name: string): MenuItemCategory => {
  const newCategory = { id: `cat${Date.now()}`, name };
  mockCategories.push(newCategory);
  return newCategory;
};

export const editMockCategory = (id: string, newName: string): MenuItemCategory | undefined => {
  const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
  if (categoryIndex > -1) {
    mockCategories[categoryIndex].name = newName;
    return mockCategories[categoryIndex];
  }
  return undefined;
};

export const deleteMockCategory = (id: string): boolean => {
  const initialLength = mockCategories.length;
  mockCategories = mockCategories.filter(cat => cat.id !== id);
  initialMenuItems.forEach(item => {
    if (item.category.id === id) {
      console.warn(`Category ${id} deleted. Item ${item.id} (${item.name}) is now effectively uncategorized or needs reassignment.`);
    }
  });
  return mockCategories.length < initialLength;
};


export let initialMenuItems: MenuItem[] = [
  {
    id: "item1",
    name: "Bruschetta",
    description: "Grilled bread rubbed with garlic and topped with olive oil and salt.",
    price: 9.50,
    category: mockCategories[0],
    availability: "available",
    number: "A01",
    imageUrl: "https://placehold.co/150x100.png?text=Bruschetta",
    dataAiHint: "italian bread",
    allergiesNotes: "Vegan option available upon request.",
    allergyTags: ['vegetarian', 'dairy-free']
  },
  {
    id: "item2",
    name: "Spaghetti Carbonara",
    description: "Classic Roman pasta dish with eggs, cheese, pancetta, and pepper.",
    price: 18.00,
    category: mockCategories[1],
    availability: "available",
    number: "M05",
    imageUrl: "https://placehold.co/150x100.png?text=Carbonara",
    dataAiHint: "pasta dish",
    allergiesNotes: "Contains gluten, dairy, and eggs.",
    allergyTags: []
  },
  {
    id: "item3",
    name: "Tiramisu",
    description: "Coffee-flavoured Italian dessert.",
    price: 8.00,
    category: mockCategories[2],
    availability: "unavailable",
    number: "D02",
    imageUrl: "https://placehold.co/150x100.png?text=Tiramisu",
    dataAiHint: "italian dessert",
    allergiesNotes: "Contains dairy, eggs, gluten, and coffee.",
    allergyTags: []
  },
  {
    id: 'item4',
    name: 'Spring Rolls',
    description: 'Crispy vegetable spring rolls served with sweet chili sauce.',
    price: 8.99,
    category: mockCategories[0],
    number: 'A02',
    availability: 'available',
    imageUrl: 'https://placehold.co/150x100.png?text=Spring+Rolls',
    dataAiHint: "asian appetizer",
    allergiesNotes: 'Vegan.',
    allergyTags: ['vegan', 'vegetarian', 'dairy-free', 'nut-free']
  },
  {
    id: 'item5',
    name: 'Grilled Salmon',
    description: 'Fresh salmon fillet grilled to perfection, served with asparagus and lemon butter sauce.',
    price: 22.50,
    category: mockCategories[1],
    number: 'M01',
    availability: 'available',
    imageUrl: 'https://placehold.co/150x100.png?text=Salmon',
    dataAiHint: "fish dish",
    allergiesNotes: 'Contains fish.',
    allergyTags: ['gluten-free']
  },
  {
    id: 'item6',
    name: 'Chocolate Lava Cake',
    description: 'Warm, rich chocolate cake with a gooey molten center, served with vanilla ice cream.',
    price: 9.75,
    category: mockCategories[2],
    number: 'D01',
    availability: 'available',
    imageUrl: 'https://placehold.co/150x100.png?text=Lava+Cake',
    dataAiHint: "chocolate dessert",
    allergiesNotes: 'Contains dairy, eggs, gluten.',
    allergyTags: []
  },
  {
    id: 'item7',
    name: 'Iced Tea',
    description: 'Freshly brewed iced tea, available sweetened or unsweetened.',
    price: 3.50,
    category: mockCategories[3],
    number: 'R01',
    availability: 'available',
    imageUrl: 'https://placehold.co/150x100.png?text=Iced+Tea',
    dataAiHint: "cold beverage",
    allergyTags: ['vegan', 'gluten-free', 'dairy-free', 'nut-free']
  },
  {
    id: 'item8',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing.',
    price: 12.00,
    category: mockCategories[4],
    number: 'S01',
    availability: 'available',
    imageUrl: 'https://placehold.co/150x100.png?text=Caesar+Salad',
    dataAiHint: 'classic salad',
    allergiesNotes: 'Contains dairy and gluten. Anchovies in dressing.',
    allergyTags: []
  },
  {
    id: 'item9',
    name: 'Tomato Soup',
    description: 'Creamy tomato soup served with a slice of garlic bread.',
    price: 7.50,
    category: mockCategories[5],
    number: 'P01',
    availability: 'available',
    imageUrl: 'https://placehold.co/150x100.png?text=Tomato+Soup',
    dataAiHint: 'warm soup',
    allergiesNotes: 'Contains dairy and gluten (bread).',
    allergyTags: ['vegetarian']
  }
];

export const userRoles: UserRole[] = ['admin', 'cashier', 'waiter', 'kitchen'];

export let initialStaff: User[] = [
  { id: "staff1", name: "Alice Wonderland", email: "alice@krealiares.com", role: "admin" },
  { id: "staff2", name: "Bob The Builder", email: "bob@krealiares.com", role: "waiter" },
  { id: "staff3", name: "Charlie Chaplin", email: "charlie@krealiares.com", role: "cashier" },
  { id: "staff4", name: "Diana Prince", email: "diana@krealiares.com", role: "waiter" },
  { id: "staff5", name: "Kevin Mitnick", email: "kevin@krealiares.com", role: "kitchen" },
];

export let initialTables: RestaurantTable[] = [
  { id: "t1", name: "Main Table 1", status: "available", capacity: 4 },
  { id: "t2", name: "Window Seat 2", status: "occupied", capacity: 2, currentOrderId: "orderXYZ" },
  { id: "t3", name: "Patio Table A", status: "reserved", capacity: 6 },
  { id: "t4", name: "Corner Booth", status: "available", capacity: 5 },
  { id: "t5", name: "Bar Seat 5", status: "available", capacity: 1 },
];

export const calculateOrderTotals = (
    orderInput: Partial<Order> & { items: OrderItem[] },
    actuallyAppliedPreset: DiscountPreset | null,
    actuallyAppliedManualAmount: number
  ): OrderTotals => {
    const activeItems = orderInput.items.filter(item => item.status !== 'cancelled');

    const subtotalAfterItemCourtesies = activeItems.reduce((sum, item) => {
      return sum + (item.isCourtesy ? 0 : item.price * item.quantity);
    }, 0);

    let currentAppliedPresetDiscountValue = 0;
    if (!orderInput.isCourtesy && actuallyAppliedPreset) {
      let discountableSubtotalForPreset = 0;
      if (actuallyAppliedPreset.applicableItemIds && actuallyAppliedPreset.applicableItemIds.length > 0) {
        discountableSubtotalForPreset = activeItems
          .filter(item => !item.isCourtesy && actuallyAppliedPreset.applicableItemIds!.includes(item.menuItemId))
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      } else if (actuallyAppliedPreset.applicableCategoryIds && actuallyAppliedPreset.applicableCategoryIds.length > 0) {
         const itemCategories = activeItems.map(item => initialMenuItems.find(mi => mi.id === item.menuItemId)?.category.id);
         discountableSubtotalForPreset = activeItems
           .filter((item, index) => !item.isCourtesy && actuallyAppliedPreset.applicableCategoryIds!.includes(itemCategories[index] || ''))
           .reduce((sum, item) => sum + item.price * item.quantity, 0);
      } else { // Discount applies to all non-courtesy items
        discountableSubtotalForPreset = activeItems
          .filter(item => !item.isCourtesy)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
      currentAppliedPresetDiscountValue = discountableSubtotalForPreset * (actuallyAppliedPreset.percentage / 100);
    }

    const subtotalAfterPresetDiscount = subtotalAfterItemCourtesies - currentAppliedPresetDiscountValue;
    let currentAppliedManualDiscountValue = 0;
    if (!orderInput.isCourtesy && actuallyAppliedManualAmount > 0) {
      currentAppliedManualDiscountValue = Math.min(subtotalAfterPresetDiscount, actuallyAppliedManualAmount);
    }

    const finalTotalDiscountAmount = orderInput.isCourtesy ? subtotalAfterItemCourtesies : currentAppliedPresetDiscountValue + currentAppliedManualDiscountValue;
    const subtotalAfterAllDiscounts = subtotalAfterItemCourtesies - finalTotalDiscountAmount;

    const taxAmount = orderInput.isCourtesy ? 0 : subtotalAfterAllDiscounts * IVA_RATE;
    const tipAmount = orderInput.isCourtesy ? 0 : orderInput.tipAmount || 0;

    const totalAmount = subtotalAfterAllDiscounts + taxAmount + tipAmount;

    return {
      subtotal: subtotalAfterItemCourtesies,
      discountAmount: finalTotalDiscountAmount,
      taxAmount,
      tipAmount,
      totalAmount,
      appliedPresetDiscountValue: currentAppliedPresetDiscountValue,
      appliedManualDiscountValue: currentAppliedManualDiscountValue,
    };
  };


export const addActiveOrder = (newOrderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items' | 'status' | keyof OrderTotals> & { items: (Omit<OrderItem, 'id' | 'status'> & { tempId?: string })[] }) => {
  const newOrderId = `order${Date.now()}`;
  const orderItems: OrderItem[] = newOrderData.items.map((item, index) => ({
      ...item,
      id: `oi-${newOrderId}-${item.menuItemId}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending'
  }));

  const baseOrder: Partial<Order> & { items: OrderItem[] } = {
      id: newOrderId,
      tableId: newOrderData.tableId,
      waiterId: newOrderData.waiterId,
      orderType: newOrderData.orderType,
      numberOfGuests: newOrderData.numberOfGuests,
      items: orderItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipAmount: newOrderData.tipAmount || 0,
      isCourtesy: newOrderData.isCourtesy || false,
      isOnHold: newOrderData.isOnHold || false,
      disableReceiptPrint: newOrderData.disableReceiptPrint || false,

      // For a new order, applied discounts are typically null/0
      appliedPresetDiscount: null,
      appliedManualDiscountValue: 0,
      // Staged discounts might also be cleared or not set at initial creation
      selectedDiscountId: undefined,
      appliedCouponCode: undefined,
      manualDiscountAmount: 0,


      paymentSplitType: newOrderData.paymentSplitType || 'none',
      paymentSplitWays: newOrderData.paymentSplitWays,
      processedSplits: [],
      status: 'open',
  };

  const totals = calculateOrderTotals(
    baseOrder as Order,
    baseOrder.appliedPresetDiscount || null,
    baseOrder.appliedManualDiscountValue || 0 // This should be 0 for a new order
  );

  const newOrder: Order = {
    ...baseOrder,
    ...totals,
  } as Order;

  mockActiveOrders.unshift(newOrder);
  return newOrder;
};

export const updateActiveOrder = (updatedOrderData: Partial<Order> & { id: string }) => {
  const index = mockActiveOrders.findIndex(o => o.id === updatedOrderData.id);
  if (index !== -1) {
    const existingOrder = mockActiveOrders[index];

    // Determine the correct preset and manual discount values for calculation
    const presetForCalc = 'appliedPresetDiscount' in updatedOrderData
        ? updatedOrderData.appliedPresetDiscount
        : existingOrder.appliedPresetDiscount;

    // If updatedOrderData includes appliedManualDiscountValue, use that.
    // Otherwise, use existing order's.
    const manualValueForCalc = updatedOrderData.appliedManualDiscountValue !== undefined
        ? updatedOrderData.appliedManualDiscountValue
        : existingOrder.appliedManualDiscountValue;

    const baseUpdatedOrder = {
        ...existingOrder,
        ...updatedOrderData,
        updatedAt: new Date().toISOString(),
        // Ensure applied discounts are correctly carried or updated for re-calculation
        appliedPresetDiscount: presetForCalc,
        appliedManualDiscountValue: manualValueForCalc,
    };

    const totals = calculateOrderTotals(
        baseUpdatedOrder,
        presetForCalc || null,
        manualValueForCalc || 0
    );
    const fullyUpdatedOrder: Order = {
        ...baseUpdatedOrder,
        ...totals
    };
    mockActiveOrders[index] = fullyUpdatedOrder;
    return fullyUpdatedOrder;
  }
  console.warn(`Order with ID ${updatedOrderData.id} not found for update.`);
  return undefined;
};

export let mockActiveOrders: Order[] = [
  {
    id: "order001",
    tableId: "t1",
    waiterId: "staff2",
    orderType: "Dine-in",
    numberOfGuests: 3,
    items: [
      { id: "oi1", menuItemId: "item2", name: "Spaghetti Carbonara", quantity: 1, price: 18.00, modifiers: [], status: 'preparing', observations: "Extra cheese", assignedGuest: "Guest 1" },
      { id: "oi2", menuItemId: "item7", name: "Iced Tea", quantity: 2, price: 3.50, modifiers: [], status: 'delivered', assignedGuest: "Guest 2" },
      { id: "oi2b", menuItemId: "item7", name: "Iced Tea", quantity: 1, price: 3.50, modifiers: [], status: 'delivered', assignedGuest: "Guest 3" },
    ],
    status: "open",
    subtotal: (18.00 * 1) + (3.50 * 3), taxAmount: ((18.00 * 1) + (3.50 * 3)) * 0.13, tipAmount: 0, discountAmount: 0, manualDiscountAmount: 0, appliedPresetDiscountValue: 0, appliedManualDiscountValue: 0,
    totalAmount: ((18.00 * 1) + (3.50 * 3)) * 1.13,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    isOnHold: false,
    isCourtesy: false,
    disableReceiptPrint: false,
    processedSplits: [],
  },
  {
    id: "order002",
    waiterId: "staff4",
    orderType: "Takeout",
    items: [
      { id: "oi3", menuItemId: "item5", name: "Grilled Salmon", quantity: 1, price: 22.50, modifiers: [], status: 'ready' },
      { id: "oi4", menuItemId: "item9", name: "Tomato Soup", quantity: 1, price: 7.50, modifiers: [], status: 'ready', observations: "No garlic bread" },
    ],
    status: "pending_payment",
    subtotal: 22.50 + 7.50, taxAmount: (22.50 + 7.50) * 0.13, tipAmount: 0, discountAmount: 0, manualDiscountAmount: 0, appliedPresetDiscountValue: 0, appliedManualDiscountValue: 0,
    totalAmount: (22.50 + 7.50) * 1.13,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    processedSplits: [],
  },
  {
    id: "order003",
    tableId: "t5",
    waiterId: "staff2",
    orderType: "Dine-in",
    numberOfGuests: 1,
    items: [
      { id: "oi5", menuItemId: "item1", name: "Bruschetta", quantity: 1, price: 9.50, modifiers: [], status: 'pending' },
    ],
    status: "open",
    subtotal: 9.50, taxAmount: 9.50 * 0.13, tipAmount: 0, discountAmount: 0, manualDiscountAmount: 0, appliedPresetDiscountValue: 0, appliedManualDiscountValue: 0,
    totalAmount: 9.50 * 1.13,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    processedSplits: [],
  },
  {
    id: "order004",
    waiterId: "staff4",
    orderType: "Delivery",
    items: [
      { id: "oi6", menuItemId: "item4", name: "Spring Rolls", quantity: 2, price: 8.99, modifiers: [], status: 'pending' },
      { id: "oi7", menuItemId: "item6", name: "Chocolate Lava Cake", quantity: 1, price: 9.75, modifiers: [], status: 'pending', observations: "Add extra chocolate sauce if possible" },
    ],
    status: "open",
    subtotal: (8.99*2) + 9.75, taxAmount: ((8.99*2) + 9.75) * 0.13, tipAmount: 0, discountAmount: 0, manualDiscountAmount: 0, appliedPresetDiscountValue: 0, appliedManualDiscountValue: 0,
    totalAmount: ((8.99*2) + 9.75) * 1.13,
    createdAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(), // Older order for KDS priority
    updatedAt: new Date().toISOString(),
    processedSplits: [],
  },
  {
    id: "orderXYZ",
    tableId: "t2",
    waiterId: "staff2",
    orderType: "Dine-in",
    numberOfGuests: 2,
    items: [
      { id: "oi8", menuItemId: "item8", name: "Caesar Salad", quantity: 1, price: 12.00, modifiers: [], status: 'preparing', assignedGuest: "Guest 1"},
      { id: "oi9", menuItemId: "item7", name: "Iced Tea", quantity: 1, price: 3.50, modifiers: [], status: 'delivered', assignedGuest: "Guest 2"},
    ],
    status: "open",
    subtotal: 12.00 + 3.50, taxAmount: (12.00 + 3.50) * 0.13, tipAmount: 3.00, discountAmount: 0, manualDiscountAmount: 0, appliedPresetDiscountValue: 0, appliedManualDiscountValue: 0,
    totalAmount: (12.00 + 3.50) * 1.13 + 3.00,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    processedSplits: [],
  }
].map(order => { // Initialize all orders with calculated totals
    const totals = calculateOrderTotals(
        order,
        order.appliedPresetDiscount || null,
        order.appliedManualDiscountValue || 0 // Use appliedManualDiscountValue for consistency
    );
    return { ...order, ...totals };
});

export let mockPresetDiscounts: DiscountPreset[] = [
    { id: 'discount1', name: 'Employee Discount', percentage: 15, description: 'For all KREALIRES staff.', couponCode: 'STAFF15' },
    { id: 'discount2', name: 'Happy Hour Special', percentage: 10, description: 'Valid on select items during happy hour.', applicableCategoryIds: ["cat1", "cat4"], couponCode: 'HAPPYHOUR' },
    { id: 'discount3', name: 'VIP Customer', percentage: 5, description: 'For registered VIP customers.' },
    { id: 'discount4', name: 'Salmon Special', percentage: 20, description: 'Discount on Grilled Salmon only.', applicableItemIds: ["item5"], couponCode: 'SALMONDEAL' },
];


export let mockKitchenPrinters: KitchenPrinter[] = [
    { id: "kp1", name: "Main Kitchen", ipAddress: "192.168.1.100" },
    { id: "kp2", name: "Grill Station", ipAddress: "192.168.1.102" },
];

export const addMockKitchenPrinter = (name: string, ipAddress: string): KitchenPrinter => {
  const newPrinter = { id: `kp${Date.now()}`, name, ipAddress };
  mockKitchenPrinters.push(newPrinter);
  return newPrinter;
};

export const removeMockKitchenPrinter = (id: string): boolean => {
  const initialLength = mockKitchenPrinters.length;
  mockKitchenPrinters = mockKitchenPrinters.filter(p => p.id !== id);
  return mockKitchenPrinters.length < initialLength;
};

