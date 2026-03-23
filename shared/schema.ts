// TypeScript types for the Tech-Focused Sentiment Analyzer

export const SCORE_DIMENSIONS = [
  'overall_sentiment', 'guidance_confidence', 'ai_exposure', 'cloud_momentum',
  'competitive_moat', 'capex_confidence', 'margin_trajectory', 'innovation_pipeline',
  'customer_momentum', 'macro_sensitivity'
] as const;

export type ScoreDimension = typeof SCORE_DIMENSIONS[number];

export const DIMENSION_LABELS: Record<ScoreDimension, string> = {
  overall_sentiment: 'Overall Sentiment',
  guidance_confidence: 'Guidance Confidence',
  ai_exposure: 'AI Exposure',
  cloud_momentum: 'Cloud Momentum',
  competitive_moat: 'Competitive Moat',
  capex_confidence: 'CapEx Confidence',
  margin_trajectory: 'Margin Trajectory',
  innovation_pipeline: 'Innovation Pipeline',
  customer_momentum: 'Customer Momentum',
  macro_sensitivity: 'Macro Sensitivity',
};

export interface TranscriptEntry {
  date: string;
  scores: Record<ScoreDimension, number>;
  composite: number;
  key_themes: string[];
  notable_quotes: string[];
  risk_flags: string[];
  next_quarter_return: number | null;
}

export interface DateRange {
  earliest: string;
  latest: string;
}

export interface Company {
  ticker: string;
  name: string;
  subsector: string;
  n_transcripts: number;
  n_with_returns: number;
  date_range: DateRange;
  averages: Record<ScoreDimension, number>;
  avg_composite: number;
  trend: number;
  history: TranscriptEntry[];
}

export interface SubsectorData {
  count: number;
  tickers: string[];
  avg_composite: number;
}

export interface CorrelationResult {
  r: number;
  t: number;
  n: number;
  sig?: boolean;
}

export interface QuintileData {
  quintile: string;
  label: string;
  avg_composite: number;
  avg_return: number;
  median_return: number;
  count: number;
  min_composite: number;
  max_composite: number;
}

export interface DeltaQuintile {
  quintile: string;
  label: string;
  avg_delta: number;
  avg_return: number;
  count: number;
}

export interface CorrelationAnalysis {
  overall: CorrelationResult;
  by_dimension: Record<string, CorrelationResult>;
  by_company: Record<string, CorrelationResult>;
  by_subsector: Record<string, CorrelationResult>;
  quintiles: QuintileData[];
  delta_analysis: {
    overall: CorrelationResult;
    quintiles: DeltaQuintile[];
  };
  total_pairs: number;
}

export interface Methodology {
  model: string;
  dimensions: string[];
  return_window: string;
  transcript_source: string;
  price_source: string;
}

export interface WebappData {
  generated_at: string;
  total_companies: number;
  total_transcripts: number;
  total_with_returns: number;
  focus: string;
  methodology: Methodology;
  companies: Record<string, Company>;
  subsectors: Record<string, SubsectorData>;
  correlation_analysis: CorrelationAnalysis;
}
