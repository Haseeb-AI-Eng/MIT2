import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Research } from './pages/Research';
import { ArticleDetail } from './pages/ArticleDetail';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { MASGraduateProgram } from './pages/MASGraduateProgram';
import { People } from './pages/People';
import { SupportMediaLab } from './pages/SupportMediaLab';
import { AddResearchProject } from './pages/AddResearchProject';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Sidebar />
      {children}
      <Footer />
    </div>
  );
}

function LayoutNoSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/research" element={<Layout><Research /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/support-media-lab" element={<Layout><SupportMediaLab /></Layout>} />
        <Route path="/mas-graduate-program" element={<Layout><MASGraduateProgram /></Layout>} />
        <Route path="/people" element={<Layout><People /></Layout>} />
        <Route path="/add-research-project" element={<Layout><AddResearchProject /></Layout>} />
        <Route path="/article/:id" element={<Layout><ArticleDetail /></Layout>} />
        <Route path="/projects/:id" element={<LayoutNoSidebar><ProjectDetail /></LayoutNoSidebar>} />
      </Routes>
    </>
  );
}
