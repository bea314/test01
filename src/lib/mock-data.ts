
import type { MenuItem, MenuItemCategory, User, UserRole, RestaurantTable, AllergyTag } from '@/lib/types';

export const mockCategories: MenuItemCategory[] = [
  { id: "cat1", name: "Appetizers" },
  { id: "cat2", name: "Main Courses" },
  { id: "cat3", name: "Desserts" },
  { id: "cat4", name: "Beverages" },
  { id: "cat5", name: "Salads" },
  { id: "cat6", name: "Soups" },
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
    allergiesNotes: "Vegan option available upon request.",
    allergyTags: ['vegetarian']
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
    allergyTags: ['vegan', 'vegetarian', 'dairy-free']
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

export const userRoles: UserRole[] = ['admin', 'cashier', 'waiter'];

export const initialStaff: User[] = [
  { id: "staff1", name: "Alice Wonderland", email: "alice@krealiares.com", role: "admin" },
  { id: "staff2", name: "Bob The Builder", email: "bob@krealiares.com", role: "waiter" },
  { id: "staff3", name: "Charlie Chaplin", email: "charlie@krealiares.com", role: "cashier" },
  { id: "staff4", name: "Diana Prince", email: "diana@krealiares.com", role: "waiter" },
];

export const initialTables: RestaurantTable[] = [
  { id: "t1", name: "Main Table 1", status: "available", capacity: 4 },
  { id: "t2", name: "Window Seat 2", status: "occupied", capacity: 2, currentOrderId: "orderXYZ" },
  { id: "t3", name: "Patio Table A", status: "reserved", capacity: 6 },
  { id: "t4", name: "Corner Booth", status: "available", capacity: 5 },
  { id: "t5", name: "Bar Seat 5", status: "available", capacity: 1 },
];
