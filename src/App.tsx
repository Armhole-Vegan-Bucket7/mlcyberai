
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SOCOverview from "./pages/SOCOverview";
import SOCProfile from "./pages/SOCProfile"; // Add import for new page
import Incidents from "./pages/Incidents";
import Vulnerabilities from "./pages/Vulnerabilities";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Import new governance pages
import Compliance from "./pages/governance/Compliance";
import MaturityBenchmark from "./pages/governance/MaturityBenchmark";
import BreachBoard from "./pages/governance/BreachBoard";
import CustomerQBR from "./pages/governance/CustomerQBR";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TenantProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/soc" element={<ProtectedRoute><SOCOverview /></ProtectedRoute>} />
              <Route path="/soc-profile" element={<ProtectedRoute><SOCProfile /></ProtectedRoute>} />
              <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
              <Route path="/vulnerabilities" element={<ProtectedRoute><Vulnerabilities /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Governance Routes */}
              <Route path="/governance/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
              <Route path="/governance/maturity-benchmark" element={<ProtectedRoute><MaturityBenchmark /></ProtectedRoute>} />
              <Route path="/governance/breach-board" element={<ProtectedRoute><BreachBoard /></ProtectedRoute>} />
              <Route path="/governance/customer-qbr" element={<ProtectedRoute><CustomerQBR /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
