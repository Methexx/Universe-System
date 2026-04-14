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
    { title: "Overview", icon: LayoutDashboard, path: "/admin/overview" },
    { title: "Attendance", icon: CheckSquare, path: "/admin/attendance" },
    { title: "Students", icon: Users, path: "/admin/students" },
    { title: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
    { title: "Enrollments", icon: UserPlus, path: "/admin/enrollments" },
    { title: "Notice Board", icon: ClipboardList, path: "/admin/notices" },
    { title: "Calender", icon: Calendar, path: "/admin/calendar" },
    { title: "Complain Management", icon: AlertOctagon, path: "/admin/complaints" },
    { title: "Logs", icon: FileText, path: "/admin/logs" },
    { title: "Profile", icon: User, path: "/admin/profile" },
  ],
  teacher: [
    { title: "Overview", icon: LayoutDashboard, path: "/teacher/overview" },
    { title: "My Classes", icon: Users, path: "/teacher/classes" },
    { title: "Mark Attendance", icon: CheckSquare, path: "/teacher/attendance" },
    { title: "Schedule", icon: Calendar, path: "/teacher/schedule" },
    { title: "Notices", icon: ClipboardList, path: "/teacher/notices" },
    { title: "Profile", icon: User, path: "/teacher/profile" },
  ],
  security: [
    { title: "Overview", icon: LayoutDashboard, path: "/security/overview" },
    { title: "Gate Logs", icon: Clock, path: "/security/logs" },
    { title: "Vehicles", icon: Car, path: "/security/vehicles" },
    { title: "Visitors", icon: Users, path: "/security/visitors" },
    { title: "Incidents", icon: AlertOctagon, path: "/security/incidents" },
    { title: "Profile", icon: User, path: "/security/profile" },
  ],
};
