
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, ArrowLeft, ListFilter, Loader2, PercentSquare } from "lucide-react";
import type { DiscountPreset } from '@/lib/types';
import { mockPresetDiscounts, initialMenuItems, mockCategories } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.discountId as string;
  const { toast } = useToast();

  const [editingDiscount, setEditingDiscount] = useState<DiscountPreset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [discountName, setDiscountName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [applicableItemIds, setApplicableItemIds] = useState<string[]>([]);
  const [applicableCategoryIds, setApplicableCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (discountId) {
      const foundDiscount = mockPresetDiscounts.find(d => d.id === discountId);
      if (foundDiscount) {
        setEditingDiscount(foundDiscount);
        setDiscountName(foundDiscount.name);
        setDiscountPercentage(foundDiscount.percentage.toString());
        setDiscountDescription(foundDiscount.description || '');
        setCouponCode(foundDiscount.couponCode || '');
        setApplicableItemIds(foundDiscount.applicableItemIds || []);
        setApplicableCategoryIds(foundDiscount.applicableCategoryIds || []);
      } else {
        toast({ title: "Error", description: "Discount not found.", variant: "destructive" });
        router.push('/dashboard/discounts');
      }
      setIsLoading(false);
    }
  }, [discountId, router, toast]);

  const handleSaveDiscount = () => {
    if (!editingDiscount) return;
    if (!discountName || !discountPercentage) {
      toast({ title: "Error", description: "Name and percentage are required.", variant: "destructive" });
      return;
    }
    const percentageNum = parseFloat(discountPercentage);
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      toast({ title: "Error", description: "Percentage must be a number between 0 and 100.", variant: "destructive" });
      return;
    }

    const updatedDiscountData: Partial<DiscountPreset> = {
      name: discountName,
      percentage: percentageNum,
      description: discountDescription || undefined,
      couponCode: couponCode.trim() || undefined,
      applicableItemIds: applicableItemIds.length > 0 ? applicableItemIds : undefined,
      applicableCategoryIds: applicableCategoryIds.length > 0 ? applicableCategoryIds : undefined,
    };

    const indexInMock = mockPresetDiscounts.findIndex(d => d.id === editingDiscount.id);
    if (indexInMock > -1) {
      mockPresetDiscounts[indexInMock] = { ...mockPresetDiscounts[indexInMock], ...updatedDiscountData };
      toast({ title: "Discount Updated", description: `"${discountName}" has been updated.` });
      router.push('/dashboard/discounts');
    } else {
      toast({ title: "Error", description: "Failed to find discount to update.", variant: "destructive" });
    }
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    setApplicableItemIds(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
  };
  const handleCategorySelection = (categoryId: string, checked: boolean) => {
    setApplicableCategoryIds(prev => checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading discount details...</p>
      </div>
    );
  }

  if (!editingDiscount) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Discount not found or an error occurred.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/discounts"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Discounts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground flex items-center">
          <PercentSquare className="mr-2 h-7 w-7 text-primary" />Edit Preset Discount
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/discounts">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discounts
          </Link>
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Discount Details</CardTitle>
          <CardDescription>Modify the details for: {editingDiscount.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="discountName">Discount Name</Label>
              <Input id="discountName" value={discountName} onChange={e => setDiscountName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="discountPercentage">Percentage (%)</Label>
              <Input id="discountPercentage" type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="discountDescription">Description</Label>
              <Textarea id="discountDescription" value={discountDescription} onChange={e => setDiscountDescription(e.target.value)} placeholder="(Optional)" />
            </div>
            <div>
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input id="couponCode" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="(Optional, e.g., SUMMER20)" />
            </div>
            
            <div className="col-span-4 mt-2">
              <Label className="font-semibold flex items-center text-lg"><ListFilter className="mr-2 h-5 w-5"/>Applicability Rules</Label>
              <p className="text-sm text-muted-foreground mb-3">If no items or categories are selected, the discount applies to the entire order subtotal (excluding courtesied items).</p>
            </div>

            <div className="space-y-2">
               <Label className="text-md font-medium">Specific Menu Items</Label>
               <ScrollArea className="h-40 border rounded-md p-3">
                  {initialMenuItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-2 py-1.5">
                          <Checkbox 
                              id={`item-${item.id}`} 
                              checked={applicableItemIds.includes(item.id)}
                              onCheckedChange={(checked) => handleItemSelection(item.id, !!checked)}
                          />
                          <Label htmlFor={`item-${item.id}`} className="text-sm font-normal">{item.name} ({item.category.name})</Label>
                      </div>
                  ))}
               </ScrollArea>
            </div>
            <div className="space-y-2">
               <Label className="text-md font-medium">Entire Categories</Label>
               <ScrollArea className="h-40 border rounded-md p-3">
                  {mockCategories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2 py-1.5">
                          <Checkbox 
                              id={`category-${category.id}`} 
                              checked={applicableCategoryIds.includes(category.id)}
                              onCheckedChange={(checked) => handleCategorySelection(category.id, !!checked)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">{category.name}</Label>
                      </div>
                  ))}
               </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button onClick={handleSaveDiscount} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
