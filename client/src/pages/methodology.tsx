import { useQuery } from "@tanstack/react-query";
import type { Methodology } from "@shared/schema";
import { BookOpen, Brain, Database, Scale, FileText, ExternalLink } from "lucide-react";

export default function MethodologyPage() {
  const { data: methodology, isLoading } = useQuery<Methodology>({
    queryKey: ["/api/methodology"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-card border border-card-border rounded-lg animate-pulse" />
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
          How we analyze earnings call transcripts to extract sentiment signals
        </p>
      </div>

      {/* Approach */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Approach</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            We analyze real earnings call transcripts from 32 S&P 500 companies using
            LLM-based sentiment scoring. Each transcript is processed through{" "}
            <span className="text-foreground font-medium">{methodology.model}</span>{" "}
            using{" "}
            <span className="text-foreground font-medium">{methodology.scoring}</span>.
          </p>
          <p>
            The model scores each transcript across 6 sentiment dimensions, producing
            normalized scores between 0 and 1. These are combined into a composite
            score using empirically-derived weights. We then compare these scores
            against actual next-quarter stock returns to evaluate predictive power.
          </p>
        </div>
      </section>

      {/* Dimensions */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Sentiment Dimensions</h3>
        </div>
        <div className="space-y-4">
          {methodology.dimensions.map((dim) => (
            <div key={dim.key} className="flex gap-4 items-start" data-testid={`dim-${dim.key}`}>
              <div className="w-1 h-full min-h-[40px] bg-blue-500/30 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{dim.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {dim.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Composite Weights */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Composite Score Weights</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          The composite score is a weighted blend of individual dimensions. Hedging
          intensity is inverted (1 - score) before weighting so higher composite
          always means more positive.
        </p>
        <div className="space-y-2">
          {Object.entries(methodology.composite_weights).map(([key, weight]) => {
            const labels: Record<string, string> = {
              overall_sentiment: "Overall Sentiment",
              guidance_confidence: "Guidance Confidence",
              hedging_intensity_inverse: "Hedging Intensity (inverted)",
              growth_language: "Growth Language",
              margin_confidence: "Margin Confidence",
            };
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-52 flex-shrink-0">
                  {labels[key] || key}
                </span>
                <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500/60 rounded"
                    style={{ width: `${weight * 100 * 2.5}%` }}
                  />
                </div>
                <span className="text-sm font-mono tabular-nums w-12 text-right">
                  {(weight * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data Sources */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">Data Sources</h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <span className="text-foreground font-medium">Transcripts:</span>{" "}
            {methodology.source}. 8 consecutive quarterly earnings calls per company
            (approximately Q1 2024 to Q1 2026).
          </p>
          <p>
            <span className="text-foreground font-medium">Scoring Model:</span>{" "}
            {methodology.model} — Anthropic's fast, efficient language model optimized
            for structured analysis tasks.
          </p>
          <p>
            <span className="text-foreground font-medium">Stock Prices:</span>{" "}
            Weekly closing prices from Yahoo Finance, used to compute next-quarter
            returns (90 calendar days post-earnings).
          </p>
        </div>
      </section>

      {/* References */}
      <section className="bg-card border border-card-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold">References & Prior Work</h3>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Loughran & McDonald (2011)</p>
              <p className="text-muted-foreground">
                "When Is a Liability Not a Liability?" — Foundational work on
                financial sentiment dictionaries, demonstrating that general-purpose
                sentiment tools misclassify financial language.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Araci (2019) — FinBERT</p>
              <p className="text-muted-foreground">
                Pre-trained NLP model for financial sentiment analysis, fine-tuned
                on financial communication texts. Established the baseline for
                transformer-based financial sentiment.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Druz et al. (2020)</p>
              <p className="text-muted-foreground">
                "Is There a Replication Crisis in Finance?" — Analysis of tone and
                language in corporate communication and its relationship to market
                outcomes and investor behavior.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Kim & Kim (2024)</p>
              <p className="text-muted-foreground">
                "Financial Statement Analysis with Large Language Models" — Demonstrates
                that LLMs can match or exceed traditional NLP approaches for financial
                text analysis when using chain-of-thought prompting.
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
            This analysis covers only 32 companies over ~2 years. Results should
            not be generalized to the broader market.
          </li>
          <li>
            LLM-based scoring introduces model-specific biases and may not be
            reproducible across different model versions.
          </li>
          <li>
            Next-quarter returns are influenced by many factors beyond earnings
            call sentiment (macro conditions, sector rotation, etc.).
          </li>
          <li>
            The composite score weights are not optimized for prediction — they
            reflect a reasonable prior on dimension importance.
          </li>
          <li>
            This is an analytical tool, not investment advice. Past correlations
            do not imply future predictive power.
          </li>
        </ul>
      </section>
    </div>
  );
}
