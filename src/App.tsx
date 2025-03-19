
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create placeholder pages to complete routing
const SOCOverview = () => <div className="p-8">SOC Overview Page - Coming Soon</div>;
const Incidents = () => <div className="p-8">Incidents Page - Coming Soon</div>;
const Vulnerabilities = () => <div className="p-8">Vulnerabilities Page - Coming Soon</div>;
const Reports = () => <div className="p-8">Reports Page - Coming Soon</div>;
const Settings = () => <div className="p-8">Settings Page - Coming Soon</div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/soc" element={<SOCOverview />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
