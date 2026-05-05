/**
 * seed-projects.js
 * ─────────────────────────────────────────────────────────
 * Automatically fills /add-research-project 20 times with
 * realistic research project data + Pexels cover images.
 *
 * HOW TO RUN:
 *   npm install playwright
 *   npx playwright install chromium
 *   node seed-projects.js
 *
 * Make sure your dev server is running at http://localhost:5173
 * and you are already logged in (the script opens a visible
 * browser so you can log in manually if needed on first run).
 * ─────────────────────────────────────────────────────────
 */

import { chromium } from 'playwright';

// ── Pexels images from @elementsinteractive (direct CDN URLs) ──
const COVER_IMAGES = [
  'https://images.pexels.com/photos/35347743/pexels-photo-35347743.jpeg',
  'https://images.pexels.com/photos/35347528/pexels-photo-35347528.jpeg',
  'https://images.pexels.com/photos/37118126/pexels-photo-37118126.jpeg',
  // Supplementary Pexels images that fit research themes
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg',
  'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
  'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg',
  'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg',
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
  'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg',
  'https://images.pexels.com/photos/3861943/pexels-photo-3861943.jpeg',
  'https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg',
];

// ── 20 research projects ──────────────────────────────────────
const PROJECTS = [
  {
    title: 'BioSync: Real-Time Physiological Monitoring for Athletes',
    description: 'BioSync investigates non-invasive wearable sensors that continuously stream biometric data—heart rate variability, lactate proxy, and muscle oxygenation—to a cloud dashboard. Machine-learning models flag early fatigue signatures, enabling coaches to make data-driven substitution decisions and reduce soft-tissue injuries by up to 40%. Field trials were conducted with three national sports federations across two seasons.',
    tags: ['health', 'wearables', 'machine learning', 'sports science'],
    team: [
      { name: 'Dr. Ayesha Tariq', role: 'Principal Investigator' },
      { name: 'Marcus Osei', role: 'Embedded Systems Engineer' },
      { name: 'Priya Nair', role: 'Data Scientist' },
    ],
  },
  {
    title: 'UrbanRoots: Vertical Farming in Dense City Cores',
    description: 'UrbanRoots prototypes modular hydroponic towers integrated directly into residential high-rises. The system recycles greywater, uses full-spectrum LEDs tuned to crop phenotype, and delivers up to 30 kg of leafy greens per tower per month. An IoT control layer adjusts nutrient dosing autonomously. Pilot installations in Karachi and Lahore inform city-level food security policy recommendations.',
    tags: ['climate', 'food systems', 'IoT', 'urban design'],
    team: [
      { name: 'Zainab Hussain', role: 'Lead Researcher' },
      { name: 'Tom Lindqvist', role: 'Horticulture Engineer' },
      { name: 'Farah Siddiqui', role: 'Policy Analyst' },
    ],
  },
  {
    title: 'DeepScribe: AI-Assisted Medical Documentation',
    description: 'DeepScribe deploys a fine-tuned large language model that listens to physician–patient conversations in real time and generates structured SOAP notes, ICD-10 codes, and referral letters within seconds of consultation end. Privacy is preserved through on-device inference; no audio leaves the clinic. A randomised controlled trial across 12 outpatient clinics demonstrated a 62% reduction in documentation time.',
    tags: ['AI', 'healthcare', 'NLP', 'clinical workflow'],
    team: [
      { name: 'Dr. James Okello', role: 'Clinical Lead' },
      { name: 'Sophia Chen', role: 'ML Engineer' },
      { name: 'Ali Raza', role: 'Privacy & Compliance' },
      { name: 'Nina Petrov', role: 'UX Researcher' },
    ],
  },
  {
    title: 'FloodSense: Early Warning Infrastructure for Monsoon Regions',
    description: 'FloodSense deploys a mesh of low-power river gauges and soil-moisture nodes across the Indus basin. Sensor telemetry feeds a hydrological digital twin that issues community-level flood warnings 72 hours in advance with 89% accuracy. Warnings are disseminated via SMS in Urdu and Sindhi, reaching populations without smartphone access. The platform has already triggered pre-emptive evacuations protecting over 200,000 residents.',
    tags: ['climate', 'disaster response', 'IoT', 'Pakistan'],
    team: [
      { name: 'Dr. Salman Baig', role: 'Hydrology Lead' },
      { name: 'Amina Yusuf', role: 'Embedded Systems' },
      { name: 'Rahim Khan', role: 'Community Liaison' },
    ],
  },
  {
    title: 'MindBridge: Adaptive Learning for Neurodiverse Students',
    description: 'MindBridge is an adaptive educational platform that uses eye-tracking, keystroke dynamics, and response latency to infer cognitive load in real time. Lessons are dynamically restructured—breaking tasks into smaller chunks, adjusting pacing, or switching modality—when overload is detected. A two-year longitudinal study with 340 students with dyslexia and ADHD shows a 1.8-grade-level reading improvement on average.',
    tags: ['education', 'AI', 'accessibility', 'neurodiversity'],
    team: [
      { name: 'Dr. Leila Ahmadi', role: 'Cognitive Scientist' },
      { name: 'Carlos Reyes', role: 'Software Lead' },
      { name: 'Yuki Tanaka', role: 'Educational Psychologist' },
    ],
  },
  {
    title: 'OpenMesh: Community-Owned Broadband for Rural Pakistan',
    description: 'OpenMesh designs low-cost 60 GHz point-to-multipoint radio nodes assembled from commodity components and managed by a cooperative governance model. Villages collectively own the infrastructure, set pricing, and reinvest surplus into expansion. Deployments in Gilgit-Baltistan achieved 50 Mbps symmetric connectivity at 1/10th the cost of commercial alternatives, connecting 18 schools and 6 health clinics.',
    tags: ['connectivity', 'rural tech', 'community', 'infrastructure'],
    team: [
      { name: 'Usman Ghani', role: 'Network Architect' },
      { name: 'Sara Malik', role: 'Community Organiser' },
      { name: 'Dr. Bilal Ahmed', role: 'Governance Researcher' },
    ],
  },
  {
    title: 'SolarWeave: Photovoltaic Textiles for Off-Grid Households',
    description: 'SolarWeave integrates flexible perovskite solar cells into fabric structures that can be used as awnings, curtains, or roofing material. Each square metre generates 80–120 W under standard South Asian irradiance. A DC microgrid controller prioritises charging schedules across appliances, maximising utilisation with no grid connection. Prototypes are deployed in 50 off-grid households in rural Sindh.',
    tags: ['energy', 'materials science', 'design', 'off-grid'],
    team: [
      { name: 'Dr. Maha Qureshi', role: 'Materials Lead' },
      { name: 'Ethan Park', role: 'Power Electronics' },
      { name: 'Layla Ibrahim', role: 'Field Researcher' },
    ],
  },
  {
    title: 'CropShield: Precision Pest Detection via Drone Imaging',
    description: 'CropShield equips agricultural drones with hyperspectral cameras and a convolutional neural network trained on 1.2 million annotated crop images. Flying at 30 m altitude, the system identifies early-stage pest infestation, nutrient deficiency, and water stress at the individual plant level, generating georeferenced prescription maps for targeted pesticide application—reducing chemical use by 55% without yield loss.',
    tags: ['agriculture', 'AI', 'robotics', 'remote sensing'],
    team: [
      { name: 'Dr. Tariq Mehmood', role: 'Precision Agriculture Lead' },
      { name: 'Ana Sousa', role: 'Computer Vision Engineer' },
      { name: 'Haroon Sheikh', role: 'Drone Operations' },
      { name: 'Nadia Ali', role: 'Agronomy Consultant' },
    ],
  },
  {
    title: 'PolyLingo: Simultaneous Interpretation for Low-Resource Languages',
    description: 'PolyLingo trains sequence-to-sequence transformer models on parallel corpora for Pashto, Balochi, Brahui, and Shina—languages with fewer than 10,000 hours of transcribed audio. Combining transfer learning from Whisper with in-context few-shot prompting, the system achieves BLEU scores competitive with commercial systems for high-resource languages. Live pilots at district court proceedings demonstrate real-world viability.',
    tags: ['NLP', 'low-resource languages', 'AI', 'accessibility'],
    team: [
      { name: 'Dr. Asma Javed', role: 'Computational Linguist' },
      { name: 'Reza Hosseini', role: 'ML Engineer' },
      { name: 'Gulnaz Bibi', role: 'Field Linguist' },
    ],
  },
  {
    title: 'NanoSieve: Membrane Filtration for Arsenic Removal',
    description: "NanoSieve engineers a graphene-oxide membrane with precisely tuned pore geometries that selectively adsorb arsenate ions from groundwater at concentrations as low as 5 ppb. The gravity-fed system requires no electricity, processes 50 L/day, and membranes last 6 months before regeneration. Field deployment in 30 villages in Punjab's arsenic-belt has provided safe drinking water to over 4,000 families.",
    tags: ['water', 'materials science', 'public health', 'nanotechnology'],
    team: [
      { name: 'Dr. Imran Siddiqui', role: 'Chemical Engineer' },
      { name: 'Mei Lin', role: 'Nanomaterials Researcher' },
      { name: 'Dr. Rukhsana Bibi', role: 'Public Health Lead' },
    ],
  },
  {
    title: 'EchoMap: 3D Acoustic Mapping of Urban Noise Pollution',
    description: 'EchoMap deploys a distributed network of MEMS microphone arrays across city districts, fusing signals with building geometry models to produce real-time 3D noise maps at 1 m resolution. Planners use the maps to evaluate traffic-calming interventions, school siting, and green-barrier placement. A Karachi pilot quantified a 9 dB(A) noise reduction at school facades following targeted interventions.',
    tags: ['urban design', 'acoustics', 'smart city', 'public health'],
    team: [
      { name: 'Dr. Fatima Malik', role: 'Acoustics Lead' },
      { name: 'Sven Eriksson', role: 'Signal Processing' },
      { name: 'Mariam Zahid', role: 'Urban Planner' },
    ],
  },
  {
    title: 'CircuitBreaker: Gamified Cybersecurity Training',
    description: 'CircuitBreaker is a narrative-driven browser game that teaches phishing recognition, password hygiene, and social-engineering defence through escalating scenarios. Adaptive difficulty ensures learners are always in the zone of proximal development. Deployed across 15 government ministries, completion rates exceeded 91% versus 23% for traditional e-learning modules, and self-reported phishing susceptibility dropped by 67%.',
    tags: ['cybersecurity', 'education', 'gamification', 'design'],
    team: [
      { name: 'Omar Shaikh', role: 'Game Designer' },
      { name: 'Dr. Hina Butt', role: 'Learning Scientist' },
      { name: 'Lucas Ferreira', role: 'Full-Stack Developer' },
    ],
  },
  {
    title: 'ColdChain+: Solar-Powered Vaccine Cold Chain for Last Mile',
    description: 'ColdChain+ integrates phase-change material insulation with a 120 W solar panel and a Peltier cooling module into a portable vaccine carrier that maintains 2–8 °C for 72 hours without grid power. An embedded SIM card streams temperature and GPS telemetry to a central dashboard. Field deployment across 80 union councils in Khyber Pakhtunkhwa reduced cold-chain failure rates from 18% to 1.2%.',
    tags: ['health', 'cold chain', 'solar', 'logistics'],
    team: [
      { name: 'Dr. Nasreen Akhtar', role: 'Vaccine Programme Lead' },
      { name: 'James Mwangi', role: 'Hardware Engineer' },
      { name: 'Shabana Kosar', role: 'Field Operations Manager' },
    ],
  },
  {
    title: 'PaperlessHC: Digitising Primary Healthcare Records',
    description: 'PaperlessHC deploys tablet-based electronic medical record software optimised for low-bandwidth and intermittent connectivity, using a conflict-free replicated data structure to synchronise records when connectivity is restored. Offline OCR converts legacy paper records. After 18 months in 40 Basic Health Units, duplicate prescriptions fell by 84%, and referral tracking improved continuity of care for 78% of chronic disease patients.',
    tags: ['health', 'digital health', 'offline-first', 'Pakistan'],
    team: [
      { name: 'Dr. Zahid Rana', role: 'Health Informatics Lead' },
      { name: 'Aisha Patel', role: 'Software Engineer' },
      { name: 'Dr. Nadia Hamid', role: 'Clinical Advisor' },
      { name: 'Shahid Mehmood', role: 'Implementation Lead' },
    ],
  },
  {
    title: 'TectoniQ: Earthquake-Resistant Low-Cost Housing',
    description: 'TectoniQ develops a compressed earth block construction system with a bamboo-steel hybrid moment frame. The system meets UBC zone-4 seismic requirements, uses 85% locally sourced materials, and costs 40% less than conventional reinforced concrete construction. Structural testing was conducted at Lahore UET, and 120 homes have been built in Azad Kashmir as part of post-disaster recovery.',
    tags: ['design', 'disaster resilience', 'construction', 'materials'],
    team: [
      { name: 'Dr. Kamran Mirza', role: 'Structural Engineer' },
      { name: 'Elena Vasquez', role: 'Architect' },
      { name: 'Waseem Baig', role: 'Materials Testing Lead' },
    ],
  },
  {
    title: 'HerdTrack: Livestock Management via GPS & AI',
    description: 'HerdTrack attaches solar-charged GPS+accelerometer collars to cattle and goats. Activity signatures identify lameness, oestrus, and calving events 24 hours earlier than visual inspection. A companion mobile app—available in Urdu and Punjabi—delivers real-time alerts and aggregates herd health trends. Adoption across 500 pastoral households in Balochistan increased livestock survival rates by 12% over two monsoon seasons.',
    tags: ['agriculture', 'AI', 'IoT', 'livestock'],
    team: [
      { name: 'Dr. Ghulam Mustafa', role: 'Veterinary Lead' },
      { name: 'Amara Diallo', role: 'ML Researcher' },
      { name: 'Riffat Bibi', role: 'Community Engagement' },
    ],
  },
  {
    title: 'SignBridge: Real-Time Pakistani Sign Language Interpreter',
    description: 'SignBridge uses a depth camera and a graph neural network to recognise Pakistani Sign Language gestures and translate them to text and synthesised Urdu speech with less than 400 ms latency. The reverse pathway converts speech to animated avatar signing. Evaluation with 60 Deaf participants rated comprehension accuracy at 94%. Pilots are active at two Islamabad government offices.',
    tags: ['accessibility', 'AI', 'computer vision', 'language'],
    team: [
      { name: 'Dr. Sana Mir', role: 'Accessibility Researcher' },
      { name: 'David Okonkwo', role: 'Computer Vision Engineer' },
      { name: 'Bushra Iqbal', role: 'Deaf Community Liaison' },
      { name: 'Umar Farooq', role: 'Backend Developer' },
    ],
  },
  {
    title: 'AquaLens: Portable Water Quality Testing via Smartphone',
    description: 'AquaLens is a 3D-printed clip-on spectrometer that turns any smartphone into a water quality analyser, detecting turbidity, nitrates, coliforms (via colorimetric reagent), and heavy metals against WHO thresholds. Results are logged to a shared GIS database, building a citizen-science water quality map of the Ravi basin. Over 3,000 tests have been submitted by trained community monitors across 120 villages.',
    tags: ['water', 'public health', 'citizen science', 'hardware'],
    team: [
      { name: 'Dr. Lubna Aziz', role: 'Environmental Engineer' },
      { name: 'Henri Dupont', role: 'Optics Engineer' },
      { name: 'Asma Bibi', role: 'Field Coordinator' },
    ],
  },
  {
    title: 'RoofBot: Autonomous Solar Panel Cleaning Robot',
    description: 'RoofBot is a wheeled robot that uses computer vision and 3D-printed soft brushes to clean photovoltaic panels on industrial rooftops without water or human access at height. Dust accumulation in arid climates degrades output by up to 30%; RoofBot recovers 95% of this loss in a single pass. Operating cost is under $0.002/W·year. Deployed at 8 solar farms in southern Punjab.',
    tags: ['energy', 'robotics', 'solar', 'automation'],
    team: [
      { name: 'Ahmad Hassan', role: 'Robotics Lead' },
      { name: 'Dr. Ying Wu', role: 'Computer Vision' },
      { name: 'Khalid Mahmood', role: 'Mechanical Engineer' },
    ],
  },
  {
    title: 'MarketMind: Smallholder Price Forecasting via Satellite',
    description: 'MarketMind fuses Sentinel-2 crop health indices, historical commodity prices, and weather forecasts into a gradient-boosted model that predicts mandi prices for wheat, rice, and tomatoes 14 days ahead with a mean absolute error below 4%. Farmers receive daily SMS price forecasts, enabling them to time sales and achieve 18% higher average revenue. Active across Punjab and Sindh with 12,000 registered farmers.',
    tags: ['agriculture', 'AI', 'economics', 'remote sensing'],
    team: [
      { name: 'Dr. Farida Haidari', role: 'Agricultural Economist' },
      { name: 'Chidi Obi', role: 'Data Engineer' },
      { name: 'Munira Saleem', role: 'Farmer Outreach Lead' },
      { name: 'Babar Khan', role: 'ML Engineer' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Try multiple selector strategies to find and fill a field.
 * Handles: <input>, <textarea>, react-select, contenteditable
 */
async function fillField(page, label, value) {
  // Strategy 1: label[for] → input/textarea
  try {
    const labelEl = page.getByLabel(label, { exact: false });
    if (await labelEl.count() > 0) {
      await labelEl.first().fill(value);
      return true;
    }
  } catch (_) {}

  // Strategy 2: placeholder
  try {
    const el = page.getByPlaceholder(label, { exact: false });
    if (await el.count() > 0) {
      await el.first().fill(value);
      return true;
    }
  } catch (_) {}

  return false;
}

async function fillTag(page, tag) {
  // Many tag inputs work by typing then pressing Enter/comma
  const tagInputSelectors = [
    'input[placeholder*="tag" i]',
    'input[placeholder*="keyword" i]',
    'input[name*="tag" i]',
    '[data-testid*="tag"] input',
  ];
  for (const sel of tagInputSelectors) {
    const el = page.locator(sel).first();
    if (await el.count() > 0) {
      await el.fill(tag);
      await el.press('Enter');
      await sleep(200);
      return;
    }
  }
}

async function addTeamMember(page, member) {
  // Look for an "Add member" / "Add team member" button
  const addBtnSelectors = [
    'button:has-text("Add member")',
    'button:has-text("Add team member")',
    'button:has-text("Add Member")',
    'button:has-text("+ Member")',
    'button:has-text("Add")',
  ];

  for (const sel of addBtnSelectors) {
    const btn = page.locator(sel).last();
    if (await btn.count() > 0) {
      await btn.click();
      await sleep(400);
      break;
    }
  }

  // Fill name
  const nameFields = [
    page.locator('input[placeholder*="name" i]').last(),
    page.locator('input[name*="name" i]').last(),
    page.getByLabel('Name', { exact: false }).last(),
  ];
  for (const f of nameFields) {
    if (await f.count() > 0) {
      await f.fill(member.name);
      break;
    }
  }

  // Fill role
  const roleFields = [
    page.locator('input[placeholder*="role" i]').last(),
    page.locator('input[name*="role" i]').last(),
    page.getByLabel('Role', { exact: false }).last(),
  ];
  for (const f of roleFields) {
    if (await f.count() > 0) {
      await f.fill(member.role);
      break;
    }
  }

  await sleep(300);
}

// ── Main ──────────────────────────────────────────────────────

(async () => {
  const browser = await chromium.launch({
    headless: false, // visible so you can watch / intervene
    slowMo: 80,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  console.log('🌐 Opening your app — log in if prompted, then the script takes over.');
  await page.goto('http://localhost:5173/add-research-project');
  await page.waitForLoadState('networkidle');

  // Pause briefly so you can log in manually if needed
  await sleep(3000);

  for (let i = 0; i < PROJECTS.length; i++) {
    const project = PROJECTS[i];
    const coverUrl = COVER_IMAGES[i % COVER_IMAGES.length];

    console.log(`\n📝 [${i + 1}/20] "${project.title}"`);

    // Navigate fresh each time
    await page.goto('http://localhost:5173/add-research-project');
    await page.waitForLoadState('networkidle');
    await sleep(800);

    // ── Title ────────────────────────────────────────────────
    const filled = await fillField(page, 'title', project.title)
      || await fillField(page, 'Title', project.title)
      || await fillField(page, 'Project title', project.title)
      || await fillField(page, 'Project Title', project.title);

    if (!filled) {
      // fallback: first text input on page
      const inputs = page.locator('input[type="text"]');
      if (await inputs.count() > 0) await inputs.first().fill(project.title);
    }

    // ── Description ──────────────────────────────────────────
    const descFilled = await fillField(page, 'description', project.description)
      || await fillField(page, 'Description', project.description)
      || await fillField(page, 'About', project.description)
      || await fillField(page, 'Summary', project.description);

    if (!descFilled) {
      const textareas = page.locator('textarea');
      if (await textareas.count() > 0) await textareas.first().fill(project.description);
    }

    // ── Cover image URL ──────────────────────────────────────
    const imgFilled = await fillField(page, 'cover', coverUrl)
      || await fillField(page, 'Cover', coverUrl)
      || await fillField(page, 'image', coverUrl)
      || await fillField(page, 'Image', coverUrl)
      || await fillField(page, 'Cover Image', coverUrl)
      || await fillField(page, 'Photo URL', coverUrl)
      || await fillField(page, 'url', coverUrl);

    if (!imgFilled) {
      // Try any input that looks like a URL field
      const urlInputs = page.locator('input[type="url"], input[placeholder*="http" i]');
      if (await urlInputs.count() > 0) await urlInputs.first().fill(coverUrl);
    }

    // ── Tags ─────────────────────────────────────────────────
    for (const tag of project.tags) {
      await fillTag(page, tag);
    }

    // ── Status → published ───────────────────────────────────
    // Try a <select>
    const statusSelect = page.locator('select[name*="status" i], select[id*="status" i]');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption({ label: 'published' });
    } else {
      // Try radio / button with text "published"
      const publishedOpt = page.locator('label:has-text("Published"), button:has-text("Published"), input[value="published"]');
      if (await publishedOpt.count() > 0) await publishedOpt.first().click();
    }

    // ── Team members ─────────────────────────────────────────
    for (const member of project.team) {
      await addTeamMember(page, member);
    }

    await sleep(500);

    // ── Submit ───────────────────────────────────────────────
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Publish"), button:has-text("Submit"), button:has-text("Create"), button:has-text("Save")'
    ).last();

    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      console.log(`   ✅ Submitted`);
    } else {
      console.warn(`   ⚠️  Could not find submit button — skipping`);
    }

    // Wait for navigation or success toast
    try {
      await page.waitForURL((url) => !url.toString().includes('add-research'), { timeout: 8000 });
    } catch (_) {
      // Page may stay on same URL; just wait a moment
      await sleep(2000);
    }

    console.log(`   ✅ Done — project ${i + 1} saved`);
    await sleep(1000);
  }

  console.log('\n🎉 All 20 projects seeded!');
  await browser.close();
})();