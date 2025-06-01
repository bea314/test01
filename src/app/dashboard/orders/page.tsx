
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
import { PlusCircle, Search, Save, Trash2, Edit, List, LayoutGrid, MessageSquare, Info, ArrowRight, ArrowLeft, ShoppingCart, CreditCard, Users, Percent, WalletCards, CircleDollarSign, EyeOff, StickyNote, Hash, UserCheck, Send, Utensils, PackagePlus, DivideSquare, TicketPercent, DollarSignIcon, Loader2, FileText, CheckSquare, MinusCircle } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem, MenuItem as MenuItemType, OrderType, Waiter, Order, AllergyTag, PaymentSplitType, DiscountPreset, RestaurantTable, MenuItemCategory, ProcessedPaymentSplit, DTEInvoiceInfo } from '@/lib/types';
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

type CheckoutSubStep = 'summary_and_courtesy' | 'discounts_and_tip' | 'payment_splitting' | 'final_review_and_pay';


// Define a type for a single split in the UI
interface UISplit {
  id: string; // temp ID for UI key
  amountDue: number;
  amountToPay: string; // string to allow for easier input handling
  paymentMethod?: string;
  items: OrderItem[]; // items in this split (for 'by_item')
  isPaid: boolean;
  dteType?: 'consumidor_final' | 'credito_fiscal';
  dteInvoiceInfo?: DTEInvoiceInfo;
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
  const [currentCheckoutSubStep, setCurrentCheckoutSubStep] = useState<CheckoutSubStep>('summary_and_courtesy');

  const [newOrderItems, setNewOrderItems] = useState<(Omit<OrderItem, 'id' | 'status' | 'menuItemId'> & { tempId: string; menuItemId: string; price: number; name: string; observations?: string; assignedGuest?: string; quantity: number; isCourtesy?: boolean })[]>([]);
  const [existingOrderItems, setExistingOrderItems] = useState<OrderItem[]>([]);
  const [coveredItemIdsForSplitting, setCoveredItemIdsForSplitting] = useState<string[]>([]);


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
  const [overallPaymentMethod, setOverallPaymentMethod] = useState<string | undefined>(undefined); 
  const [overallDteType, setOverallDteType] = useState<'consumidor_final' | 'credito_fiscal'>('consumidor_final'); 
  const [overallDteNit, setOverallDteNit] = useState(''); 
  const [overallDteNrc, setOverallDteNrc] = useState(''); 
  const [overallDteCustomerName, setOverallDteCustomerName] = useState(''); 
  
  const [paymentSplitType, setPaymentSplitType] = useState<PaymentSplitType>('none');
  const [paymentSplitWays, setPaymentSplitWays] = useState<number>(2);
  const [itemsToSplitBy, setItemsToSplitBy] = useState<Record<string, boolean>>({}); 
  const [uiSplits, setUiSplits] = useState<UISplit[]>([]); 

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

  const [tipAmount, setTipAmount] = useState(0);

  const currentOrderItemsForCheckoutDisplay = useMemo(() => {
    if (pageMode === 'checkout_existing' && loadedOrderForCheckout) {
        return loadedOrderForCheckout.items
            .filter(i => i.status !== 'cancelled')
            .map(item => ({ ...item, isCourtesy: itemCourtesiesCheckout[item.id] || loadedOrderForCheckout.isCourtesy || item.isCourtesy || false }));
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
            tipAmount: 0, 
        };
    } else { 
        orderForCalc = {
            items: newOrderItems.map(item => ({...item, id: item.tempId, status: 'pending' })), 
            isCourtesy: false, 
            tipAmount: 0,
            manualDiscountAmount: 0,
        };
    }
    return calculateOrderTotals(orderForCalc as Order); 
  }, [pageMode, loadedOrderForCheckout, currentOrderItemsForCheckoutDisplay, isCourtesyCheckout, selectedDiscountId, appliedCouponCode, manualDiscountAmountCheckout, newOrderItems]);
  
  const finalTotalAmountForCheckout = useMemo(() => {
    if (currentStep === 'checkout' && orderTotalsForCheckout) {
      if (isCourtesyCheckout) return 0; 
      return orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0) + orderTotalsForCheckout.taxAmount + tipAmount;
    }
    return orderTotalsForCheckout?.totalAmount || 0; 
  }, [currentStep, orderTotalsForCheckout, tipAmount, isCourtesyCheckout]);

  const isOrderFullyPaid = useMemo(() => {
    if (!loadedOrderForCheckout || isCourtesyCheckout || isOnHoldCheckout) return false; 
    const totalPaidInSplits = uiSplits.filter(s => s.isPaid).reduce((sum, s) => sum + parseFloat(s.amountToPay || '0'), 0);
    const numericFinalTotal = typeof finalTotalAmountForCheckout === 'number' ? finalTotalAmountForCheckout : 0;
    return totalPaidInSplits >= numericFinalTotal - 0.001; 
  }, [loadedOrderForCheckout, uiSplits, finalTotalAmountForCheckout, isCourtesyCheckout, isOnHoldCheckout]);


  useEffect(() => {
    if (currentStep === 'checkout' && loadedOrderForCheckout && orderTotalsForCheckout) {
      if (isCourtesyCheckout) { 
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


  useEffect(() => {
    const typeParam = searchParams.get('type') as OrderType | null;
    const tableIdParam = searchParams.get('tableId') as string | null;
    setCoveredItemIdsForSplitting([]); 
    setCurrentCheckoutSubStep('summary_and_courtesy');


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
            setOverallPaymentMethod(orderToCheckout.paymentMethod);
            setOverallDteType(orderToCheckout.dteType || 'consumidor_final');
            setOverallDteNit(orderToCheckout.dteInvoiceInfo?.nit || '');
            setOverallDteNrc(orderToCheckout.dteInvoiceInfo?.nrc || '');
            setOverallDteCustomerName(orderToCheckout.dteInvoiceInfo?.customerName || '');

            setPaymentSplitType(orderToCheckout.paymentSplitType || 'none');
            setPaymentSplitWays(orderToCheckout.paymentSplitWays || 2);
            if (orderToCheckout.processedSplits && orderToCheckout.processedSplits.length > 0) {
                const reconstructedSplits = orderToCheckout.processedSplits.map(ps => ({
                    id: ps.id,
                    amountDue: ps.amountPaid, 
                    amountToPay: ps.amountPaid.toFixed(2),
                    paymentMethod: ps.paymentMethod,
                    items: orderToCheckout.items.filter(item => ps.itemsCovered?.includes(item.id)),
                    isPaid: true,
                    dteType: ps.dteType,
                    dteInvoiceInfo: ps.dteInvoiceInfo,
                }));
                setUiSplits(reconstructedSplits);
                const paidItemIds = reconstructedSplits.flatMap(s => s.items.map(i => i.id));
                setCoveredItemIdsForSplitting(paidItemIds);
            } else {
                setUiSplits([]);
            }
            setCurrentStep('checkout');
        } else {
            toast({ title: "Error", description: `Order ${checkoutOrderIdParam} not found for checkout.`, variant: "destructive" });
            router.push('/dashboard/active-orders');
        }
    } else if (pageMode === 'add_to_active' && editActiveOrderIdParam) {
        const orderToEdit = mockActiveOrders.find(o => o.id === editActiveOrderIdParam);
        if (orderToEdit) {
            setLoadedOrderForCheckout(null); 
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
    setLoadedOrderForCheckout(null);
    setTipMode('default');
    setCustomTipPercentage(DEFAULT_TIP_PERCENTAGE);
    setManualTipAmount(0);
    setTipAmount(0);
    setSelectedDiscountId(undefined);
    setAppliedCouponCode('');
    setManualDiscountAmountCheckout(0);
    setOverallPaymentMethod(undefined);
    setOverallDteType('consumidor_final');
    setOverallDteNit('');
    setOverallDteNrc('');
    setOverallDteCustomerName('');
    setPaymentSplitType('none');
    setPaymentSplitWays(2);
    setItemsToSplitBy({});
    setUiSplits([]);
    setCoveredItemIdsForSplitting([]);
    setIsCourtesyCheckout(false);
    setItemCourtesiesCheckout({});
    setIsOnHoldCheckout(false);
    setDisableReceiptPrintCheckout(false);
    setCurrentCheckoutSubStep('summary_and_courtesy');
  }

  const resetOrderFormFull = () => {
    resetOrderFormPartialForNew(); 
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
    setCurrentCheckoutSubStep('summary_and_courtesy');
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
    } 
    setEditingObservationItem(null);
    setCurrentObservationText('');
  };
  

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
        toast({ title: "Coupon Applied", description: `Discount "${foundDiscount.name}" applied.` });
    } else {
        toast({ title: "Invalid Coupon", description: "The entered coupon code is not valid.", variant: "destructive" });
    }
  };

  const handleRemoveAllDiscounts = () => {
    setSelectedDiscountId(undefined);
    setAppliedCouponCode('');
    setManualDiscountAmountCheckout(0);
    toast({ title: "Discounts Cleared", description: "All applied discounts have been removed." });
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
        if (paymentSplitType === 'none' && !overallPaymentMethod && !isOrderFullyPaid) {
            toast({ title: "Payment Method Required", description: "Please select a payment method for full payment.", variant: "destructive" });
            return;
        }
        if (paymentSplitType !== 'none' && uiSplits.some(split => !split.isPaid)) {
            toast({ title: "Incomplete Split Payment", description: "All payment splits must be processed.", variant: "destructive" });
            return;
        }
         if (paymentSplitType !== 'none' && !isOrderFullyPaid) {
            toast({ title: "Incomplete Payment", description: "The total paid amount does not cover the grand total.", variant: "destructive" });
            return;
        }
    }


    if (paymentSplitType === 'none' && overallDteType === 'credito_fiscal' && (!overallDteNit || !overallDteNrc || !overallDteCustomerName)) {
        toast({ title: "DTE Information Incomplete", description: "Please fill all required fields for Crédito Fiscal (full payment).", variant: "destructive" });
        return;
    }
     if (paymentSplitType !== 'none' && uiSplits.some(s => s.isPaid && s.dteType === 'credito_fiscal' && (!s.dteInvoiceInfo?.nit || !s.dteInvoiceInfo?.nrc || !s.dteInvoiceInfo?.customerName))) {
        toast({ title: "DTE Information Incomplete for a Split", description: "Please fill all required DTE fields for paid Crédito Fiscal splits.", variant: "destructive" });
        return;
    }
    
    const finalStatus = isCourtesyCheckout 
        ? 'completed' 
        : isOnHoldCheckout 
            ? 'on_hold' 
            : isOrderFullyPaid || (paymentSplitType === 'none' && overallPaymentMethod)
                ? 'paid'
                : loadedOrderForCheckout.status; 

    const itemsToSave = loadedOrderForCheckout.items.map(item => ({
        ...item,
        isCourtesy: itemCourtesiesCheckout[item.id] || false
    }));

    const processedSplitsToSave: ProcessedPaymentSplit[] = uiSplits
        .filter(s => s.isPaid)
        .map(s => ({ 
            id: s.id, 
            amountPaid: parseFloat(s.amountToPay), 
            paymentMethod: s.paymentMethod!, 
            itemsCovered: s.items.map(i => i.id),
            dteType: s.dteType,
            dteInvoiceInfo: s.dteType === 'credito_fiscal' ? s.dteInvoiceInfo : undefined
        }));

    const updatedOrderPartial: Partial<Order> & { id: string } = {
        id: loadedOrderForCheckout.id,
        items: itemsToSave,
        status: finalStatus,
        paymentMethod: isCourtesyCheckout || isOnHoldCheckout || paymentSplitType !== 'none' ? undefined : overallPaymentMethod, 
        dteType: isCourtesyCheckout || isOnHoldCheckout || paymentSplitType !== 'none' ? undefined : overallDteType,
        dteInvoiceInfo: isCourtesyCheckout || isOnHoldCheckout || paymentSplitType !== 'none' ? undefined : (overallDteType === 'credito_fiscal' ? { nit: overallDteNit, nrc: overallDteNrc, customerName: overallDteCustomerName } : undefined),
        tipAmount, 
        selectedDiscountId,
        appliedCouponCode: appliedCouponCode || undefined,
        manualDiscountAmount: manualDiscountAmountCheckout || undefined,
        isCourtesy: isCourtesyCheckout,
        isOnHold: isOnHoldCheckout, 
        disableReceiptPrint: disableReceiptPrintCheckout,
        paymentSplitType: paymentSplitType === 'none' ? undefined : paymentSplitType,
        paymentSplitWays: paymentSplitType === 'equal' ? paymentSplitWays : undefined,
        processedSplits: processedSplitsToSave.length > 0 ? processedSplitsToSave : undefined,
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


  useEffect(() => {
    if (currentStep === 'checkout' && loadedOrderForCheckout && orderTotalsForCheckout) {
        const activeOrderItemsUncovered = currentOrderItemsForCheckoutDisplay.filter(item => !coveredItemIdsForSplitting.includes(item.id) && !item.isCourtesy);
        const totalOrderAmount = finalTotalAmountForCheckout; 
        let newUiSplits: UISplit[] = [...uiSplits.filter(s => s.isPaid)]; 

        if (isOrderFullyPaid || isCourtesyCheckout || isOnHoldCheckout) {
            setItemsToSplitBy({}); 
            setUiSplits(prevSplits => prevSplits.map(s => ({...s, isPaid: true})));
            return;
        }

        if (paymentSplitType === 'equal' && paymentSplitWays > 0) {
            const remainingAmountToSplit = totalOrderAmount - newUiSplits.reduce((sum, s) => sum + parseFloat(s.amountToPay),0);
            const numberOfRemainingSplits = paymentSplitWays - newUiSplits.length;
            if (numberOfRemainingSplits > 0) {
                const amountPerRemainingSplit = remainingAmountToSplit / numberOfRemainingSplits;
                 for (let i = 0; i < numberOfRemainingSplits; i++) {
                    newUiSplits.push({
                        id: `split-eq-${newUiSplits.length}-${Date.now()}`,
                        amountDue: amountPerRemainingSplit,
                        amountToPay: amountPerRemainingSplit.toFixed(2),
                        items: [], 
                        isPaid: false,
                        dteType: 'consumidor_final'
                    });
                }
            }
        } else if (paymentSplitType === 'by_item') {
            const itemsSelectedForThisSplitCandidates = activeOrderItemsUncovered.filter(item => itemsToSplitBy[item.id]);
            
            if (itemsSelectedForThisSplitCandidates.length > 0) {
                let itemsSubtotalThisSplit = itemsSelectedForThisSplitCandidates.reduce((sum, item) => sum + (item.isCourtesy ? 0 : item.price * item.quantity), 0);
                
                let itemsDiscountThisSplit = 0;
                const totalSubtotalOfAllUncoveredNonCourtesyItems = activeOrderItemsUncovered.filter(item => !item.isCourtesy).reduce((sum, item) => sum + (item.price * item.quantity), 0);

                if (totalSubtotalOfAllUncoveredNonCourtesyItems > 0 && orderTotalsForCheckout.discountAmount > 0) {
                    const discountableAmountOfSelectedItems = itemsSelectedForThisSplitCandidates
                        .filter(item => !item.isCourtesy)
                        .reduce((sum, item) => sum + item.price * item.quantity, 0);
                    
                    itemsDiscountThisSplit = (discountableAmountOfSelectedItems / totalSubtotalOfAllUncoveredNonCourtesyItems) * orderTotalsForCheckout.discountAmount;
                }
                itemsDiscountThisSplit = Math.min(itemsDiscountThisSplit, itemsSubtotalThisSplit); 

                const itemsSubtotalAfterDiscountThisSplit = itemsSubtotalThisSplit - itemsDiscountThisSplit;
                const itemsTaxThisSplit = itemsSubtotalAfterDiscountThisSplit * IVA_RATE;
                
                let itemsTipThisSplit = 0;
                const totalSubtotalAfterAllDiscountsForAllUncoveredNonCourtesy = activeOrderItemsUncovered
                    .filter(item => !item.isCourtesy)
                    .reduce((sum, item) => sum + item.price * item.quantity, 0) - (orderTotalsForCheckout.discountAmount || 0);

                if (totalSubtotalAfterAllDiscountsForAllUncoveredNonCourtesy > 0 && tipAmount > 0) {
                    itemsTipThisSplit = (itemsSubtotalAfterDiscountThisSplit / totalSubtotalAfterAllDiscountsForAllUncoveredNonCourtesy) * tipAmount;
                }
                
                const itemsAmountDueWithTaxAndTipThisSplit = itemsSubtotalAfterDiscountThisSplit + itemsTaxThisSplit + itemsTipThisSplit;
                
                const existingUnpaidSplitForTheseItemsIndex = newUiSplits.findIndex(s => 
                    !s.isPaid && 
                    s.items.length === itemsSelectedForThisSplitCandidates.length &&
                    s.items.every(it => itemsSelectedForThisSplitCandidates.some(selIt => selIt.id === it.id))
                );

                if (existingUnpaidSplitForTheseItemsIndex === -1) {
                     newUiSplits.push({
                        id: `split-item-${Date.now()}`,
                        amountDue: itemsAmountDueWithTaxAndTipThisSplit,
                        amountToPay: itemsAmountDueWithTaxAndTipThisSplit.toFixed(2),
                        items: itemsSelectedForThisSplitCandidates,
                        isPaid: false,
                        dteType: 'consumidor_final'
                    });
                } else {
                    newUiSplits[existingUnpaidSplitForTheseItemsIndex].amountDue = itemsAmountDueWithTaxAndTipThisSplit;
                    newUiSplits[existingUnpaidSplitForTheseItemsIndex].amountToPay = itemsAmountDueWithTaxAndTipThisSplit.toFixed(2);
                    newUiSplits[existingUnpaidSplitForTheseItemsIndex].items = itemsSelectedForThisSplitCandidates;
                }
            } else if (newUiSplits.some(s => !s.isPaid && s.items.length > 0 && Object.keys(itemsToSplitBy).length === 0)) {
                newUiSplits = newUiSplits.filter(s => s.isPaid || s.items.length === 0 || Object.keys(itemsToSplitBy).some(key => itemsToSplitBy[key]));
            }

        } else { 
             if (newUiSplits.filter(s => !s.isPaid).length === 0 && !isOrderFullyPaid) { 
                newUiSplits.push({
                    id: 'split-none-full',
                    amountDue: totalOrderAmount,
                    amountToPay: totalOrderAmount.toFixed(2),
                    items: currentOrderItemsForCheckoutDisplay.filter(item => !item.isCourtesy), 
                    isPaid: false,
                });
            } else if (newUiSplits.length === 1 && newUiSplits[0].id === 'split-none-full' && !newUiSplits[0].isPaid) {
                newUiSplits[0].amountDue = totalOrderAmount;
                newUiSplits[0].amountToPay = totalOrderAmount.toFixed(2);
            }
        }
        setUiSplits(newUiSplits);
    } else {
        setUiSplits([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSplitType, paymentSplitWays, itemsToSplitBy, currentStep, loadedOrderForCheckout, currentOrderItemsForCheckoutDisplay, finalTotalAmountForCheckout, tipAmount, coveredItemIdsForSplitting, isOrderFullyPaid, isCourtesyCheckout, isOnHoldCheckout, orderTotalsForCheckout]);


  const handlePaySplit = (splitId: string) => {
    setUiSplits(prevSplits => prevSplits.map(split => {
        if (split.id === splitId && !split.isPaid) {
            if (!split.paymentMethod) {
                toast({ title: "Payment Method Needed", description: "Select a payment method for this share.", variant: "destructive" });
                return split;
            }
            const amountToPayNum = parseFloat(split.amountToPay);
            if (isNaN(amountToPayNum) || amountToPayNum <= 0) {
                toast({ title: "Invalid Amount", description: "Enter a valid amount to pay for this share.", variant: "destructive" });
                return split;
            }
            
            if (amountToPayNum > split.amountDue + 0.01) {
                toast({ title: "Overpayment Warning", description: `Payment ($${amountToPayNum.toFixed(2)}) exceeds due amount for this share ($${split.amountDue.toFixed(2)}). Please adjust or confirm.`, variant: "default" });
                 // For prototype, allow overpayment on a share if user proceeds
            }
            
            if (split.dteType === 'credito_fiscal' && (!split.dteInvoiceInfo?.nit || !split.dteInvoiceInfo?.nrc || !split.dteInvoiceInfo?.customerName)) {
                 toast({ title: "DTE Info Missing", description: "Please fill NIT, NRC, and Customer Name for Crédito Fiscal for this share.", variant: "destructive" });
                return split;
            }

            toast({ title: "Share Paid (Mock)", description: `Share ${splitId.slice(0,10)} for $${amountToPayNum.toFixed(2)} via ${split.paymentMethod} marked as paid.` });
            
            if (paymentSplitType === 'by_item') {
                setCoveredItemIdsForSplitting(prev => [...new Set([...prev, ...split.items.map(i => i.id)])]);
                setItemsToSplitBy({}); 
            }
            return { ...split, isPaid: true, amountToPay: amountToPayNum.toFixed(2) }; 
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

  const appliedDiscountDescription = useMemo(() => {
    if (isCourtesyCheckout) return { description: "Full Order Courtesy Applied", value: orderTotalsForCheckout.subtotal };
    
    let presetDesc = "";
    let manualDesc = "";
    let presetVal = 0;
    let manualVal = manualDiscountAmountCheckout;

    if (selectedDiscountId) {
      const discount = mockPresetDiscounts.find(d => d.id === selectedDiscountId);
      if (discount) {
        presetDesc = `${discount.name} (${discount.percentage}%)`;
        presetVal = orderTotalsForCheckout.appliedPresetDiscountValue || 0;
      }
    } else if (appliedCouponCode) {
        const discount = mockPresetDiscounts.find(d => d.couponCode?.toLowerCase() === appliedCouponCode.toLowerCase());
         if (discount) {
            presetDesc = `Coupon: ${discount.name} (${discount.percentage}%)`;
            presetVal = orderTotalsForCheckout.appliedPresetDiscountValue || 0;
         }
    }
    
    if (manualDiscountAmountCheckout > 0) {
        manualDesc = `Manual Discount`;
        manualVal = orderTotalsForCheckout.appliedManualDiscountValue || 0;
    }
    
    const descriptions: string[] = [];
    if (presetDesc) descriptions.push(`${presetDesc}: -$${presetVal.toFixed(2)}`);
    if (manualDesc) descriptions.push(`${manualDesc}: -$${manualVal.toFixed(2)}`);


    if (descriptions.length === 0) return { description: "No Discount Applied", value: 0 };
    return { 
        descriptionLines: descriptions,
        totalValue: orderTotalsForCheckout.discountAmount || 0
    };
  }, [selectedDiscountId, appliedCouponCode, manualDiscountAmountCheckout, isCourtesyCheckout, orderTotalsForCheckout]);

  const checkoutStepTitles: Record<CheckoutSubStep, string> = {
    summary_and_courtesy: "Order Summary & Item Courtesy",
    discounts_and_tip: "Discounts & Tip",
    payment_splitting: "Payment & DTE Options",
    final_review_and_pay: "Final Review & Payment",
  };

  const handleNextCheckoutStep = () => {
    if (currentCheckoutSubStep === 'summary_and_courtesy') setCurrentCheckoutSubStep('discounts_and_tip');
    else if (currentCheckoutSubStep === 'discounts_and_tip') setCurrentCheckoutSubStep('payment_splitting');
    else if (currentCheckoutSubStep === 'payment_splitting') setCurrentCheckoutSubStep('final_review_and_pay');
  };

  const handlePreviousCheckoutStep = () => {
    if (currentCheckoutSubStep === 'final_review_and_pay') setCurrentCheckoutSubStep('payment_splitting');
    else if (currentCheckoutSubStep === 'payment_splitting') setCurrentCheckoutSubStep('discounts_and_tip');
    else if (currentCheckoutSubStep === 'discounts_and_tip') setCurrentCheckoutSubStep('summary_and_courtesy');
  };


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
                {checkoutOrderIdParam ? "Back to Active Order Details" : "Cancel Checkout & Start New"}
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
         <Card className="shadow-xl max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5"/>Checkout Steps</CardTitle>
                <CardDescription>Order #{loadedOrderForCheckout.id.slice(-6)} - Current Step: <span className="font-semibold text-primary">{checkoutStepTitles[currentCheckoutSubStep]}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Step 1: Order Summary & Item Courtesy */}
                {currentCheckoutSubStep === 'summary_and_courtesy' && (
                    <div>
                        <h4 className="font-semibold mb-2 text-lg">Order Summary & Item Courtesy</h4>
                        <p className="text-sm text-muted-foreground mb-3">Review items. You can mark individual items as courtesy (free of charge) here.</p>
                        <ScrollArea className="h-[300px] border rounded-md p-3">
                            {currentOrderItemsForCheckoutDisplay.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-1.5 border-b last:border-b-0">
                                    <div className="flex-grow">
                                        <p className={`font-medium ${item.isCourtesy ? 'line-through text-muted-foreground' : ''}`}>{item.quantity}x {item.name} {item.assignedGuest && <span className="text-xs text-muted-foreground">({item.assignedGuest})</span>}</p>
                                        <p className={`text-xs ${item.isCourtesy ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>Unit: ${item.price.toFixed(2)} / Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                        {item.observations && <p className="text-xs text-blue-500 mt-0.5">Notes: {item.observations}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                        {!isCourtesyCheckout && !isOnHoldCheckout && !isOrderFullyPaid && ( 
                                        <TooltipProvider>
                                            <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center space-x-1">
                                                   <CircleDollarSign className={`h-4 w-4 ${itemCourtesiesCheckout[item.id] ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                    <Checkbox
                                                    id={`courtesy-${item.id}`}
                                                    checked={item.isCourtesy}
                                                    onCheckedChange={() => handleToggleItemCourtesyCheckout(item.id)}
                                                    aria-label={`Mark ${item.name} as courtesy`}
                                                    disabled={isOnHoldCheckout || isOrderFullyPaid || isCourtesyCheckout}
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Mark this item as courtesy (free of charge).</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
                         <div className="space-y-2 text-sm mt-4 border-t pt-4">
                            <div className="flex justify-between"><span>Subtotal (after item courtesies):</span> <span>${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>
                            {orderTotalsForCheckout.appliedPresetDiscountValue > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive"><span>Preset/Coupon Discount:</span> <span>-${orderTotalsForCheckout.appliedPresetDiscountValue.toFixed(2)}</span></div>}
                            {orderTotalsForCheckout.appliedManualDiscountValue > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive"><span>Manual Discount:</span> <span>-${orderTotalsForCheckout.appliedManualDiscountValue.toFixed(2)}</span></div>}
                            {orderTotalsForCheckout.discountAmount > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive font-semibold"><span>Total Discounts:</span> <span>-${orderTotalsForCheckout.discountAmount.toFixed(2)}</span></div>}

                            {isCourtesyCheckout && <div className="flex justify-between text-green-600"><span>Full Order Courtesy:</span> <span>-${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>}
                            <div className="flex justify-between"><span>Subtotal after All Discounts:</span> <span>${(orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0)).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tip:</span> <span>${tipAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${orderTotalsForCheckout.taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Grand Total:</span> <h1>${finalTotalAmountForCheckout.toFixed(2)}</h1></div>
                        </div>
                    </div>
                )}

                {/* Step 2: Discounts & Tip */}
                {currentCheckoutSubStep === 'discounts_and_tip' && (
                    <div className="space-y-6">
                         <h4 className="font-semibold text-lg mb-1">Discounts & Tip</h4>
                         <Card className="p-4 border shadow-sm">
                            <CardHeader className="p-0 pb-3">
                                <CardTitle className="font-headline text-lg flex items-center"><TicketPercent className="mr-2 h-5 w-5 text-primary"/>Discount Options</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-3">
                                <Select 
                                    value={selectedDiscountId || "none"} 
                                    onValueChange={(value) => {
                                        setSelectedDiscountId(value === 'none' ? undefined : value); 
                                        if (value !== 'none') { setAppliedCouponCode(''); } 
                                    }} 
                                    disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}
                                >
                                    <SelectTrigger aria-label="Select Discount">
                                        <SelectValue placeholder="No Preset Discount" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Preset Discount</SelectItem>
                                        {mockPresetDiscounts.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name} ({d.percentage}%) {d.couponCode && `(Code: ${d.couponCode})`}</SelectItem>
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
                                        disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid || !!selectedDiscountId}
                                    />
                                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid || !!selectedDiscountId}>Apply</Button>
                                </div>
                                <div>
                                    <Label htmlFor="manualDiscountAmount" className="text-sm">Additional Manual Discount ($)</Label>
                                    <Input 
                                        id="manualDiscountAmount"
                                        type="number" 
                                        value={manualDiscountAmountCheckout} 
                                        onChange={e => {
                                            setManualDiscountAmountCheckout(parseFloat(e.target.value) || 0); 
                                        }}
                                        className="h-9 mt-1"
                                        disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}
                                        placeholder="e.g., 5.00"
                                        step="0.01"
                                    />
                                </div>
                                <Button variant="outline" size="sm" onClick={handleRemoveAllDiscounts} disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}>
                                    <MinusCircle className="mr-2 h-4 w-4" /> Clear Applied Discounts
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="p-4 border shadow-sm">
                            <CardHeader className="p-0 pb-3">
                                <CardTitle className="font-headline text-lg flex items-center"><DollarSignIcon className="mr-2 h-5 w-5 text-primary"/>Tip Options</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-2">
                                <RadioGroup 
                                    value={tipMode} 
                                    onValueChange={(value) => setTipMode(value as TipMode)} 
                                    disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid} 
                                    className="space-y-1"
                                >
                                    <div className="flex items-center space-x-3 h-9">
                                        <RadioGroupItem value="default" id="tipDefault" />
                                        <Label htmlFor="tipDefault" className="flex-1 cursor-pointer">Default ({DEFAULT_TIP_PERCENTAGE}%)</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 h-9">
                                        <RadioGroupItem value="percentage" id="tipPercentage" />
                                        <Label htmlFor="tipPercentage" className="cursor-pointer w-[90px] shrink-0">Custom %</Label>
                                        <Input type="number" value={customTipPercentage} onChange={e => setCustomTipPercentage(Number(e.target.value))} className={cn("w-20 h-8 text-sm text-center", tipMode !== 'percentage' ? 'opacity-0 pointer-events-none' : '')} aria-label="Custom tip percentage" disabled={tipMode !== 'percentage' || isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid} />
                                        {tipMode === 'percentage' && <span className="text-sm w-5 shrink-0">%</span>}
                                    </div>
                                    <div className="flex items-center space-x-3 h-9">
                                        <RadioGroupItem value="manual" id="tipManual" />
                                        <Label htmlFor="tipManual" className="cursor-pointer w-[90px] shrink-0">Manual $</Label>
                                        <Input type="number" value={manualTipAmount} onChange={e => setManualTipAmount(Number(e.target.value))} className={cn("w-20 h-8 text-sm text-center", tipMode !== 'manual' ? 'opacity-0 pointer-events-none' : '')} aria-label="Manual tip amount" disabled={tipMode !== 'manual' || isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}/>
                                        {tipMode === 'manual' && <span className="text-sm w-5 shrink-0">$</span>}
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {/* Step 3: Payment Splitting & DTE */}
                {currentCheckoutSubStep === 'payment_splitting' && (
                    <div className="space-y-4">
                        <Label className="font-headline text-lg flex items-center"><DivideSquare className="mr-2 h-5 w-5 text-primary"/>Payment Splitting & DTE</Label>
                        <div className="flex justify-between items-center">
                            <Select value={paymentSplitType} onValueChange={(value) => {setPaymentSplitType(value as PaymentSplitType); setItemsToSplitBy({}); setUiSplits([]); setCoveredItemIdsForSplitting([]);}} disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}>
                                <SelectTrigger aria-label="Payment Split Type" className="w-auto">
                                    <SelectValue placeholder="No Split" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Split (Full Payment)</SelectItem>
                                    <SelectItem value="equal">Split Equally</SelectItem>
                                    <SelectItem value="by_item">Split by Item</SelectItem>
                                </SelectContent>
                            </Select>
                            {isOrderFullyPaid && <Badge className="bg-green-500 text-white">Order Fully Paid</Badge>}
                        </div>
                        {paymentSplitType === 'equal' && (
                            <div className="flex items-center gap-2">
                                <Label htmlFor="splitWays">Number of Ways:</Label>
                                <Input id="splitWays" type="number" value={paymentSplitWays} onChange={e => setPaymentSplitWays(Math.max(2, parseInt(e.target.value)))} min="2" className="w-20 h-8" disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}/>
                            </div>
                        )}
                         {paymentSplitType === 'by_item' && !isOrderFullyPaid && (
                            <>
                                <p className="text-xs text-muted-foreground mb-3">Select items from the order summary (Step 1) to include in the current itemized payment section below. Paid/covered items cannot be re-selected.</p>
                                 <ScrollArea className="h-[200px] border rounded-md p-3 mb-3">
                                    <h5 className="font-semibold mb-1 text-sm">Order Items for Splitting:</h5>
                                    {currentOrderItemsForCheckoutDisplay.filter(item => !item.isCourtesy).map(item => (
                                        <div key={`split-sel-${item.id}`} className="flex items-center justify-between py-1 border-b last:border-b-0">
                                            <Label htmlFor={`split-item-${item.id}`} className="text-sm font-normal flex-grow">
                                                {item.quantity}x {item.name} (${(item.price * item.quantity).toFixed(2)})
                                            </Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center space-x-1">
                                                           <CheckSquare className={`h-4 w-4 ${itemsToSplitBy[item.id] ? 'text-primary' : 'text-muted-foreground'}`} />
                                                            <Checkbox
                                                                id={`split-item-${item.id}`}
                                                                checked={!!itemsToSplitBy[item.id]}
                                                                onCheckedChange={(checked) => setItemsToSplitBy(prev => ({...prev, [item.id]: !!checked}))}
                                                                disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid || coveredItemIdsForSplitting.includes(item.id)}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>{coveredItemIdsForSplitting.includes(item.id) ? "Item covered in a previous split" : "Select this item for the current payment share"}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </>
                        )}


                        {uiSplits.map((split, index) => (
                            <Card key={split.id} className={`p-4 ${split.isPaid ? 'bg-green-500/10 border-green-500' : 'bg-muted/30'}`}>
                                <CardHeader className="p-0 pb-3">
                                    <CardTitle className="text-md flex justify-between items-center">
                                        <span>
                                        {paymentSplitType === 'equal' ? `Share ${index + 1} of ${paymentSplitWays}` : paymentSplitType === 'by_item' ? `Itemized Payment ${index + 1}` : 'Full Payment'}
                                        </span>
                                        {split.isPaid && <Badge className="ml-2 bg-green-600 text-white">Paid</Badge>}
                                    </CardTitle>
                                    {paymentSplitType === 'by_item' && split.items.length > 0 && (
                                        <ScrollArea className="max-h-20 text-xs text-muted-foreground mt-1">
                                            Items: {split.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </ScrollArea>
                                    )}
                                </CardHeader>
                                <CardContent className="p-0 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Amount Due for this share:</span>
                                        <span className="font-semibold">${split.amountDue.toFixed(2)}</span>
                                    </div>
                                    {!split.isPaid && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input 
                                                    type="number" 
                                                    value={split.amountToPay}
                                                    onChange={e => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, amountToPay: e.target.value} : s))}
                                                    placeholder="Amount to pay"
                                                    className="h-9"
                                                    step="0.01"
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
                                            <div className="space-y-2 pt-2">
                                                <Label className="text-xs font-medium">DTE for this Share (Optional)</Label>
                                                <Select 
                                                    value={split.dteType || 'consumidor_final'} 
                                                    onValueChange={val => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, dteType: val as any, dteInvoiceInfo: val === 'consumidor_final' ? undefined : s.dteInvoiceInfo } : s))}
                                                >
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                                                        <SelectItem value="credito_fiscal">Crédito Fiscal</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {split.dteType === 'credito_fiscal' && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                                                        <Input 
                                                            placeholder="NIT" 
                                                            value={split.dteInvoiceInfo?.nit || ''} 
                                                            onChange={e => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, dteInvoiceInfo: {...s.dteInvoiceInfo, nit: e.target.value}} : s))}
                                                            className="h-8 text-xs"
                                                        />
                                                        <Input 
                                                            placeholder="NRC" 
                                                            value={split.dteInvoiceInfo?.nrc || ''} 
                                                            onChange={e => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, dteInvoiceInfo: {...s.dteInvoiceInfo, nrc: e.target.value}} : s))}
                                                            className="h-8 text-xs"
                                                        />
                                                        <Input 
                                                            placeholder="Customer Name" 
                                                            value={split.dteInvoiceInfo?.customerName || ''} 
                                                            onChange={e => setUiSplits(prev => prev.map(s => s.id === split.id ? {...s, dteInvoiceInfo: {...s.dteInvoiceInfo, customerName: e.target.value}} : s))}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <Button onClick={() => handlePaySplit(split.id)} size="sm" className="w-full mt-3" 
                                                disabled={!split.paymentMethod || !split.amountToPay || parseFloat(split.amountToPay) <= 0 || (parseFloat(split.amountToPay) > split.amountDue + 0.01 && paymentSplitType !== 'equal') }>
                                                Pay This Share (Mock)
                                            </Button>
                                        </>
                                    )}
                                    {split.paymentMethod && split.isPaid && <p className="text-xs text-muted-foreground">Paid via: {split.paymentMethod} {split.dteType && split.dteType !== 'consumidor_final' ? `(DTE: ${split.dteType})` : ''}</p>}
                                </CardContent>
                            </Card>
                        ))}
                        {paymentSplitType === 'none' && !isOrderFullyPaid && ( 
                            <Card className="p-4 bg-muted/30">
                                <CardHeader className="p-0 pb-3">
                                    <CardTitle className="text-md flex items-center"><FileText className="mr-2 h-4 w-4 text-primary"/>DTE Invoice (El Salvador)</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-3">
                                    <Select value={overallDteType} onValueChange={(value) => setOverallDteType(value as 'consumidor_final' | 'credito_fiscal')} disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}>
                                        <SelectTrigger aria-label="DTE Document Type">
                                            <SelectValue placeholder="Select DTE Type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                                            <SelectItem value="credito_fiscal">Crédito Fiscal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {overallDteType === 'credito_fiscal' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <Input placeholder="NIT Cliente" value={overallDteNit} onChange={e => setOverallDteNit(e.target.value)} aria-label="DTE NIT Cliente" disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}/>
                                            <Input placeholder="NRC Cliente" value={overallDteNrc} onChange={e => setOverallDteNrc(e.target.value)} aria-label="DTE NRC Cliente" disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}/>
                                            <Input placeholder="Nombre Cliente" value={overallDteCustomerName} onChange={e => setOverallDteCustomerName(e.target.value)} aria-label="DTE Customer Name" disabled={isCourtesyCheckout || isOnHoldCheckout || isOrderFullyPaid}/>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Step 4: Final Actions & Payment Confirmation */}
                 {currentCheckoutSubStep === 'final_review_and_pay' && (
                    <div className="space-y-6">
                        <h4 className="font-semibold text-lg mb-1">Final Actions & Confirmation</h4>
                        <div className="space-y-2 text-sm border p-3 rounded-md">
                            <p className="font-medium text-md">Order Total Summary:</p>
                            <div className="flex justify-between"><span>Subtotal (after item courtesies):</span> <span>${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>
                            {orderTotalsForCheckout.appliedPresetDiscountValue > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive"><span>Preset/Coupon Discount:</span> <span>-${orderTotalsForCheckout.appliedPresetDiscountValue.toFixed(2)}</span></div>}
                            {orderTotalsForCheckout.appliedManualDiscountValue > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive"><span>Manual Discount:</span> <span>-${orderTotalsForCheckout.appliedManualDiscountValue.toFixed(2)}</span></div>}
                            {orderTotalsForCheckout.discountAmount > 0 && !isCourtesyCheckout && <div className="flex justify-between text-destructive font-semibold"><span>Total Discounts:</span> <span>-${orderTotalsForCheckout.discountAmount.toFixed(2)}</span></div>}
                            {isCourtesyCheckout && <div className="flex justify-between text-green-600"><span>Full Order Courtesy:</span> <span>-${orderTotalsForCheckout.subtotal.toFixed(2)}</span></div>}
                            <div className="flex justify-between"><span>Subtotal after All Discounts:</span> <span>${(orderTotalsForCheckout.subtotal - (orderTotalsForCheckout.discountAmount || 0)).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tip:</span> <span>${tipAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${orderTotalsForCheckout.taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg text-primary mt-2"><span>Grand Total:</span> <h1>${finalTotalAmountForCheckout.toFixed(2)}</h1></div>
                             {paymentSplitType !== 'none' && uiSplits.filter(s=>s.isPaid).length > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Total Paid in Splits:</span> 
                                    <span>${uiSplits.filter(s => s.isPaid).reduce((sum, s) => sum + parseFloat(s.amountToPay || '0'), 0).toFixed(2)}</span>
                                </div>
                             )}
                        </div>
                        
                        <div className="space-y-3">
                            <Label className="font-headline text-md flex items-center"><StickyNote className="mr-2 h-5 w-5 text-primary"/>Order Final Actions</Label>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="isCourtesyCheckout" checked={isCourtesyCheckout} onCheckedChange={(val) => setIsCourtesyCheckout(!!val)} disabled={isOnHoldCheckout || isOrderFullyPaid}/>
                                    <Label htmlFor="isCourtesyCheckout" className="flex items-center cursor-pointer"><CircleDollarSign className="mr-1 h-4 w-4 text-green-500"/>Mark Entire Order as Courtesy</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="isOnHoldCheckout" checked={isOnHoldCheckout} onCheckedChange={(val) => setIsOnHoldCheckout(!!val)} disabled={isCourtesyCheckout || isOrderFullyPaid} />
                                    <Label htmlFor="isOnHoldCheckout" className="flex items-center cursor-pointer"><WalletCards className="mr-1 h-4 w-4 text-yellow-500"/>Hold Bill (No Payment)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="disableReceiptPrintCheckout" checked={disableReceiptPrintCheckout} onCheckedChange={(val) => setDisableReceiptPrintCheckout(!!val)}/>
                                    <Label htmlFor="disableReceiptPrintCheckout" className="flex items-center cursor-pointer"><EyeOff className="mr-1 h-4 w-4"/>No Receipt Print</Label>
                                </div>
                            </div>
                        </div>
                        <Button 
                            className="w-full" 
                            size="lg" 
                            onClick={handleFinalizePayment} 
                            disabled={
                                !loadedOrderForCheckout ||
                                (!isCourtesyCheckout && !isOnHoldCheckout && paymentSplitType !== 'none' && !isOrderFullyPaid) ||
                                (!isCourtesyCheckout && !isOnHoldCheckout && paymentSplitType === 'none' && !overallPaymentMethod && !isOrderFullyPaid && finalTotalAmountForCheckout > 0)
                            }
                        >
                            <Save className="mr-2 h-5 w-5" /> 
                            {isCourtesyCheckout ? "Finalize as Courtesy" : isOnHoldCheckout ? "Confirm On Hold Status" : "Finalize & Pay Order"}
                        </Button>
                    </div>
                 )}

            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                    variant="outline" 
                    onClick={handlePreviousCheckoutStep} 
                    disabled={currentCheckoutSubStep === 'summary_and_courtesy'}
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/> Previous Step
                </Button>
                <Button 
                    onClick={handleNextCheckoutStep} 
                    disabled={currentCheckoutSubStep === 'final_review_and_pay'}
                >
                    Next Step <ArrowRight className="ml-2 h-4 w-4"/>
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

