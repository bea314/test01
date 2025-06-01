
"use client";
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Search, Save, Trash2, Edit, List, LayoutGrid, MessageSquare, Info, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, Users, Percent, WalletCards, CircleDollarSign, EyeOff, StickyNote, Hash, UserCheck, Send } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter, Order, AllergyTag, PaymentSplitType, DiscountPreset, RestaurantTable } from '@/lib/types';
import { IVA_RATE, DEFAULT_TIP_PERCENTAGE } from '@/lib/constants';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { initialMenuItems as mockMenuItemsAll, mockCategories as mockMenuCategories, initialStaff, mockPresetDiscounts, initialTables, addActiveOrder, updateActiveOrder, mockActiveOrders } from '@/lib/mock-data';
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
import { useToast } from '@/hooks/use-toast';


type MenuView = 'grid' | 'list';
type OrderStep = 'building' | 'checkout';
type TipMode = 'default' | 'percentage' | 'manual';


function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrderTypeParam = searchParams.get('type') as OrderType | null;
  const initialTableIdParam = searchParams.get('tableId') as string | null;
  const checkoutOrderIdParam = searchParams.get('checkoutOrderId') as string | null;

  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<OrderStep>('building');
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [menuView, setMenuView] = useState<MenuView>('grid');
  
  const [orderType, setOrderType] = useState<OrderType>(initialOrderTypeParam || 'Dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(initialTableIdParam || undefined);
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(1);
  const [selectedWaiter, setSelectedWaiter] = useState<string | undefined>(initialStaff[0]?.id);
  
  const [tipMode, setTipMode] = useState<TipMode>('default');
  const [customTipPercentage, setCustomTipPercentage] = useState<number>(DEFAULT_TIP_PERCENTAGE);
  const [manualTipAmount, setManualTipAmount] = useState<number>(0);

  const [selectedDiscountId, setSelectedDiscountId] = useState<string | undefined>(undefined);

  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  
  const [dteType, setDteType] = useState<'consumidor_final' | 'credito_fiscal'>('consumidor_final');
  const [dteNit, setDteNit] = useState('');
  const [dteNrc, setDteNrc] = useState('');
  const [dteCustomerName, setDteCustomerName] = useState('');

  const [editingObservationItem, setEditingObservationItem] = useState<OrderItem | null>(null);
  const [currentObservationText, setCurrentObservationText] = useState('');

  const [isCourtesy, setIsCourtesy] = useState(false);
  const [orderIsOnHold, setOrderIsOnHold] = useState(false); // Renamed to avoid conflict with Order.isOnHold
  const [disableReceiptPrint, setDisableReceiptPrint] = useState(false);

  const [paymentSplitType, setPaymentSplitType] = useState<PaymentSplitType>('none');
  const [paymentSplitWays, setPaymentSplitWays] = useState<number>(2);
  const [itemsToSplit, setItemsToSplit] = useState<Record<string, boolean>>({});

  const [currentEditingOrderId, setCurrentEditingOrderId] = useState<string | null>(checkoutOrderIdParam);


  useEffect(() => {
    const typeParam = searchParams.get('type') as OrderType | null;
    const tableIdParam = searchParams.get('tableId') as string | null;
    const checkoutOrderId = searchParams.get('checkoutOrderId') as string | null;

    if (checkoutOrderId) {
        const orderToCheckout = mockActiveOrders.find(o => o.id === checkoutOrderId);
        if (orderToCheckout) {
            setCurrentEditingOrderId(checkoutOrderId);
            setCurrentOrderItems(orderToCheckout.items.map(item => ({...item}))); // Deep copy
            setOrderType(orderToCheckout.orderType);
            setSelectedWaiter(orderToCheckout.waiterId);
            setSelectedTableId(orderToCheckout.tableId);
            setNumberOfGuests(orderToCheckout.numberOfGuests);
            setSelectedDiscountId(orderToCheckout.selectedDiscountId);
            // Potentially load tip settings if saved with order
            setIsCourtesy(orderToCheckout.isCourtesy || false);
            setOrderIsOnHold(orderToCheckout.isOnHold || false);
            setDisableReceiptPrint(orderToCheckout.disableReceiptPrint || false);
            setCurrentStep('checkout');
        } else {
            toast({ title: "Error", description: `Order ${checkoutOrderId} not found for checkout.`, variant: "destructive" });
        }
    } else {
        if (typeParam) {
          setOrderType(typeParam);
          if (typeParam !== 'Dine-in') {
            setNumberOfGuests(undefined);
            setSelectedTableId(undefined); 
          } else {
            setNumberOfGuests(numberOfGuests === undefined ? 1 : numberOfGuests);
            if (tableIdParam) setSelectedTableId(tableIdParam);
          }
        } else {
            setOrderType('Dine-in');
            setNumberOfGuests(numberOfGuests === undefined ? 1 : numberOfGuests);
            if (tableIdParam) setSelectedTableId(tableIdParam);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]); 

  const resetOrderForm = () => {
    setCurrentOrderItems([]);
    setSearchTerm('');
    setSelectedCategory('all');
    setOrderType('Dine-in');
    setSelectedTableId(undefined);
    setNumberOfGuests(1);
    setSelectedWaiter(initialStaff[0]?.id);
    setTipMode('default');
    setCustomTipPercentage(DEFAULT_TIP_PERCENTAGE);
    setManualTipAmount(0);
    setSelectedDiscountId(undefined);
    setPaymentMethod(undefined);
    setDteType('consumidor_final');
    setDteNit('');
    setDteNrc('');
    setDteCustomerName('');
    setIsCourtesy(false);
    setOrderIsOnHold(false);
    setDisableReceiptPrint(false);
    setPaymentSplitType('none');
    setPaymentSplitWays(2);
    setItemsToSplit({});
    setCurrentStep('building');
    setCurrentEditingOrderId(null);
    router.replace('/dashboard/orders'); // Clear query params
  };

  const updateItemGuestAssignment = (itemId: string, guest: string) => {
    setCurrentOrderItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, assignedGuest: guest } : item
      )
    );
  };

  const addItemToOrder = (menuItem: MenuItemType) => {
    setCurrentOrderItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item.menuItemId === menuItem.id && 
        !item.observations && 
        (!numberOfGuests || numberOfGuests <= 1 || !item.assignedGuest) // Only merge if not guest-assigned or single guest
      );

      if (existingItemIndex > -1 && (!numberOfGuests || numberOfGuests <=1)) {
        return prevItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { 
        id: `temp-${Date.now().toString()}`, 
        menuItemId: menuItem.id, 
        name: menuItem.name, 
        quantity: 1, 
        price: menuItem.price, 
        modifiers: [], 
        status: 'pending', 
        observations: '',
        assignedGuest: numberOfGuests && numberOfGuests > 1 ? 'Guest 1' : undefined // Default for multi-guest
      }];
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
  
  const subtotal = useMemo(() => currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [currentOrderItems]);
  
  const discountPercentage = useMemo(() => {
    if (isCourtesy) return 100;
    const preset = mockPresetDiscounts.find(d => d.id === selectedDiscountId);
    return preset ? preset.percentage : 0;
  }, [selectedDiscountId, isCourtesy]);
  
  const discountAmount = useMemo(() => subtotal * (discountPercentage / 100), [subtotal, discountPercentage]);
  
  const subtotalAfterDiscount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const tipAmount = useMemo(() => {
    if (isCourtesy) return 0;
    switch (tipMode) {
      case 'percentage':
        return subtotalAfterDiscount * (customTipPercentage / 100);
      case 'manual':
        return manualTipAmount;
      case 'default':
      default:
        return subtotalAfterDiscount * (DEFAULT_TIP_PERCENTAGE / 100);
    }
  }, [tipMode, subtotalAfterDiscount, customTipPercentage, manualTipAmount, isCourtesy]);

  const taxAmount = useMemo(() => isCourtesy ? 0 : subtotalAfterDiscount * IVA_RATE, [subtotalAfterDiscount, isCourtesy]);
  
  const totalAmount = useMemo(() => {
    if (isCourtesy) return 0;
    return subtotalAfterDiscount + taxAmount + tipAmount;
  }, [subtotalAfterDiscount, taxAmount, tipAmount, isCourtesy]);


  const filteredMenuItems = mockMenuItemsAll.filter(item =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    item.availability === 'available'
  ).filter(item => selectedCategory !== 'all' ? item.category.id === selectedCategory : true);

  const handleFinalizeAndSendToKitchen = () => {
    if (currentOrderItems.length === 0) {
        toast({ title: "Empty Order", description: "Please add items to the order.", variant: "destructive" });
        return;
    }
    if (!selectedWaiter) {
        toast({ title: "Waiter Required", description: "Please assign a waiter to the order.", variant: "destructive" });
        return;
    }
    if (orderType === 'Dine-in' && !selectedTableId) {
      toast({ title: "Table Required", description: "Please select a table for this Dine-in order.", variant: "destructive" });
      return;
    }

    const newOrderId = `order${Date.now()}`;
    const newOrder: Order = {
        id: newOrderId,
        items: currentOrderItems.map(item => ({...item, id: `oi-${newOrderId}-${item.menuItemId}-${Math.random().toString(36).substring(7)}`})), // Ensure unique IDs for items in the new order
        orderType,
        waiterId: selectedWaiter,
        tableId: orderType === 'Dine-in' ? selectedTableId : undefined,
        numberOfGuests: orderType === 'Dine-in' ? numberOfGuests : undefined,
        status: orderIsOnHold ? 'on_hold' : 'open',
        subtotal,
        discountAmount,
        taxAmount,
        tipAmount,
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCourtesy,
        isOnHold: orderIsOnHold,
        disableReceiptPrint,
        selectedDiscountId,
        dteType: dteType, // will be finalized in checkout
        paymentMethod: paymentMethod, // will be finalized in checkout
    };

    addActiveOrder(newOrder);
    toast({ title: "Order Sent to Kitchen (Mock)", description: `Order #${newOrderId.slice(-6)} created and sent.` });

    if (orderType === 'Dine-in' && selectedTableId) {
        const tableIndex = initialTables.findIndex(t => t.id === selectedTableId);
        if (tableIndex > -1) {
            initialTables[tableIndex].status = 'occupied';
            initialTables[tableIndex].currentOrderId = newOrderId;
        }
    }
    resetOrderForm();
    router.push(`/dashboard/active-orders/${newOrderId}`);
  };

  const handleFinalizePayment = () => {
    if (!currentEditingOrderId) {
        toast({ title: "Error", description: "No active order selected for payment.", variant: "destructive" });
        return;
    }
    if (!paymentMethod && !isCourtesy) {
        toast({ title: "Payment Method Required", description: "Please select a payment method.", variant: "destructive" });
        return;
    }
    if (dteType === 'credito_fiscal' && (!dteNit || !dteNrc || !dteCustomerName)) {
        toast({ title: "DTE Information Incomplete", description: "Please fill all required fields for Crédito Fiscal.", variant: "destructive" });
        return;
    }
    
    const orderToUpdate = mockActiveOrders.find(o => o.id === currentEditingOrderId);
    if (!orderToUpdate) {
         toast({ title: "Error", description: `Order ${currentEditingOrderId} not found for payment.`, variant: "destructive" });
        return;
    }

    const updatedOrder: Order = {
        ...orderToUpdate,
        items: currentOrderItems, // Use current items as they might have changes (though ideally not in checkout step)
        status: isCourtesy ? 'completed' : orderIsOnHold ? 'on_hold' : 'paid',
        paymentMethod,
        dteType,
        dteInvoiceInfo: dteType === 'credito_fiscal' ? { nit: dteNit, nrc: dteNrc, customerName: dteCustomerName } : undefined,
        tipAmount, // Recalculated
        discountAmount, // Recalculated
        selectedDiscountId,
        totalAmount, // Recalculated
        subtotal, // Recalculated
        taxAmount, // Recalculated
        isCourtesy,
        isOnHold: orderIsOnHold, // Ensure this is the order-level hold status
        disableReceiptPrint,
        updatedAt: new Date().toISOString(),
    };
    
    updateActiveOrder(updatedOrder);

    let message = `Order #${currentEditingOrderId.slice(-6)} finalized.`;
    if (paymentSplitType !== 'none') {
        message += ` Payment split: ${paymentSplitType}`;
        if (paymentSplitType === 'equal') message += ` into ${paymentSplitWays} ways.`;
    }
    if (isCourtesy) message = `Order #${currentEditingOrderId.slice(-6)} Marked as Courtesy.`;
    else if (orderIsOnHold) message = `Order #${currentEditingOrderId.slice(-6)} status set to On Hold.`;


    toast({ title: "Payment Processed", description: message });
    
    if (orderType === 'Dine-in' && selectedTableId && (updatedOrder.status === 'paid' || updatedOrder.status === 'completed' || updatedOrder.status === 'cancelled')) {
        const tableIndex = initialTables.findIndex(t => t.id === selectedTableId);
        if (tableIndex > -1 && initialTables[tableIndex].currentOrderId === currentEditingOrderId) {
            initialTables[tableIndex].status = 'available'; // Or 'needs_cleaning'
            initialTables[tableIndex].currentOrderId = undefined;
        }
    }

    resetOrderForm(); // Resets the form and clears currentEditingOrderId
    router.push('/dashboard/active-orders');
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          {currentStep === 'building' ? 'Build New Order' : `Checkout: Order #${currentEditingOrderId?.slice(-6) || 'New'}`}
        </h1>
        {currentStep === 'checkout' && (
            <Button variant="outline" onClick={() => { 
              if(currentEditingOrderId) router.push(`/dashboard/active-orders/${currentEditingOrderId}`); else resetOrderForm();
            }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                {currentEditingOrderId ? "Back to Active Order" : "Cancel Checkout & Start New"}
            </Button>
        )}
      </div>
      
      {currentStep === 'building' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-xl lg:order-1">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><ShoppingCart className="mr-2 h-5 w-5"/>Current Order</CardTitle>
              <div className="grid grid-cols-2 gap-2 mt-2">
                  <Select value={orderType} onValueChange={(value) => {
                      const newOrderType = value as OrderType;
                      setOrderType(newOrderType);
                      if (newOrderType !== 'Dine-in') {
                        setNumberOfGuests(undefined);
                        setSelectedTableId(undefined);
                      } else if (numberOfGuests === undefined) {
                        setNumberOfGuests(1);
                      }
                  }}>
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="selectedTable">Table</Label>
                     <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                        <SelectTrigger id="selectedTable" aria-label="Select Table">
                            <SelectValue placeholder="Select Table" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialTables.filter(t => t.status === 'available' || t.status === 'reserved' || t.id === selectedTableId).map(table => (
                                <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numberOfGuests">Guests</Label>
                    <Input 
                        id="numberOfGuests" 
                        type="number" 
                        value={numberOfGuests || ''} 
                        onChange={e => setNumberOfGuests(e.target.value ? parseInt(e.target.value) : undefined)} 
                        placeholder="e.g., 1"
                        min="1"
                        className="h-9"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-36rem)] lg:h-[calc(100vh-32rem)]"> 
              <CardContent className="flex flex-col justify-between ">
                  <ScrollArea className="flex-grow h-[280px] pr-2 mb-4">
                  {currentOrderItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-10">No items in order.</p>
                  ) : (
                      currentOrderItems.map(item => (
                      <div key={item.id} className="py-2 border-b border-border last:border-b-0">
                        <div className="flex justify-between items-start">
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
                        {numberOfGuests && numberOfGuests > 1 && (
                            <div className="mt-1.5 flex items-center gap-2">
                                <Label htmlFor={`guest-assign-${item.id}`} className="text-xs">Guest:</Label>
                                <Select 
                                    value={item.assignedGuest || `Guest 1`}
                                    onValueChange={(value) => updateItemGuestAssignment(item.id, value)}
                                >
                                    <SelectTrigger id={`guest-assign-${item.id}`} className="h-7 text-xs w-28">
                                        <SelectValue placeholder="Assign Guest" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: numberOfGuests }, (_, i) => (
                                            <SelectItem key={`guest-${i+1}`} value={`Guest ${i+1}`}>Guest {i+1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                      </div>
                      ))
                  )}
                  </ScrollArea>
                  
                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Total (Approx.):</span> <span>${(subtotal * (1 + IVA_RATE)).toFixed(2)}</span></div>
                  </div>
              </CardContent>
            </ScrollArea>
            <CardFooter className="flex-col gap-2 mt-auto border-t pt-4">
               <Button className="w-full" size="lg" onClick={handleFinalizeAndSendToKitchen} disabled={orderIsOnHold && currentStep === 'building'}>
                  Finalize & Send to Kitchen <Send className="ml-2 h-5 w-5" />
               </Button>
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
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as string | 'all')}>
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
                           {item.allergiesNotes && item.allergiesNotes.trim() && (
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
                              {item.allergiesNotes && item.allergiesNotes.trim() && (
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
         <Card className="shadow-xl max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5"/>Payment Details</CardTitle>
                <CardDescription>Review order #{currentEditingOrderId?.slice(-6)} and complete the payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <ScrollArea className="h-[200px] border rounded-md p-3">
                        {currentOrderItems.map(item => (
                            <div key={item.id} className="flex justify-between items-start py-1.5 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium">{item.quantity}x {item.name} {item.assignedGuest && <span className="text-xs text-muted-foreground">({item.assignedGuest})</span>}</p>
                                    <p className="text-xs text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                                    {item.observations && <p className="text-xs text-blue-500 mt-0.5">Notes: {item.observations}</p>}
                                </div>
                                 {paymentSplitType === 'by_item' && (
                                    <Checkbox
                                      checked={!!itemsToSplit[item.id]}
                                      onCheckedChange={(checked) => setItemsToSplit(prev => ({...prev, [item.id]: !!checked}))}
                                      aria-label={`Select ${item.name} for separate payment`}
                                    />
                                  )}
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="font-headline">Tip Options</Label>
                        <RadioGroup value={tipMode} onValueChange={(value) => setTipMode(value as TipMode)} disabled={isCourtesy}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="default" id="tipDefault" />
                                <Label htmlFor="tipDefault">Default ({DEFAULT_TIP_PERCENTAGE}%)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="percentage" id="tipPercentage" />
                                <Label htmlFor="tipPercentage" className="flex-1">Custom Percentage</Label>
                                {tipMode === 'percentage' && <Input type="number" value={customTipPercentage} onChange={e => setCustomTipPercentage(Number(e.target.value))} className="w-20 h-8 text-sm" aria-label="Custom tip percentage" />} %
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="manual" id="tipManual" />
                                <Label htmlFor="tipManual" className="flex-1">Manual Amount</Label>
                                {tipMode === 'manual' && <Input type="number" value={manualTipAmount} onChange={e => setManualTipAmount(Number(e.target.value))} className="w-24 h-8 text-sm" aria-label="Manual tip amount" />} $
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-3">
                         <Label className="font-headline">Discount Options</Label>
                         <Select value={selectedDiscountId} onValueChange={(value) => {setSelectedDiscountId(value === 'none' ? undefined : value); setIsCourtesy(false);}} disabled={isCourtesy} >
                            <SelectTrigger aria-label="Select Discount">
                                <SelectValue placeholder="No Discount" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Discount</SelectItem>
                                {mockPresetDiscounts.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.percentage}%)</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                    </div>
                </div>
                 <Separator />
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
                    {discountAmount > 0 && !isCourtesy && <div className="flex justify-between text-destructive"><span>Discount ({discountPercentage}%):</span> <span>-${discountAmount.toFixed(2)}</span></div>}
                     {isCourtesy && <div className="flex justify-between text-green-600"><span>Courtesy Discount (100%):</span> <span>-${subtotal.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>Subtotal after Discount:</span> <span>${subtotalAfterDiscount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tip:</span> <span>${tipAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Grand Total:</span> <span>${totalAmount.toFixed(2)}</span></div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <Label className="font-headline">Payment Splitting (Mock)</Label>
                    <Select value={paymentSplitType} onValueChange={(value) => setPaymentSplitType(value as PaymentSplitType)} disabled={isCourtesy}>
                        <SelectTrigger aria-label="Payment Split Type">
                            <SelectValue placeholder="No Split" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Split</SelectItem>
                            <SelectItem value="equal">Split Equally</SelectItem>
                            <SelectItem value="by_item">Split by Item</SelectItem>
                        </SelectContent>
                    </Select>
                    {paymentSplitType === 'equal' && (
                        <div className="flex items-center gap-2">
                            <Label htmlFor="splitWays">Number of Ways:</Label>
                            <Input id="splitWays" type="number" value={paymentSplitWays} onChange={e => setPaymentSplitWays(Math.max(2, parseInt(e.target.value)))} min="2" className="w-20 h-8" />
                            <span>(Approx. ${(totalAmount / paymentSplitWays).toFixed(2)} each)</span>
                        </div>
                    )}
                    {paymentSplitType === 'by_item' && (
                        <p className="text-xs text-muted-foreground">Select items in the summary above to assign them to the current split/invoice. (Mock: This would typically involve more complex UI to manage multiple sub-invoices).</p>
                    )}
                </div>


                <Separator />

                <div className="space-y-3">
                    <Label className="font-headline">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isCourtesy}>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 border rounded-md">
                            <Input placeholder="NIT Cliente" value={dteNit} onChange={e => setDteNit(e.target.value)} aria-label="DTE NIT Cliente" />
                            <Input placeholder="NRC Cliente" value={dteNrc} onChange={e => setDteNrc(e.target.value)} aria-label="DTE NRC Cliente" />
                            <Input placeholder="Nombre Cliente" value={dteCustomerName} onChange={e => setDteCustomerName(e.target.value)} aria-label="DTE Customer Name"/>
                        </div>
                    )}
                </div>

                 <Separator />
                <div className="space-y-3">
                    <Label className="font-headline">Order Actions</Label>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isCourtesy" checked={isCourtesy} onCheckedChange={(checked) => {
                                setIsCourtesy(!!checked); 
                                if(!!checked) {
                                    setSelectedDiscountId(undefined); 
                                    setTipMode('default'); 
                                    setManualTipAmount(0); 
                                    setCustomTipPercentage(DEFAULT_TIP_PERCENTAGE);
                                    setPaymentMethod(undefined);
                                    setPaymentSplitType('none');
                                }
                            }} />
                            <Label htmlFor="isCourtesy" className="flex items-center"><CircleDollarSign className="mr-1 h-4 w-4 text-green-500"/>Mark as Courtesy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isOnHold" checked={orderIsOnHold} onCheckedChange={(checked) => setOrderIsOnHold(!!checked)} />
                            <Label htmlFor="isOnHold" className="flex items-center"><WalletCards className="mr-1 h-4 w-4 text-yellow-500"/>Hold Bill</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="disableReceiptPrint" checked={disableReceiptPrint} onCheckedChange={(checked) => setDisableReceiptPrint(!!checked)} />
                            <Label htmlFor="disableReceiptPrint" className="flex items-center"><EyeOff className="mr-1 h-4 w-4"/>No Receipt Print</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                 <Button className="w-full" size="lg" onClick={handleFinalizePayment} disabled={orderIsOnHold && !isCourtesy && currentStep === 'checkout'}>
                    <Save className="mr-2 h-5 w-5" /> {isCourtesy ? "Finalize as Courtesy" : orderIsOnHold ? "Order is ON HOLD" : "Finalize & Pay"}
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
