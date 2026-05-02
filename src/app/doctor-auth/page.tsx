'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Loader2, ShieldCheck, ArrowLeft, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DoctorAuthPage() {
  const [loading, setLoading] = useState(false);
  const { auth, firestore: db, storage } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const degreeInputRef = useRef<HTMLInputElement | null>(null);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    specialization: '',
    experienceYears: '',
    licenseNumber: '',
    registrationCouncil: '',
    clinicName: '',
    city: '',
  });

  const [files, setFiles] = useState<{
    degree: File | null;
    license: File | null;
  }>({
    degree: null,
    license: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, registrationCouncil: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'degree' | 'license') => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const hasValidMime = allowedMimeTypes.includes(file.type);

      if (!hasValidExtension || !hasValidMime) {
        toast({ 
          title: "Invalid file type", 
          description: "Only PDF, JPG, JPEG, PNG files are allowed.", 
          variant: "destructive" 
        });
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: "File too large", 
          description: "Only files under 5MB are allowed.", 
          variant: "destructive" 
        });
        e.target.value = '';
        return;
      }

      setFiles(prev => ({ ...prev, [type]: file }));
      toast({
        title: "File Selected",
        description: `${file.name} is ready.`
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({ title: "Welcome Doctor", description: "Verifying clinical credentials..." });
      router.push('/doctor');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid doctor credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      console.warn("Storage upload failed:", error.code || error.message);
      // Rethrow to be caught by the main signup try/catch
      throw error;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.degree) {
      toast({ title: "Missing Document", description: "Medical degree certificate is required.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      let degreeUrl = '';
      let licenseUrl = '';
      let uploadStatus = 'completed';

      try {
        if (files.degree) {
          degreeUrl = await uploadFile(files.degree, `doctor-documents/${newUser.uid}/degree_${Date.now()}`);
        }
        if (files.license) {
          licenseUrl = await uploadFile(files.license, `doctor-documents/${newUser.uid}/license_${Date.now()}`);
        }
      } catch (storageError: any) {
        console.warn("Continuing signup without file URLs due to storage error:", storageError.code);
        // Specifically catch no-default-bucket to handle pending setup
        if (storageError.code === 'storage/no-default-bucket' || storageError.message?.includes('no-default-bucket')) {
          uploadStatus = 'pending_storage_setup';
        } else {
          uploadStatus = 'failed_during_signup';
        }
      }

      const doctorProfile = {
        id: newUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        role: 'doctor',
        verificationStatus: 'pending',
        specialization: formData.specialization,
        experienceYears: Number(formData.experienceYears),
        licenseNumber: formData.licenseNumber,
        registrationCouncil: formData.registrationCouncil,
        clinicName: formData.clinicName,
        degreeUrl,
        licenseUrl,
        degreeFileName: files.degree?.name || null,
        licenseFileName: files.license?.name || null,
        documentUploadStatus: uploadStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", newUser.uid), doctorProfile);
      await setDoc(doc(db, "doctorApplications", newUser.uid), {
        ...doctorProfile,
        submittedAt: serverTimestamp()
      });

      if (uploadStatus === 'pending_storage_setup') {
        toast({ 
          title: "Application Submitted", 
          description: "Account created. Document upload is pending (Storage bucket not configured).",
        });
      } else {
        toast({ title: "Application Submitted", description: "Your profile and documents are now under clinical review." });
      }
      
      router.push('/doctor');
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-12">
      <Card className="w-full max-w-3xl border-border bg-card shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-primary p-3 rounded-2xl w-fit mb-4">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-primary">Doctor Gateway</CardTitle>
          <CardDescription>
            Verified professional access to SwasthyaAI Clinical Portal
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full px-6">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Register as Professional</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pb-6 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="email">Professional Email</Label>
                <Input id="email" type="email" placeholder="dr.name@hospital.com" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <Button type="submit" className="w-full h-12 font-bold bg-primary text-primary-foreground" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Secure Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-2">Identity Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name (as per registration)</Label>
                    <Input id="name" placeholder="Dr. Sneha" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number</Label>
                    <Input id="phone" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-2">Professional Creds</h3>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Medical License #</Label>
                    <Input id="licenseNumber" placeholder="e.g. DMC/12345/2018" value={formData.licenseNumber} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Council</Label>
                    <Select value={formData.registrationCouncil} onValueChange={handleSelectChange} required>
                      <SelectTrigger><SelectValue placeholder="Select Council" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NMC">National Medical Commission (NMC)</SelectItem>
                        <SelectItem value="DMC">Delhi Medical Council</SelectItem>
                        <SelectItem value="MMC">Maharashtra Medical Council</SelectItem>
                        <SelectItem value="Other">Other State Council</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Primary Specialization</Label>
                    <Input id="specialization" placeholder="e.g. Cardiology" value={formData.specialization} onChange={handleInputChange} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Exp (Years)</Label>
                      <Input id="experienceYears" type="number" value={formData.experienceYears} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-primary tracking-widest border-b border-primary/10 pb-2">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2 mb-2">
                      Degree Certificate (Required) <AlertCircle className="h-3 w-3 text-destructive" />
                    </Label>
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => degreeInputRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && degreeInputRef.current?.click()}
                      className="relative group border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-muted/20 cursor-pointer min-h-[120px]"
                    >
                      {files.degree ? <FileCheck className="h-8 w-8 text-green-500" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                      <div className="text-center w-full px-2">
                        {files.degree ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-primary truncate max-w-full">{files.degree.name}</span>
                            <span className="text-[10px] text-muted-foreground">({(files.degree.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={degreeInputRef}
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileChange(e, 'degree')} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold mb-2 block">License Proof (Optional)</Label>
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => licenseInputRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && licenseInputRef.current?.click()}
                      className="relative group border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-muted/20 cursor-pointer min-h-[120px]"
                    >
                      {files.license ? <FileCheck className="h-8 w-8 text-green-500" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                      <div className="text-center w-full px-2">
                        {files.license ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-primary truncate max-w-full">{files.license.name}</span>
                            <span className="text-[10px] text-muted-foreground">({(files.license.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Identity proof of license</span>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={licenseInputRef}
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileChange(e, 'license')} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 font-black bg-primary text-primary-foreground text-lg shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? <><Loader2 className="animate-spin mr-2" /> PROCESSING CREDENTIALS...</> : "SUBMIT PROFESSIONAL APPLICATION"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <CardFooter className="justify-center border-t border-border mt-4">
          <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
