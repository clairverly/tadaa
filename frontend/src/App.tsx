import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "./components/layout/main-layout";
import { initializeUserProfile } from "./lib/storage";
import Dashboard from "./pages/dashboard";
import Bills from "./pages/bills";
import Errands from "./pages/errands";
import Appointments from "./pages/appointments";
import UrgentHelp from "./pages/urgent-help";
import Settings from "./pages/settings";
import Subscriptions from "./pages/subscriptions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeUserProfile();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/errands" element={<Errands />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/urgent-help" element={<UrgentHelp />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Redirect old routes to Settings */}
              <Route path="/notifications" element={<Navigate to="/settings?tab=notifications" replace />} />
              <Route path="/payments" element={<Navigate to="/settings?tab=payments" replace />} />
              <Route path="/profile" element={<Navigate to="/settings?tab=profile" replace />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;