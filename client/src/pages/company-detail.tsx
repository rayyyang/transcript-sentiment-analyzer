import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { CompanyDetail, CompanyListItem } from "@shared/schema";
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
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import { ArrowLeft, ChevronDown, ChevronUp, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";

function SentimentPriceChart({ company }: { company: CompanyDetail }) {
  const chartData = company.history.map((h) => ({
    date: h.date,
    label: h.title,
    composite: h.composite_score,
  }));

  // Find closest price for each transcript date
  const enriched = chartData.map((d) => {
    const priceMatch = company.price_history.reduce((closest, p) => {
      const diff = Math.abs(
        new Date(p.date).getTime() - new Date(d.date).getTime()
      );
      const closestDiff = Math.abs(
        new Date(closest.date).getTime() - new Date(d.date).getTime()
      );
      return diff < closestDiff ? p : closest;
    }, company.price_history[0]);
    return { ...d, price: priceMatch?.close };
  });

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Sentiment & Price History</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Composite score over time with stock price overlay
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={enriched} margin={{ top: 5, right: 50, bottom: 5, left: 0 }}>
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
            label={{ value: "Score", angle: -90, position: "insideLeft", fill: "hsl(215 20% 55%)", fontSize: 10 }}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            label={{ value: "Price", angle: 90, position: "insideRight", fill: "hsl(215 20% 55%)", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(240 6% 10%)",
              border: "1px solid hsl(240 4% 20%)",
              borderRadius: "6px",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              name === "composite"
                ? value.toFixed(3)
                : `$${value.toFixed(2)}`,
              name === "composite" ? "Sentiment" : "Price",
            ]}
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
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ fill: "#22c55e", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-500 rounded" />
          <span>Sentiment Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded border-dashed" style={{ borderTop: "1px dashed #22c55e" }} />
          <span>Stock Price</span>
        </div>
      </div>
    </div>
  );
}

function DimensionRadar({ company }: { company: CompanyDetail }) {
  const latest = company.history[company.history.length - 1];
  if (!latest) return null;

  const radarData = [
    { dim: "Sentiment", value: latest.overall_sentiment, fullMark: 1 },
    { dim: "Guidance", value: latest.guidance_confidence, fullMark: 1 },
    { dim: "Hedging", value: 1 - latest.hedging_intensity, fullMark: 1 },
    { dim: "Growth", value: latest.growth_language, fullMark: 1 },
    { dim: "Margin", value: latest.margin_confidence, fullMark: 1 },
    { dim: "Q&A", value: 1 - latest.qa_defensiveness, fullMark: 1 },
  ];

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Latest Dimension Profile</h3>
      <p className="text-xs text-muted-foreground mb-2">
        {latest.title} — Higher is more positive (hedging & defensiveness inverted)
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(240 4% 20%)" />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
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

function CompanyScatter({ company }: { company: CompanyDetail }) {
  const data = company.history
    .filter((h) => h.next_q_return !== undefined && h.next_q_return !== null)
    .map((h) => ({
      x: h.composite_score,
      y: h.next_q_return!,
      name: h.title,
    }));

  return (
    <div className="bg-card border border-card-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-1">Sentiment vs. Return</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Composite score vs. next-quarter stock return
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 4% 20%)" />
          <XAxis
            dataKey="x"
            name="Score"
            type="number"
            tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
            axisLine={{ stroke: "hsl(240 4% 20%)" }}
            tickLine={false}
            label={{ value: "Composite Score", position: "bottom", fill: "hsl(215 20% 55%)", fontSize: 10, offset: 5 }}
          />
          <YAxis
            dataKey="y"
            name="Return"
            type="number"
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
            formatter={(value: number, name: string) => [
              name === "Score" ? value.toFixed(3) : `${value.toFixed(1)}%`,
              name === "Score" ? "Score" : "Return",
            ]}
            labelFormatter={() => ""}
          />
          <Scatter data={data} fill="#3b82f6">
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.y >= 0 ? "#22c55e" : "#ef4444"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function TranscriptTable({ company }: { company: CompanyDetail }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getScoreColor = (val: number, invert = false) => {
    const v = invert ? 1 - val : val;
    if (v >= 0.75) return "text-emerald-400";
    if (v >= 0.55) return "text-blue-400";
    if (v >= 0.4) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border">
        <h3 className="text-sm font-semibold">Transcript History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="transcript-table">
          <thead>
            <tr className="border-b border-card-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Quarter</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Sentiment</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Guidance</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Hedging</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Growth</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Margin</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Q&A Def.</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Composite</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Next-Q Return</th>
              <th className="px-3 py-3 text-xs font-medium text-muted-foreground w-10"></th>
            </tr>
          </thead>
          <tbody>
            {company.history.map((t, i) => (
              <>
                <tr
                  key={t.date}
                  className="border-b border-card-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                  data-testid={`transcript-row-${i}`}
                >
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                    {new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{t.title}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${getScoreColor(t.overall_sentiment)}`}>
                    {t.overall_sentiment.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${getScoreColor(t.guidance_confidence)}`}>
                    {t.guidance_confidence.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${getScoreColor(t.hedging_intensity, true)}`}>
                    {t.hedging_intensity.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${getScoreColor(t.growth_language)}`}>
                    {t.growth_language.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${getScoreColor(t.margin_confidence)}`}>
                    {t.margin_confidence.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${getScoreColor(t.qa_defensiveness, true)}`}>
                    {t.qa_defensiveness.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums font-medium">
                    {t.composite_score.toFixed(3)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                    t.next_q_return !== undefined && t.next_q_return !== null
                      ? t.next_q_return >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                      : "text-muted-foreground"
                  }`}>
                    {t.next_q_return !== undefined && t.next_q_return !== null
                      ? `${t.next_q_return > 0 ? "+" : ""}${t.next_q_return.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {expandedRow === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </td>
                </tr>
                {expandedRow === i && (
                  <tr key={`summary-${t.date}`} className="border-b border-card-border/50">
                    <td colSpan={11} className="px-5 py-4 bg-muted/10">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t.summary}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {t.word_count.toLocaleString()} words analyzed
                      </p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  const [, params] = useRoute("/company/:ticker");
  const ticker = params?.ticker?.toUpperCase() || "AAPL";

  const { data: company, isLoading } = useQuery<CompanyDetail>({
    queryKey: ["/api/company", ticker],
    queryFn: async () => {
      const { apiRequest } = await import("@/lib/queryClient");
      const res = await apiRequest("GET", `/api/company/${ticker}`);
      return res.json();
    },
  });

  const { data: companies } = useQuery<CompanyListItem[]>({
    queryKey: ["/api/companies"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-card border border-card-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Company not found.</p>
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
              {company.sector}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {company.date_range.earliest} to {company.date_range.latest}
            </span>
          </div>
        </div>
        {/* Company quick-nav dropdown */}
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
          <p className="text-xs text-muted-foreground">Composite Score</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {company.averages.composite_score.toFixed(3)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Trend</p>
          <p className={`text-lg font-semibold tabular-nums font-mono mt-0.5 ${
            company.trend > 0 ? "text-emerald-400" : company.trend < 0 ? "text-red-400" : ""
          }`}>
            {company.trend > 0 ? "+" : ""}{company.trend.toFixed(3)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Volatility</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {company.volatility.toFixed(3)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Transcripts</p>
          <p className="text-lg font-semibold tabular-nums font-mono mt-0.5">
            {company.history.length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <SentimentPriceChart company={company} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DimensionRadar company={company} />
        <CompanyScatter company={company} />
      </div>

      {/* Transcript Table */}
      <TranscriptTable company={company} />
    </div>
  );
}
