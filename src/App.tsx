import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './lib/AuthContext';
import { useEffect } from "react";
import Login from './pages/auth/Login';
import Onboarding from './pages/auth/Onboarding';
import ResetPassword from './pages/auth/ResetPassword';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from './pages/Dashboard';
import MediaKit from './pages/MediaKit';
import PublicMediaKit from './pages/PublicMediaKit';
import Profile from './pages/settings/Profile';
import Account from './pages/settings/Account';
import MediaKitGenerator from './pages/MediaKitGenerator';
import MediaKitEditor from './pages/MediaKitEditor';
import BrandDirectory from './pages/BrandDirectory';
import SearchResults from './pages/SearchResults';

const queryClient = new QueryClient();

// Improved protected route with debug logging
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log("Protected route check:", { path: location.pathname, user, loading });
  }, [location.pathname, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media-kit"
              element={
                <ProtectedRoute>
                  <MediaKit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand-directory"
              element={
                <ProtectedRoute>
                  <BrandDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search-results"
              element={
                <ProtectedRoute>
                  <SearchResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media-kit/edit"
              element={
                <ProtectedRoute>
                  <MediaKitEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-media-kit"
              element={
                <ProtectedRoute>
                  <MediaKitGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            
            {/* Settings routes */}
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            
            {/* Public media kit route - must be after other routes to avoid conflicts */}
            <Route path="/:username" element={<PublicMediaKit />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
