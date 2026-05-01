
import { LayoutDashboard, Stethoscope, MapPin, History, User, AlertCircle, FileHeart, Activity, BarChart3 } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    title: "Unified History",
    href: "/history",
    icon: History,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];
