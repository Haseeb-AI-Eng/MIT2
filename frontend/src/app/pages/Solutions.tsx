import { useState } from 'react';
import { HeroVideo } from './HeroVideo';

interface SolutionCard {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

const solutionCards: SolutionCard[] = [
  {
    id: 1,
    title: 'Digital Innovation',
    description: 'Cutting-edge solutions for digital transformation',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Technology',
  },
  {
    id: 2,
    title: 'Creative Design',
    description: 'Innovative design approaches for modern challenges',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Design',
  },
  {
    id: 3,
    title: 'Research & Development',
    description: 'Advanced research methodologies and tools',
    image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Research',
  },
  {
    id: 4,
    title: 'Interactive Media',
    description: 'Engaging multimedia experiences and installations',
    image: 'https://images.pexels.com/photos/3721944/pexels-photo-3721944.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Media',
  },
  {
    id: 5,
    title: 'Community Engagement',
    description: 'Building meaningful connections and partnerships',
    image: 'https://images.pexels.com/photos/3771999/pexels-photo-3771999.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Community',
  },
  {
    id: 6,
    title: 'Future Innovations',
    description: 'Exploring next-generation technologies',
    image: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Innovation',
  },
  {
    id: 7,
    title: 'Human-Centered Design',
    description: 'Solutions designed with people in mind',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Design',
  },
  {
    id: 8,
    title: 'Digital Ecosystems',
    description: 'Connected platforms and integrated systems',
    image: 'https://images.pexels.com/photos/3729558/pexels-photo-3729558.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Technology',
  },
];

export function Solutions() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = ['All Solutions', 'Technology', 'Design', 'Research', 'Media', 'Community', 'Innovation'];

  const filteredCards =
    activeTab === 'all'
      ? solutionCards
      : solutionCards.filter((card) => card.category === activeTab);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section data-hero-section className="relative overflow-hidden bg-black text-white aspect-auto md:aspect-[16/5] min-h-[40vh] md:min-h-0 flex items-center">
        <div className="absolute inset-0">
          <HeroVideo src="/hero-animation.mp4" />
        </div>

        {/* Content Layer */}
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 md:py-0 w-full flex flex-col items-center justify-center text-center min-h-[400px] md:min-h-[500px]">
          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] font-semibold leading-tight md:leading-[1.05] max-w-4xl mx-auto">
            Our Solutions & Initiatives
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[14px] md:text-[16px] text-white/70 leading-relaxed">
            We develop innovative solutions and host events, conferences, talks, and hackathons to help share our ideas with the public.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12">
          <div className="flex justify-center gap-8 overflow-x-auto whitespace-nowrap py-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                onClick={() => setActiveTab(tab === 'All Solutions' ? 'all' : tab)}
                className={`px-0 py-2 text-[13px] md:text-[14px] font-semibold transition-colors border-b-2 ${
                  activeTab === (tab === 'All Solutions' ? 'all' : tab)
                    ? 'text-[#E91E63] border-[#E91E63]'
                    : 'text-black/60 border-transparent hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <section className="relative w-full overflow-visible py-16 md:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="group relative overflow-hidden rounded-none border border-black/5 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-64 md:h-72 overflow-hidden bg-black">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="relative p-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-black/50 mb-2">
                    {card.category}
                  </p>
                  <h3 className="text-[18px] md:text-[20px] font-semibold text-black mb-3 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-[13px] md:text-[14px] text-black/60 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <button className="w-full py-2 px-4 bg-[#E91E63] text-white text-[12px] font-semibold rounded-none hover:bg-[#E91E63]/80 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-16 md:py-24 bg-[#050505] text-white">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8 lg:px-12 text-center">
          <h2 className="text-[28px] md:text-[42px] font-semibold mb-4">Join Our Community</h2>
          <p className="text-[14px] md:text-[16px] text-white/70 max-w-2xl mx-auto mb-8">
            Interested in collaborating or learning more about our initiatives? We'd love to hear from you.
          </p>
          <button className="px-8 py-3 bg-[#E91E63] text-white font-semibold rounded-none hover:bg-[#E91E63]/80 transition-colors">
            Get In Touch
          </button>
        </div>
      </section>
    </div>
  );
}
