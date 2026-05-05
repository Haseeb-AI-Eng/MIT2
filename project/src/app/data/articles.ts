export interface Article {
  id: string;
  title: string;
  category: string;
  date?: string;
  source?: string;
  image: string;
  excerpt: string;
  description: string;
  content: string[];
}

export const articles: Article[] = [
  {
    id: 'adaptive-robotic-systems',
    title: 'Adaptive robotic systems for enhanced human collaboration',
    category: 'Research',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1578918748648-7d30d67436c2?w=800',
    excerpt: 'Researchers develop new frameworks for robots that can seamlessly integrate into human workflows.',
    description: 'A new generation of adaptive robotics blends perception, control, and collaboration to help humans work more safely and productively in shared spaces.',
    content: [
      'MIT researchers are building robotic systems that learn from the people around them. These machines can adjust their motion, timing, and interaction style based on real-time human feedback.',
      'The project combines advances in machine learning, planning, and soft robot design to create robots that feel less like tools and more like teammates.',
      'By focusing on adaptability rather than rigid automation, the lab aims to make collaborative robots useful in manufacturing, healthcare, and creative industries.'
    ]
  },
  {
    id: 'gastronomy-beyond-event',
    title: 'Gastronomy & Beyond: The Event (6. Edition)',
    category: 'MIT Event',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=600',
    excerpt: 'A conversation series that connects food innovation, design, and community through live experiences.',
    description: 'This event explores the future of food systems, multisensory design, and cultural meaning through interactive installations and expert panels.',
    content: [
      'The latest edition of Gastronomy & Beyond brought together chefs, designers, and technologists to imagine how food practices can shape more sustainable and joyful futures.',
      'Sessions included sensor-driven dining experiences, bio-based food packaging, and community-led cooking projects.',
      'Attendees left with new ideas for how technology can support human-centered culinary exploration.'
    ]
  },
  {
    id: 'media-lab-chi-2026',
    title: 'Media Lab at CHI 2026',
    category: 'News',
    date: 'April 13–17, 2026',
    image: 'https://images.unsplash.com/photo-1768572019427-2ce961caaece?w=600',
    excerpt: 'Members of the Media Lab community showcase new research at the premier HCI conference.',
    description: 'More than 18 papers and demos from Media Lab researchers will appear at CHI 2026, highlighting advances in human-computer interaction and creative computing.',
    content: [
      'The Media Lab team presents work spanning wearable sensing, interactive systems, and cognitive interface design.',
      'Researchers are especially focused on accessible AI, environmental sensing, and new modes of embodied interaction.',
      'The Lab’s CHI submissions demonstrate how interdisciplinary teams can use design to translate complex research into compelling experiences.'
    ]
  },
  {
    id: 'electrically-driven-muscle-fiber',
    title: 'A new type of electrically driven artificial muscle fiber',
    category: 'Research',
    date: 'March 31, 2026',
    source: 'via MIT News',
    image: 'https://images.unsplash.com/photo-1675557009875-436f71457475?w=800',
    excerpt: 'Researchers create fiber that contracts in response to electrical stimulation and delivers more than three times the power of natural muscle.',
    description: 'The biohybrid fiber combines engineered tissue with soft actuation to produce lifelike motion that can be controlled electrically.',
    content: [
      'This artificial muscle fiber is designed for future medical implants and soft robotic systems.',
      'The material responds quickly to electrical signals, making it ideal for precise movement in delicate applications.',
      'The team envisions using the fiber to restore function in paralyzed muscles and to create new kinds of wearable devices.'
    ]
  },
  {
    id: 'women-health-advance',
    title: 'MIT Media Lab Working to Advance Women in STEM',
    category: 'News',
    date: 'April 2, 2026',
    image: 'https://images.unsplash.com/photo-1630959305529-67447c685b9e?w=400',
    excerpt: 'The Lab and WHx use AI, sensors, and wearables to advance women’s health care.',
    description: 'A new partnership applies machine learning and wearable sensing to better understand women’s health needs and improve outcomes.',
    content: [
      'The collaboration focuses on personalized monitoring for reproductive health, mental wellness, and chronic conditions.',
      'Researchers are building sensor systems that are more comfortable, private, and clinically useful for women.',
      'By combining design research with medical expertise, the project seeks to make healthcare more equitable and responsive.'
    ]
  },
  {
    id: 'design-innovations-hci',
    title: 'Design innovations in human-computer interaction',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1773982674487-2657ef3f58c3?w=400',
    excerpt: 'Media Lab teams experiment with new interaction paradigms for collaborative systems.',
    description: 'This work highlights how design-led research can create richer, more intuitive human-computer experiences.',
    content: [
      'The project investigates novel input methods, spatial computing, and embodied interaction.',
      'Researchers are testing how people collaborate around shared screens, mixed-reality tools, and ambient intelligence.',
      'The goal is to make complex systems feel more natural and easier to use in everyday contexts.'
    ]
  },
  {
    id: 'portable-ultrasound-sensor',
    title: 'A portable ultrasound sensor may enable earlier detection of breast cancer',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1754941622117-97957c5d669b?w=600',
    excerpt: 'MIT Media Lab researchers have developed a wearable ultrasound device that could allow people to detect breast tumors.',
    description: 'The wearable sensor is designed to be comfortable, affordable, and effective for routine screening outside traditional clinics.',
    content: [
      'The device uses low-power ultrasound to capture detailed images through soft tissue.',
      'Researchers are validating the technology with clinical partners to ensure reliability and user comfort.',
      'If successful, the sensor could help detect tumors earlier and reduce barriers to screening.'
    ]
  },
  {
    id: 'smart-wearable-biomarkers',
    title: 'Smart wearable detects biomarkers for early disease detection',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1701848053746-2ebc5ea9f801?w=600',
    excerpt: 'New sensor technology enables continuous health monitoring.',
    description: 'The wearable monitors biochemical signals and motion patterns to identify early signs of illness.',
    content: [
      'Engineers designed the wearable to collect data without interrupting a user’s daily routine.',
      'Machine learning models interpret the signals to detect deviations associated with disease.',
      'The approach could transform preventive health by delivering insights before symptoms appear.'
    ]
  },
  {
    id: 'wef-annual-meeting-2026',
    title: 'The MIT Media Lab at World Economic Forum Annual Meeting 2026',
    category: 'Event',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=600',
    excerpt: 'Lab members present at a global sustainability forum.',
    description: 'Participants showcased research on climate, health, and digital inclusion to a worldwide audience.',
    content: [
      'The Media Lab delegation engaged with leaders from government, industry, and civil society.',
      'They shared research on resilient systems, responsible AI, and equitable innovation.',
      'The meeting reinforced the Lab’s role in shaping global conversations about technology and society.'
    ]
  },
  {
    id: 'vision-system-urban-robots',
    title: 'Towards a vision system for urban robots',
    category: 'Research',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1494869042583-f6c911f04b4c?w=800',
    excerpt: 'A new technique makes robots better at seeing through crowded city scenes.',
    description: 'The research uses wireless reflections and AI to help robots detect hidden objects and navigate cluttered spaces.',
    content: [
      'Urban environments are challenging because objects can be occluded or visually confusing.',
      'The new system combines visible imagery with reflected signal data to infer hidden geometry.',
      'This could make delivery robots, autonomous vehicles, and search devices safer and more reliable.'
    ]
  },
  {
    id: 'collaborative-lab-culture',
    title: 'Building collaborative lab culture',
    category: 'Community',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    excerpt: 'Exploring how interdisciplinary teams create more impact through shared research goals.',
    description: 'The Lab nurtures a culture where researchers, designers, and artists work together on ambitious challenges.',
    content: [
      'Collaborative culture lets people combine their strengths across fields and bring richer perspectives to complex problems.',
      'The Lab supports exploratory projects, open critiques, and community events that build trust and experimentation.',
      'That shared environment helps ideas move quickly from prototype to real-world test.'
    ]
  },
  {
    id: 'creative-inquiry-tools',
    title: 'Designing tools for creative inquiry',
    category: 'Innovation',
    date: 'April 2026',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
    excerpt: 'A snapshot of how Lab members prototype future-facing technologies and systems.',
    description: 'This research captures how tools can help people discover new creative methods and solve complex challenges.',
    content: [
      'The project looks at how interfaces can support experimentation, reflection, and playful discovery.',
      'Researchers are developing new ways to surface insight from data and informal exploration.',
      'The tools emphasize flexibility, empathy, and collaboration over rigid workflows.'
    ]
  },
  {
    id: 'immersive-visual-design',
    title: 'Visual interfaces for immersive design',
    category: 'Exhibition',
    date: 'Spring 2026',
    image: 'https://images.unsplash.com/photo-1764345933933-bd14461f9f7b?w=600',
    excerpt: 'A visual exploration of form, color, and the future of creative engagement.',
    description: 'This piece highlights how visual storytelling can shape the next generation of interactive spaces.',
    content: [
      'The work blends generative visuals with tactile interaction to create an evocative experience.',
      'It demonstrates how design can help people understand complex systems through playful representation.',
      'Future versions will incorporate sound, motion, and adaptive feedback.'
    ]
  },
  {
    id: 'human-centered-ai-mapping',
    title: 'Mapping the future of human-centered AI',
    category: 'Research',
    date: 'Spring 2026',
    image: 'https://images.unsplash.com/photo-1772882971868-1bb960ebf150?w=600',
    excerpt: 'Images that highlight the role of research in shaping empathetic technology.',
    description: 'This study examines how AI can be designed around people’s needs, values, and lived contexts.',
    content: [
      'The Lab is creating tools that help users understand AI systems instead of just using them blindly.',
      'Researchers are prioritizing transparency, fairness, and user control in every design decision.',
      'The project aims to make AI more accessible and trustworthy for diverse communities.'
    ]
  },
  {
    id: 'lifelong-kindergarten-lab',
    title: 'Lifelong Kindergarten: Creative Learning Lab',
    category: 'Event',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    excerpt: 'New episodes exploring creativity, learning, and design with Mitch Resnick and guests.',
    description: 'The Lab’s learning series explores how playful practices can support innovation across age groups.',
    content: [
      'The series showcases educators, designers, and researchers who use making as a method for learning.',
      'Topics include creative computing, storytelling, and collaborative design education.',
      'The goal is to inspire learners to become confident, curious makers.'
    ]
  },
  {
    id: 'cross-disciplinary-research',
    title: 'Cross-disciplinary research in action',
    category: 'Podcast',
    date: 'March 2026',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
    excerpt: 'Researchers collaborate across disciplines to tackle global challenges with innovative solutions.',
    description: 'This story profiles teams that bring together engineering, art, and science to solve urgent problems.',
    content: [
      'The podcast episodes feature conversations about systems thinking, social impact, and experimental design.',
      'Guests explain how different fields can work together to create solutions that are both effective and meaningful.',
      'The research emphasizes the importance of shared language and mutual curiosity.'
    ]
  },
  {
    id: 'mit-research-design-future',
    title: 'MIT Research is a way out design principles take ground',
    category: 'Preview',
    date: 'May 2, 2025',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400',
    excerpt: 'Design and build an intriguing future from the heart of Massachusetts Avenue.',
    description: 'This preview highlights how MIT research combines bold thinking with grounded design practice.',
    content: [
      'The project focuses on making technology feel more humane and accessible.',
      'Researchers explore new ways of working that connect campus ideas with global communities.',
      'The work is meant to inspire new collaborations across disciplines.'
    ]
  },
  {
    id: 'access-cutting-edge-research',
    title: 'Program to access cutting-edge research, talent, and innovation',
    category: 'Preview',
    date: 'Oct. 2, 2024',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    excerpt: 'A look at how institutions support tomorrow’s technologies today.',
    description: 'This preview describes programs that help innovators bring new ideas to market responsibly.',
    content: [
      'The initiative provides mentorship, funding, and partnerships for emerging projects.',
      'It emphasizes ethical innovation, sustainability, and community-centered outcomes.',
      'The effort is designed to accelerate research while keeping people at the center.'
    ]
  },
  {
    id: 'recent-awards-community',
    title: 'View recent awards and recognitions granted to the Media Lab community',
    category: 'Preview',
    date: 'Jan. 1, 2023',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400',
    excerpt: 'A recap of the latest honors across research, design, and public engagement.',
    description: 'This preview celebrates the achievements of Lab members and their contributions to society.',
    content: [
      'From technology prizes to design awards, the community continues to receive broad recognition.',
      'The highlights show how interdisciplinary work can make an outsized impact.',
      'The stories underline the value of taking risks and exploring new forms of expression.'
    ]
  }
];

export const findArticle = (id: string | undefined) => articles.find((article) => article.id === id);
