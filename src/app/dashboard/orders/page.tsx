
"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Save, Trash2, Edit, List, LayoutGrid, MessageSquare, Info, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, Users } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter, Order, AllergyTag } from '@/lib/types';
import { IVA_RATE } from '@/lib/constants';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { initialMenuItems as mockMenuItemsAll, mockCategories as mockMenuCategories, initialStaff } from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

type MenuView = 'grid' | 'list';
type OrderStep = 'building' | 'checkout';

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const initialOrderTypeParam = searchParams.get('type') as OrderType | null;

  const [currentStep, setCurrentStep] = useState<OrderStep>('building');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [menuView, setMenuView] = useState<MenuView>('grid');
  
  const [orderType, setOrderType] = useState<OrderType>(initialOrderTypeParam || 'Dine-in');
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(undefined);
  const [selectedWaiter, setSelectedWaiter] = useState<string | undefined>(initialStaff[0]?.id);
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [manualTip, setManualTip] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  
  const [dteType, setDteType] = useState<'consumidor_final' | 'credito_fiscal'>('consumidor_final');
  const [dteNit, setDteNit] = useState('');
  const [dteNrc, setDteNrc] = useState('');
  const [dteCustomerName, setDteCustomerName] = useState('');

  const [editingObservationItem, setEditingObservationItem] = useState<OrderItem | null>(null);
  const [currentObservationText, setCurrentObservationText] = useState('');

  useEffect(() => {
    if (initialOrderTypeParam) {
      setOrderType(initialOrderTypeParam);
    }
  }, [initialOrderTypeParam]);

  const addItemToOrder = (menuItem: MenuItemType) => {
    setCurrentOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItemId === menuItem.id && !item.observations); // Only merge if no unique observation
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

  const handleProceedToCheckout = () => {
    if (currentOrderItems.length === 0) {
        alert("Please add items to the order before proceeding to checkout.");
        return;
    }
    setCurrentStep('checkout');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          {currentStep === 'building' ? 'Build Your Order' : 'Checkout & Payment'}
        </h1>
        {currentStep === 'checkout' && (
            <Button variant="outline" onClick={() => setCurrentStep('building')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit Order
            </Button>
        )}
      </div>
      
      {currentStep === 'building' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-xl lg:order-1">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><ShoppingCart className="mr-2 h-5 w-5"/>Current Order</CardTitle>
              <div className="grid grid-cols-2 gap-2 mt-2">
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
                          {initialStaff.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
              {orderType === 'Dine-in' && (
                <div className="mt-2">
                  <Label htmlFor="numberOfGuests">Number of Guests (Optional)</Label>
                  <Input 
                    id="numberOfGuests" 
                    type="number" 
                    value={numberOfGuests || ''} 
                    onChange={e => setNumberOfGuests(e.target.value ? parseInt(e.target.value) : undefined)} 
                    placeholder="e.g., 4"
                    min="1"
                    className="h-9"
                  />
                </div>
              )}
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-34rem)] lg:h-[calc(100vh-28rem)]"> 
              <CardContent className="flex flex-col justify-between ">
                  <ScrollArea className="flex-grow h-[280px] pr-2 mb-4">
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
                          <Dialog open={editingObservationItem?.id === item.id} onOpenChange={(open) => { if(!open) setEditingObservationItem(null); }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingObservationItem(item); setCurrentObservationText(item.observations || '');}} aria-label={`Edit observations for ${item.name}`}>
                                  <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add/Edit Observations for {item.name}</DialogTitle>
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
                                  <Button variant="outline" onClick={() => setEditingObservationItem(null) }>Cancel</Button>
                                  <Button onClick={handleSaveObservation}>Save Observations</Button>
                                </DialogFooter>
                              </DialogContent>
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
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Total:</span> <span>${totalAmount.toFixed(2)}</span></div>
                  </div>
              </CardContent>
            </ScrollArea>
            <CardFooter className="flex-col gap-2 mt-auto border-t pt-4">
               <Button className="w-full" size="lg" onClick={handleProceedToCheckout}>
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
               <Button variant="outline" className="w-full">Send to Kitchen (Mock)</Button>
            </CardFooter>
          </Card>
          
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
              <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
                {menuView === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMenuItems.map(item => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <Image src={item.imageUrl || `https://placehold.co/300x200.png?text=${item.name.replace(/\s/g,'+')}`} alt={item.name} width={300} height={200} className="w-full h-32 object-cover aspect-video" data-ai-hint={item.dataAiHint || "food item"}/>
                        <CardContent className="p-3 flex flex-col flex-grow">
                          <h3 className="font-semibold text-md mb-1 font-headline">#{item.number} - {item.name}</h3>
                          <p className="text-xs text-muted-foreground mb-1 flex-grow line-clamp-2">{item.description}</p>
                           {item.allergyTags && item.allergyTags.length > 0 && (
                            <div className="my-1 flex flex-wrap gap-1">
                              {item.allergyTags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs capitalize border-amber-500 text-amber-600">{tag.replace('-', ' ')}</Badge>
                              ))}
                            </div>
                          )}
                           {item.allergiesNotes && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                     <p className="text-xs text-amber-600 mt-1 mb-1 flex items-center cursor-default">
                                       <Info className="h-3 w-3 mr-1" /> Notes
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
                ) : ( 
                  <div className="space-y-2">
                    {filteredMenuItems.map(item => (
                      <Card key={item.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Image src={item.imageUrl || `https://placehold.co/100x75.png?text=${item.name.replace(/\s/g,'+')}`} alt={item.name} width={60} height={45} className="rounded object-cover aspect-[4/3]" data-ai-hint={item.dataAiHint || "food item"}/>
                            <div>
                              <h3 className="font-semibold text-md font-headline">#{item.number} - {item.name}</h3>
                              <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                              {item.allergyTags && item.allergyTags.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {item.allergyTags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs capitalize border-amber-500 text-amber-600">{tag.replace('-', ' ')}</Badge>
                                  ))}
                                </div>
                              )}
                              {item.allergiesNotes && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                       <p className="text-xs text-amber-600 mt-1 flex items-center cursor-default">
                                         <Info className="h-3 w-3 mr-1" /> Notes
                                       </p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="text-xs">{item.allergiesNotes}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
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
      )}

      {currentStep === 'checkout' && (
         <Card className="shadow-xl max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5"/>Payment Details</CardTitle>
                <CardDescription>Review your order and complete the payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <ScrollArea className="h-[200px] border rounded-md p-3">
                        {currentOrderItems.map(item => (
                            <div key={item.id} className="flex justify-between items-start py-1.5 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium">{item.quantity}x {item.name}</p>
                                    <p className="text-xs text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                                    {item.observations && <p className="text-xs text-blue-500 mt-0.5">Notes: {item.observations}</p>}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between">
                        <span>Tip:</span>
                        <div className="flex items-center gap-1">
                            <Input type="number" value={tipPercentage} onChange={e => {setTipPercentage(Number(e.target.value)); setManualTip(0);}} className="w-16 h-7 text-sm" aria-label="Tip percentage" /> %
                            <span>or</span>
                            <Input type="number" value={manualTip} onChange={e => {setManualTip(Number(e.target.value)); setTipPercentage(0);}} className="w-20 h-7 text-sm" aria-label="Manual tip amount" /> $
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Discount:</span>
                        <div className="flex items-center gap-1">
                            <Input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} className="w-16 h-7 text-sm" aria-label="Discount percentage"/> %
                        </div>
                    </div>
                    <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Grand Total:</span> <span>${totalAmount.toFixed(2)}</span></div>
                </div>

                <Separator />
                
                <div className="p-4 border border-dashed rounded-md text-center">
                    <p className="text-muted-foreground text-sm">Payment splitting options (by item, manual, percentage, clients) will be available here soon.</p>
                </div>

                <Separator />

                <div className="space-y-3">
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

                <div className="space-y-3">
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
            <CardFooter className="border-t pt-4">
                 <Button className="w-full" size="lg" onClick={() => alert('Order Finalized (Mock)')}>
                    <Save className="mr-2 h-5 w-5" /> Finalize &amp; Pay
                 </Button>
            </CardFooter>
         </Card>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading order options...</div>}>
      <OrdersPageContent />
    </Suspense>
  )
}
