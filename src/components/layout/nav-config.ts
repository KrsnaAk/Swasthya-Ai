import { 
  LayoutDashboard, 
  Stethoscope, 
  MapPin, 
  User, 
  AlertCircle, 
  FileHeart, 
  Activity, 
  BarChart3, 
  Presentation, 
  Microscope,
  ShieldCheck,
  MessageSquare,
  Users,
  UserPlus
} from "lucide-react";

export const navItems = [
  // Shared/Patient Items
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["patient", "doctor", "admin"]
  },
  {
    title: "Doctor Buddy",
    href: "/doctor-buddy",
    icon: UserPlus,
    roles: ["patient"]
  },
  {
    title: "Consultation Mode",
    href: "/consultation",
    icon: Presentation,
    roles: ["patient"]
  },
  {
    title: "Imaging AI",
    href: "/imaging",
    icon: Microscope,
    roles: ["patient"]
  },
  {
    title: "Emergency SOS",
    href: "/sos",
    icon: AlertCircle,
    roles: ["patient"]
  },
  {
    title: "Start Triage",
    href: "/triage",
    icon: Stethoscope,
    roles: ["patient"]
  },
  {
    title: "Preventive Analytics",
    href: "/preventive",
    icon: Activity,
    roles: ["patient"]
  },
  {
    title: "Health Records",
    href: "/records",
    icon: FileHeart,
    roles: ["patient"]
  },
  {
    title: "Facility Finder",
    href: "/facilities",
    icon: MapPin,
    roles: ["patient"]
  },

  // Doctor Specific
  {
    title: "Doctor Dashboard",
    href: "/doctor",
    icon: Stethoscope,
    roles: ["doctor"]
  },
  
  // Admin Specific
  {
    title: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["admin"]
  },

  // Common
  {
    title: "Public Health Trends",
    href: "/public-health",
    icon: BarChart3,
    roles: ["patient", "doctor", "admin"]
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: ["patient", "doctor", "admin"]
  },
];
