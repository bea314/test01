
import type { MenuItem, MenuItemCategory, User, UserRole, RestaurantTable } from '@/lib/types';

export const mockCategories: MenuItemCategory[] = [
  { id: "cat1", name: "Appetizers" },
  { id: "cat2", name: "Main Courses" },
  { id: "cat3", name: "Desserts" },
  { id: "cat4", name: "Beverages" },
];

export const initialMenuItems: MenuItem[] = [
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
    allergiesNotes: "Contains gluten. Vegan option available upon request."
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
    allergiesNotes: "Contains gluten, dairy, and eggs."
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
    allergiesNotes: "Contains dairy, eggs, gluten, and coffee."
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
    allergiesNotes: 'Contains gluten. Vegan.'
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
    allergiesNotes: 'Contains fish. Gluten-free.'
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
    allergiesNotes: 'Contains dairy, eggs, gluten.'
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
    dataAiHint: "cold beverage"
  }
];

export const userRoles: UserRole[] = ['admin', 'cashier', 'waiter'];

export const initialStaff: User[] = [
  { id: "staff1", name: "Alice Wonderland", email: "alice@tabletop.ai", role: "admin" },
  { id: "staff2", name: "Bob The Builder", email: "bob@tabletop.ai", role: "waiter" },
  { id: "staff3", name: "Charlie Chaplin", email: "charlie@tabletop.ai", role: "cashier" },
  { id: "staff4", name: "Diana Prince", email: "diana@tabletop.ai", role: "waiter" },
];

export const initialTables: RestaurantTable[] = [
  { id: "t1", name: "Main Table 1", status: "available", capacity: 4 },
  { id: "t2", name: "Window Seat 2", status: "occupied", capacity: 2, currentOrderId: "orderXYZ" },
  { id: "t3", name: "Patio Table A", status: "reserved", capacity: 6 },
  { id: "t4", name: "Corner Booth", status: "available", capacity: 5 },
  { id: "t5", name: "Bar Seat 5", status: "available", capacity: 1 },
];
