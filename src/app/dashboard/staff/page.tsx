
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, UserPlus, Users } from "lucide-react";
import type { User, UserRole } from '@/lib/types'; // Assuming User and UserRole types exist
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const initialStaff: User[] = [
  { id: "staff1", name: "Alice Wonderland", email: "alice@tabletop.ai", role: "admin" },
  { id: "staff2", name: "Bob The Builder", email: "bob@tabletop.ai", role: "waiter" },
  { id: "staff3", name: "Charlie Chaplin", email: "charlie@tabletop.ai", role: "cashier" },
];

const userRoles: UserRole[] = ['admin', 'cashier', 'waiter'];

export default function StaffPage() {
  const [staffList, setStaffList] = useState<User[]>(initialStaff);
  const [isEditing, setIsEditing] = useState<User | null>(null);

  // Form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('waiter');
  const [staffPassword, setStaffPassword] = useState(''); // For new users or password change

  const handleEdit = (staffMember: User) => {
    setIsEditing(staffMember);
    setStaffName(staffMember.name);
    setStaffEmail(staffMember.email);
    setStaffRole(staffMember.role);
    setStaffPassword(''); // Clear password field on edit
  };

  const handleDelete = (staffId: string) => {
    setStaffList(prevStaff => prevStaff.filter(s => s.id !== staffId));
  };

  const resetForm = () => {
    setIsEditing(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('waiter');
    setStaffPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || ( !isEditing && !staffPassword)) {
        alert("Please fill in all required fields.");
        return;
    }
    const newStaffMember: User = {
      id: isEditing ? isEditing.id : Date.now().toString(),
      name: staffName,
      email: staffEmail,
      role: staffRole,
      // Password handling would be done on the backend
    };

    if (isEditing) {
      setStaffList(prevStaff => prevStaff.map(s => s.id === newStaffMember.id ? newStaffMember : s));
    } else {
      setStaffList(prevStaff => [newStaffMember, ...prevStaff]);
    }
    resetForm();
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline font-bold text-foreground mb-8">Staff Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <UserPlus className="mr-2 h-6 w-6" />
              {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="staffPassword">{isEditing ? 'New Password (optional)' : 'Password'}</Label>
                <Input id="staffPassword" type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} required={!isEditing} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {isEditing ? <><Edit3 className="mr-2 h-4 w-4" /> Update Staff</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add Staff</>}
                </Button>
                {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-6 w-6" />Current Staff</CardTitle>
            <CardDescription>Manage existing staff members and their roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {staffList.length === 0 && <p className="text-muted-foreground">No staff members found.</p>}
              {staffList.map(staff => (
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
                    <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}><Edit3 className="mr-1 h-4 w-4" /> Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(staff.id)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
