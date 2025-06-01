
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
import { PlusCircle, Search, Save, Trash2, Edit, List, LayoutGrid, MessageSquare, Info, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, Users, Percent, WalletCards, CircleDollarSign, EyeOff, StickyNote, Hash, UserCheck, Send, Utensils, PackagePlus, DivideSquare, TicketPercent, DollarSignIcon, Loader2 } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter, Order, AllergyTag, PaymentSplitType, DiscountPreset, RestaurantTable, MenuItemCategory, ProcessedPaymentSplit } from '@/lib/types';
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

// Define a type for a single split in the UI
interface UISplit {
  id: string; // temp ID for UI key
  amountDue: number;
  amountToPay: string; // string to allow for easier input handling
  paymentMethod?: string;
  items: OrderItem[]; // items in this split (for 'by_item')
  isPaid: boolean;
}


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
  const [newOrderItems, setNewOrderItems] = useState<(Omit<OrderItem, 'id' | 'status' | 'menuItemId'> & { tempId: string; menuItemId: string; price: number; name: string; observations?: string; assignedGuest?: string; quantity: number; isCourtesy?: boolean })[]>([]);
  // For displaying existing items when adding to active order, or items during checkout
  const [existingOrderItems, setExistingOrderItems] = useState<OrderItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [menuView, setMenuView] = useState<MenuView>('grid');
  
  const [orderType, setOrderType] = useState<OrderType>(initialOrderTypeParam || 'Dine-in');
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(initialTableIdParam || undefined);
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(1);
  const [selectedWaiter, setSelectedWaiter] = useState<string | undefined>(initialStaff[0]?.id);
  
  const [loadedOrderForCheckout, setLoadedOrderForCheckout] = useState<Order | null>(null);
  const [tipMode, setTipMode] = useState<TipMode>('default');
  const [customTipPercentage, setCustomTipPercentage] = useState<number>(DEFAULT_TIP_PERCENTAGE);
  const [manualTipAmount, setManualTipAmount] = useState<number>(0);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | undefined>(undefined);
  const [manualDiscountAmountCheckout, setManualDiscountAmountCheckout] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [dteType, setDteType] = useState<'consumidor_final' | 'credito_fiscal'>('consumidor_final');
  const [dteNit, setDteNit] = useState('');
  const [dteNrc, setDteNrc] = useState('');
  const [dteCustomerName, setDteCustomerName] = useState('');
  
  const [paymentSplitType, setPaymentSplitType] = useState<PaymentSplitType>('none');
  const [paymentSplitWays, setPaymentSplitWays] = useState<number>(2);
  const [itemsToSplitBy, setItemsToSplitBy] = useState<Record<string, boolean>>({}); // For 'by_item' selection
  const [uiSplits, setUiSplits] = useState<UISplit[]>([]); // For managing UI representation of splits

  const [isCourtesyCheckout, setIsCourtesyCheckout] = useState(false);
  const [isOnHoldCheckout, setIsOnHoldCheckout] = useState(false);
  const [disableReceiptPrintCheckout, setDisableReceiptPrintCheckout] = useState(false);
  const [itemCourtesiesCheckout, setItemCourtesiesCheckout] = useState<Record<string, boolean>>({});


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
            setLoadedOrderForCheckout(JSON.parse(JSON.stringify(orderToCheckout)));
            const itemsWithPotentialCourtesy = orderToCheckout.items.map(item => ({...item, isCourtesy: item.isCourtesy || false }));
            setExistingOrderItems(itemsWithPotentialCourtesy); 
            setItemCourtesiesCheckout(itemsWithPotentialCourtesy.reduce((acc, item) => ({...acc, [item.id]: item.isCourtesy || false}), {}));

            setOrderType(orderToCheckout.orderType);
            setSelectedWaiter(orderToCheckout.waiterId);
            setSelectedTableId(orderToCheckout.tableId);
            setNumberOfGuests(orderToCheckout.numberOfGuests);
            setSelectedDiscountId(orderToCheckout.selectedDiscountId);
            setAppliedCouponCode(orderToCheckout.appliedCouponCode || '');
            setManualDiscountAmountCheckout(orderToCheckout.manualDiscountAmount || 0);
            
            setIsCourtesyCheckout(orderToCheckout.isCourtesy || false);
            setIsOnHoldCheckout(orderToCheckout.isOnHold || false);
            setDisableReceiptPrintCheckout(orderToCheckout.disableReceiptPrint || false);
            
            setTipMode('default'); 
            setManualTipAmount(orderToCheckout.tipAmount || 0);
            if (orderToCheckout.tipAmount > 0) { 
                const subtotalForTipCalc = calculateOrderTotals(orderToCheckout).subtotal - (calculateOrderTotals(orderToCheckout).discountAmount || 0);
                const defaultTip = subtotalForTipCalc * (DEFAULT_TIP_PERCENTAGE / 100);
                if (Math.abs(orderToCheckout.tipAmount - defaultTip) < 0.01) {
                    setTipMode('default');
                } else {
                    setTipMode('manual');
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
            setExistingOrderItems([...orderToEdit.items]); 
            setOrderType(orderToEdit.orderType); 
            setSelectedTableId(orderToEdit.tableId);
            setNumberOfGuests(orderToEdit.numberOfGuests);
            setSelectedWaiter(orderToEdit.waiterId);
            setCurrentStep('building');
        } else {
            toast({ title: "Error", description: `Order ${editActiveOrderIdParam} not found for editing.`, variant: "destructive" });
            router.push('/dashboard/active-orders');
        }
    } else { 
        setLoadedOrderForCheckout(null); 
        if (typeParam) {
          setOrderType(typeParam);
          if (typeParam !== 'Dine-in') {
            setNumberOfGuests(undefined);
            setSelectedTableId(undefined); 
          } else {
            setNumberOfGuests(numberOfGuests === undefined || numberOfGuests === 0 ? 1 : numberOfGuests);
            if (tableIdParam) setSelectedTableId(tableIdParam);
          }
        } else { 
            setOrderType('Dine-in');
            setNumberOfGuests(numberOfGuests === undefined || numberOfGuests === 0 ? 1 : numberOfGuests);
            if (tableIdParam) setSelectedTableId(tableIdParam);
        }
        setCurrentStep('building');
        resetOrderFormPartialForNew();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast, pageMode, checkoutOrderIdParam, editActiveOrderIdParam]); 

  const resetOrderFormPartialForNew = () => {
    setNewOrderItems([]);
    setExistingOrderItems([]);
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedWaiter(initialStaff[0]?.id);
    // Checkout states
    setLoadedOrderForCheckout(null);
    setTipMode('default');
    setCustomTipPercentage(DEFAULT_TIP_PERCENTAGE);
    setManualTipAmount(0);
    setTipAmount(0);
    setSelectedDiscountId(undefined);
    setAppliedCouponCode('');
    setManualDiscountAmountCheckout(0);
    setPaymentMethod(undefined);
    setDteType('consumidor_final');
    setDteNit('');
    setDteNrc('');
    setDteCustomerName('');
    setPaymentSplitType('none');
    setPaymentSplitWays(2);
    setItemsToSplitBy({});
    setUiSplits([]);
    setIsCourtesyCheckout(false);
    setItemCourtesiesCheckout({});
    setIsOnHoldCheckout(false);
    setDisableReceiptPrintCheckout(false);
  }

  const resetOrderFormFull = () => {
    resetOrderFormPartialForNew(); // Resets most things

    const currentOrderTypeParam = searchParams.get('type') as OrderType | null;
    const currentTableIdParam = searchParams.get('tableId') as string | null;

    setOrderType(currentOrderTypeParam || 'Dine-in');
    if (currentOrderTypeParam === 'Dine-in') {
        setSelectedTableId(currentTableIdParam || undefined);
        setNumberOfGuests(1);
    } else {
        setSelectedTableId(undefined);
        setNumberOfGuests(undefined);
    }
    setCurrentStep('building');
    // Only replace if there are no meaningful params, otherwise keep them for fresh order from table/type link
    const hasInitialParams = currentOrderTypeParam || currentTableIdParam || checkoutOrderIdParam || editActiveOrderIdParam;
    if (!hasInitialParams) {
      router.replace('/dashboard/orders');
    }
  };

  const updateItemGuestAssignment = (tempId: string, guest: string) => {
    setNewOrderItems(prevItems => 
      prevItems.map(item => 
        item.tempId === tempId ? { ...item, assignedGuest: guest } : item
      )
    );
  };

  const addItemToOrder = (menuItem: MenuItemType) => {
    setNewOrderItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item.menuItemId === menuItem.id && 
        !item.observations && 
        (!numberOfGuests || numberOfGuests <= 1 || !item.assignedGuest || item.assignedGuest === 'Guest 1') 
      );

      if (existingItemIndex > -1 && (!numberOfGuests || numberOfGuests <=1 || !pageMode.startsWith('add_to_active'))) {
        return prevItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { 
        tempId: `temp-${Date.now().toString()}-${Math.random().toString(36).substring(7)}`,
        menuItemId: menuItem.id, 
        name: menuItem.name, 
        quantity: 1, 
        price: menuItem.price, 
        observations: '',
        isCourtesy: false,
        assignedGuest: numberOfGuests && numberOfGuests > 1 ? 'Guest 1' : undefined,
      }];
    });
  };

  const removeItemFromNewOrder = (tempId: string) => {
    setNewOrderItems(prevItems => prevItems.filter(item => item.tempId !== tempId));
  };

  const updateNewItemQuantity = (tempId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromNewOrder(tempId);
    } else {
      setNewOrderItems(prevItems => prevItems.map(item => item.tempId === tempId ? { ...item, quantity } : item));
    }
  };

  const handleSaveObservation = () => {
    if (editingObservationItem && editingObservationItem.tempId) {
      setNewOrderItems(prevItems =>
        prevItems.map(item =>
          item.tempId === editingObservationItem.tempId ? { ...item, observations: currentObservationText } : item
        )
      );
    } // No else for existing items as observations are not editable post-creation in this simplified mock
    setEditingObservationItem(null);
    setCurrentObservationText('');
  };
  
  const currentOrderItemsForCheckoutDisplay = useMemo(() => {
    if (pageMode === 'checkout_existing' && loadedOrderForCheckout) {
        return loadedOrderForCheckout.items
            .filter(i => i.status !== 'cancelled')
            .map(item => ({ ...item, isCourtesy: itemCourtesiesCheckout[item.id] || false }));
    }
    return [];
  }, [pageMode, loadedOrderForCheckout, itemCourtesiesCheckout]);

  const orderTotalsForCheckout = useMemo(() => {
    let orderForCalc: Order | Partial<Order> & { items: OrderItem[] | (Omit<OrderItem, 'id' | 'status'> & { menuItemId: string, price: number, name: string })[] } = { items: [] };

    if (pageMode === 'checkout_existing' && loadedOrderForCheckout) {
        orderForCalc = {
            ...loadedOrderForCheckout,
            items: currentOrderItemsForCheckoutDisplay, 
            isCourtesy: isCourtesyCheckout,
            selectedDiscountId: selectedDiscountId,
            appliedCouponCode: appliedCouponCode,
            manualDiscountAmount: manualDiscountAmountCheckout,
            tipAmount: 0, // Tip will be calculated separately based on this result
        };
    } else { // For new order building step or adding items to active
        orderForCalc = {
            items: newOrderItems.map(item => ({...item, id: item.tempId, status: 'pending' })), // Mock structure for calc
            isCourtesy: false, 
            tipAmount: 0,
            manualDiscountAmount: 0,
        };
    }
    return calculateOrderTotals(orderForCalc as Order); // Cast for calculation
  }, [pageMode, loadedOrderForCheckout, currentOrderItemsForCheckoutDisplay, isCourtesyCheckout, selectedDiscountId, appliedCouponCode, manualDiscountAmountCheckout, newOrderItems]);

  const [tipAmount, setTipAmount] = useState(0);

  useEffect(() => {
    if (currentStep === 'checkout' && loadedOrderForCheckout && orderTotalsForCheckout) {
      if (isCourtesyCheckout) { // If overall order is courtesy
        setTipAmount(0);
        return;
      }
      let calculatedTip = 0;
      const baseForTip = orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0);

      switch (tipMode) {
        case 'percentage':
          calculatedTip = baseForTip * (customTipPercentage / 100);
          break;
        case 'manual':
          calculatedTip = manualTipAmount < 0 ? 0 : manualTipAmount;
          break;
        case 'default':
        default:
          calculatedTip = baseForTip * (DEFAULT_TIP_PERCENTAGE / 100);
          break;
      }
      setTipAmount(calculatedTip);
    } else {
      setTipAmount(0);
    }
  }, [tipMode, orderTotalsForCheckout, customTipPercentage, manualTipAmount, isCourtesyCheckout, currentStep, loadedOrderForCheckout]);

  const finalTotalAmountForCheckout = useMemo(() => {
    if (currentStep === 'checkout' && orderTotalsForCheckout) {
      if (isCourtesyCheckout) return 0;
      return orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0) + orderTotalsForCheckout.taxAmount + tipAmount;
    }
    return orderTotalsForCheckout.totalAmount; // For building step simple total
  }, [currentStep, orderTotalsForCheckout, tipAmount, isCourtesyCheckout]);


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
        manualDiscountAmount: 0,
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
    //resetOrderFormFull(); // Reset handled by useEffect on searchParams change post-redirect
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
        isCourtesy: item.isCourtesy,
        status: 'pending',
        modifiers: [] 
    }));

    const updatedOrderItems = [...activeOrder.items, ...itemsToAdd];
    const updatedOrderResult = updateActiveOrder({ id: activeOrder.id, items: updatedOrderItems});

    if(updatedOrderResult){
        toast({title: "Items Added", description: `${newOrderItems.length} item(s) added to order #${activeOrder.id.slice(-6)}`});
        //resetOrderFormFull(); // Reset handled by useEffect on searchParams change post-redirect
        router.push(`/dashboard/active-orders/${activeOrder.id}`);
    } else {
        toast({title: "Error", description: "Failed to add items to order.", variant: "destructive"});
    }
  };

  const handleApplyCoupon = () => {
    if (!appliedCouponCode.trim()) {
        toast({ title: "No Coupon", description: "Please enter a coupon code.", variant: "default" });
        return;
    }
    const foundDiscount = mockPresetDiscounts.find(d => d.couponCode?.toLowerCase() === appliedCouponCode.toLowerCase());
    if (foundDiscount) {
        setSelectedDiscountId(foundDiscount.id);
        setManualDiscountAmountCheckout(0); // Clear manual discount if coupon is applied
        toast({ title: "Coupon Applied", description: `Discount "${foundDiscount.name}" applied.` });
    } else {
        setSelectedDiscountId(undefined); // Clear if coupon is invalid
        toast({ title: "Invalid Coupon", description: "The entered coupon code is not valid.", variant: "destructive" });
    }
  };

  const handleToggleItemCourtesyCheckout = (itemId: string) => {
    setItemCourtesiesCheckout(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleFinalizePayment = () => {
    if (!loadedOrderForCheckout) {
        toast({ title: "Error", description: "No active order selected for payment.", variant: "destructive" });
        return;
    }
    if (!isCourtesyCheckout && !isOnHoldCheckout) {
        if (paymentSplitType === 'none' && !paymentMethod) {
            toast({ title: "Payment Method Required", description: "Please select a payment method.", variant: "destructive" });
            return;
        }
        if (paymentSplitType !== 'none' && uiSplits.some(split => !split.isPaid)) {
            toast({ title: "Incomplete Split Payment", description: "All payment splits must be processed.", variant: "destructive" });
            return;
        }
    }


    if (dteType === 'credito_fiscal' && (!dteNit || !dteNrc || !dteCustomerName)) {
        toast({ title: "DTE Information Incomplete", description: "Please fill all required fields for Crédito Fiscal.", variant: "destructive" });
        return;
    }
    
    const finalStatus = isCourtesyCheckout 
        ? 'completed' 
        : isOnHoldCheckout 
            ? 'on_hold' 
            : (paymentSplitType !== 'none' && uiSplits.every(s => s.isPaid)) || (paymentSplitType === 'none' && paymentMethod)
                ? 'paid'
                : loadedOrderForCheckout.status; // Default to current if not fully paid/courtesy/onhold

    const itemsToSave = loadedOrderForCheckout.items.map(item => ({
        ...item,
        isCourtesy: itemCourtesiesCheckout[item.id] || false
    }));

    const updatedOrderPartial: Partial<Order> & { id: string } = {
        id: loadedOrderForCheckout.id,
        items: itemsToSave,
        status: finalStatus,
        paymentMethod: isCourtesyCheckout || isOnHoldCheckout ? loadedOrderForCheckout.paymentMethod : paymentSplitType === 'none' ? paymentMethod : undefined, // For splits, methods are per split
        dteType,
        dteInvoiceInfo: dteType === 'credito_fiscal' ? { nit: dteNit, nrc: dteNrc, customerName: dteCustomerName } : undefined,
        tipAmount, 
        selectedDiscountId,
        appliedCouponCode: appliedCouponCode || undefined,
        manualDiscountAmount: manualDiscountAmountCheckout || undefined,
        isCourtesy: isCourtesyCheckout,
        isOnHold: isOnHoldCheckout, 
        disableReceiptPrint: disableReceiptPrintCheckout,
        paymentSplitType,
        paymentSplitWays,
        processedSplits: uiSplits.filter(s => s.isPaid).map(s => ({ id: s.id, amountPaid: parseFloat(s.amountToPay), paymentMethod: s.paymentMethod!, itemsCovered: s.items.map(i => i.id) })),
        updatedAt: new Date().toISOString(),
    };
    
    const finalUpdatedOrder = updateActiveOrder(updatedOrderPartial);
    if (!finalUpdatedOrder) {
        toast({title: "Error", description: "Failed to finalize payment.", variant: "destructive"});
        return;
    }

    let message = `Order #${finalUpdatedOrder.id.slice(-6)} status updated to ${finalStatus}.`;
    
    toast({ title: "Payment Processed", description: message });
    
    if (loadedOrderForCheckout.orderType === 'Dine-in' && loadedOrderForCheckout.tableId && (finalUpdatedOrder.status === 'paid' || finalUpdatedOrder.status === 'completed' || finalUpdatedOrder.status === 'cancelled')) {
        const tableIndex = initialTables.findIndex(t => t.id === loadedOrderForCheckout.tableId);
        if (tableIndex > -1 && initialTables[tableIndex].currentOrderId === finalUpdatedOrder.id) {
            initialTables[tableIndex].status = 'available'; 
            initialTables[tableIndex].currentOrderId = undefined;
        }
    }

    resetOrderFormFull(); 
    router.push('/dashboard/active-orders');
  };

  // Generate UI splits based on current order state for checkout
  useEffect(() => {
    if (currentStep === 'checkout' && loadedOrderForCheckout && orderTotalsForCheckout) {
        const activeOrderItems = currentOrderItemsForCheckoutDisplay;
        const totalOrderAmount = finalTotalAmountForCheckout; // Use the grand total calculated
        let newUiSplits: UISplit[] = [];

        if (paymentSplitType === 'equal' && paymentSplitWays > 0) {
            const amountPerSplit = totalOrderAmount / paymentSplitWays;
            for (let i = 0; i < paymentSplitWays; i++) {
                newUiSplits.push({
                    id: `split-eq-${i}`,
                    amountDue: amountPerSplit,
                    amountToPay: amountPerSplit.toFixed(2),
                    items: [], // Not item specific
                    isPaid: false,
                });
            }
        } else if (paymentSplitType === 'by_item') {
            const selectedItemsForSplit = activeOrderItems.filter(item => itemsToSplitBy[item.id]);
            const remainingItems = activeOrderItems.filter(item => !itemsToSplitBy[item.id]);
            
            if (selectedItemsForSplit.length > 0) {
                 // Calculate total for selected items for this split
                const tempSplitOrder: Order = { ...loadedOrderForCheckout, items: selectedItemsForSplit, isCourtesy: false, selectedDiscountId: undefined, manualDiscountAmount: 0, tipAmount: 0 }; // simplified for split amount calc
                const totalsForSelectedItems = calculateOrderTotals(tempSplitOrder);
                // For "by_item" split, the amountDue for a split should consider that discount & tax are applied to its items.
                // Tip might be proportionally added or handled globally on remaining balance.
                // This calculation assumes the discount applies to the item if eligible, and tax is on that discounted price.
                let selectedItemsSubtotal = selectedItemsForSplit.reduce((sum, item) => sum + (item.isCourtesy ? 0 : item.price * item.quantity), 0);
                let selectedItemsDiscount = 0;
                // Re-apply discount logic only to selected items
                if (selectedDiscountId) {
                    const preset = mockPresetDiscounts.find(d => d.id === selectedDiscountId);
                    if (preset) {
                        let discountableSubtotalForItemSplit = 0;
                        if (preset.applicableItemIds && preset.applicableItemIds.length > 0) {
                            discountableSubtotalForItemSplit = selectedItemsForSplit
                                .filter(item => !item.isCourtesy && preset.applicableItemIds!.includes(item.menuItemId))
                                .reduce((sum, item) => sum + item.price * item.quantity, 0);
                        } else if (preset.applicableCategoryIds && preset.applicableCategoryIds.length > 0) {
                            const itemCategories = selectedItemsForSplit.map(item => mockMenuItemsAll.find(mi => mi.id === item.menuItemId)?.category.id);
                            discountableSubtotalForItemSplit = selectedItemsForSplit
                                .filter((item, index) => !item.isCourtesy && preset.applicableCategoryIds!.includes(itemCategories[index] || ''))
                                .reduce((sum, item) => sum + item.price * item.quantity, 0);
                        } else {
                            discountableSubtotalForItemSplit = selectedItemsSubtotal;
                        }
                        selectedItemsDiscount = discountableSubtotalForItemSplit * (preset.percentage / 100);
                    }
                } else if (manualDiscountAmountCheckout > 0 && selectedItemsForSplit.length === activeOrderItems.length) {
                    // if manual discount and all items selected for this split, apply full manual discount. Otherwise, it's complex to portion
                    selectedItemsDiscount = Math.min(selectedItemsSubtotal, manualDiscountAmountCheckout);
                }

                const selectedItemsSubtotalAfterDiscount = selectedItemsSubtotal - selectedItemsDiscount;
                const selectedItemsTax = selectedItemsSubtotalAfterDiscount * IVA_RATE;
                const selectedItemsAmountDue = selectedItemsSubtotalAfterDiscount + selectedItemsTax;


                newUiSplits.push({
                    id: 'split-items-selected',
                    amountDue: selectedItemsAmountDue,
                    amountToPay: selectedItemsAmountDue.toFixed(2),
                    items: selectedItemsForSplit,
                    isPaid: false,
                });
            }
            if (remainingItems.length > 0 && selectedItemsForSplit.length > 0) { // Only add remaining if there was a selection
                let remainingItemsSubtotal = remainingItems.reduce((sum, item) => sum + (item.isCourtesy ? 0 : item.price * item.quantity), 0);
                let remainingItemsDiscount = 0;
                 // Re-apply discount logic only to remaining items
                if (selectedDiscountId) {
                     const preset = mockPresetDiscounts.find(d => d.id === selectedDiscountId);
                    if (preset) {
                        // Similar discount logic as above, but for remainingItems
                         let discountableSubtotalForRemainingSplit = 0;
                        if (preset.applicableItemIds && preset.applicableItemIds.length > 0) {
                            discountableSubtotalForRemainingSplit = remainingItems
                                .filter(item => !item.isCourtesy && preset.applicableItemIds!.includes(item.menuItemId))
                                .reduce((sum, item) => sum + item.price * item.quantity, 0);
                        } else if (preset.applicableCategoryIds && preset.applicableCategoryIds.length > 0) {
                             const itemCategories = remainingItems.map(item => mockMenuItemsAll.find(mi => mi.id === item.menuItemId)?.category.id);
                            discountableSubtotalForRemainingSplit = remainingItems
                                .filter((item, index) => !item.isCourtesy && preset.applicableCategoryIds!.includes(itemCategories[index] || ''))
                                .reduce((sum, item) => sum + item.price * item.quantity, 0);
                        } else {
                            discountableSubtotalForRemainingSplit = remainingItemsSubtotal;
                        }
                        remainingItemsDiscount = discountableSubtotalForRemainingSplit * (preset.percentage / 100);
                    }
                } // Manual discount is harder to split proportionally for 'by_item' unless it's the last split or applies to everything.
                  // For simplicity, manual discount might be considered applied before splitting by item, affecting overall total.
                
                const remainingItemsSubtotalAfterDiscount = remainingItemsSubtotal - remainingItemsDiscount;
                const remainingItemsTax = remainingItemsSubtotalAfterDiscount * IVA_RATE;
                const remainingItemsAmountDue = remainingItemsSubtotalAfterDiscount + remainingItemsTax;

                newUiSplits.push({
                    id: 'split-items-remaining',
                    amountDue: remainingItemsAmountDue,
                    amountToPay: remainingItemsAmountDue.toFixed(2),
                    items: remainingItems,
                    isPaid: false,
                });
            }
            // If no items are selected for splitting yet, or all items are "remaining"
            if (selectedItemsForSplit.length === 0 && activeOrderItems.length > 0) { 
                const fullAmountDue = orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0) + orderTotalsForCheckout.taxAmount;
                 newUiSplits.push({
                    id: 'split-items-all',
                    amountDue: fullAmountDue, // Should be the total without tip
                    amountToPay: fullAmountDue.toFixed(2), // Tip is added at the end
                    items: activeOrderItems,
                    isPaid: false,
                });
            }
             // Distribute tip proportionally among non-paid splits or add to the last one
            const totalAmountFromSplits = newUiSplits.reduce((sum, split) => sum + parseFloat(split.amountToPay), 0);
            const expectedTotalWithoutTip = orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0) + orderTotalsForCheckout.taxAmount;
            if (Math.abs(totalAmountFromSplits - expectedTotalWithoutTip) > 0.01 && newUiSplits.length > 0) {
                 // This case suggests an issue in individual split calculation, log or adjust
                console.warn("Discrepancy in by-item split amounts vs order total pre-tip.");
            }
            // Add tip to the overall total due, it will be covered by the sum of payments
            if (newUiSplits.length > 0 && tipAmount > 0) {
                // For simplicity, just make sure the final "pay" button logic considers the grand total including tip.
                // Or, add tip to one of the splits, usually the last one or distribute.
                // For this mock, we assume the user will ensure total payment covers grandTotalAmount.
            }


        } else { // 'none'
            newUiSplits.push({
                id: 'split-none',
                amountDue: totalOrderAmount,
                amountToPay: totalOrderAmount.toFixed(2),
                items: activeOrderItems,
                isPaid: false, // Will be marked true on full payment
            });
        }
        setUiSplits(newUiSplits);
    } else {
        setUiSplits([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSplitType, paymentSplitWays, itemsToSplitBy, currentStep, loadedOrderForCheckout, currentOrderItemsForCheckoutDisplay, finalTotalAmountForCheckout, tipAmount]);


  const handlePaySplit = (splitId: string) => {
    setUiSplits(prevSplits => prevSplits.map(split => {
        if (split.id === splitId) {
            if (!split.paymentMethod) {
                toast({ title: "Payment Method Needed", description: "Select a payment method for this share.", variant: "destructive" });
                return split;
            }
            const amountToPayNum = parseFloat(split.amountToPay);
            if (isNaN(amountToPayNum) || amountToPayNum <= 0) {
                toast({ title: "Invalid Amount", description: "Enter a valid amount to pay for this share.", variant: "destructive" });
                return split;
            }
            if (amountToPayNum > split.amountDue + 0.001) { // Check for overpayment with small tolerance
                toast({ title: "Overpayment", description: `Cannot pay more than the due amount for this share ($${split.amountDue.toFixed(2)}).`, variant: "destructive" });
                return split;
            }
            // Mock payment success
            toast({ title: "Share Paid (Mock)", description: `Share ${splitId} paid $${amountToPayNum.toFixed(2)} via ${split.paymentMethod}.` });
            return { ...split, isPaid: true, amountDue: Math.max(0, split.amountDue - amountToPayNum) }; // Basic amount due update
        }
        return split;
    }));
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

  useEffect(() => {
    if (pageMode === 'checkout_existing' && loadedOrderForCheckout) {
        setIsCourtesyCheckout(loadedOrderForCheckout.isCourtesy || false);
        setIsOnHoldCheckout(loadedOrderForCheckout.isOnHold || false);
        setDisableReceiptPrintCheckout(loadedOrderForCheckout.disableReceiptPrint || false);
        setItemCourtesiesCheckout(loadedOrderForCheckout.items.reduce((acc, item) => ({...acc, [item.id]: item.isCourtesy || false }), {}));
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
              if(checkoutOrderIdParam) router.push(`/dashboard/active-orders/${checkoutOrderIdParam}`); else resetOrderFormFull();
            }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 
                {checkoutOrderIdParam ? "Back to Active Order" : "Cancel Checkout & Start New"}
            </Button>
        )}
         {(pageMode === 'add_to_active' || pageMode === 'new_order' && currentStep === 'building') && (
             <Button variant="outline" onClick={() => {
                if(editActiveOrderIdParam) router.push(`/dashboard/active-orders/${editActiveOrderIdParam}`);
                else if(searchParams.get('tableId')) router.push(`/dashboard?tableId=${searchParams.get('tableId')}`);
                else router.push('/dashboard/home');
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
                      <div key={item.tempId} className="py-2 border-b border-border last:border-b-0">
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
                                onChange={(e) => updateNewItemQuantity(item.tempId, parseInt(e.target.value))}
                                className="w-16 h-8 text-center"
                                min="0"
                                aria-label={`Quantity for ${item.name}`}
                            />
                            <Dialog open={editingObservationItem?.tempId === item.tempId} onOpenChange={(open) => { if(!open) setEditingObservationItem(null); }}>
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
                            <Button variant="ghost" size="icon" onClick={() => removeItemFromNewOrder(item.tempId)} aria-label={`Remove ${item.name}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        </div>
                        {numberOfGuests && numberOfGuests > 1 && (
                            <div className="mt-1.5 flex items-center gap-2">
                                <Label htmlFor={`guest-assign-${item.tempId}`} className="text-xs">Guest:</Label>
                                <Select 
                                    value={item.assignedGuest || `Guest 1`}
                                    onValueChange={(value) => updateItemGuestAssignment(item.tempId, value)}
                                >
                                    <SelectTrigger id={`guest-assign-${item.tempId}`} className="h-7 text-xs w-28">
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
                    <div className="flex justify-between"><span>Subtotal ({pageMode === 'add_to_active' ? 'New Items' : 'Order'}):</span> <span>${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Total Approx. ({pageMode === 'add_to_active' ? 'New Items' : 'Order'}):</span> <span>${orderTotalsForCheckout.totalAmount.toFixed(2)}</span></div>
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
                  className="flex-grow sm:flex-grow-0 sm:max-w-xs"
                  aria-label="Search menu items"
                />
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as string | 'all')}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        {currentOrderItemsForCheckoutDisplay.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-1.5 border-b last:border-b-0">
                                <div className="flex-grow">
                                    <p className={`font-medium ${item.isCourtesy ? 'line-through text-muted-foreground' : ''}`}>{item.quantity}x {item.name} {item.assignedGuest && <span className="text-xs text-muted-foreground">({item.assignedGuest})</span>}</p>
                                    <p className={`text-xs ${item.isCourtesy ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>${(item.price * item.quantity).toFixed(2)}</p>
                                    {item.observations && <p className="text-xs text-blue-500 mt-0.5">Notes: {item.observations}</p>}
                                </div>
                                 <div className="flex items-center gap-2 ml-2">
                                    {!isCourtesyCheckout && ( // Cannot make item courtesy if whole order is courtesy
                                      <Checkbox
                                        id={`courtesy-${item.id}`}
                                        checked={item.isCourtesy}
                                        onCheckedChange={() => handleToggleItemCourtesyCheckout(item.id)}
                                        aria-label={`Mark ${item.name} as courtesy`}
                                        disabled={isOnHoldCheckout}
                                      />
                                    )}
                                    {paymentSplitType === 'by_item' && (
                                      <Checkbox
                                        checked={!!itemsToSplitBy[item.id]}
                                        onCheckedChange={(checked) => setItemsToSplitBy(prev => ({...prev, [item.id]: !!checked}))}
                                        aria-label={`Select ${item.name} for separate payment`}
                                        disabled={isCourtesyCheckout || isOnHoldCheckout}
                                      />
                                    )}
                                 </div>
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
                        <Label className="font-headline text-base flex items-center"><TicketPercent className="mr-2 h-5 w-5"/>Discount Options</Label>
                         <Select value={selectedDiscountId} onValueChange={(value) => {setSelectedDiscountId(value === 'none' ? undefined : value); setAppliedCouponCode(''); setManualDiscountAmountCheckout(0);}} disabled={isCourtesyCheckout || isOnHoldCheckout} >
                            <SelectTrigger aria-label="Select Discount">
                                <SelectValue placeholder="No Preset Discount" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Preset Discount</SelectItem>
                                {mockPresetDiscounts.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.percentage}%)</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                         <div className="flex items-center gap-2">
                            <Input 
                                type="text" 
                                placeholder="Enter Coupon Code" 
                                value={appliedCouponCode} 
                                onChange={e => setAppliedCouponCode(e.target.value.toUpperCase())}
                                className="h-9 flex-grow"
                                disabled={isCourtesyCheckout || isOnHoldCheckout || !!selectedDiscountId}
                            />
                            <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={isCourtesyCheckout || isOnHoldCheckout || !!selectedDiscountId}>Apply</Button>
                         </div>
                         <div>
                            <Label htmlFor="manualDiscountAmount" className="text-sm">Manual Discount ($)</Label>
                            <Input 
                                id="manualDiscountAmount"
                                type="number" 
                                value={manualDiscountAmountCheckout} 
                                onChange={e => {setManualDiscountAmountCheckout(parseFloat(e.target.value) || 0); setSelectedDiscountId(undefined); setAppliedCouponCode('');}}
                                className="h-9 mt-1"
                                disabled={isCourtesyCheckout || isOnHoldCheckout || !!selectedDiscountId || !!appliedCouponCode}
                                placeholder="e.g., 5.00"
                            />
                         </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="font-headline text-base flex items-center"><DollarSignIcon className="mr-2 h-5 w-5"/>Tip Options</Label>
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
                </div>
                 <Separator />
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal (after item courtesies):</span> <span>${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>
                    {orderTotalsForCheckout.discountAmount > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive"><span>Total Discount Applied:</span> <span>-${orderTotalsForCheckout.discountAmount.toFixed(2)}</span></div>}
                    {isCourtesyCheckout && <div className="flex justify-between text-green-600"><span>Full Order Courtesy:</span> <span>-${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>Subtotal after All Discounts:</span> <span>${(orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0)).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tip:</span> <span>${tipAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${orderTotalsForCheckout.taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Grand Total:</span> <h1>${finalTotalAmountForCheckout.toFixed(2)}</h1></div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <Label className="font-headline text-base flex items-center"><DivideSquare className="mr-2 h-5 w-5"/>Payment Splitting</Label>
                    <Select value={paymentSplitType} onValueChange={(value) => {setPaymentSplitType(value as PaymentSplitType); setItemsToSplitBy({});}} disabled={isCourtesyCheckout || isOnHoldCheckout}>
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
                        </div>
                    )}
                    {paymentSplitType === 'by_item' && (
                        <p className="text-xs text-muted-foreground">Select items in the summary above to include them in the current itemized payment section below.</p>
                    )}

                    {uiSplits.map((split, index) => (
                        <Card key={split.id} className={`p-4 ${split.isPaid ? 'bg-green-500/10 border-green-500' : 'bg-muted/30'}`}>
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-md">
                                    {paymentSplitType === 'equal' ? `Share ${index + 1} of ${paymentSplitWays}` : paymentSplitType === 'by_item' ? `Itemized Payment ${index + 1}` : 'Full Payment'}
                                    {split.isPaid && <Badge className="ml-2 bg-green-600 text-white">Paid</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Amount Due for this share:</span>
                                    <span className="font-semibold">${split.amountDue.toFixed(2)}</span>
                                </div>
                                {!split.isPaid && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input 
                                                type="number" 
                                                value={split.amountToPay}
                                                onChange={e => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, amountToPay: e.target.value} : s))}
                                                placeholder="Amount to pay"
                                                className="h-9"
                                            />
                                            <Select 
                                                value={split.paymentMethod} 
                                                onValueChange={val => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, paymentMethod: val} : s))}
                                            >
                                                <SelectTrigger className="h-9"><SelectValue placeholder="Payment Method"/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={() => handlePaySplit(split.id)} size="sm" className="w-full mt-2">Pay This Share (Mock)</Button>
                                    </>
                                )}
                                {split.paymentMethod && split.isPaid && <p className="text-xs text-muted-foreground">Paid via: {split.paymentMethod}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>


                <Separator />

                <div className="space-y-3">
                    <Label className="font-headline text-base">DTE Invoice (El Salvador)</Label>
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
                    <Label className="font-headline text-base">Order Final Actions</Label>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isCourtesyCheckout" checked={isCourtesyCheckout} onCheckedChange={(val) => setIsCourtesyCheckout(!!val)} disabled={isOnHoldCheckout}/>
                            <Label htmlFor="isCourtesyCheckout" className="flex items-center"><CircleDollarSign className="mr-1 h-4 w-4 text-green-500"/>Mark Entire Order as Courtesy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isOnHoldCheckout" checked={isOnHoldCheckout} onCheckedChange={(val) => setIsOnHoldCheckout(!!val)} disabled={isCourtesyCheckout} />
                            <Label htmlFor="isOnHoldCheckout" className="flex items-center"><WalletCards className="mr-1 h-4 w-4 text-yellow-500"/>Hold Bill (No Payment)</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="disableReceiptPrintCheckout" checked={disableReceiptPrintCheckout} onCheckedChange={(val) => setDisableReceiptPrintCheckout(!!val)}/>
                            <Label htmlFor="disableReceiptPrintCheckout" className="flex items-center"><EyeOff className="mr-1 h-4 w-4"/>No Receipt Print</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                 <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleFinalizePayment} 
                    disabled={
                        !loadedOrderForCheckout ||
                        (!isCourtesyCheckout && !isOnHoldCheckout && paymentSplitType !== 'none' && uiSplits.some(s => !s.isPaid)) ||
                        (!isCourtesyCheckout && !isOnHoldCheckout && paymentSplitType === 'none' && !paymentMethod)
                    }
                  >
                    <Save className="mr-2 h-5 w-5" /> 
                    {isCourtesyCheckout ? "Finalize as Courtesy" : isOnHoldCheckout ? "Confirm On Hold Status" : "Finalize & Pay Order"}
                 </Button>
            </CardFooter>
         </Card>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" /><p>Loading order options...</p></div>}>
      <OrdersPageContent />
    </Suspense>
  )
}
