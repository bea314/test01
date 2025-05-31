
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Eye } from "lucide-react";

// Mock data for tables
const mockTables = [
  { id: "t1", name: "Table 1", status: "available", capacity: 4, currentOrderId: undefined },
  { id: "t2", name: "Table 2", status: "occupied", capacity: 2, currentOrderId: "order123" },
  { id: "t3", name: "Table 3", status: "reserved", capacity: 6, currentOrderId: undefined },
  { id: "t4", name: "Patio 1", status: "available", capacity: 4, currentOrderId: undefined },
  { id: "t5", name: "Bar Seat 1", status: "occupied", capacity: 1, currentOrderId: "order124" },
  { id: "t6", name: "VIP Booth", status: "available", capacity: 8, currentOrderId: undefined },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Visual Table Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Table
        </Button>
      </div>
      
      <p className="mb-8 text-muted-foreground">
        Drag and drop orders to tables, or click on a table to view details or start a new order.
        Table statuses are color-coded for quick insights.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockTables.map((table) => (
          <Card 
            key={table.id} 
            className={`shadow-lg rounded-lg overflow-hidden transition-all hover:shadow-xl
              ${table.status === 'occupied' ? 'border-primary bg-primary/10' : ''}
              ${table.status === 'reserved' ? 'border-accent bg-accent/10' : ''}
              ${table.status === 'available' ? 'border-border' : ''}
            `}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-headline">{table.name}</CardTitle>
              <CardDescription className="text-sm">Capacity: {table.capacity}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <span 
                  className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${table.status === 'available' ? 'bg-green-500/20 text-green-400' : ''}
                    ${table.status === 'occupied' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${table.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  `}
                >
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </span>
              </div>
              {table.currentOrderId && (
                <p className="text-xs text-muted-foreground mb-2">Order: {table.currentOrderId}</p>
              )}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-1 h-4 w-4" /> View
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-card rounded-lg shadow">
        <h2 className="text-2xl font-headline font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Button variant="secondary">Start Takeout Order</Button>
          <Button variant="secondary">View All Active Orders</Button>
          <Button variant="secondary">Access Kitchen Display (Mock)</Button>
        </div>
      </div>

    </div>
  );
}
