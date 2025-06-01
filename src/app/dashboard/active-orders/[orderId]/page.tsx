
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Tag, Hash, Clock, Calendar, CreditCard, Percent, DollarSign, Receipt, Info, Utensils, Loader2, AlertTriangle, Users, CheckCircle, Edit3, Save, ShoppingBag, CircleDollarSign, WalletCards, EyeOff, PlusCircle, ArrowRight, Trash2, XCircle } from "lucide-react";
import type { Order, OrderItem, RestaurantTable } from '@/lib/types';
import { mockActiveOrders, initialStaff, initialTables, updateActiveOrder, calculateOrderTotals, initialMenuItems } from '@/lib/mock-data';
import { IVA_RATE } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const OrderStatusBadgeFull = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'open': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400"><Clock className="mr-1 h-3 w-3" />Open</Badge>;
    case 'pending_payment': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><AlertTriangle className="mr-1 h-3 w-3" />Pending Payment</Badge>;
    case 'paid': return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><DollarSign className="mr-1 h-3 w-3" />Paid</Badge>;
    case 'completed': return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
    case 'cancelled': return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Cancelled</Badge>;
    case 'on_hold': return <Badge variant="secondary" className="bg-orange-500/20 text-orange-400"><Clock className="mr-1 h-3 w-3" />On Hold</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};


export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTableGuest, setIsEditingTableGuest] = useState(false);

  // Editable fields for table/guest
  const [editableTableId, setEditableTableId] = useState<string | undefined>(undefined);
  const [editableNumberOfGuests, setEditableNumberOfGuests] = useState<number | undefined>(undefined);

  const loadOrderData = useCallback(() => {
    if (orderId) {
      const foundOrder = mockActiveOrders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(JSON.parse(JSON.stringify(foundOrder))); // Deep copy for local editing
        setEditableTableId(foundOrder.tableId);
        setEditableNumberOfGuests(foundOrder.numberOfGuests);
      } else {
        setOrder(null);
      }
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);


  const getWaiterName = (waiterId?: string) => {
    if (!waiterId) return 'N/A';
    const waiter = initialStaff.find(staff => staff.id === waiterId);
    return waiter ? waiter.name : waiterId;
  };

  const getTableName = (tableId?: string) => {
    if (!tableId) return 'N/A';
    const table = initialTables.find(t => t.id === tableId);
    return table ? table.name : tableId;
  };

  const handleSaveTableGuestChanges = () => {
    if (!order) return;

    const originalTableId = mockActiveOrders.find(o => o.id === order.id)?.tableId;

    const updatedOrderPartial: Partial<Order> & { id: string } = {
        id: order.id,
        tableId: editableTableId,
        numberOfGuests: editableNumberOfGuests,
        updatedAt: new Date().toISOString(),
    };
    
    const updatedOrderResult = updateActiveOrder(updatedOrderPartial);
    if (updatedOrderResult) {
      setOrder(updatedOrderResult); // Update local state with the full updated order
    }

    // Update table status if table changed
    if (originalTableId !== editableTableId) {
        if (originalTableId) {
            const oldTableIndex = initialTables.findIndex(t => t.id === originalTableId);
            if (oldTableIndex > -1) {
                initialTables[oldTableIndex].status = 'available';
                initialTables[oldTableIndex].currentOrderId = undefined;
            }
        }
        if (editableTableId && order.orderType === 'Dine-in' && (order.status === 'open' || order.status === 'on_hold' || order.status === 'pending_payment')) {
            const newTableIndex = initialTables.findIndex(t => t.id === editableTableId);
            if (newTableIndex > -1) {
                initialTables[newTableIndex].status = 'occupied';
                initialTables[newTableIndex].currentOrderId = order.id;
            }
        }
    }

    toast({ title: "Changes Saved", description: `Table/Guest info for order #${order.id.slice(-6)} updated.` });
    setIsEditingTableGuest(false);
  };
  
  const handleProceedToCheckout = () => {
    if (order) {
      router.push(`/dashboard/orders?checkoutOrderId=${order.id}`);
    }
  };

  const handleCancelItem = (itemId: string) => {
    if (!order) return;
    const updatedItems = order.items.map(item => 
      item.id === itemId ? { ...item, status: 'cancelled' as OrderItem['status'] } : item
    );
    const updatedOrderResult = updateActiveOrder({ id: order.id, items: updatedItems });
    if (updatedOrderResult) {
      setOrder(updatedOrderResult);
      toast({ title: "Item Cancelled", description: "Item status updated and totals recalculated." });
    }
  };
  
  const handleOrderActionChange = (action: 'isCourtesy' | 'isOnHold' | 'disableReceiptPrint', value: boolean) => {
    if (!order) return;
    const updatedOrderPartial: Partial<Order> & { id: string } = { id: order.id, [action]: value };
    
    if (action === 'isCourtesy' && value) {
        updatedOrderPartial.discountAmount = order.subtotal; // Full discount
        updatedOrderPartial.tipAmount = 0;
        // Totals will be recalculated by updateActiveOrder
    } else if (action === 'isCourtesy' && !value) {
        // Revert courtesy, totals will be recalculated
    }

    if (action === 'isOnHold') {
        updatedOrderPartial.status = value ? 'on_hold' : 'open'; // Example status change
    }
    
    const updatedOrderResult = updateActiveOrder(updatedOrderPartial);
     if (updatedOrderResult) {
      setOrder(updatedOrderResult);
      toast({ title: "Order Updated", description: `Order action changed.` });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">The order with ID "{orderId}" could not be located.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/active-orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Active Orders</Link>
        </Button>
      </div>
    );
  }
  
  const canModifyTableGuest = order.status === 'open' || order.status === 'on_hold' || order.status === 'pending_payment';
  const canModifyItems = order.status === 'open' || order.status === 'on_hold';

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Order Details #{order.id.slice(-6)}</h1>
        <div className="flex gap-2">
            {canModifyTableGuest && !isEditingTableGuest && (
                 <Button variant="outline" onClick={() => setIsEditingTableGuest(true)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Modify Table/Guests
                </Button>
            )}
            {isEditingTableGuest && (
                 <Button variant="default" onClick={handleSaveTableGuestChanges}>
                    <Save className="mr-2 h-4 w-4" /> Save Table/Guest Changes
                </Button>
            )}
            {isEditingTableGuest && (
                 <Button variant="ghost" onClick={() => {
                    setIsEditingTableGuest(false);
                    setEditableTableId(order.tableId);
                    setEditableNumberOfGuests(order.numberOfGuests);
                 }}>
                    Cancel Edit
                </Button>
            )}
            <Button variant="outline" asChild>
            <Link href="/dashboard/active-orders">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Active Orders
            </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">Order #{order.id.slice(-6)}</CardTitle>
              <CardDescription className="text-sm">
                Created: {new Date(order.createdAt).toLocaleString()} | Last Updated: {new Date(order.updatedAt).toLocaleString()}
              </CardDescription>
            </div>
            <OrderStatusBadgeFull status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium flex items-center"><Tag className="mr-2 h-4 w-4 text-primary" />{order.orderType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Waiter</p>
              <p className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-primary" />{getWaiterName(order.waiterId)}</p>
            </div>
            {order.orderType === "Dine-in" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="editableTableId" className="text-xs text-muted-foreground">Table</Label>
                  {isEditingTableGuest ? (
                    <Select value={editableTableId} onValueChange={setEditableTableId} disabled={!isEditingTableGuest}>
                        <SelectTrigger id="editableTableId" aria-label="Select Table">
                            <SelectValue placeholder="Select Table" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialTables.filter(t => t.status === 'available' || t.id === order.tableId).map(table => ( // Allow selecting current table even if occupied by this order
                                <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium flex items-center"><Hash className="mr-2 h-4 w-4 text-primary" />{getTableName(order.tableId)}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="editableNumberOfGuests" className="text-xs text-muted-foreground">Guests</Label>
                  {isEditingTableGuest ? (
                    <Input 
                        id="editableNumberOfGuests" 
                        type="number" 
                        value={editableNumberOfGuests || ''} 
                        onChange={e => setEditableNumberOfGuests(e.target.value ? parseInt(e.target.value) : undefined)} 
                        min="1"
                        className="h-9"
                        disabled={!isEditingTableGuest}
                    />
                  ) : (
                    <p className="font-medium flex items-center"><Users className="mr-2 h-4 w-4 text-primary" />{order.numberOfGuests || 'N/A'}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <Separator />
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg flex items-center"><Utensils className="mr-2 h-5 w-5 text-primary"/>Items Ordered</h4>
                    {canModifyItems && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/orders?editActiveOrderId=${order.id}`}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add More Items
                            </Link>
                        </Button>
                    )}
                </div>
                <ScrollArea className="max-h-96 border rounded-md">
                <ul className="divide-y">
                    {order.items.map(item => (
                    <li key={item.id} className={`p-3 ${item.status === 'cancelled' ? 'opacity-50 bg-muted/50' : ''}`}>
                        <div className="flex justify-between items-start">
                        <div>
                            <p className={`font-medium ${item.status === 'cancelled' ? 'line-through' : ''}`}>{item.quantity}x {item.name} {item.assignedGuest && <span className="text-xs text-muted-foreground">({item.assignedGuest})</span>}</p>
                            <p className="text-xs text-muted-foreground">Unit Price: ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className={`font-semibold text-primary ${item.status === 'cancelled' ? 'line-through' : ''}`}>${(item.quantity * item.price).toFixed(2)}</p>
                            {item.status !== 'cancelled' && canModifyItems && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleCancelItem(item.id)} title="Cancel Item">
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        </div>
                        {item.observations && (
                        <p className="text-xs text-blue-500 mt-1 italic">Notes: "{item.observations}"</p>
                        )}
                        <Badge variant={item.status === 'cancelled' ? 'destructive' : 'outline'} className="mt-1 text-xs capitalize">{item.status.replace('_', ' ')}</Badge>
                    </li>
                    ))}
                </ul>
                </ScrollArea>
                 <div className="text-sm space-y-1 mt-4 border-t pt-4">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>${order.subtotal.toFixed(2)}</span></div>
                    {order.discountAmount > 0 && <div className="flex justify-between text-destructive"><span>Discount:</span> <span>-${order.discountAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>Tip (Added at Checkout):</span> <span>${order.tipAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${order.taxAmount.toFixed(2)}</span></div>
                    <Separator className="my-1"/>
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Grand Total:</span> <h1>${order.totalAmount.toFixed(2)}</h1></div>
                </div>
            </div>
          <Separator/>
            <div className="space-y-3">
                <h4 className="font-semibold text-lg mb-2 flex items-center"><Settings className="mr-2 h-5 w-5 text-primary"/>Order Actions</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isCourtesy" checked={order.isCourtesy} onCheckedChange={(checked) => handleOrderActionChange('isCourtesy', !!checked)} disabled={order.status === 'paid' || order.status === 'completed' || order.status === 'cancelled'} />
                        <Label htmlFor="isCourtesy" className="flex items-center"><CircleDollarSign className="mr-1 h-4 w-4 text-green-500"/>Mark as Courtesy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isOnHold" checked={order.isOnHold} onCheckedChange={(checked) => handleOrderActionChange('isOnHold', !!checked)} disabled={order.status === 'paid' || order.status === 'completed' || order.status === 'cancelled'} />
                        <Label htmlFor="isOnHold" className="flex items-center"><WalletCards className="mr-1 h-4 w-4 text-yellow-500"/>Hold Bill</Label>
                    </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="disableReceiptPrint" checked={order.disableReceiptPrint} onCheckedChange={(checked) => handleOrderActionChange('disableReceiptPrint', !!checked)} />
                        <Label htmlFor="disableReceiptPrint" className="flex items-center"><EyeOff className="mr-1 h-4 w-4"/>No Receipt Print</Label>
                    </div>
                </div>
            </div>

        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end items-center gap-3">
          <Button variant="outline" onClick={() => alert("Mock: Printing Receipt...")} disabled={order.disableReceiptPrint}>Print Receipt (Mock)</Button>
           {(order.status === 'open' || order.status === 'on_hold' || order.status === 'pending_payment') && (
            <Button onClick={handleProceedToCheckout} disabled={order.status === 'on_hold' && !order.isCourtesy}>
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

