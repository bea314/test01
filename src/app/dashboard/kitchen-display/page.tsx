
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, CheckCircle, Bell, Zap, Trash2 } from "lucide-react";
import type { Order, OrderItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialStaff, mockActiveOrders as rawOrders } from '@/lib/mock-data';

const initialKdsOrders: Order[] = JSON.parse(JSON.stringify(rawOrders))
    .map((order: Order) => ({
        ...order,
        items: order.items.filter(item => item.status === 'pending' || item.status === 'preparing')
    }))
    .filter((order: Order) => order.items.length > 0);

const OrderItemStatusBadgeKDS = ({ status }: { status: OrderItem['status'] }) => {
  switch (status) {
    case 'pending': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><Bell className="mr-1 h-3 w-3" />Pending</Badge>;
    case 'preparing': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400"><Utensils className="mr-1 h-3 w-3" />Preparing</Badge>;
    case 'ready': return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><CheckCircle className="mr-1 h-3 w-3" />Ready</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export default function KitchenDisplayPage() {
  const [kdsOrders, setKdsOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setKdsOrders(initialKdsOrders);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update time every second for KDS
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgoKDS = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 60) { 
        return `${Math.floor(minutes/60)}h ${minutes % 60}m ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  const getWaiterNameKDS = (waiterId: string) => {
    const waiter = initialStaff.find(staff => staff.id === waiterId);
    return waiter ? waiter.name.split(' ')[0] : waiterId; 
  };

  const handleItemStatusUpdate = (orderId: string, itemId: string, newStatus: OrderItem['status']) => {
    setKdsOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
          );
          // Filter out items that are now 'ready' or 'cancelled' from this specific order for KDS view
          return { 
            ...order, 
            items: updatedItems.filter(item => item.status === 'pending' || item.status === 'preparing')
          };
        }
        return order;
      });
      // Remove order from KDS if all its items are no longer pending/preparing
      return updatedOrders.filter(order => order.items.length > 0);
    });
    alert(`Mock: Item ${itemId} in order ${orderId} updated to ${newStatus}.`);
  };
  
  const handleOrderBump = (orderId: string) => {
     setKdsOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
     alert(`Mock: Order ${orderId} bumped from KDS.`);
  };

  const handleBumpAllOrders = () => {
    setKdsOrders([]);
    alert("Mock: All displayed orders bumped from KDS.");
  };

  return (
    <div className="h-screen flex flex-col bg-muted/40 p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Kitchen Display</h1>
          {/* Placeholder for kitchen selector */}
          {/* <p className="text-sm text-muted-foreground">Showing orders for: Main Kitchen (Selector coming soon)</p> */}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="destructive" onClick={handleBumpAllOrders} disabled={kdsOrders.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" /> Bump All Displayed Orders
          </Button>
          <div className="text-xl font-semibold text-foreground">{currentTime.toLocaleTimeString()}</div>
        </div>
      </div>
      
      {kdsOrders.length === 0 && (
        <div className="flex-grow flex items-center justify-center">
            <p className="text-2xl text-muted-foreground">No active items for the kitchen.</p>
        </div>
      )}

      <ScrollArea className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kdsOrders.map(order => (
            <Card key={order.id} className="shadow-lg bg-card flex flex-col">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-xl flex items-center">
                        Order #{order.id.slice(-4)} 
                        <Badge variant={order.orderType === 'Delivery' ? 'destructive' : 'secondary'} className="ml-2 text-xs">
                            {order.orderType === "Dine-in" && order.tableId ? `T${order.tableId}` : order.orderType}
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                       {getWaiterNameKDS(order.waiterId)} | {formatTimeAgoKDS(order.createdAt)}
                       {order.orderType === "Dine-in" && order.numberOfGuests && ` | ${order.numberOfGuests} Guests`}
                    </CardDescription>
                  </div>
                  {new Date(order.createdAt).getTime() < currentTime.getTime() - 15 * 60 * 1000 && 
                    <Zap className="h-5 w-5 text-red-500" title="Priority Order"/>
                  }
                </div>
              </CardHeader>
              <CardContent className="px-4 py-2 flex-grow space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="p-2 rounded-md border bg-background/70 hover:bg-muted/30">
                    <div className="flex justify-between items-start mb-1.5">
                        <div>
                            <p className="font-semibold">{item.quantity}x {item.name}</p>
                            {item.observations && <p className="text-xs text-blue-500 italic">"{item.observations}"</p>}
                        </div>
                        <OrderItemStatusBadgeKDS status={item.status} />
                    </div>
                    <div className="flex gap-1 justify-end">
                        {item.status === 'pending' && (
                             <Button size="xs" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10" onClick={() => handleItemStatusUpdate(order.id, item.id, 'preparing')}>
                               <Utensils className="mr-1 h-3 w-3"/> Start Prep
                             </Button>
                        )}
                        {item.status === 'preparing' && (
                             <Button size="xs" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleItemStatusUpdate(order.id, item.id, 'ready')}>
                               <CheckCircle className="mr-1 h-3 w-3"/> Mark Ready
                             </Button>
                        )}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="px-4 pt-2 pb-3 border-t mt-auto">
                <Button variant="default" size="sm" className="w-full" onClick={() => handleOrderBump(order.id)}>Bump Order</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
