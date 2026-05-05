import { Link } from 'react-router-dom';

export function SupportMediaLab() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
        <img
          src="/image.gif"
          alt="Support the Media Lab background"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-[1100px] px-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-red-400 mb-4">About the Lab</p>
          <h1 className="text-[36px] md:text-[56px] font-semibold leading-tight md:leading-[1.05] max-w-4xl mx-auto">
            Support the Media Lab
          </h1>
        </div>
      </section>

      <main className="lg:ml-80 px-4 md:px-8 lg:px-12 py-16 max-w-[1400px] mx-auto">
        <div className="max-w-[940px] mx-auto space-y-10 text-slate-800">
          <div className="space-y-8">
            <p className="text-[15px] text-slate-600 leading-8">
              The Media Lab is where curiosity becomes practice and research becomes experience. Every day we prototype new technologies, craft immersive systems, and design expressive tools that help people live, learn, and connect in more meaningful ways.
            </p>
            <p className="text-[15px] text-slate-600 leading-8">
              Our work is built on the belief that discovery happens when artists, designers, engineers, scientists, and scholars come together. Support allows us to sustain this interdisciplinary culture so that fresh ideas can move from the studio to the world.
            </p>
            <p className="text-[15px] text-slate-600 leading-8">
              With your help, we expand access to research labs, fund bold experiments, and create openings for students from all backgrounds to lead projects that improve health, education, equity, and civic life. Your support powers the labs, the tools, and the people behind the next generation of invention.
            </p>
            <p className="text-[15px] text-slate-600 leading-8">
              We are committed to building research that is generous, inclusive, and focused on public benefit. Support enables us to scale promising ideas into tangible systems, reveal new ways of working, and ensure that research is shared with communities, collaborators, and partners beyond the academy.
            </p>
            <p className="text-[15px] text-slate-600 leading-8">
              Whether through financial gifts, partnerships, or mentorship, every contribution brings us closer to a future that is more just, more resilient, and more imaginative. Thank you for helping us turn ambitious ideas into real-world impact.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-200/80 bg-slate-50 p-10 shadow-lg shadow-slate-200/40">
            <h2 className="text-[28px] md:text-[34px] font-semibold text-slate-950 mb-5">How to support</h2>
            <div className="space-y-4 text-[15px] leading-8 text-slate-700">
              <p>
                Whether you are an alum, a foundation, or a corporate partner, there are many ways to engage with the Media Lab. Your support helps us expand access to research, grow our student programs, and transform ideas into projects that matter.
              </p>
              <p>
                We are grateful for every gift and collaboration, and we invite you to join us on this journey. Together, we can accelerate progress toward a future that is creative, equitable, and resilient.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Learn more
              </Link>
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-full border border-black px-8 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Make a gift
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
