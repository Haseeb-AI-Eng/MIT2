import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { NewsCard } from '../components/NewsCard';
import { EventCard } from '../components/EventCard';
import { articles } from '../data/articles';

const getArticle = (id: string) => articles.find((article) => article.id === id)!;

export function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/image.gif"
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-[36px] md:text-[56px] text-center px-8 leading-tight z-10"
          style={{ fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 300 }}
        >
          Imagine what we can become.
        </motion.h1>
      </section>

      <section className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        {/* Row 1: Large image left + Event right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <NewsCard
            image={getArticle('adaptive-robotic-systems').image}
            title={getArticle('adaptive-robotic-systems').title}
            description={getArticle('adaptive-robotic-systems').description}
            category={getArticle('adaptive-robotic-systems').category}
            size="large"
            onClick={() => navigate(`/article/${getArticle('adaptive-robotic-systems').id}`)}
          />
          <EventCard
            image={getArticle('gastronomy-beyond-event').image}
            title={getArticle('gastronomy-beyond-event').title}
            date={getArticle('gastronomy-beyond-event').date ?? ''}
            tag={getArticle('gastronomy-beyond-event').category}
            onClick={() => navigate(`/article/${getArticle('gastronomy-beyond-event').id}`)}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
          <div className="md:col-span-4">
            <NewsCard
              image={getArticle('media-lab-chi-2026').image}
              title={getArticle('media-lab-chi-2026').title}
              description={getArticle('media-lab-chi-2026').description}
              category={getArticle('media-lab-chi-2026').category}
              onClick={() => navigate(`/article/${getArticle('media-lab-chi-2026').id}`)}
            />
          </div>
          <div className="md:col-span-5">
            <NewsCard
              image={getArticle('electrically-driven-muscle-fiber').image}
              title={getArticle('electrically-driven-muscle-fiber').title}
              description={getArticle('electrically-driven-muscle-fiber').description}
              category={getArticle('electrically-driven-muscle-fiber').category}
              size="large"
              onClick={() => navigate(`/article/${getArticle('electrically-driven-muscle-fiber').id}`)}
            />
          </div>
          <div className="md:col-span-3 space-y-5">
            <NewsCard
              image={getArticle('women-health-advance').image}
              title={getArticle('women-health-advance').title}
              category={getArticle('women-health-advance').category}
              onClick={() => navigate(`/article/${getArticle('women-health-advance').id}`)}
            />
            <NewsCard
              image={getArticle('design-innovations-hci').image}
              title={getArticle('design-innovations-hci').title}
              category={getArticle('design-innovations-hci').category}
              onClick={() => navigate(`/article/${getArticle('design-innovations-hci').id}`)}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <NewsCard
            image={getArticle('portable-ultrasound-sensor').image}
            title={getArticle('portable-ultrasound-sensor').title}
            description={getArticle('portable-ultrasound-sensor').description}
            category={getArticle('portable-ultrasound-sensor').category}
            onClick={() => navigate(`/article/${getArticle('portable-ultrasound-sensor').id}`)}
          />
          <NewsCard
            image={getArticle('smart-wearable-biomarkers').image}
            title={getArticle('smart-wearable-biomarkers').title}
            description={getArticle('smart-wearable-biomarkers').description}
            category={getArticle('smart-wearable-biomarkers').category}
            onClick={() => navigate(`/article/${getArticle('smart-wearable-biomarkers').id}`)}
          />
          <NewsCard
            image={getArticle('wef-annual-meeting-2026').image}
            title={getArticle('wef-annual-meeting-2026').title}
            description={getArticle('wef-annual-meeting-2026').description}
            category={getArticle('wef-annual-meeting-2026').category}
            onClick={() => navigate(`/article/${getArticle('wef-annual-meeting-2026').id}`)}
          />
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/article/${getArticle('vision-system-urban-robots').id}`)}
          >
            <div className="overflow-hidden">
              <img
                src={getArticle('vision-system-urban-robots').image}
                alt={getArticle('vision-system-urban-robots').title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('vision-system-urban-robots').category}</p>
              <h3 className="text-[22px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                {getArticle('vision-system-urban-robots').title}
              </h3>
              <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                {getArticle('vision-system-urban-robots').description}
              </p>
            </div>
          </div>

          <div className="col-span-1 flex flex-col gap-5">
            <div className="flex flex-col">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/article/${getArticle('collaborative-lab-culture').id}`)}
              >
                <div className="overflow-hidden aspect-square">
                  <img
                    src={getArticle('collaborative-lab-culture').image}
                    alt={getArticle('collaborative-lab-culture').title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('collaborative-lab-culture').category}</p>
                  <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                    {getArticle('collaborative-lab-culture').title}
                  </h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                    {getArticle('collaborative-lab-culture').description}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/article/${getArticle('creative-inquiry-tools').id}`)}
              >
                <div className="overflow-hidden aspect-square">
                  <img
                    src={getArticle('creative-inquiry-tools').image}
                    alt={getArticle('creative-inquiry-tools').title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('creative-inquiry-tools').category}</p>
                  <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                    {getArticle('creative-inquiry-tools').title}
                  </h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                    {getArticle('creative-inquiry-tools').description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Images with descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/article/${getArticle('lifelong-kindergarten-lab').id}`)}
          >
            <div className="overflow-hidden mb-4">
              <img
                src={getArticle('lifelong-kindergarten-lab').image}
                alt={getArticle('lifelong-kindergarten-lab').title}
                className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('lifelong-kindergarten-lab').category}</p>
            <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('lifelong-kindergarten-lab').title}
            </h3>
            <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('lifelong-kindergarten-lab').description}
            </p>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/article/${getArticle('cross-disciplinary-research').id}`)}
          >
            <div className="overflow-hidden mb-4">
              <img
                src={getArticle('cross-disciplinary-research').image}
                alt={getArticle('cross-disciplinary-research').title}
                className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('cross-disciplinary-research').category}</p>
            <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('cross-disciplinary-research').title}
            </h3>
            <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('cross-disciplinary-research').description}
            </p>
          </div>
        </div>

        {/* Masonry section */}
        <section className="mb-5">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            <div
              className="cursor-pointer break-inside-avoid"
              onClick={() => navigate(`/article/${getArticle('immersive-visual-design').id}`)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={getArticle('immersive-visual-design').image}
                  alt={getArticle('immersive-visual-design').title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('immersive-visual-design').category}</p>
                <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                  {getArticle('immersive-visual-design').title}
                </h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                  {getArticle('immersive-visual-design').description}
                </p>
              </div>
            </div>

            <div
              className="cursor-pointer break-inside-avoid"
              onClick={() => navigate(`/article/${getArticle('human-centered-ai-mapping').id}`)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={getArticle('human-centered-ai-mapping').image}
                  alt={getArticle('human-centered-ai-mapping').title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{getArticle('human-centered-ai-mapping').category}</p>
                <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                  {getArticle('human-centered-ai-mapping').title}
                </h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                  {getArticle('human-centered-ai-mapping').description}
                </p>
              </div>
            </div>

            <div className="aspect-square overflow-hidden bg-gray-200 break-inside-avoid"></div>
            <div className="aspect-square overflow-hidden bg-gray-100 break-inside-avoid"></div>
          </div>
        </section>

        {/* Bottom preview section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/article/${getArticle('mit-research-design-future').id}`)}
          >
            <div className="aspect-[4/3] overflow-hidden mb-4">
              <img
                src={getArticle('mit-research-design-future').image}
                alt={getArticle('mit-research-design-future').title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('mit-research-design-future').description}
            </p>
            <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">{getArticle('mit-research-design-future').date}</p>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/article/${getArticle('access-cutting-edge-research').id}`)}
          >
            <div className="aspect-[4/3] overflow-hidden mb-4">
              <img
                src={getArticle('access-cutting-edge-research').image}
                alt={getArticle('access-cutting-edge-research').title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('access-cutting-edge-research').description}
            </p>
            <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">{getArticle('access-cutting-edge-research').date}</p>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/article/${getArticle('recent-awards-community').id}`)}
          >
            <div className="aspect-[4/3] overflow-hidden mb-4">
              <img
                src={getArticle('recent-awards-community').image}
                alt={getArticle('recent-awards-community').title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
              {getArticle('recent-awards-community').description}
            </p>
            <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">{getArticle('recent-awards-community').date}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
