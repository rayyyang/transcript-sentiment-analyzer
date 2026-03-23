import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { CorrelationResult, QuintileData, SubsectorData, ScoreDimension } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Building2,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  GitCompareArrows,
} from "lucide-react";

interface OverviewResponse {
  total_companies: number;
  total_transcripts: number;
  total_with_returns: number;
  focus: string;
  date_range: { earliest: string; latest: string };
  overall_correlation: CorrelationResult;
  subsectors: Record<string, SubsectorData>;
  quintiles: QuintileData[];
}

interface CompanyListItem {
  ticker: string;
  name: string;
  subsector: string;
  avg_composite: number;
  trend: number;
  n_transcripts: number;
  n_with_returns: number;
  averages: Record<ScoreDimension, number>;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  subtitle,
  accent,
}: {
  label: string;
  value: string | number;
  icon: any;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <div className={`bg-card border border-card-border rounded-lg p-4 ${accent ? "ring-1 ring-blue-500/30" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p
        className="text-xl font-semibold tabular-nums"
        data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function QuintileChart({ quintiles }: { quintiles: QuintileData[] }) {
  const colors = ["#ef4444", "#f59e0b", "#a3a3a3", "#22c55e", "#16a34a"];
  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Signal Strength — Quintile Returns</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Average next-quarter return by sentiment quintile (monotonic spread: +6.0% to +11.3%)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={quintiles} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 20%)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Avg Return"]}
          />
          <Bar dataKey="avg_return" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {quintiles.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SubsectorComparison({
  subsectors,
}: {
  subsectors: Record<string, SubsectorData>;
}) {
  const sorted = Object.entries(subsectors).sort(
    ([, a], [, b]) => b.avg_composite - a.avg_composite
  );
  const min = Math.min(...sorted.map(([, s]) => s.avg_composite));
  const max = Math.max(...sorted.map(([, s]) => s.avg_composite));

  const getColor = (val: number) => {
    const ratio = (val - min) / (max - min || 1);
    if (ratio > 0.7) return "bg-emerald-500/20 text-emerald-400";
    if (ratio > 0.4) return "bg-blue-500/20 text-blue-400";
    return "bg-amber-500/20 text-amber-400";
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Subsector Sentiment</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Average composite score by tech subsector
      </p>
      <div className="space-y-2">
        {sorted.map(([subsector, data]) => (
          <div
            key={subsector}
            className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{subsector}</span>
              <span className="text-xs text-muted-foreground">
                {data.count} {data.count === 1 ? "company" : "companies"}
              </span>
            </div>
            <span
              className={`text-sm font-mono font-medium px-2 py-0.5 rounded ${getColor(data.avg_composite)}`}
              data-testid={`subsector-score-${subsector.toLowerCase().replace(/[\s/]+/g, "-")}`}
            >
              {data.avg_composite.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyTable({ companies }: { companies: CompanyListItem[] }) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0.02)
      return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
    if (trend < -0.02)
      return <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.02) return "text-emerald-400";
    if (trend < -0.02) return "text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-sm font-semibold">Top Companies by Composite Score</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          37 tech companies ranked by average sentiment composite
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="company-ranking-table">
          <thead>
            <tr className="border-b border-card-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                Ticker
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">
                Subsector
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">
                Composite
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">
                Trend
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">
                Transcripts
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((co) => (
              <tr
                key={co.ticker}
                className="border-b border-card-border/50 hover:bg-muted/30 transition-colors"
                data-testid={`company-row-${co.ticker}`}
              >
                <td className="px-5 py-2.5">
                  <Link href={`/company/${co.ticker}`}>
                    <span
                      className="text-blue-400 hover:text-blue-300 font-mono font-medium cursor-pointer"
                      data-testid={`link-company-${co.ticker}`}
                    >
                      {co.ticker}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-foreground/80">{co.name}</td>
                <td className="px-5 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {co.subsector}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-right font-mono tabular-nums">
                  {co.avg_composite.toFixed(3)}
                </td>
                <td className="px-5 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {getTrendIcon(co.trend)}
                    <span
                      className={`font-mono tabular-nums text-xs ${getTrendColor(co.trend)}`}
                    >
                      {co.trend > 0 ? "+" : ""}
                      {co.trend.toFixed(3)}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                  {co.n_transcripts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery<OverviewResponse>({
    queryKey: ["/api/overview"],
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<CompanyListItem[]>({
    queryKey: ["/api/companies"],
  });

  if (overviewLoading || companiesLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-card border border-card-border rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!overview || !companies) return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold" data-testid="page-title">
          Tech Sector Sentiment Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          LLM-powered earnings call analysis — {overview.focus}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Companies"
          value={overview.total_companies}
          icon={Building2}
          subtitle="Across 11 subsectors"
        />
        <KpiCard
          label="Transcripts"
          value={overview.total_transcripts}
          icon={FileText}
          subtitle={`${overview.total_with_returns} with return data`}
        />
        <KpiCard
          label="Return Pairs"
          value={overview.total_with_returns}
          icon={GitCompareArrows}
          subtitle="Sentiment → next-Q return"
        />
        <KpiCard
          label="Overall Correlation"
          value={`r = ${overview.overall_correlation.r >= 0 ? "+" : ""}${overview.overall_correlation.r.toFixed(3)}`}
          icon={TrendingUp}
          subtitle={`t = ${overview.overall_correlation.t.toFixed(2)}, ${overview.overall_correlation.sig ? "p < 0.05 ✓" : "not sig."}`}
          accent={overview.overall_correlation.sig}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuintileChart quintiles={overview.quintiles} />
        <SubsectorComparison subsectors={overview.subsectors} />
      </div>

      {/* Company Ranking Table */}
      <CompanyTable companies={companies} />
    </div>
  );
}
