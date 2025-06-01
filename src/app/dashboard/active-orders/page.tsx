
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, CheckCircle, Truck, User, AlertCircle } from "lucide-react";
import type { Order, OrderItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialStaff, mockActiveOrders as allMockOrders } from '@/lib/mock-data'; // Import shared staff and order data

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'open': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400"><Clock className="mr-1 h-3 w-3" />Open</Badge>;
    case 'pending_payment': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><AlertCircle className="mr-1 h-3 w-3" />Pending Payment</Badge>;
    case 'paid': return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
    case 'completed': return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
    case 'cancelled': return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const OrderItemStatusIcon = ({ status }: { status: OrderItem['status']}) => {
  switch(status) {
    case 'pending': return <Clock className="h-4 w-4 text-yellow-400" title="Pending"/>;
    case 'preparing': return <Utensils className="h-4 w-4 text-blue-400" title="Preparing"/>;
    case 'ready': return <CheckCircle className="h-4 w-4 text-green-400" title="Ready"/>;
    case 'delivered': return <Truck className="h-4 w-4 text-purple-400" title="Delivered"/>;
    case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" title="Cancelled"/>;
    default: return null;
  }
}

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setOrders(allMockOrders); // Use imported mock orders
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getWaiterName = (waiterId: string) => {
    const waiter = initialStaff.find(staff => staff.id === waiterId);
    return waiter ? waiter.name : waiterId; // Fallback to ID if not found
  };

  const filterOrders = (status: Order['status'] | 'all') => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  }

  const orderTabs: {value: Order['status'] | 'all', label: string}[] = [
    {value: 'all', label: 'All Orders'},
    {value: 'open', label: 'Open'},
    {value: 'pending_payment', label: 'Pending Payment'},
    {value: 'paid', label: 'Paid'},
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Active Orders</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          {orderTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {orderTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterOrders(tab.value).length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-10">No orders with status "{tab.label}".</p>
                )}
                {filterOrders(tab.value).map(order => (
                  <Card key={order.id} className="shadow-lg flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-headline text-xl">Order #{order.id.slice(-4)}</CardTitle>
                          <CardDescription className="text-xs">
                            {order.orderType === "Dine-in" && order.tableId ? `Table ${order.tableId} | ` : ''}
                            {order.orderType} | {formatTimeAgo(order.createdAt)}
                          </CardDescription>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Items:</h4>
                        <ul className="space-y-1 text-xs max-h-32 overflow-y-auto pr-1">
                          {order.items.map(item => (
                            <li key={item.id} className="flex justify-between items-center">
                              <span>{item.quantity}x {item.name}</span>
                              <div className="flex items-center gap-2">
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                <OrderItemStatusIcon status={item.status} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                       <div className="text-xs">
                         <User className="inline h-3 w-3 mr-1" /> Waiter: {getWaiterName(order.waiterId)}
                       </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
                      <span className="font-semibold text-lg text-primary">Total: ${order.totalAmount.toFixed(2)}</span>
                      <Button variant="outline" size="sm">View Details</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
