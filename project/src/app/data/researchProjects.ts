export interface ResearchProject {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  description: string;
  content: string[];
}

export const researchProjects: ResearchProject[] = [
  {
    id: 'aiaa-goddard-100-initiative',
    slug: 'aiaa-goddard-100-initiative',
    title: 'AIAA Goddard 100 research showcase',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    excerpt: 'A collection of aerospace research projects celebrating 100 years of Goddard research leadership.',
    description: 'This showcase highlights modern aerospace innovations and research projects inspired by the Goddard legacy, including propulsion, materials, and mission design. Featuring cutting-edge developments in satellite technology, advanced composites, autonomous systems, and sustainable mission architectures that are shaping the future of space exploration, national security, and commercial space ventures. The initiative brings together interdisciplinary teams working on next-generation propulsion systems, novel materials for extreme environments, and AI-enhanced mission planning tools that promise to revolutionize how we explore and utilize space.',
    content: [
      'The AIAA Goddard 100 initiative surfaces groundbreaking projects that span space systems, human-machine collaboration, and advanced materials.',
      'Researchers are deploying new sensors, AI-driven design tools, and sustainable mission technologies for next-generation space exploration.',
      'The effort emphasizes applied engineering research that can be translated rapidly into real-world aerospace systems.'
    ]
  },
  {
    id: 'next-gen-biomedical-wearables',
    slug: 'next-gen-biomedical-wearables',
    title: 'Next-gen biomedical wearables for continuous health monitoring',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    excerpt: 'Researchers build wearable sensors to monitor vital signs and biochemistry in real time.',
    description: 'This research project develops flexible wearable devices that track physiological signals with clinical-grade accuracy while remaining comfortable for daily use.',
    content: [
      'The wearable integrates stretchable electronics and low-power biosensors for continuous monitoring.',
      'Machine learning models turn raw sensor data into actionable health insights for early detection.',
      'The project targets applications in chronic disease management, preventive care, and personalized wellness.'
    ]
  },
  {
    id: 'autonomous-robotic-urban-navigation',
    slug: 'autonomous-robotic-urban-navigation',
    title: 'Autonomous robotic urban navigation with adaptive vision',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
    excerpt: 'A vision-driven robotics project that helps machines safely navigate crowded city environments.',
    description: 'This research blends computer vision, sensor fusion, and adaptive planning to build autonomous robots that can move confidently through dense urban scenes.',
    content: [
      'Researchers combine camera feeds with depth sensors to interpret complex street environments.',
      'The system learns to recognize pedestrians, bicyclists, and vehicles in real time.',
      'The project aims to make delivery and service robots more reliable and human-aware.'
    ]
  },
  {
    id: 'materials-for-climate-resilience',
    slug: 'materials-for-climate-resilience',
    title: 'Materials research for climate resilience and infrastructure',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    excerpt: 'Novel materials are being designed to help infrastructure withstand extreme conditions.',
    description: 'The project explores smart composites, self-healing coatings, and sustainable building materials to improve resilience against floods, heat, and storms.',
    content: [
      'Engineers are testing new materials that repair themselves after damage.',
      'The research focuses on reducing embodied carbon while boosting durability.',
      'Field trials are being designed to validate long-term performance in harsh climates.'
    ]
  },
  {
    id: 'quantum-computing-algorithms',
    slug: 'quantum-computing-algorithms',
    title: 'Quantum computing algorithms for real-world research problems',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    excerpt: 'New quantum algorithms are being developed for chemistry, optimization, and materials design.',
    description: 'This research focuses on applying quantum computing to practical scientific challenges such as molecular simulation and logistics optimization.',
    content: [
      'Researchers create hybrid quantum-classical workflows for real-world problems.',
      'The project evaluates performance gains for chemistry and energy system models.',
      'The team is building tools that let domain scientists use quantum resources more easily.'
    ]
  },
  {
    id: 'synthetic-biology-biomanufacturing',
    slug: 'synthetic-biology-biomanufacturing',
    title: 'Synthetic biology for sustainable biomanufacturing',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1494203894071-8b8c9d34a25a?w=800',
    excerpt: 'Engineers design living systems that produce materials, medicines, and fuels with lower impact.',
    description: 'The research combines genetic engineering, automation, and systems biology to make biomanufacturing faster, safer, and more sustainable.',
    content: [
      'The team uses engineered microbes to manufacture high-value chemicals from renewable feedstocks.',
      'Advanced laboratory automation accelerates strain optimization and testing.',
      'The goal is to reduce waste and energy use across the production chain.'
    ]
  },
  {
    id: 'human-centered-ai-experiments',
    slug: 'human-centered-ai-experiments',
    title: 'Human-centered AI experiments for trustworthy interaction',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=800',
    excerpt: 'Researchers are developing AI systems that are transparent, fair, and easy to understand.',
    description: 'The project studies how people interact with AI, designing interfaces that make decision-making understandable and accountable.',
    content: [
      'User studies inform design choices at every stage of the system.',
      'The research explores explanations that help build trust without overwhelming users.',
      'Applications include healthcare, education, and collaborative work environments.'
    ]
  },
  {
    id: 'next-generation-battery-technology',
    slug: 'next-generation-battery-technology',
    title: 'Next-generation battery technology for clean energy storage',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800',
    excerpt: 'New battery chemistries promise longer life, faster charging, and safer operation.',
    description: 'Researchers are inventing advanced energy storage materials that can accelerate electric mobility and renewable energy adoption.',
    content: [
      'The project investigates solid-state electrolytes and stable electrode interfaces.',
      'Prototypes are tested for thermal safety and charge retention.',
      'The goal is to deliver storage technology that is affordable and scalable.'
    ]
  },
  {
    id: 'neuroscience-machine-interaction',
    slug: 'neuroscience-machine-interaction',
    title: 'Neuroscience-driven machine interaction and brain-computer interfaces',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    excerpt: 'Research advances in brain-computer interfaces are enabling new ways to control machines.',
    description: 'This project studies brain signals and develops interfaces that let people control devices with neural activity.',
    content: [
      'The team is improving signal decoding accuracy and robustness in real-world settings.',
      'The research explores non-invasive methods that are safe and comfortable for users.',
      'The work aims to support assistive technologies and new forms of creative expression.'
    ]
  },
  {
    id: 'bioinspired-swarm-robotics',
    slug: 'bioinspired-swarm-robotics',
    title: 'Bioinspired swarm robotics for resilient field operations',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
    excerpt: 'Swarm robotics research creates teams of robots that coordinate like biological systems.',
    description: 'The project uses decentralized algorithms and simple robots to accomplish complex tasks in uncertain environments.',
    content: [
      'Inspired by insects and flocks, the research uses local communication and adaptive behaviors.',
      'Applications include search and rescue, environmental monitoring, and infrastructure inspection.',
      'The project aims to make robotic systems more scalable and fault-tolerant.'
    ]
  },
  {
    id: 'materials-for-biomedical-implants',
    slug: 'materials-for-biomedical-implants',
    title: 'Materials research for next-generation biomedical implants',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    excerpt: 'The research develops new biomaterials that integrate better with the human body.',
    description: 'This project focuses on coatings and scaffolds that support healing while reducing inflammation and rejection.',
    content: [
      'Engineers test materials with soft tissue and bone to ensure compatibility.',
      'The team explores responsive surfaces that change when exposed to biological signals.',
      'The goal is to enable implants that last longer and feel more natural.'
    ]
  },
  {
    id: 'space-environment-sensing',
    slug: 'space-environment-sensing',
    title: 'Advanced sensing for space environment monitoring',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=800',
    excerpt: 'Research projects are improving how spacecraft measure radiation, particles, and plasma.',
    description: 'The project builds compact sensor arrays for real-time monitoring of the space environment around satellites and probes.',
    content: [
      'The sensors detect charged particles, magnetic fields, and plasma density simultaneously.',
      'The team validates systems in lab chambers that simulate near-Earth space conditions.',
      'This work supports safer, more resilient space missions.'
    ]
  },
  {
    id: 'urban-climate-adaptive-design',
    slug: 'urban-climate-adaptive-design',
    title: 'Urban climate adaptive design for resilient cities',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1462396388133-892b6b6fc84a?w=800',
    excerpt: 'Design research is making cities more adaptive to heat, flooding, and changing weather.',
    description: 'This project blends urban design, environmental sensing, and responsive infrastructure to help cities adapt to climate extremes.',
    content: [
      'Researchers prototype shading, water capture, and smart cooling systems.',
      'The work combines community feedback with real-time climate data.',
      'The goal is to keep public spaces comfortable and safe during environmental stress.'
    ]
  },
  {
    id: 'robotic-prosthetics-control-systems',
    slug: 'robotic-prosthetics-control-systems',
    title: 'Robotic prosthetics with intuitive control systems',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    excerpt: 'Researchers are building smarter prosthetic limbs that respond to the user’s intent.',
    description: 'This research develops control interfaces that translate muscle signals and motion intent into natural prosthetic movement.',
    content: [
      'The project tests machine learning models with real user data to improve responsiveness.',
      'Researchers focus on comfort, intuitiveness, and adaptive feedback.',
      'The goal is to restore function and independence for people with limb differences.'
    ]
  },
  {
    id: 'renewable-energy-grid-integration',
    slug: 'renewable-energy-grid-integration',
    title: 'Renewable energy grid integration and smart microgrids',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    excerpt: 'This research explores how microgrids and energy management systems can stabilize renewable-powered networks.',
    description: 'The project studies distributed energy resources, battery storage, and intelligent control systems for resilient grid operation.',
    content: [
      'Engineers model how solar, wind, and storage interact during peak demand.',
      'The research validates platform controls in hardware-in-the-loop simulations.',
      'The aim is to make renewable energy more reliable and accessible for communities.'
    ]
  },
  {
    id: 'deep-learning-medical-imaging',
    slug: 'deep-learning-medical-imaging',
    title: 'Deep learning for medical imaging and diagnostics',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
    excerpt: 'AI models are improving the speed and accuracy of medical image interpretation.',
    description: 'This research evaluates deep learning systems for tasks such as tumor detection, organ segmentation, and disease screening.',
    content: [
      'The project uses annotated clinical datasets to train robust image models.',
      'Researchers assess model reliability across diverse patient populations.',
      'The goal is to support doctors with faster, more accurate diagnostic tools.'
    ]
  },
  {
    id: 'biometric-security-research',
    slug: 'biometric-security-research',
    title: 'Biometric security research for next-generation authentication',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1556155092-8707de31f9c6?w=800',
    excerpt: 'New biometric systems balance security and user privacy for authentication.',
    description: 'This project designs biometric methods that are harder to spoof and easier for people to use safely.',
    content: [
      'The team investigates multimodal biometrics that combine face, voice, and gesture.',
      'Researchers emphasize privacy-preserving data handling and on-device processing.',
      'The work supports secure access in consumer, enterprise, and healthcare settings.'
    ]
  },
  {
    id: 'sustainable-chemistry-processes',
    slug: 'sustainable-chemistry-processes',
    title: 'Sustainable chemistry processes for lower-carbon manufacturing',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    excerpt: 'Chemistry research is reducing waste and energy use in industrial production.',
    description: 'The project explores catalysts, solvent-free reactions, and recyclable chemicals for greener manufacturing.',
    content: [
      'Researchers test new catalysts that work at lower temperatures and pressures.',
      'The work aims to replace hazardous reagents with safer alternatives.',
      'The project targets chemicals used across pharmaceuticals, materials, and energy.'
    ]
  },
  {
    id: 'interactive-urban-data-visualization',
    slug: 'interactive-urban-data-visualization',
    title: 'Interactive urban data visualization for community planning',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    excerpt: 'Researchers build visual tools that help people understand and shape urban systems.',
    description: 'The project develops interfaces that make city data more accessible, empowering residents and planners to make better decisions.',
    content: [
      'The team integrates transportation, energy, and environmental data into intuitive displays.',
      'The research studies how different communities use visualization tools for planning.',
      'The goal is to create more inclusive and transparent urban design workflows.'
    ]
  },
  {
    id: 'adaptive-learning-education-systems',
    slug: 'adaptive-learning-education-systems',
    title: 'Adaptive learning systems for personalized education',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1542728333-6d3c8d615f7b?w=800',
    excerpt: 'This research explores AI-powered learning systems that adapt to each student’s needs.',
    description: 'The project creates intelligent tutoring systems that provide personalized feedback and learning paths.',
    content: [
      'Researchers model student progress and adjust content in real time.',
      'The system supports diverse learners with different skills and goals.',
      'The work aims to improve engagement and long-term learning outcomes.'
    ]
  },
  {
    id: 'biodegradable-packaging-innovation',
    slug: 'biodegradable-packaging-innovation',
    title: 'Biodegradable packaging innovation for circular supply chains',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800',
    excerpt: 'New materials research is creating packaging that breaks down safely after use.',
    description: 'This study develops plant-based, compostable packaging solutions that can replace plastics in consumer goods.',
    content: [
      'The project tests new biopolymers for strength, barrier performance, and compostability.',
      'Researchers evaluate real-world recyclability and supply chain compatibility.',
      'The goal is to reduce plastic waste while maintaining product protection.'
    ]
  },
  {
    id: 'microbiome-health-research',
    slug: 'microbiome-health-research',
    title: 'Microbiome health research for precision nutrition',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
    excerpt: 'Researchers map the gut microbiome to design personalized nutrition strategies.',
    description: 'This project links microbial ecosystems to diet, metabolism, and long-term health outcomes.',
    content: [
      'The team analyzes microbial communities from diverse populations.',
      'The research identifies diet interventions that support beneficial microbes.',
      'The goal is to make nutrition recommendations more precise and effective.'
    ]
  },
  {
    id: 'cognitive-augmented-design-tools',
    slug: 'cognitive-augmented-design-tools',
    title: 'Cognitive augmented design tools for creative research teams',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    excerpt: 'Design research is creating tools that augment creative thinking with AI-driven insights.',
    description: 'This project builds software that helps researchers explore ideas, generate concepts, and collaborate more effectively.',
    content: [
      'The tool uses generative AI to surface novel design directions and materials suggestions.',
      'Researchers evaluate how augmented workflows change creative outcomes.',
      'The aim is to support exploratory research without replacing human judgment.'
    ]
  },
  {
    id: 'distributed-sensing-environmental-research',
    slug: 'distributed-sensing-environmental-research',
    title: 'Distributed sensing for environmental research and conservation',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    excerpt: 'This research combines low-cost sensors with cloud analytics to monitor ecosystems at scale.',
    description: 'The project designs networks of sensors that track temperature, pollution, and biodiversity across habitats.',
    content: [
      'Field pilots test long-term sensing systems in wetlands, forests, and coastal zones.',
      'The research uses data to identify early signals of ecosystem change.',
      'The goal is to give conservation teams better real-time awareness of environmental health.'
    ]
  },
  {
    id: 'precision-medical-imaging',
    slug: 'precision-medical-imaging',
    title: 'Precision medical imaging for targeted diagnosis',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1551033406-c8f98d3012c0?w=800',
    excerpt: 'Advanced imaging research is helping clinicians detect disease earlier and more precisely.',
    description: 'This project focuses on imaging systems that enhance contrast and extract new diagnostic signals from scans.',
    content: [
      'Researchers integrate AI analysis with medical imaging hardware for better clarity.',
      'The system is tested for early detection of cancer and vascular disease.',
      'The aim is to support more confident clinical decision-making.'
    ]
  },
  {
    id: 'low-power-edge-ai-research',
    slug: 'low-power-edge-ai-research',
    title: 'Low-power edge AI research for embedded devices',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    excerpt: 'The research develops energy-efficient AI models for edge devices and sensors.',
    description: 'This project explores how to run intelligent models on tiny hardware while preserving battery life and performance.',
    content: [
      'Researchers optimize neural networks for low-power processors and microcontrollers.',
      'The work includes new model compression and hardware-aware training techniques.',
      'Applications include wearable sensors, drones, and remote monitoring systems.'
    ]
  },
  {
    id: 'subsistence-urban-farming-systems',
    slug: 'subsistence-urban-farming-systems',
    title: 'Urban farming research for sustainable food systems',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca2?w=800',
    excerpt: 'Researchers are designing urban farming systems that use less water and land.',
    description: 'This project tests vertical farming, hydroponics, and automation to grow fresh produce in cities with minimal environmental impact.',
    content: [
      'The team evaluates crop yield, energy use, and nutrient density under controlled conditions.',
      'The research explores community-based urban agriculture models.',
      'The goal is to increase local food security while reducing food transport emissions.'
    ]
  },
  {
    id: 'robotic-ecology-sensors',
    slug: 'robotic-ecology-sensors',
    title: 'Robotic ecology sensors for wildlife research',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1531256379411-1f4e0f4be7b8?w=800',
    excerpt: 'This research deploys mobile sensors and robots to gather ecological data in remote areas.',
    description: 'The project builds robust sensing platforms that can track wildlife, habitat conditions, and ecosystem health over time.',
    content: [
      'Robots and sensor arrays collect data in places that are difficult for humans to reach.',
      'The research emphasizes low-impact monitoring and animal safety.',
      'The results support conservation policy and ecological science.'
    ]
  },
  {
    id: 'augmented-reality-design-research',
    slug: 'augmented-reality-design-research',
    title: 'Augmented reality design research for collaborative work',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    excerpt: 'Research explores how AR can support shared problem solving and design collaboration.',
    description: 'This project develops AR tools that allow teams to prototype spatial ideas and share context across physical and virtual spaces.',
    content: [
      'The team studies how AR annotations and spatial interfaces affect collaboration.',
      'Researchers build prototypes for architecture, engineering, and education use cases.',
      'The goal is to make complex information easier to explore together.'
    ]
  },
  {
    id: 'circular-materials-research',
    slug: 'circular-materials-research',
    title: 'Circular materials research for reusable product systems',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    excerpt: 'The project explores reusable materials and product systems that close material loops.',
    description: 'This research designs components and processes that can be recovered, repaired, and reused across multiple product lifecycles.',
    content: [
      'Researchers prototype durable materials that remain useful after repeated reuse.',
      'The study evaluates how design decisions affect recyclability and lifecycle impact.',
      'The goal is to reduce waste and create more sustainable manufacturing systems.'
    ]
  },
  {
    id: 'motion-analysis-health-research',
    slug: 'motion-analysis-health-research',
    title: 'Motion analysis research for mobility and rehabilitation',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
    excerpt: 'Researchers analyze motion to improve rehabilitation and physical therapy outcomes.',
    description: 'The project uses sensors, AI, and biomechanics to study movement patterns and support personalized recovery programs.',
    content: [
      'The system tracks gait, posture, and joint motion during daily activities.',
      'The research aims to provide actionable feedback for therapists and patients.',
      'The team is designing tools to make rehabilitation more adaptive and effective.'
    ]
  },
  {
    id: 'robotic-manufacturing-processes',
    slug: 'robotic-manufacturing-processes',
    title: 'Robotic manufacturing research for flexible production',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    excerpt: 'This research develops robotic systems that can reconfigure quickly for different manufacturing tasks.',
    description: 'The project studies modular robots, adaptive tooling, and AI-driven process planning for agile factories.',
    content: [
      'Researchers build robot teams that can switch tasks with minimal downtime.',
      'The study focuses on flexibility, precision, and human-robot collaboration.',
      'The aim is to make manufacturing more responsive and customized.'
    ]
  },
  {
    id: 'environmental-health-sensing',
    slug: 'environmental-health-sensing',
    title: 'Environmental health sensing for air and water research',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    excerpt: 'Sensor research is improving how we monitor pollution and ecosystem health.',
    description: 'This project creates new sensing solutions for air quality, water contamination, and environmental risk assessment.',
    content: [
      'The team deploys compact sensors in urban and natural environments.',
      'The research uses data to identify pollution hotspots and ecosystem stress.',
      'The goal is to support healthier communities and more informed policy.'
    ]
  },
  {
    id: 'adaptive-education-research-platforms',
    slug: 'adaptive-education-research-platforms',
    title: 'Adaptive education research platforms for active learning',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    excerpt: 'Active learning platforms are being researched to make education more engaging and inclusive.',
    description: 'This research builds systems that adapt content and pace to each learner’s needs while keeping them engaged in hands-on activities.',
    content: [
      'Researchers combine interactive simulations with real-time feedback loops.',
      'The project studies how personalization affects motivation and learning outcomes.',
      'The aim is to make education more flexible and accessible.'
    ]
  },
  {
    id: 'space-robot-teleoperation',
    slug: 'space-robot-teleoperation',
    title: 'Space robot teleoperation research for lunar and orbital missions',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
    excerpt: 'Researchers are developing teleoperation systems for remote robot control in space.',
    description: 'The project focuses on communication, autonomy, and human-machine interfaces for controlling robots in lunar and orbital environments.',
    content: [
      'The team tests low-latency controls and predictive assistance algorithms.',
      'Research explores how operators can manage complex tasks from Earth or nearby habitats.',
      'The goal is to enable safer, more capable robotic missions beyond Earth.'
    ]
  },
  {
    id: 'sustainable-transportation-systems',
    slug: 'sustainable-transportation-systems',
    title: 'Sustainable transportation systems research for cleaner cities',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
    excerpt: 'Research into cleaner transport is shaping low-emission urban mobility solutions.',
    description: 'The project investigates electric vehicle infrastructure, micro-mobility systems, and traffic optimization for healthier cities.',
    content: [
      'Researchers model emissions and energy use for different transport modes.',
      'The work includes pilots of shared electric vehicles and smart transit services.',
      'The aim is to reduce pollution and improve mobility equity.'
    ]
  },
  {
    id: 'ethical-ai-research-frameworks',
    slug: 'ethical-ai-research-frameworks',
    title: 'Ethical AI research frameworks for trustworthy systems',
    category: 'Research',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    excerpt: 'This research designs ethical frameworks that help AI systems behave responsibly.',
    description: 'The project creates practical tools and policies for aligning AI systems with human values and societal norms.',
    content: [
      'Researchers work with ethicists, designers, and engineers to translate principles into practice.',
      'The team evaluates how frameworks perform in real-world AI deployments.',
      'The goal is to make AI development more transparent and accountable.'
    ]
  }
];
