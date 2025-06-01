
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import type { RestaurantTable } from '@/lib/types';
import { initialTables } from '@/lib/mock-data'; // Import mock data

export default function EditTablePage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;

  const [table, setTable] = useState<RestaurantTable | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [tableStatus, setTableStatus] = useState<'available' | 'occupied' | 'reserved'>('available');

  useEffect(() => {
    if (tableId) {
      // Simulate fetching table data
      const tableToEdit = initialTables.find(t => t.id === tableId);
      if (tableToEdit) {
        setTable(tableToEdit);
        setTableName(tableToEdit.name);
        setTableCapacity(tableToEdit.capacity.toString());
        setTableStatus(tableToEdit.status);
      } else {
        alert("Table not found!");
        router.push('/dashboard/tables');
      }
      setIsLoading(false);
    }
  }, [tableId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) return;

    const updatedTable: RestaurantTable = {
      ...table,
      name: tableName,
      capacity: parseInt(tableCapacity) || 0,
      status: tableStatus,
    };

    console.log("Updating table (mock):", updatedTable);
    // In a real app, you would send this to your backend.
    // For this prototype, changes won't persist back to the list unless initialTables in mock-data.ts is manually updated.
    alert("Table updated (mock)! Check console. Data changes will not persist back to the list in this prototype.");
    router.push('/dashboard/tables');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading table details...</p>
      </div>
    );
  }

  if (!table && !isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Table Not Found</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/tables"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Table List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Edit Table</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tables">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Table List
          </Link>
        </Button>
      </div>
      
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Table Details</CardTitle>
          <CardDescription>Modify the information for table: {table?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="tableName">Table Name/Number</Label>
              <Input id="tableName" value={tableName} onChange={e => setTableName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="tableCapacity">Capacity</Label>
              <Input id="tableCapacity" type="number" value={tableCapacity} onChange={e => setTableCapacity(e.target.value)} required min="1" />
            </div>
            <div>
              <Label htmlFor="tableStatus">Status</Label>
              <Select value={tableStatus} onValueChange={(value) => setTableStatus(value as 'available' | 'occupied' | 'reserved')} required>
                <SelectTrigger id="tableStatus"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
