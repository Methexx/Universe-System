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
  MessageSquare,
  Search,
  BookOpen,
  LucideIcon
} from "lucide-react";

export type Role = "admin" | "teacher" | "security" | "pending";

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
    { title: "Messages", icon: MessageSquare, path: "/admin/messages" },
    { title: "Notice Board", icon: ClipboardList, path: "/admin/notices" },
    { title: "Calendar", icon: Calendar, path: "/admin/calendar" },
    { title: "Complain Management", icon: AlertOctagon, path: "/admin/complaints" },
    { title: "Logs", icon: FileText, path: "/admin/logs" },
    { title: "Profile", icon: User, path: "/admin/profile" },
  ],
  teacher: [
    { title: "Overview", icon: LayoutDashboard, path: "/teacher/overview" },
    { title: "My Classes", icon: Users, path: "/teacher/classes" },
    { title: "Attendance", icon: CheckSquare, path: "/teacher/attendance" },
    { title: "Grades", icon: BookOpen, path: "/teacher/grades" },
    { title: "Messages", icon: MessageSquare, path: "/teacher/messages" },
    { title: "Notice Board", icon: ClipboardList, path: "/teacher/notices" },        
    { title: "Calendar", icon: Calendar, path: "/teacher/calendar" },
    { title: "Complaints", icon: AlertOctagon, path: "/teacher/complaints" },        
    { title: "Lost & Found", icon: Search, path: "/teacher/lost-and-found" },        
    { title: "Profile", icon: User, path: "/teacher/profile" },
  ],
  security: [
    { title: "Dashboard", icon: LayoutDashboard, path: "/security/dashboard" },
    { title: "Messages", icon: MessageSquare, path: "/security/messages" },
    { title: "Logs", icon: FileText, path: "/security/logs" },
    { title: "Profile", icon: User, path: "/security/profile" },
  ],
  pending: [
    { title: "Account Status", icon: LayoutDashboard, path: "/pending" },
  ],
};
