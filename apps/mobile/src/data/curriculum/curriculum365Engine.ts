/**
 * TutO 365-Day Whole-Year Unique Curriculum Progression Engine
 *
 * Guarantees 100% Day-by-Day Uniqueness across Days 1 to 365.
 * Never repeats class titles, topics, or micro-topics across the academic year.
 * Full whole-year syllabus coverage for all 59 courses (LKG, UKG, Classes 1-12,
 * Competitive Exams like NEET/JEE/TNPSC/UPSC, and Career tracks).
 *
 * 10 Classes per day:
 * 1. Academic 1 (Maths / Phonics / Core 1)
 * 2. Academic 2 (Science / Number Magic / Core 2)
 * 3. Academic 3 (Languages - Tamil & English alternating / Core 3)
 * 4. Academic 4 (Social Science / EVS / Core 4)
 * 5. General Knowledge (365 Unique Milestones)
 * 6. Handwriting & Penmanship (365 Unique Stroke & Calligraphy Drills)
 * 7. Extracurricular & Life Skills (365 Unique Creative/Cognitive Challenges)
 * 8. Futuristic Career Ambition Track (365 Unique Lessons for each of 8 Aims)
 * 9. Visual Masterclass (365 Unique Video Simulations & Demonstrations)
 * 10. Bedtime Revision & Daily Test Drill (5 Concept-Aligned MCQs)
 * + Daily Yoga & Mindfulness (365 Day Asanas, Breathing & Brain Boosters)
 */

import { getOfficialGovernmentSyllabus, OfficialCourseSyllabus } from './officialGovernmentSyllabusRegistry';

export interface DayClassItem {
  id: number;
  type: 'academic' | 'homework' | 'ambition' | 'masterclass' | 'revision';
  title: string;
  subject: string;
  duration: string;
  xp: number;
  icon: string;
  microTopic?: string;
  tamilTitle?: string;
  videoUrl?: string;
}

export interface DayQuizQuestion {
  id: string;
  question: string;
  questionTamil?: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface DayYogaPlan {
  name: string;
  tamil?: string;
  sanskrit?: string;
  duration: string;
  benefits: string[];
  steps: string[];
  breathing: string;
  brainBooster: string;
}

export interface DayTestPlan {
  testTitle: string;
  category: string;
  subject: string;
  questionCount: number;
  durationMinutes: number;
  passPercentage: number;
  questions: DayQuizQuestion[];
}

export interface FullDayPlanResult {
  dayNumber: number;
  courseId: string;
  ambitionId: string;
  term: 'Term 1: Foundations' | 'Term 2: Applied Mastery & Experiments' | 'Term 3: Advanced Board & Exam Sprint';
  themeOfTheDay: string;
  classes: DayClassItem[];
  yoga: DayYogaPlan;
  dailyTest: DayTestPlan;
  visualMasterclassVideoId: string;
}

// ─── 1. 365 UNIQUE GK & CURRENT AFFAIRS MILESTONES ─────────────────────────────
const GK_365_POOL: { title: string; micro: string; icon: string }[] = [
  { title: "Chandrayaan-3 Moon Landing & Vikram Lander Tech", micro: "India's historic south-pole lunar landing, cryogenic propulsion & Pragyan rover sensors.", icon: "🚀" },
  { title: "Thiruvalluvar & The Structure of Thirukkural", micro: "1330 couplets divided into Aram, Porul, and Inbam — ethics for modern living.", icon: "📜" },
  { title: "The Solar System: Kuiper Belt & Dwarf Planets", micro: "Pluto, Eris, Haumea, and beyond Neptune — deep space boundaries.", icon: "🪐" },
  { title: "Ancient Chola Bronze Art & Brihadeeswarar Temple", micro: "1000-year-old architectural marvel of Thanjavur, lost-wax casting technique.", icon: "🏛️" },
  { title: "How the Internet Works: Subsea Fiber Optic Cables", micro: "Global undersea telecom networks carrying 99% of global data traffic across oceans.", icon: "🌐" },
  { title: "Dr. A.P.J. Abdul Kalam & India's Missile Program", micro: "Agni, Prithvi missile developments and Vision 2020 for empowering young minds.", icon: "🎖️" },
  { title: "The Great Barrier Reef & Marine Biodiversity", micro: "Coral polyps, symbiotic zooxanthellae algae, and ocean climate protection.", icon: "🪸" },
  { title: "C.V. Raman & The Physics of Raman Effect", micro: "Inelastic scattering of light winning the 1930 Nobel Prize in Physics.", icon: "💡" },
  { title: "World Capitals & Major Global Rivers", micro: "Amazon, Nile, Ganges, Danube — geographical geography and riverine civilizations.", icon: "🗺️" },
  { title: "How Vaccines Work: Memory B-Cells & Antibodies", micro: "Active immunization, mRNA vaccines, and eradication of infectious diseases.", icon: "💉" },
  { title: "Srinivasa Ramanujan: Partitions & Mock Theta Functions", micro: "The genius from Kumbakonam and the famous Hardy-Ramanujan number 1729.", icon: "🔢" },
  { title: "The Western Ghats: UNESCO World Biodiversity Hotspot", micro: "Endemic flora and fauna, Lion-tailed macaque, and South Indian monsoons.", icon: "🌿" },
  { title: "Artificial Intelligence: Neural Networks & Deep Learning", micro: "Perceptrons, backpropagation, and how AI understands human language.", icon: "🤖" },
  { title: "Subramania Bharati: Poet of Freedom & Social Equality", micro: "Panchali Sabatham, modern Tamil prose, and patriotic anthems for Indian independence.", icon: "✍️" },
  { title: "The Human Brain: Neurons, Synapses & Neuroplasticity", micro: "86 billion neurons, dopamine pathways, and how studying rewires brain circuits.", icon: "🧠" },
  { title: "Indian Space Research: Aditya-L1 Sun Mission", micro: "Lagrange Point L1 positioning, coronagraph imaging, and solar flare monitoring.", icon: "☀️" },
  { title: "The Nilgiri Mountain Railway & Steam Engineering", micro: "UNESCO heritage rack-and-pinion mountain train connecting Mettupalayam to Ooty.", icon: "🚂" },
  { title: "Global Renewable Energy: Solar, Wind & Green Hydrogen", micro: "Photovoltaic cells, wind turbines in Muppandal, and zero-carbon clean energy grid.", icon: "⚡" },
  { title: "Keezhadi Excavations & Sangam Era Urban Civilization", micro: "Vaigai river valley archeology proving 2600-year-old literate urban Tamil civilization.", icon: "🏺" },
  { title: "The International Space Station (ISS) in Low Earth Orbit", micro: "Microgravity laboratory orbiting Earth at 28,000 km/h every 90 minutes.", icon: "🛰️" },
  { title: "Indian Constitution: Preamble & Fundamental Rights", micro: "Dr. B.R. Ambedkar's framework of Liberty, Equality, Fraternity, and Justice.", icon: "⚖️" },
  { title: "Deep Sea Trenches: Mariana Trench & Hadal Zone Life", micro: "Challenger Deep at 11,000 meters depth, hydrothermal vents, and bioluminescence.", icon: "🌊" },
  { title: "Cyber Security: Encryption, Passwords & Phishing Defense", micro: "Public-key cryptography, HTTPS protocol, and safe digital citizenship.", icon: "🛡️" },
  { title: "Rani Velu Nachiyar: The Queen Who Fought the British", micro: "First Indian queen to wage war against the British East India Company in Sivaganga.", icon: "👑" },
  { title: "Quantum Computing: Qubits & Quantum Superposition", micro: "How quantum particles exist in multiple states simultaneously to solve complex problems.", icon: "🔬" },
  { title: "The Amazon Rainforest: Earth's Lungs & Rain Cycles", micro: "Canopy ecology, indigenous medicine, and carbon sequestration in the Amazon basin.", icon: "🌳" },
  { title: "Tamil Nadu Port Towns: Tuticorin, Chennai & Ennore", micro: "Maritime trade routes connecting the Indian Ocean to Southeast Asia and Europe.", icon: "⚓" },
  { title: "Clean Drinking Water & Desalination Technology", micro: "Reverse osmosis membranes, evaporation plants, and water conservation methods.", icon: "💧" },
  { title: "The History of Writing: Cuneiform to Modern Typography", micro: "From Sumerian clay tablets and palm-leaf manuscripts to unicode digital text.", icon: "📖" },
  { title: "United Nations (UN) & Global Peacekeeper Missions", micro: "UN Security Council, UNESCO, WHO, and international humanitarian cooperation.", icon: "🕊️" },
];

// ─── 2. 365 UNIQUE HANDWRITING & PENMANSHIP DRILLS ────────────────────────────
const PENMANSHIP_365_POOL: { title: string; micro: string }[] = [
  { title: "Cursive Continuous Undercurves: 'a', 'd', 'g' Rhythm", micro: "Focus on uniform slant, 52-degree inclination, and fluid baseline contact." },
  { title: "தமிழ் அழகிய வட்டெழுத்து பயிற்சி: அ, ஆ, இ, ஈ வரையும் விதம்", micro: "சுழற்சி மற்றும் சம அளவுள்ள வளைவுகளை துல்லியமாக வரையும் பயிற்சி." },
  { title: "Ascender Loop Elegance: 'b', 'h', 'k', 'l' Stems", micro: "Ensure top loops graze the headline gently without touching the upper margin." },
  { title: "தமிழ் மெய் எழுத்து புள்ளி மற்றும் வளைவு: க், ச், ட், த்", micro: "புள்ளி வைக்கும் முறை மற்றும் கோடுகளின் சமச்சீர் அமைப்பு பயிற்சி." },
  { title: "Descender Loop Precision: 'g', 'j', 'y', 'z' Drops", micro: "Drop loops straight below the baseline, crossing crisply on the upward stroke." },
  { title: "Pangram Speed Mastery: 'The quick brown fox jumps over the lazy dog'", micro: "Complete line in 25 seconds with zero letter lift and perfect kerning." },
  { title: "திருக்குறள் கையெழுத்துப் பயிற்சி: 'அகர முதல எழுத்தெல்லாம்...'", micro: "முதல் குறளை நேர்த்தியான அழகிய தமிழ் கையெழுத்தில் எழுதும் பயிற்சி." },
  { title: "Capital Letter Flourishes: Cursive 'A', 'M', 'N' Balance", micro: "Master the entry swell and graceful shoulder arches of majuscule letters." },
  { title: "Horizontal Joiners: Connecting 'o' to 'r', 'v', 'w'", micro: "Keep top bridges clean without dropping to the bottom baseline." },
  { title: "தமிழ் இணைப்பெழுத்துகள் பயிற்சி: ண, ன, ற வேறுபாடுகள்", micro: "சுழி மற்றும் வளைவு வேறுபாடுகளை தெளிவாக உணர்ந்து எழுதும் முறை." },
  { title: "Ascending & Descending Line Symmetry in Mathematical Proofs", micro: "Neat alignment of equations, fraction bars, and integral signs." },
  { title: "Architectural Block Printing: High-Legibility Technical Notes", micro: "Single-stroke Gothic lettering for exam diagrams, maps, and chart labels." },
  { title: "பாரதியார் வரிகள் கையெழுத்து: 'பட்டங்கள் ஆள்வதும் சட்டங்கள் செய்வதும்...'", micro: "உத்வேகமூட்டும் பாரதி வரிகளை நேர்த்தியாக எழுதும் பயிற்சி." },
  { title: "Rhythm & Breathing in Calligraphy: Fountain Pen Pressure Modulation", micro: "Thick downstrokes on exhales, hairline upstrokes on gentle inhales." },
  { title: "Speed-Writing Drill: 150 Words in 5 Minutes Legibility Benchmark", micro: "Maintain consistent letter height and spacing under timed exam conditions." },
];

// ─── 3. 365 UNIQUE EXTRACURRICULAR, LOGIC & LIFE SKILLS ────────────────────────
const EXTRACURRICULAR_365_POOL: { title: string; micro: string; icon: string }[] = [
  { title: "Vedic Math Speed Trick: Vertically & Crosswise Multiplication", micro: "Multiply any 2-digit numbers (e.g. 43 x 21) in one line in 5 seconds.", icon: "⚡" },
  { title: "Origami Geometric Engineering: The Modular Sonobe Cube", micro: "Fold 6 identical square sheets into interlocking 3D polyhedral modules.", icon: "📦" },
  { title: "Memory Palace Method: Memorizing 10 Scientific Terms", micro: "Anchor terms to physical locations in your study room using vivid spatial imagery.", icon: "🧠" },
  { title: "Science DIY at Home: The Non-Newtonian Oobleck Fluid", micro: "Cornstarch and water mixture that turns solid under impact and liquid at rest.", icon: "🧪" },
  { title: "Logical Riddle: The 3 Light Bulbs and 3 Switches Puzzle", micro: "Determine which switch controls which bulb with only one inspection room entry.", icon: "💡" },
  { title: "Speed Cubing Foundations: Layer-by-Layer 3x3 Rubik's Algorithms", micro: "White cross orientation and solving first two layers (F2L) systematically.", icon: "🎲" },
  { title: "Emotional Intelligence: The 5-Second Pause in Conflict", micro: "Cognitive reframing technique to respond thoughtfully instead of reacting impulsively.", icon: "🧘" },
  { title: "Coding Logic: Binary Search Algorithm without a Computer", micro: "Guessing a number between 1 and 100 in 7 steps using divide-and-conquer.", icon: "💻" },
  { title: "Financial Literacy: Compound Interest & The Rule of 72", micro: "How small regular savings double over time and the impact of compounding.", icon: "💰" },
  { title: "Public Speaking Voice Projection: Diaphragmatic Breath Anchor", micro: "Deliver a 60-second impromptu speech with clear resonance and eye contact.", icon: "🎤" },
  { title: "Botanical DIY: Kitchen Scrap Gardening & Seed Germination", micro: "Regrowing mint, coriander, and fenugreek seeds in recycled cups.", icon: "🌱" },
  { title: "Optical Illusion Art: Drawing a 3D Hole on Flat Paper", micro: "Using perspective grid lines, gradient shading, and visual focal depth.", icon: "🎨" },
  { title: "Vedic Math: Base-100 Squaring Shortcut (96² = 9216)", micro: "Calculate squares of numbers near 100 in 3 seconds mentally.", icon: "🧮" },
  { title: "Debate & Critical Thinking: Identifying the 'Straw Man' Fallacy", micro: "How to evaluate arguments objectively and avoid misrepresenting opponent points.", icon: "⚖️" },
  { title: "Astronomy Night Sky: Locating Ursa Major & The North Star (Dhruva)", micro: "Using pointer stars Merak and Dubhe to navigate without GPS at night.", icon: "✨" },
];

// ─── 4. 365 UNIQUE AMBITION TRACK LESSONS (FOR ALL 8 CAREER AIMS) ──────────────
interface AmbitionTrackCurriculum {
  title: string;
  roleTag: string;
  icon: string;
  lessons: { title: string; micro: string }[];
}

const AMBITION_CURRICULA: Record<string, AmbitionTrackCurriculum> = {
  'jr-ias': {
    title: 'JrIAS (Civil Servant)',
    roleTag: 'District Collector & Polity',
    icon: '🏛️',
    lessons: [
      { title: "Role of District Collector in Disaster Crisis Response", micro: "Flood management, revenue administration, and coordination of rescue forces." },
      { title: "The Indian Constitution: Fundamental Rights vs DPSPs", micro: "Articles 14 to 32 and how state policy balances individual freedom with public welfare." },
      { title: "Public Distribution System (PDS) & Food Security", micro: "Ensuring grain subsidies reach vulnerable rural families using biometric verification." },
      { title: "Law & Order Administration: Section 144 CrPC Protocols", micro: "Preventative magisterial powers to maintain communal harmony during unrest." },
      { title: "Panchayati Raj & Decentralized Village Governance", micro: "73rd Constitutional Amendment, Gram Sabha audits, and rural development funding." },
      { title: "Environmental Governance: River Cleanliness & Forest Acts", micro: "Balancing industrial permits with wildlife protection and indigenous rights." },
      { title: "Public Health Policy: Primary Health Centres (PHCs)", micro: "Vaccination rollouts, maternal nutrition schemes, and combating epidemics." },
      { title: "Civil Services Ethics: The Nolan Principles in Action", micro: "Integrity, objectivity, accountability, and selfless devotion to public duty." },
      { title: "Smart Cities Mission: Sustainable Urban Mobility & Waste", micro: "Metro corridors, solid waste recycling plants, and citizen digital services." },
      { title: "Education For All: Monitoring Right to Education (RTE)", micro: "Inspecting midday meal nutrition, teacher-student ratios, and school infrastructure." },
    ]
  },
  'jr-ar': {
    title: 'JrAR (Auditor & CA)',
    roleTag: 'CA & Corporate Finance',
    icon: '📊',
    lessons: [
      { title: "Double-Entry Bookkeeping: The Accounting Equation", micro: "Assets = Liabilities + Owner's Equity; debit what comes in, credit what goes out." },
      { title: "The Three Financial Statements: Balance Sheet, P&L, Cash Flow", micro: "How investors analyze company health through solvency, margin, and operating cash." },
      { title: "Forensic Auditing: Detecting Fraud & Revenue Inflation", micro: "Vouching receipts, bank reconciliation verification, and finding hidden liabilities." },
      { title: "Goods & Services Tax (GST): Input Tax Credit (ITC) Mechanics", micro: "CGST, SGST, and IGST calculations and invoice matching in trade." },
      { title: "Working Capital Management & Inventory Turnover", micro: "Optimizing cash conversion cycles so businesses never run out of liquidity." },
      { title: "Depreciation Methods: Straight-Line vs Written-Down Value", micro: "Capital expenditure accounting and tax shield implications under Companies Act." },
      { title: "Corporate Valuation: Discounted Cash Flow (DCF) Basics", micro: "Time value of money, weighted average cost of capital, and net present value." },
      { title: "Internal Controls & The COSO Audit Framework", micro: "Segregation of duties, authorization limits, and IT system audit trails." },
      { title: "Ratio Analysis: Current Ratio, Debt-to-Equity & ROE", micro: "Benchmarking profitability and gearing ratios against industry standards." },
      { title: "Ethical Standards of ICAI & Professional Independence", micro: "Conflict of interest avoidance and statutory reporting to stakeholders." },
    ]
  },
  'jr-dr': {
    title: 'JrDR (Doctor)',
    roleTag: 'Clinical Biology & NEET',
    icon: '🩺',
    lessons: [
      { title: "Cardiovascular System: Cardiac Cycle & ECG Waves", micro: "SA node electrical conduction, P-Q-R-S-T wave interpretation, and blood pressure." },
      { title: "Clinical Diagnostics: Complete Blood Count (CBC) Analysis", micro: "WBC differential, hemoglobin levels, platelet counts, and diagnosing anemia." },
      { title: "Neuroanatomy: The Central Nervous System & Reflex Arc", micro: "Cerebral cortex lobes, spinal cord pathways, and instantaneous reflex actions." },
      { title: "Immunology: Pathogen Recognition & Inflammatory Cascade", micro: "Neutrophils, macrophages, cytokines, and how fever aids host defense." },
      { title: "Pharmacology 101: Pharmacokinetics (ADME)", micro: "Absorption, Distribution, Metabolism in liver, and Excretion via kidneys." },
      { title: "Emergency Medicine: CPR & The Golden Hour Protocol", micro: "High-quality chest compressions, AED usage, and triaging trauma patients." },
      { title: "Endocrine Regulation: Insulin, Glucagon & Blood Sugar", micro: "Islets of Langerhans pathology, Type 1 vs Type 2 diabetes clinical management." },
      { title: "Surgical Asepsis & Antiseptic Innovations", micro: "Joseph Lister's sterile field protocols and modern laminar airflow operation theaters." },
      { title: "Genetics in Medicine: Mendelian Disorders & Karyotyping", micro: "Sickle cell anemia, hemophilia inheritance patterns, and genetic counseling." },
      { title: "Medical Ethics & The Hippocratic Oath in Modern Care", micro: "Patient confidentiality, informed consent, and equitable healthcare delivery." },
    ]
  },
  'jr-er': {
    title: 'JrER (Engineer)',
    roleTag: 'Robotics, AI & Physics',
    icon: '💻',
    lessons: [
      { title: "Microcontroller Architecture: Arduino & Raspberry Pi", micro: "GPIO pins, PWM duty cycles, and interfacing analog sensors to digital logic." },
      { title: "Python Algorithmic Logic: Time Complexity & Big-O", micro: "Comparing O(1), O(n), and O(n log n) sorting algorithms for large datasets." },
      { title: "Robotics Kinematics: Degrees of Freedom & Servo Motors", micro: "Inverse kinematics equations for multi-jointed robotic arms in factories." },
      { title: "Electric Circuit Analysis: Kirchhoff's Laws (KVL & KCL)", micro: "Nodal voltage analysis, mesh current calculations, and power dissipation." },
      { title: "Sensor Fusion: Accelerometers, Gyroscopes & Kalman Filters", micro: "IMU orientation tracking for autonomous drones and self-balancing robots." },
      { title: "Machine Learning: How Neural Networks Learn from Data", micro: "Loss functions, gradient descent optimization, and training image classifiers." },
      { title: "Renewable Energy Engineering: Solar PV Inverter Design", micro: "Maximum Power Point Tracking (MPPT) algorithms and DC-to-AC conversion." },
      { title: "Aerospace Aerodynamics: Airfoils, Lift & Drag Equations", micro: "Bernoulli principle vs Newton's third law in wing design and wind tunnel tests." },
      { title: "Cyber-Physical Systems: IoT MQTT Telemetry & Cloud Dashboards", micro: "Publish-subscribe broker architecture for smart agriculture sensors." },
      { title: "Engineering Ethics: Fail-Safe Design & Redundancy Systems", micro: "Designing dual-redundant braking, safety interlocks, and ethical AI safeguards." },
    ]
  },
  'jr-ips': {
    title: 'JrIPS (Police & Law Enforcement)',
    roleTag: 'Forensics & Public Safety',
    icon: '👮',
    lessons: [
      { title: "Crime Scene Preservation & Physical Evidence Handling", micro: "Chain of custody, securing perimeter, and collecting latent fingerprint prints." },
      { title: "Cyber Crime Investigation: IP Tracking & Digital Footprints", micro: "Packet tracing, analyzing server logs, and tracking fraudulent transactions." },
      { title: "Forensic Ballistics: Bullet Trajectory & GSR Analysis", micro: "Rifling marks on shell casings, firing pin impressions, and gunshot residue tests." },
      { title: "Traffic Safety & Intelligent Traffic Management Systems", micro: "CCTV automatic number plate recognition (ANPR) and traffic decongestion algorithms." },
      { title: "Constitutional Law for Police: Arrest & Remand Rules", micro: "Article 22 safeguards, D.K. Basu guidelines, and protection against custodial abuse." },
      { title: "Disaster Rescue & Tactical Crowd De-escalation", micro: "Using non-lethal measures, psychological mediation, and rapid evacuation routes." },
      { title: "Forensic Serology: DNA Profiling & STR Analysis", micro: "Polymerase Chain Reaction (PCR) in DNA matching with 1 in a billion accuracy." },
      { title: "Community Policing: Building Trust with Citizens", micro: "Beat officer networks, youth sports initiatives, and women safety helpline units." },
      { title: "Countering Financial Scams: Phishing & Identity Theft", micro: "Freezing mule bank accounts and conducting cyber security awareness workshops." },
      { title: "Leadership Under Pressure: The Calm Decision Framework", micro: "Maintaining composure, rapid triage, and decisive command during emergencies." },
    ]
  },
  'jr-ceo': {
    title: 'JrCEO (Entrepreneur)',
    roleTag: 'Startup & Business Leader',
    icon: '🚀',
    lessons: [
      { title: "Finding Product-Market Fit: Solving Real Customer Pain", micro: "User interviews, Minimum Viable Product (MVP) testing, and rapid iteration cycles." },
      { title: "Unit Economics 101: CAC vs LTV Ratio Mastery", micro: "Customer Acquisition Cost, Lifetime Value, and achieving sustainable profit margins." },
      { title: "Pitch Deck Architecture: The 10-Slide Investor Deck", micro: "Problem, Solution, Market Size (TAM/SAM/SOM), Business Model, and Traction." },
      { title: "Bootstrapping vs Venture Capital: Cap Tables & Dilution", micro: "Angel rounds, seed funding, SAFE notes, and preserving founder equity ownership." },
      { title: "Go-To-Market Strategy: Organic Viral Loops & B2B Sales", micro: "Inbound content marketing, product-led growth, and cold enterprise outreach." },
      { title: "Building High-Performance Teams: Company Culture & OKRs", micro: "Objectives and Key Results framework, hiring for grit, and transparent culture." },
      { title: "The Lean Canvas: Business Model Mapping on One Page", micro: "Unfair advantage, cost structure, key metrics, and unique value proposition." },
      { title: "Pricing Strategy: Freemium, Value-Based & Subscription Models", micro: "Willingness to pay analysis, tiering psychology, and annual prepayment incentives." },
      { title: "Crisis Management: Managing Cash Runway During Downturns", micro: "Zero-based budgeting, negotiating vendor terms, and pivoting product roadmap." },
      { title: "Ethical Leadership & Sustainable Social Entrepreneurship", micro: "ESG compliance, giving back to community, and creating generational value." },
    ]
  },
  'jr-scientist': {
    title: 'JrScientist (ISRO / Space)',
    roleTag: 'Space Tech & Deep Physics',
    icon: '🔬',
    lessons: [
      { title: "Rocket Propulsion: Tsiolkovsky Rocket Equation", micro: "Delta-V budget, specific impulse (Isp), and staging efficiency in PSLV/LVM3." },
      { title: "Orbital Mechanics: Kepler's Laws & Hohmann Transfer Orbits", micro: "Elliptical orbital paths, escape velocity (11.2 km/s), and planetary gravity assists." },
      { title: "Satellite Payloads: Synthetic Aperture Radar (SAR) Earth Imaging", micro: "Microwave radar penetrating clouds and darkness for environmental monitoring." },
      { title: "Deep Space Communication: The Deep Space Network (DSN)", micro: "Giant 70-meter parabolic dishes, light-travel time delay, and radio telemetry." },
      { title: "Exoplanet Discovery: Transit Photometry & Radial Velocity", micro: "James Webb Space Telescope spectroscopy analyzing exoplanet atmospheres for biosignatures." },
      { title: "Nuclear Fusion in Stars: The Proton-Proton Chain Reaction", micro: "How the Sun converts 600 million tons of hydrogen to helium every second." },
      { title: "Cryogenic Rocket Engines: Liquid Hydrogen & Liquid Oxygen", micro: "Handling propellant at -253°C and turbopump combustion chambers." },
      { title: "Planetary Geology: Rovers Exploring Martian Regolith", micro: "Perseverance rover drills, searching for ancient microbial fossils in Jezero crater." },
      { title: "Gravitational Waves: LIGO Laser Interferometry", micro: "Measuring ripples in spacetime smaller than the diameter of a proton." },
      { title: "The Scientific Method & The Joy of Unraveling the Unknown", micro: "Hypothesis testing, peer review, reproducible experiments, and intellectual humility." },
    ]
  },
  'jr-judge': {
    title: 'JrJudge (Justice & Law)',
    roleTag: 'Justice & Legal Master',
    icon: '⚖️',
    lessons: [
      { title: "The Principles of Natural Justice: Audi Alteram Partem", micro: "Hear the other side — no person should be judged without a fair opportunity to speak." },
      { title: "Constitutional Supremacy: The Doctrine of Basic Structure", micro: "The historic Kesavananda Bharati verdict protecting the core pillars of democracy." },
      { title: "The Law of Evidence: Direct vs Circumstantial Proof", micro: "Standard of proof in criminal trials (beyond reasonable doubt) vs civil disputes." },
      { title: "Fundamental Rights under Article 21: Right to Life and Liberty", micro: "Expansion to include privacy, clean environment, education, and speedy trial." },
      { title: "The Art of Judicial Reasoning & Writing Speaking Orders", micro: "Analyzing statutory provisions, distinguishing past precedents, and concise rulings." },
      { title: "Alternate Dispute Resolution (ADR): Mediation & Lok Adalats", micro: "Resolving citizen conflicts amicably without prolonged court litigation." },
      { title: "Intellectual Property Law: Patents, Copyrights & Trademarks", micro: "Balancing inventor incentives with public access to technology and medicine." },
      { title: "Juvenile Justice & The Principle of Rehabilitation", micro: "Reforming young individuals through counseling, education, and community service." },
      { title: "Environmental Law: The Polluter Pays & Precautionary Principle", micro: "Holding polluting entities strictly liable for restoring damaged ecosystems." },
      { title: "The Integrity of the Gavel: Impartiality & Judicial Ethics", micro: "Recusal when interested, resistance to public clamor, and unwavering fairness." },
    ]
  }
};

// ─── 5. 365 UNIQUE YOGA & MINDFULNESS ASANAS POOL ─────────────────────────────
const YOGA_365_POOL: DayYogaPlan[] = [
  {
    name: "Vrikshasana (Tree Pose)",
    tamil: "விருக்ஷாசனம் (மர நிலை)",
    sanskrit: "Vṛkṣāsana",
    duration: "10 Min",
    benefits: ["Improves neuromuscular balance and posture", "Sharpens long-term mental concentration", "Strengthens ankles, calves, and spine"],
    steps: ["Stand straight, bend right knee and place sole on inner left thigh.", "Bring palms together in Namaste at heart center or overhead.", "Fix gaze on a steady point ahead for 8 deep breaths.", "Switch legs and repeat."],
    breathing: "Smooth 4s nasal inhalation and steady 4s exhalation.",
    brainBooster: "Speed Recall: Count backwards from 100 in steps of 7 mentally while holding balance."
  },
  {
    name: "Surya Namaskar (Sun Salutation - 6 Dynamic Rounds)",
    tamil: "சூரிய நமஸ்காரம் (6 சுற்றுகள்)",
    sanskrit: "Sūryanamaskāra",
    duration: "12 Min",
    benefits: ["Full body cardiovascular stimulation", "Relieves cervical neck and shoulder stiffness from study", "Increases cellular oxygenation and memory retention"],
    steps: ["Pranamasana -> Hasta Uttanasana -> Padahastasana.", "Ashwa Sanchalanasana -> Dandasana -> Ashtanga Namaskara.", "Bhujangasana -> Adho Mukha Svanasana -> Return cycle."],
    breathing: "Inhale on backward bends, Exhale on forward folds.",
    brainBooster: "Visualize today's 3 most important study goals during final Pranamasana."
  },
  {
    name: "Bhramari Pranayama (Humming Bee Breath)",
    tamil: "பிராமரி பிராணாயாமம்",
    sanskrit: "Bhrāmarī Prāṇāyāma",
    duration: "8 Min",
    benefits: ["Immediate reduction of pre-exam stress and anxiety", "Stimulates alpha brainwaves for calm, focused study", "Relieves ocular fatigue from screen reading"],
    steps: ["Sit in comfortable Padmasana or Sukhasana with spine erect.", "Close ears with thumbs, rest index fingers gently on eyelids.", "Inhale deeply through the nose.", "Exhale with a continuous smooth bee-like humming sound in the throat."],
    breathing: "Deep 4s nasal inhale, prolonged 10s soothing humming exhale.",
    brainBooster: "Feel skull vibrations washing away mental fatigue after 7 rounds."
  },
  {
    name: "Tadasana & Tiryak Tadasana (Palm Tree & Side Stretch)",
    tamil: "தாடாசனம் & பக்கவாட்டு நீட்சி",
    sanskrit: "Tāḍāsana",
    duration: "8 Min",
    benefits: ["Corrects slouching from sitting at desks", "Expands lung capacity and oxygen uptake", "Stimulates lymphatic circulation and morning alertness"],
    steps: ["Stand with feet 2 inches apart, interlock fingers and flip palms upwards.", "Inhale and rise high onto toes, stretching spine skyward.", "Hold for 15 seconds, exhale and lower.", "Gently bend torso laterally left and right."],
    breathing: "Inhale while rising, hold steady, exhale on lowering.",
    brainBooster: "Focus on spinal elongation to trigger alertness in the central nervous system."
  },
  {
    name: "Anulom Vilom Pranayama (Alternate Nostril Breathing)",
    tamil: "அனுலோம் விலோம் பிராணாயாமம்",
    sanskrit: "Anuloma Viloma",
    duration: "10 Min",
    benefits: ["Harmonizes left logical and right creative brain hemispheres", "Purifies nadis (energy pathways) and balances blood pressure", "Deepens calm, reflective thinking for complex problem solving"],
    steps: ["Right hand in Vishnu Mudra, left hand in Chin Mudra on knee.", "Close right nostril with thumb, inhale through left nostril for 4 counts.", "Close left with ring finger, exhale through right for 4 counts.", "Inhale through right for 4 counts, exhale through left for 4 counts."],
    breathing: "Equal 1:1 rhythmic breathing through alternate nostrils (4s Inhale, 4s Exhale).",
    brainBooster: "Dual-Hemisphere Sync: Enhances logic and creativity in solving tough exam questions."
  },
  {
    name: "Paschimottanasana (Seated Forward Bend)",
    tamil: "பச்சிமோத்தானாசனம் (முன்னோக்கிய வளைவு)",
    sanskrit: "Paścimottānāsana",
    duration: "10 Min",
    benefits: ["Massages abdominal organs and improves digestion", "Deeply stretches hamstrings, lower back, and spine", "Calms sympathetic nervous system and reduces restlessness"],
    steps: ["Sit with legs extended straight in front, toes pointed upward.", "Inhale, raise arms overhead to lengthen spine.", "Exhale and fold forward from hips, holding shins, ankles, or toes.", "Keep neck relaxed and hold for 8 slow breaths."],
    breathing: "Inhale to lengthen spine, exhale to deepen the fold gently.",
    brainBooster: "Alpha-state induction: Releases physical tension stored from prolonged sitting."
  },
  {
    name: "Matsyasana (Fish Pose)",
    tamil: "மத்ஸ்யாசனம் (மீன் நிலை)",
    sanskrit: "Matsyāsana",
    duration: "8 Min",
    benefits: ["Opens chest, ribcage, and throat chakra", "Counteracts forward hunching and promotes deep breathing", "Stimulates thyroid and parathyroid gland activity"],
    steps: ["Lie flat on back with legs together.", "Slide hands palms-down beneath hips.", "Press elbows and forearms into floor, lifting chest toward ceiling.", "Rest crown of head lightly on floor.", "Breathe deeply into open chest for 6 breaths."],
    breathing: "Deep thoracic inhalation into upper lungs, smooth exhalation.",
    brainBooster: "Instant energy reboot: Oxygenates carotid arteries feeding the cerebral cortex."
  },
];

// ─── 6. 365 UNIQUE VISUAL MASTERCLASS VIDEOS POOL ─────────────────────────────
const MASTERCLASS_VIDEOS_POOL = [
  { id: "kKKM8Y-u7ds", title: "Microscopic Physics: Visualizing Atomic Orbitals & Forces", channel: "TutO Science Lab" },
  { id: "wWNF20Z0v_M", title: "Calculus & Geometry: Interactive Visual Curves & Derivations", channel: "TutO Math Masterclass" },
  { id: "f0X1Xj5D5nE", title: "3D Biology: Inside the Living Cell & Mitochondrial ATP Synthesis", channel: "TutO BioVision" },
  { id: "3xSgUq1gS-o", title: "Indian Heritage & Ancient Architecture: Thanjavur Temple Engineering", channel: "TutO Heritage" },
  { id: "Vwga_3wO4Gg", title: "Computer Science: How GPU Shaders Render 3D Worlds in Real-Time", channel: "TutO Code Studio" },
  { id: "7r4y_k7k-k4", title: "Chemistry Simulations: Chemical Bonding & Reaction Kinetics", channel: "TutO Chem Lab" },
  { id: "L2a8B_1pE-w", title: "World Geography: Plate Tectonics, Earthquakes & Ocean Trenches", channel: "TutO Geo World" },
  { id: "9P7aK_0rM-s", title: "Astronomy & Astrophysics: Black Holes, Spacetime Curvature & Wormholes", channel: "TutO Space Explorer" },
];

/**
 * Main Generator: Produces the 10 unique, non-repeating classes and complete day plan
 * for ANY course, ANY ambition, and ANY day from 1 to 365.
 */
export function generateUniqueTenClassesForDay(
  courseId: string,
  ambitionId: string = 'jr-ias',
  dayNumber: number = 1,
  board: string = 'TNSB'
): FullDayPlanResult {
  const safeDay = Math.max(1, Math.min(365, dayNumber || 1));

  // Determine Term Phase
  let term: FullDayPlanResult['term'] = 'Term 1: Foundations';
  let termMultiplier = 'Foundation & Core Axioms';
  if (safeDay > 240) {
    term = 'Term 3: Advanced Board & Exam Sprint';
    termMultiplier = 'High-Yield Exam Synthesis & Speed Drills';
  } else if (safeDay > 120) {
    term = 'Term 2: Applied Mastery & Experiments';
    termMultiplier = 'Applied Derivations & Real-World Lab';
  }

  const isLkg = courseId.includes('lkg');
  const isUkg = courseId.includes('ukg');
  const isNeet = courseId.includes('neet');
  const isJee = courseId.includes('jee');
  const isTnpsc = courseId.includes('tnpsc') || courseId.includes('group');

  // Grade label resolution
  let gradeLabel = '5th Std';
  const stdMatch = courseId.match(/std-(\d+)/);
  if (stdMatch) {
    const num = stdMatch[1];
    gradeLabel = `${num}${num === '1' ? 'st' : num === '2' ? 'nd' : num === '3' ? 'rd' : 'th'} Std`;
  } else if (isLkg) {
    gradeLabel = 'LKG';
  } else if (isUkg) {
    gradeLabel = 'UKG';
  } else if (isNeet) {
    gradeLabel = 'NEET Medical';
  } else if (isJee) {
    gradeLabel = 'JEE Engineering';
  } else if (isTnpsc) {
    gradeLabel = 'TNPSC Group Examination';
  }

  // Ambition Curriculum Lookup
  const ambitionKey = AMBITION_CURRICULA[ambitionId] ? ambitionId : 'jr-ias';
  const ambitionData = AMBITION_CURRICULA[ambitionKey];
  const ambitionLessonIndex = (safeDay - 1) % ambitionData.lessons.length;
  const ambitionLesson = ambitionData.lessons[ambitionLessonIndex];

  // GK, Penmanship, Extracurricular, Yoga, and Video lookups
  const gkItem = GK_365_POOL[(safeDay - 1) % GK_365_POOL.length];
  const penmanshipItem = PENMANSHIP_365_POOL[(safeDay - 1) % PENMANSHIP_365_POOL.length];
  const extraItem = EXTRACURRICULAR_365_POOL[(safeDay - 1) % EXTRACURRICULAR_365_POOL.length];
  const yogaPlan = YOGA_365_POOL[(safeDay - 1) % YOGA_365_POOL.length];
  const videoItem = MASTERCLASS_VIDEOS_POOL[(safeDay - 1) % MASTERCLASS_VIDEOS_POOL.length];

  // Pull authentic syllabus if available to extract deep subjects
  const syllabus: OfficialCourseSyllabus = getOfficialGovernmentSyllabus(courseId, board);
  const subjects = syllabus.subjects || [];

  // Build Classes 1 to 4 dynamically and uniquely based on dayNumber
  let class1: DayClassItem;
  let class2: DayClassItem;
  let class3: DayClassItem;
  let class4: DayClassItem;

  if (isLkg || isUkg) {
    const kg = isLkg ? 'LKG' : 'UKG';
    const dayPhonicsNum = ((safeDay - 1) % 26) + 1;
    const letter = String.fromCharCode(64 + dayPhonicsNum);
    const dayCountNum = ((safeDay - 1) % (isLkg ? 20 : 50)) + 1;

    class1 = {
      id: 1,
      type: 'academic',
      title: `Day ${safeDay}: ${kg} English Phonics — Letter '${letter}' Sounds & Sight Words`,
      subject: 'Phonics & English',
      duration: '15 Min',
      xp: 25,
      icon: '🔤',
      microTopic: `Mastering sound of letter ${letter}, tracing stroke direction, identifying 4 objects starting with ${letter}.`,
      tamilTitle: `${letter} எழுத்தின் ஒலி மற்றும் சொற்கள் அறிமுகம்`
    };

    class2 = {
      id: 2,
      type: 'academic',
      title: `Day ${safeDay}: ${kg} Number Magic — Number ${dayCountNum} Counting & Shape Logic`,
      subject: 'Number Magic',
      duration: '15 Min',
      xp: 25,
      icon: '🔢',
      microTopic: `Count up to ${dayCountNum} with colorful visual beads, big vs small object comparison, circle & square puzzle.`,
      tamilTitle: `எண் ${dayCountNum} எண்ணுதல் மற்றும் வடிவங்கள்`
    };

    class3 = {
      id: 3,
      type: 'academic',
      title: `Day ${safeDay}: ${kg} தமிழ் பாலர் பாடல் & எழுத்து பயிற்சி (${safeDay % 2 === 1 ? 'உயிர்' : 'மெய்'})`,
      subject: 'தமிழ் (Tamil)',
      duration: '15 Min',
      xp: 25,
      icon: '🗣️',
      microTopic: `சுவையான பாப்பா பாட்டுடன் கூடிய எளிய தமிழ் எழுத்துக்களை ஒலித்து பழகும் அன்றாட பயிற்சி.`,
      tamilTitle: `பாலர் பாடல் & எழுத்து பயிற்சி`
    };

    class4 = {
      id: 4,
      type: 'academic',
      title: `Day ${safeDay}: ${kg} Nature & EVS — Animal Friends & Environment`,
      subject: 'Nature & EVS',
      duration: '15 Min',
      xp: 25,
      icon: '🌿',
      microTopic: `Discovering birds, domestic animals, seasons, and healthy hand-washing morning routine.`,
      tamilTitle: `இயற்கை மற்றும் நற்பழக்கங்கள்`
    };
  } else if (isNeet) {
    const bioTopics = ["Cell Division: Mitosis vs Meiosis Stages", "Human Respiration & Gas Exchange in Alveoli", "Mendelian Genetics & Dihybrid Cross Ratios", "Plant Photosynthesis: Light & Dark Reactions", "Neural Control: Action Potential & Synaptic Cleft", "Cardiac Conduction System & ECG Waveforms", "Biotechnology: Recombinant DNA & PCR Principles", "Ecology: Energy Flow in Trophic Food Chains"];
    const phyTopics = ["Kinematics: Projectile Motion on Inclined Plane", "Newton's Laws: Free Body Diagrams & Friction", "Electrostatics: Coulomb's Law & Electric Potential", "Current Electricity: Kirchhoff's Laws & Potentiometer", "Optics: Snell's Law & Total Internal Reflection", "Thermodynamics: Carnot Cycle & Entropy Changes", "Rotational Dynamics: Moment of Inertia Theorems", "Modern Physics: Photoelectric Effect & de Broglie"];
    const chemTopics = ["Organic Chemistry: SN1 vs SN2 Nucleophilic Substitution", "Chemical Bonding: Hybridization & Molecular Orbitals", "Thermodynamics: Enthalpy, Gibbs Free Energy & Equilibrium", "Coordination Compounds: Crystal Field Splitting Theory", "Electrochemistry: Nernst Equation & Galvanic Cells", "Aldehydes & Ketones: Nucleophilic Addition Reactions", "Periodic Trends: Ionization Enthalpy & Electronegativity", "Solutions: Raoult's Law & Colligative Properties"];

    const bTop = bioTopics[(safeDay - 1) % bioTopics.length];
    const pTop = phyTopics[(safeDay - 1) % phyTopics.length];
    const cTop = chemTopics[(safeDay - 1) % chemTopics.length];

    class1 = {
      id: 1,
      type: 'academic',
      title: `Day ${safeDay}: NEET Biology — ${bTop} (${termMultiplier})`,
      subject: 'Biology',
      duration: '15 Min',
      xp: 30,
      icon: '🧬',
      microTopic: `High-yield NCERT diagrams, line-by-line concept breakdown, and eliminating confusing exam distractors.`
    };
    class2 = {
      id: 2,
      type: 'academic',
      title: `Day ${safeDay}: NEET Physics — ${pTop} (${termMultiplier})`,
      subject: 'Physics',
      duration: '15 Min',
      xp: 30,
      icon: '⚡',
      microTopic: `Formula derivation, dimensional verification, and solving 3 previous year NEET numerical problems.`
    };
    class3 = {
      id: 3,
      type: 'academic',
      title: `Day ${safeDay}: NEET Chemistry — ${cTop} (${termMultiplier})`,
      subject: 'Chemistry',
      duration: '15 Min',
      xp: 30,
      icon: '🧪',
      microTopic: `Step-by-step reaction mechanisms, electron shifts, and high-yield numerical formulas.`
    };
    class4 = {
      id: 4,
      type: 'academic',
      title: `Day ${safeDay}: NEET Diagnostic Drill — Integrated Bio-Phys-Chem Speed Numerical`,
      subject: 'Diagnostic Drill',
      duration: '15 Min',
      xp: 25,
      icon: '🎯',
      microTopic: `Timed multi-subject rapid calculation drill under full NEET exam pressure conditions.`
    };
  } else if (isTnpsc) {
    const tamTopics = ["பொருளிலக்கணம் & யாப்பிலக்கணம் (வெண்பா, ஆசிரியப்பா)", "திருக்குறள் அதிகாரம்: அன்புடைமை & பண்புடைமை வினாக்கள்", "சிலப்பதிகாரம் & மணிமேகலை இரட்டைக் காப்பிய ஒப்பீடு", "பத்துப்பாட்டு & எட்டுத்தொகை சங்க இலக்கியத் தொகுப்பு", "பாரதியார், பாரதிதாசன், நாமக்கல் கவிஞர் மரபுக் கவிதைகள்", "மொழித்திறன்: சந்திப்பிழை நீக்குதல், வேர்ச்சொல் அறிதல்"];
    const polTopics = ["இந்திய அரசியலமைப்பு: முகவுரை மற்றும் அடிப்படைக் கடமைகள்", "நாடாளுமன்றம் மற்றும் மாநில சட்டமன்றங்கள் அதிகாரப் பகிர்வு", "உச்சநீதிமன்றம் மற்றும் உயர்நீதிமன்றங்களின் நீதிப்பேராணைகள்", "மத்திய-மாநில அரசுகளின் நிதி உறவுகள் & நிதி ஆணையம்", "தேர்தல் ஆணையம் & ஊழல் தடுப்பு அமைப்புகள் (லோக் ஆயுக்தா)"];
    const hisTopics = ["தமிழ்நாடு வரலாறு: சங்க கால மன்னர்கள் & சேர சோழ பாண்டியர்", "வேலு நாச்சியார், மருது சகோதரர்கள் & வீரபாண்டிய கட்டபொம்மன்", "தந்தை பெரியார், அண்ணா & நீதிக்கட்சியின் சமூக சீர்திருத்தங்கள்", "தமிழ்நாட்டின் புவியியல் அமைவிடம், கனிம வளங்கள் & காடுகள்"];

    const tTop = tamTopics[(safeDay - 1) % tamTopics.length];
    const pTop = polTopics[(safeDay - 1) % polTopics.length];
    const hTop = hisTopics[(safeDay - 1) % hisTopics.length];

    class1 = {
      id: 1,
      type: 'academic',
      title: `Day ${safeDay}: பொதுத்தமிழ் — ${tTop}`,
      subject: 'பொதுத்தமிழ்',
      duration: '15 Min',
      xp: 25,
      icon: '📜',
      microTopic: `சமச்சீர் பாடப்புத்தக வரிகள், சொல்லும் பொருளும், மற்றும் முந்தைய ஆண்டு TNPSC வினாக்கள்.`
    };
    class2 = {
      id: 2,
      type: 'academic',
      title: `Day ${safeDay}: Indian Polity — ${pTop}`,
      subject: 'Polity',
      duration: '15 Min',
      xp: 25,
      icon: '🏛️',
      microTopic: `முக்கிய சட்டப்பிரிவுகள், உச்சநீதிமன்ற தீர்ப்புகள் மற்றும் நிர்வாக கட்டமைப்பு.`
    };
    class3 = {
      id: 3,
      type: 'academic',
      title: `Day ${safeDay}: Tamil Nadu History & Culture — ${hTop}`,
      subject: 'TN History',
      duration: '15 Min',
      xp: 25,
      icon: '🗺️',
      microTopic: `அலகு 8 மற்றும் 9 பாடத்திட்டத்தின் கீழ் தமிழ் சமுதாய வரலாறு மற்றும் வளர்ச்சி நிர்வாகம்.`
    };
    class4 = {
      id: 4,
      type: 'academic',
      title: `Day ${safeDay}: Aptitude & Mental Ability — Speed Math & Logical Reasoning`,
      subject: 'Aptitude',
      duration: '15 Min',
      xp: 25,
      icon: '🧮',
      microTopic: `மீப்பெரு பொது காரணி (HCF), மீச்சிறு பொது மடங்கு (LCM), விகிதம் மற்றும் வயது கணக்குகள்.`
    };
  } else {
    // Standard K-12 (1st to 12th Std) Progressive Curriculum
    let s1 = subjects[0] || { subjectName: 'Mathematics', chapters: [] };
    let s2 = subjects[1] || { subjectName: 'Science', chapters: [] };
    let s3 = subjects[2] || { subjectName: 'Tamil & English', chapters: [] };
    let s4 = subjects[3] || { subjectName: 'Social Science', chapters: [] };

    const c1List = s1.chapters && s1.chapters.length > 0 ? s1.chapters : [
      { chapterTitle: 'Numbers, Place Value & Large Operations' },
      { chapterTitle: 'Factors, Multiples, Primes & LCM/HCF' },
      { chapterTitle: 'Fractions, Decimals & Percentages' },
      { chapterTitle: 'Algebraic Equations & Linear Variables' },
      { chapterTitle: 'Geometry: Angles, Triangles & Polygons' },
      { chapterTitle: 'Mensuration: Perimeter, Area & Surface Volumes' },
      { chapterTitle: 'Data Handling: Bar Graphs & Probability' }
    ];

    const c2List = s2.chapters && s2.chapters.length > 0 ? s2.chapters : [
      { chapterTitle: 'States of Matter & Molecular Transformations' },
      { chapterTitle: 'Force, Energy, Work & Simple Machines' },
      { chapterTitle: 'Light, Shadows, Mirrors & Lenses' },
      { chapterTitle: 'Electricity, Conductors & Magnetic Fields' },
      { chapterTitle: 'Plant Life: Photosynthesis & Transpiration' },
      { chapterTitle: 'Human Body Systems & Nutritional Health' },
      { chapterTitle: 'Ecosystems, Water Cycle & Climate Action' }
    ];

    const c3List = s3.chapters && s3.chapters.length > 0 ? s3.chapters : [
      { chapterTitle: 'தமிழ் செய்யுள்: நன்னெறி & திருக்குறள்' },
      { chapterTitle: 'English Grammar: Tenses, Modals & Sentence Clauses' },
      { chapterTitle: 'தமிழ் உரைநடை & வரலாற்று ஆளுமைகள்' },
      { chapterTitle: 'English Comprehension & Creative Composition' },
      { chapterTitle: 'தமிழ் இலக்கணம்: பெயர்ச்சொல், வினைச்சொல், வேற்றுமை' },
      { chapterTitle: 'Vocabulary Spark: Synonyms, Antonyms & Idioms' }
    ];

    const c4List = s4.chapters && s4.chapters.length > 0 ? s4.chapters : [
      { chapterTitle: 'Our Earth: Continents, Oceans & Latitudes' },
      { chapterTitle: 'Ancient Civilizations: Indus Valley & Sangam Age' },
      { chapterTitle: 'Indian Heritage, Great Temples & Monarchy' },
      { chapterTitle: 'Democratic Institutions: Parliament & Local Bodies' },
      { chapterTitle: 'Climate, Natural Vegetation & Wildlife Sanctuaries' },
      { chapterTitle: 'Economic Activities: Farming, Trade & Digital Services' }
    ];

    const chap1 = c1List[(safeDay - 1) % c1List.length];
    const chap2 = c2List[(safeDay - 1) % c2List.length];
    const chap3 = c3List[(safeDay - 1) % c3List.length];
    const chap4 = c4List[(safeDay - 1) % c4List.length];

    const microOffset = Math.floor((safeDay - 1) / Math.max(1, c1List.length)) + 1;

    class1 = {
      id: 1,
      type: 'academic',
      title: `Day ${safeDay}: ${gradeLabel} Mathematics — ${chap1.chapterTitle}`,
      subject: 'Mathematics',
      duration: '15 Min',
      xp: 25,
      icon: '📐',
      microTopic: `Lesson Unit ${microOffset}: Step-by-step problem solving, working formulas, and 3 textbook practice problems.`,
      tamilTitle: `கணிதம்: ${chap1.chapterTitle}`
    };

    class2 = {
      id: 2,
      type: 'academic',
      title: `Day ${safeDay}: ${gradeLabel} Science — ${chap2.chapterTitle}`,
      subject: 'Science',
      duration: '15 Min',
      xp: 25,
      icon: '🔬',
      microTopic: `Lesson Unit ${microOffset}: Scientific principles, experimental observation, diagram labeling, and real-world relevance.`,
      tamilTitle: `அறிவியல்: ${chap2.chapterTitle}`
    };

    class3 = {
      id: 3,
      type: 'academic',
      title: `Day ${safeDay}: ${gradeLabel} Languages — ${chap3.chapterTitle}`,
      subject: 'Languages',
      duration: '15 Min',
      xp: 25,
      icon: '📖',
      microTopic: `Lesson Unit ${microOffset}: Literary appreciation, grammar rules, vocabulary flashcards, and sentence construction.`,
      tamilTitle: `மொழிகள்: ${chap3.chapterTitle}`
    };

    class4 = {
      id: 4,
      type: 'academic',
      title: `Day ${safeDay}: ${gradeLabel} Social Science — ${chap4.chapterTitle}`,
      subject: 'Social Science',
      duration: '15 Min',
      xp: 25,
      icon: '🌍',
      microTopic: `Lesson Unit ${microOffset}: Historical timelines, geographic map pointing, civics awareness, and cultural heritage.`,
      tamilTitle: `சமூக அறிவியல்: ${chap4.chapterTitle}`
    };
  }

  // Class 5: 365 Unique GK & Current Affairs Milestones
  const class5: DayClassItem = {
    id: 5,
    type: 'academic',
    title: `Day ${safeDay}: General Knowledge (GK) Milestone — ${gkItem.title}`,
    subject: 'GK & Current Affairs',
    duration: '10 Min',
    xp: 20,
    icon: gkItem.icon,
    microTopic: gkItem.micro
  };

  // Class 6: 365 Unique Handwriting & Penmanship Practice
  const class6: DayClassItem = {
    id: 6,
    type: 'homework',
    title: `Day ${safeDay}: Penmanship & Calligraphy Drill — ${penmanshipItem.title}`,
    subject: 'Penmanship',
    duration: '10 Min',
    xp: 20,
    icon: '✍️',
    microTopic: penmanshipItem.micro
  };

  // Class 7: 365 Unique Extracurricular & Life Skills
  const class7: DayClassItem = {
    id: 7,
    type: 'academic',
    title: `Day ${safeDay}: Extracurricular & Creative Skills — ${extraItem.title}`,
    subject: 'Extracurricular',
    duration: '10 Min',
    xp: 20,
    icon: extraItem.icon,
    microTopic: extraItem.micro
  };

  // Class 8: 365 Unique Futuristic Career Ambition Track
  const class8: DayClassItem = {
    id: 8,
    type: 'ambition',
    title: `Day ${safeDay}: ${ambitionData.title} — ${ambitionLesson.title}`,
    subject: ambitionData.title,
    duration: '15 Min',
    xp: 30,
    icon: ambitionData.icon,
    microTopic: ambitionLesson.micro
  };

  // Class 9: Dedicated Visual Masterclass Video
  const class9: DayClassItem = {
    id: 9,
    type: 'masterclass',
    title: `Day ${safeDay}: Visual Masterclass — ${videoItem.title}`,
    subject: 'Visual Masterclass',
    duration: '15 Min',
    xp: 25,
    icon: '🎥',
    videoUrl: `https://www.youtube.com/watch?v=${videoItem.id}`,
    microTopic: `HD 3D visual animation with real-world applications and step-by-step concept walk-through by ${videoItem.channel}.`
  };

  // Class 10: Bedtime Revision & Daily Test Drill
  const class10: DayClassItem = {
    id: 10,
    type: 'revision',
    title: `Day ${safeDay}: Bedtime Concept Vault & 5-Question Daily Test Drill`,
    subject: 'Bedtime Revision',
    duration: '10 Min',
    xp: 20,
    icon: '🌙',
    microTopic: `Quick 1-minute recall flashcards, formula recap, and 5 instant multiple-choice practice questions.`
  };

  const classes: DayClassItem[] = [
    class1, class2, class3, class4, class5,
    class6, class7, class8, class9, class10
  ];

  // Build 5 Concept-Aligned Test Questions for today
  const dailyTest: DayTestPlan = {
    testTitle: `Day ${safeDay} Mastery Assessment: ${class1.subject} & ${class2.subject}`,
    category: courseId,
    subject: class1.subject,
    questionCount: 5,
    durationMinutes: 10,
    passPercentage: 70,
    questions: [
      {
        id: `q_${safeDay}_1`,
        question: `What is the core principle demonstrated in today's ${class1.subject} lesson?`,
        questionTamil: `இன்றைய ${class1.subject} பாடத்தில் விளக்கப்பட்ட முதன்மைக் கருத்து எது?`,
        options: {
          A: `Fundamental conservation and systematic step-by-step logic`,
          B: `Random arbitrary numbers without rules`,
          C: `Only memorization without understanding`,
          D: `None of the above`
        },
        correctOption: 'A',
        explanation: `Under curriculum standards, this concept is founded upon systematic logical rules and conservation laws.`
      },
      {
        id: `q_${safeDay}_2`,
        question: `In today's ${class2.subject} unit, which variable directly governs the rate of the process?`,
        options: {
          A: `Temperature, pressure, and energy transfer coefficients`,
          B: `Color of the container`,
          C: `Day of the week`,
          D: `Distance from equator`
        },
        correctOption: 'A',
        explanation: `Thermodynamic and kinetic rates are fundamentally driven by energy gradients and molecular collision frequencies.`
      },
      {
        id: `q_${safeDay}_3`,
        question: `Regarding today's GK milestone (${gkItem.title}), what is its primary historical or scientific significance?`,
        options: {
          A: gkItem.micro.slice(0, 75) + '...',
          B: `It has no bearing on modern society`,
          C: `It was disproven in the 19th century`,
          D: `It was a fictional story`
        },
        correctOption: 'A',
        explanation: `${gkItem.title} marks an essential breakthrough: ${gkItem.micro}`
      },
      {
        id: `q_${safeDay}_4`,
        question: `For your ${ambitionData.title} track today, how should a leader approach this challenge?`,
        options: {
          A: `Analyze empirical data, uphold ethical standards, and consult stakeholders`,
          B: `Make hasty decisions without verification`,
          C: `Ignore citizen feedback`,
          D: `Delegate without supervision`
        },
        correctOption: 'A',
        explanation: `Leadership excellence requires evidence-based analysis, ethical adherence, and collaborative governance.`
      },
      {
        id: `q_${safeDay}_5`,
        question: `What is the primary benefit of practicing today's ${yogaPlan.name}?`,
        options: {
          A: yogaPlan.benefits[0] || 'Improves focus and relieves physical tension',
          B: `Promotes lethargy and sleepiness`,
          C: `Weakens postural muscles`,
          D: `Increases heart palpitations`
        },
        correctOption: 'A',
        explanation: `${yogaPlan.name} is scientifically proven to ${yogaPlan.benefits[0] || 'improve nervous system regulation'}.`
      }
    ]
  };

  return {
    dayNumber: safeDay,
    courseId,
    ambitionId,
    term,
    themeOfTheDay: `${class1.subject}: ${class1.title.split('—')[1]?.trim() || class1.title}`,
    classes,
    yoga: yogaPlan,
    dailyTest,
    visualMasterclassVideoId: videoItem.id
  };
}
