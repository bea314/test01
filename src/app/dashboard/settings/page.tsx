
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Building, Bell, CreditCard, Printer, WifiOff } from "lucide-react";

export default function SettingsPage() {
  // Mock settings state
  const [restaurantName, setRestaurantName] = useState("Tabletop AI Restaurant");
  const [defaultTipPercentage, setDefaultTipPercentage] = useState(15);
  const [ivaRate, setIvaRate] = useState(13); // Example for El Salvador
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPrintKitchenOrders, setAutoPrintKitchenOrders] = useState(false);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);

  const handleSaveChanges = () => {
    // Placeholder for saving settings
    console.log("Settings saved:", { restaurantName, defaultTipPercentage, ivaRate, notificationsEnabled, autoPrintKitchenOrders, offlineModeEnabled });
    // Here you would typically call an API to save the settings
    alert("Settings saved successfully! (This is a mock save)");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Application Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
          <TabsTrigger value="general"><Building className="mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />General</TabsTrigger>
          <TabsTrigger value="financial"><CreditCard className="mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Financial</TabsTrigger>
          <TabsTrigger value="kitchen"><Printer className="mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Kitchen</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Notifications</TabsTrigger>
          <TabsTrigger value="offline"><WifiOff className="mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">General Settings</CardTitle>
              <CardDescription>Manage basic restaurant information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input id="restaurantName" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
              </div>
              {/* Add more general settings here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Financial Settings</CardTitle>
              <CardDescription>Configure tax rates, tip percentages, and payment options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultTip">Default Tip Percentage</Label>
                <Input id="defaultTip" type="number" value={defaultTipPercentage} onChange={e => setDefaultTipPercentage(parseFloat(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ivaRate">Local Tax Rate (IVA %)</Label>
                <Input id="ivaRate" type="number" value={ivaRate} onChange={e => setIvaRate(parseFloat(e.target.value))} />
                <p className="text-xs text-muted-foreground">e.g., 13 for 13%</p>
              </div>
              {/* DTE related settings could go here if global */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kitchen">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Kitchen & Printing</CardTitle>
              <CardDescription>Settings related to kitchen order management and printing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="autoPrintKitchen" className="text-base">Auto-print Kitchen Orders</Label>
                        <p className="text-sm text-muted-foreground">Automatically send new orders or items to the kitchen printer.</p>
                    </div>
                    <Switch id="autoPrintKitchen" checked={autoPrintKitchenOrders} onCheckedChange={setAutoPrintKitchenOrders} />
                </div>
                 {/* Add printer configuration settings here */}
                 <div>
                    <Label htmlFor="kitchenPrinter">Kitchen Printer IP/Name</Label>
                    <Input id="kitchenPrinter" placeholder="e.g., 192.168.1.100 or EPSON_TM_T20" />
                 </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications for important events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="notificationsEnabled" className="text-base">Enable Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts for new orders, low stock, etc.</p>
                    </div>
                    <Switch id="notificationsEnabled" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                {/* More granular notification settings */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Offline Mode</CardTitle>
              <CardDescription>Configure offline functionality and data synchronization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="offlineModeEnabled" className="text-base">Enable Offline Mode</Label>
                        <p className="text-sm text-muted-foreground">Allow the app to function without an internet connection. Data syncs when back online.</p>
                    </div>
                    <Switch id="offlineModeEnabled" checked={offlineModeEnabled} onCheckedChange={setOfflineModeEnabled} />
                </div>
                <p className="text-sm text-muted-foreground">
                    Offline mode status: {offlineModeEnabled ? 'Enabled' : 'Disabled'}. Data will be stored locally and synced upon reconnection.
                </p>
                 {/* Sync status, manual sync button */}
                 <Button variant="outline">Sync Data Now (Mock)</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleSaveChanges}>
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

