import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AdminProvider } from "@/admin/context/Context";
import { LanguageProvider } from "@/i18n";
import Index from "./pages/Index";
import ArticleDetails from "./pages/ArticleDetails";
import Contact from "./pages/Contact";
import Articles from "./pages/Articles";
import News from "./pages/News";
import Announcements from "./pages/Announcements";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

// Admin Pages
import AdminLogin from "@/admin/pages/Login";
import AdminDashboard from "@/admin/pages/Dashboard";
import AdminArticles from "@/admin/pages/Articles";
import AdminAnnouncements from "@/admin/pages/Announcements";
import AdminNews from "@/admin/pages/News";
import AdminUsers from "@/admin/pages/Users";
import AdminSettings from "@/admin/pages/Settings";
import AdminAbsentTeachers from "@/admin/pages/AbsentTeachers";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

import { AuthProvider } from "@/context/AuthContext";

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AuthProvider>
            <AdminProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/article/:id" element={<ArticleDetails />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/announcements" element={<Announcements />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />


                  <Route element={<ProtectedRoute allowedRoles={['super_admin', 'editor', 'administrator']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/articles" element={<AdminArticles />} />
                    <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                    <Route path="/admin/news" element={<AdminNews />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/absent-teachers" element={<AdminAbsentTeachers />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                  </Route>

                  {/* 403 Route */}
                  <Route path="/403" element={<Forbidden />} />

                  {/* 404 Route */}

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AdminProvider>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
