import { Header } from './components/Header';
import { NavSidebar } from './components/NavSidebar';
import { Footer } from './components/Footer';
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Research } from './pages/Research';
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
import { Solutions } from './pages/Solutions';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/AdminLogin';
import { AdminSignup } from './pages/AdminSignup';
import { AdminDashboard } from './pages/AdminDashboard';
import { LeadConfirm } from './pages/LeadConfirm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useKeepAlive } from '../hooks/useKeepAlive';
import ScrollToTop from '../app/ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
  onMenuClick: () => void;
}

function Layout({ children, onMenuClick }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      <Header onMenuClick={onMenuClick} />
      <main className="w-full overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}

function LayoutNoSidebar({ children, onMenuClick }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      <Header onMenuClick={onMenuClick} />
      <main className="w-full overflow-x-clip">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  useKeepAlive();

  const toggleNav = () => setIsNavOpen(true);

  return (
    // ✅ Added overflow-x-clip wrapper to prevent horizontal bleed without creating a second vertical scroll container
    <div className="overflow-x-clip w-full">
      <ScrollToTop />
      <NavSidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Routes>
        <Route path="/" element={<Layout onMenuClick={toggleNav}><Home /></Layout>} />
        <Route path="/about" element={<Layout onMenuClick={toggleNav}><About /></Layout>} />
        <Route path="/research" element={<Layout onMenuClick={toggleNav}><Research /></Layout>} />
        <Route path="/foundations" element={<Layout onMenuClick={toggleNav}><Foundations /></Layout>} />
        <Route path="/projects" element={<LayoutNoSidebar onMenuClick={toggleNav}><Projects /></LayoutNoSidebar>} />
        <Route path="/support-media-lab" element={<Layout onMenuClick={toggleNav}><SupportMediaLab /></Layout>} />
        <Route path="/mas-graduate-program" element={<Layout onMenuClick={toggleNav}><MASGraduateProgram /></Layout>} />
        <Route path="/people" element={<Layout onMenuClick={toggleNav}><People /></Layout>} />
        <Route path="/alumni-friends" element={<Layout onMenuClick={toggleNav}><AlumniFriends /></Layout>} />
        <Route path="/add-research-project" element={<Layout onMenuClick={toggleNav}><AddResearchProject /></Layout>} />
        <Route path="/apply" element={<Layout onMenuClick={toggleNav}><Apply /></Layout>} />
        <Route path="/360-vr-tour" element={<Layout onMenuClick={toggleNav}><VRTourPage /></Layout>} />
        <Route path="/solutions" element={<LayoutNoSidebar onMenuClick={toggleNav}><Solutions /></LayoutNoSidebar>} />
        <Route path="/contact" element={<LayoutNoSidebar onMenuClick={toggleNav}><Contact /></LayoutNoSidebar>} />
        <Route path="/article/:id" element={<LayoutNoSidebar onMenuClick={toggleNav}><ArticleDetail /></LayoutNoSidebar>} />
        <Route path="/projects/:id" element={<LayoutNoSidebar onMenuClick={toggleNav}><ProjectDetail /></LayoutNoSidebar>} />
        <Route path="/lead-confirm" element={<LayoutNoSidebar onMenuClick={toggleNav}><LeadConfirm /></LayoutNoSidebar>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}