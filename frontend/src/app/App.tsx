import { Header } from './components/Header';
import { NavSidebar } from './components/NavSidebar';
import { Footer } from './components/Footer';
import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Research } from './pages/Research';
import { ResearchGroupDetail } from './pages/ResearchGroupDetail';
import { ArticleDetail } from './pages/ArticleDetail';
import { Foundations } from './pages/Foundations';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { MASGraduateProgram } from './pages/MASGraduateProgram';
import { People } from './pages/People';
import { AlumniFriends } from './pages/AlumniFriends';
import { SupportMediaLab } from './pages/SupportMediaLab';
import { AddResearchProject } from './pages/AddResearchProject';
import { Apply } from './pages/Apply';
import { VRTourPage } from './pages/VRTourPage';
import { Contact } from './pages/Contact';
import { Solutions } from './pages/Solutions';
import { AdminLogin } from './pages/AdminLogin';
import { AdminSignup } from './pages/AdminSignup';
import { AdminDashboardHome } from './pages/admin/AdminDashboardHome';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminArticles } from './pages/admin/AdminArticles';
import { AdminLabs } from './pages/admin/AdminLabs';
import { AdminTags } from './pages/admin/AdminTags';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettingsPage } from './pages/admin/AdminSettings';
import { LeadConfirm } from './pages/LeadConfirm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useKeepAlive } from '../hooks/useKeepAlive';
import ScrollToTop from '../app/ScrollToTop';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import { Toaster } from './components/ui/sonner';
import { PublicSiteEnhancements } from './components/PublicSiteEnhancements';

interface LayoutProps {
  children: React.ReactNode;
  onMenuClick: () => void;
}

function Layout({ children, onMenuClick }: LayoutProps) {
  return (
    <div className="site-theme-scope min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicSiteEnhancements />
      <Header onMenuClick={onMenuClick} />
      <main className="w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}

function LayoutNoSidebar({ children, onMenuClick }: LayoutProps) {
  return (
    <div className="site-theme-scope min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicSiteEnhancements />
      <Header onMenuClick={onMenuClick} />
      <main className="w-full overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  useKeepAlive();

  const toggleNav = () => setIsNavOpen(true);

  return (
    // ✅ Added overflow-x-hidden wrapper to prevent horizontal bleed from negative margins
    <SiteSettingsProvider>
      <div className="site-theme-root overflow-x-hidden w-full">
        <ScrollToTop />
        <Toaster position="top-right" richColors />
        <NavSidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <Routes>
          <Route path="/" element={<Layout onMenuClick={toggleNav}><Home /></Layout>} />
          <Route path="/about" element={<Layout onMenuClick={toggleNav}><About /></Layout>} />
          <Route path="/research" element={<Layout onMenuClick={toggleNav}><Research /></Layout>} />
          <Route path="/research/groups/:groupSlug" element={<LayoutNoSidebar onMenuClick={toggleNav}><ResearchGroupDetail /></LayoutNoSidebar>} />
          <Route path="/foundations" element={<Layout onMenuClick={toggleNav}><Foundations /></Layout>} />
          <Route path="/projects" element={<LayoutNoSidebar onMenuClick={toggleNav}><Projects /></LayoutNoSidebar>} />
          <Route path="/support-media-lab" element={<Layout onMenuClick={toggleNav}><SupportMediaLab /></Layout>} />
          <Route path="/mas-graduate-program" element={<Layout onMenuClick={toggleNav}><MASGraduateProgram /></Layout>} />
          <Route path="/people" element={<Layout onMenuClick={toggleNav}><People /></Layout>} />
          <Route path="/alumni-friends" element={<Layout onMenuClick={toggleNav}><AlumniFriends /></Layout>} />
          <Route path="/add-research-project" element={<Layout onMenuClick={toggleNav}><AddResearchProject /></Layout>} />
          <Route path="/apply" element={<Layout onMenuClick={toggleNav}><Apply /></Layout>} />
          <Route path="/360-vr-tour" element={<Layout onMenuClick={toggleNav}><VRTourPage /></Layout>} />
          <Route path="/contact" element={<Layout onMenuClick={toggleNav}><Contact /></Layout>} />
          <Route path="/solutions" element={<Layout onMenuClick={toggleNav}><Solutions /></Layout>} />
          <Route path="/article/:id" element={<LayoutNoSidebar onMenuClick={toggleNav}><ArticleDetail /></LayoutNoSidebar>} />
          <Route path="/projects/:id" element={<LayoutNoSidebar onMenuClick={toggleNav}><ProjectDetail /></LayoutNoSidebar>} />
          <Route path="/lead-confirm" element={<LayoutNoSidebar onMenuClick={toggleNav}><LeadConfirm /></LayoutNoSidebar>} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Admin panel */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardHome /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
          <Route path="/admin/articles" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
          <Route path="/admin/labs" element={<ProtectedRoute><AdminLabs /></ProtectedRoute>} />
          <Route path="/admin/tags" element={<ProtectedRoute><AdminTags /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </SiteSettingsProvider>
  );
}
