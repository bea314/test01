
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ArrowLeft, UserPlus } from "lucide-react";
import type { User, UserRole } from '@/lib/types';
import { userRoles } from '@/lib/mock-data';

export default function AddStaffPage() {
  const router = useRouter();
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('waiter');
  const [staffPassword, setStaffPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
        alert("Please fill in all required fields (Name, Email, Password).");
        return;
    }
    const newStaffMember: Omit<User, 'id'> = {
      name: staffName,
      email: staffEmail,
      role: staffRole,
      // Password would be hashed and stored by a backend in a real app
    };

    console.log("Submitting new staff member (mock):", newStaffMember);
    // To persist, you'd need a state management solution or API to update initialStaff in mock-data.
    alert("Staff member added (mock)! Check console. Data will not persist back to the list in this prototype.");
    router.push('/dashboard/staff');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Add New Staff Member</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/staff">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff List
          </Link>
        </Button>
      </div>
      
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><UserPlus className="mr-2 h-5 w-5" />Staff Details</CardTitle>
          <CardDescription>Fill in the information for the new staff member.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="staffName">Full Name</Label>
              <Input id="staffName" value={staffName} onChange={e => setStaffName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="staffEmail">Email Address</Label>
              <Input id="staffEmail" type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="staffRole">Role</Label>
              <Select value={staffRole} onValueChange={(value) => setStaffRole(value as UserRole)} required>
                <SelectTrigger id="staffRole"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="staffPassword">Password</Label>
              <Input id="staffPassword" type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} required />
            </div>
            <CardFooter className="p-0 pt-6">
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
