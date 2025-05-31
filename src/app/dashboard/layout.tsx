
import type { ReactNode } from 'react';
import { DashboardHeader } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { 
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarRail
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border">
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
