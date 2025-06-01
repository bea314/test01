
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Search, Info } from "lucide-react";
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { initialMenuItems as allMenuItems, mockCategories } from '@/lib/mock-data'; // Use imported mock data
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MenuPage() {
  // This local state is just for display filtering and mock delete.
  // Actual add/edit will happen on separate pages and won't reflect here without a backend.
  const [displayItems, setDisplayItems] = useState<MenuItem[]>(allMenuItems);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate fetching or initializing menu items for display
    setDisplayItems(allMenuItems);
  }, []);


  const handleDelete = (itemId: string) => {
    // This is a mock delete. It won't persist if you navigate away and come back,
    // as `initialMenuItems` is constant.
    setDisplayItems(prevItems => prevItems.filter(item => item.id !== itemId));
    alert(`Mock delete for item ID: ${itemId}. This change is temporary.`);
  };

  const filteredItems = displayItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">Menu Items</h1>
        <Button asChild>
          <Link href="/dashboard/menu/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Menu Item
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Current Menu</CardTitle>
          <CardDescription>View and manage your menu items. Click "Add New Menu Item" to create one, or "Edit" on an existing item.</CardDescription>
          <Input 
            placeholder="Search items by name or code..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mt-4 max-w-sm"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
            {filteredItems.length === 0 && <p className="text-muted-foreground py-10 text-center">No items found matching your search or no items added yet.</p>}
            {filteredItems.map(item => (
              <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 hover:bg-muted/30 transition-colors">
                <Image 
                  src={item.imageUrl || `https://placehold.co/100x75.png?text=${item.name.replace(/\s/g,'+')}`} 
                  alt={item.name} 
                  width={100} height={75} 
                  className="rounded-md object-cover aspect-[4/3] self-center sm:self-start flex-shrink-0"
                  data-ai-hint="food item"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg font-headline">{item.name} <span className="text-sm text-muted-foreground">({item.number})</span></h3>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{item.description}</p>
                  <p className="text-sm">Price: <span className="font-medium text-primary">${item.price.toFixed(2)}</span></p>
                  <p className="text-sm">Category: {item.category.name}</p>
                  <p className={`text-sm font-medium ${item.availability === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.availability.charAt(0).toUpperCase() + item.availability.slice(1)}
                  </p>
                  {item.allergiesNotes && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-amber-600 mt-1 flex items-center cursor-default">
                            <Info className="h-3 w-3 mr-1" /> Allergy Info
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">{item.allergiesNotes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 sm:mt-0 self-end sm:self-center flex-shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/menu/edit/${item.id}`}>
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
