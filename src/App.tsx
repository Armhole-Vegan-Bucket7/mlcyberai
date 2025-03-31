
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/hooks/use-theme";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SOCOverview from "./pages/SOCOverview";
import SOCProfile from "./pages/SOCProfile"; 
import Incidents from "./pages/Incidents";
import Vulnerabilities from "./pages/Vulnerabilities";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Connectors from "./pages/system/Connectors";

// Import LightStack (formerly governance) pages
import Compliance from "./pages/governance/Compliance";
import NistAssessment from "./pages/governance/NistAssessment";
import ThreatInformedDefense from "./pages/governance/MaturityBenchmark";
import BreachBoard from "./pages/governance/BreachBoard";
import AnalystMini from "./pages/governance/CustomerQBR"; // Component renamed but file path stays the same

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="cyber-theme">
        <TooltipProvider>
          <AuthProvider>
            <TenantProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/soc" element={<ProtectedRoute><SOCOverview /></ProtectedRoute>} />
                <Route path="/soc-profile" element={<ProtectedRoute><SOCProfile /></ProtectedRoute>} />
                <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
                <Route path="/vulnerabilities" element={<ProtectedRoute><Vulnerabilities /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/system/connectors" element={<ProtectedRoute><Connectors /></ProtectedRoute>} />
                
                {/* LightStack Routes (formerly Governance) */}
                <Route path="/governance/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
                <Route path="/governance/compliance/nist-assessment" element={<ProtectedRoute><NistAssessment /></ProtectedRoute>} />
                <Route path="/governance/maturity-benchmark" element={<ProtectedRoute><ThreatInformedDefense /></ProtectedRoute>} />
                <Route path="/governance/breach-board" element={<ProtectedRoute><BreachBoard /></ProtectedRoute>} />
                <Route path="/governance/customer-qbr" element={<ProtectedRoute><AnalystMini /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TenantProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
