import { useQuery } from "@tanstack/react-query";
import type { CorrelationsResponse } from "@shared/schema";
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

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  "Consumer Discretionary": "#f59e0b",
  Financials: "#22c55e",
  "Consumer Staples": "#a855f7",
  Energy: "#ef4444",
  "Communication Services": "#06b6d4",
  Healthcare: "#ec4899",
};

interface ScatterPoint {
  ticker: string;
  sector: string;
  date: string;
  composite_score: number;
  next_q_return: number;
}

function CorrelationScatter({ data }: { data: ScatterPoint[] }) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const sectors = useMemo(() => [...new Set(data.map((d) => d.sector))], [data]);

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Sentiment vs. Next-Quarter Return</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {data.length} transcript-return pairs, color-coded by sector
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 20%)" />
          <XAxis
            dataKey="composite_score"
            name="Score"
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
            label={{ value: "Composite Sentiment Score", position: "bottom", fill: "hsl(215 20% 55%)", fontSize: 10, offset: 12 }}
          />
          <YAxis
            dataKey="next_q_return"
            name="Return"
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Next-Q Return (%)", angle: -90, position: "insideLeft", fill: "hsl(215 20% 55%)", fontSize: 10, offset: 0 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              name === "Score" ? value.toFixed(3) : `${value.toFixed(1)}%`,
              name === "Score" ? "Score" : "Return",
            ]}
            labelFormatter={(_, payload) => {
              if (payload && payload.length > 0) {
                const p = payload[0].payload as ScatterPoint;
                return `${p.ticker} (${p.date})`;
              }
              return "";
            }}
          />
          <Scatter data={data} fill="#3b82f6">
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={SECTOR_COLORS[d.sector] || "#6b7280"}
                opacity={
                  hoveredSector === null || hoveredSector === d.sector ? 0.8 : 0.15
                }
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
        {sectors.map((s) => (
          <button
            key={s}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onMouseEnter={() => setHoveredSector(s)}
            onMouseLeave={() => setHoveredSector(null)}
            data-testid={`legend-${s.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: SECTOR_COLORS[s] || "#6b7280" }}
            />
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function DimensionCorrelationChart({ byDimension }: { byDimension: Record<string, { r: number; n: number; sig: boolean }> }) {
  const dimLabels: Record<string, string> = {
    overall: "Overall Sentiment",
    guidance: "Guidance Confidence",
    hedging: "Hedging Intensity",
    growth: "Growth Language",
    margin: "Margin Confidence",
    qa_def: "Q&A Defensiveness",
  };

  const data = Object.entries(byDimension)
    .map(([key, val]) => ({
      name: dimLabels[key] || key,
      r: val.r,
    }))
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Dimension Correlations with Returns</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Which sentiment dimensions correlate most with next-quarter stock returns
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 20%)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
            domain={[-0.05, 0.06]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={115}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number) => [value.toFixed(4), "Correlation (r)"]}
          />
          <Bar dataKey="r" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.r >= 0 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CompanyCorrelationTable({
  byCompany,
}: {
  byCompany: Record<string, { r: number; t: number | null; n: number; sig: boolean }>;
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

  const getCorrelationColor = (r: number) => {
    if (r > 0.5) return "text-emerald-400";
    if (r > 0.2) return "text-emerald-400/70";
    if (r > -0.2) return "text-muted-foreground";
    if (r > -0.5) return "text-red-400/70";
    return "text-red-400";
  };

  const getBarWidth = (r: number) => Math.abs(r) * 100;

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-sm font-semibold">Per-Company Correlations</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sentiment-return correlation by company (click headers to sort)
        </p>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm" data-testid="company-correlation-table">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-card-border">
              <th
                className="text-left px-5 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("ticker")}
              >
                Ticker {sortBy === "ticker" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="text-right px-5 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("r")}
              >
                Correlation (r) {sortBy === "r" ? (sortDir === "asc" ? "↑" : "↓") : ""}
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
                <td className="px-5 py-2 font-mono font-medium text-blue-400">
                  {co.ticker}
                </td>
                <td className={`px-5 py-2 text-right font-mono tabular-nums ${getCorrelationColor(co.r)}`}>
                  {co.r >= 0 ? "+" : ""}{co.r.toFixed(4)}
                </td>
                <td className="px-5 py-2">
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/20" />
                      <div
                        className="absolute top-0 bottom-0 rounded-full"
                        style={{
                          width: `${getBarWidth(co.r)}%`,
                          backgroundColor: co.r >= 0 ? "#22c55e" : "#ef4444",
                          left: co.r >= 0 ? "50%" : `${50 - getBarWidth(co.r)}%`,
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

function QuintileDeepDive({ quintiles }: { quintiles: CorrelationsResponse["quintiles"] }) {
  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Quintile Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Average returns by sentiment quintile with sample sizes
      </p>
      <div className="space-y-3">
        {quintiles.map((q, i) => {
          const colors = ["bg-red-500", "bg-amber-500", "bg-zinc-500", "bg-emerald-400", "bg-emerald-500"];
          const maxReturn = Math.max(...quintiles.map((q) => Math.abs(q.avg_return)));
          const barWidth = (Math.abs(q.avg_return) / maxReturn) * 100;

          return (
            <div key={q.quintile} className="flex items-center gap-4">
              <div className="w-28 text-right flex-shrink-0">
                <span className="text-sm font-medium">{q.quintile}</span>
                <span className="text-xs text-muted-foreground ml-1.5">{q.label}</span>
              </div>
              <div className="flex-1 h-6 bg-muted/30 rounded-md overflow-hidden relative flex items-center">
                <div
                  className={`h-full ${colors[i]} rounded-md transition-all`}
                  style={{ width: `${barWidth}%`, minWidth: "2px" }}
                />
                <span className="ml-2 text-xs font-mono tabular-nums text-foreground">
                  {q.avg_return > 0 ? "+" : ""}{q.avg_return.toFixed(2)}%
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
  const { data: correlations, isLoading: corrLoading } = useQuery<CorrelationsResponse>({
    queryKey: ["/api/correlations"],
  });

  const { data: scatterData, isLoading: scatterLoading } = useQuery<ScatterPoint[]>({
    queryKey: ["/api/scatter"],
  });

  if (corrLoading || scatterLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-card border border-card-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!correlations || !scatterData) return null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold" data-testid="page-title">
          Cross-Company Analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Exploring the relationship between earnings call sentiment and subsequent stock returns
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Overall r</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {correlations.overall.r.toFixed(4)}
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
            {correlations.overall.sig ? "Yes" : "No"}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">t-statistic</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {correlations.overall.t !== null ? correlations.overall.t.toFixed(2) : "—"}
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

      {/* Per-Company Correlation Table */}
      <CompanyCorrelationTable byCompany={correlations.by_company} />
    </div>
  );
}
