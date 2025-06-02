
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Grid, List } from "lucide-react"; // Added List
import type { RestaurantTable } from '@/lib/types';
import { initialTables as allTables } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type TableView = 'grid' | 'list';

export default function TablesPage() {
  const [displayTables, setDisplayTables] = useState<RestaurantTable[]>(allTables);
  const [tableView, setTableView] = useState<TableView>('list'); // Default to list view

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
        <div className="flex gap-2 items-center">
          <Button 
            variant={tableView === 'grid' ? 'default' : 'outline'} 
            size="icon" 
            onClick={() => setTableView('grid')}
            aria-label="Grid View"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={tableView === 'list' ? 'default' : 'outline'} 
            size="icon" 
            onClick={() => setTableView('list')}
            aria-label="List View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/dashboard/tables/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
            </Link>
          </Button>
        </div>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Existing Tables</CardTitle>
          <CardDescription>View and manage your restaurant's tables. Current view: {tableView.charAt(0).toUpperCase() + tableView.slice(1)}.</CardDescription>
        </CardHeader>
        <CardContent>
          {tableView === 'list' ? (
            <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
              {displayTables.length === 0 && <p className="text-muted-foreground py-10 text-center">No tables configured. Add one using the "Add New Table" button.</p>}
              {displayTables.map(table => (
                <Card key={table.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                  <div>
                    <h3 className="font-semibold text-lg font-headline">{table.name}</h3>
                    <p className="text-sm text-muted-foreground">Capacity: {table.capacity}</p>
                    <p className={`text-sm font-medium ${
                      table.status === 'available' ? 'text-green-500' :
                      table.status === 'occupied' ? 'text-blue-500' :
                      table.status === 'reserved' ? 'text-yellow-500' :
                      'text-muted-foreground' 
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
              {displayTables.length === 0 && <p className="text-muted-foreground py-10 text-center col-span-full">No tables configured. Add one using the "Add New Table" button.</p>}
              {displayTables.map((table) => (
                <Card 
                  key={table.id} 
                  className={cn(
                    "shadow-md rounded-lg overflow-hidden transition-all hover:shadow-lg flex flex-col",
                    {
                      'border-green-400': table.status === 'available',
                      'border-blue-400': table.status === 'occupied',
                      'border-yellow-400': table.status === 'reserved',
                    }
                  )}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-md font-headline">{table.name}</CardTitle>
                    <CardDescription className="text-xs">Capacity: {table.capacity}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow p-4 pt-0">
                    <div className="mb-2 flex-grow">
                      <span 
                        className={`px-1.5 py-0.5 text-xs font-semibold rounded-full
                          ${table.status === 'available' ? 'bg-green-500/20 text-green-400' : ''}
                          ${table.status === 'occupied' ? 'bg-blue-500/20 text-blue-400' : ''}
                          ${table.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        `}
                      >
                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                      </span>
                      {table.currentOrderId && (
                        <p className="text-xs text-muted-foreground mt-1">Order: #{table.currentOrderId.slice(-4)}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-auto">
                       <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                        <Link href={`/dashboard/tables/edit/${table.id}`}>
                          <Edit3 className="mr-1 h-3 w-3" /> Edit
                        </Link>
                      </Button>
                      <Button variant="destructive" size="xs" className="flex-1 text-xs" onClick={() => handleDelete(table.id)}>
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
