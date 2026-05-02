
"use client";

import React, { useEffect } from "react";
import Link from "next/navigation"; // Not using Link here as intended, keeping existing logic
import { usePathname, useRouter } from "next/navigation";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { navItems } from "./nav-config";
import { Button } from "@/components/ui/button";
import { HeartPulse, LogOut, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";
import NextLink from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password' && pathname !== '/') {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPublicPage = ['/login', '/signup', '/forgot-password', '/'].includes(pathname);
  if (isPublicPage) return <>{children}</>;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 flex flex-row items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <HeartPulse className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-primary">SwasthyaAI</span>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <NextLink href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-secondary">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </NextLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <header className="h-16 flex items-center px-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
            <SidebarTrigger className="md:hidden mr-4" />
            <h2 className="font-headline font-semibold text-lg">
              {navItems.find(item => item.href === pathname)?.title || "Welcome"}
            </h2>
          </header>
          <main className="flex-1 overflow-y-auto p-6 relative">
            {children}
            <ChatbotButton />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
