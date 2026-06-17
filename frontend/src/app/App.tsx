import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NavSidebar } from './components/NavSidebar';
import { Footer } from './components/Footer';
import { Routes, Route } from 'react-router-dom'; // Removed useLocation from here as it's handled in ScrollToTop
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
import { AdminLogin } from './pages/AdminLogin';
import { AdminSignup } from './pages/AdminSignup';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useKeepAlive } from '../hooks/useKeepAlive';
import ScrollToTop from '../app/ScrollToTop'; // Using the external component

// --- Layout Components ---

interface LayoutProps {
  children: React.ReactNode;
  onMenuClick: () => void;
}

function Layout({ children, onMenuClick }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={onMenuClick} />
      <Sidebar />
      <main className="pt-[80px] md:pt-0">{children}</main>
      <Footer />
    </div>
  );
}

function LayoutNoSidebar({ children, onMenuClick }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={onMenuClick} />
      <main className="pt-[0px]">{children}</main>
      <Footer />
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // 🔥 Keep Railway backend warm
  useKeepAlive();

  const toggleNav = () => setIsNavOpen(true);

  return (
    <>
      {/* 1. ScrollToTop is placed here to monitor route changes globally */}
      <ScrollToTop />

      {/* 2. Global Navigation Sidebar */}
      <NavSidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* 3. Routing Logic */}
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

        {/* Dynamic Detail Routes without Sidebar */}
        <Route path="/article/:id" element={<LayoutNoSidebar onMenuClick={toggleNav}><ArticleDetail /></LayoutNoSidebar>} />
        <Route path="/projects/:id" element={<LayoutNoSidebar onMenuClick={toggleNav}><ProjectDetail /></LayoutNoSidebar>} />

        {/* Admin Routes (No Layout or Custom Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}