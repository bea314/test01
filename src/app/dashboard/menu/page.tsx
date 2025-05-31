
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, Search, UploadCloud } from "lucide-react";
import type { MenuItem, MenuItemCategory } from '@/lib/types';
import Image from 'next/image';

// Mock data
const mockCategories: MenuItemCategory[] = [
  { id: "cat1", name: "Appetizers" },
  { id: "cat2", name: "Main Courses" },
  { id: "cat3", name: "Desserts" },
  { id: "cat4", name: "Beverages" },
];

const initialMenuItems: MenuItem[] = [
  { id: "item1", name: "Bruschetta", description: "Grilled bread rubbed with garlic and topped with olive oil and salt.", price: 9.50, category: mockCategories[0], availability: "available", number: "A01", imageUrl: "https://placehold.co/150x100.png?text=Bruschetta" },
  { id: "item2", name: "Spaghetti Carbonara", description: "Classic Roman pasta dish.", price: 18.00, category: mockCategories[1], availability: "available", number: "M05", imageUrl: "https://placehold.co/150x100.png?text=Carbonara" },
  { id: "item3", name: "Tiramisu", description: "Coffee-flavoured Italian dessert.", price: 8.00, category: mockCategories[2], availability: "unavailable", number: "D02", imageUrl: "https://placehold.co/150x100.png?text=Tiramisu" },
];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for adding/editing items
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<string | undefined>(undefined);
  const [itemAvailability, setItemAvailability] = useState<'available' | 'unavailable'>('available');
  const [itemNumber, setItemNumber] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');


  const handleEdit = (item: MenuItem) => {
    setIsEditing(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category.id);
    setItemAvailability(item.availability);
    setItemNumber(item.number || '');
    setItemImageUrl(item.imageUrl || '');
  };

  const handleDelete = (itemId: string) => {
    setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const resetForm = () => {
    setIsEditing(null);
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemCategory(undefined);
    setItemAvailability('available');
    setItemNumber('');
    setItemImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCat = mockCategories.find(cat => cat.id === itemCategory);
    if (!selectedCat) {
        alert("Please select a category.");
        return;
    }

    const newItem: MenuItem = {
      id: isEditing ? isEditing.id : Date.now().toString(),
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice) || 0,
      category: selectedCat,
      availability: itemAvailability,
      number: itemNumber,
      imageUrl: itemImageUrl || `https://placehold.co/150x100.png?text=${itemName.replace(/\s/g,'+')}`,
    };

    if (isEditing) {
      setMenuItems(prevItems => prevItems.map(item => item.id === newItem.id ? newItem : item));
    } else {
      setMenuItems(prevItems => [newItem, ...prevItems]);
    }
    resetForm();
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Menu Editor</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-1 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="itemNumber">Item Number/Code</Label>
                <Input id="itemNumber" value={itemNumber} onChange={e => setItemNumber(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea id="itemDescription" value={itemDescription} onChange={e => setItemDescription(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="itemPrice">Price</Label>
                <Input id="itemPrice" type="number" step="0.01" value={itemPrice} onChange={e => setItemPrice(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="itemCategory">Category</Label>
                <Select value={itemCategory} onValueChange={setItemCategory} required>
                  <SelectTrigger id="itemCategory"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {mockCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="itemAvailability">Availability</Label>
                <Select value={itemAvailability} onValueChange={(value) => setItemAvailability(value as 'available' | 'unavailable')} required>
                  <SelectTrigger id="itemAvailability"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="itemImageUrl">Image URL (Optional)</Label>
                <Input id="itemImageUrl" value={itemImageUrl} onChange={e => setItemImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
              </div>
               <Button type="button" variant="outline" className="w-full">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {isEditing ? <><Edit3 className="mr-2 h-4 w-4" /> Update Item</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Item</>}
                </Button>
                {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancel Edit</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Current Menu Items</CardTitle>
            <Input 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mt-2 max-w-sm"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredItems.length === 0 && <p className="text-muted-foreground">No items found. Add one using the form!</p>}
              {filteredItems.map(item => (
                <Card key={item.id} className="flex items-center p-4 gap-4 hover:bg-muted/30 transition-colors">
                  <Image 
                    src={item.imageUrl || `https://placehold.co/100x75.png?text=${item.name.replace(/\s/g,'+')}`} 
                    alt={item.name} 
                    width={100} height={75} 
                    className="rounded-md object-cover aspect-[4/3]"
                    data-ai-hint="food item"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg font-headline">{item.name} <span className="text-sm text-muted-foreground">({item.number})</span></h3>
                    <p className="text-xs text-muted-foreground truncate max-w-md">{item.description}</p>
                    <p className="text-sm">Price: <span className="font-medium text-primary">${item.price.toFixed(2)}</span></p>
                    <p className="text-sm">Category: {item.category.name}</p>
                    <p className={`text-sm font-medium ${item.availability === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.availability.charAt(0).toUpperCase() + item.availability.slice(1)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}><Edit3 className="mr-1 h-4 w-4" /> Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
