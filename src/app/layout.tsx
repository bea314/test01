import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// import { Analytics } from "@firebase/analytics"; // Assuming firebase is setup elsewhere
// import { app } from "@/lib/firebase"; // Assuming firebase config is in lib/firebase


export const metadata: Metadata = {
  title: 'Tabletop AI',
  description: 'Restaurant Management System with AI Features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en"> {/* Removed className="dark" */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
