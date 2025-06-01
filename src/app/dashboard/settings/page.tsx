
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Building, Bell, CreditCard, Printer, WifiOff, Briefcase, FileText } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';
import type { BusinessFinancialInfo } from '@/lib/types';

export default function SettingsPage() {
  // Mock settings state
  const [restaurantName, setRestaurantName] = useState("Tabletop AI Restaurant");
  const [defaultTipPercentage, setDefaultTipPercentage] = useState(15);
  const [ivaRate, setIvaRate] = useState(13); // Example for El Salvador
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPrintKitchenOrders, setAutoPrintKitchenOrders] = useState(false);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);

  const [cashierPrinter, setCashierPrinter] = useState("");
  const [kitchenPrinter, setKitchenPrinter] = useState("192.168.1.100");

  const [financialInfo, setFinancialInfo] = useState<BusinessFinancialInfo>({
    businessName: "", // Nombre Comercial
    legalName: "", // Nombre o Razón Social
    nit: "",
    nrc: "",
    taxpayerType: "", // Tipo de Contribuyente
    economicActivity: "", // Actividad Económica (Giro)
    email: "",
    phone: "",
    address: "",
    municipality: "",
    department: "",
  });

  const handleFinancialInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFinancialInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Settings saved:", { 
        restaurantName, 
        defaultTipPercentage, 
        ivaRate, 
        notificationsEnabled, 
        autoPrintKitchenOrders, 
        offlineModeEnabled,
        cashierPrinter,
        kitchenPrinter,
        financialInfo 
    });
    alert("Settings saved successfully! (This is a mock save)");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Application Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 mb-6">
          <TabsTrigger value="general"><Building className="mr-0 md:mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />General</TabsTrigger>
          <TabsTrigger value="financial"><CreditCard className="mr-0 md:mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Financial</TabsTrigger>
          <TabsTrigger value="business_info"><Briefcase className="mr-0 md:mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Business Info</TabsTrigger>
          <TabsTrigger value="printers"><Printer className="mr-0 md:mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Printers</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-0 md:mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Notifications</TabsTrigger>
          <TabsTrigger value="offline"><WifiOff className="mr-0 md:mr-2 h-4 w-4 inline-block md:hidden lg:inline-block" />Offline</TabsTrigger>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business_info">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Business Financial Information (El Salvador DTE)</CardTitle>
              <CardDescription>Enter details required for electronic invoicing (DTE).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="businessName">Business Name (Nombre Comercial)</Label>
                    <Input id="businessName" name="businessName" value={financialInfo.businessName} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="legalName">Legal Name / Social Reason (Razón Social)</Label>
                    <Input id="legalName" name="legalName" value={financialInfo.legalName} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="nit">NIT</Label>
                    <Input id="nit" name="nit" value={financialInfo.nit} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="nrc">NRC</Label>
                    <Input id="nrc" name="nrc" value={financialInfo.nrc} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="taxpayerType">Taxpayer Type (Tipo de Contribuyente)</Label>
                    <Input id="taxpayerType" name="taxpayerType" value={financialInfo.taxpayerType} onChange={handleFinancialInfoChange} placeholder="e.g., Persona Natural, Sociedad Anónima"/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="economicActivity">Economic Activity (Actividad Económica / Giro)</Label>
                    <Input id="economicActivity" name="economicActivity" value={financialInfo.economicActivity} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={financialInfo.email} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="phone">Telephone Number</Label>
                    <Input id="phone" name="phone" value={financialInfo.phone} onChange={handleFinancialInfoChange} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address (Dirección Completa)</Label>
                <Textarea id="address" name="address" value={financialInfo.address} onChange={handleFinancialInfoChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="municipality">Municipality (Municipio)</Label>
                    <Input id="municipality" name="municipality" value={financialInfo.municipality} onChange={handleFinancialInfoChange} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="department">Department (Departamento)</Label>
                    <Input id="department" name="department" value={financialInfo.department} onChange={handleFinancialInfoChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="printers">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Printer Configuration</CardTitle>
              <CardDescription>Settings for cashier and kitchen printers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="cashierPrinter">Cashier Printer IP/Name</Label>
                    <Input id="cashierPrinter" value={cashierPrinter} onChange={e => setCashierPrinter(e.target.value)} placeholder="e.g., EPSON_TM_U220_Cashier or 192.168.1.101" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="kitchenPrinter">Kitchen Printer IP/Name</Label>
                    <Input id="kitchenPrinter" value={kitchenPrinter} onChange={e => setKitchenPrinter(e.target.value)} placeholder="e.g., 192.168.1.100 or KITCHEN_PRINTER_MAIN" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="autoPrintKitchen" className="text-base">Auto-print Kitchen Orders</Label>
                        <p className="text-sm text-muted-foreground">Automatically send new orders or items to the kitchen printer.</p>
                    </div>
                    <Switch id="autoPrintKitchen" checked={autoPrintKitchenOrders} onCheckedChange={setAutoPrintKitchenOrders} />
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
