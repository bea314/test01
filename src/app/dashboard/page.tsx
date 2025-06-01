
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Eye } from "lucide-react";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { initialTables as mockTables } from '@/lib/mock-data'; // Import from mock-data

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Visual Table Management</h1>
        <Button asChild>
          <Link href="/dashboard/tables/add">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Table
          </Link>
        </Button>
      </div>
      
      <p className="mb-8 text-muted-foreground">
        Click on a table's 'View' button to start an order or see details, or 'Edit' to modify table settings.
        Table statuses are color-coded for quick insights.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockTables.map((table) => (
          <Card 
            key={table.id} 
            className={cn(
              "shadow-lg rounded-lg overflow-hidden transition-all hover:shadow-xl flex flex-col",
              {
                'border-green-500 bg-card': table.status === 'available',
                'border-blue-500 bg-blue-500/20': table.status === 'occupied',
                'border-yellow-500 bg-yellow-500/20': table.status === 'reserved',
                'border-border': !['available', 'occupied', 'reserved'].includes(table.status) // Fallback
              }
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-headline">{table.name}</CardTitle>
              <CardDescription className="text-sm">Capacity: {table.capacity}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div className="mb-3 flex-grow">
                <span 
                  className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${table.status === 'available' ? 'bg-green-500/20 text-green-400' : ''}
                    ${table.status === 'occupied' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${table.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  `}
                >
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </span>
              
                {table.currentOrderId && (
                  <p className="text-xs text-muted-foreground mt-2">Order: #{table.currentOrderId.slice(-4)}</p>
                )}
              </div>
              <div className="flex space-x-2 mt-auto">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={
                    table.status === 'occupied' && table.currentOrderId 
                    ? `/dashboard/active-orders/${table.currentOrderId}`
                    : `/dashboard/orders?type=Dine-in&tableId=${table.id}`
                  }>
                    <Eye className="mr-1 h-4 w-4" /> View
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/tables/edit/${table.id}`}>
                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
