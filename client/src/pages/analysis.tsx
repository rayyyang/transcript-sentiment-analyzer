import { useQuery } from "@tanstack/react-query";
import type { CorrelationAnalysis, CorrelationResult, DeltaQuintile } from "@shared/schema";
import { DIMENSION_LABELS } from "@shared/schema";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useState, useMemo } from "react";
import { Link } from "wouter";

const SUBSECTOR_COLORS: Record<string, string> = {
  "Cloud/SaaS": "#3b82f6",
  "Semiconductors": "#22c55e",
  "Enterprise Software": "#f59e0b",
  "Consumer Internet": "#a855f7",
  "Cybersecurity": "#06b6d4",
  "Digital Advertising": "#ec4899",
  "E-Commerce": "#f97316",
  "Fintech": "#14b8a6",
  "Hardware/Devices": "#6366f1",
  "IT Services/Consulting": "#84cc16",
  "Networking/Infrastructure": "#ef4444",
};

interface ScatterPoint {
  ticker: string;
  subsector: string;
  date: string;
  composite: number;
  next_quarter_return: number;
}

function CorrelationScatter({ data }: { data: ScatterPoint[] }) {
  const [hoveredSubsector, setHoveredSubsector] = useState<string | null>(null);
  const subsectors = useMemo(
    () => [...new Set(data.map((d) => d.subsector))].sort(),
    [data]
  );

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">
        Composite Score vs. Next-Quarter Return
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {data.length} data points, colored by subsector
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 20%)" />
          <XAxis
            dataKey="composite"
            name="Score"
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
            label={{
              value: "Composite Sentiment Score",
              position: "bottom",
              fill: "hsl(215 20% 55%)",
              fontSize: 10,
              offset: 12,
            }}
          />
          <YAxis
            dataKey="next_quarter_return"
            name="Return"
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            label={{
              value: "Next-Q Return (%)",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(215 20% 55%)",
              fontSize: 10,
              offset: 0,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              name === "Score"
                ? value.toFixed(3)
                : `${value.toFixed(1)}%`,
              name === "Score" ? "Score" : "Return",
            ]}
            labelFormatter={(_, payload) => {
              if (payload && payload.length > 0) {
                const p = payload[0].payload as ScatterPoint;
                return `${p.ticker} (${p.date}) — ${p.subsector}`;
              }
              return "";
            }}
          />
          <Scatter data={data} fill="#3b82f6">
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={SUBSECTOR_COLORS[d.subsector] || "#6b7280"}
                opacity={
                  hoveredSubsector === null || hoveredSubsector === d.subsector
                    ? 0.7
                    : 0.1
                }
                r={3}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
        {subsectors.map((s) => (
          <button
            key={s}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onMouseEnter={() => setHoveredSubsector(s)}
            onMouseLeave={() => setHoveredSubsector(null)}
            data-testid={`legend-${s.toLowerCase().replace(/[\s/]+/g, "-")}`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: SUBSECTOR_COLORS[s] || "#6b7280" }}
            />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function DimensionCorrelationChart({
  byDimension,
}: {
  byDimension: Record<string, CorrelationResult>;
}) {
  const data = Object.entries(byDimension)
    .map(([key, val]) => ({
      name: DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS] || key,
      key,
      r: val.r,
      t: val.t,
      sig: val.sig,
    }))
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">
        Dimension Correlations with Returns
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Pearson r by scoring dimension — significant results highlighted
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, bottom: 5, left: 130 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(240 4% 20%)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={125}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number, _name: string, entry: any) => {
              const item = entry.payload;
              return [
                `r = ${value >= 0 ? "+" : ""}${value.toFixed(3)} (t = ${item.t?.toFixed(2) || "—"}) ${item.sig ? "✓ sig" : ""}`,
                "Correlation",
              ];
            }}
          />
          <Bar dataKey="r" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.sig ? (d.r >= 0 ? "#22c55e" : "#ef4444") : "#6b7280"}
                opacity={d.sig ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeltaQuintilesChart({ quintiles }: { quintiles: DeltaQuintile[] }) {
  const colors = ["#ef4444", "#f59e0b", "#a3a3a3", "#22c55e", "#16a34a"];
  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">
        Sentiment Change → Returns
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Change in sentiment predicts returns even more strongly (r = +0.123)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={quintiles}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(240 4% 20%)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
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
              <Cell key={i} fill={colors[i] || "#6b7280"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SubsectorBreakdown({
  bySubsector,
}: {
  bySubsector: Record<string, CorrelationResult>;
}) {
  const sorted = Object.entries(bySubsector)
    .filter(([, v]) => v.n >= 5)
    .sort(([, a], [, b]) => b.r - a.r);

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Subsector Correlations</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Sentiment-return correlation by subsector (n ≥ 5)
      </p>
      <div className="space-y-2">
        {sorted.map(([subsector, data]) => {
          const barWidth = Math.min(Math.abs(data.r) * 400, 100);
          return (
            <div
              key={subsector}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/30"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: SUBSECTOR_COLORS[subsector] || "#6b7280",
                }}
              />
              <span className="text-sm font-medium w-44 flex-shrink-0 truncate">
                {subsector}
              </span>
              <div className="flex-1 h-4 bg-muted/50 rounded relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/10" />
                <div
                  className="absolute top-0 bottom-0 rounded"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: data.r >= 0 ? "#22c55e" : "#ef4444",
                    left: data.r >= 0 ? "50%" : `${50 - barWidth}%`,
                    opacity: data.sig ? 1 : 0.5,
                  }}
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-sm font-mono tabular-nums ${
                    data.sig
                      ? data.r >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {data.r >= 0 ? "+" : ""}
                  {data.r.toFixed(3)}
                </span>
                {data.sig && (
                  <span className="text-[10px] px-1.5 py-0 rounded bg-emerald-500/20 text-emerald-400">
                    sig
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-10 text-right flex-shrink-0">
                n={data.n}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompanyCorrelationTable({
  byCompany,
}: {
  byCompany: Record<string, CorrelationResult>;
}) {
  const [sortBy, setSortBy] = useState<"r" | "ticker">("r");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const entries = Object.entries(byCompany).map(([ticker, data]) => ({
      ticker,
      ...data,
    }));
    return entries.sort((a, b) => {
      if (sortBy === "ticker") {
        return sortDir === "asc"
          ? a.ticker.localeCompare(b.ticker)
          : b.ticker.localeCompare(a.ticker);
      }
      return sortDir === "asc" ? a.r - b.r : b.r - a.r;
    });
  }, [byCompany, sortBy, sortDir]);

  const toggleSort = (col: "r" | "ticker") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "r" ? "desc" : "asc");
    }
  };

  const getBarWidth = (r: number) => Math.min(Math.abs(r) * 100, 100);

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-sm font-semibold">Per-Company Correlations</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sentiment-return correlation by company (click headers to sort)
        </p>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table
          className="w-full text-sm"
          data-testid="company-correlation-table"
        >
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-card-border">
              <th
                className="text-left px-5 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("ticker")}
              >
                Ticker{" "}
                {sortBy === "ticker"
                  ? sortDir === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="text-right px-5 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("r")}
              >
                Correlation (r){" "}
                {sortBy === "r" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-center">
                Visual
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">
                N
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">
                Significant
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((co) => (
              <tr
                key={co.ticker}
                className="border-b border-card-border/50 hover:bg-muted/20 transition-colors"
              >
                <td className="px-5 py-2">
                  <Link href={`/company/${co.ticker}`}>
                    <span className="font-mono font-medium text-blue-400 hover:text-blue-300 cursor-pointer">
                      {co.ticker}
                    </span>
                  </Link>
                </td>
                <td
                  className={`px-5 py-2 text-right font-mono tabular-nums ${
                    co.sig
                      ? co.r >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {co.r >= 0 ? "+" : ""}
                  {co.r.toFixed(3)}
                </td>
                <td className="px-5 py-2">
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/20" />
                      <div
                        className="absolute top-0 bottom-0 rounded-full"
                        style={{
                          width: `${getBarWidth(co.r)}%`,
                          backgroundColor:
                            co.r >= 0 ? "#22c55e" : "#ef4444",
                          left:
                            co.r >= 0
                              ? "50%"
                              : `${50 - getBarWidth(co.r)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-2 text-right text-muted-foreground tabular-nums">
                  {co.n}
                </td>
                <td className="px-5 py-2 text-right">
                  {co.sig ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Yes
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuintileDeepDive({
  quintiles,
}: {
  quintiles: CorrelationAnalysis["quintiles"];
}) {
  const colors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-zinc-500",
    "bg-emerald-400",
    "bg-emerald-500",
  ];
  const maxReturn = Math.max(
    ...quintiles.map((q) => Math.abs(q.avg_return))
  );

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Quintile Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Average returns by sentiment quintile with sample sizes
      </p>
      <div className="space-y-3">
        {quintiles.map((q, i) => {
          const barWidth = (Math.abs(q.avg_return) / maxReturn) * 100;
          return (
            <div key={q.quintile} className="flex items-center gap-4">
              <div className="w-28 text-right flex-shrink-0">
                <span className="text-sm font-medium">{q.quintile}</span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  {q.label}
                </span>
              </div>
              <div className="flex-1 h-6 bg-muted/30 rounded-md overflow-hidden relative flex items-center">
                <div
                  className={`h-full ${colors[i]} rounded-md transition-all`}
                  style={{ width: `${barWidth}%`, minWidth: "2px" }}
                />
                <span className="ml-2 text-xs font-mono tabular-nums text-foreground">
                  {q.avg_return > 0 ? "+" : ""}
                  {q.avg_return.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums w-16 text-right flex-shrink-0">
                n={q.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { data: correlations, isLoading: corrLoading } =
    useQuery<CorrelationAnalysis>({
      queryKey: ["/api/correlations"],
    });

  const { data: scatterData, isLoading: scatterLoading } = useQuery<
    ScatterPoint[]
  >({
    queryKey: ["/api/scatter"],
  });

  if (corrLoading || scatterLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 bg-card border border-card-border rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!correlations || !scatterData) return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold" data-testid="page-title">
          Correlation Analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Relationship between earnings call sentiment and next-quarter stock
          returns
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-card border border-card-border rounded-lg p-3 ring-1 ring-blue-500/30">
          <p className="text-xs text-muted-foreground">Overall r</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {correlations.overall.r >= 0 ? "+" : ""}
            {correlations.overall.r.toFixed(3)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">t-statistic</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {correlations.overall.t?.toFixed(2) || "—"}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Data Points</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {correlations.total_pairs}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Significant?</p>
          <p className="text-lg font-semibold mt-0.5">
            {correlations.overall.sig ? (
              <span className="text-emerald-400">Yes (p &lt; 0.05)</span>
            ) : (
              "No"
            )}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3 ring-1 ring-emerald-500/30">
          <p className="text-xs text-muted-foreground">Delta r</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5 text-emerald-400">
            +{correlations.delta_analysis.overall.r.toFixed(3)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Sentiment change
          </p>
        </div>
      </div>

      {/* Scatter Plot */}
      <CorrelationScatter data={scatterData} />

      {/* Dimension + Quintile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DimensionCorrelationChart byDimension={correlations.by_dimension} />
        <QuintileDeepDive quintiles={correlations.quintiles} />
      </div>

      {/* Delta Analysis */}
      <DeltaQuintilesChart quintiles={correlations.delta_analysis.quintiles} />

      {/* Subsector Breakdown */}
      <SubsectorBreakdown bySubsector={correlations.by_subsector} />

      {/* Per-Company Correlation Table */}
      <CompanyCorrelationTable byCompany={correlations.by_company} />
    </div>
  );
}
