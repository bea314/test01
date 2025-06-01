
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, PercentSquare, History, ListFilter, CheckSquare } from "lucide-react";
import type { DiscountPreset, MenuItem, MenuItemCategory } from '@/lib/types';
import { mockPresetDiscounts, initialMenuItems, mockCategories } from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountPreset[]>(mockPresetDiscounts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountPreset | null>(null);
  
  // Form state
  const [discountName, setDiscountName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [applicableItemIds, setApplicableItemIds] = useState<string[]>([]);
  const [applicableCategoryIds, setApplicableCategoryIds] = useState<string[]>([]);

  const { toast } = useToast();

  const openFormForNew = () => {
    setEditingDiscount(null);
    setDiscountName('');
    setDiscountPercentage('');
    setDiscountDescription('');
    setApplicableItemIds([]);
    setApplicableCategoryIds([]);
    setIsFormOpen(true);
  };

  const openFormForEdit = (discount: DiscountPreset) => {
    setEditingDiscount(discount);
    setDiscountName(discount.name);
    setDiscountPercentage(discount.percentage.toString());
    setDiscountDescription(discount.description || '');
    setApplicableItemIds(discount.applicableItemIds || []);
    setApplicableCategoryIds(discount.applicableCategoryIds || []);
    setIsFormOpen(true);
  };

  const handleSaveDiscount = () => {
    if (!discountName || !discountPercentage) {
      toast({ title: "Error", description: "Name and percentage are required.", variant: "destructive" });
      return;
    }
    const percentageNum = parseFloat(discountPercentage);
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      toast({ title: "Error", description: "Percentage must be a number between 0 and 100.", variant: "destructive" });
      return;
    }

    const newDiscountData: Partial<DiscountPreset> = {
        name: discountName,
        percentage: percentageNum,
        description: discountDescription,
        applicableItemIds: applicableItemIds.length > 0 ? applicableItemIds : undefined,
        applicableCategoryIds: applicableCategoryIds.length > 0 ? applicableCategoryIds : undefined,
    };

    if (editingDiscount) {
      const updatedDiscounts = discounts.map(d => 
        d.id === editingDiscount.id 
          ? { ...d, ...newDiscountData } 
          : d
      );
      setDiscounts(updatedDiscounts);
      // Also update mockPresetDiscounts for broader effect in prototype
      const indexInMock = mockPresetDiscounts.findIndex(d => d.id === editingDiscount.id);
      if (indexInMock > -1) mockPresetDiscounts[indexInMock] = { ...mockPresetDiscounts[indexInMock], ...newDiscountData } as DiscountPreset;
      
      toast({ title: "Discount Updated", description: `"${discountName}" has been updated.` });
    } else {
      const newDiscount: DiscountPreset = {
        id: `discount${Date.now()}`,
        ...newDiscountData,
      } as DiscountPreset;
      setDiscounts(prev => [...prev, newDiscount]);
      mockPresetDiscounts.push(newDiscount); // Add to shared mock data
      toast({ title: "Discount Added", description: `"${discountName}" has been added.` });
    }
    setIsFormOpen(false);
  };

  const handleDeleteDiscount = (discountId: string) => {
    setDiscounts(prev => prev.filter(d => d.id !== discountId));
    // Also remove from mockPresetDiscounts
    const indexInMock = mockPresetDiscounts.findIndex(d => d.id === discountId);
    if (indexInMock > -1) mockPresetDiscounts.splice(indexInMock, 1);
    toast({ title: "Discount Deleted", description: `Discount has been removed.` });
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    setApplicableItemIds(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  };
  const handleCategorySelection = (categoryId: string, checked: boolean) => {
    setApplicableCategoryIds(prev => checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId));
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground flex items-center">
          <PercentSquare className="mr-3 h-8 w-8 text-primary" /> Discount Management
        </h1>
        <div className="flex gap-2">
            <Button onClick={openFormForNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Preset Discount
            </Button>
            <Button variant="outline" disabled>
                <History className="mr-2 h-4 w-4" /> View History (Coming Soon)
            </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingDiscount ? "Edit Preset Discount" : "Add New Preset Discount"}</DialogTitle>
            <DialogDescription>
              {editingDiscount ? "Modify the details of this preset discount." : "Create a new preset discount for quick application to orders."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountName" className="text-right">Name</Label>
                <Input id="discountName" value={discountName} onChange={e => setDiscountName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountPercentage" className="text-right">Percentage (%)</Label>
                <Input id="discountPercentage" type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountDescription" className="text-right">Description</Label>
                <Input id="discountDescription" value={discountDescription} onChange={e => setDiscountDescription(e.target.value)} className="col-span-3" placeholder="(Optional)" />
              </div>
              
              <div className="col-span-4 mt-2">
                <Label className="font-semibold flex items-center"><ListFilter className="mr-2 h-4 w-4"/>Applicability (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">If no items or categories are selected, the discount applies to the entire order subtotal.</p>
              </div>

              <div className="col-span-4">
                 <Label className="text-sm font-medium">Applicable Menu Items</Label>
                 <ScrollArea className="h-32 border rounded-md p-2 mt-1">
                    {initialMenuItems.map(item => (
                        <div key={item.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                                id={`item-${item.id}`} 
                                checked={applicableItemIds.includes(item.id)}
                                onCheckedChange={(checked) => handleItemSelection(item.id, !!checked)}
                            />
                            <Label htmlFor={`item-${item.id}`} className="text-xs font-normal">{item.name}</Label>
                        </div>
                    ))}
                 </ScrollArea>
              </div>
              <div className="col-span-4">
                 <Label className="text-sm font-medium">Applicable Categories</Label>
                 <ScrollArea className="h-32 border rounded-md p-2 mt-1">
                    {mockCategories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                                id={`category-${category.id}`} 
                                checked={applicableCategoryIds.includes(category.id)}
                                onCheckedChange={(checked) => handleCategorySelection(category.id, !!checked)}
                            />
                            <Label htmlFor={`category-${category.id}`} className="text-xs font-normal">{category.name}</Label>
                        </div>
                    ))}
                 </ScrollArea>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveDiscount}>{editingDiscount ? "Save Changes" : "Add Discount"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Preset Discounts</CardTitle>
          <CardDescription>View and manage available preset discounts. These can be applied during order checkout.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[calc(100vh-25rem)]">
          <div className="space-y-3 pr-2">
            {discounts.length === 0 && (
              <p className="text-muted-foreground py-10 text-center">No preset discounts configured. Click "Add New Preset Discount" to create one.</p>
            )}
            {discounts.map(discount => (
              <Card key={discount.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-muted/30 transition-colors">
                <div>
                  <h3 className="font-semibold text-lg font-headline">{discount.name} - <span className="text-primary">{discount.percentage}%</span></h3>
                  <p className="text-sm text-muted-foreground">{discount.description || "No description"}</p>
                  {(discount.applicableItemIds && discount.applicableItemIds.length > 0) && (
                    <p className="text-xs text-blue-500 mt-1">Applies to: {discount.applicableItemIds.map(id => initialMenuItems.find(i=>i.id===id)?.name || 'Unknown Item').join(', ')}</p>
                  )}
                  {(discount.applicableCategoryIds && discount.applicableCategoryIds.length > 0) && (
                    <p className="text-xs text-blue-500 mt-1">Applies to categories: {discount.applicableCategoryIds.map(id => mockCategories.find(c=>c.id===id)?.name || 'Unknown Category').join(', ')}</p>
                  )}

                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                  <Button variant="outline" size="sm" onClick={() => openFormForEdit(discount)}>
                    <Edit3 className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteDiscount(discount.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

