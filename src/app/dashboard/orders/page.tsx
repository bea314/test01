
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Save, Trash2, Edit, List, LayoutGrid, MessageSquare, Info } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter, Order } from '@/lib/types';
import { IVA_RATE } from '@/lib/constants';
import Image from 'next/image';
import { initialMenuItems as mockMenuItemsAll, mockCategories as mockMenuCategories } from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const mockWaiters: Waiter[] = [
  { id: 'waiter1', name: 'John Doe' },
  { id: 'waiter2', name: 'Jane Smith' },
];

type MenuView = 'grid' | 'list';

export default function OrdersPage() {
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [menuView, setMenuView] = useState<MenuView>('grid');
  
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [selectedWaiter, setSelectedWaiter] = useState<string | undefined>(mockWaiters[0]?.id);
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [manualTip, setManualTip] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  
  const [dteType, setDteType] = useState<'consumidor_final' | 'credito_fiscal'>('consumidor_final');
  const [dteNit, setDteNit] = useState('');
  const [dteNrc, setDteNrc] = useState('');
  const [dteCustomerName, setDteCustomerName] = useState('');

  // For editing observations
  const [editingObservationItem, setEditingObservationItem] = useState<OrderItem | null>(null);
  const [currentObservationText, setCurrentObservationText] = useState('');

  const addItemToOrder = (menuItem: MenuItemType) => {
    setCurrentOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItemId === menuItem.id && !item.observations); // Simple check for new item vs existing
      if (existingItem) {
        return prevItems.map(item =>
          item.menuItemId === menuItem.id && !item.observations ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { id: Date.now().toString(), menuItemId: menuItem.id, name: menuItem.name, quantity: 1, price: menuItem.price, modifiers: [], status: 'pending', observations: '' }];
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

  const handleSaveObservation = () => {
    if (editingObservationItem) {
      setCurrentOrderItems(prevItems =>
        prevItems.map(item =>
          item.id === editingObservationItem.id ? { ...item, observations: currentObservationText } : item
        )
      );
      setEditingObservationItem(null);
      setCurrentObservationText('');
    }
  };
  
  const subtotal = currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * IVA_RATE;
  const tipAmount = manualTip > 0 ? manualTip : subtotal * (tipPercentage / 100);
  const discountAmount = subtotal * (discountPercentage / 100);
  const totalAmount = subtotal + taxAmount + tipAmount - discountAmount;

  const filteredMenuItems = mockMenuItemsAll.filter(item =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    item.availability === 'available'
  ).filter(item => selectedCategory && selectedCategory !== 'all' ? item.category.id === selectedCategory : true);


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Order Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Current Order & Payment (Primary on mobile, first column on lg) */}
        <Card className="shadow-xl lg:order-1">
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
                        <SelectItem value="Delivery">Delivery</SelectItem>
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
          <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjusted height */}
            <CardContent className="flex flex-col justify-between "> {/* Removed fixed height */}
                <ScrollArea className="flex-grow h-[280px] pr-2 mb-4"> {/* Item list scroll */}
                {currentOrderItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No items in order.</p>
                ) : (
                    currentOrderItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start py-2 border-b border-border last:border-b-0">
                        <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                        {item.observations && <p className="text-xs text-blue-500 mt-1">Notes: {item.observations}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                        <Input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 h-8 text-center"
                            min="0"
                            aria-label={`Quantity for ${item.name}`}
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingObservationItem(item); setCurrentObservationText(item.observations || '');}} aria-label={`Edit observations for ${item.name}`}>
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
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
                            <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3 mb-4">
                    <Label className="font-headline">DTE Invoice (El Salvador)</Label>
                    <Select value={dteType} onValueChange={(value) => setDteType(value as 'consumidor_final' | 'credito_fiscal')}>
                        <SelectTrigger aria-label="DTE Document Type">
                            <SelectValue placeholder="Select DTE Type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                            <SelectItem value="credito_fiscal">Crédito Fiscal</SelectItem>
                        </SelectContent>
                    </Select>

                    {dteType === 'credito_fiscal' && (
                        <>
                            <Input placeholder="NIT Cliente" value={dteNit} onChange={e => setDteNit(e.target.value)} aria-label="DTE NIT Cliente" />
                            <Input placeholder="NRC Cliente" value={dteNrc} onChange={e => setDteNrc(e.target.value)} aria-label="DTE NRC Cliente" />
                            <Input placeholder="Nombre Cliente" value={dteCustomerName} onChange={e => setDteCustomerName(e.target.value)} aria-label="DTE Customer Name"/>
                        </>
                    )}
                </div>
            </CardContent>
          </ScrollArea>
          <CardFooter className="flex-col gap-2 mt-auto border-t pt-4"> {/* Ensure footer is at bottom */}
             <Button className="w-full" size="lg">
                <Save className="mr-2 h-5 w-5" /> Finalize &amp; Pay
             </Button>
             <Button variant="outline" className="w-full">Send to Kitchen</Button>
          </CardFooter>
        </Card>
        
        {/* Column 2: Menu Items (Secondary on mobile, second column on lg) */}
        <Card className="lg:col-span-2 shadow-xl lg:order-2">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Menu Items</CardTitle>
                    <CardDescription>Select items to add. Search by name or item code.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant={menuView === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setMenuView('grid')} aria-label="Grid view">
                        <LayoutGrid className="h-4 w-4"/>
                    </Button>
                    <Button variant={menuView === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setMenuView('list')} aria-label="List view">
                        <List className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
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
            <ScrollArea className="h-[calc(100vh-22rem)] pr-4"> {/* Adjusted height */}
              {menuView === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMenuItems.map(item => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                      <Image src={item.imageUrl || `https://placehold.co/300x200.png?text=${item.name.replace(/\s/g,'+')}`} alt={item.name} width={300} height={200} className="w-full h-32 object-cover aspect-[3/2]" data-ai-hint="food item" />
                      <CardContent className="p-3 flex flex-col flex-grow">
                        <h3 className="font-semibold text-md mb-1 font-headline">#{item.number} - {item.name}</h3>
                        <p className="text-xs text-muted-foreground mb-1 flex-grow truncate-2-lines">{item.description}</p>
                         {item.allergiesNotes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-amber-600 mt-1 mb-1 flex items-center cursor-default">
                                    <Info className="h-3 w-3 mr-1" /> Allergy Info
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">{item.allergiesNotes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        <div className="flex justify-between items-center mt-auto pt-2">
                          <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
                          <Button size="sm" onClick={() => addItemToOrder(item)}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : ( // List view
                <div className="space-y-2">
                  {filteredMenuItems.map(item => (
                    <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-md font-headline">#{item.number} - {item.name}</h3>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                           {item.allergiesNotes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-amber-600 mt-1 flex items-center cursor-default">
                                    <Info className="h-3 w-3 mr-1" /> Allergy Info
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">{item.allergiesNotes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <Button size="sm" onClick={() => addItemToOrder(item)}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {filteredMenuItems.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">No menu items match your search or category.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {editingObservationItem && (
        <Dialog open={!!editingObservationItem} onOpenChange={() => {
          if (editingObservationItem) handleSaveObservation(); // Save if dialog is closed by 'x' or overlay click
          setEditingObservationItem(null);
          setCurrentObservationText('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add/Edit Observations for {editingObservationItem?.name}</DialogTitle>
              <DialogDescription>
                Enter any special notes or observations for this item.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={currentObservationText}
              onChange={(e) => setCurrentObservationText(e.target.value)}
              placeholder="e.g., Extra spicy, no onions, etc."
              rows={4}
              className="my-4"
            />
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="outline" onClick={() => {setEditingObservationItem(null); setCurrentObservationText('');}}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveObservation}>Save Observations</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
