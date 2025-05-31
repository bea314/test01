
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Save, Trash2, Percent, DollarSign, Edit, Utensils, Soup } from "lucide-react";
import AiCondimentSuggester from "@/components/order-entry/ai-condiment-suggester";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter } from '@/lib/types';
import { IVA_RATE } from '@/lib/constants';
import Image from 'next/image';

const mockMenuCategories = [
  { id: 'cat1', name: 'Appetizers' },
  { id: 'cat2', name: 'Main Courses' },
  { id: 'cat3', name: 'Desserts' },
  { id: 'cat4', name: 'Drinks' },
];

const mockMenuItems: MenuItemType[] = [
  { id: 'item1', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls', price: 8.99, category: { id: 'cat1', name: 'Appetizers' }, number: 'A01', availability: 'available', imageUrl: 'https://placehold.co/100x100.png?text=Spring+Rolls' },
  { id: 'item2', name: 'Grilled Salmon', description: 'Salmon fillet with lemon butter sauce', price: 22.50, category: { id: 'cat2', name: 'Main Courses' }, number: 'M01', availability: 'available', imageUrl: 'https://placehold.co/100x100.png?text=Salmon' },
  { id: 'item3', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center', price: 9.75, category: { id: 'cat3', name: 'Desserts' }, number: 'D01', availability: 'available', imageUrl: 'https://placehold.co/100x100.png?text=Cake' },
  { id: 'item4', name: 'Iced Tea', description: 'Freshly brewed iced tea', price: 3.50, category: { id: 'cat4', name: 'Drinks' }, number: 'R01', availability: 'available', imageUrl: 'https://placehold.co/100x100.png?text=Iced+Tea' },
];

const mockWaiters: Waiter[] = [
  { id: 'waiter1', name: 'John Doe' },
  { id: 'waiter2', name: 'Jane Smith' },
];


export default function OrdersPage() {
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [selectedWaiter, setSelectedWaiter] = useState<string | undefined>(mockWaiters[0]?.id);
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [manualTip, setManualTip] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  
  // DTE Info States
  const [dteNit, setDteNit] = useState('');
  const [dteNrc, setDteNrc] = useState('');
  const [dteCustomerName, setDteCustomerName] = useState('');


  const addItemToOrder = (menuItem: MenuItemType) => {
    setCurrentOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { id: Date.now().toString(), menuItemId: menuItem.id, name: menuItem.name, quantity: 1, price: menuItem.price, modifiers: [], status: 'pending' }];
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
    } else {
      setCurrentOrderItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, quantity } : item));
    }
  };
  
  const subtotal = currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * IVA_RATE;
  const tipAmount = manualTip > 0 ? manualTip : subtotal * (tipPercentage / 100);
  const discountAmount = subtotal * (discountPercentage / 100);
  const totalAmount = subtotal + taxAmount + tipAmount - discountAmount;

  const filteredMenuItems = mockMenuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(item => selectedCategory ? item.category.id === selectedCategory : true);

  const orderDescriptionForAI = currentOrderItems.map(item => `${item.quantity}x ${item.name}`).join(', ');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Order Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Menu Items */}
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Menu Items</CardTitle>
            <CardDescription>Select items to add to the order. Search by name or item number.</CardDescription>
            <div className="flex gap-4 mt-4">
              <Input 
                placeholder="Search menu (name or #)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
                aria-label="Search menu items"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]" aria-label="Filter by category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockMenuCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMenuItems.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <Image src={item.imageUrl || `https://placehold.co/300x200.png?text=${item.name.replace(/\s/g,'+')}`} alt={item.name} width={300} height={200} className="w-full h-32 object-cover" data-ai-hint="food item" />
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-md mb-1 font-headline">{item.name} (#{item.number})</h3>
                      <p className="text-xs text-muted-foreground mb-2 truncate">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
                        <Button size="sm" onClick={() => addItemToOrder(item)}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredMenuItems.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">No menu items match your search.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 2: Current Order & Payment */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Current Order</CardTitle>
            <div className="flex gap-2 mt-2">
                <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
                    <SelectTrigger aria-label="Order Type">
                        <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dine-in">Dine-in</SelectItem>
                        <SelectItem value="Takeout">Takeout</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                    <SelectTrigger aria-label="Assign Waiter">
                        <SelectValue placeholder="Assign Waiter" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockWaiters.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[calc(100%-4rem)]">
            <ScrollArea className="flex-grow h-[250px] pr-2 mb-4">
              {currentOrderItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No items in order.</p>
              ) : (
                currentOrderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                        className="w-16 h-8 text-center"
                        min="0"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeItemFromOrder(item.id)} aria-label={`Remove ${item.name}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
            
            <Separator className="my-4" />

            <div className="space-y-2 text-sm mb-4">
              <AiCondimentSuggester orderDescription={orderDescriptionForAI} />
              <Separator className="my-2" />
              <div className="flex justify-between"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${taxAmount.toFixed(2)}</span></div>
              
              <div className="flex items-center justify-between">
                <span>Tip:</span>
                <div className="flex items-center gap-1">
                    <Input type="number" value={tipPercentage} onChange={e => {setTipPercentage(Number(e.target.value)); setManualTip(0);}} className="w-16 h-7 text-sm" suffix="%" aria-label="Tip percentage" /> %
                    <span>or</span>
                    <Input type="number" value={manualTip} onChange={e => {setManualTip(Number(e.target.value)); setTipPercentage(0);}} className="w-20 h-7 text-sm" prefix="$" aria-label="Manual tip amount" /> $
                </div>
              </div>
               <div className="flex items-center justify-between">
                <span>Discount:</span>
                 <div className="flex items-center gap-1">
                    <Input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} className="w-16 h-7 text-sm" suffix="%" aria-label="Discount percentage"/> %
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg text-primary"><span>Total:</span> <span>${totalAmount.toFixed(2)}</span></div>
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-3 mb-4">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger aria-label="Payment Method">
                        <SelectValue placeholder="Select Payment" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value_id="digital_wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3 mb-4">
                <Label className="font-headline">DTE Invoice (El Salvador)</Label>
                <Input placeholder="NIT" value={dteNit} onChange={e => setDteNit(e.target.value)} aria-label="DTE NIT" />
                <Input placeholder="NRC" value={dteNrc} onChange={e => setDteNrc(e.target.value)} aria-label="DTE NRC" />
                <Input placeholder="Customer Name" value={dteCustomerName} onChange={e => setDteCustomerName(e.target.value)} aria-label="DTE Customer Name"/>
            </div>

          </CardContent>
          <CardFooter className="flex-col gap-2">
             <Button className="w-full" size="lg">
                <Save className="mr-2 h-5 w-5" /> Finalize & Pay
             </Button>
             <Button variant="outline" className="w-full">Send to Kitchen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
