import type { Express } from "express";
import { createServer, type Server } from "http";
import { readFileSync } from "fs";
import { join, resolve } from "path";
import type { WebappData } from "@shared/schema";

// Resolve data path - works in both dev (tsx) and prod (bundled cjs)
const dataPath = resolve(process.cwd(), "server", "webapp_data.json");

// Load and parse data at startup, handling Infinity/NaN values
const rawData = readFileSync(dataPath, "utf-8");
const cleanedData = rawData
  .replace(/:\s*Infinity/g, ": null")
  .replace(/:\s*-Infinity/g, ": null")
  .replace(/:\s*NaN/g, ": null");
const data: WebappData = JSON.parse(cleanedData);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/overview
  app.get("/api/overview", (_req, res) => {
    // Compute date range across all companies
    let earliest = "9999-12-31";
    let latest = "0000-01-01";
    for (const co of Object.values(data.companies)) {
      if (co.date_range.earliest < earliest) earliest = co.date_range.earliest;
      if (co.date_range.latest > latest) latest = co.date_range.latest;
    }

    res.json({
      total_companies: data.total_companies,
      total_transcripts: data.total_transcripts,
      date_range: { earliest, latest },
      overall_correlation: data.correlation_analysis.overall,
      sectors: data.sectors,
      quintiles: data.correlation_analysis.quintiles,
    });
  });

  // GET /api/companies
  app.get("/api/companies", (_req, res) => {
    const list = Object.values(data.companies).map((co) => ({
      ticker: co.ticker,
      name: co.name,
      sector: co.sector,
      composite_score: co.averages.composite_score,
      trend: co.trend,
      n_transcripts: co.n_transcripts,
    }));
    // Sort by composite score descending
    list.sort((a, b) => b.composite_score - a.composite_score);
    res.json(list);
  });

  // GET /api/company/:ticker
  app.get("/api/company/:ticker", (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const company = data.companies[ticker];
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json({
      ticker: company.ticker,
      name: company.name,
      sector: company.sector,
      date_range: company.date_range,
      averages: company.averages,
      trend: company.trend,
      volatility: company.volatility,
      history: company.history,
      price_history: company.price_history,
    });
  });

  // GET /api/correlations
  app.get("/api/correlations", (_req, res) => {
    res.json({
      overall: data.correlation_analysis.overall,
      by_dimension: data.correlation_analysis.by_dimension,
      by_company: data.correlation_analysis.by_company,
      quintiles: data.correlation_analysis.quintiles,
      total_pairs: data.correlation_analysis.total_pairs,
      note: data.correlation_analysis.note,
    });
  });

  // GET /api/methodology
  app.get("/api/methodology", (_req, res) => {
    res.json(data.methodology);
  });

  // GET /api/scatter - all transcript data points for cross-company scatter
  app.get("/api/scatter", (_req, res) => {
    const points: Array<{
      ticker: string;
      sector: string;
      date: string;
      composite_score: number;
      next_q_return: number;
    }> = [];
    for (const co of Object.values(data.companies)) {
      for (const t of co.history) {
        if (t.next_q_return !== undefined && t.next_q_return !== null) {
          points.push({
            ticker: co.ticker,
            sector: co.sector,
            date: t.date,
            composite_score: t.composite_score,
            next_q_return: t.next_q_return,
          });
        }
      }
    }
    res.json(points);
  });

  return httpServer;
}
