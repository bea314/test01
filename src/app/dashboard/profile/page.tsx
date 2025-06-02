
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserCircle, Edit3, ArrowLeft, Mail, User, Shield } from "lucide-react";

export default function ProfilePage() {
  // Placeholder user data - in a real app, this would come from auth context or API
  const user = {
    name: "Admin User",
    email: "admin@krealiares.com",
    role: "Administrator",
    initials: "AU",
    avatarUrl: "https://placehold.co/100x100.png", 
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground flex items-center">
          <UserCircle className="mr-3 h-8 w-8 text-primary" /> User Profile
        </h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
            <AvatarFallback className="text-3xl">{user.initials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-headline">{user.name}</CardTitle>
          <CardDescription>{user.role}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileName" className="flex items-center text-muted-foreground">
              <User className="mr-2 h-4 w-4" /> Full Name
            </Label>
            <Input id="profileName" value={user.name} readOnly disabled className="bg-muted/50"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileEmail" className="flex items-center text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" /> Email Address
            </Label>
            <Input id="profileEmail" type="email" value={user.email} readOnly disabled className="bg-muted/50"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileRole" className="flex items-center text-muted-foreground">
              <Shield className="mr-2 h-4 w-4" /> Role
            </Label>
            <Input id="profileRole" value={user.role} readOnly disabled className="bg-muted/50"/>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button variant="outline" disabled>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (Coming Soon)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
