
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Search, Info, LayoutGrid, List, Tag, Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MenuItem, MenuItemCategory } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { 
  initialMenuItems as allMenuItems, 
  mockCategories as allCategories,
  addMockCategory,
  editMockCategory,
  deleteMockCategory
} from '@/lib/mock-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { cn } from '@/lib/utils';

type MenuView = 'grid' | 'list';

export default function MenuPage() {
  const [displayItems, setDisplayItems] = useState<MenuItem[]>(allMenuItems);
  const [categories, setCategories] = useState<MenuItemCategory[]>(allCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | 'all'>('all');
  const [menuView, setMenuView] = useState<MenuView>('grid');

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuItemCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');


  useEffect(() => {
    setDisplayItems(allMenuItems);
    setCategories(allCategories); // Load categories from mock-data
  }, []);

  const handleDeleteItem = (itemId: string) => {
    setDisplayItems(prevItems => prevItems.filter(item => item.id !== itemId));
    alert(`Mock delete for item ID: ${itemId}. This change is temporary.`);
  };

  const filteredItems = displayItems.filter(item => 
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.number && item.number.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedFilterCategory === 'all' || item.category.id === selectedFilterCategory)
  );

  const handleManageCategories = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }
    if (editingCategory) {
      editMockCategory(editingCategory.id, categoryName);
    } else {
      addMockCategory(categoryName);
    }
    setCategories([...allCategories]); // Refresh categories from mock data source
    setCategoryName('');
    setEditingCategory(null);
    // setIsCategoryModalOpen(false); // Keep modal open to add more or close manually
  };

  const handleEditCategory = (category: MenuItemCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    // Modal should be open or if using separate sections, ensure form is visible
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? This might affect existing menu items.")) {
      deleteMockCategory(categoryId);
      setCategories([...allCategories]); // Refresh
      // Potentially refresh menu items if their category was affected.
      // For now, rely on console warning from deleteMockCategory.
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">Menu Items</h1>
        <div className="flex gap-2">
          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleManageCategories}>
                <Settings2 className="mr-2 h-4 w-4" /> Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-headline">Manage Categories</DialogTitle>
                <DialogDescription>Add, edit, or delete menu categories.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{editingCategory ? "Edit Category" : "Add New Category"}</h4>
                  <div className="flex gap-2 items-end">
                    <div className="grid flex-1 gap-1.5">
                      <Label htmlFor="categoryName">Name</Label>
                      <Input id="categoryName" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveCategory}>{editingCategory ? "Save Changes" : "Add Category"}</Button>
                    {editingCategory && <Button variant="ghost" onClick={() => { setEditingCategory(null); setCategoryName('');}}>Cancel Edit</Button>}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Existing Categories</h4>
                  {categories.length === 0 && <p className="text-xs text-muted-foreground">No categories defined yet.</p>}
                  <ul className="max-h-60 overflow-y-auto space-y-1">
                    {categories.map(cat => (
                      <li key={cat.id} className="flex justify-between items-center p-2 border rounded-md text-sm">
                        <span>{cat.name}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCategory(cat)}><Edit3 className="h-3 w-3"/></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/dashboard/menu/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Menu Item
            </Link>
          </Button>
        </div>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Current Menu</CardTitle>
          <CardDescription>View and manage your menu items. Click "Add New Menu Item" to create one, or "Edit" on an existing item.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
            <Input 
              placeholder="Search items by name or code..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedFilterCategory} onValueChange={(value) => setSelectedFilterCategory(value as string | 'all')}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
                <Button variant={menuView === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setMenuView('grid')} aria-label="Grid view">
                    <LayoutGrid className="h-4 w-4"/>
                </Button>
                <Button variant={menuView === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setMenuView('list')} aria-label="List view">
                    <List className="h-4 w-4"/>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "max-h-[calc(100vh-24rem)] overflow-y-auto pr-2",
            menuView === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"
          )}>
            {filteredItems.length === 0 && <p className="text-muted-foreground py-10 text-center col-span-full">No items found matching your criteria.</p>}
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className={cn(
                  "hover:bg-muted/30 transition-colors",
                  menuView === 'grid' ? "flex flex-col" : "flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4"
                )}
              >
                <Image 
                  src={item.imageUrl || `https://placehold.co/300x200.png?text=${item.name.replace(/\s/g,'+')}`} 
                  alt={item.name} 
                  width={menuView === 'grid' ? 300 : 100} 
                  height={menuView === 'grid' ? 200 : 75} 
                  className={cn(
                    "rounded-md object-cover", 
                    menuView === 'grid' ? "w-full h-40 aspect-video" : "aspect-[4/3] self-center sm:self-start flex-shrink-0"
                  )}
                  data-ai-hint={item.dataAiHint || "food item"}
                />
                <div className={cn("flex-grow", menuView === 'grid' ? "p-4" : "")}>
                  <h3 className="font-semibold text-lg font-headline">#{item.number} - {item.name}</h3>
                  {menuView === 'list' && <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">{item.description}</p> }
                  <p className="text-sm">Price: <span className="font-medium text-primary">${item.price.toFixed(2)}</span></p>
                  <p className="text-sm">Category: {categories.find(c=>c.id === item.category.id)?.name || 'Uncategorized'}</p>
                  <p className={`text-sm font-medium ${item.availability === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.availability.charAt(0).toUpperCase() + item.availability.slice(1)}
                  </p>
                  {item.allergyTags && item.allergyTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.allergyTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs capitalize">{tag.replace('-', ' ')}</Badge>
                      ))}
                    </div>
                  )}
                  {item.allergiesNotes && item.allergiesNotes.trim() && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <p className="text-xs text-amber-600 mt-1 flex items-center cursor-default">
                             <Info className="h-3 w-3 mr-1" /> Notes
                           </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">{item.allergiesNotes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-2 mt-3 sm:mt-0 flex-shrink-0",
                   menuView === 'grid' ? "p-4 pt-0 self-stretch sm:self-center" : "self-end sm:self-center"
                )}>
                  <Button variant="outline" size="sm" asChild className={cn(menuView === 'grid' ? "w-full sm:w-auto" : "")}>
                    <Link href={`/dashboard/menu/edit/${item.id}`}>
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)} className={cn(menuView === 'grid' ? "w-full sm:w-auto" : "")}>
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
