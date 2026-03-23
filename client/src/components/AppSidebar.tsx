import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "./ThemeProvider";
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
  Cpu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";

interface CompanyListItem {
  ticker: string;
  name: string;
  subsector: string;
  avg_composite: number;
}

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [expandedSubsectors, setExpandedSubsectors] = useState<Set<string>>(new Set());

  const { data: companies } = useQuery<CompanyListItem[]>({
    queryKey: ["/api/companies"],
  });

  const grouped = useMemo(() => {
    if (!companies) return {};
    const groups: Record<string, CompanyListItem[]> = {};
    for (const co of companies) {
      if (!groups[co.subsector]) groups[co.subsector] = [];
      groups[co.subsector].push(co);
    }
    // Sort subsectors alphabetically
    const sorted: Record<string, CompanyListItem[]> = {};
    for (const key of Object.keys(groups).sort()) {
      sorted[key] = groups[key].sort((a, b) => a.ticker.localeCompare(b.ticker));
    }
    return sorted;
  }, [companies]);

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location === "";
    return location.startsWith(href);
  };

  const toggleSubsector = (subsector: string) => {
    setExpandedSubsectors((prev) => {
      const next = new Set(prev);
      if (next.has(subsector)) next.delete(subsector);
      else next.add(subsector);
      return next;
    });
  };

  const currentTicker = location.startsWith("/company/")
    ? location.replace("/company/", "").toUpperCase()
    : null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">
              Tech Sentiment
            </h1>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">
              Earnings Call Analyzer
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
            <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
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

        {/* Companies Section */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">
            Companies ({companies?.length || 0})
          </p>
        </div>

        {Object.entries(grouped).map(([subsector, tickers]) => (
          <div key={subsector}>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs w-full transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30"
              onClick={() => toggleSubsector(subsector)}
              data-testid={`subsector-${subsector.toLowerCase().replace(/[\s/]+/g, '-')}`}
            >
              {expandedSubsectors.has(subsector) ? (
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              )}
              <span className="truncate font-medium">{subsector}</span>
              <span className="text-sidebar-foreground/30 ml-auto">{tickers.length}</span>
            </button>

            {expandedSubsectors.has(subsector) && (
              <div className="ml-4 space-y-0.5 mt-0.5">
                {tickers.map((co) => (
                  <Link
                    key={co.ticker}
                    href={`/company/${co.ticker}`}
                    data-testid={`nav-company-${co.ticker}`}
                  >
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                        currentTicker === co.ticker
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/30"
                      }`}
                    >
                      <span className="font-mono">{co.ticker}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          data-testid="btn-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}
