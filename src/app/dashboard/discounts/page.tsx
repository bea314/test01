
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, PercentSquare, History } from "lucide-react";
import type { DiscountPreset } from '@/lib/types';
import { mockPresetDiscounts } from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountPreset[]>(mockPresetDiscounts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountPreset | null>(null);
  const [discountName, setDiscountName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const { toast } = useToast();

  const openFormForNew = () => {
    setEditingDiscount(null);
    setDiscountName('');
    setDiscountPercentage('');
    setDiscountDescription('');
    setIsFormOpen(true);
  };

  const openFormForEdit = (discount: DiscountPreset) => {
    setEditingDiscount(discount);
    setDiscountName(discount.name);
    setDiscountPercentage(discount.percentage.toString());
    setDiscountDescription(discount.description || '');
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

    if (editingDiscount) {
      // Mock edit
      const updatedDiscounts = discounts.map(d => 
        d.id === editingDiscount.id 
          ? { ...d, name: discountName, percentage: percentageNum, description: discountDescription } 
          : d
      );
      setDiscounts(updatedDiscounts);
      toast({ title: "Discount Updated", description: `"${discountName}" has been updated.` });
    } else {
      // Mock add
      const newDiscount: DiscountPreset = {
        id: `discount${Date.now()}`,
        name: discountName,
        percentage: percentageNum,
        description: discountDescription,
      };
      setDiscounts(prev => [...prev, newDiscount]);
      toast({ title: "Discount Added", description: `"${discountName}" has been added.` });
    }
    setIsFormOpen(false);
  };

  const handleDeleteDiscount = (discountId: string) => {
    // Mock delete
    setDiscounts(prev => prev.filter(d => d.id !== discountId));
    toast({ title: "Discount Deleted", description: `Discount has been removed.` });
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingDiscount ? "Edit Preset Discount" : "Add New Preset Discount"}</DialogTitle>
            <DialogDescription>
              {editingDiscount ? "Modify the details of this preset discount." : "Create a new preset discount for quick application to orders."}
            </DialogDescription>
          </DialogHeader>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
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
          <div className="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
            {discounts.length === 0 && (
              <p className="text-muted-foreground py-10 text-center">No preset discounts configured. Click "Add New Preset Discount" to create one.</p>
            )}
            {discounts.map(discount => (
              <Card key={discount.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                <div>
                  <h3 className="font-semibold text-lg font-headline">{discount.name} - <span className="text-primary">{discount.percentage}%</span></h3>
                  <p className="text-sm text-muted-foreground">{discount.description || "No description"}</p>
                </div>
                <div className="flex gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
}
