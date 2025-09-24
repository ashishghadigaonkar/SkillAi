import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LearnerDashboard from "./pages/dashboard/LearnerDashboard";
import TrainerDashboard from "./pages/dashboard/TrainerDashboard";
import PolicyDashboard from "./pages/dashboard/PolicyDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Protected Role-Based Routes */}
            <Route 
              path="/dashboard/learner" 
              element={
                <ProtectedRoute requiredRole="learner">
                  <LearnerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/trainer" 
              element={
                <ProtectedRoute requiredRole="trainer">
                  <TrainerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/policy" 
              element={
                <ProtectedRoute requiredRole="policymaker">
                  <PolicyDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;