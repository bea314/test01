
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Tag, Hash, Clock, Calendar, CreditCard, Percent, DollarSign, Receipt, Info, Utensils, Loader2, AlertTriangle } from "lucide-react";
import type { Order, OrderItem } from '@/lib/types';
import { mockActiveOrders, initialStaff, initialTables } from '@/lib/mock-data';
import { IVA_RATE } from '@/lib/constants';

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

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const foundOrder = mockActiveOrders.find(o => o.id === orderId);
      setOrder(foundOrder || null);
      setIsLoading(false);
    }
  }, [orderId]);

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Order Details #{order.id.slice(-6)}</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/active-orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Active Orders
          </Link>
        </Button>
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
                  <p className="text-xs text-muted-foreground">Table</p>
                  <p className="font-medium flex items-center"><Hash className="mr-2 h-4 w-4 text-primary" />{getTableName(order.tableId)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Guests</p>
                  <p className="font-medium flex items-center"><Users className="mr-2 h-4 w-4 text-primary" />{order.numberOfGuests || 'N/A'}</p>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-lg mb-3 flex items-center"><Utensils className="mr-2 h-5 w-5 text-primary"/>Items Ordered</h4>
            <ScrollArea className="max-h-60 border rounded-md">
              <ul className="divide-y">
                {order.items.map(item => (
                  <li key={item.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.quantity}x {item.name}</p>
                        <p className="text-xs text-muted-foreground">Unit Price: ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-primary">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                    {item.observations && (
                      <p className="text-xs text-blue-500 mt-1 italic">Notes: "{item.observations}"</p>
                    )}
                    <Badge variant="outline" className="mt-1 text-xs">{item.status}</Badge>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg mb-2 flex items-center"><Receipt className="mr-2 h-5 w-5 text-primary"/>Financials</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span> <span>${order.subtotal.toFixed(2)}</span></div>
                {order.discountAmount > 0 && <div className="flex justify-between text-destructive"><span>Discount:</span> <span>-${order.discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>Tip:</span> <span>${order.tipAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax ({(IVA_RATE * 100).toFixed(0)}%):</span> <span>${order.taxAmount.toFixed(2)}</span></div>
                <Separator className="my-1"/>
                <div className="flex justify-between font-bold text-lg text-primary"><span>Grand Total:</span> <h1>${order.totalAmount.toFixed(2)}</h1></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-lg mb-2 flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>Payment & DTE</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Payment Method:</span> <span className="capitalize">{order.paymentMethod?.replace('_', ' ') || 'N/A'}</span></div>
                {order.isCourtesy && <p className="text-green-600 font-medium">This order was marked as courtesy.</p>}
                {order.disableReceiptPrint && <p className="text-orange-600 font-medium">Receipt printing opted out for this order.</p>}
                <Separator className="my-2"/>
                <p className="text-xs text-muted-foreground">DTE Type</p>
                <p className="font-medium capitalize">{order.dteType?.replace('_', ' ') || 'Consumidor Final'}</p>
                {order.dteType === 'credito_fiscal' && order.dteInvoiceInfo && (
                  <>
                    <p className="text-xs text-muted-foreground mt-1">DTE NIT</p><p className="font-medium">{order.dteInvoiceInfo.nit}</p>
                    <p className="text-xs text-muted-foreground">DTE NRC</p><p className="font-medium">{order.dteInvoiceInfo.nrc}</p>
                    <p className="text-xs text-muted-foreground">DTE Customer</p><p className="font-medium">{order.dteInvoiceInfo.customerName}</p>
                  </>
                )}
              </div>
            </div>
          </div>

        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end">
          <Button variant="outline">Print Receipt (Mock)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
