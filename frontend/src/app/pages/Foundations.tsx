import { motion } from 'motion/react';
import { SideNav } from '../components/SideNav';

export function Foundations() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section data-hero-section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
        <img
          src="/pexels-davidelocatelli-2383649.jpg"
          alt="Foundations background"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Platform Values
          </p>
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Foundations
          </motion.h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative w-full overflow-visible">
        <div className="flex w-full items-start gap-0">
          <SideNav />
          <div className="flex-1 min-w-0 px-4 md:px-8 py-12 max-w-[1400px] mx-auto">
            <div className="mb-10">
          <p className="text-[12px] uppercase tracking-[0.24em] text-black/40 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Our Principles
          </p>
          <h2
            className="text-[32px] md:text-[42px] font-semibold text-black"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The building blocks of our research community.
          </h2>
        </div>

            <div className="max-w-[940px] space-y-10 text-black/80 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              <div className="space-y-8">
                <p className="text-[15px] md:text-[16px] leading-8">
              The foundations of our platform are built upon the belief that curiosity-driven research and open collaboration are essential for solving the world's most complex challenges.
            </p>
            <p className="text-[15px] md:text-[16px] leading-8">
              Our approach is "anti-disciplinary." We bring together designers, engineers, artists, and scientists to work side-by-side in a culture of radical experimentation. We believe that innovation happens at the intersections, where different ways of seeing and making collide to form something entirely new.
            </p>
            <p className="text-[15px] md:text-[16px] leading-8">
              We are committed to the democratization of technology. Our platform serves as a bridge between high-level research and real-world application, ensuring that the tools and insights generated within our community are accessible to those who can use them to create positive social change.
            </p>
            <p className="text-[15px] md:text-[16px] leading-8">
              Sustainability and ethics are not afterthoughts; they are the starting point for every project we support. We challenge ourselves to design systems that are not only technologically advanced but also resilient, equitable, and deeply respectful of the human experience and the environment.
            </p>
            <p className="text-[15px] md:text-[16px] leading-8">
              By fostering a community built on generosity and shared discovery, we empower the next generation of inventors to move beyond traditional boundaries. Together, we are creating a future that is more imaginative, inclusive, and impactful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}