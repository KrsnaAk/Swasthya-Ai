import { LayoutDashboard, Stethoscope, MapPin, User, AlertCircle, FileHeart, Activity, BarChart3, Presentation, Microscope } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Consultation Mode",
    href: "/consultation",
    icon: Presentation,
  },
  {
    title: "Imaging AI",
    href: "/imaging",
    icon: Microscope,
  },
  {
    title: "Emergency SOS",
    href: "/sos",
    icon: AlertCircle,
  },
  {
    title: "Start Triage",
    href: "/triage",
    icon: Stethoscope,
  },
  {
    title: "Preventive Analytics",
    href: "/preventive",
    icon: Activity,
  },
  {
    title: "Health Records",
    href: "/records",
    icon: FileHeart,
  },
  {
    title: "Facility Finder",
    href: "/facilities",
    icon: MapPin,
  },
  {
    title: "Public Health Trends",
    href: "/public-health",
    icon: BarChart3,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];
