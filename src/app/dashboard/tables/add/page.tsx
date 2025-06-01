
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ArrowLeft } from "lucide-react";
import type { RestaurantTable } from '@/lib/types';

export default function AddTablePage() {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [tableStatus, setTableStatus] = useState<'available' | 'occupied' | 'reserved'>('available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTable: Omit<RestaurantTable, 'id'> = {
      name: tableName,
      capacity: parseInt(tableCapacity) || 0,
      status: tableStatus,
    };

    console.log("Submitting new table (mock):", newTable);
    // In a real app, you would send this to your backend to save.
    // For this prototype, we'll just log and redirect.
    // To persist, you'd need a state management solution or API to update initialTables in mock-data.
    alert("Table added (mock)! Check console. Data will not persist back to the list in this prototype.");
    router.push('/dashboard/tables');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Add New Table</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tables">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Table List
          </Link>
        </Button>
      </div>
      
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">New Table Details</CardTitle>
          <CardDescription>Fill in the information for the new table.</CardDescription>
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
              <Label htmlFor="tableStatus">Initial Status</Label>
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
                <PlusCircle className="mr-2 h-4 w-4" /> Add Table
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
