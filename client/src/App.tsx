import { Switch, Route } from "wouter";
// import { queryClient } from "./lib/queryClient"; // <-- Commented out, see mock below

// --- MOCK QUERY CLIENT BEGIN (remove when ./lib/queryClient is available) ---
import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();
// --- MOCK QUERY CLIENT END ---

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

// --- MOCK PROTECTED ROUTE BEGIN (remove when ./lib/protected-route is available) ---
import React from "react";
type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};
const ProtectedRoute = ({ path, component: Component }: ProtectedRouteProps) => (
  <Route path={path} component={Component} />
);
// --- MOCK PROTECTED ROUTE END ---

// Public pages
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ServicesPage from "@/pages/services";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import CargoTrackingPage from "@/pages/cargo-tracking";
import BranchesPage from "@/pages/branches";
import ContactPage from "@/pages/contact";
import AuthPage from "@/pages/auth-page";
import FaqPage from "@/pages/faq";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import CargoManagement from "@/pages/admin/cargo-management";
import BlogManagement from "@/pages/admin/blog-management";
import TestimonialsManagement from "@/pages/admin/testimonials-management";
import BranchesManagement from "@/pages/admin/branches-management";
import SeoSettings from "@/pages/admin/seo-settings";
import ContactSubmissions from "@/pages/admin/contact-submissions";
import FaqManagementPage from "@/pages/admin/faq-management";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/cargo-tracking" component={CargoTrackingPage} />
      <Route path="/branches" component={BranchesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/afoxinfcfs" component={AuthPage} />
      <Route path="/faq" component={FaqPage} />
      
      {/* Protected admin routes */}
      <ProtectedRoute path="/fcfstube" component={AdminDashboard} />
      <ProtectedRoute path="/fcfstube/cargo" component={CargoManagement} />
      <ProtectedRoute path="/fcfstube/blog" component={BlogManagement} />
      <ProtectedRoute path="/fcfstube/testimonials" component={TestimonialsManagement} />
      <ProtectedRoute path="/fcfstube/branches" component={BranchesManagement} />
      <ProtectedRoute path="/fcfstube/seo" component={SeoSettings} />
      <ProtectedRoute path="/fcfstube/contact-submissions" component={ContactSubmissions} />
      <ProtectedRoute path="/fcfstube/faq" component={FaqManagementPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
