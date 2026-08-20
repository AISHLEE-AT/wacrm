/**
 * TeachO Master Curriculum — K-12 Classes (Samacheer Kalvi & CBSE NCERT)
 * Complete Chapter-by-Chapter Academic Modules for Class 1 to 12 & Degree Majors
 */

export interface SchoolChapter {
  chapterNum: number;
  chapterTitle: string;
  subtopics: string[];
  keyConcepts: string[];
}

// ── 1. PRIMARY SCHOOL TUITION (CLASS 1 TO 5) ─────────────────────────────────
export const PRIMARY_MATHS_MODULES: SchoolChapter[] = [
  {
    chapterNum: 1,
    chapterTitle: 'Number Magic & Counting (1 to 100)',
    subtopics: ['Counting with Objects & Beads', 'Forward & Backward Counting', 'Before, After and Between Numbers', 'Number Names in Words'],
    keyConcepts: ['One-to-one object correspondence', 'Comparing quantities (> < =)', 'Tens and Ones grouping']
  },
  {
    chapterNum: 2,
    chapterTitle: 'Addition & Subtraction Adventures',
    subtopics: ['Single-Digit Addition with Pictures', 'Number Line Jumps', 'Carrying Over Tens', 'Word Problems on Sharing'],
    keyConcepts: ['Addition means putting together (+)', 'Subtraction means taking away (-)', 'Zero property of addition']
  },
  {
    chapterNum: 3,
    chapterTitle: 'Multiplication Tables & Division Play',
    subtopics: ['Tables 2 to 10 Made Easy with Songs', 'Repeated Addition Concept', 'Equal Sharing and Grouping', 'Division with Remainders'],
    keyConcepts: ['Multiplication is repeated addition', 'Division is equal distribution', '2 × 5 = 10, 10 ÷ 2 = 5']
  },
  {
    chapterNum: 4,
    chapterTitle: 'Shapes, Space & Patterns',
    subtopics: ['2D Shapes: Circle, Square, Triangle, Rectangle', '3D Shapes: Cube, Cone, Cylinder, Sphere', 'Symmetry & Nature Patterns', 'Clock Time Reading'],
    keyConcepts: ['Sides and corners of polygons', 'Clock hands: Short hand (Hour), Long hand (Minute)', 'Repeating visual patterns']
  },
  {
    chapterNum: 5,
    chapterTitle: 'Fractions, Money & Measurement',
    subtopics: ['Half (1/2), Quarter (1/4) and Three-Fourths (3/4)', 'Indian Rupee Notes & Coins calculation', 'Length (m/cm), Weight (kg/g) and Capacity (L/ml)', 'Data Pictographs'],
    keyConcepts: ['Fraction represents part of a whole', '1 Rupee = 100 Paise', '1 Kilogram = 1000 Grams']
  }
];

export const PRIMARY_EVS_SCIENCE: SchoolChapter[] = [
  {
    chapterNum: 1,
    chapterTitle: 'My Amazing Body & Five Senses',
    subtopics: ['Eyes, Ears, Nose, Tongue and Skin', 'Good Touch & Safe Habits', 'Healthy Food for Strong Bones', 'Daily Dental & Body Hygiene'],
    keyConcepts: ['Five sense organs help us explore the world', 'Eat balanced diet with fruits and vegetables', 'Wash hands before every meal']
  },
  {
    chapterNum: 2,
    chapterTitle: 'Plant Kingdom & Nature Friends',
    subtopics: ['Parts of a Plant: Root, Stem, Leaf, Flower, Fruit', 'Trees, Shrubs, Herbs and Climbers', 'How Seeds Grow into Plants (Germination)', 'Leaves and Photosynthesis basics'],
    keyConcepts: ['Plants need Sunlight, Air, Water, and Soil to grow', 'Chlorophyll gives green color to leaves', 'Trees give us Oxygen and Shade']
  },
  {
    chapterNum: 3,
    chapterTitle: 'Animal World & Habitats',
    subtopics: ['Domestic, Wild and Farm Animals', 'Birds, Insects and Water Animals', 'Animal Homes and Sounds', 'Food Habits: Herbivore, Carnivore, Omnivore'],
    keyConcepts: ['Animals adapt to land, water, or air', 'Birds have feathers and hollow bones to fly', 'Respect and protect stray and wild animals']
  },
  {
    chapterNum: 4,
    chapterTitle: 'Water, Air & Weather Seasons',
    subtopics: ['Sources of Fresh Water: Rain, River, Well', 'Importance of Saving Water', 'Air has Weight and Fills Space', 'Four Seasons in India: Summer, Monsoon, Autumn, Winter'],
    keyConcepts: ['Water Cycle: Rain gives life to earth', 'Never waste drinking water', 'Wear cotton in summer and wool in winter']
  },
  {
    chapterNum: 5,
    chapterTitle: 'Our Community, Family & Safety Rules',
    subtopics: ['My Loving Family & Relatives', 'Community Helpers: Teacher, Doctor, Farmer, Police', 'Traffic Signals and Road Safety', 'Clean Earth & Recycling Waste'],
    keyConcepts: ['Red Light: Stop, Yellow: Wait, Green: Go', 'Throw dry and wet waste in proper dustbins', 'Respect all community workers']
  }
];

export const PRIMARY_LANGUAGE_LIT: SchoolChapter[] = [
  {
    chapterNum: 1,
    chapterTitle: 'Phonics, Alphabets & Tamil Vowels (உயிர் எழுத்துகள்)',
    subtopics: ['Phonics Sounds A-Z with Rhymes', 'CVC 3-Letter Words (Cat, Sun, Pen)', 'தமிழ் உயிர் எழுத்துகள் (12) அ முதல் ஔ வரை', 'ஆய்த எழுத்து (ஃ)'],
    keyConcepts: ['Phoneme blending creates words', 'அம்மா, ஆடு, இலை, ஈட்டி உச்சரிப்பு', 'Reading short story sentences']
  },
  {
    chapterNum: 2,
    chapterTitle: 'Vocabulary, Sight Words & மெய் எழுத்துகள் (18)',
    subtopics: ['Sight Words: The, Is, In, On, Under, With', 'மெய் எழுத்துகள் க் முதல் ன் வரை', 'வல்லினம் (கசடதபற), மெல்லினம் (ஙஞணநமன), இடையினம் (யரலவழள)', 'Simple Sentence Formation'],
    keyConcepts: ['Subject + Verb + Object structure', 'மெய் எழுத்துகள் புள்ளி வைத்த எழுத்துகள்', 'Opposite words and rhyming pairs']
  },
  {
    chapterNum: 3,
    chapterTitle: 'Aathichudi, Moral Stories & Reading Comprehension',
    subtopics: ['ஔவையார் ஆத்திசூடி (12 வரிகள் நயவுரை)', 'Aesop Moral Fables: Tortoise and Hare, Thirsty Crow', 'Describing Picture Scenes in 3 Sentences', 'Spelling & Handwriting Practice'],
    keyConcepts: ['"அறஞ்செய விரும்பு" — எப்போதும் நல்ல செயல்களைச் செய்', 'Punctuation: Capital letters, full stop, question mark', 'Moral values of honesty and perseverance']
  }
];

// ── 2. MIDDLE SCHOOL TUITION (CLASS 6 TO 8) ─────────────────────────────────
export const MIDDLE_MATHS: SchoolChapter[] = [
  {
    chapterNum: 1,
    chapterTitle: 'Integers, Fractions & Rational Numbers',
    subtopics: ['Properties of Integer Addition & Multiplication', 'Fractions & Decimals Operations', 'Rational Numbers on Number Line', 'Exponents & Powers'],
    keyConcepts: ['(-a) × (-b) = +(ab)', 'BODMAS / PEMDAS order of operations', 'Scientific notation: a × 10^b']
  },
  {
    chapterNum: 2,
    chapterTitle: 'Algebraic Expressions & Simple Equations',
    subtopics: ['Constants, Variables & Terms', 'Like and Unlike Terms', 'Linear Equations in One Variable (ax + b = c)', 'Word Problems on Age & Numbers'],
    keyConcepts: ['Transposition preserves equality', 'Distributive Law: a(b+c) = ab + ac', 'Formulating equations from word problems']
  },
  {
    chapterNum: 3,
    chapterTitle: 'Geometry, Lines, Angles & Triangles',
    subtopics: ['Complementary and Supplementary Angles', 'Parallel Lines & Transversal', 'Angle Sum Property of Triangle (180°)', 'Congruence of Triangles (SSS, SAS, ASA, RHS)'],
    keyConcepts: ['Alternate interior angles are equal', 'Exterior angle = Sum of two interior opposite angles', 'Pythagoras Theorem: a² + b² = c²']
  },
  {
    chapterNum: 4,
    chapterTitle: 'Commercial Arithmetic: Ratio, Percentage & Profit/Loss',
    subtopics: ['Ratio and Proportion', 'Unitary Method', 'Percentage to Fraction Conversion', 'Simple Interest: I = (P×N×R)/100'],
    keyConcepts: ['Profit = Selling Price - Cost Price', 'Discount is calculated on Marked Price', 'Interest calculation for savings']
  }
];

export const MIDDLE_SCIENCE: SchoolChapter[] = [
  {
    chapterNum: 1,
    chapterTitle: 'Matter, Materials, Acids & Chemical Changes',
    subtopics: ['Physical vs Chemical Changes', 'Acids, Bases and Natural Indicators (Litmus, Turmeric)', 'Separation of Substances: Filtration, Evaporation, Distillation', 'Metals and Non-Metals in Daily Life'],
    keyConcepts: ['Chemical change is irreversible and forms new substances', 'Acid turns blue litmus red; Base turns red litmus blue', 'Rusting requires Iron, Oxygen, and Water']
  },
  {
    chapterNum: 2,
    chapterTitle: 'Motion, Force, Pressure & Light',
    subtopics: ['Types of Motion: Rectilinear, Circular, Periodic', 'Speed = Distance / Time calculation', 'Atmospheric Pressure & Friction', 'Reflection of Light & Plane Mirrors'],
    keyConcepts: ['Slope of distance-time graph represents speed', 'Friction opposes relative motion and generates heat', 'Angle of incidence = Angle of reflection (∠i = ∠r)']
  },
  {
    chapterNum: 3,
    chapterTitle: 'Living Organisms: Nutrition, Respiration & Reproduction',
    subtopics: ['Autotrophic & Heterotrophic Nutrition in Plants', 'Human Digestive & Respiratory Organs', 'Cell Structure: Plant vs Animal Cell', 'Reproduction in Plants: Pollination & Seed Dispersal'],
    keyConcepts: ['Photosynthesis: 6CO2 + 6H2O -> C6H12O6 + 6O2', 'Mitochondria is powerhouse of cell', 'Wind, water, and insects assist pollination']
  }
];

// ── 3. CLASS 10 SECONDARY (SSLC / CBSE) ──────────────────────────────────────
export const CLASS_10_MATHS: SchoolChapter[] = [
  { chapterNum: 1, chapterTitle: 'Real Numbers & Euclid Division', subtopics: ['Euclid Division Lemma', 'Fundamental Theorem of Arithmetic', 'Irrationality Proofs', 'Decimal Expansions'], keyConcepts: ['HCF(a,b) × LCM(a,b) = a × b', 'Proof that √2, √3 are irrational', 'Terminating vs Non-Terminating Decimals'] },
  { chapterNum: 2, chapterTitle: 'Polynomials & Quadratic Relations', subtopics: ['Geometrical Meaning of Zeroes', 'Relationship between Zeroes and Coefficients', 'Quadratic Polynomials'], keyConcepts: ['Sum of Zeroes α+β = -b/a', 'Product of Zeroes αβ = c/a', 'Factorization and Division Algorithm'] },
  { chapterNum: 3, chapterTitle: 'Pair of Linear Equations in Two Variables', subtopics: ['Graphical Method of Solution', 'Substitution & Elimination Methods', 'Cross-Multiplication Method', 'Word Problems'], keyConcepts: ['Consistent vs Inconsistent Systems', 'Conditions: a1/a2 ≠ b1/b2 (Unique)', 'Speed/Distance & Work Equations'] },
  { chapterNum: 4, chapterTitle: 'Quadratic Equations & Roots', subtopics: ['Standard Form ax²+bx+c=0', 'Factoring Method', 'Quadratic Formula & Nature of Roots'], keyConcepts: ['Quadratic Formula: x = (-b ± √(b²-4ac)) / 2a', 'Discriminant D = b² - 4ac', 'Real and Equal Roots when D = 0'] },
  { chapterNum: 5, chapterTitle: 'Arithmetic Progressions (AP)', subtopics: ['nth Term of an AP', 'Sum of First n Terms', 'Application Word Problems'], keyConcepts: ['nth Term: an = a + (n-1)d', 'Sum: Sn = n/2 [2a + (n-1)d]', 'Common difference d = a2 - a1'] },
  { chapterNum: 6, chapterTitle: 'Triangles & Similarity Theorems', subtopics: ['Basic Proportionality Theorem (Thales)', 'Converse of BPT', 'Criteria for Similarity (AAA, SSS, SAS)', 'Pythagoras Theorem'], keyConcepts: ['Thales Theorem: AD/DB = AE/EC', 'Area Ratio = Ratio of Squares of Corresponding Sides', 'Pythagoras: c² = a² + b²'] },
  { chapterNum: 7, chapterTitle: 'Coordinate Geometry & Distance', subtopics: ['Distance Formula', 'Section Formula & Midpoint', 'Area of Triangle'], keyConcepts: ['Distance: d = √((x2-x1)² + (y2-y1)²)', 'Section Formula: ((mx2+nx1)/(m+n), (my2+ny1)/(m+n))', 'Midpoint: ((x1+x2)/2, (y1+y2)/2)'] },
  { chapterNum: 8, chapterTitle: 'Introduction to Trigonometry', subtopics: ['Trigonometric Ratios (sin, cos, tan)', 'Ratios of Specific Angles (0, 30, 45, 60, 90)', 'Trigonometric Identities'], keyConcepts: ['sin²θ + cos²θ = 1', '1 + tan²θ = sec²θ', '1 + cot²θ = cosec²θ'] }
];

export const CLASS_10_SCIENCE: SchoolChapter[] = [
  { chapterNum: 1, chapterTitle: 'Chemical Reactions & Equations', subtopics: ['Writing Balanced Equations', 'Combination & Decomposition Reactions', 'Displacement & Redox Reactions'], keyConcepts: ['Law of Conservation of Mass', 'Exothermic vs Endothermic Reactions', 'Redox Reactions'] },
  { chapterNum: 2, chapterTitle: 'Acids, Bases and Salts', subtopics: ['Properties of Acids & Bases', 'pH Scale in Daily Life', 'Baking Soda, Bleaching Powder, Plaster of Paris'], keyConcepts: ['Neutralization: Acid + Base -> Salt + Water', 'pH of Blood = 7.4', 'Plaster of Paris: CaSO4 · 1/2 H2O'] },
  { chapterNum: 3, chapterTitle: 'Metals and Non-Metals', subtopics: ['Physical & Chemical Properties', 'Reactivity Series', 'Ionic Compounds Formation & Properties'], keyConcepts: ['Reactivity Series Mnemonic', 'Ionic Bonds & High Melting Points', 'Galvanization with Zinc'] },
  { chapterNum: 4, chapterTitle: 'Life Processes (Nutrition & Circulation)', subtopics: ['Photosynthesis', 'Human Digestive System', 'Respiration (Aerobic vs Anaerobic)', 'Human Circulatory System'], keyConcepts: ['Photosynthesis Equation', 'Double Circulation in 4-Chambered Heart', 'Nephron Functional Unit of Kidney'] },
  { chapterNum: 5, chapterTitle: 'Light — Reflection and Refraction', subtopics: ['Spherical Mirrors (Concave & Convex)', 'Mirror Formula & Magnification', 'Refraction & Snell Law', 'Lens Formula & Power'], keyConcepts: ['Mirror Formula: 1/f = 1/v + 1/u', 'Lens Formula: 1/f = 1/v - 1/u', 'Snell Law: sin i / sin r = constant', 'Power P = 1/f (Dioptres)'] },
  { chapterNum: 6, chapterTitle: 'Electricity & Circuits', subtopics: ['Electric Current & Potential Difference', 'Ohm Law & Resistance', 'Series & Parallel Combinations', 'Joule Heating & Power'], keyConcepts: ['Ohm Law: V = IR', 'Series: R = R1 + R2', 'Parallel: 1/R = 1/R1 + 1/R2', 'Heating Effect: H = I²Rt', 'Power: P = VI = I²R'] }
];

// ── 4. COLLEGE & DEGREE MAJOR SUBJECTS ───────────────────────────────────────
export const COLLEGE_CSE_MODULES: SchoolChapter[] = [
  { chapterNum: 1, chapterTitle: 'Data Structures & Algorithms (DSA)', subtopics: ['Arrays, Linked Lists, Stacks, Queues', 'Binary Search Trees & AVL Trees', 'Graph Traversals (BFS/DFS), Dijkstra Algorithm', 'Dynamic Programming & Big-O Complexity'], keyConcepts: ['Time & Space Complexity', 'Divide and Conquer paradigm', 'Tree balancing mechanisms'] },
  { chapterNum: 2, chapterTitle: 'Database Management Systems (DBMS & SQL)', subtopics: ['Relational Model & Normalization (1NF to BCNF)', 'ACID Properties & Transaction Concurrency', 'SQL Queries, Joins, Triggers & Indexing', 'NoSQL & Supabase PostgreSQL RLS'], keyConcepts: ['B-Tree Indexing mechanism', 'Two-Phase Locking protocol', 'Row Level Security (RLS)'] },
  { chapterNum: 3, chapterTitle: 'Operating Systems & System Architecture', subtopics: ['Process Scheduling & Thread Concurrency', 'Deadlock Detection & Banker Algorithm', 'Virtual Memory, Paging & Segmentation', 'File Systems & Linux Shell Scripting'], keyConcepts: ['Context Switching overhead', 'Mutual Exclusion & Semaphores', 'Page Fault handling'] },
  { chapterNum: 4, chapterTitle: 'Computer Networks & Web Protocols', subtopics: ['OSI & TCP/IP 7-Layer Architecture', 'IPv4/IPv6 Subnetting & Routing Protocols', 'TCP vs UDP, Three-Way Handshake', 'HTTP/HTTPS, TLS Encryption & REST APIs'], keyConcepts: ['Socket programming', 'DNS resolution flow', 'Public-Key Cryptography'] }
];

export const COLLEGE_COMMERCE_MODULES: SchoolChapter[] = [
  { chapterNum: 1, chapterTitle: 'Advanced Financial Accounting', subtopics: ['Partnership Accounts: Admission, Retirement, Dissolution', 'Company Accounts: Issue of Shares & Debentures', 'Cash Flow Statement (AS-3)', 'Final Accounts with Balance Sheet Adjustments'], keyConcepts: ['Golden Rules of Accounting', 'Debit the receiver, Credit the giver', 'Matching principle and accrual concept'] },
  { chapterNum: 2, chapterTitle: 'Corporate Law & Business Management', subtopics: ['Companies Act 2013 Provisions', 'Memorandum & Articles of Association', 'Corporate Governance & Director Duties', 'Consumer Protection & Contract Law 1872'], keyConcepts: ['Separate Legal Entity principle', 'Doctrine of Ultra Vires', 'Valid contract elements: Offer, Acceptance, Consideration'] },
  { chapterNum: 3, chapterTitle: 'Income Tax & GST Regulations', subtopics: ['Heads of Income: Salary, House Property, Business, Capital Gains', 'Deductions under Section 80C to 80U', 'Goods & Services Tax (CGST, SGST, IGST)', 'Input Tax Credit (ITC) mechanism'], keyConcepts: ['Direct vs Indirect Taxes', 'Assessment Year vs Previous Year', 'Tax filing and compliance deadlines'] }
];

// ── 5. KIDS CO-CURRICULAR & SKILLS ───────────────────────────────────────────
export const KIDS_SKILLS_MODULES: SchoolChapter[] = [
  { chapterNum: 1, chapterTitle: 'Vedic Maths & Speed Mental Math', subtopics: ['Ekadhikena Purvena (Squaring numbers ending in 5)', 'Nikhilam Sutra (Multiplication near base 100)', 'Fast Left-to-Right Addition & Subtraction', 'Criss-Cross 2-Digit Mental Multiplication'], keyConcepts: ['Instant mental calculation without pen/paper', 'Eliminates math fear with playful tricks', 'Speed checking with Digit Sums'] },
  { chapterNum: 2, chapterTitle: 'Coding for Kids (Block Programming & Logic)', subtopics: ['Scratch 3.0: Sprites, Motion, Sound & Animation', 'Looping (Repeat, Forever) & Conditionals (If-Then)', 'Variables, Scorekeeping & Mini Game Creation', 'Transition to Python Turtle Graphics'], keyConcepts: ['Algorithmic thinking and sequence', 'Debugging by stepping through blocks', 'Creative interactive game design'] },
  { chapterNum: 3, chapterTitle: 'Creative Arts, Drawing & Phonics Storytelling', subtopics: ['Step-by-Step Animal & Cartoon Sketching', 'Color Theory: Primary, Secondary, Warm & Cool Colors', 'Expressive Voice Modulation & Storytelling', 'Handwriting & Calligraphy Strokes'], keyConcepts: ['Visual creativity and fine motor coordination', 'Confidence in public speaking and reading', 'Perspective and proportions in art'] }
];
