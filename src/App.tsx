
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminRoutes from "./pages/admin/Index";
import ProtectedRoute from "./components/protected/ProtectedRoute";
import AdminRoute from "./components/protected/AdminRoute";
import VenueQrRedirect from "./components/qr/VenueQrRedirect";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <SidebarProvider defaultOpen={false}>
                      <Index />
                    </SidebarProvider>
                  } 
                />
                <Route path="/auth" element={<Auth />} />
                <Route path="/qr/:token" element={<VenueQrRedirect />} />
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminRoutes />
                    </AdminRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
