import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { fetchProjectByIdOrSlug } from '../api';

function formatDate(dateValue: string | Date | undefined) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string) {
  return name
    ?.split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2) || 'U';
}

function generateDetailedExplanation(project: any) {
  const title = project.title || 'this research project';
  return [
    `This project, ${title}, represents a significant step forward in our ongoing efforts to explore the intersection of technology and human experience.`,
    `Our team has spent months prototyping and refining the core systems, focusing on how ${project.tags?.[0] || 'innovative design'} can solve real-world problems.`,
    `The research methodology involved deep collaboration between engineers, designers, and community stakeholders to ensure that the final outcome is both technically robust and socially relevant.`,
    `Key innovations in this work include a novel approach to system architecture and a highly intuitive user interface that adapts to individual needs.`,
    `Initial results from our pilot studies indicate a high level of engagement and positive feedback from early adopters, suggesting a strong potential for broader impact.`,
    `Looking ahead, we plan to scale the ${project.group || 'initiative'} and integrate more advanced AI capabilities to further enhance the system's performance and accessibility.`,
    `By sharing our findings and tools with the wider community, we hope to inspire new forms of creative inquiry and contribute to a more just and resilient future.`,
    `Every detail of the project has been carefully considered to align with the Lab's core values of curiosity, equity, and interdisciplinary collaboration.`
  ];
}

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProjectByIdOrSlug(id)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setProject(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black/50 text-[16px]" style={{ fontFamily: 'Georgia, serif' }}>Loading project...</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="px-4 md:px-8 py-14 max-w-[900px] mx-auto">
        <p className="text-[18px] text-black/70 mb-6" style={{ fontFamily: 'Georgia, serif' }}>Project not found.</p>
        <button onClick={() => navigate('/projects')} className="rounded-lg px-5 py-3 bg-black text-white hover:bg-slate-900 transition">Back to projects</button>
      </div>
    );
  }

  // Normalize team — handle both populated objects and flat strings
  const teamMembers: Array<{ name: string; role: string; email?: string }> = (project.team || [])
    .map((member: any) => {
      // Case 1: { user: { name, email }, role }
      if (member?.user?.name) {
        return { name: member.user.name, role: member.role || 'Researcher', email: member.user.email };
      }
      // Case 2: { name, role } directly on member
      if (member?.name) {
        return { name: member.name, role: member.role || 'Researcher', email: member.email };
      }
      // Case 3: member is a string (just a name)
      if (typeof member === 'string') {
        return { name: member, role: 'Researcher' };
      }
      return null;
    })
    .filter(Boolean);

  const tags: string[] = project.tags || [];
  const detailedExplanation = generateDetailedExplanation(project);
  const videoSrc = project.videoUrl || '/16521670-hd_1920_1080_25fps.mp4';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Georgia, serif' }}>

      {/* ── Hero banner ── */}
      <section className="relative bg-[#2d4a3e] text-white flex items-center justify-center text-center" style={{ minHeight: '260px', maxHeight: '360px', height: '28vw', paddingTop: '5rem' }}>
        <div className="absolute inset-0">
          <img
            src={project.coverImage || project.cover_image || '/image.gif'}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
          {/* dark-teal overlay matching screenshot */}
          <div className="absolute inset-0 bg-[#1e3530]/60" />
        </div>

        {/* top-right label */}
        <div className="absolute top-4 right-5 z-10">
          <span className="text-white/80 text-[13px] tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            {project.groupName || project.group || 'Research Project'}
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-[28px] md:text-[44px] font-bold leading-snug px-6 max-w-4xl"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {project.title}
        </motion.h1>
      </section>

      {/* ── Body: sidebar + main ── */}
      <div className="flex min-h-[calc(100vh-280px)]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="hidden md:flex flex-col flex-shrink-0 border-r border-black/10"
          style={{ width: '260px', minWidth: '220px', padding: '2rem 1.5rem' }}
        >
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-[13px] text-black/60 hover:text-black mb-6 transition-colors"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            ‹ Member Portal
          </button>

          <div className="border-t border-black/10 pt-5 mb-5">
            {/* Author / Published */}
            {teamMembers.length > 0 && (
              <div className="mb-1">
                <p className="text-[13px] text-black/80" style={{ fontFamily: 'Georgia, serif' }}>
                  by {teamMembers.map(m => m.name).join(', ')}
                </p>
              </div>
            )}
            <p className="text-[13px] text-black/50" style={{ fontFamily: 'Georgia, serif' }}>
              {formatDate(project.createdAt || project.publishedAt)}
            </p>
          </div>

          <div className="border-t border-black/10 pt-5 mb-5">
            {/* Groups / tags used as group labels */}
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Groups
            </p>
            <div className="space-y-1">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <p key={tag} className="text-[13px] text-black/60 hover:text-black cursor-pointer transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                    {tag}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-[13px] text-black/60" style={{ fontFamily: 'Georgia, serif' }}>
                    {project.group || "Director's Office"}
                  </p>
                  <p className="text-[13px] text-black/60" style={{ fontFamily: 'Georgia, serif' }}>
                    External Relations
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-black/10 pt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Share this post
            </p>
            <div className="flex gap-3">
              {/* X / Twitter */}
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on X">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Bluesky */}
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on Bluesky">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Team members section in sidebar */}
          {teamMembers.length > 0 && (
            <div className="border-t border-black/10 pt-5 mt-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                Team
              </p>
              <div className="space-y-3">
                {teamMembers.map((member, i) => (
                  <div key={i}>
                    <p className="text-[13px] font-semibold text-black/80" style={{ fontFamily: 'Georgia, serif' }}>{member.name}</p>
                    <p className="text-[12px] text-black/50" style={{ fontFamily: 'Georgia, serif' }}>{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[860px]">

          {/* Mobile back link */}
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex md:hidden items-center gap-1 text-[13px] text-black/60 hover:text-black mb-6 transition-colors"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            ← Back to projects
          </button>

          {/* Description / article body */}
          <div className="mb-10">
            {/* Bold intro line like MIT Media Lab style */}
            <p
              className="text-[17px] md:text-[19px] font-bold leading-snug mb-5"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {project.subtitle || project.shortDescription || project.title}
            </p>

            <p
              className="text-[15px] md:text-[16px] text-black/80 leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {project.description}
            </p>
          </div>

          {/* Video Section */}
          <div className="mb-10 rounded-2xl overflow-hidden border border-black/10 bg-black aspect-video">
            <video controls className="w-full h-full object-cover">
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="space-y-6 text-[15px] md:text-[16px] text-black/80 leading-relaxed mb-10">
            {detailedExplanation.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Status badge + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <span
              className="border border-black/20 px-3 py-1 text-[12px] uppercase tracking-[0.18em] text-black/60"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {project.status || 'published'}
            </span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="border border-black/10 px-3 py-1 text-[12px] text-black/50"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Project details row */}
          <div className="border-t border-black/10 pt-6 mb-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Status</p>
              <p className="text-[14px] text-black/80" style={{ fontFamily: 'Georgia, serif' }}>{project.status || 'Draft'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Published</p>
              <p className="text-[14px] text-black/80" style={{ fontFamily: 'Georgia, serif' }}>{formatDate(project.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Team size</p>
              <p className="text-[14px] text-black/80" style={{ fontFamily: 'Georgia, serif' }}>{teamMembers.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Lead role</p>
              <p className="text-[14px] text-black/80" style={{ fontFamily: 'Georgia, serif' }}>{teamMembers[0]?.role || 'Lead Researcher'}</p>
            </div>
          </div>

          {/* Team cards — only shown if members exist */}
          {teamMembers.length > 0 && (
            <div className="border-t border-black/10 pt-6">
              <h3
                className="text-[13px] uppercase tracking-[0.18em] text-black/40 mb-5"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Project team
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-4 border border-black/8 bg-slate-50 rounded-xl p-4">
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full bg-black/10 text-black/70 text-sm font-semibold"
                      style={{ width: 48, height: 48, fontFamily: 'Georgia, serif' }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-black" style={{ fontFamily: 'Georgia, serif' }}>{member.name}</p>
                      <p className="text-[13px] text-black/55" style={{ fontFamily: 'Georgia, serif' }}>{member.role}</p>
                      {member.email && (
                        <p className="text-[12px] text-black/40" style={{ fontFamily: 'Georgia, serif' }}>{member.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why this matters */}
          <div className="border-t border-black/10 pt-6 mt-10">
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Why this matters
            </p>
            <p className="text-[15px] text-black/65 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              Projects on this platform go through a draft → review → published workflow, so every public project has been prepared for the community.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}