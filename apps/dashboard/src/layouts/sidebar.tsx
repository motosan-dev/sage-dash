import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  BadgeDollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/quotes", label: "Quotes", icon: BadgeDollarSign },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const APP_VERSION = "0.0.1";

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <span className="text-lg font-semibold tracking-tight">Sage Dash</span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-2 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">v{APP_VERSION}</p>
      </div>
    </div>
  );
}
