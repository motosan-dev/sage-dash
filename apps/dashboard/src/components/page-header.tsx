import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/pipeline": "Pipeline",
  "/clients": "Clients",
  "/quotes": "Quotes",
  "/settings": "Settings",
};

interface PageHeaderProps {
  onMenuClick: () => void;
}

export function PageHeader({ onMenuClick }: PageHeaderProps) {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] ?? "Page";
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      <nav aria-label="Breadcrumb" className="flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="text-muted-foreground">Sage Dash</li>
          <li className="text-muted-foreground">/</li>
          <li className="font-medium">{title}</li>
        </ol>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={
          resolvedTheme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >
        {resolvedTheme === "dark" ? (
          <Sun className="size-5" />
        ) : (
          <Moon className="size-5" />
        )}
      </Button>
    </header>
  );
}
