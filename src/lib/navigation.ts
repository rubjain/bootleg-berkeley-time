import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  UserSquare,
  GitCompare,
  GraduationCap,
  LayoutDashboard,
  Map,
  MessageCircle,
  School,
  UserRound,
  Users
} from "lucide-react";

export type NavLink = {
  href: Route;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavLink[];
};

export const navGroups: NavGroup[] = [
  {
    id: "explore",
    label: "Explore",
    items: [
      {
        href: "/courses",
        label: "Courses",
        description: "Search classes with planning context",
        icon: BookOpen
      },
      {
        href: "/terms",
        label: "Semesters",
        description: "Browse offerings by term",
        icon: CalendarDays
      },
      {
        href: "/programs",
        label: "Programs",
        description: "Majors, minors, and requirements",
        icon: GraduationCap
      },
      {
        href: "/instructors",
        label: "Instructors",
        description: "Faculty profiles and live RMP ratings",
        icon: UserSquare
      },
      {
        href: "/schools",
        label: "Campuses",
        description: "Switch or preview schools",
        icon: School
      }
    ]
  },
  {
    id: "plan",
    label: "My plan",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        description: "Progress, favorites, and recommendations",
        icon: LayoutDashboard
      },
      {
        href: "/planner",
        label: "Planner",
        description: "Semester-by-semester graduation path",
        icon: Map
      },
      {
        href: "/compare",
        label: "Compare",
        description: "Side-by-side course evaluation",
        icon: GitCompare
      },
      {
        href: "/profile",
        label: "Profile",
        description: "Programs, grades, and preferences",
        icon: UserRound
      }
    ]
  },
  {
    id: "community",
    label: "Community",
    items: [
      {
        href: "/friends",
        label: "Friends",
        description: "Connections and shared plans",
        icon: Users
      },
      {
        href: "/messages",
        label: "Messages",
        description: "Direct chats and course ideas",
        icon: MessageCircle
      }
    ]
  }
];

export const explorePaths = ["/courses", "/terms", "/programs", "/instructors", "/schools"] as const;
export const planPaths = ["/dashboard", "/planner", "/compare", "/profile"] as const;
export const communityPaths = ["/friends", "/messages"] as const;

export function getActiveGroupId(pathname: string): string | null {
  if (explorePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return "explore";
  }
  if (planPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return "plan";
  }
  if (communityPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return "community";
  }
  return null;
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
