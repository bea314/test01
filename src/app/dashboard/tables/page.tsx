
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Save, Settings2, Grid } from "lucide-react";
import type { RestaurantTable } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialTables: RestaurantTable[] = [
  { id: "t1", name: "Main Table 1", status: "available", capacity: 4 },
  { id: "t2", name: "Window Seat 2", status: "occupied", capacity: 2, currentOrderId: "orderXYZ" },
  { id: "t3", name: "Patio Table A", status: "reserved", capacity: 6 },
];

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [isEditing, setIsEditing] = useState<RestaurantTable | null>(null);
  
  // Form state for adding/editing tables
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState('');
  const [tableStatus, setTableStatus] = useState<'available' | 'occupied' | 'reserved'>('available');

  const handleEdit = (table: RestaurantTable) => {
    setIsEditing(table);
    setTableName(table.name);
    setTableCapacity(table.capacity.toString());
    setTableStatus(table.status);
  };

  const handleDelete = (tableId: string) => {
    setTables(prevTables => prevTables.filter(t => t.id !== tableId));
  };

  const resetForm = () => {
    setIsEditing(null);
    setTableName('');
    setTableCapacity('');
    setTableStatus('available');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTable: RestaurantTable = {
      id: isEditing ? isEditing.id : Date.now().toString(),
      name: tableName,
      capacity: parseInt(tableCapacity) || 0,
      status: tableStatus,
    };

    if (isEditing) {
      setTables(prevTables => prevTables.map(t => t.id === newTable.id ? newTable : t));
    } else {
      setTables(prevTables => [newTable, ...prevTables]);
    }
    resetForm();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Table Setup & Editing</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-1 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">{isEditing ? 'Edit Table' : 'Add New Table'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tableName">Table Name/Number</Label>
                <Input id="tableName" value={tableName} onChange={e => setTableName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="tableCapacity">Capacity</Label>
                <Input id="tableCapacity" type="number" value={tableCapacity} onChange={e => setTableCapacity(e.target.value)} required />
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
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {isEditing ? <><Edit3 className="mr-2 h-4 w-4" /> Update Table</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Table</>}
                </Button>
                {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Section */}
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline">Existing Tables</CardTitle>
            <CardDescription>Manage your restaurant's tables here. Drag and drop functionality for re-arranging coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {tables.length === 0 && <p className="text-muted-foreground">No tables configured. Add one using the form!</p>}
              {tables.map(table => (
                <Card key={table.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                  <div>
                    <h3 className="font-semibold text-lg font-headline">{table.name}</h3>
                    <p className="text-sm text-muted-foreground">Capacity: {table.capacity}</p>
                    <p className={`text-sm font-medium ${
                      table.status === 'available' ? 'text-green-500' :
                      table.status === 'occupied' ? 'text-primary' :
                      'text-yellow-500'
                    }`}>
                      Status: {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </p>
                    {table.currentOrderId && <p className="text-xs text-muted-foreground">Current Order: {table.currentOrderId}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(table)}><Edit3 className="mr-1 h-4 w-4" /> Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(table.id)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
           <CardFooter className="border-t pt-4 mt-4">
            <Button variant="secondary">
              <Grid className="mr-2 h-4 w-4" /> Configure Visual Layout (Mock)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
