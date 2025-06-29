
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@/contexts/QueryClientProvider";
import { InvalidationProvider } from "@/contexts/InvalidationContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminIndex from "./pages/admin/Index";
import AdminBreweries from "./pages/admin/Breweries";
import AdminUsers from "./pages/admin/Users";
import AdminClaims from "./pages/admin/Claims";
import AdminBreweryImport from "./pages/admin/BreweryImport";
import VenueQrRedirect from "./components/qr/VenueQrRedirect";
import "./App.css";

function App() {
  return (
    <QueryClientProvider>
      <InvalidationProvider>
        <BrowserRouter>
          <AuthProvider>
            <RealtimeProvider>
              <TooltipProvider>
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard/*" element={<Dashboard />} />
                  <Route path="/qr/:token" element={<VenueQrRedirect />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminIndex />} />
                    <Route path="breweries" element={<AdminBreweries />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="claims" element={<AdminClaims />} />
                    <Route path="brewery-import" element={<AdminBreweryImport />} />
                  </Route>
                </Routes>
              </TooltipProvider>
            </RealtimeProvider>
          </AuthProvider>
        </BrowserRouter>
      </InvalidationProvider>
    </QueryClientProvider>
  );
}

export default App;
