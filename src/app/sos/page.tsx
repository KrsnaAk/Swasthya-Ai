
"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Phone, 
  User as UserIcon, 
  MapPin, 
  Navigation, 
  Loader2, 
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function SOSPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isAlerting, setIsAlerting] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(userDocRef);

  // Simulated location fetch
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 18.937, lng: 72.825 }) // Fallback to Mumbai
      );
    }
  }, []);

  const triggerSOS = async () => {
    if (!db || !user || !profile) return;
    
    setIsAlerting(true);
    const newAlertId = `SOS-${Date.now()}`;
    const alertRef = doc(db, "sos_alerts", newAlertId);
    
    const alertData = {
      id: newAlertId,
      userId: user.uid,
      userName: profile.name,
      locationLat: location?.lat || 0,
      locationLng: location?.lng || 0,
      status: "active",
      emergencyContact: profile.emergencyContactPhone,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(alertRef, alertData);
      setAlertId(newAlertId);
      toast({
        title: "SOS Alert Active",
        description: "Emergency services and contacts have been notified.",
        variant: "destructive",
      });
    } catch (e) {
      console.error("SOS Trigger failed", e);
      setIsAlerting(false);
    }
  };

  const resolveSOS = async () => {
    if (!db || !alertId) return;
    const alertRef = doc(db, "sos_alerts", alertId);
    await setDoc(alertRef, { status: "resolved" }, { merge: true });
    setIsAlerting(false);
    setAlertId(null);
    toast({
      title: "Alert Resolved",
      description: "SOS alert has been marked as resolved.",
    });
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-black text-primary">EMERGENCY SOS</h1>
          <p className="text-muted-foreground">Immediate assistance is just one press away.</p>
        </div>

        {!isAlerting ? (
          <Card className="border-border bg-card shadow-2xl overflow-hidden text-center p-12">
            <div className="space-y-8">
              <div className="relative mx-auto w-64 h-64">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="relative z-10 w-64 h-64 bg-primary rounded-full shadow-[0_0_50px_rgba(249,115,22,0.5)] flex flex-col items-center justify-center group active:scale-95 transition-transform">
                      <AlertCircle className="h-24 w-24 text-primary-foreground mb-2" />
                      <span className="text-primary-foreground text-3xl font-black">PRESS SOS</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6" /> Confirm SOS Alert?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will send your location to emergency services and your primary contact: 
                        <span className="font-bold text-foreground"> {profile?.emergencyContactName} ({profile?.emergencyContactPhone})</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={triggerSOS} className="bg-destructive text-destructive-foreground">
                        YES, SEND ALERT
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <div className="max-w-md mx-auto p-4 bg-accent/10 border border-accent/20 rounded-2xl">
                <p className="text-sm font-medium text-accent flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" /> 
                  Location Services: {location ? "Ready" : "Acquiring..."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-destructive bg-destructive/10 shadow-2xl overflow-hidden">
              <CardHeader className="text-center border-b border-destructive/20 pb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-6 bg-destructive rounded-full animate-pulse shadow-lg shadow-destructive/50">
                    <AlertCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-destructive">ALERT ACTIVE</CardTitle>
                <CardDescription className="text-destructive/80 font-medium">
                  Help is on the way. Please stay calm and follow these steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-card text-foreground">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="destructive" size="lg" className="h-20 text-xl font-bold gap-3 shadow-xl" asChild>
                    <a href="tel:108">
                      <Phone className="h-8 w-8" /> Call 108
                    </a>
                  </Button>
                  <Button variant="secondary" size="lg" className="h-20 text-xl font-bold gap-3 shadow-xl" asChild>
                    <a href={`tel:${profile?.emergencyContactPhone}`}>
                      <UserIcon className="h-8 w-8" /> Call {profile?.emergencyContactName}
                    </a>
                  </Button>
                </div>

                <Card className="border-border bg-muted/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">Current Broadcast Location</p>
                      <p className="text-sm font-medium">{location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}</p>
                    </div>
                    <Button variant="link" className="ml-auto text-primary" asChild>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${location?.lat},${location?.lng}`} target="_blank">
                        View Map
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" /> Nearest Support
                  </h3>
                  <Button variant="outline" className="w-full justify-between h-14" asChild>
                    <a href="/facilities?type=emergency">
                      <span>Browse Nearby Trauma Centers</span>
                      <Navigation className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-muted/30 flex flex-col gap-4">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={resolveSOS}>
                  Mark as Resolved (Safe)
                </Button>
              </CardFooter>
            </Card>

            <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold">Automated Response Initiated</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your SOS alert has been broadcast to our internal emergency network. Real-time updates are being shared with your emergency contact.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
