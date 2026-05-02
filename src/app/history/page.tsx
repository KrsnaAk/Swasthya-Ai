'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Loader2 } from "lucide-react";

export default function UnifiedHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Graceful removal: Redirect users back to dashboard if they land here
    router.replace('/dashboard');
  }, [router]);

  return (
    <AppShell>
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">This section has been moved. Redirecting to Dashboard...</p>
      </div>
    </AppShell>
  );
}
