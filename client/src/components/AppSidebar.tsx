import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location === "";
    return location.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
              Sentiment Analyzer
            </h1>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">
              Earnings Call Analysis
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" data-testid="nav-sidebar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="pt-3 pb-1 px-3">
          <p className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">
            Companies
          </p>
        </div>
        <Link
          href="/company/AAPL"
          data-testid="nav-companies"
        >
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
              location.startsWith("/company")
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span>Company Detail</span>
          </div>
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          data-testid="btn-theme-toggle"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}
