export function MASGraduateProgram() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
        <img src="/image.gif" alt="MAS background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <h1 className="text-[36px] md:text-[56px] font-bold leading-tight md:leading-[1.05] max-w-4xl mx-auto">
            Media Arts & Sciences
          </h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12 max-w-[1400px] mx-auto lg:ml-80">
        <main className="space-y-16">
          <section className="space-y-8">
            <div>
              <h2 className="text-[28px] font-semibold text-black mb-6">About Media Arts & Sciences</h2>
              <div className="prose prose-lg max-w-none text-black/70 leading-relaxed" style={{ textAlign: 'justify' }}>
                <p>
                  The Program in Media Arts and Sciences (MAS) is a unique interdisciplinary program at MIT that brings together artists, designers, scientists, and engineers to explore the intersection of technology, art, and human experience. Founded in 1985, MAS has been at the forefront of innovative research and creative practice that challenges conventional boundaries between disciplines.
                </p>
                <p>
                  Our graduate program offers both master's and doctoral degrees, providing students with the tools and environment to pursue groundbreaking work in areas such as interactive media, computational design, creative technologies, and socially engaged art and technology. The program emphasizes hands-on experimentation, collaborative research, and the development of new methodologies for creative practice.
                </p>
                <p>
                  MAS students work alongside world-renowned faculty and researchers in state-of-the-art facilities, including the Media Lab, where they have access to cutting-edge technologies and resources. The program fosters a culture of innovation, risk-taking, and social responsibility, preparing graduates to become leaders in the evolving field of media arts and sciences.
                </p>
                <p>
                  Through coursework, independent research, and collaborative projects, students develop expertise in areas such as:
                </p>
                <ul>
                  <li>Interactive and immersive media design</li>
                  <li>Computational art and generative systems</li>
                  <li>Human-computer interaction and experience design</li>
                  <li>Creative coding and software art</li>
                  <li>Socially engaged technology and civic media</li>
                  <li>Sound design and experimental music</li>
                  <li>Digital fabrication and physical computing</li>
                </ul>
                <p>
                  The MAS program is committed to diversity, equity, and inclusion, welcoming students from diverse backgrounds and experiences. We believe that the best innovations emerge from diverse perspectives and collaborative approaches to problem-solving.
                </p>
                <p>
                  Join us in exploring the creative possibilities of technology and shaping the future of media arts and sciences.{' '}
                  <a
                    href="/apply"
                    className="text-red-500 hover:text-red-600 font-semibold underline"
                  >
                    Apply now
                  </a>{' '}
                  to become part of this vibrant community of makers, thinkers, and innovators.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}