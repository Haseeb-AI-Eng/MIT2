import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NavSidebar } from './components/NavSidebar';
import { Footer } from './components/Footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children, onMenuClick }: { children: React.ReactNode; onMenuClick: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={onMenuClick} />
      <Sidebar />
      {children}
      <Footer />
    </div>
  );
}

function LayoutNoSidebar({ children, onMenuClick }: { children: React.ReactNode; onMenuClick: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={onMenuClick} />
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <NavSidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Routes>
        <Route path="/" element={<Layout onMenuClick={() => setIsNavOpen(true)}><Home /></Layout>} />
        <Route path="/about" element={<Layout onMenuClick={() => setIsNavOpen(true)}><About /></Layout>} />
        <Route path="/research" element={<Layout onMenuClick={() => setIsNavOpen(true)}><Research /></Layout>} />
        <Route path="/foundations" element={<Layout onMenuClick={() => setIsNavOpen(true)}><Foundations /></Layout>} />
        <Route path="/projects" element={<Layout onMenuClick={() => setIsNavOpen(true)}><Projects /></Layout>} />
        <Route path="/support-media-lab" element={<Layout onMenuClick={() => setIsNavOpen(true)}><SupportMediaLab /></Layout>} />
        <Route path="/mas-graduate-program" element={<Layout onMenuClick={() => setIsNavOpen(true)}><MASGraduateProgram /></Layout>} />
        <Route path="/people" element={<Layout onMenuClick={() => setIsNavOpen(true)}><People /></Layout>} />
        <Route path="/alumni-friends" element={<Layout onMenuClick={() => setIsNavOpen(true)}><AlumniFriends /></Layout>} />
        <Route path="/add-research-project" element={<Layout onMenuClick={() => setIsNavOpen(true)}><AddResearchProject /></Layout>} />
        <Route path="/apply" element={<Layout onMenuClick={() => setIsNavOpen(true)}><Apply /></Layout>} />
        <Route path="/article/:id" element={<LayoutNoSidebar onMenuClick={() => setIsNavOpen(true)}><ArticleDetail /></LayoutNoSidebar>} />
        <Route path="/projects/:id" element={<LayoutNoSidebar onMenuClick={() => setIsNavOpen(true)}><ProjectDetail /></LayoutNoSidebar>} />
        
        {/* Admin Routes */}
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
