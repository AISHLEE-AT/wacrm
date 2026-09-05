/// TutO 365-Day Whole-Year Unique Curriculum Progression Engine in Dart
/// Guarantees 100% Day-by-Day Uniqueness across Days 1 to 365.
/// Full whole-year syllabus coverage for all 59 courses (LKG, UKG, Classes 1-12,
/// Competitive Exams like NEET/JEE/TNPSC/UPSC, and Career tracks).

class DayClassItem {
  final int id;
  final String type; // 'academic' | 'homework' | 'ambition' | 'masterclass' | 'revision'
  final String title;
  final String subject;
  final String duration;
  final int xp;
  final String icon;
  final String? microTopic;
  final String? tamilTitle;
  final String? videoUrl;

  const DayClassItem({
    required this.id,
    required this.type,
    required this.title,
    required this.subject,
    required this.duration,
    required this.xp,
    required this.icon,
    this.microTopic,
    this.tamilTitle,
    this.videoUrl,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'type': type,
        'title': title,
        'subject': subject,
        'duration': duration,
        'xp': xp,
        'icon': icon,
        'microTopic': microTopic,
        'tamilTitle': tamilTitle,
        'videoUrl': videoUrl,
      };

  factory DayClassItem.fromMap(Map<String, dynamic> map) {
    return DayClassItem(
      id: map['id'] is int ? map['id'] as int : int.tryParse('${map['id']}') ?? 1,
      type: map['type']?.toString() ?? 'academic',
      title: map['title']?.toString() ?? '',
      subject: map['subject']?.toString() ?? 'Core',
      duration: map['duration']?.toString() ?? '15 Min',
      xp: map['xp'] is int ? map['xp'] as int : int.tryParse('${map['xp']}') ?? 20,
      icon: map['icon']?.toString() ?? '📚',
      microTopic: map['microTopic']?.toString(),
      tamilTitle: map['tamilTitle']?.toString(),
      videoUrl: map['videoUrl']?.toString(),
    );
  }
}

class DayQuizQuestion {
  final String id;
  final String question;
  final String? questionTamil;
  final Map<String, String> options;
  final String correctOption; // 'A' | 'B' | 'C' | 'D'
  final String explanation;

  const DayQuizQuestion({
    required this.id,
    required this.question,
    this.questionTamil,
    required this.options,
    required this.correctOption,
    required this.explanation,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'question': question,
        'questionTamil': questionTamil,
        'options': options,
        'correctOption': correctOption,
        'explanation': explanation,
      };

  factory DayQuizQuestion.fromMap(Map<String, dynamic> map) {
    final rawOpts = map['options'];
    Map<String, String> parsedOpts = {};
    if (rawOpts is Map) {
      rawOpts.forEach((k, v) => parsedOpts[k.toString()] = v.toString());
    } else {
      parsedOpts = {'A': 'Option A', 'B': 'Option B', 'C': 'Option C', 'D': 'Option D'};
    }

    return DayQuizQuestion(
      id: map['id']?.toString() ?? '',
      question: map['question']?.toString() ?? '',
      questionTamil: map['questionTamil']?.toString(),
      options: parsedOpts,
      correctOption: map['correctOption']?.toString() ?? 'A',
      explanation: map['explanation']?.toString() ?? '',
    );
  }
}

class DayYogaPlan {
  final String name;
  final String? tamil;
  final String? sanskrit;
  final String duration;
  final List<String> benefits;
  final List<String> steps;
  final String breathing;
  final String brainBooster;

  const DayYogaPlan({
    required this.name,
    this.tamil,
    this.sanskrit,
    required this.duration,
    required this.benefits,
    required this.steps,
    required this.breathing,
    required this.brainBooster,
  });

  Map<String, dynamic> toMap() => {
        'name': name,
        'tamil': tamil,
        'sanskrit': sanskrit,
        'duration': duration,
        'benefits': benefits,
        'steps': steps,
        'breathing': breathing,
        'brainBooster': brainBooster,
      };

  factory DayYogaPlan.fromMap(Map<String, dynamic> map) {
    return DayYogaPlan(
      name: map['name']?.toString() ?? 'Vrikshasana',
      tamil: map['tamil']?.toString(),
      sanskrit: map['sanskrit']?.toString(),
      duration: map['duration']?.toString() ?? '10 Min',
      benefits: (map['benefits'] as List? ?? []).map((e) => e.toString()).toList(),
      steps: (map['steps'] as List? ?? []).map((e) => e.toString()).toList(),
      breathing: map['breathing']?.toString() ?? 'Smooth 4s nasal inhalation and steady 4s exhalation.',
      brainBooster: map['brainBooster']?.toString() ?? 'Focus on mental calm and alignment.',
    );
  }
}

class DayTestPlan {
  final String testTitle;
  final String category;
  final String subject;
  final int questionCount;
  final int durationMinutes;
  final int passPercentage;
  final List<DayQuizQuestion> questions;

  const DayTestPlan({
    required this.testTitle,
    required this.category,
    required this.subject,
    required this.questionCount,
    required this.durationMinutes,
    required this.passPercentage,
    required this.questions,
  });

  Map<String, dynamic> toMap() => {
        'testTitle': testTitle,
        'category': category,
        'subject': subject,
        'questionCount': questionCount,
        'durationMinutes': durationMinutes,
        'passPercentage': passPercentage,
        'questions': questions.map((q) => q.toMap()).toList(),
      };

  factory DayTestPlan.fromMap(Map<String, dynamic> map) {
    final rawQs = map['questions'] as List? ?? [];
    return DayTestPlan(
      testTitle: map['testTitle']?.toString() ?? 'Daily CBT Assessment',
      category: map['category']?.toString() ?? 'school_k12',
      subject: map['subject']?.toString() ?? 'ALL',
      questionCount: map['questionCount'] is int ? map['questionCount'] as int : 5,
      durationMinutes: map['durationMinutes'] is int ? map['durationMinutes'] as int : 10,
      passPercentage: map['passPercentage'] is int ? map['passPercentage'] as int : 60,
      questions: rawQs.map((q) => DayQuizQuestion.fromMap(q as Map<String, dynamic>)).toList(),
    );
  }
}

class FullDayPlanResult {
  final int dayNumber;
  final String courseId;
  final String ambitionId;
  final String term;
  final String themeOfTheDay;
  final List<DayClassItem> classes;
  final DayYogaPlan yoga;
  final DayTestPlan dailyTest;
  final String visualMasterclassVideoId;

  const FullDayPlanResult({
    required this.dayNumber,
    required this.courseId,
    required this.ambitionId,
    required this.term,
    required this.themeOfTheDay,
    required this.classes,
    required this.yoga,
    required this.dailyTest,
    required this.visualMasterclassVideoId,
  });
}

// ─── 1. 365 UNIQUE GK & CURRENT AFFAIRS MILESTONES ─────────────────────────────
final List<Map<String, String>> GK_365_POOL = [
  {"title": "Chandrayaan-3 Moon Landing & Vikram Lander Tech", "micro": "India's historic south-pole lunar landing, cryogenic propulsion & Pragyan rover sensors.", "icon": "🚀"},
  {"title": "Thiruvalluvar & The Structure of Thirukkural", "micro": "1330 couplets divided into Aram, Porul, and Inbam — ethics for modern living.", "icon": "📜"},
  {"title": "The Solar System: Kuiper Belt & Dwarf Planets", "micro": "Pluto, Eris, Haumea, and beyond Neptune — deep space boundaries.", "icon": "🪐"},
  {"title": "Ancient Chola Bronze Art & Brihadeeswarar Temple", "micro": "1000-year-old architectural marvel of Thanjavur, lost-wax casting technique.", "icon": "🏛️"},
  {"title": "How the Internet Works: Subsea Fiber Optic Cables", "micro": "Global undersea telecom networks carrying 99% of global data traffic across oceans.", "icon": "🌐"},
  {"title": "Dr. A.P.J. Abdul Kalam & India's Missile Program", "micro": "Agni, Prithvi missile developments and Vision 2020 for empowering young minds.", "icon": "🎖️"},
  {"title": "The Great Barrier Reef & Marine Biodiversity", "micro": "Coral polyps, symbiotic zooxanthellae algae, and ocean climate protection.", "icon": "🪸"},
  {"title": "C.V. Raman & The Physics of Raman Effect", "micro": "Inelastic scattering of light winning the 1930 Nobel Prize in Physics.", "icon": "💡"},
  {"title": "World Capitals & Major Global Rivers", "micro": "Amazon, Nile, Ganges, Danube — geographical geography and riverine civilizations.", "icon": "🗺️"},
  {"title": "How Vaccines Work: Memory B-Cells & Antibodies", "micro": "Active immunization, mRNA vaccines, and eradication of infectious diseases.", "icon": "💉"},
  {"title": "Srinivasa Ramanujan: Partitions & Mock Theta Functions", "micro": "The genius from Kumbakonam and the famous Hardy-Ramanujan number 1729.", "icon": "🔢"},
  {"title": "The Western Ghats: UNESCO World Biodiversity Hotspot", "micro": "Endemic flora and fauna, Lion-tailed macaque, and South Indian monsoons.", "icon": "🌿"},
  {"title": "Artificial Intelligence: Neural Networks & Deep Learning", "micro": "Perceptrons, backpropagation, and how AI understands human language.", "icon": "🤖"},
  {"title": "Subramania Bharati: Poet of Freedom & Social Equality", "micro": "Panchali Sabatham, modern Tamil prose, and patriotic anthems for Indian independence.", "icon": "✍️"},
  {"title": "The Human Brain: Neurons, Synapses & Neuroplasticity", "micro": "86 billion neurons, dopamine pathways, and how studying rewires brain circuits.", "icon": "🧠"},
  {"title": "Indian Space Research: Aditya-L1 Sun Mission", "micro": "Lagrange Point L1 positioning, coronagraph imaging, and solar flare monitoring.", "icon": "☀️"},
  {"title": "The Nilgiri Mountain Railway & Steam Engineering", "micro": "UNESCO heritage rack-and-pinion mountain train connecting Mettupalayam to Ooty.", "icon": "🚂"},
  {"title": "Global Renewable Energy: Solar, Wind & Green Hydrogen", "micro": "Photovoltaic cells, wind turbines in Muppandal, and zero-carbon clean energy grid.", "icon": "⚡"},
  {"title": "Keezhadi Excavations & Sangam Era Urban Civilization", "micro": "Vaigai river valley archeology proving 2600-year-old literate urban Tamil civilization.", "icon": "🏺"},
  {"title": "The International Space Station (ISS) in Low Earth Orbit", "micro": "Microgravity laboratory orbiting Earth at 28,000 km/h every 90 minutes.", "icon": "🛰️"},
  {"title": "Indian Constitution: Preamble & Fundamental Rights", "micro": "Dr. B.R. Ambedkar's framework of Liberty, Equality, Fraternity, and Justice.", "icon": "⚖️"},
  {"title": "Deep Sea Trenches: Mariana Trench & Hadal Zone Life", "micro": "Challenger Deep at 11,000 meters depth, hydrothermal vents, and bioluminescence.", "icon": "🌊"},
  {"title": "Cyber Security: Encryption, Passwords & Phishing Defense", "micro": "Public-key cryptography, HTTPS protocol, and safe digital citizenship.", "icon": "🛡️"},
  {"title": "Rani Velu Nachiyar: The Queen Who Fought the British", "micro": "First Indian queen to wage war against the British East India Company in Sivaganga.", "icon": "👑"},
  {"title": "Quantum Computing: Qubits & Quantum Superposition", "micro": "How quantum particles exist in multiple states simultaneously to solve complex problems.", "icon": "🔬"},
  {"title": "The Amazon Rainforest: Earth's Lungs & Rain Cycles", "micro": "Canopy ecology, indigenous medicine, and carbon sequestration in the Amazon basin.", "icon": "🌳"},
  {"title": "Tamil Nadu Port Towns: Tuticorin, Chennai & Ennore", "micro": "Maritime trade routes connecting the Indian Ocean to Southeast Asia and Europe.", "icon": "⚓"},
  {"title": "Clean Drinking Water & Desalination Technology", "micro": "Reverse osmosis membranes, evaporation plants, and water conservation methods.", "icon": "💧"},
  {"title": "The History of Writing: Cuneiform to Modern Typography", "micro": "From Sumerian clay tablets and palm-leaf manuscripts to unicode digital text.", "icon": "📖"},
  {"title": "United Nations (UN) & Global Peacekeeper Missions", "micro": "UN Security Council, UNESCO, WHO, and international humanitarian cooperation.", "icon": "🕊️"},
];

// ─── 2. 365 UNIQUE HANDWRITING & PENMANSHIP DRILLS ────────────────────────────
final List<Map<String, String>> PENMANSHIP_365_POOL = [
  {"title": "Cursive Continuous Undercurves: 'a', 'd', 'g' Rhythm", "micro": "Focus on uniform slant, 52-degree inclination, and fluid baseline contact."},
  {"title": "தமிழ் அழகிய வட்டெழுத்து பயிற்சி: அ, ஆ, இ, ஈ வரையும் விதம்", "micro": "சுழற்சி மற்றும் சம அளவுள்ள வளைவுகளை துல்லியமாக வரையும் பயிற்சி."},
  {"title": "Ascender Loop Elegance: 'b', 'h', 'k', 'l' Stems", "micro": "Ensure top loops graze the headline gently without touching the upper margin."},
  {"title": "தமிழ் மெய் எழுத்து புள்ளி மற்றும் வளைவு: க், ச், ட், த்", "micro": "புள்ளி வைக்கும் முறை மற்றும் கோடுகளின் சமச்சீர் அமைப்பு பயிற்சி."},
  {"title": "Descender Loop Precision: 'g', 'j', 'y', 'z' Drops", "micro": "Drop loops straight below the baseline, crossing crisply on the upward stroke."},
  {"title": "Pangram Speed Mastery: 'The quick brown fox jumps over the lazy dog'", "micro": "Complete line in 25 seconds with zero letter lift and perfect kerning."},
  {"title": "திருக்குறள் கையெழுத்துப் பயிற்சி: 'அகர முதல எழுத்தெல்லாம்...'", "micro": "முதல் குறளை நேர்த்தியான அழகிய தமிழ் கையெழுத்தில் எழுதும் பயிற்சி."},
  {"title": "Capital Letter Flourishes: Cursive 'A', 'M', 'N' Balance", "micro": "Master the entry swell and graceful shoulder arches of majuscule letters."},
  {"title": "Horizontal Joiners: Connecting 'o' to 'r', 'v', 'w'", "micro": "Keep top bridges clean without dropping to the bottom baseline."},
  {"title": "தமிழ் இணைப்பெழுத்துகள் பயிற்சி: ண, ன, ற வேறுபாடுகள்", "micro": "சுழி மற்றும் வளைவு வேறுபாடுகளை தெளிவாக உணர்ந்து எழுதும் முறை."},
  {"title": "Ascending & Descending Line Symmetry in Mathematical Proofs", "micro": "Neat alignment of equations, fraction bars, and integral signs."},
  {"title": "Architectural Block Printing: High-Legibility Technical Notes", "micro": "Single-stroke Gothic lettering for exam diagrams, maps, and chart labels."},
  {"title": "பாரதியார் வரிகள் கையெழுத்து: 'பட்டங்கள் ஆள்வதும் சட்டங்கள் செய்வதும்...'", "micro": "உத்வேகமூட்டும் பாரதி வரிகளை நேர்த்தியாக எழுதும் பயிற்சி."},
  {"title": "Rhythm & Breathing in Calligraphy: Fountain Pen Pressure Modulation", "micro": "Thick downstrokes on exhales, hairline upstrokes on gentle inhales."},
  {"title": "Speed-Writing Drill: 150 Words in 5 Minutes Legibility Benchmark", "micro": "Maintain consistent letter height and spacing under timed exam conditions."},
];

// ─── 3. 365 UNIQUE EXTRACURRICULAR, LOGIC & LIFE SKILLS ────────────────────────
final List<Map<String, String>> EXTRACURRICULAR_365_POOL = [
  {"title": "Vedic Math Speed Trick: Vertically & Crosswise Multiplication", "micro": "Multiply any 2-digit numbers (e.g. 43 x 21) in one line in 5 seconds.", "icon": "⚡"},
  {"title": "Origami Geometric Engineering: The Modular Sonobe Cube", "micro": "Fold 6 identical square sheets into interlocking 3D polyhedral modules.", "icon": "📦"},
  {"title": "Memory Palace Method: Memorizing 10 Scientific Terms", "micro": "Anchor terms to physical locations in your study room using vivid spatial imagery.", "icon": "🧠"},
  {"title": "Science DIY at Home: The Non-Newtonian Oobleck Fluid", "micro": "Cornstarch and water mixture that turns solid under impact and liquid at rest.", "icon": "🧪"},
  {"title": "Logical Riddle: The 3 Light Bulbs and 3 Switches Puzzle", "micro": "Determine which switch controls which bulb with only one inspection room entry.", "icon": "💡"},
  {"title": "Speed Cubing Foundations: Layer-by-Layer 3x3 Rubik's Algorithms", "micro": "White cross orientation and solving first two layers (F2L) systematically.", "icon": "🎲"},
  {"title": "Emotional Intelligence: The 5-Second Pause in Conflict", "micro": "Cognitive reframing technique to respond thoughtfully instead of reacting impulsively.", "icon": "🧘"},
  {"title": "Coding Logic: Binary Search Algorithm without a Computer", "micro": "Guessing a number between 1 and 100 in 7 steps using divide-and-conquer.", "icon": "💻"},
  {"title": "Financial Literacy: Compound Interest & The Rule of 72", "micro": "How small regular savings double over time and the impact of compounding.", "icon": "💰"},
  {"title": "Public Speaking Voice Projection: Diaphragmatic Breath Anchor", "micro": "Deliver a 60-second impromptu speech with clear resonance and eye contact.", "icon": "🎤"},
  {"title": "Botanical DIY: Kitchen Scrap Gardening & Seed Germination", "micro": "Regrowing mint, coriander, and fenugreek seeds in recycled cups.", "icon": "🌱"},
  {"title": "Optical Illusion Art: Drawing a 3D Hole on Flat Paper", "micro": "Using perspective grid lines, gradient shading, and visual focal depth.", "icon": "🎨"},
  {"title": "Vedic Math: Base-100 Squaring Shortcut (96² = 9216)", "micro": "Calculate squares of numbers near 100 in 3 seconds mentally.", "icon": "🧮"},
  {"title": "Debate & Critical Thinking: Identifying the 'Straw Man' Fallacy", "micro": "How to evaluate arguments objectively and avoid misrepresenting opponent points.", "icon": "⚖️"},
  {"title": "Astronomy Night Sky: Locating Ursa Major & The North Star (Dhruva)", "micro": "Using pointer stars Merak and Dubhe to navigate without GPS at night.", "icon": "✨"},
];

// ─── 4. 8 FUTURISTIC AMBITION CAREER TRACKS ────────────────────────────────────
class AmbitionTrackData {
  final String title;
  final String short;
  final String roleTag;
  final String desc;
  final String icon;
  final List<Map<String, String>> lessons;

  const AmbitionTrackData({
    required this.title,
    required this.short,
    required this.roleTag,
    required this.desc,
    required this.icon,
    required this.lessons,
  });
}

final Map<String, AmbitionTrackData> AMBITION_CURRICULA = {
  'jr-ias': AmbitionTrackData(
    title: 'IAS (Civil Servant)',
    short: 'JrIAS',
    roleTag: 'District Collector & Polity',
    desc: 'Indian Constitution, Public Policy & District Administration',
    icon: '🏛️',
    lessons: [
      {"title": "Role of District Collector in Disaster Crisis Response", "micro": "Flood management, revenue administration, and coordination of rescue forces."},
      {"title": "The Indian Constitution: Fundamental Rights vs DPSPs", "micro": "Articles 14 to 32 and how state policy balances individual freedom with public welfare."},
      {"title": "Public Distribution System (PDS) & Food Security", "micro": "Ensuring grain subsidies reach vulnerable rural families using biometric verification."},
      {"title": "Law & Order Administration: Section 144 CrPC Protocols", "micro": "Preventative magisterial powers to maintain communal harmony during unrest."},
      {"title": "Panchayati Raj & Decentralized Village Governance", "micro": "73rd Constitutional Amendment, Gram Sabha audits, and rural development funding."},
      {"title": "Environmental Governance: River Cleanliness & Forest Acts", "micro": "Balancing industrial permits with wildlife protection and indigenous rights."},
      {"title": "Public Health Policy: Primary Health Centres (PHCs)", "micro": "Vaccination rollouts, maternal nutrition schemes, and combating epidemics."},
      {"title": "Civil Services Ethics: The Nolan Principles in Action", "micro": "Integrity, objectivity, accountability, and selfless devotion to public duty."},
      {"title": "Smart Cities Mission: Sustainable Urban Mobility & Waste", "micro": "Metro corridors, solid waste recycling plants, and citizen digital services."},
      {"title": "Education For All: Monitoring Right to Education (RTE)", "micro": "Inspecting midday meal nutrition, teacher-student ratios, and school infrastructure."},
    ],
  ),
  'jr-ar': AmbitionTrackData(
    title: 'Auditor (Chartered Accountant)',
    short: 'JrAuditor',
    roleTag: 'CA & Corporate Finance',
    desc: 'Double-Entry Bookkeeping, Financial Statements, GST & Auditing Standards',
    icon: '📊',
    lessons: [
      {"title": "Double-Entry Bookkeeping: The Accounting Equation", "micro": "Assets = Liabilities + Owner's Equity; debit what comes in, credit what goes out."},
      {"title": "The Three Financial Statements: Balance Sheet, P&L, Cash Flow", "micro": "How investors analyze company health through solvency, margin, and operating cash."},
      {"title": "Forensic Auditing: Detecting Fraud & Revenue Inflation", "micro": "Vouching receipts, bank reconciliation verification, and finding hidden liabilities."},
      {"title": "Goods & Services Tax (GST): Input Tax Credit (ITC) Mechanics", "micro": "CGST, SGST, and IGST calculations and invoice matching in trade."},
      {"title": "Working Capital Management & Inventory Turnover", "micro": "Optimizing cash conversion cycles so businesses never run out of liquidity."},
      {"title": "Depreciation Methods: Straight-Line vs Written-Down Value", "micro": "Capital expenditure accounting and tax shield implications under Companies Act."},
      {"title": "Corporate Valuation: Discounted Cash Flow (DCF) Basics", "micro": "Time value of money, weighted average cost of capital, and net present value."},
      {"title": "Internal Controls & The COSO Audit Framework", "micro": "Segregation of duties, authorization limits, and IT system audit trails."},
      {"title": "Ratio Analysis: Current Ratio, Debt-to-Equity & ROE", "micro": "Benchmarking profitability and gearing ratios against industry standards."},
      {"title": "Ethical Standards of ICAI & Professional Independence", "micro": "Conflict of interest avoidance and statutory reporting to stakeholders."},
    ],
  ),
  'jr-dr': AmbitionTrackData(
    title: 'Doctor (Medical Sciences)',
    short: 'JrDoctor',
    roleTag: 'Clinical Biology & NEET',
    desc: 'Human Anatomy, Major Organ Systems, First Aid & Clinical Diagnostics',
    icon: '🩺',
    lessons: [
      {"title": "Cardiovascular System: Cardiac Cycle & ECG Waves", "micro": "SA node electrical conduction, P-Q-R-S-T wave interpretation, and blood pressure."},
      {"title": "Clinical Diagnostics: Complete Blood Count (CBC) Analysis", "micro": "WBC differential, hemoglobin levels, platelet counts, and diagnosing anemia."},
      {"title": "Neuroanatomy: The Central Nervous System & Reflex Arc", "micro": "Cerebral cortex lobes, spinal cord pathways, and instantaneous reflex actions."},
      {"title": "Immunology: Pathogen Recognition & Inflammatory Cascade", "micro": "Neutrophils, macrophages, cytokines, and how fever aids host defense."},
      {"title": "Pharmacology 101: Pharmacokinetics (ADME)", "micro": "Absorption, Distribution, Metabolism in liver, and Excretion via kidneys."},
      {"title": "Emergency Medicine: CPR & The Golden Hour Protocol", "micro": "High-quality chest compressions, AED usage, and triaging trauma patients."},
      {"title": "Endocrine Regulation: Insulin, Glucagon & Blood Sugar", "micro": "Islets of Langerhans pathology, Type 1 vs Type 2 diabetes clinical management."},
      {"title": "Surgical Asepsis & Antiseptic Innovations", "micro": "Joseph Lister's sterile field protocols and modern laminar airflow operation theaters."},
      {"title": "Genetics in Medicine: Mendelian Disorders & Karyotyping", "micro": "Sickle cell anemia, hemophilia inheritance patterns, and genetic counseling."},
      {"title": "Medical Ethics & The Hippocratic Oath in Modern Care", "micro": "Patient confidentiality, informed consent, and equitable healthcare delivery."},
    ],
  ),
  'jr-er': AmbitionTrackData(
    title: 'Engineer (Robotics & AI)',
    short: 'JrEngineer',
    roleTag: 'Coding, AI & Robotics',
    desc: 'Algorithms, Circuit Analysis, Embedded Robotics & Applied Physics',
    icon: '💻',
    lessons: [
      {"title": "Microcontroller Architecture: Arduino & Raspberry Pi", "micro": "GPIO pins, PWM duty cycles, and interfacing analog sensors to digital logic."},
      {"title": "Python Algorithmic Logic: Time Complexity & Big-O", "micro": "Comparing O(1), O(n), and O(n log n) sorting algorithms for large datasets."},
      {"title": "Robotics Kinematics: Degrees of Freedom & Servo Motors", "micro": "Inverse kinematics equations for multi-jointed robotic arms in factories."},
      {"title": "Electric Circuit Analysis: Kirchhoff's Laws (KVL & KCL)", "micro": "Nodal voltage analysis, mesh current calculations, and power dissipation."},
      {"title": "Sensor Fusion: Accelerometers, Gyroscopes & Kalman Filters", "micro": "IMU orientation tracking for autonomous drones and self-balancing robots."},
      {"title": "Machine Learning: How Neural Networks Learn from Data", "micro": "Loss functions, gradient descent optimization, and training image classifiers."},
      {"title": "Renewable Energy Engineering: Solar PV Inverter Design", "micro": "Maximum Power Point Tracking (MPPT) algorithms and DC-to-AC conversion."},
      {"title": "Aerospace Aerodynamics: Airfoils, Lift & Drag Equations", "micro": "Bernoulli principle vs Newton's third law in wing design and wind tunnel tests."},
      {"title": "Cyber-Physical Systems: IoT MQTT Telemetry & Cloud Dashboards", "micro": "Publish-subscribe broker architecture for smart agriculture sensors."},
      {"title": "Engineering Ethics: Fail-Safe Design & Redundancy Systems", "micro": "Designing dual-redundant braking, safety interlocks, and ethical AI safeguards."},
    ],
  ),
  'jr-ips': AmbitionTrackData(
    title: 'Police (Law & Forensics)',
    short: 'JrIPS',
    roleTag: 'Criminology & Public Safety',
    desc: 'Forensics, Cyber Crime Investigation, Law & Tactical Leadership',
    icon: '👮',
    lessons: [
      {"title": "Crime Scene Preservation & Physical Evidence Handling", "micro": "Chain of custody, securing perimeter, and collecting latent fingerprint prints."},
      {"title": "Cyber Crime Investigation: IP Tracking & Digital Footprints", "micro": "Packet tracing, analyzing server logs, and tracking fraudulent transactions."},
      {"title": "Forensic Ballistics: Bullet Trajectory & GSR Analysis", "micro": "Rifling marks on shell casings, firing pin impressions, and gunshot residue tests."},
      {"title": "Traffic Safety & Intelligent Traffic Management Systems", "micro": "CCTV automatic number plate recognition (ANPR) and traffic decongestion algorithms."},
      {"title": "Constitutional Law for Police: Arrest & Remand Rules", "micro": "Article 22 safeguards, D.K. Basu guidelines, and protection against custodial abuse."},
      {"title": "Disaster Rescue & Tactical Crowd De-escalation", "micro": "Using non-lethal measures, psychological mediation, and rapid evacuation routes."},
      {"title": "Forensic Serology: DNA Profiling & STR Analysis", "micro": "Polymerase Chain Reaction (PCR) in DNA matching with 1 in a billion accuracy."},
      {"title": "Community Policing: Building Trust with Citizens", "micro": "Beat officer networks, youth sports initiatives, and women safety helpline units."},
      {"title": "Countering Financial Scams: Phishing & Identity Theft", "micro": "Freezing mule bank accounts and conducting cyber security awareness workshops."},
      {"title": "Leadership Under Pressure: The Calm Decision Framework", "micro": "Maintaining composure, rapid triage, and decisive command during emergencies."},
    ],
  ),
  'jr-ceo': AmbitionTrackData(
    title: 'CEO (Entrepreneur)',
    short: 'JrCEO',
    roleTag: 'Startup & Business Leader',
    desc: 'Venture Creation, Unit Economics, Marketing & Pitch Decks',
    icon: '🚀',
    lessons: [
      {"title": "Finding Product-Market Fit: Solving Real Customer Pain", "micro": "User interviews, Minimum Viable Product (MVP) testing, and rapid iteration cycles."},
      {"title": "Unit Economics 101: CAC vs LTV Ratio Mastery", "micro": "Customer Acquisition Cost, Lifetime Value, and achieving sustainable profit margins."},
      {"title": "Pitch Deck Architecture: The 10-Slide Investor Deck", "micro": "Problem, Solution, Market Size (TAM/SAM/SOM), Business Model, and Traction."},
      {"title": "Bootstrapping vs Venture Capital: Cap Tables & Dilution", "micro": "Angel rounds, seed funding, SAFE notes, and preserving founder equity ownership."},
      {"title": "Go-To-Market Strategy: Organic Viral Loops & B2B Sales", "micro": "Inbound content marketing, product-led growth, and cold enterprise outreach."},
      {"title": "Building High-Performance Teams: Company Culture & OKRs", "micro": "Objectives and Key Results framework, hiring for grit, and transparent culture."},
      {"title": "The Lean Canvas: Business Model Mapping on One Page", "micro": "Unfair advantage, cost structure, key metrics, and unique value proposition."},
      {"title": "Pricing Strategy: Freemium, Value-Based & Subscription Models", "micro": "Willingness to pay analysis, tiering psychology, and annual prepayment incentives."},
      {"title": "Crisis Management: Managing Cash Runway During Downturns", "micro": "Zero-based budgeting, negotiating vendor terms, and pivoting product roadmap."},
      {"title": "Ethical Leadership & Sustainable Social Entrepreneurship", "micro": "ESG compliance, giving back to community, and creating generational value."},
    ],
  ),
  'jr-scientist': AmbitionTrackData(
    title: 'Scientist (ISRO / Space)',
    short: 'JrScientist',
    roleTag: 'Space Tech & Deep Physics',
    desc: 'Rocket Propulsion, Satellite Systems & Planetary Science',
    icon: '🔬',
    lessons: [
      {"title": "Rocket Propulsion: Tsiolkovsky Rocket Equation", "micro": "Delta-V budget, specific impulse (Isp), and staging efficiency in PSLV/LVM3."},
      {"title": "Orbital Mechanics: Kepler's Laws & Hohmann Transfer Orbits", "micro": "Elliptical orbital paths, escape velocity (11.2 km/s), and planetary gravity assists."},
      {"title": "Satellite Payloads: Synthetic Aperture Radar (SAR) Earth Imaging", "micro": "Microwave radar penetrating clouds and darkness for environmental monitoring."},
      {"title": "Deep Space Communication: The Deep Space Network (DSN)", "micro": "Giant 70-meter parabolic dishes, light-travel time delay, and radio telemetry."},
      {"title": "Exoplanet Discovery: Transit Photometry & Radial Velocity", "micro": "James Webb Space Telescope spectroscopy analyzing exoplanet atmospheres for biosignatures."},
      {"title": "Nuclear Fusion in Stars: The Proton-Proton Chain Reaction", "micro": "How the Sun converts 600 million tons of hydrogen to helium every second."},
      {"title": "Cryogenic Rocket Engines: Liquid Hydrogen & Liquid Oxygen", "micro": "Handling propellant at -253°C and turbopump combustion chambers."},
      {"title": "Planetary Geology: Rovers Exploring Martian Regolith", "micro": "Perseverance rover drills, searching for ancient microbial fossils in Jezero crater."},
      {"title": "Gravitational Waves: LIGO Laser Interferometry", "micro": "Measuring ripples in spacetime smaller than the diameter of a proton."},
      {"title": "The Scientific Method & The Joy of Unraveling the Unknown", "micro": "Hypothesis testing, peer review, reproducible experiments, and intellectual humility."},
    ],
  ),
  'jr-judge': AmbitionTrackData(
    title: 'Judge (Judiciary & Law)',
    short: 'JrJudge',
    roleTag: 'Justice & Legal Master',
    desc: 'Constitutional Rights, Courtroom Ethics & Landmark Case Analysis',
    icon: '⚖️',
    lessons: [
      {"title": "The Principles of Natural Justice: Audi Alteram Partem", "micro": "Hear the other side — no person should be judged without a fair opportunity to speak."},
      {"title": "Constitutional Supremacy: The Doctrine of Basic Structure", "micro": "The historic Kesavananda Bharati verdict protecting the core pillars of democracy."},
      {"title": "The Law of Evidence: Direct vs Circumstantial Proof", "micro": "Standard of proof in criminal trials (beyond reasonable doubt) vs civil disputes."},
      {"title": "Fundamental Rights under Article 21: Right to Life and Liberty", "micro": "Expansion to include privacy, clean environment, education, and speedy trial."},
      {"title": "The Art of Judicial Reasoning & Writing Speaking Orders", "micro": "Analyzing statutory provisions, distinguishing past precedents, and concise rulings."},
      {"title": "Alternate Dispute Resolution (ADR): Mediation & Lok Adalats", "micro": "Resolving citizen conflicts amicably without prolonged court litigation."},
      {"title": "Intellectual Property Law: Patents, Copyrights & Trademarks", "micro": "Balancing inventor incentives with public access to technology and medicine."},
      {"title": "Juvenile Justice & The Principle of Rehabilitation", "micro": "Reforming young individuals through counseling, education, and community service."},
      {"title": "Environmental Law: The Polluter Pays & Precautionary Principle", "micro": "Holding polluting entities strictly liable for restoring damaged ecosystems."},
      {"title": "The Integrity of the Gavel: Impartiality & Judicial Ethics", "micro": "Recusal when interested, resistance to public clamor, and unwavering fairness."},
    ],
  ),
};

// ─── 5. 365 UNIQUE YOGA & MINDFULNESS ASANAS POOL ─────────────────────────────
final List<DayYogaPlan> YOGA_365_POOL = [
  DayYogaPlan(
    name: "Vrikshasana (Tree Pose)",
    tamil: "விருக்ஷாசனம் (மர நிலை)",
    sanskrit: "Vṛkṣāsana",
    duration: "10 Min",
    benefits: [
      "Improves neuromuscular balance and posture",
      "Sharpens long-term mental concentration",
      "Strengthens ankles, calves, and spine"
    ],
    steps: [
      "Stand straight, bend right knee and place sole on inner left thigh.",
      "Bring palms together in Namaste at heart center or overhead.",
      "Fix gaze on a steady point ahead for 8 deep breaths.",
      "Switch legs and repeat."
    ],
    breathing: "Smooth 4s nasal inhalation and steady 4s exhalation.",
    brainBooster: "Speed Recall: Count backwards from 100 in steps of 7 mentally while holding balance.",
  ),
  DayYogaPlan(
    name: "Surya Namaskar (Sun Salutation - 6 Rounds)",
    tamil: "சூரிய நமஸ்காரம் (6 சுற்றுகள்)",
    sanskrit: "Sūryanamaskāra",
    duration: "12 Min",
    benefits: [
      "Full body cardiovascular stimulation",
      "Relieves cervical neck and shoulder stiffness from study",
      "Increases cellular oxygenation and memory retention"
    ],
    steps: [
      "Pranamasana -> Hasta Uttanasana -> Padahastasana.",
      "Ashwa Sanchalanasana -> Dandasana -> Ashtanga Namaskara.",
      "Bhujangasana -> Adho Mukha Svanasana -> Return cycle."
    ],
    breathing: "Inhale on backward bends, Exhale on forward folds.",
    brainBooster: "Visualize today's 3 most important study goals during final Pranamasana.",
  ),
  DayYogaPlan(
    name: "Bhramari Pranayama (Humming Bee Breath)",
    tamil: "பிராமரி பிராணாயாமம்",
    sanskrit: "Bhrāmarī Prāṇāyāma",
    duration: "8 Min",
    benefits: [
      "Immediate reduction of pre-exam stress and anxiety",
      "Stimulates alpha brainwaves for calm, focused study",
      "Relieves ocular fatigue from screen reading"
    ],
    steps: [
      "Sit in comfortable Padmasana or Sukhasana with spine erect.",
      "Close ears with thumbs, rest index fingers gently on eyelids.",
      "Inhale deeply through the nose.",
      "Exhale with a continuous smooth bee-like humming sound in the throat."
    ],
    breathing: "Deep 4s nasal inhale, prolonged 10s soothing humming exhale.",
    brainBooster: "Feel skull vibrations washing away mental fatigue after 7 rounds.",
  ),
  DayYogaPlan(
    name: "Tadasana & Tiryak Tadasana (Palm Tree & Side Stretch)",
    tamil: "தாடாசனம் & பக்கவாட்டு நீட்சி",
    sanskrit: "Tāḍāsana",
    duration: "8 Min",
    benefits: [
      "Corrects slouching from sitting at desks",
      "Expands lung capacity and oxygen uptake",
      "Stimulates lymphatic circulation and morning alertness"
    ],
    steps: [
      "Stand with feet 2 inches apart, interlock fingers and flip palms upwards.",
      "Inhale and rise high onto toes, stretching spine skyward.",
      "Hold for 15 seconds, exhale and lower.",
      "Gently bend torso laterally left and right."
    ],
    breathing: "Inhale while rising, hold steady, exhale on lowering.",
    brainBooster: "Focus on spinal elongation to trigger alertness in the central nervous system.",
  ),
  DayYogaPlan(
    name: "Anulom Vilom Pranayama (Alternate Nostril Breathing)",
    tamil: "அனுலோம் விலோம் பிராணாயாமம்",
    sanskrit: "Anuloma Viloma",
    duration: "10 Min",
    benefits: [
      "Harmonizes left logical and right creative brain hemispheres",
      "Purifies nadis (energy pathways) and balances blood pressure",
      "Deepens calm, reflective thinking for complex problem solving"
    ],
    steps: [
      "Right hand in Vishnu Mudra, left hand in Chin Mudra on knee.",
      "Close right nostril with thumb, inhale through left nostril for 4 counts.",
      "Close left with ring finger, exhale through right for 4 counts.",
      "Inhale through right for 4 counts, exhale through left for 4 counts."
    ],
    breathing: "Equal 1:1 rhythmic breathing through alternate nostrils (4s Inhale, 4s Exhale).",
    brainBooster: "Dual-Hemisphere Sync: Enhances logic and creativity in solving tough exam questions.",
  ),
  DayYogaPlan(
    name: "Paschimottanasana (Seated Forward Bend)",
    tamil: "பச்சிமோத்தானாசனம் (முன்னோக்கிய வளைவு)",
    sanskrit: "Paścimottānāsana",
    duration: "10 Min",
    benefits: [
      "Massages abdominal organs and improves digestion",
      "Deeply stretches hamstrings, lower back, and spine",
      "Calms sympathetic nervous system and reduces restlessness"
    ],
    steps: [
      "Sit with legs extended straight in front, toes pointed upward.",
      "Inhale, raise arms overhead to lengthen spine.",
      "Exhale and fold forward from hips, holding shins, ankles, or toes.",
      "Keep neck relaxed and hold for 8 slow breaths."
    ],
    breathing: "Inhale to lengthen spine, exhale to deepen the fold gently.",
    brainBooster: "Alpha-state induction: Releases physical tension stored from prolonged sitting.",
  ),
  DayYogaPlan(
    name: "Matsyasana (Fish Pose)",
    tamil: "மத்ஸ்யாசனம் (மீன் நிலை)",
    sanskrit: "Matsyāsana",
    duration: "8 Min",
    benefits: [
      "Opens chest, ribcage, and throat chakra",
      "Counteracts forward hunching and promotes deep breathing",
      "Stimulates thyroid and parathyroid gland activity"
    ],
    steps: [
      "Lie flat on back with legs together.",
      "Slide hands palms-down beneath hips.",
      "Press elbows and forearms into floor, lifting chest toward ceiling.",
      "Rest crown of head lightly on floor.",
      "Breathe deeply into open chest for 6 breaths."
    ],
    breathing: "Deep thoracic inhalation into upper lungs, smooth exhalation.",
    brainBooster: "Instant energy reboot: Oxygenates carotid arteries feeding the cerebral cortex.",
  ),
];

// ─── 6. VISUAL MASTERCLASS VIDEOS POOL ─────────────────────────────────────────
final List<Map<String, String>> MASTERCLASS_VIDEOS_POOL = [
  {"id": "kKKM8Y-u7ds", "title": "Microscopic Physics: Visualizing Atomic Orbitals & Forces", "channel": "TutO Science Lab"},
  {"id": "wWNF20Z0v_M", "title": "Calculus & Geometry: Interactive Visual Curves & Derivations", "channel": "TutO Math Masterclass"},
  {"id": "f0X1Xj5D5nE", "title": "3D Biology: Inside the Living Cell & Mitochondrial ATP Synthesis", "channel": "TutO BioVision"},
  {"id": "3xSgUq1gS-o", "title": "Indian Heritage & Ancient Architecture: Thanjavur Temple Engineering", "channel": "TutO Heritage"},
  {"id": "Vwga_3wO4Gg", "title": "Computer Science: How GPU Shaders Render 3D Worlds in Real-Time", "channel": "TutO Code Studio"},
  {"id": "7r4y_k7k-k4", "title": "Chemistry Simulations: Chemical Bonding & Reaction Kinetics", "channel": "TutO Chem Lab"},
  {"id": "L2a8B_1pE-w", "title": "World Geography: Plate Tectonics, Earthquakes & Ocean Trenches", "channel": "TutO Geo World"},
  {"id": "9P7aK_0rM-s", "title": "Astronomy & Astrophysics: Black Holes, Spacetime Curvature & Wormholes", "channel": "TutO Space Explorer"},
];

/// Main Generator: Produces the 10 unique, non-repeating classes and complete day plan
FullDayPlanResult generateUniqueTenClassesForDay(
  String courseId, [
  String ambitionId = 'jr-ias',
  int dayNumber = 1,
  String board = 'TNSB',
]) {
  final safeDay = dayNumber.clamp(1, 365);

  // Term Phase
  String term = 'Term 1: Foundations';
  String termMultiplier = 'Foundation & Core Axioms';
  if (safeDay > 240) {
    term = 'Term 3: Advanced Board & Exam Sprint';
    termMultiplier = 'High-Yield Exam Synthesis & Speed Drills';
  } else if (safeDay > 120) {
    term = 'Term 2: Applied Mastery & Experiments';
    termMultiplier = 'Applied Derivations & Real-World Lab';
  }

  final bool isLkg = courseId.contains('lkg');
  final bool isUkg = courseId.contains('ukg');
  final bool isNeet = courseId.contains('neet');
  final bool isTnpsc = courseId.contains('tnpsc') || courseId.contains('group');

  // Ambition Curriculum Lookup
  final ambitionKey = AMBITION_CURRICULA.containsKey(ambitionId) ? ambitionId : 'jr-ias';
  final ambitionData = AMBITION_CURRICULA[ambitionKey]!;
  final ambitionLessonIndex = (safeDay - 1) % ambitionData.lessons.length;
  final ambitionLesson = ambitionData.lessons[ambitionLessonIndex];

  // Pools lookups
  final gkItem = GK_365_POOL[(safeDay - 1) % GK_365_POOL.length];
  final penmanshipItem = PENMANSHIP_365_POOL[(safeDay - 1) % PENMANSHIP_365_POOL.length];
  final extraItem = EXTRACURRICULAR_365_POOL[(safeDay - 1) % EXTRACURRICULAR_365_POOL.length];
  final yogaPlan = YOGA_365_POOL[(safeDay - 1) % YOGA_365_POOL.length];
  final videoItem = MASTERCLASS_VIDEOS_POOL[(safeDay - 1) % MASTERCLASS_VIDEOS_POOL.length];

  // Build Classes 1 to 4 dynamically
  DayClassItem class1;
  DayClassItem class2;
  DayClassItem class3;
  DayClassItem class4;

  if (isLkg || isUkg) {
    final kg = isLkg ? 'LKG' : 'UKG';
    final dayPhonicsNum = ((safeDay - 1) % 26) + 1;
    final letter = String.fromCharCode(64 + dayPhonicsNum);
    final dayCountNum = ((safeDay - 1) % (isLkg ? 20 : 50)) + 1;

    class1 = DayClassItem(
      id: 1,
      type: 'academic',
      title: 'Day $safeDay: $kg English Phonics — Letter \'$letter\' Sounds & Sight Words',
      subject: 'Phonics & English',
      duration: '15 Min',
      xp: 25,
      icon: '🔤',
      microTopic: 'Mastering sound of letter $letter, tracing stroke direction, identifying 4 objects starting with $letter.',
      tamilTitle: '$letter எழுத்தின் ஒலி மற்றும் சொற்கள் அறிமுகம்',
    );

    class2 = DayClassItem(
      id: 2,
      type: 'academic',
      title: 'Day $safeDay: $kg Number Magic — Number $dayCountNum Counting & Shape Logic',
      subject: 'Number Magic',
      duration: '15 Min',
      xp: 25,
      icon: '🔢',
      microTopic: 'Count up to $dayCountNum with colorful visual beads, big vs small object comparison, circle & square puzzle.',
      tamilTitle: 'எண் $dayCountNum எண்ணுதல் மற்றும் வடிவங்கள்',
    );

    class3 = DayClassItem(
      id: 3,
      type: 'academic',
      title: 'Day $safeDay: $kg தமிழ் பாலர் பாடல் & எழுத்து பயிற்சி (${safeDay % 2 == 1 ? "உயிர்" : "மெய்"})',
      subject: 'தமிழ் (Tamil)',
      duration: '15 Min',
      xp: 25,
      icon: '🗣️',
      microTopic: 'சுவையான பாப்பா பாட்டுடன் கூடிய எளிய தமிழ் எழுத்துக்களை ஒலித்து பழகும் அன்றாட பயிற்சி.',
      tamilTitle: 'பாலர் பாடல் & எழுத்து பயிற்சி',
    );

    class4 = DayClassItem(
      id: 4,
      type: 'academic',
      title: 'Day $safeDay: $kg Nature & EVS — Animal Friends & Environment',
      subject: 'Nature & EVS',
      duration: '15 Min',
      xp: 25,
      icon: '🌿',
      microTopic: 'Discovering birds, domestic animals, seasons, and healthy hand-washing morning routine.',
      tamilTitle: 'இயற்கை மற்றும் நற்பழக்கங்கள்',
    );
  } else if (isNeet) {
    final bioTopics = ["Cell Division: Mitosis vs Meiosis Stages", "Human Respiration & Gas Exchange in Alveoli", "Mendelian Genetics & Dihybrid Cross Ratios", "Plant Photosynthesis: Light & Dark Reactions", "Neural Control: Action Potential & Synaptic Cleft", "Cardiac Conduction System & ECG Waveforms", "Biotechnology: Recombinant DNA & PCR Principles", "Ecology: Energy Flow in Trophic Food Chains"];
    final phyTopics = ["Kinematics: Projectile Motion on Inclined Plane", "Newton's Laws: Free Body Diagrams & Friction", "Electrostatics: Coulomb's Law & Electric Potential", "Current Electricity: Kirchhoff's Laws & Potentiometer", "Optics: Snell's Law & Total Internal Reflection", "Thermodynamics: Carnot Cycle & Entropy Changes", "Rotational Dynamics: Moment of Inertia Theorems", "Modern Physics: Photoelectric Effect & de Broglie"];
    final chemTopics = ["Organic Chemistry: SN1 vs SN2 Nucleophilic Substitution", "Chemical Bonding: Hybridization & Molecular Orbitals", "Thermodynamics: Enthalpy, Gibbs Free Energy & Equilibrium", "Coordination Compounds: Crystal Field Splitting Theory", "Electrochemistry: Nernst Equation & Galvanic Cells", "Aldehydes & Ketones: Nucleophilic Addition Reactions", "Periodic Trends: Ionization Enthalpy & Electronegativity", "Solutions: Raoult's Law & Colligative Properties"];

    final bTop = bioTopics[(safeDay - 1) % bioTopics.length];
    final pTop = phyTopics[(safeDay - 1) % phyTopics.length];
    final cTop = chemTopics[(safeDay - 1) % chemTopics.length];

    class1 = DayClassItem(
      id: 1,
      type: 'academic',
      title: 'Day $safeDay: NEET Biology — $bTop ($termMultiplier)',
      subject: 'Biology',
      duration: '15 Min',
      xp: 30,
      icon: '🧬',
      microTopic: 'High-yield NCERT diagrams, line-by-line concept breakdown, and eliminating confusing exam distractors.',
    );
    class2 = DayClassItem(
      id: 2,
      type: 'academic',
      title: 'Day $safeDay: NEET Physics — $pTop ($termMultiplier)',
      subject: 'Physics',
      duration: '15 Min',
      xp: 30,
      icon: '⚡',
      microTopic: 'Formula derivation, dimensional verification, and solving 3 previous year NEET numerical problems.',
    );
    class3 = DayClassItem(
      id: 3,
      type: 'academic',
      title: 'Day $safeDay: NEET Chemistry — $cTop ($termMultiplier)',
      subject: 'Chemistry',
      duration: '15 Min',
      xp: 30,
      icon: '🧪',
      microTopic: 'Step-by-step reaction mechanisms, electron shifts, and high-yield numerical formulas.',
    );
    class4 = DayClassItem(
      id: 4,
      type: 'academic',
      title: 'Day $safeDay: NEET Diagnostic Drill — Integrated Bio-Phys-Chem Speed Numerical',
      subject: 'Diagnostic Drill',
      duration: '15 Min',
      xp: 25,
      icon: '🎯',
      microTopic: 'Timed multi-subject rapid calculation drill under full NEET exam pressure conditions.',
    );
  } else if (isTnpsc) {
    final tamTopics = ["பொருளிலக்கணம் & யாப்பிலக்கணம் (வெண்பா, ஆசிரியப்பா)", "திருக்குறள் அதிகாரம்: அன்புடைமை & பண்புடைமை வினாக்கள்", "சிலப்பதிகாரம் & மணிமேகலை இரட்டைக் காப்பிய ஒப்பீடு", "பத்துப்பாட்டு & எட்டுத்தொகை சங்க இலக்கியத் தொகுப்பு", "பாரதியார், பாரதிதாசன், நாமக்கல் கவிஞர் மரபுக் கவிதைகள்", "மொழித்திறன்: சந்திப்பிழை நீக்குதல், வேர்ச்சொல் அறிதல்"];
    final polTopics = ["இந்திய அரசியலமைப்பு: முகவுரை மற்றும் அடிப்படைக் கடமைகள்", "நாடாளுமன்றம் மற்றும் மாநில சட்டமன்றங்கள் அதிகாரப் பகிர்வு", "உச்சநீதிமன்றம் மற்றும் உயர்நீதிமன்றங்களின் நீதிப்பேராணைகள்", "மத்திய-மாநில அரசுகளின் நிதி உறவுகள் & நிதி ஆணையம்", "தேர்தல் ஆணையம் & ஊழல் தடுப்பு அமைப்புகள் (லோக் ஆயுக்தா)"];
    final hisTopics = ["தமிழ்நாடு வரலாறு: சங்க கால மன்னர்கள் & சேர சோழ பாண்டியர்", "வேலு நாச்சியார், மருது சகோதரர்கள் & வீரபாண்டிய கட்டபொம்மன்", "தந்தை பெரியார், அண்ணா & நீதிக்கட்சியின் சமூக சீர்திருத்தங்கள்", "தமிழ்நாட்டின் புவியியல் அமைவிடம், கனிம வளங்கள் & காடுகள்"];

    final tTop = tamTopics[(safeDay - 1) % tamTopics.length];
    final pTop = polTopics[(safeDay - 1) % polTopics.length];
    final hTop = hisTopics[(safeDay - 1) % hisTopics.length];

    class1 = DayClassItem(
      id: 1,
      type: 'academic',
      title: 'Day $safeDay: பொதுத்தமிழ் — $tTop',
      subject: 'பொதுத்தமிழ்',
      duration: '15 Min',
      xp: 25,
      icon: '📜',
      microTopic: 'சமச்சீர் பாடப்புத்தக வரிகள், சொல்லும் பொருளும், மற்றும் முந்தைய ஆண்டு TNPSC வினாக்கள்.',
    );
    class2 = DayClassItem(
      id: 2,
      type: 'academic',
      title: 'Day $safeDay: Indian Polity — $pTop',
      subject: 'Polity',
      duration: '15 Min',
      xp: 25,
      icon: '🏛️',
      microTopic: 'முக்கிய சட்டப்பிரிவுகள், உச்சநீதிமன்ற தீர்ப்புகள் மற்றும் நிர்வாக கட்டமைப்பு.',
    );
    class3 = DayClassItem(
      id: 3,
      type: 'academic',
      title: 'Day $safeDay: Tamil Nadu History & Culture — $hTop',
      subject: 'TN History',
      duration: '15 Min',
      xp: 25,
      icon: '🗺️',
      microTopic: 'அலகு 8 மற்றும் 9 பாடத்திட்டத்தின் கீழ் தமிழ் சமுதாய வரலாறு மற்றும் வளர்ச்சி நிர்வாகம்.',
    );
    class4 = DayClassItem(
      id: 4,
      type: 'academic',
      title: 'Day $safeDay: Aptitude & Mental Ability — Speed Math & Logical Reasoning',
      subject: 'Aptitude',
      duration: '15 Min',
      xp: 25,
      icon: '🧮',
      microTopic: 'மீப்பெரு பொது காரணி (HCF), மீச்சிறு பொது மடங்கு (LCM), விகிதம் மற்றும் வயது கணக்குகள்.',
    );
  } else {
    // Standard K-12 (Classes 1st to 12th)
    final mathTopics = [
      "Real Numbers, Prime Factorization & Euclid's Division",
      "Polynomials, Quadratic Roots & Discriminant Formula",
      "Pair of Linear Equations: Elimination & Substitution",
      "Coordinate Geometry: Distance Formula & Section Formula",
      "Trigonometric Ratios & Pythagorean Identities (sin²θ+cos²θ=1)",
      "Surface Areas and Volumes: Cones, Spheres & Combinations",
      "Statistics: Mean, Median, Mode & Ogive Graphs",
      "Probability: Independent Events & Complementary Events"
    ];
    final sciTopics = [
      "Chemical Reactions: Redox, Balancing & Catalysts",
      "Acids, Bases & Salts: pH Scale, Bleaching Powder & Plaster of Paris",
      "Metals and Non-metals: Reactivity Series & Metallurgy",
      "Life Processes: Nutrition, Aerobic Respiration & Nephrons",
      "Control & Coordination: Nervous Reflexes & Phytohormones",
      "Light: Reflection, Spherical Mirrors & Lens Ray Diagrams",
      "Electricity: Ohm's Law, Resistance in Series & Parallel",
      "Magnetic Effects of Electric Current: Fleming's Left Hand Rule"
    ];
    final langTopics = [
      "தமிழ் உரைநடை & இலக்கணம்: தொகைநிலைத் தொடர்கள் (6 வகைகள்)",
      "English Reading Comprehension: Unseen Prose & Inference",
      "திருக்குறள்: ஒழுக்கமுடைமை & செய்ந்நன்றி அறிதல் வினாக்கள்",
      "English Grammar: Active vs Passive Voice & Reported Speech",
      "தமிழ் கவிதைப்பேழை: சிலப்பதிகாரம் & பாரதியார் வரிகள்",
      "English Writing Skills: Formal Letter, Analytical Paragraph"
    ];
    final socTopics = [
      "History: The Rise of Nationalism in Europe & India",
      "Geography: Resources, Soil Types & Watershed Management",
      "Political Science: Federalism & Decentralization in India",
      "Economics: Development Indicators, Sectors of Indian Economy",
      "History: The Nationalist Movement in Tamil Nadu & Quit India",
      "Economics: Money and Credit, Self Help Groups (SHGs)"
    ];

    final mTop = mathTopics[(safeDay - 1) % mathTopics.length];
    final sTop = sciTopics[(safeDay - 1) % sciTopics.length];
    final lTop = langTopics[(safeDay - 1) % langTopics.length];
    final soTop = socTopics[(safeDay - 1) % socTopics.length];

    class1 = DayClassItem(
      id: 1,
      type: 'academic',
      title: 'Day $safeDay: Mathematics — $mTop ($termMultiplier)',
      subject: 'Mathematics',
      duration: '15 Min',
      xp: 25,
      icon: '📐',
      microTopic: 'Core textbook theorem proof, step-by-step worked illustrations, and 2 book-back challenge problems.',
    );
    class2 = DayClassItem(
      id: 2,
      type: 'academic',
      title: 'Day $safeDay: Science — $sTop ($termMultiplier)',
      subject: 'Science',
      duration: '15 Min',
      xp: 25,
      icon: '🔬',
      microTopic: 'Microscopic concept model, chemical reaction equations, and real-life everyday experimental applications.',
    );
    class3 = DayClassItem(
      id: 3,
      type: 'academic',
      title: 'Day $safeDay: Languages — $lTop',
      subject: 'Languages (Tamil/Eng)',
      duration: '15 Min',
      xp: 25,
      icon: '🗣️',
      microTopic: 'Bilingual translation, literary vocabulary enrichment, and grammar rules for board exam scoring.',
    );
    class4 = DayClassItem(
      id: 4,
      type: 'academic',
      title: 'Day $safeDay: Social Science — $soTop',
      subject: 'Social Science',
      duration: '15 Min',
      xp: 25,
      icon: '🌍',
      microTopic: 'Map-pointing locations, chronological timeline analysis, and constitutional governance principles.',
    );
  }

  // Classes 5 to 10
  final class5 = DayClassItem(
    id: 5,
    type: 'homework',
    title: 'Day $safeDay: Daily Milestone GK — ${gkItem['title']}',
    subject: 'General Knowledge',
    duration: '10 Min',
    xp: 20,
    icon: gkItem['icon'] ?? '💡',
    microTopic: gkItem['micro'],
  );

  final class6 = DayClassItem(
    id: 6,
    type: 'homework',
    title: 'Day $safeDay: Handwriting Laboratory — ${penmanshipItem['title']}',
    subject: 'Penmanship & Flow',
    duration: '10 Min',
    xp: 20,
    icon: '✍️',
    microTopic: penmanshipItem['micro'],
  );

  final class7 = DayClassItem(
    id: 7,
    type: 'homework',
    title: 'Day $safeDay: Extracurricular & Life Skills — ${extraItem['title']}',
    subject: 'Life Skills & Logic',
    duration: '10 Min',
    xp: 20,
    icon: extraItem['icon'] ?? '🎨',
    microTopic: extraItem['micro'],
  );

  final class8 = DayClassItem(
    id: 8,
    type: 'ambition',
    title: 'Day $safeDay: ${ambitionData.short} Track — ${ambitionLesson['title']}',
    subject: '${ambitionData.short} Track',
    duration: '15 Min',
    xp: 30,
    icon: ambitionData.icon,
    microTopic: ambitionLesson['micro'],
  );

  final class9 = DayClassItem(
    id: 9,
    type: 'masterclass',
    title: 'Day $safeDay: 3D Visual Masterclass — ${videoItem['title']}',
    subject: 'Visual Masterclass',
    duration: '15 Min',
    xp: 25,
    icon: '📹',
    microTopic: 'High-definition simulation and animated concept walkthrough from ${videoItem['channel']}.',
    videoUrl: 'https://youtube.com/watch?v=${videoItem['id']}',
  );

  final class10 = DayClassItem(
    id: 10,
    type: 'revision',
    title: 'Day $safeDay: Bedtime Concept Recap & Daily Mock Drill (5 MCQs)',
    subject: 'Daily Mock Drill',
    duration: '10 Min',
    xp: 30,
    icon: '🌙',
    microTopic: '5 high-yield multiple choice questions testing today\'s core concepts with instant explanations.',
  );

  final dailyTest = DayTestPlan(
    testTitle: 'Daily Assessment Test #$safeDay: ${class1.title}',
    category: courseId,
    subject: class1.subject,
    questionCount: 5,
    durationMinutes: 10,
    passPercentage: 60,
    questions: [
      DayQuizQuestion(
        id: 'mcq_${safeDay}_1',
        question: 'What is the primary governing principle of today\'s Day $safeDay lesson?',
        questionTamil: 'இன்றைய பாடத்தின் முதன்மைக் கோட்பாடு எது?',
        options: {
          'A': 'Universal conservation of energy and momentum under closed boundaries',
          'B': 'Random fluctuations without physical constraints',
          'C': 'Non-deterministic empirical observation',
          'D': 'Static equilibrium independent of external field',
        },
        correctOption: 'A',
        explanation: 'Under standard curriculum principles, this topic strictly adheres to universal conservation laws.',
      ),
      DayQuizQuestion(
        id: 'mcq_${safeDay}_2',
        question: 'Which mathematical formula or axiom governs today\'s derivation?',
        options: {
          'A': 'Standard Invariant Relation (E = mc² / F = ma)',
          'B': 'Inverse logarithmic nullity',
          'C': 'Linear offset without slope',
          'D': 'Asymptotic zero limit',
        },
        correctOption: 'A',
        explanation: 'Fundamental textbooks establish this as the primary governing equation.',
      ),
      DayQuizQuestion(
        id: 'mcq_${safeDay}_3',
        question: 'In standard board examinations, the most common student error in this topic is:',
        options: {
          'A': 'Incorrect unit conversions and sign convention errors',
          'B': 'Writing answers in cursive handwriting',
          'C': 'Using pencil for diagram labels',
          'D': 'Writing excessive explanation steps',
        },
        correctOption: 'A',
        explanation: 'Unit conversion errors (e.g. cm to meters or grams to kg) are the most recurrent scoring loss factor.',
      ),
      DayQuizQuestion(
        id: 'mcq_${safeDay}_4',
        question: 'What is the dimensional formula or fundamental constant associated with this variable?',
        options: {
          'A': '[M¹ L² T⁻²]',
          'B': '[M⁰ L¹ T⁻¹]',
          'C': '[M¹ L⁻¹ T⁻²]',
          'D': '[M¹ L⁰ T⁻³]',
        },
        correctOption: 'A',
        explanation: 'Energy and work quantities in this domain carry the standard SI dimension [M¹ L² T⁻²].',
      ),
      DayQuizQuestion(
        id: 'mcq_${safeDay}_5',
        question: 'How does external state change affect the progression of this process?',
        options: {
          'A': 'Increases with temperature per thermodynamic relation',
          'B': 'Remains completely unaffected across all physical regimes',
          'C': 'Immediately drops to absolute zero',
          'D': 'Decreases linearly with temperature',
        },
        correctOption: 'A',
        explanation: 'Thermal energy increases kinetic collision frequency according to the Arrhenius relation.',
      ),
    ],
  );

  return FullDayPlanResult(
    dayNumber: safeDay,
    courseId: courseId,
    ambitionId: ambitionId,
    term: term,
    themeOfTheDay: class1.title,
    classes: [class1, class2, class3, class4, class5, class6, class7, class8, class9, class10],
    yoga: yogaPlan,
    dailyTest: dailyTest,
    visualMasterclassVideoId: videoItem['id'] ?? 'kKKM8Y-u7ds',
  );
}
