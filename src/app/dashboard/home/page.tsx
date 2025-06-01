
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, LayoutGrid, ShoppingBag, Truck, ListOrdered, Settings, Eye } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  isPrimary?: boolean;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ title, description, icon: Icon, href, isPrimary }) => (
  <Card className={`shadow-lg hover:shadow-xl transition-shadow flex flex-col ${isPrimary ? 'bg-primary/5 hover:bg-primary/10 border-primary/30' : 'hover:border-muted-foreground/20'}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow p-4 pt-0"> {/* Ensure consistent padding and flex behavior */}
      <p className="text-sm text-muted-foreground mb-4 h-10 flex-shrink-0">{description}</p>
      <div className="mt-auto"> {/* Pushes button to the bottom */}
        <Button asChild variant={isPrimary ? "default" : "outline"} className="w-full">
          <Link href={href}>
            {title.startsWith("New") || title.startsWith("Start") ? "Start Now" : "Go to " + title}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function HomePage() {
  const primaryActions: QuickActionProps[] = [
    {
      title: "New Table Order",
      description: "Start an order for customers dining in. Assign to a table.",
      icon: LayoutGrid,
      href: "/dashboard", // Link to Table View to select a table
      isPrimary: true,
    },
    {
      title: "New Takeout Order",
      description: "Create an order for customers to pick up.",
      icon: ShoppingBag,
      href: "/dashboard/orders", 
      isPrimary: true,
    },
    {
      title: "New Delivery Order",
      description: "Prepare an order for delivery service.",
      icon: Truck,
      href: "/dashboard/orders", 
      isPrimary: true,
    },
  ];

  const secondaryActions: QuickActionProps[] = [
     {
      title: "View Active Orders",
      description: "Monitor all ongoing orders and their statuses.",
      icon: ListOrdered,
      href: "/dashboard/active-orders",
    },
    {
      title: "Kitchen Display",
      description: "Access the kitchen order display (Mock).",
      icon: Eye, 
      href: "#", 
    },
    {
      title: "Settings",
      description: "Configure application and restaurant settings.",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-headline font-bold text-foreground mb-2">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-lg text-muted-foreground">
          Your central hub for managing restaurant operations.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-6 text-center">Start a New Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold text-foreground mb-6 text-center">Other Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {secondaryActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>
    </div>
  );
}
