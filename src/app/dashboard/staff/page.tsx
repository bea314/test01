
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Users } from "lucide-react";
import type { User } from '@/lib/types'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initialStaff as allStaffMembers } from '@/lib/mock-data'; 

export default function StaffPage() {
  const [displayStaff, setDisplayStaff] = useState<User[]>(allStaffMembers);

  useEffect(() => {
    setDisplayStaff(allStaffMembers);
  }, []);

  const handleDelete = (staffId: string) => {
    setDisplayStaff(prevStaff => prevStaff.filter(s => s.id !== staffId));
    alert(`Mock delete for staff ID: ${staffId}. This change is temporary and won't affect other pages using the shared mock data unless the page is reloaded or they re-fetch.`);
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground">Staff Management</h1>
        <Button asChild>
          <Link href="/dashboard/staff/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff Member
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-6 w-6" />Current Staff</CardTitle>
          <CardDescription>View and manage your staff members. Click "Add New Staff Member" to create one, or "Edit" on an existing staff member.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
            {displayStaff.length === 0 && <p className="text-muted-foreground py-10 text-center">No staff members found. Add one using the "Add New Staff Member" button.</p>}
            {displayStaff.map(staff => (
              <Card key={staff.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(staff.name)}`} alt={staff.name} data-ai-hint="avatar person" />
                    <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-md font-headline">{staff.name}</h3>
                    <p className="text-xs text-muted-foreground">{staff.email}</p>
                    <p className="text-xs text-primary">{staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/staff/edit/${staff.id}`}>
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(staff.id)}>
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
