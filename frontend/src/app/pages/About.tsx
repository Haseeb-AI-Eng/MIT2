import { SideNav } from '../components/SideNav';

const peopleTeam = [
  {
    name: 'Haseeb Ejaz',
    title: 'Associate Professor of Elements Research Lab and Sciences',
    description:
      'Haseeb leads a multidisciplinary team focused on material systems, interactive media, and new forms of computational expression. His work bridges research, design, engineering, and performance to create emergent technologies that feel poetic, rigorous, and deeply human.',
  },
  {
    name: 'Ayesha Khalid',
    title: 'Research Fellow, Immersive Systems',
    description:
      'Ayesha develops immersive experiences and interactive installations that blend physical computing, sound, and spatial design. She supports cross-disciplinary research across multiple labs.',
  },
  {
    name: 'Samuel Ortiz',
    title: 'Creative Technologist, Human-Computer Interaction',
    description:
      'Samuel explores new interfaces for collaboration, real-time media, and storytelling. He brings design rigor to experimental research and prototyping.',
  },
  {
    name: 'Lina Chen',
    title: 'Project Lead, Computational Art',
    description:
      'Lina combines computational design, generative systems, and visual culture to create work that is both technically sophisticated and deeply expressive.',
  },
];

const alumniHighlights = [
  {
    title: 'Community Updates',
    text: 'This page shares news, opportunities, and stories from our alumni and friends community. Contributors can post announcements and stay connected to the lab’s ongoing work.',
  },
  {
    title: 'Alumni + Friends',
    text: 'The alumni network supports mentorship, partnerships, and financial contributions that help keep the lab experiments open, bold, and community-centered.',
  },
];

export function About() {
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

              <section id="people" className="space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.3em] text-black/50 mb-3">People</p>
                    <h3 className="text-[28px] font-semibold text-black">We are a diverse group of thinkers and inventors</h3>
                  </div>
                </div>
                <p className="max-w-3xl text-black/70 leading-relaxed">
                  All team members are part of different research projects and work together to shape the future of EI Arts and Sciences.
                </p>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {peopleTeam.map((member) => (
                    <div key={member.name} className="rounded-none border border-black/10 bg-[#fafafa] p-6">
                      <p className="text-[13px] uppercase tracking-[0.3em] text-red-500 mb-3">{member.title}</p>
                      <h4 className="text-[22px] font-semibold text-black mb-3">{member.name}</h4>
                      <p className="text-black/70 leading-relaxed">{member.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="alumni-friends" className="space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.3em] text-black/50 mb-3">Alumni + Friends</p>
                    <h3 className="text-[28px] font-semibold text-black">Community updates, opportunities, and support</h3>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {alumniHighlights.map((item) => (
                    <div key={item.title} className="rounded-none border border-black/10 bg-[#fafafa] p-6">
                      <p className="text-[15px] font-semibold text-black mb-3">{item.title}</p>
                      <p className="text-black/70 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

            </main>
          </div>
        </div>
      </section>
    </div>
  );
}