
import { LayoutDashboard, Stethoscope, MapPin, History, User, AlertCircle, FileHeart } from "lucide-react";

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
