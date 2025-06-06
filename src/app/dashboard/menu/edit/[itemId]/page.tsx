
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, UploadCloud, ArrowLeft, Loader2 } from "lucide-react";
import type { MenuItem as MenuItemType, AllergyTag, MenuItemCategory } from '@/lib/types';
import { ALLERGY_TAG_OPTIONS } from '@/lib/types';
import { initialMenuItems, mockCategories } from '@/lib/mock-data';
import Link from 'next/link';

export default function EditMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  const [menuItem, setMenuItem] = useState<MenuItemType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState<string | undefined>(undefined);
  const [itemAvailability, setItemAvailability] = useState<'available' | 'unavailable'>('available');
  const [itemNumber, setItemNumber] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemAllergiesNotes, setItemAllergiesNotes] = useState('');
  const [itemAllergyTags, setItemAllergyTags] = useState<AllergyTag[]>([]);

  const [categories, setCategories] = useState<MenuItemCategory[]>([]);

  useEffect(() => {
    setCategories(mockCategories); // Load categories
    if (itemId) {
      const itemToEdit = initialMenuItems.find(item => item.id === itemId);
      if (itemToEdit) {
        setMenuItem(itemToEdit);
        setItemName(itemToEdit.name);
        setItemDescription(itemToEdit.description);
        setItemPrice(itemToEdit.price.toString());
        setItemCategoryId(itemToEdit.category.id);
        setItemAvailability(itemToEdit.availability);
        setItemNumber(itemToEdit.number || '');
        setItemImageUrl(itemToEdit.imageUrl || '');
        setItemAllergiesNotes(itemToEdit.allergiesNotes || '');
        setItemAllergyTags(itemToEdit.allergyTags || []);
      } else {
        alert("Menu item not found!");
        router.push('/dashboard/menu');
      }
      setIsLoading(false);
    }
  }, [itemId, router]);

  const handleAllergyTagChange = (tag: AllergyTag, checked: boolean) => {
    setItemAllergyTags(prev => 
      checked ? [...prev, tag] : prev.filter(t => t !== tag)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;

    const selectedCat = categories.find(cat => cat.id === itemCategoryId);
    if (!selectedCat) {
        alert("Please select a category.");
        return;
    }

    const updatedItem: MenuItemType = {
      ...menuItem,
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice) || 0,
      category: selectedCat,
      availability: itemAvailability,
      number: itemNumber,
      imageUrl: itemImageUrl || `https://placehold.co/150x100.png?text=${itemName.replace(/\s/g,'+')}`,
      dataAiHint: itemName.toLowerCase().split(' ').slice(0,2).join(' '),
      allergiesNotes: itemAllergiesNotes,
      allergyTags: itemAllergyTags,
    };

    console.log("Updating menu item (mock):", updatedItem);
    // Update initialMenuItems for mock persistence (demonstration only)
    const itemIndex = initialMenuItems.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      initialMenuItems[itemIndex] = updatedItem;
    }
    alert("Menu item updated (mock)! Check console. Data changes will not persist back to the list in this prototype across page reloads unless mock data is statefully managed.");
    router.push('/dashboard/menu');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading item details...</p>
      </div>
    );
  }

  if (!menuItem && !isLoading) {
     return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Menu Item Not Found</h1>
        <Button asChild variant="outline">
            <Link href="/dashboard/menu"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">Edit Menu Item</h1>
            <Button variant="outline" asChild>
                <Link href="/dashboard/menu">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu List
                </Link>
            </Button>
        </div>
      
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Item Details</CardTitle>
          <CardDescription>Modify the information for menu item: {menuItem?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="itemNumber">Item Number/Code</Label>
              <Input id="itemNumber" value={itemNumber} onChange={e => setItemNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea id="itemDescription" value={itemDescription} onChange={e => setItemDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="itemPrice">Price</Label>
              <Input id="itemPrice" type="number" step="0.01" value={itemPrice} onChange={e => setItemPrice(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="itemCategory">Category</Label>
              <Select value={itemCategoryId} onValueChange={setItemCategoryId} required>
                <SelectTrigger id="itemCategory"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemAvailability">Availability</Label>
              <Select value={itemAvailability} onValueChange={(value) => setItemAvailability(value as 'available' | 'unavailable')} required>
                <SelectTrigger id="itemAvailability"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="itemImageUrl">Image URL (Optional)</Label>
              <Input id="itemImageUrl" value={itemImageUrl} onChange={e => setItemImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
            </div>
             <Button type="button" variant="outline" className="w-full">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Image (Mock)
            </Button>

            <div>
              <Label>Allergy Tags</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md">
                {ALLERGY_TAG_OPTIONS.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`allergy-${tag}`} 
                      checked={itemAllergyTags.includes(tag)}
                      onCheckedChange={(checked) => handleAllergyTagChange(tag, !!checked)}
                    />
                    <Label htmlFor={`allergy-${tag}`} className="text-sm font-normal capitalize">
                      {tag.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
                <Label htmlFor="itemAllergiesNotes">Additional Allergy Notes (Optional)</Label>
                <Textarea id="itemAllergiesNotes" value={itemAllergiesNotes} onChange={e => setItemAllergiesNotes(e.target.value)} placeholder="e.g., Contains nuts, gluten-free option available"/>
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
