import {
  LayoutDashboard,
  CheckSquare,
  Users,
  GraduationCap,
  UserPlus,
  ClipboardList,
  Calendar,
  AlertOctagon,
  FileText,
  Bell,
  User,
  Clock,
  Car,
  LucideIcon
} from "lucide-react";

export type Role = "admin" | "teacher" | "security";

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

export const SIDEBAR_MENU: Record<Role, MenuItem[]> = {
  admin: [
    { title: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Attendance", icon: CheckSquare, path: "/attendance" },
    { title: "Students", icon: Users, path: "/students" },
    { title: "Teachers", icon: GraduationCap, path: "/teachers" },
    { title: "Enrollments", icon: UserPlus, path: "/enrollments" },
    { title: "Notice Board", icon: ClipboardList, path: "/notices" },
    { title: "Calender", icon: Calendar, path: "/calendar" },
    { title: "Complain Management", icon: AlertOctagon, path: "/complaints" },
    { title: "Logs", icon: FileText, path: "/logs" },
    { title: "Notifications", icon: Bell, path: "/notifications", badge: 2 },
    { title: "Profile", icon: User, path: "/profile" },
  ],
  teacher: [
    { title: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { title: "My Classes", icon: Users, path: "/classes" },
    { title: "Mark Attendance", icon: CheckSquare, path: "/attendance" },
    { title: "Schedule", icon: Calendar, path: "/schedule" },
    { title: "Notices", icon: ClipboardList, path: "/notices" },
    { title: "Notifications", icon: Bell, path: "/notifications" },
    { title: "Profile", icon: User, path: "/profile" },
  ],
  security: [
    { title: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Gate Logs", icon: Clock, path: "/logs" },
    { title: "Vehicles", icon: Car, path: "/vehicles" },
    { title: "Visitors", icon: Users, path: "/visitors" },
    { title: "Incidents", icon: AlertOctagon, path: "/incidents" },
    { title: "Profile", icon: User, path: "/profile" },
  ],
};
