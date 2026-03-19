import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppSidebar from "@/components/AppSidebar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import NotFound from "@/pages/not-found";
import OverviewPage from "@/pages/overview";
import CompanyDetailPage from "@/pages/company-detail";
import AnalysisPage from "@/pages/analysis";
import MethodologyPage from "@/pages/methodology";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={OverviewPage} />
      <Route path="/company/:ticker" component={CompanyDetailPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route path="/methodology" component={MethodologyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <div className="flex min-h-screen">
              <AppSidebar />
              <main className="flex-1 ml-60 min-h-screen">
                <AppRouter />
                <div className="px-6 py-4">
                  <PerplexityAttribution />
                </div>
              </main>
            </div>
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
