
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import type { NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/logo';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";


export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-2 md:justify-start md:px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-primary font-headline">
          <Logo className="h-6 w-auto text-primary" />
          <span className="hidden group-data-[state=expanded]:md:inline">{APP_NAME}</span>
        </Link>
      </div>
      <SidebarMenu>
        {NAV_ITEMS.map((item: NavItem) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              tooltip={{children: item.label, className: "group-data-[state=expanded]:hidden"}}
            >
              <Link href={item.href}>
                <item.icon />
                <span className="group-data-[state=expanded]:md:inline">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}
