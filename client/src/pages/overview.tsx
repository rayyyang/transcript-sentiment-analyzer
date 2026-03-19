import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { OverviewResponse, CompanyListItem } from "@shared/schema";
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
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

function KpiCard({
  label,
  value,
  icon: Icon,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: any;
  subtitle?: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function QuintileChart({ quintiles }: { quintiles: OverviewResponse["quintiles"] }) {
  const colors = ["#ef4444", "#f59e0b", "#a3a3a3", "#22c55e", "#16a34a"];

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Sentiment Quintile Returns</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Average next-quarter stock return by sentiment quintile
      </p>
      <ResponsiveContainer width="100%" height={260}>
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
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, "Avg Return"]}
            labelFormatter={(label) => `${label}`}
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

function SectorHeatmap({ sectors }: { sectors: OverviewResponse["sectors"] }) {
  const sorted = Object.entries(sectors).sort(
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
      <h3 className="text-sm font-semibold mb-1">Sector Averages</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Average composite sentiment score by sector
      </p>
      <div className="space-y-2">
        {sorted.map(([sector, data]) => (
          <div
            key={sector}
            className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{sector}</span>
              <span className="text-xs text-muted-foreground">
                {data.count} companies
              </span>
            </div>
            <span
              className={`text-sm font-mono font-medium px-2 py-0.5 rounded ${getColor(data.avg_composite)}`}
              data-testid={`sector-score-${sector.toLowerCase().replace(/\s+/g, '-')}`}
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
        <h3 className="text-sm font-semibold">Company Rankings</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sorted by composite sentiment score
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
                Sector
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
                    {co.sector}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-right font-mono tabular-nums">
                  {co.composite_score.toFixed(3)}
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
          <div key={i} className="h-32 bg-card border border-card-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!overview || !companies) return null;

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold" data-testid="page-title">
          Transcript Sentiment Analyzer
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          LLM-powered earnings call analysis across 32 S&P 500 companies
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Companies"
          value={overview.total_companies}
          icon={Building2}
        />
        <KpiCard
          label="Transcripts Analyzed"
          value={overview.total_transcripts}
          icon={FileText}
        />
        <KpiCard
          label="Date Range"
          value={`${formatDate(overview.date_range.earliest)} - ${formatDate(overview.date_range.latest)}`}
          icon={Calendar}
        />
        <KpiCard
          label="Overall Correlation"
          value={overview.overall_correlation.r.toFixed(4)}
          icon={overview.overall_correlation.r >= 0 ? TrendingUp : TrendingDown}
          subtitle={`n=${overview.overall_correlation.n}, ${overview.overall_correlation.sig ? "significant" : "not significant"}`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuintileChart quintiles={overview.quintiles} />
        <SectorHeatmap sectors={overview.sectors} />
      </div>

      {/* Company Ranking Table */}
      <CompanyTable companies={companies} />
    </div>
  );
}
