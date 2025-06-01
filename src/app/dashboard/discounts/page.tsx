
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, PercentSquare, History } from "lucide-react";
import type { DiscountPreset } from '@/lib/types';
import { mockPresetDiscounts, initialMenuItems, mockCategories } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountPreset[]>(mockPresetDiscounts);
  const { toast } = useToast();

  // This useEffect ensures that if mockPresetDiscounts is updated elsewhere (e.g., by adding/editing),
  // this page reflects the latest data upon navigation or re-render.
  useEffect(() => {
    setDiscounts([...mockPresetDiscounts]);
  }, []);


  const handleDeleteDiscount = (discountId: string) => {
    // Find index in the main mockPresetDiscounts array
    const indexInMock = mockPresetDiscounts.findIndex(d => d.id === discountId);
    if (indexInMock > -1) {
      mockPresetDiscounts.splice(indexInMock, 1);
      setDiscounts([...mockPresetDiscounts]); // Update local state from the modified source
      toast({ title: "Discount Deleted", description: `Discount has been removed.` });
    } else {
      toast({ title: "Error", description: "Discount not found for deletion.", variant: "destructive" });
    }
  };

  const getItemName = (itemId: string) => initialMenuItems.find(i => i.id === itemId)?.name || 'Unknown Item';
  const getCategoryName = (categoryId: string) => mockCategories.find(c => c.id === categoryId)?.name || 'Unknown Category';

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground flex items-center">
          <PercentSquare className="mr-3 h-8 w-8 text-primary" /> Discount Management
        </h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/dashboard/discounts/add">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Preset Discount
                </Link>
            </Button>
            <Button variant="outline" disabled>
                <History className="mr-2 h-4 w-4" /> View History (Coming Soon)
            </Button>
        </div>
      </div>
      
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
                  {discount.couponCode && <p className="text-sm text-muted-foreground">Code: <Badge variant="outline">{discount.couponCode}</Badge></p>}
                  <p className="text-sm text-muted-foreground mt-1">{discount.description || "No description"}</p>
                  {(discount.applicableItemIds && discount.applicableItemIds.length > 0) && (
                    <p className="text-xs text-blue-500 mt-1">Applies to items: {discount.applicableItemIds.map(getItemName).join(', ')}</p>
                  )}
                  {(discount.applicableCategoryIds && discount.applicableCategoryIds.length > 0) && (
                    <p className="text-xs text-blue-500 mt-1">Applies to categories: {discount.applicableCategoryIds.map(getCategoryName).join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/discounts/edit/${discount.id}`}>
                        <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Link>
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
