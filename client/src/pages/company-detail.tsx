import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Company, TranscriptEntry, SCORE_DIMENSIONS } from "@shared/schema";
import { DIMENSION_LABELS } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  AlertTriangle,
  MessageSquareQuote,
  Tag,
} from "lucide-react";
import { useState } from "react";

const SHORT_LABELS: Record<string, string> = {
  overall_sentiment: "Sentiment",
  guidance_confidence: "Guidance",
  ai_exposure: "AI Exposure",
  cloud_momentum: "Cloud",
  competitive_moat: "Moat",
  capex_confidence: "CapEx",
  margin_trajectory: "Margin",
  innovation_pipeline: "Innovation",
  customer_momentum: "Customers",
  macro_sensitivity: "Macro Sens.",
};

function DimensionRadar({ company }: { company: Company }) {
  const radarData = Object.entries(company.averages).map(([key, value]) => ({
    dim: SHORT_LABELS[key] || key,
    value: value,
    fullMark: 1,
  }));

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Average Dimension Profile</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Mean scores across all {company.n_transcripts} transcripts
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid stroke="hsl(240 4% 20%)" />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }}
          />
          <PolarRadiusAxis
            domain={[0, 1]}
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SentimentTimeline({ company }: { company: Company }) {
  const chartData = company.history.map((h) => {
    const dateObj = new Date(h.date + "T00:00:00");
    const label = dateObj.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    return {
      date: h.date,
      label,
      composite: h.composite,
      return_pct:
        h.next_quarter_return !== null && h.next_quarter_return !== undefined
          ? h.next_quarter_return
          : null,
    };
  });

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Sentiment Timeline</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Composite score over time with next-quarter return overlay
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 50, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 20%)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="sentiment"
            domain={[0.3, 1]}
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Score",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(215 20% 55%)",
              fontSize: 10,
            }}
          />
          <YAxis
            yAxisId="return"
            orientation="right"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            label={{
              value: "Return",
              angle: 90,
              position: "insideRight",
              fill: "hsl(215 20% 55%)",
              fontSize: 10,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number | null, name: string) => {
              if (value === null) return ["—", name];
              return name === "composite"
                ? [value.toFixed(3), "Sentiment"]
                : [`${value.toFixed(1)}%`, "Next-Q Return"];
            }}
          />
          <Line
            yAxisId="sentiment"
            type="monotone"
            dataKey="composite"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="return"
            type="monotone"
            dataKey="return_pct"
            stroke="#22c55e"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ fill: "#22c55e", r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-500 rounded" />
          <span>Composite Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ borderTop: "1.5px dashed #22c55e" }} />
          <span>Next-Q Return</span>
        </div>
      </div>
    </div>
  );
}

function DimensionHeatmap({ company }: { company: Company }) {
  const dims = Object.keys(company.averages) as Array<keyof typeof DIMENSION_LABELS>;
  
  const getColor = (val: number) => {
    if (val >= 0.8) return "bg-emerald-500/40 text-emerald-300";
    if (val >= 0.65) return "bg-emerald-500/20 text-emerald-400";
    if (val >= 0.5) return "bg-blue-500/20 text-blue-400";
    if (val >= 0.35) return "bg-amber-500/20 text-amber-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-sm font-semibold">Dimension Scores by Quarter</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Heatmap of all 10 dimensions across transcripts
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" data-testid="dimension-heatmap">
          <thead>
            <tr className="border-b border-card-border">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground sticky left-0 bg-card z-10">
                Quarter
              </th>
              {dims.map((dim) => (
                <th
                  key={dim}
                  className="text-center px-2 py-2 font-medium text-muted-foreground whitespace-nowrap"
                >
                  {SHORT_LABELS[dim] || dim}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {company.history.map((entry) => {
              const dateLabel = new Date(entry.date + "T00:00:00").toLocaleDateString(
                "en-US",
                { month: "short", year: "2-digit" }
              );
              return (
                <tr key={entry.date} className="border-b border-card-border/50">
                  <td className="px-3 py-1.5 font-mono text-muted-foreground sticky left-0 bg-card z-10">
                    {dateLabel}
                  </td>
                  {dims.map((dim) => {
                    const val = entry.scores[dim];
                    return (
                      <td key={dim} className="px-1 py-1 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-mono tabular-nums ${getColor(val)}`}
                        >
                          {val.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TranscriptTable({ company }: { company: Company }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-sm font-semibold">Transcript History</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click a row to see themes, quotes, and risk flags
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="transcript-table">
          <thead>
            <tr className="border-b border-card-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">
                Composite
              </th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">
                Next-Q Return
              </th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">
                Themes
              </th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">
                Risks
              </th>
              <th className="px-3 py-3 text-xs font-medium text-muted-foreground w-10"></th>
            </tr>
          </thead>
          <tbody>
            {company.history.map((t, i) => (
              <TranscriptRow
                key={t.date}
                entry={t}
                index={i}
                isExpanded={expandedRow === i}
                onToggle={() => setExpandedRow(expandedRow === i ? null : i)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TranscriptRow({
  entry,
  index,
  isExpanded,
  onToggle,
}: {
  entry: TranscriptEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const dateLabel = new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

  const ret = entry.next_quarter_return;
  const retDisplay =
    ret !== null && ret !== undefined
      ? `${ret > 0 ? "+" : ""}${ret.toFixed(1)}%`
      : "—";
  const retColor =
    ret !== null && ret !== undefined
      ? ret >= 0
        ? "text-emerald-400"
        : "text-red-400"
      : "text-muted-foreground";

  return (
    <>
      <tr
        className="border-b border-card-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={onToggle}
        data-testid={`transcript-row-${index}`}
      >
        <td className="px-4 py-2.5 tabular-nums text-muted-foreground font-mono">
          {dateLabel}
        </td>
        <td className="px-3 py-2.5 text-right font-mono tabular-nums font-medium">
          {entry.composite.toFixed(3)}
        </td>
        <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${retColor}`}>
          {retDisplay}
        </td>
        <td className="px-3 py-2.5 text-center tabular-nums text-muted-foreground">
          {entry.key_themes.length}
        </td>
        <td className="px-3 py-2.5 text-center tabular-nums">
          {entry.risk_flags.length > 0 ? (
            <span className="text-amber-400">{entry.risk_flags.length}</span>
          ) : (
            <span className="text-muted-foreground">0</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-center">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-card-border/50">
          <td colSpan={6} className="px-5 py-4 bg-muted/10">
            <div className="space-y-3">
              {/* Key Themes */}
              {entry.key_themes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-foreground">
                      Key Themes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.key_themes.map((theme, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notable Quotes */}
              {entry.notable_quotes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-foreground">
                      Notable Quotes
                    </span>
                  </div>
                  <div className="space-y-1">
                    {entry.notable_quotes.map((quote, j) => (
                      <p
                        key={j}
                        className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-emerald-500/30"
                      >
                        "{quote}"
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Flags */}
              {entry.risk_flags.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">
                      Risk Flags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.risk_flags.map((flag, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CompanyDetailPage() {
  const [, params] = useRoute("/company/:ticker");
  const ticker = params?.ticker?.toUpperCase() || "";

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ["/api/company", ticker],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/company/${ticker}`);
      return res.json();
    },
    enabled: !!ticker,
  });

  interface CompanyListItem {
    ticker: string;
    name: string;
    subsector: string;
  }

  const { data: companies } = useQuery<CompanyListItem[]>({
    queryKey: ["/api/companies"],
  });

  if (isLoading) {
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

  if (!company) {
    return (
      <div className="p-6">
        <Link href="/">
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" />
            Back to Overview
          </span>
        </Link>
        <p className="text-muted-foreground">Company not found: {ticker}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <Link href="/">
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3 h-3" />
              Back to Overview
            </span>
          </Link>
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-semibold" data-testid="company-name">
              {company.name}
            </h2>
            <span className="text-lg font-mono text-blue-400">{company.ticker}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {company.subsector}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {company.date_range.earliest} to {company.date_range.latest}
            </span>
          </div>
        </div>
        {companies && (
          <select
            className="bg-card border border-card-border rounded-md px-3 py-1.5 text-sm"
            value={ticker}
            onChange={(e) => {
              window.location.hash = `/company/${e.target.value}`;
            }}
            data-testid="company-select"
          >
            {companies.map((c) => (
              <option key={c.ticker} value={c.ticker}>
                {c.ticker} — {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Avg Composite</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {company.avg_composite.toFixed(3)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Trend</p>
          <p
            className={`text-lg font-semibold tabular-nums font-mono mt-0.5 ${
              company.trend > 0
                ? "text-emerald-400"
                : company.trend < 0
                ? "text-red-400"
                : ""
            }`}
          >
            {company.trend > 0 ? "+" : ""}
            {company.trend.toFixed(3)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Transcripts</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {company.n_transcripts}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">With Returns</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {company.n_with_returns}
          </p>
        </div>
      </div>

      {/* Charts */}
      <SentimentTimeline company={company} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DimensionRadar company={company} />
        <DimensionHeatmap company={company} />
      </div>

      {/* Transcript Table */}
      <TranscriptTable company={company} />
    </div>
  );
}
