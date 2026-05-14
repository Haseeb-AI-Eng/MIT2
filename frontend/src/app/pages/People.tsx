import { useEffect, useState } from 'react';
import haseebImage from '../assets/pic.jpeg';

type TeamMember = {
  name: string;
  title: string;
  description: string;
};

type BackendTeamMember = {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  projectCount: number;
};

const coreTeamMembers: TeamMember[] = [
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

const roleHighlights = [
  { match: /lead/i, copy: 'Leads interdisciplinary research initiatives and keeps projects anchored to impact-driven goals.' },
  { match: /researcher/i, copy: 'Explores new ideas with experimental rigor and turns complex science into useful insight.' },
  { match: /design/i, copy: 'Shapes thoughtful experiences, interactions, and visual systems that make research accessible and inspiring.' },
  { match: /engineer|developer/i, copy: 'Builds the technical foundations and prototypes that make ambitious research work in the real world.' },
  { match: /student/i, copy: 'Brings fresh curiosity, hands-on energy, and a collaborative spirit to every project.' },
  { match: /fellow/i, copy: 'Connects creative practice to research, helping teams translate ideas into expressive, meaningful work.' },
];

function buildMemberTitle(roles: string[]) {
  if (!roles || roles.length === 0) return 'Research Team Member';
  const normalized = [...new Set(roles.map((role) => role.trim()).filter(Boolean))];
  return normalized.length === 1 ? normalized[0] : normalized.join(' / ');
}

function buildMemberDescription(name: string, roles: string[]) {
  const descriptions = roles
    .map((role) => roleHighlights.find((item) => item.match.test(role)))
    .filter(Boolean)
    .map((item) => item!.copy);

  const details = descriptions.length
    ? descriptions.join(' ')
    : 'Contributes to research with creativity, collaboration, and a strong commitment to making ideas matter.';

  return `${name} ${details}`;
}

function uniqueMembers(members: TeamMember[]) {
  return members.reduce<TeamMember[]>((acc, member) => {
    if (!acc.some((existing) => existing.name === member.name)) {
      acc.push(member);
    }
    return acc;
  }, []);
}

export function People() {
  const [projectTeamMembers, setProjectTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/team-members');
        if (!response.ok) {
          throw new Error('Unable to load project team members.');
        }

        const data = await response.json();
        const members = Array.isArray(data.members)
          ? data.members
            .filter((member: BackendTeamMember) => member.name)
            .map((member: BackendTeamMember) => ({
              name: member.name,
              title: buildMemberTitle(member.roles),
              description: buildMemberDescription(member.name, member.roles),
            }))
          : [];

        setProjectTeamMembers(members);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const mergedTeamMembers = uniqueMembers([...coreTeamMembers, ...projectTeamMembers]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white aspect-auto md:aspect-[16/5] min-h-[500px] md:min-h-0 flex items-center">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img
            src="/image.gif"
            alt="People background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
        </div>

        {/* Content Layer */}
        <div className="relative mx-auto max-w-[1200px] px-6 py-20 md:py-0 w-full flex flex-col items-center justify-center text-center">
          <p className="text-[12px] md:text-sm uppercase tracking-[0.25em] md:tracking-[0.35em] text-red-400 mb-4">
            People
          </p>

          <h1 className="text-[30px] sm:text-[38px] md:text-[56px] font-semibold leading-tight md:leading-[1.05] max-w-4xl mx-auto">
            We are a diverse group of thinkers and inventors
          </h1>

          <p className="mt-6 mx-auto max-w-3xl text-[15px] md:text-[18px] leading-relaxed md:leading-8 text-slate-200">
            All team members are part of different research projects and work together to shape the future of EI Arts and Sciences.
          </p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-16 max-w-[1400px] mx-auto lg:ml-80">
        <div className="space-y-12">
          <div className="rounded-[40px] overflow-hidden bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
            <div className="relative h-[420px] bg-slate-800">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-10">
                <div className="w-[240px] h-[240px] rounded-full border-8 border-white overflow-hidden bg-slate-700 shadow-xl">
                  <img src={haseebImage} alt="Haseeb Ejaz" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="px-10 py-12 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-red-400 mb-4">Associate Professor</p>
              <h2 className="text-[34px] md:text-[42px] font-semibold leading-tight text-white mb-4">
                Haseeb Ejaz
              </h2>
              <p className="text-[17px] md:text-[18px] leading-8 text-slate-300 max-w-3xl mx-auto">
                Associate Professor of Elements Research Lab and Sciences. Haseeb leads a multidisciplinary team focused on material systems, interactive media, and new forms of computational expression. His work bridges research, design, engineering, and performance to create emergent technologies that feel poetic, rigorous, and deeply human.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mergedTeamMembers.map((member) => (
              <div key={member.name} className="rounded-[32px] border border-slate-200/10 bg-white p-6 shadow-sm shadow-slate-900/10">
                <div className="h-64 overflow-hidden rounded-[28px] bg-slate-200">
                  <div className="h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <span className="text-sm uppercase tracking-[0.35em]">No image</span>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-red-500 mb-3">{member.title}</p>
                  <h3 className="text-[22px] md:text-[24px] font-semibold text-slate-950 mb-3">{member.name}</h3>
                  <p className="text-[15px] leading-7 text-slate-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
