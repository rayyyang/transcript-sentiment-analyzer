// TypeScript types for the Sentiment Analyzer data

export interface Dimension {
  key: string;
  label: string;
  description: string;
}

export interface CompositeWeights {
  overall_sentiment: number;
  guidance_confidence: number;
  hedging_intensity_inverse: number;
  growth_language: number;
  margin_confidence: number;
}

export interface Methodology {
  model: string;
  dimensions: Dimension[];
  composite_weights: CompositeWeights;
  source: string;
  scoring: string;
}

export interface TranscriptEntry {
  date: string;
  fiscal_year: number;
  fiscal_period: string;
  title: string;
  overall_sentiment: number;
  guidance_confidence: number;
  hedging_intensity: number;
  growth_language: number;
  margin_confidence: number;
  qa_defensiveness: number;
  composite_score: number;
  summary: string;
  word_count: number;
  next_q_return?: number;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface DateRange {
  earliest: string;
  latest: string;
}

export interface CompanyAverages {
  overall_sentiment: number;
  guidance_confidence: number;
  hedging_intensity: number;
  growth_language: number;
  margin_confidence: number;
  qa_defensiveness: number;
  composite_score: number;
}

export interface Company {
  ticker: string;
  name: string;
  sector: string;
  n_transcripts: number;
  date_range: DateRange;
  averages: CompanyAverages;
  trend: number;
  volatility: number;
  history: TranscriptEntry[];
  price_history: PricePoint[];
}

export interface SectorData {
  count: number;
  avg_composite: number;
  avg_sentiment: number;
  tickers: string[];
}

export interface CorrelationResult {
  r: number;
  t: number | null;
  n: number;
  sig: boolean;
  significant?: boolean;
}

export interface QuintileData {
  quintile: string;
  label: string;
  avg_score: number;
  avg_return: number;
  count: number;
}

export interface CorrelationAnalysis {
  overall: CorrelationResult;
  by_dimension: Record<string, CorrelationResult>;
  by_company: Record<string, CorrelationResult>;
  quintiles: QuintileData[];
  total_pairs: number;
  note: string;
}

export interface WebappData {
  generated_at: string;
  total_companies: number;
  total_transcripts: number;
  methodology: Methodology;
  companies: Record<string, Company>;
  sectors: Record<string, SectorData>;
  dimension_correlations: Record<string, Record<string, CorrelationResult>>;
  correlation_analysis: CorrelationAnalysis;
}

// API response types
export interface OverviewResponse {
  total_companies: number;
  total_transcripts: number;
  date_range: { earliest: string; latest: string };
  overall_correlation: CorrelationResult;
  sectors: Record<string, SectorData>;
  quintiles: QuintileData[];
}

export interface CompanyListItem {
  ticker: string;
  name: string;
  sector: string;
  composite_score: number;
  trend: number;
  n_transcripts: number;
}

export interface CompanyDetail {
  ticker: string;
  name: string;
  sector: string;
  date_range: DateRange;
  averages: CompanyAverages;
  trend: number;
  volatility: number;
  history: TranscriptEntry[];
  price_history: PricePoint[];
}

export interface CorrelationsResponse {
  overall: CorrelationResult;
  by_dimension: Record<string, CorrelationResult>;
  by_company: Record<string, CorrelationResult>;
  quintiles: QuintileData[];
  total_pairs: number;
  note: string;
}
