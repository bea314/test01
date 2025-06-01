
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
import { PlusCircle, Search, Save, Trash2, Edit, List, LayoutGrid, MessageSquare, Info, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, Users, Percent, WalletCards, CircleDollarSign, EyeOff, StickyNote, Hash, UserCheck, Send, Utensils, PackagePlus } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter, Order, AllergyTag, PaymentSplitType, DiscountPreset, RestaurantTable, MenuItemCategory } from '@/lib/types';
import { IVA_RATE, DEFAULT_TIP_PERCENTAGE } from '@/lib/constants';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { initialMenuItems as mockMenuItemsAll, mockCategories as mockMenuCategories, initialStaff, mockPresetDiscounts, initialTables, addActiveOrder, updateActiveOrder, mockActiveOrders, calculateOrderTotals } from '@/lib/mock-data';
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
  const editActiveOrderIdParam = searchParams.get('editActiveOrderId') as string | null;


  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<OrderStep>('building');
  // For new orders or adding to active order
  const [newOrderItems, setNewOrderItems] = useState<(Omit<OrderItem, 'id' | 'status' | 'menuItemId'> & { tempId: string; menuItemId: string; price: number; name: string; observations?: string; assignedGuest?: string; quantity: number })[]>([]);
  // For displaying existing items when adding to active order, or items during checkout
  const [existingOrderItems, setExistingOrderItems] = useState<OrderItem[]>([]);


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [menuView, setMenuView] = useState<MenuView>('grid');
  
  const [orderType, setOrderType] = useState<OrderType>(initialOrderTypeParam || 'Dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(initialTableIdParam || undefined);
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(1);
  const [selectedWaiter, setSelectedWaiter] = useState<string | undefined>(initialStaff[0]?.id);
  
  // Checkout specific state
  const [loadedOrderForCheckout, setLoadedOrderForCheckout] = useState<Order | null>(null);
  const [tipMode, setTipMode] = useState<TipMode>('default');
  const [customTipPercentage, setCustomTipPercentage] = useState<number>(DEFAULT_TIP_PERCENTAGE);
  const [manualTipAmount, setManualTipAmount] = useState<number>(0);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [dteType, setDteType] = useState<'consumidor_final' | 'credito_fiscal'>('consumidor_final');
  const [dteNit, setDteNit] = useState('');
  const [dteNrc, setDteNrc] = useState('');
  const [dteCustomerName, setDteCustomerName] = useState('');
  const [paymentSplitType, setPaymentSplitType] = useState<PaymentSplitType>('none');
  const [paymentSplitWays, setPaymentSplitWays] = useState<number>(2);
  const [itemsToSplit, setItemsToSplit] = useState<Record<string, boolean>>({});
  // Order Actions on checkout page, derived from loadedOrderForCheckout
  const [isCourtesyCheckout, setIsCourtesyCheckout] = useState(false);
  const [isOnHoldCheckout, setIsOnHoldCheckout] = useState(false);
  const [disableReceiptPrintCheckout, setDisableReceiptPrintCheckout] = useState(false);


  const [editingObservationItem, setEditingObservationItem] = useState< (Omit<OrderItem, 'id' | 'status' | 'menuItemId'> & { tempId?: string; menuItemId: string; price: number; name: string; observations?: string; assignedGuest?: string; quantity: number }) | null>(null);
  const [currentObservationText, setCurrentObservationText] = useState('');

  const pageMode = useMemo(() => {
    if (checkoutOrderIdParam) return 'checkout_existing';
    if (editActiveOrderIdParam) return 'add_to_active';
    return 'new_order';
  }, [checkoutOrderIdParam, editActiveOrderIdParam]);


  useEffect(() => {
    const typeParam = searchParams.get('type') as OrderType | null;
    const tableIdParam = searchParams.get('tableId') as string | null;

    if (pageMode === 'checkout_existing' && checkoutOrderIdParam) {
        const orderToCheckout = mockActiveOrders.find(o => o.id === checkoutOrderIdParam);
        if (orderToCheckout) {
            setLoadedOrderForCheckout(orderToCheckout);
            setExistingOrderItems([...orderToCheckout.items]); // For display in checkout
            setOrderType(orderToCheckout.orderType);
            setSelectedWaiter(orderToCheckout.waiterId);
            setSelectedTableId(orderToCheckout.tableId);
            setNumberOfGuests(orderToCheckout.numberOfGuests);
            setSelectedDiscountId(orderToCheckout.selectedDiscountId);
            // Load order flags into checkout-specific state
            setIsCourtesyCheckout(orderToCheckout.isCourtesy || false);
            setIsOnHoldCheckout(orderToCheckout.isOnHold || false);
            setDisableReceiptPrintCheckout(orderToCheckout.disableReceiptPrint || false);
            setTipAmount(orderToCheckout.tipAmount || 0); // Use existing tip amount or calculate default
            setTipMode('default'); // Reset tip mode each time an order is loaded for checkout
            if (orderToCheckout.tipAmount > 0) { // Attempt to infer tip mode if a tip was already set
                const defaultTip = (orderToCheckout.subtotal - (orderToCheckout.discountAmount || 0)) * (DEFAULT_TIP_PERCENTAGE / 100);
                if (Math.abs(orderToCheckout.tipAmount - defaultTip) < 0.01) { // Check if it matches default
                    setTipMode('default');
                } else {
                    // Cannot reliably distinguish between percentage and manual if it's not default
                    // So, if a tip exists and it's not default, assume manual for simplicity or set to percentage and try to derive
                    // For now, let's default to 'manual' if a non-default tip exists to show the value.
                    setTipMode('manual');
                    setManualTipAmount(orderToCheckout.tipAmount);
                }
            }


            setCurrentStep('checkout');
        } else {
            toast({ title: "Error", description: `Order ${checkoutOrderIdParam} not found for checkout.`, variant: "destructive" });
            router.push('/dashboard/active-orders');
        }
    } else if (pageMode === 'add_to_active' && editActiveOrderIdParam) {
        const orderToEdit = mockActiveOrders.find(o => o.id === editActiveOrderIdParam);
        if (orderToEdit) {
            setExistingOrderItems([...orderToEdit.items]); // Display existing items for reference
            setOrderType(orderToEdit.orderType); // Pre-fill and disable these
            setSelectedTableId(orderToEdit.tableId);
            setNumberOfGuests(orderToEdit.numberOfGuests);
            setSelectedWaiter(orderToEdit.waiterId);
            setCurrentStep('building');
        } else {
            toast({ title: "Error", description: `Order ${editActiveOrderIdParam} not found for editing.`, variant: "destructive" });
            router.push('/dashboard/active-orders');
        }
    } else { // New order mode
        setLoadedOrderForCheckout(null); // Ensure no previous checkout order is lingering
        if (typeParam) {
          setOrderType(typeParam);
          if (typeParam !== 'Dine-in') {
            setNumberOfGuests(undefined);
            setSelectedTableId(undefined); 
          } else {
            setNumberOfGuests(numberOfGuests === undefined || numberOfGuests === 0 ? 1 : numberOfGuests);
            if (tableIdParam) setSelectedTableId(tableIdParam);
          }
        } else { // Default to Dine-in if no params
            setOrderType('Dine-in');
            setNumberOfGuests(numberOfGuests === undefined || numberOfGuests === 0 ? 1 : numberOfGuests);
            if (tableIdParam) setSelectedTableId(tableIdParam);
        }
        setCurrentStep('building');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast, pageMode, checkoutOrderIdParam, editActiveOrderIdParam]); 

  const resetOrderForm = () => {
    setNewOrderItems([]);
    setExistingOrderItems([]);
    setSearchTerm('');
    setSelectedCategory('all');
    
    const currentOrderType = searchParams.get('type') as OrderType | null;
    const currentTableId = searchParams.get('tableId') as string | null;

    setOrderType(currentOrderType || 'Dine-in');
    if (currentOrderType === 'Dine-in') {
        setSelectedTableId(currentTableId || undefined);
        setNumberOfGuests(1);
    } else {
        setSelectedTableId(undefined);
        setNumberOfGuests(undefined);
    }
    setSelectedWaiter(initialStaff[0]?.id);
    
    // Checkout states
    setLoadedOrderForCheckout(null);
    setTipMode('default');
    setCustomTipPercentage(DEFAULT_TIP_PERCENTAGE);
    setManualTipAmount(0);
    setTipAmount(0);
    setSelectedDiscountId(undefined);
    setPaymentMethod(undefined);
    setDteType('consumidor_final');
    setDteNit('');
    setDteNrc('');
    setDteCustomerName('');
    setPaymentSplitType('none');
    setPaymentSplitWays(2);
    setItemsToSplit({});
    setIsCourtesyCheckout(false);
    setIsOnHoldCheckout(false);
    setDisableReceiptPrintCheckout(false);

    setCurrentStep('building');
     // Only clear query params if we are not in a checkout/edit flow that requires them
    if (!checkoutOrderIdParam && !editActiveOrderIdParam && !currentOrderType && !currentTableId) {
      router.replace('/dashboard/orders');
    }
  };

  const updateItemGuestAssignment = (tempId: string, guest: string) => {
    setNewOrderItems(prevItems => 
      prevItems.map(item => 
        (item as any).tempId === tempId ? { ...item, assignedGuest: guest } : item
      )
    );
  };

  const addItemToOrder = (menuItem: MenuItemType) => {
    setNewOrderItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item.menuItemId === menuItem.id && 
        !item.observations && 
        (!numberOfGuests || numberOfGuests <= 1 || !item.assignedGuest || item.assignedGuest === 'Guest 1') // Adjust merging logic
      );

      if (existingItemIndex > -1 && (!numberOfGuests || numberOfGuests <=1 || !pageMode.startsWith('add_to_active'))) {
        return prevItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { 
        tempId: `temp-${Date.now().toString()}-${Math.random().toString(36).substring(7)}`, // Unique temp ID for list key
        menuItemId: menuItem.id, 
        name: menuItem.name, 
        quantity: 1, 
        price: menuItem.price, 
        observations: '',
        assignedGuest: numberOfGuests && numberOfGuests > 1 ? 'Guest 1' : undefined, // Default for multi-guest
      }];
    });
  };

  const removeItemFromNewOrder = (tempId: string) => {
    setNewOrderItems(prevItems => prevItems.filter(item => (item as any).tempId !== tempId));
  };

  const updateNewItemQuantity = (tempId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromNewOrder(tempId);
    } else {
      setNewOrderItems(prevItems => prevItems.map(item => (item as any).tempId === tempId ? { ...item, quantity } : item));
    }
  };

  const handleSaveObservation = () => {
    if (editingObservationItem && (editingObservationItem as any).tempId) {
      setNewOrderItems(prevItems =>
        prevItems.map(item =>
          (item as any).tempId === (editingObservationItem as any).tempId ? { ...item, observations: currentObservationText } : item
        )
      );
      setEditingObservationItem(null);
      setCurrentObservationText('');
    }
  };
  
  const currentOrderItemsForDisplay = pageMode === 'checkout_existing' && loadedOrderForCheckout ? loadedOrderForCheckout.items.filter(i => i.status !== 'cancelled') : newOrderItems;
  
  const subtotal = useMemo(() => {
    const itemsToConsider = pageMode === 'checkout_existing' && loadedOrderForCheckout
      ? loadedOrderForCheckout.items.filter(i => i.status !== 'cancelled')
      : newOrderItems;
    return itemsToConsider.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [newOrderItems, loadedOrderForCheckout, pageMode]);
  
  const discountPercentage = useMemo(() => {
    if (isCourtesyCheckout) return 100; // isCourtesyCheckout applies at checkout step
    const preset = mockPresetDiscounts.find(d => d.id === selectedDiscountId);
    return preset ? preset.percentage : 0;
  }, [selectedDiscountId, isCourtesyCheckout]);
  
  const discountAmount = useMemo(() => {
    if (isCourtesyCheckout) return subtotal; // Full discount for courtesy

    let discountableSubtotal = subtotal;
    const preset = mockPresetDiscounts.find(d => d.id === selectedDiscountId);

    if (preset) {
        const itemsToConsider = pageMode === 'checkout_existing' && loadedOrderForCheckout 
            ? loadedOrderForCheckout.items.filter(i => i.status !== 'cancelled') 
            : newOrderItems;

        if (preset.applicableItemIds && preset.applicableItemIds.length > 0) {
            discountableSubtotal = itemsToConsider
                .filter(item => preset.applicableItemIds!.includes(item.menuItemId))
                .reduce((sum, item) => sum + item.price * item.quantity, 0);
        } else if (preset.applicableCategoryIds && preset.applicableCategoryIds.length > 0) {
            discountableSubtotal = itemsToConsider
                .filter(item => {
                    const menuItem = mockMenuItemsAll.find(mi => mi.id === item.menuItemId);
                    return menuItem && preset.applicableCategoryIds!.includes(menuItem.category.id);
                })
                .reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
        // If no specific applicability, it applies to the whole subtotal
    } else {
      return 0; // No discount selected
    }
    return discountableSubtotal * (discountPercentage / 100);
  }, [subtotal, discountPercentage, selectedDiscountId, isCourtesyCheckout, pageMode, loadedOrderForCheckout, newOrderItems]);

  const subtotalAfterDiscount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const [tipAmount, setTipAmount] = useState(0);

  useEffect(() => {
    // This effect now only runs for checkout step, based on loadedOrderForCheckout
    if (pageMode === 'checkout_existing' && loadedOrderForCheckout) {
      if (isCourtesyCheckout) {
        setTipAmount(0);
        return;
      }
      let calculatedTip = 0;
      switch (tipMode) {
        case 'percentage':
          calculatedTip = subtotalAfterDiscount * (customTipPercentage / 100);
          break;
        case 'manual':
          calculatedTip = manualTipAmount < 0 ? 0 : manualTipAmount; // Ensure manual tip isn't negative
          break;
        case 'default':
        default:
          calculatedTip = subtotalAfterDiscount * (DEFAULT_TIP_PERCENTAGE / 100);
          break;
      }
      setTipAmount(calculatedTip);
    } else {
      // For building new order, tip is 0
      setTipAmount(0);
    }
  }, [tipMode, subtotalAfterDiscount, customTipPercentage, manualTipAmount, isCourtesyCheckout, pageMode, loadedOrderForCheckout]);


  const taxAmount = useMemo(() => (isCourtesyCheckout) ? 0 : subtotalAfterDiscount * IVA_RATE, [subtotalAfterDiscount, isCourtesyCheckout]);
  
  const totalAmount = useMemo(() => {
    if (isCourtesyCheckout) return 0;
    return subtotalAfterDiscount + taxAmount + tipAmount;
  }, [subtotalAfterDiscount, taxAmount, tipAmount, isCourtesyCheckout]);


  const filteredMenuItems = mockMenuItemsAll.filter(item =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    item.availability === 'available'
  ).filter(item => selectedCategory !== 'all' ? item.category.id === selectedCategory : true);

  const handleSendNewOrderToKitchen = () => {
    if (newOrderItems.length === 0) {
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

    const orderPayload = {
        items: newOrderItems.map(item => ({ ...item, status: 'pending' as OrderItem['status']})),
        orderType,
        waiterId: selectedWaiter,
        tableId: orderType === 'Dine-in' ? selectedTableId : undefined,
        numberOfGuests: orderType === 'Dine-in' ? numberOfGuests : undefined,
        isCourtesy: false, 
        isOnHold: false,
        disableReceiptPrint: false,
        tipAmount: 0, 
    };

    const newCreatedOrder = addActiveOrder(orderPayload);
    if (!newCreatedOrder) {
        toast({title: "Error", description: "Failed to create order.", variant: "destructive"});
        return;
    }

    toast({ title: "Order Sent to Kitchen", description: `Order #${newCreatedOrder.id.slice(-6)} created.` });

    if (orderType === 'Dine-in' && selectedTableId) {
        const tableIndex = initialTables.findIndex(t => t.id === selectedTableId);
        if (tableIndex > -1) {
            initialTables[tableIndex].status = 'occupied';
            initialTables[tableIndex].currentOrderId = newCreatedOrder.id;
        }
    }
    resetOrderForm();
    router.push(`/dashboard/active-orders/${newCreatedOrder.id}`);
  };

  const handleAddItemsToActiveOrder = () => {
    if (!editActiveOrderIdParam) return;
    if (newOrderItems.length === 0) {
        toast({ title: "No New Items", description: "Please add items to append to the order.", variant: "destructive"});
        return;
    }
    const activeOrder = mockActiveOrders.find(o => o.id === editActiveOrderIdParam);
    if (!activeOrder) {
        toast({title: "Error", description: `Active order ${editActiveOrderIdParam} not found.`, variant: "destructive"});
        return;
    }
    const itemsToAdd: OrderItem[] = newOrderItems.map((item, index) => ({
        id: `oi-${activeOrder.id}-new-${Date.now()}-${index}`, 
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        observations: item.observations,
        assignedGuest: item.assignedGuest,
        status: 'pending',
        modifiers: [] 
    }));

    const updatedOrderItems = [...activeOrder.items, ...itemsToAdd];
    const updatedOrderResult = updateActiveOrder({ id: activeOrder.id, items: updatedOrderItems});

    if(updatedOrderResult){
        toast({title: "Items Added", description: `${newOrderItems.length} item(s) added to order #${activeOrder.id.slice(-6)}`});
        resetOrderForm();
        router.push(`/dashboard/active-orders/${activeOrder.id}`);
    } else {
        toast({title: "Error", description: "Failed to add items to order.", variant: "destructive"});
    }
  };


  const handleFinalizePayment = () => {
    if (!loadedOrderForCheckout) {
        toast({ title: "Error", description: "No active order selected for payment.", variant: "destructive" });
        return;
    }
    if (!paymentMethod && !isCourtesyCheckout && !isOnHoldCheckout) {
        toast({ title: "Payment Method Required", description: "Please select a payment method.", variant: "destructive" });
        return;
    }
    if (dteType === 'credito_fiscal' && (!dteNit || !dteNrc || !dteCustomerName)) {
        toast({ title: "DTE Information Incomplete", description: "Please fill all required fields for Crédito Fiscal.", variant: "destructive" });
        return;
    }
    
    const orderToUpdate = loadedOrderForCheckout;

    const finalStatus = isCourtesyCheckout 
        ? 'completed' 
        : isOnHoldCheckout 
            ? 'on_hold' 
            : 'paid';

    const updatedOrderPartial: Partial<Order> & { id: string } = {
        id: orderToUpdate.id,
        status: finalStatus,
        paymentMethod: isCourtesyCheckout || isOnHoldCheckout ? orderToUpdate.paymentMethod : paymentMethod, // Keep existing if courtesy/onhold, else update
        dteType,
        dteInvoiceInfo: dteType === 'credito_fiscal' ? { nit: dteNit, nrc: dteNrc, customerName: dteCustomerName } : undefined,
        tipAmount, 
        selectedDiscountId,
        isCourtesy: isCourtesyCheckout,
        isOnHold: isOnHoldCheckout, 
        disableReceiptPrint: disableReceiptPrintCheckout,
        updatedAt: new Date().toISOString(),
    };
    
    const finalUpdatedOrder = updateActiveOrder(updatedOrderPartial);
    if (!finalUpdatedOrder) {
        toast({title: "Error", description: "Failed to finalize payment.", variant: "destructive"});
        return;
    }

    let message = `Order #${finalUpdatedOrder.id.slice(-6)} finalized.`;
    if (paymentSplitType !== 'none') {
        message += ` Payment split: ${paymentSplitType}`;
        if (paymentSplitType === 'equal') message += ` into ${paymentSplitWays} ways.`;
    }
    if (isCourtesyCheckout) message = `Order #${finalUpdatedOrder.id.slice(-6)} Marked as Courtesy. Status: Completed.`;
    else if (isOnHoldCheckout) message = `Order #${finalUpdatedOrder.id.slice(-6)} status confirmed as On Hold.`;
    else message = `Order #${finalUpdatedOrder.id.slice(-6)} paid. Status: Paid.`


    toast({ title: "Payment Processed", description: message });
    
    if (orderToUpdate.orderType === 'Dine-in' && orderToUpdate.tableId && (finalUpdatedOrder.status === 'paid' || finalUpdatedOrder.status === 'completed' || finalUpdatedOrder.status === 'cancelled')) {
        const tableIndex = initialTables.findIndex(t => t.id === orderToUpdate.tableId);
        if (tableIndex > -1 && initialTables[tableIndex].currentOrderId === finalUpdatedOrder.id) {
            initialTables[tableIndex].status = 'available'; 
            initialTables[tableIndex].currentOrderId = undefined;
        }
    }

    resetOrderForm(); 
    router.push('/dashboard/active-orders');
  };

  const pageTitle = useMemo(() => {
    if (pageMode === 'checkout_existing') return `Checkout: Order #${checkoutOrderIdParam?.slice(-6) || 'N/A'}`;
    if (pageMode === 'add_to_active') return `Add Items to Order #${editActiveOrderIdParam?.slice(-6) || 'N/A'}`;
    return 'Build New Order';
  }, [pageMode, checkoutOrderIdParam, editActiveOrderIdParam]);

  const mainButtonText = useMemo(() => {
    if (pageMode === 'add_to_active') return 'Add Selected Items to Order';
    return 'Finalize & Send to Kitchen';
  }, [pageMode]);

  const mainButtonIcon = useMemo(() => {
    if (pageMode === 'add_to_active') return <PackagePlus className="mr-2 h-5 w-5" />;
    return <Send className="mr-2 h-5 w-5" />;
  }, [pageMode]);

  const handleMainButtonClick = () => {
    if (pageMode === 'add_to_active') {
        handleAddItemsToActiveOrder();
    } else {
        handleSendNewOrderToKitchen();
    }
  };

  // Effect to set courtesy/onhold/disablePrint flags from loadedOrderForCheckout
  useEffect(() => {
    if (pageMode === 'checkout_existing' && loadedOrderForCheckout) {
        setIsCourtesyCheckout(loadedOrderForCheckout.isCourtesy || false);
        setIsOnHoldCheckout(loadedOrderForCheckout.isOnHold || false);
        setDisableReceiptPrintCheckout(loadedOrderForCheckout.disableReceiptPrint || false);
    }
  }, [loadedOrderForCheckout, pageMode]);


  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          {pageTitle}
        </h1>
        {currentStep === 'checkout' && (
            <Button variant="outline" onClick={() => { 
              if(checkoutOrderIdParam) router.push(`/dashboard/active-orders/${checkoutOrderIdParam}`); else resetOrderForm();
            }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                {checkoutOrderIdParam ? "Back to Active Order" : "Cancel Checkout & Start New"}
            </Button>
        )}
         {(pageMode === 'add_to_active' || pageMode === 'new_order' && currentStep === 'building') && (
             <Button variant="outline" onClick={() => {
                if(editActiveOrderIdParam) router.push(`/dashboard/active-orders/${editActiveOrderIdParam}`);
                else if(searchParams.get('tableId')) router.push(`/dashboard?tableId=${searchParams.get('tableId')}`); // Go back to table view if came from there
                else router.push('/dashboard/home'); // Default back
             }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                {editActiveOrderIdParam ? "Back to Order Details" : "Cancel Order"}
            </Button>
         )}
      </div>
      
      {currentStep === 'building' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-xl lg:order-1">
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><ShoppingCart className="mr-2 h-5 w-5"/>{pageMode === 'add_to_active' ? 'New Items for Order' : 'Current Order'}</CardTitle>
              {pageMode !== 'add_to_active' && (
                <>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                      <Select 
                        value={orderType} 
                        onValueChange={(value) => {
                          const newOrderType = value as OrderType;
                          setOrderType(newOrderType);
                          if (newOrderType !== 'Dine-in') {
                            setNumberOfGuests(undefined);
                            setSelectedTableId(undefined);
                          } else if (numberOfGuests === undefined || numberOfGuests === 0) {
                            setNumberOfGuests(1);
                          }
                      }}
                      disabled={pageMode === 'add_to_active'}
                      >
                          <SelectTrigger aria-label="Order Type">
                              <SelectValue placeholder="Order Type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Dine-in">Dine-in</SelectItem>
                              <SelectItem value="Takeout">Takeout</SelectItem>
                              <SelectItem value="Delivery">Delivery</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select value={selectedWaiter} onValueChange={setSelectedWaiter} disabled={pageMode === 'add_to_active'}>
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
                        <Select value={selectedTableId} onValueChange={setSelectedTableId} disabled={pageMode === 'add_to_active'}>
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
                            disabled={pageMode === 'add_to_active'}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-36rem)] lg:h-[calc(100vh-32rem)]"> 
              <CardContent className="flex flex-col justify-between ">
                  {pageMode === 'add_to_active' && existingOrderItems.length > 0 && (
                    <div className="mb-4 p-3 border rounded-md bg-muted/50">
                        <h5 className="text-sm font-semibold mb-2 text-muted-foreground">Existing Items in Order #{editActiveOrderIdParam?.slice(-6)}:</h5>
                        <ScrollArea className="max-h-32">
                            <ul className="text-xs space-y-1">
                            {existingOrderItems.map(item => (
                                <li key={item.id} className={item.status === 'cancelled' ? 'line-through opacity-60' : ''}>
                                    {item.quantity}x {item.name} {item.assignedGuest ? `(${item.assignedGuest})` : ''}
                                    {item.status === 'cancelled' ? ' (Cancelled)' : ''}
                                </li>
                            ))}
                            </ul>
                        </ScrollArea>
                    </div>
                  )}
                  <ScrollArea className="flex-grow h-[200px] pr-2 mb-4">
                  {newOrderItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-10">No {pageMode === 'add_to_active' ? 'new' : ''} items in order.</p>
                  ) : (
                      newOrderItems.map(item => (
                      <div key={(item as any).tempId} className="py-2 border-b border-border last:border-b-0">
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
                                onChange={(e) => updateNewItemQuantity((item as any).tempId, parseInt(e.target.value))}
                                className="w-16 h-8 text-center"
                                min="0"
                                aria-label={`Quantity for ${item.name}`}
                            />
                            <Dialog open={editingObservationItem?.tempId === (item as any).tempId} onOpenChange={(open) => { if(!open) setEditingObservationItem(null); }}>
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
                            <Button variant="ghost" size="icon" onClick={() => removeItemFromNewOrder((item as any).tempId)} aria-label={`Remove ${item.name}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        </div>
                        {numberOfGuests && numberOfGuests > 1 && (
                            <div className="mt-1.5 flex items-center gap-2">
                                <Label htmlFor={`guest-assign-${(item as any).tempId}`} className="text-xs">Guest:</Label>
                                <Select 
                                    value={item.assignedGuest || `Guest 1`}
                                    onValueChange={(value) => updateItemGuestAssignment((item as any).tempId, value)}
                                >
                                    <SelectTrigger id={`guest-assign-${(item as any).tempId}`} className="h-7 text-xs w-28">
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
                    <div className="flex justify-between"><span>Subtotal ({pageMode === 'add_to_active' ? 'New Items' : 'Order'}):</span> <span>${newOrderItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Total Approx. ({pageMode === 'add_to_active' ? 'New Items' : 'Order'}):</span> <span>${(newOrderItems.reduce((s, i) => s + i.price * i.quantity, 0) * (1 + IVA_RATE)).toFixed(2)}</span></div>
                  </div>
              </CardContent>
            </ScrollArea>
            <CardFooter className="flex-col gap-2 mt-auto border-t pt-4">
               <Button className="w-full" size="lg" onClick={handleMainButtonClick} >
                  {mainButtonIcon} {mainButtonText}
               </Button>
            </CardFooter>
          </Card>
          
          <Card className="lg:col-span-2 shadow-xl lg:order-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                      <CardTitle className="font-headline flex items-center"><Utensils className="mr-2 h-5 w-5"/>Menu Items</CardTitle>
                      <CardDescription>Select items to add. Search by name or item code.</CardDescription>
                  </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
                <Input 
                  placeholder="Search items by name or code..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  aria-label="Search menu items"
                />
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as string | 'all')}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {mockMenuCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <div className="flex gap-2 ml-auto">
                    <Button variant={menuView === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setMenuView('grid')} aria-label="Grid view">
                        <LayoutGrid className="h-4 w-4"/>
                    </Button>
                    <Button variant={menuView === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setMenuView('list')} aria-label="List view">
                        <List className="h-4 w-4"/>
                    </Button>
                </div>
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

      {currentStep === 'checkout' && loadedOrderForCheckout && (
         <Card className="shadow-xl max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5"/>Payment Details</CardTitle>
                <CardDescription>Review order #{loadedOrderForCheckout.id.slice(-6)} and complete the payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <ScrollArea className="h-[200px] border rounded-md p-3">
                        {currentOrderItemsForDisplay.map(item => (
                            <div key={item.id || (item as any).tempId} className="flex justify-between items-start py-1.5 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium">{item.quantity}x {item.name} {item.assignedGuest && <span className="text-xs text-muted-foreground">({item.assignedGuest})</span>}</p>
                                    <p className="text-xs text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                                    {item.observations && <p className="text-xs text-blue-500 mt-0.5">Notes: {item.observations}</p>}
                                </div>
                                 {paymentSplitType === 'by_item' && (
                                    <Checkbox
                                      checked={!!itemsToSplit[item.id || (item as any).tempId]}
                                      onCheckedChange={(checked) => setItemsToSplit(prev => ({...prev, [item.id || (item as any).tempId]: !!checked}))}
                                      aria-label={`Select ${item.name} for separate payment`}
                                      disabled={isCourtesyCheckout || isOnHoldCheckout}
                                    />
                                  )}
                            </div>
                        ))}
                         {loadedOrderForCheckout.items.filter(i => i.status === 'cancelled').length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-muted-foreground font-semibold mb-1">Cancelled Items:</p>
                                {loadedOrderForCheckout.items.filter(i => i.status === 'cancelled').map(item => (
                                    <p key={item.id} className="text-xs text-destructive line-through">{item.quantity}x {item.name}</p>
                                ))}
                            </div>
                         )}
                    </ScrollArea>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="font-headline">Tip Options</Label>
                        <RadioGroup value={tipMode} onValueChange={(value) => setTipMode(value as TipMode)} disabled={isCourtesyCheckout || isOnHoldCheckout}>
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
                         <Select value={selectedDiscountId} onValueChange={(value) => {setSelectedDiscountId(value === 'none' ? undefined : value);}} disabled={isCourtesyCheckout || isOnHoldCheckout} >
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
                    {discountAmount > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive"><span>Discount ({discountPercentage}%):</span> <span>-${discountAmount.toFixed(2)}</span></div>}
                     {isCourtesyCheckout && <div className="flex justify-between text-green-600"><span>Courtesy Discount (100%):</span> <span>-${subtotal.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>Subtotal after Discount:</span> <span>${subtotalAfterDiscount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tip:</span> <span>${tipAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Grand Total:</span> <h1>${totalAmount.toFixed(2)}</h1></div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <Label className="font-headline">Payment Splitting (Mock)</Label>
                    <Select value={paymentSplitType} onValueChange={(value) => setPaymentSplitType(value as PaymentSplitType)} disabled={isCourtesyCheckout || isOnHoldCheckout}>
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
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isCourtesyCheckout || isOnHoldCheckout}>
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
                    <Label className="font-headline">Order Actions (Status from Active Order)</Label>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isCourtesyCheckout" checked={isCourtesyCheckout} disabled={true} />
                            <Label htmlFor="isCourtesyCheckout" className="flex items-center"><CircleDollarSign className="mr-1 h-4 w-4 text-green-500"/>Is Courtesy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isOnHoldCheckout" checked={isOnHoldCheckout} disabled={true} />
                            <Label htmlFor="isOnHoldCheckout" className="flex items-center"><WalletCards className="mr-1 h-4 w-4 text-yellow-500"/>Is On Hold</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="disableReceiptPrintCheckout" checked={disableReceiptPrintCheckout} disabled={true}/>
                            <Label htmlFor="disableReceiptPrintCheckout" className="flex items-center"><EyeOff className="mr-1 h-4 w-4"/>No Receipt Print</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                 <Button className="w-full" size="lg" onClick={handleFinalizePayment} disabled={!loadedOrderForCheckout || (isCourtesyCheckout ? false : isOnHoldCheckout ? false : !paymentMethod)}>
                    <Save className="mr-2 h-5 w-5" /> 
                    {isCourtesyCheckout ? "Finalize as Courtesy" : isOnHoldCheckout ? "Confirm On Hold Status" : "Finalize & Pay"}
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

