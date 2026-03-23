import { useQuery } from "@tanstack/react-query";
import type { Methodology } from "@shared/schema";
import { DIMENSION_LABELS } from "@shared/schema";
import {
  BookOpen,
  Brain,
  Database,
  Scale,
  BarChart3,
  ArrowRight,
  ExternalLink,
  FlaskConical,
} from "lucide-react";

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  overall_sentiment:
    "The general tone of the earnings call — optimistic, cautious, or defensive. Captures broad management confidence and outlook framing.",
  guidance_confidence:
    "How confidently management discusses forward guidance. Higher when specific targets are given vs. hedged or withdrawn guidance.",
  ai_exposure:
    "Degree of positive AI-related commentary — investment in AI, AI-driven revenue, product integration. Key tech differentiator.",
  cloud_momentum:
    "Cloud migration, ARR growth, and cloud-native product adoption signals. Measures cloud business trajectory.",
  competitive_moat:
    "Language around competitive advantages, market leadership, switching costs, and barriers to entry. Stronger moat = higher score.",
  capex_confidence:
    "Confidence in capital expenditure plans. Higher when spending is positioned as growth investment vs. cost pressure.",
  margin_trajectory:
    "Signals about gross and operating margin direction. Strongest predictive dimension (r = +0.130).",
  innovation_pipeline:
    "R&D output, product launches, patent activity, and platform evolution. Measures innovation velocity.",
  customer_momentum:
    "Customer acquisition, retention, expansion signals. Net revenue retention, deal pipeline, and logo growth.",
  macro_sensitivity:
    "How much management attributes performance to macro conditions. Higher = more insulated from macro headwinds.",
};

export default function MethodologyPage() {
  const { data: methodology, isLoading } = useQuery<Methodology>({
    queryKey: ["/api/methodology"],
  });

  if (isLoading) {
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

  if (!methodology) return null;

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold" data-testid="page-title">
          Methodology
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          How we score tech earnings calls and correlate sentiment with returns
        </p>
      </div>

      {/* Pipeline Overview */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Analysis Pipeline</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {[
            { label: "Quartr", sub: "Transcript source" },
            { label: methodology.model, sub: "LLM scoring" },
            { label: "10 Dimensions", sub: "Sentiment scores" },
            { label: "yfinance", sub: "Stock returns" },
            { label: "Pearson r", sub: "Correlation" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="bg-muted/50 border border-card-border rounded-lg px-3 py-2 text-center">
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            We analyze quarterly earnings call transcripts from 37 tech companies
            across 11 subsectors. Each transcript is processed through{" "}
            <span className="text-foreground font-medium">
              {methodology.model}
            </span>{" "}
            (Anthropic's fast, efficient language model) which scores 10
            tech-specific sentiment dimensions on a 0–1 scale.
          </p>
          <p>
            Transcripts are sourced from{" "}
            <span className="text-foreground font-medium">
              {methodology.transcript_source}
            </span>
            . Stock returns are computed using{" "}
            <span className="text-foreground font-medium">
              {methodology.price_source}
            </span>{" "}
            data over a{" "}
            <span className="text-foreground font-medium">
              {methodology.return_window}
            </span>{" "}
            window after each earnings call.
          </p>
        </div>
      </section>

      {/* 10 Scoring Dimensions */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">
            10 Scoring Dimensions
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Each dimension is scored 0–1 by the LLM based on language analysis of
          the full transcript. The composite score averages all 10 dimensions.
        </p>
        <div className="space-y-4">
          {methodology.dimensions.map((dimKey) => {
            const label =
              DIMENSION_LABELS[dimKey as keyof typeof DIMENSION_LABELS] ||
              dimKey;
            const desc = DIMENSION_DESCRIPTIONS[dimKey] || "";
            return (
              <div
                key={dimKey}
                className="flex gap-4 items-start"
                data-testid={`dim-${dimKey}`}
              >
                <div className="w-1 h-full min-h-[40px] bg-blue-500/30 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  {desc && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Statistical Methodology */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Statistical Methods</h3>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div>
            <p className="text-foreground font-medium mb-1">
              Pearson Correlation (r)
            </p>
            <p>
              Measures linear relationship between sentiment scores and
              next-quarter returns. Values range from -1 (perfect negative) to
              +1 (perfect positive). Our overall r = +0.087 indicates a weak
              but statistically significant positive relationship.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium mb-1">
              t-Test for Significance
            </p>
            <p>
              Student's t-test determines whether correlations are
              statistically different from zero. We use p &lt; 0.05 as our
              significance threshold. With t = 2.24 and 669 pairs, the overall
              correlation is significant.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium mb-1">
              Quintile Analysis
            </p>
            <p>
              Transcripts are sorted by composite score and divided into 5
              equal groups. We compare average next-quarter returns across
              quintiles. A monotonic increase (Q1: +6.0% → Q5: +11.3%)
              provides strong evidence of signal.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium mb-1">
              Sentiment Change (Delta) Analysis
            </p>
            <p>
              For each company, we compute quarter-over-quarter change in
              composite score, then correlate with returns. Delta r = +0.123 (t
              = 3.10) is even stronger than level correlation, suggesting
              sentiment improvement is a better signal than absolute level.
            </p>
          </div>
        </div>
      </section>

      {/* Data Coverage */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Data Coverage</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Companies</p>
            <p className="text-lg font-semibold font-mono mt-0.5">37</p>
            <p className="text-xs text-muted-foreground">
              Across 11 tech subsectors
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Transcripts</p>
            <p className="text-lg font-semibold font-mono mt-0.5">722</p>
            <p className="text-xs text-muted-foreground">
              Quarterly earnings calls
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Return Pairs</p>
            <p className="text-lg font-semibold font-mono mt-0.5">669</p>
            <p className="text-xs text-muted-foreground">
              With next-quarter return data
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Time Span</p>
            <p className="text-lg font-semibold font-mono mt-0.5">
              2021–2026
            </p>
            <p className="text-xs text-muted-foreground">
              Multiple market cycles
            </p>
          </div>
        </div>
      </section>

      {/* Key Findings Summary */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Key Findings</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <span className="text-foreground font-medium">
              Tech-sector focus works.
            </span>{" "}
            Unlike cross-sector analysis (r ≈ 0), the tech-focused approach
            reveals a real, statistically significant positive relationship
            (r = +0.087, p &lt; 0.05) between earnings call sentiment and
            next-quarter returns.
          </p>
          <p>
            <span className="text-foreground font-medium">
              Margin trajectory is the strongest signal.
            </span>{" "}
            With r = +0.130 (t = 3.37), margin trajectory is the single most
            predictive dimension. AI exposure (r = +0.103) and guidance
            confidence (r = +0.094) follow.
          </p>
          <p>
            <span className="text-foreground font-medium">
              Subsector matters.
            </span>{" "}
            Cloud/SaaS (r = +0.203) and Semiconductors (r = +0.196) show the
            strongest signals. Enterprise Software shows no significant
            correlation.
          </p>
          <p>
            <span className="text-foreground font-medium">
              Sentiment change is even more predictive.
            </span>{" "}
            Quarter-over-quarter change in sentiment (r = +0.123) provides a
            7.3 percentage point spread between biggest decliners and biggest
            improvers.
          </p>
        </div>
      </section>

      {/* References */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">References</h3>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Loughran & McDonald (2011)</p>
              <p className="text-muted-foreground">
                "When Is a Liability Not a Liability?" — Foundational work on
                financial sentiment dictionaries.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Kim & Kim (2024)</p>
              <p className="text-muted-foreground">
                "Financial Statement Analysis with Large Language Models" —
                LLMs can match or exceed traditional NLP for financial text
                analysis with chain-of-thought prompting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <h3 className="text-sm font-semibold mb-3">Limitations & Caveats</h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>
            37 companies over ~5 years. Results may not generalize to the
            broader market.
          </li>
          <li>
            LLM-based scoring introduces model-specific biases and may not be
            reproducible across different model versions.
          </li>
          <li>
            Next-quarter returns are influenced by many factors beyond
            earnings call sentiment (macro, sector rotation, etc.).
          </li>
          <li>
            This is an analytical tool, not investment advice. Past
            correlations do not imply future predictive power.
          </li>
        </ul>
      </section>
    </div>
  );
}
