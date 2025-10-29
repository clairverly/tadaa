import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MainLayout } from "./components/layout/main-layout";
import { AIChatExtractionWidget } from "./components/ai-chat/ai-chat-extraction-widget";
import { initializeUserProfile } from "./lib/storage";
import Dashboard from "./pages/dashboard";
import Bills from "./pages/bills";
import Errands from "./pages/errands";
import Appointments from "./pages/appointments";
import UrgentHelp from "./pages/urgent-help";
import Settings from "./pages/settings";
import Subscriptions from "./pages/subscriptions";
import Login from "./pages/login";
import Signup from "./pages/signup";
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
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  return (
    <>
      <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/bills" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Bills />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/errands" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Errands />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Appointments />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/urgent-help" element={
                <ProtectedRoute>
                  <MainLayout>
                    <UrgentHelp />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Subscriptions />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect old routes to Settings */}
              <Route path="/notifications" element={<Navigate to="/settings?tab=notifications" replace />} />
              <Route path="/payments" element={<Navigate to="/settings?tab=payments" replace />} />
              <Route path="/profile" element={<Navigate to="/settings?tab=profile" replace />} />
              
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* AI Chat Widget - Available without authentication */}
      <AIChatExtractionWidget />
    </>
  );
};

export default App;