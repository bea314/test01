
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Loader2, UserCog } from "lucide-react";
import type { User, UserRole } from '@/lib/types';
import { initialStaff, userRoles } from '@/lib/mock-data'; // Import mock data

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.staffId as string;

  const [staffMember, setStaffMember] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('waiter');
  const [staffPassword, setStaffPassword] = useState(''); // For password change, optional

  useEffect(() => {
    if (staffId) {
      const memberToEdit = initialStaff.find(s => s.id === staffId);
      if (memberToEdit) {
        setStaffMember(memberToEdit);
        setStaffName(memberToEdit.name);
        setStaffEmail(memberToEdit.email);
        setStaffRole(memberToEdit.role);
      } else {
        alert("Staff member not found!");
        router.push('/dashboard/staff');
      }
      setIsLoading(false);
    }
  }, [staffId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffMember) return;

    const updatedStaffMember: User = {
      ...staffMember,
      name: staffName,
      email: staffEmail,
      role: staffRole,
      // Password update logic would typically be separate or require current password
    };

    console.log("Updating staff member (mock):", updatedStaffMember);
    // In a real app, password updates are handled more securely.
    // Changes won't persist back to the list unless initialStaff in mock-data.ts is manually updated.
    alert("Staff member updated (mock)! Check console. Data changes will not persist back to the list in this prototype.");
    router.push('/dashboard/staff');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading staff details...</p>
      </div>
    );
  }

  if (!staffMember && !isLoading) {
     return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Staff Member Not Found</h1>
        <Button asChild variant="outline">
            <Link href="/dashboard/staff"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Edit Staff Member</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/staff">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff List
          </Link>
        </Button>
      </div>
      
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><UserCog className="mr-2 h-5 w-5" />Staff Details</CardTitle>
          <CardDescription>Modify the information for staff member: {staffMember?.name}</CardDescription>
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
              <Label htmlFor="staffPassword">New Password (Optional)</Label>
              <Input id="staffPassword" type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} placeholder="Leave blank to keep current password" />
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
