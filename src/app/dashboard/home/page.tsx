
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LayoutGrid, ShoppingBag, Truck, ListOrdered, Settings, Eye } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ title, description, icon: Icon, href }) => (
  <Card className={`shadow-lg hover:shadow-xl transition-shadow flex flex-col bg-card hover:bg-muted/30 border`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 text-primary`} />
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow p-4 pt-0">
      <p className="text-sm text-muted-foreground mb-4 flex-grow">{description}</p>
      <div className="mt-auto">
        <Button asChild variant={"default"} className="w-full">
          <Link href={href}>
            {title.startsWith("New") || title.startsWith("Start") ? "Start Now" : "Go to " + title}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const SecondaryActionListItem: React.FC<QuickActionProps> = ({ title, description, icon: Icon, href }) => (
  <li>
    <Link href={href} className="block p-4 border rounded-lg hover:bg-muted/5 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring">
      <div className="flex items-center gap-4">
        <Icon className="h-7 w-7 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-md">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  </li>
);

export default function HomePage() {
  const primaryActions: QuickActionProps[] = [
    {
      title: "New Table Order",
      description: "Start an order for customers dining in. Assign to a table.",
      icon: LayoutGrid,
      href: "/dashboard/orders?type=Dine-in",
    },
    {
      title: "New Takeout Order",
      description: "Create an order for customers to pick up.",
      icon: ShoppingBag,
      href: "/dashboard/orders?type=Takeout",
    },
    {
      title: "New Delivery Order",
      description: "Prepare an order for delivery service.",
      icon: Truck,
      href: "/dashboard/orders?type=Delivery",
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
        <ul className="space-y-6 max-w-xl mx-auto">
          {secondaryActions.map((action) => (
            <SecondaryActionListItem key={action.title} {...action} />
          ))}
        </ul>
      </section>
    </div>
  );
}
