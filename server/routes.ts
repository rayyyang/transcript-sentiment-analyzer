import type { Express } from "express";
import { createServer, type Server } from "http";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { WebappData } from "@shared/schema";

const dataPath = resolve(process.cwd(), "server", "webapp_data.json");
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
    let earliest = "9999-12-31";
    let latest = "0000-01-01";
    for (const co of Object.values(data.companies)) {
      if (co.date_range.earliest < earliest) earliest = co.date_range.earliest;
      if (co.date_range.latest > latest) latest = co.date_range.latest;
    }
    res.json({
      total_companies: data.total_companies,
      total_transcripts: data.total_transcripts,
      total_with_returns: data.total_with_returns,
      focus: data.focus,
      date_range: { earliest, latest },
      overall_correlation: data.correlation_analysis.overall,
      subsectors: data.subsectors,
      quintiles: data.correlation_analysis.quintiles,
    });
  });

  // GET /api/companies
  app.get("/api/companies", (_req, res) => {
    const list = Object.values(data.companies).map((co) => ({
      ticker: co.ticker,
      name: co.name,
      subsector: co.subsector,
      avg_composite: co.avg_composite,
      trend: co.trend,
      n_transcripts: co.n_transcripts,
      n_with_returns: co.n_with_returns,
      averages: co.averages,
    }));
    list.sort((a, b) => b.avg_composite - a.avg_composite);
    res.json(list);
  });

  // GET /api/company/:ticker
  app.get("/api/company/:ticker", (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const company = data.companies[ticker];
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  });

  // GET /api/correlations
  app.get("/api/correlations", (_req, res) => {
    res.json(data.correlation_analysis);
  });

  // GET /api/methodology
  app.get("/api/methodology", (_req, res) => {
    res.json(data.methodology);
  });

  // GET /api/scatter
  app.get("/api/scatter", (_req, res) => {
    const points: Array<{
      ticker: string;
      subsector: string;
      date: string;
      composite: number;
      next_quarter_return: number;
    }> = [];
    for (const co of Object.values(data.companies)) {
      for (const t of co.history) {
        if (t.next_quarter_return !== undefined && t.next_quarter_return !== null) {
          points.push({
            ticker: co.ticker,
            subsector: co.subsector,
            date: t.date,
            composite: t.composite,
            next_quarter_return: t.next_quarter_return,
          });
        }
      }
    }
    res.json(points);
  });

  return httpServer;
}
