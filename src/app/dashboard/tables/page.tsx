
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Grid } from "lucide-react";
import type { RestaurantTable } from '@/lib/types';
import { initialTables as allTables } from '@/lib/mock-data';

export default function TablesPage() {
  const [displayTables, setDisplayTables] = useState<RestaurantTable[]>(allTables);

  useEffect(() => {
    setDisplayTables(allTables);
  }, []);

  const handleDelete = (tableId: string) => {
    setDisplayTables(prevTables => prevTables.filter(t => t.id !== tableId));
    alert(`Mock delete for table ID: ${tableId}. This change is temporary and won't affect other pages using the shared mock data unless the page is reloaded or they re-fetch.`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">Table Management</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/tables/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
            </Link>
          </Button>
           <Button variant="secondary">
              <Grid className="mr-2 h-4 w-4" /> Configure Visual Layout (Mock)
            </Button>
        </div>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Existing Tables</CardTitle>
          <CardDescription>View and manage your restaurant's tables. Click "Add New Table" to create one, or "Edit" on an existing table.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
            {displayTables.length === 0 && <p className="text-muted-foreground py-10 text-center">No tables configured. Add one using the "Add New Table" button.</p>}
            {displayTables.map(table => (
              <Card key={table.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                <div>
                  <h3 className="font-semibold text-lg font-headline">{table.name}</h3>
                  <p className="text-sm text-muted-foreground">Capacity: {table.capacity}</p>
                  <p className={`text-sm font-medium ${
                    table.status === 'available' ? 'text-green-500' :
                    table.status === 'occupied' ? 'text-blue-500' : // Updated to blue for consistency with badges
                    table.status === 'reserved' ? 'text-yellow-500' :
                    'text-muted-foreground' // Fallback
                  }`}>
                    Status: {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                  </p>
                  {table.currentOrderId && <p className="text-xs text-muted-foreground">Current Order: {table.currentOrderId}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/tables/edit/${table.id}`}>
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(table.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
