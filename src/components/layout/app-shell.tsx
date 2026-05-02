"use client";

import React, { useEffect, useMemo } from "react";
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
import { HeartPulse, LogOut, Loader2, User, ShieldAlert, Lock, XCircle, Clock } from "lucide-react";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";
import NextLink from "next/link";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const userRole = profile?.role || "patient";
  const verificationStatus = profile?.verificationStatus || "pending";

  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  useEffect(() => {
    // PUBLIC ROUTES - No redirect needed
    const publicPages = ['/login', '/signup', '/forgot-password', '/', '/doctor-auth', '/admin-auth', '/admin-bootstrap', '/admin-create'];
    const isPublicPage = publicPages.includes(pathname);

    // If no user and NOT public page, redirect to correct gateway
    if (!isUserLoading && !user && !isPublicPage) {
      if (pathname.startsWith('/doctor')) {
        router.push('/doctor-auth');
      } else if (pathname.startsWith('/admin')) {
        router.push('/admin-auth');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, pathname, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPublicPage = ['/login', '/signup', '/forgot-password', '/', '/doctor-auth', '/admin-auth', '/admin-bootstrap', '/admin-create'].includes(pathname);
  if (isPublicPage) return <>{children}</>;

  // --- Strict Role Based Guards ---

  // 1. Admin Guard
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return (
      <AccessDenied 
        title="Admin Restricted" 
        message="This terminal is strictly for clinical administrators only."
        icon={<Lock className="h-16 w-16 text-destructive" />}
        onSignOut={handleSignOut}
      />
    );
  }

  // 2. Doctor Guard
  if (pathname.startsWith('/doctor') && userRole !== 'doctor') {
    return (
      <AccessDenied 
        title="Professional Access Only" 
        message="This dashboard is reserved for verified medical professionals."
        icon={<ShieldAlert className="h-16 w-16 text-amber-500" />}
        onSignOut={handleSignOut}
      />
    );
  }

  // Doctor Verification Screens
  if (userRole === 'doctor' && pathname.startsWith('/doctor') && pathname !== '/profile') {
    if (verificationStatus === 'pending') {
      return (
        <AccessDenied 
          title="Verification Pending" 
          message="Your clinical credentials are currently under review. Access will be granted once verification is complete."
          icon={<Clock className="h-16 w-16 text-amber-500 animate-pulse" />}
          onSignOut={handleSignOut}
          showProfile
        />
      );
    }
    if (verificationStatus === 'rejected') {
      return (
        <AccessDenied 
          title="Verification Rejected" 
          message="Your application was not approved. Please review your profile data and re-upload clinical documents."
          icon={<XCircle className="h-16 w-16 text-destructive" />}
          onSignOut={handleSignOut}
          showProfile
        />
      );
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-white/5 bg-card/80 backdrop-blur-2xl">
          <SidebarHeader className="p-6">
            <NextLink href="/dashboard" className="flex items-center gap-3">
              <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 heartbeat">
                <HeartPulse className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-xl leading-none text-primary">SwasthyaAI</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-1">Clinical Portal</span>
              </div>
            </NextLink>
          </SidebarHeader>
          <SidebarContent className="px-4 py-4">
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="rounded-xl h-11 px-4 transition-all">
                    <NextLink href={item.href} className="flex items-center gap-4">
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold text-sm ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                      </span>
                    </NextLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/5">
            <div className="p-4 mb-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate leading-none mb-1">
                  {profile?.name || 'User'}
                </span>
                <Badge variant="outline" className="text-[8px] h-4 uppercase font-bold tracking-tighter w-fit">
                   {userRole}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors h-11 px-4"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-semibold text-sm">Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="font-headline font-bold text-lg medical-gradient-text uppercase tracking-wider">
                {filteredNavItems.find(item => item.href === pathname)?.title || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              SECURE CLINICAL SESSION
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 relative">
            {children}
            {userRole === 'patient' && <ChatbotButton />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AccessDenied({ title, message, icon, onSignOut, showProfile = false }: { 
  title: string, 
  message: string, 
  icon: React.ReactNode, 
  onSignOut: () => void,
  showProfile?: boolean 
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-muted p-8 rounded-full w-fit mx-auto shadow-2xl">
          {icon}
        </div>
        <h1 className="text-3xl font-headline font-bold">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">
          {message}
        </p>
        <div className="flex gap-4 justify-center">
          {showProfile && (
            <Button variant="outline" className="rounded-xl px-8" asChild>
              <NextLink href="/profile">Edit Profile</NextLink>
            </Button>
          )}
          <Button variant="ghost" onClick={onSignOut} className="rounded-xl px-8">Sign Out</Button>
          <Button variant="default" className="rounded-xl px-8 bg-primary" asChild>
            <NextLink href="/">Home</NextLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
