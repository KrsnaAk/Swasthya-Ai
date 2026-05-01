
import { LayoutDashboard, Stethoscope, MapPin, History, User, AlertCircle } from "lucide-react";

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
    title: "Facility Finder",
    href: "/facilities",
    icon: MapPin,
  },
  {
    title: "Health History",
    href: "/history",
    icon: History,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];
