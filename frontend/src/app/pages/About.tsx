import { SideNav } from '../components/SideNav';

const aboutSections = [
  {
    id: 'about-building',
    title: 'About the Building',
    description:
      'The labs leadership built a culture of experimentation and generosity. This team supports ambitious research by enabling interdisciplinary collaboration, rapid prototyping, and public engagement.',
    image: '/image.gif',
    cards: [
      {
        title: 'Research stewardship',
        text: 'Our leaders help shape projects that balance impact, ethics, and community value.',
      },
      {
        title: 'Creative partnerships',
        text: 'Faculty, students, and industry partners bring diverse expertise to every lab initiative.',
      },
    ],
  },
  {
    id: 'faqs',
    title: 'Lab FAQs',
    description:
      'From access and participation to research timelines, this section answers the most common questions about how the lab operates and how people can get involved.',
    image: '/image.gif',
    cards: [
      {
        title: 'How to participate',
        text: 'New collaborators join through research groups, events, fellowships, and open calls.',
      },
      {
        title: 'What we fund',
        text: 'The lab supports exploratory work across design, engineering, culture, and social systems.',
      },
    ],
  },
  {
    id: 'history',
    title: 'History',
    description:
      'The lab has evolved over decades from a creative research studio into a global network of designers, scientists, and educators. Its history is rooted in curiosity, risk-taking, and social impact.',
    image: '/image.gif',
    cards: [
      {
        title: 'Milestones',
        text: 'Historic projects have shaped everything from interactive media to new approaches to health and climate.',
      },
      {
        title: 'Generations of makers',
        text: 'Students, alumni, and faculty continually revisit the labs ethos while inventing new directions.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    description:
      'The lab encourages questions from students, collaborators, donors, and journalists. Reach out to the core team to connect with the right people for your interest.',
    image: '/image.gif',
    cards: [
      {
        title: 'Visitor inquiries',
        text: 'Plan a visit, request a tour, or ask about current exhibitions and events.',
      },
      {
        title: 'General questions',
        text: 'Email the labs central coordinator for directions, partnerships, and community outreach.',
      },
    ],
  },
  {
    id: 'press',
    title: 'For Press + Media',
    description:
      'Press and media inquiries are welcomed. The lab offers commentary, research summaries, and media access to highlight projects that are changing the landscape of technology and society.',
    image: '/image.gif',
    cards: [
      {
        title: 'Media requests',
        text: 'A dedicated team supports interviews, images, and feature requests for journalists.',
      },
      {
        title: 'Research stories',
        text: 'We help translate technical work into compelling stories for public audiences.',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    description:
      'The labs community is broad: researchers, students, staff, and external partners all contribute to a culture of generosity and shared discovery.',
    image: '/image.gif',
    cards: [
      {
        title: 'Peer networks',
        text: 'Collaborators learn from one another across labs, projects, and disciplines.',
      },
      {
        title: 'Public programs',
        text: 'Events, talks, and open studios keep the work accessible to a wide audience.',
      },
    ],
  },
  {
    id: 'jobs',
    title: 'Job Opportunities',
    description:
      'The lab offers opportunities for researchers, designers, engineers, and administrators who want to work at the intersection of technology and society.',
    image: '/image.gif',
    cards: [
      {
        title: 'Open positions',
        text: 'Roles are updated frequently to reflect current research needs and program priorities.',
      },
      {
        title: 'Fellowships',
        text: 'Fellowship programs invite external talent to participate in lab research for a season.',
      },
    ],
  },
  {
    id: 'visiting',
    title: 'Visiting the Lab',
    description:
      'Visitors are invited to explore installations, see live work, and connect with researchers. Guided tours and open events help make the space feel welcoming and generative.',
    image: '/image.gif',
    cards: [
      {
        title: 'Plan your visit',
        text: 'Learn when the lab is open and how to schedule a tour or observe a demo.',
      },
      {
        title: 'Event calendar',
        text: 'Public talks and exhibitions are shared on the labs event schedule.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support the Media Lab',
    description:
      'Support fuels the labs ability to pursue bold research, welcome diverse voices, and develop work that matters. Contributions make an immediate difference to people and projects.',
    image: '/image.gif',
    cards: [
      {
        title: 'Corporate partnership',
        text: 'Industry partners help scale research and connect ideas to real-world impact.',
      },
      {
        title: 'Alumni + friends',
        text: 'Community support sustains ambitious, long-term experimentation and learning.',
      },
    ],
  },
];

export function About() {
  const sortedAboutSections = [...aboutSections].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen bg-white">
      <section data-hero-section className="relative overflow-hidden bg-black text-white aspect-auto md:aspect-[16/5] min-h-[400px] md:min-h-0 flex items-center">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img
            src="/image.gif"
            alt="About background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content Layer */}
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 md:py-0 w-full flex flex-col items-center justify-center text-center">
          <p className="text-[10px] md:text-[12px] uppercase tracking-[0.25em] md:tracking-[0.35em] text-white/60 mb-4">
            About the Lab
          </p>

          <h1 className="text-[28px] sm:text-[36px] md:text-[56px] font-semibold理论 leading-tight md:leading-[1.05] max-w-4xl mx-auto">
            Imagine what we can become.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[14px] md:text-[16px] text-white/70理论 leading-relaxed">
            The lab brings research, design, and community together to create work that matters. Every project is built on curiosity, equity, and the possibility of a more just future.
          </p>
        </div>
      </section>

      <section className="relative w-full overflow-visible">
        <div className="flex w-full items-start gap-0">
          <SideNav />
          <div className="flex-1 min-w-0 px-4 md:px-8 lg:px-12 py-12 max-w-[1400px] mx-auto">
            <main className="space-y-16">
              <section className="grid gap-8 lg:grid-cols-[1.8fr_1.2fr]">
            <div className="space-y-6">
              <div className="rounded-none border border-black/10 bg-white p-8 shadow-sm">
                <p className="text-[12px] uppercase tracking-[0.3em] text-black/50 mb-4">Featured Story</p>
                <h2 className="text-[32px] font-semibold text-black">A short motivation for research and impact</h2>
                <p className="text-black/70 leading-relaxed">
                  Research is the engine behind our most meaningful work. It motivates people to ask bigger questions, stay curious, and build solutions that matter for real communities.
                </p>
              </div>
              <div className="overflow-hidden rounded-none border border-black/10 bg-black">
                <video controls poster="/image.gif" className="block w-full aspect-[16/9] object-cover">
                  <source
                    src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <div className="p-6 bg-white">
                  <p className="text-[12px] uppercase tracking-[0.3em] text-black/50 mb-3">Research inspiration</p>
                  <h3 className="text-[22px] font-semibold text-black">See how curiosity becomes concrete invention.</h3>
                  <p className="mt-3 text-black/70 leading-relaxed">
                    This short film highlights the energy of lab research and how each experiment is part of a larger effort to improve lives.
                  </p>
                </div>
              </div>
            </div>

              <div className="space-y-6">
              <div className="rounded-none border border-black/10 bg-white p-8 shadow-sm">
                <p className="text-[12px] uppercase tracking-[0.3em] text-black/50 mb-4">Why research matters</p>
                <p className="text-black/70 leading-relaxed">
                  Our research is motivated by curiosity and responsibility. It explores systems, technologies, and social practices with the goal of creating useful, thoughtful change.
                </p>
              </div>
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-none border border-black/10 bg-white p-6 shadow-sm">
                  <p className="text-[13px] font-semibold text-black">Human-centered design</p>
                  <p className="mt-3 text-black/70 leading-relaxed">
                    Research is grounded in the people it serves, not only in the technologies it produces.
                  </p>
                </div>
                <div className="rounded-none border border-black/10 bg-white p-6 shadow-sm">
                  <p className="text-[13px] font-semibold text-black">Long-term experimentation</p>
                  <p className="mt-3 text-black/70 leading-relaxed">
                    The lab supports work that evolves over months and years, so ideas can mature thoughtfully.
                  </p>
                </div>
              </div>
            </div>
          </section>

              {sortedAboutSections.map((section) => (
                <section key={section.id} id={section.id} className="space-y-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.3em] text-black/50 mb-3">{section.title}</p>
                  <h3 className="text-[28px] font-semibold text-black">{section.title}</h3>
                </div>
                <div className="text-right lg:text-left text-black/60 text-sm">
                  <span>{section.cards[0].title}</span>
                </div>
              </div>

              <div>
                <p className="text-black/70 leading-relaxed">{section.description}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.cards.map((card) => (
                    <div key={card.title} className="rounded-none border border-black/10 bg-[#fafafa] p-5">
                      <p className="text-[15px] font-semibold text-black">{card.title}</p>
                      <p className="mt-3 text-black/70 leading-relaxed">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>
                </section>
              ))}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}