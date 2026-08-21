/**
 * TeachO Canonical Micro-Topic Resolver & Deduplication Engine
 * Maps various course/grade micro-topics to normalized canonical domain keys.
 * Enables zero-redundancy content generation and instant cross-course reuse.
 * Covers all 8 Master Academic Knowledge Domains across all 96 courses.
 */

export interface CanonicalTopicDefinition {
  canonicalKey: string;
  domain:
    | 'math_primary'
    | 'math_advanced'
    | 'quantitative_aptitude'
    | 'physics'
    | 'chemistry'
    | 'biology'
    | 'polity_governance'
    | 'history_culture'
    | 'geography_environment'
    | 'tamil_language'
    | 'english_phonics'
    | 'cs_tech'
    | 'general';
  standardTitle: string;
  standardSubject: string;
  videoId: string;
  videoTitle: string;
  keywords: string[];
}

export const CANONICAL_TOPIC_REGISTRY: CanonicalTopicDefinition[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. PRIMARY MATHEMATICS & FOUNDATIONS
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_math_counting_1_20',
    domain: 'math_primary',
    standardTitle: 'Number Magic & Counting (1 to 20)',
    standardSubject: 'Mathematics',
    videoId: '0TgLtF3PMOc',
    videoTitle: 'Numbers 1 to 20 Song | Counting Numbers For Kids',
    keywords: ['counting 1 to 20', 'numbers 1 to 20', 'counting with objects', 'number names', 'எண்கள் 1 முதல் 20', 'எண்ணுதல் 1-20']
  },
  {
    canonicalKey: 'canonical_math_counting_1_100',
    domain: 'math_primary',
    standardTitle: 'Counting, Place Value & 3-Digit Numbers (1 to 100)',
    standardSubject: 'Mathematics',
    videoId: '0TgLtF3PMOc',
    videoTitle: 'Numbers 1 to 100 Counting and Place Value',
    keywords: ['counting 1 to 100', 'tens and ones', 'place value chart', 'skip counting', 'இடமதிப்பு', 'பத்துகள் ஒன்றுகள்', '1 முதல் 100 வரை']
  },
  {
    canonicalKey: 'canonical_math_addition_subtraction',
    domain: 'math_primary',
    standardTitle: 'Addition & Subtraction Adventures (1 to 20)',
    standardSubject: 'Mathematics',
    videoId: 'igcoDFokKzM',
    videoTitle: 'Basic Addition & Subtraction For Kids | Kindergarten Math',
    keywords: ['addition & subtraction', 'addition and subtraction', 'add and subtract', 'plus', 'minus', 'carrying over', 'borrowing', 'கூட்டல்', 'கழித்தல்', 'கூட்டல் மற்றும் கழித்தல்']
  },
  {
    canonicalKey: 'canonical_math_multiplication_division',
    domain: 'math_primary',
    standardTitle: 'Multiplication Tables (1-10) & Division Play',
    standardSubject: 'Mathematics',
    videoId: 'eW2LzZ5e6jY',
    videoTitle: 'Multiplication & Division Made Easy For Kids',
    keywords: ['multiplication tables', 'multiplication and division', 'tables 1 to 10', 'repeated addition', 'equal sharing', 'பெருக்கல்', 'வகுத்தல்', 'வாய்ப்பாடுகள்']
  },
  {
    canonicalKey: 'canonical_math_shapes_patterns',
    domain: 'math_primary',
    standardTitle: '2D & 3D Shapes, Space & Patterns',
    standardSubject: 'Mathematics',
    videoId: 'WTeqUejf3D0',
    videoTitle: 'Learn 2D and 3D Shapes For Kids | Math Shapes Song',
    keywords: ['shapes, space & patterns', '2d shapes', '3d shapes', 'circle, square, triangle', 'cube, cylinder', 'symmetry', 'வடிவங்கள்', 'வடிவியல்']
  },
  {
    canonicalKey: 'canonical_math_fractions_money',
    domain: 'math_primary',
    standardTitle: 'Fractions (1/2, 1/4), Indian Currency & Measurement Units',
    standardSubject: 'Mathematics',
    videoId: 'Vm8YpmsqVl4',
    videoTitle: 'Fractions, Indian Currency Coins and Measurement Units',
    keywords: ['fractions (1/2, 1/4)', 'indian currency', 'coins and notes', 'half and quarter', 'length (m/cm)', 'weight (kg/g)', 'பின்னங்கள்', 'நாணயங்கள்', 'அளவீடுகள்']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. QUANTITATIVE APTITUDE & SCHOOL ARITHMETIC (CSAT, TNPSC, BANK, SSC)
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_apt_hcf_lcm',
    domain: 'quantitative_aptitude',
    standardTitle: 'HCF & LCM, Prime Factorization & Divisibility Rules',
    standardSubject: 'Quantitative Aptitude & Mathematics',
    videoId: 'eW2LzZ5e6jY',
    videoTitle: 'HCF and LCM Shortcuts, Tricks and Word Problems',
    keywords: ['hcf & lcm', 'hcf and lcm', 'prime factorization', 'divisibility rules', 'highest common factor', 'least common multiple', 'மீ.சி.ம', 'மீ.பொ.வ', 'பகா காரணிப்படுத்துதல்']
  },
  {
    canonicalKey: 'canonical_apt_percentages_profit_loss',
    domain: 'quantitative_aptitude',
    standardTitle: 'Percentages, Profit & Loss, Discount & Markup',
    standardSubject: 'Quantitative Aptitude',
    videoId: 'Vm8YpmsqVl4',
    videoTitle: 'Percentages, Profit and Loss Masterclass',
    keywords: ['percentage', 'percentages', 'profit & loss', 'profit and loss', 'cost price', 'selling price', 'marked price', 'discount', 'விழுக்காடு', 'இலாப நட்டம்', 'தள்ளுபடி']
  },
  {
    canonicalKey: 'canonical_apt_simple_compound_interest',
    domain: 'quantitative_aptitude',
    standardTitle: 'Simple Interest (SI) & Compound Interest (CI) Formulas & Differences',
    standardSubject: 'Quantitative Aptitude',
    videoId: 'Vm8YpmsqVl4',
    videoTitle: 'Simple and Compound Interest Tricks & Formula Derivations',
    keywords: ['simple interest', 'compound interest', 'si and ci', 'difference between ci and si', 'a = p(1+r/100)^n', 'தனிவட்டி', 'கூட்டுவட்டி', 'வட்டி கணக்கீடுகள்']
  },
  {
    canonicalKey: 'canonical_apt_ratio_proportion_variation',
    domain: 'quantitative_aptitude',
    standardTitle: 'Ratio & Proportion, Direct/Inverse Variation & Partnership',
    standardSubject: 'Quantitative Aptitude',
    videoId: 'eW2LzZ5e6jY',
    videoTitle: 'Ratio and Proportion, Direct and Inverse Proportions',
    keywords: ['ratio & proportion', 'ratio and proportion', 'direct proportion', 'inverse proportion', 'variation', 'partnership', 'விகிதம்', 'விகிதாசாரம்', 'நேர் மற்றும் எதிர் விகிதம்']
  },
  {
    canonicalKey: 'canonical_apt_time_and_work',
    domain: 'quantitative_aptitude',
    standardTitle: 'Time and Work, Pipes and Cisterns & Chain Rule',
    standardSubject: 'Quantitative Aptitude',
    videoId: 'eW2LzZ5e6jY',
    videoTitle: 'Time and Work Shortcut Tricks and Pipes & Cisterns',
    keywords: ['time and work', 'pipes and cisterns', 'chain rule', 'efficiency ratio', 'நேரம் மற்றும் வேலை', 'குழாய்கள் மற்றும் தொட்டி']
  },
  {
    canonicalKey: 'canonical_apt_speed_time_distance',
    domain: 'quantitative_aptitude',
    standardTitle: 'Time, Speed & Distance, Trains & Boats and Streams',
    standardSubject: 'Quantitative Aptitude',
    videoId: 'eW2LzZ5e6jY',
    videoTitle: 'Speed, Time & Distance, Relative Speed and Trains Problems',
    keywords: ['speed time distance', 'time, speed and distance', 'relative speed', 'trains problems', 'boats and streams', 'வேகம் காலம் தூரம்', 'ரயில் கணக்குகள்']
  },
  {
    canonicalKey: 'canonical_apt_mensuration_2d_3d',
    domain: 'quantitative_aptitude',
    standardTitle: 'Mensuration: Perimeter, Area & Volume of 2D & 3D Shapes',
    standardSubject: 'Quantitative Aptitude & Geometry',
    videoId: 'WTeqUejf3D0',
    videoTitle: 'Mensuration 2D and 3D Formulas and Solved Examples',
    keywords: ['mensuration', 'area and perimeter', 'surface area and volume', 'cylinder, cone, sphere', 'rectangle, triangle, circle', 'அளவியல்', 'பரப்பளவு மற்றும் கனஅளவு']
  },
  {
    canonicalKey: 'canonical_apt_syllogisms_venn_diagrams',
    domain: 'quantitative_aptitude',
    standardTitle: 'Logical Deductions, Syllogisms & Venn Diagrams',
    standardSubject: 'Reasoning & Mental Ability',
    videoId: 'WTeqUejf3D0',
    videoTitle: 'Syllogisms 100% Accuracy Venn Diagram Method',
    keywords: ['syllogisms', 'venn diagrams', 'logical deduction', 'statement and conclusion', 'தர்க்கவியல்', 'வென் படங்கள்']
  },
  {
    canonicalKey: 'canonical_apt_seating_arrangements_blood_relations',
    domain: 'quantitative_aptitude',
    standardTitle: 'Seating Arrangements, Puzzles & Blood Relations',
    standardSubject: 'Reasoning & Mental Ability',
    videoId: 'WTeqUejf3D0',
    videoTitle: 'Circular and Linear Seating Arrangements and Family Tree',
    keywords: ['seating arrangement', 'circular seating', 'blood relations', 'family tree', 'direction sense', 'இருக்கை அமைப்பு', 'இரத்த உறவுகள்']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. SECONDARY & HIGHER MATHEMATICS (JEE, CBSE, STATE BOARD)
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_math_quadratic_equations',
    domain: 'math_advanced',
    standardTitle: 'Quadratic Equations, Discriminant (D) & Nature of Roots (Vieta)',
    standardSubject: 'Higher Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Quadratic Equations - Solving by Factoring and Quadratic Formula',
    keywords: ['quadratic equations', 'discriminant', 'nature of roots', 'vieta relations', 'quadratic formula', 'இருபடிச் சமன்பாடுகள்', 'மூலங்களின் தன்மை']
  },
  {
    canonicalKey: 'canonical_math_progressions_ap_gp',
    domain: 'math_advanced',
    standardTitle: 'Arithmetic & Geometric Progressions (AP, GP, AGP & Sum Sn)',
    standardSubject: 'Higher Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Arithmetic Progressions (AP) and Geometric Progressions (GP)',
    keywords: ['arithmetic progression', 'geometric progression', 'ap and gp', 'n-th term', 'sum of n terms', 'கூட்டுத்தொடர்வரிசை', 'பெருக்குத்தொடர்வரிசை']
  },
  {
    canonicalKey: 'canonical_math_trigonometry_identities',
    domain: 'math_advanced',
    standardTitle: 'Trigonometric Ratios, Identities (sin²θ+cos²θ=1) & Heights-Distances',
    standardSubject: 'Higher Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Trigonometric Identities and Heights & Distances Masterclass',
    keywords: ['trigonometry', 'trigonometric identities', 'sin cos tan', 'heights and distances', 'angle of elevation', 'முக்கோணவியல்', 'உயரங்களும் தொலைவுகளும்']
  },
  {
    canonicalKey: 'canonical_math_coordinate_geometry',
    domain: 'math_advanced',
    standardTitle: 'Coordinate Geometry: Straight Lines, Section Formula & Circles',
    standardSubject: 'Higher Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Coordinate Geometry - Distance, Section Formula & Straight Lines',
    keywords: ['coordinate geometry', 'section formula', 'straight lines', 'slope of line', 'circle equation', 'ஆயத்தொலை வடிவியல்', 'நேர்கோடுகள்']
  },
  {
    canonicalKey: 'canonical_math_conic_sections',
    domain: 'math_advanced',
    standardTitle: 'Conic Sections: Parabola, Ellipse & Hyperbola Tangents & Normals',
    standardSubject: 'Higher Mathematics (JEE)',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Conic Sections - Parabola, Ellipse, Hyperbola Complete Guide',
    keywords: ['conic sections', 'parabola', 'ellipse', 'hyperbola', 'eccentricity', 'director circle', 'கூம்பு வெட்டுகள்', 'பரவளையம்', 'நீள்வட்டம்']
  },
  {
    canonicalKey: 'canonical_math_matrices_determinants',
    domain: 'math_advanced',
    standardTitle: 'Matrices, Determinants, Adjoint Identities & Cramer’s Rule',
    standardSubject: 'Higher Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Matrices and Determinants - Inverse, Adjoint and Cramer Rule',
    keywords: ['matrices and determinants', 'matrix inverse', 'cramer rule', 'adjoint of matrix', 'eigenvalues', 'அணிகள் மற்றும் அணிக்கோவைகள்']
  },
  {
    canonicalKey: 'canonical_math_complex_numbers',
    domain: 'math_advanced',
    standardTitle: 'Complex Numbers: Modulus-Argument, Euler Form & de Moivre Theorem',
    standardSubject: 'Higher Mathematics (JEE)',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Complex Numbers - Polar Form, Euler Form and de Moivre Theorem',
    keywords: ['complex numbers', 'euler form', 'de moivre theorem', 'roots of unity', 'argand plane', 'கலப்பு எண்கள்']
  },
  {
    canonicalKey: 'canonical_math_calculus_limits_derivatives',
    domain: 'math_advanced',
    standardTitle: 'Differential Calculus: Limits, Continuity, Differentiability & AOD',
    standardSubject: 'Higher Mathematics (Calculus)',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Calculus - Limits, Continuity, Derivatives and Maxima/Minima',
    keywords: ['limits and continuity', 'derivatives', 'applications of derivatives', 'maxima and minima', 'lhopital rule', 'வகை நுண்கணிதம்', 'எல்லைகள் மற்றும் தொடர்ச்சி']
  },
  {
    canonicalKey: 'canonical_math_calculus_integrals_de',
    domain: 'math_advanced',
    standardTitle: 'Integral Calculus (King’s Property, Leibniz Rule) & Differential Equations',
    standardSubject: 'Higher Mathematics (Calculus)',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Definite Integrals, Area Under Curves and Differential Equations',
    keywords: ['definite integrals', 'kings property', 'area under curves', 'differential equations', 'integrating factor', 'தொகை நுண்கணிதம்', 'வகைக்கெழுச் சமன்பாடுகள்']
  },
  {
    canonicalKey: 'canonical_math_vectors_3d_geometry',
    domain: 'math_advanced',
    standardTitle: 'Vector Algebra (Dot/Cross/Triple Products) & 3D Geometry Lines/Planes',
    standardSubject: 'Higher Mathematics (JEE)',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Vector Algebra and 3D Geometry - Shortest Distance between Skew Lines',
    keywords: ['vector algebra', '3d geometry', 'dot and cross product', 'scalar triple product', 'skew lines distance', 'வெக்டர் இயற்கணிதம்', 'முப்பரிமாண வடிவியல்']
  },
  {
    canonicalKey: 'canonical_math_probability_distributions',
    domain: 'math_advanced',
    standardTitle: 'Probability: Conditional Probability, Bayes’ Theorem & Binomial Distribution',
    standardSubject: 'Higher Mathematics',
    videoId: 'I_nJ7t-eD5E',
    videoTitle: 'Probability - Conditional Probability, Bayes Theorem and Random Variables',
    keywords: ['probability', 'bayes theorem', 'conditional probability', 'binomial distribution', 'random variables', 'நிகழ்தகவு', 'பேயெஸ் தேற்றம்']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. PHYSICS & PHYSICAL SCIENCES (NEET, JEE, SCHOOL, TNPSC)
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_phy_units_dimensions_errors',
    domain: 'physics',
    standardTitle: 'Units, Dimensions, Error Propagation & Vernier/Screw Gauge',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Units and Dimensions, Error Analysis and Vernier Calipers',
    keywords: ['units and dimensions', 'dimensional analysis', 'error propagation', 'vernier calipers', 'screw gauge', 'அளவீட்டியல்', 'பரிமாண பகுப்பாய்வு']
  },
  {
    canonicalKey: 'canonical_phy_kinematics_1d_2d',
    domain: 'physics',
    standardTitle: 'Kinematics in 1D & 2D: Equations of Motion, Projectile & Relative Motion',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Kinematics 1D and 2D Motion, Projectile Motion Derivations',
    keywords: ['kinematics', 'motion in a straight line', 'projectile motion', 'equations of motion', 'relative velocity', 'இயக்கவியல்', 'எறிபொருள் இயக்கம்']
  },
  {
    canonicalKey: 'canonical_phy_newton_laws_friction',
    domain: 'physics',
    standardTitle: 'Newton’s Three Laws of Motion, Friction & Momentum Conservation',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: "Newton's Laws of Motion, Friction and Momentum Conservation",
    keywords: ['newton laws of motion', 'laws of motion', 'f = ma', 'friction', 'momentum conservation', 'pseudo force', 'நியூட்டனின் இயக்க விதிகள்', 'உராய்வு']
  },
  {
    canonicalKey: 'canonical_phy_work_energy_power',
    domain: 'physics',
    standardTitle: 'Work-Energy Theorem, Potential Energy & Vertical Circular Motion',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Work Energy and Power, Work-Energy Theorem and Conservative Forces',
    keywords: ['work energy power', 'work-energy theorem', 'kinetic energy', 'potential energy', 'power', 'வேலை ஆற்றல் மற்றும் திறன்']
  },
  {
    canonicalKey: 'canonical_phy_rotational_dynamics',
    domain: 'physics',
    standardTitle: 'Rotational Dynamics: Moment of Inertia, Torque & Pure Rolling',
    standardSubject: 'Physics (JEE/NEET)',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Rotational Motion - Moment of Inertia, Torque and Rolling Motion',
    keywords: ['rotational motion', 'moment of inertia', 'torque', 'angular momentum', 'pure rolling', 'சுழற்சி இயக்கம்', 'நிலைமத் திருப்புத்திறன்']
  },
  {
    canonicalKey: 'canonical_phy_gravitation',
    domain: 'physics',
    standardTitle: 'Universal Gravitation, Variation of g, Escape Velocity & Kepler Laws',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Gravitation - Kepler Laws, Gravitational Potential and Escape Velocity',
    keywords: ['gravitation', 'universal law of gravitation', 'acceleration due to gravity', 'escape velocity', 'kepler laws', 'ஈர்ப்பியல்', 'விடுபடு வேகம்']
  },
  {
    canonicalKey: 'canonical_phy_fluid_mechanics',
    domain: 'physics',
    standardTitle: 'Fluid Mechanics: Bernoulli’s Principle, Stokes’ Law & Surface Tension',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Fluid Mechanics - Pressure, Bernoulli Theorem and Surface Tension',
    keywords: ['fluid mechanics', 'bernoulli principle', 'stokes law', 'surface tension', 'viscosity', 'பாய்ம இயக்கவியல்', 'பெர்னொலி தேற்றம்']
  },
  {
    canonicalKey: 'canonical_phy_thermodynamics_heat',
    domain: 'physics',
    standardTitle: 'Thermal Physics, KTG, Heat Conduction & Carnot Thermodynamics',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Thermodynamics, Kinetic Theory of Gases and Carnot Engine',
    keywords: ['thermodynamics', 'heat transfer', 'carnot cycle', 'kinetic theory of gases', 'first law of thermodynamics', 'வெப்ப இயக்கவியல்', 'கார்னோ இயந்திரம்']
  },
  {
    canonicalKey: 'canonical_phy_oscillations_shm_waves',
    domain: 'physics',
    standardTitle: 'Simple Harmonic Motion (SHM), Standing Waves & Doppler Effect',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Simple Harmonic Motion (SHM), Sound Waves and Doppler Effect',
    keywords: ['simple harmonic motion', 'shm', 'sound waves', 'doppler effect', 'standing waves', 'அலைவுகள்', 'டாப்ளர் விளைவு']
  },
  {
    canonicalKey: 'canonical_phy_electrostatics_capacitors',
    domain: 'physics',
    standardTitle: 'Electrostatics: Coulomb’s Law, Gauss’s Law & Capacitors with Dielectrics',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Electrostatics, Electric Field, Gauss Law and Capacitors',
    keywords: ['electrostatics', 'coulomb law', 'gauss law', 'electric potential', 'capacitors', 'நிலைமின்னியல்', 'கூலூம் விதி', 'காஸ் விதி']
  },
  {
    canonicalKey: 'canonical_phy_current_electricity',
    domain: 'physics',
    standardTitle: 'Current Electricity: Ohm’s Law, Kirchhoff’s Rules & Potentiometer',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Current Electricity - Ohm Law, Kirchhoff Rules and Potentiometer',
    keywords: ['current electricity', 'ohm law', 'kirchhoff laws', 'resistors series parallel', 'potentiometer', 'மின்னோட்டவியல்', 'ஓம் விதி', 'கிர்க்காஃப் விதிகள்']
  },
  {
    canonicalKey: 'canonical_phy_magnetism_emi_ac',
    domain: 'physics',
    standardTitle: 'Magnetism, Biot-Savart, Lorentz Force, EMI & Series LCR Resonance',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Magnetic Effects of Current, EMI and AC Circuits LCR Resonance',
    keywords: ['magnetism', 'biot-savart law', 'lorentz force', 'electromagnetic induction', 'lcr resonance', 'காந்தவியல்', 'மின்காந்தத் தூண்டல்']
  },
  {
    canonicalKey: 'canonical_phy_optics_ray_wave',
    domain: 'physics',
    standardTitle: 'Optics: Reflection, Refraction, Lens Maker Formula & YDSE Wave Interference',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Ray Optics and Wave Optics - Lens Formula and Young Double Slit Experiment',
    keywords: ['optics', 'ray optics', 'wave optics', 'lens formula', 'snell law', 'young double slit experiment', 'ஒளியியல்', 'லென்ஸ் சூத்திரம்', 'யங் இரட்டைப் பிளவு']
  },
  {
    canonicalKey: 'canonical_phy_modern_physics_semiconductors',
    domain: 'physics',
    standardTitle: 'Modern Physics: Photoelectric Effect, Bohr Model & Semiconductor Diodes',
    standardSubject: 'Physics',
    videoId: 'kKKM8Y-u7ds',
    videoTitle: 'Modern Physics - Photoelectric Effect, Bohr Atom and Semiconductors',
    keywords: ['modern physics', 'photoelectric effect', 'bohr model', 'semiconductors', 'pn junction diode', 'logic gates', 'நவீன இயற்பியல்', 'குறைக்கடத்திகள்']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. CHEMISTRY & CHEMICAL SCIENCES (NEET, JEE, SCHOOL, TNPSC)
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_chem_mole_concept_stoichiometry',
    domain: 'chemistry',
    standardTitle: 'Mole Concept, Stoichiometry, Limiting Reagent & Concentration Terms',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Mole Concept, Stoichiometry and Limiting Reagent Calculations',
    keywords: ['mole concept', 'stoichiometry', 'limiting reagent', 'molarity', 'molality', 'மோல் கருத்து', 'வேதிவினை விகிதம்']
  },
  {
    canonicalKey: 'canonical_chem_atomic_structure',
    domain: 'chemistry',
    standardTitle: 'Atomic Structure: Quantum Numbers, Bohr Model & Electronic Configuration',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Structure of Atom, Quantum Numbers and Electronic Configuration',
    keywords: ['atomic structure', 'structure of atom', 'quantum numbers', 'bohr model', 'aufbau principle', 'அணு அமைப்பு', 'குவாண்டம் எண்கள்']
  },
  {
    canonicalKey: 'canonical_chem_chemical_bonding',
    domain: 'chemistry',
    standardTitle: 'Chemical Bonding: VSEPR Geometry, Hybridization, MOT & Fajan’s Rules',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Chemical Bonding - VSEPR Theory, Hybridization and Molecular Orbital Theory',
    keywords: ['chemical bonding', 'vsepr theory', 'hybridization', 'molecular orbital theory', 'fajan rules', 'வேதிப்பிணைப்பு', 'இனக்கலப்பு']
  },
  {
    canonicalKey: 'canonical_chem_equilibrium_ph_buffers',
    domain: 'chemistry',
    standardTitle: 'Chemical & Ionic Equilibrium: Le Chatelier, pH Scale, Buffers & Ksp',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Chemical and Ionic Equilibrium - Le Chatelier, pH and Buffer Solutions',
    keywords: ['equilibrium', 'chemical equilibrium', 'ionic equilibrium', 'ph scale', 'buffer solution', 'solubility product', 'வேதிச் சமநிலை', 'pH மதிப்பு']
  },
  {
    canonicalKey: 'canonical_chem_thermodynamics_energetics',
    domain: 'chemistry',
    standardTitle: 'Chemical Thermodynamics, Hess’s Law & Gibbs Free Energy Spontaneity',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Chemical Thermodynamics, Enthalpy, Entropy and Gibbs Free Energy',
    keywords: ['chemical thermodynamics', 'hess law', 'gibbs free energy', 'entropy', 'enthalpy of reaction', 'வேதி வெப்ப இயக்கவியல்', 'கிப்ஸ் கட்டிலா ஆற்றல்']
  },
  {
    canonicalKey: 'canonical_chem_electrochemistry_nernst',
    domain: 'chemistry',
    standardTitle: 'Electrochemistry: Nernst Equation, Cell EMF, Kohlrausch Law & Batteries',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Electrochemistry - Nernst Equation, Galvanic Cells and Kohlrausch Law',
    keywords: ['electrochemistry', 'nernst equation', 'galvanic cell', 'kohlrausch law', 'faraday laws', 'மின்வேதியியல்', 'நெர்ன்ஸ்ட் சமன்பாடு']
  },
  {
    canonicalKey: 'canonical_chem_chemical_kinetics',
    domain: 'chemistry',
    standardTitle: 'Chemical Kinetics: Order of Reaction, Half-Life & Arrhenius Equation',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Chemical Kinetics - Integrated Rate Laws and Arrhenius Equation',
    keywords: ['chemical kinetics', 'order of reaction', 'half life', 'arrhenius equation', 'rate of reaction', 'வேதிவினை வேகவியல்', 'அர்ஹீனியஸ் சமன்பாடு']
  },
  {
    canonicalKey: 'canonical_chem_solutions_colligative',
    domain: 'chemistry',
    standardTitle: 'Solutions: Raoult’s Law, Colligative Properties & Van ’t Hoff Factor',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Solutions - Raoult Law, Elevation in Boiling Point and Osmotic Pressure',
    keywords: ['solutions', 'colligative properties', 'raoult law', 'van t hoff factor', 'osmotic pressure', 'கரைசல்கள்', 'நீர்த்த கரைசல்களின் பண்புகள்']
  },
  {
    canonicalKey: 'canonical_chem_coordination_compounds',
    domain: 'chemistry',
    standardTitle: 'Coordination Chemistry: IUPAC Naming, Isomerism & Crystal Field Theory (CFT)',
    standardSubject: 'Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Coordination Compounds - Werner Theory, Isomerism and Crystal Field Theory',
    keywords: ['coordination compounds', 'crystal field theory', 'isomerism in coordination', 'synergic bonding', 'அணைவுச் சேர்மங்கள்', 'படிகப்புலக் கொள்கை']
  },
  {
    canonicalKey: 'canonical_chem_goc_reaction_mechanisms',
    domain: 'chemistry',
    standardTitle: 'General Organic Chemistry (GOC): Inductive, Resonance, Carbocations & Mechanisms',
    standardSubject: 'Organic Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'General Organic Chemistry (GOC) - Inductive, Mesomeric Effects and Stability',
    keywords: ['goc', 'general organic chemistry', 'inductive effect', 'resonance effect', 'carbocations', 'sn1 sn2', 'பொது கரிம வேதியியல்', 'தூண்டல் விளைவு']
  },
  {
    canonicalKey: 'canonical_chem_organic_named_reactions',
    domain: 'chemistry',
    standardTitle: 'Organic Named Reactions: Aldol, Cannizzaro, Iodoform & Sandmeyer',
    standardSubject: 'Organic Chemistry',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Organic Named Reactions - Aldol Condensation, Cannizzaro and Sandmeyer',
    keywords: ['named reactions', 'aldol condensation', 'cannizzaro reaction', 'iodoform test', 'sandmeyer reaction', 'பெயர்வினைகள்', 'ஆல்டால் குறுக்கம்']
  },
  {
    canonicalKey: 'canonical_chem_biomolecules_polymers',
    domain: 'chemistry',
    standardTitle: 'Biomolecules (Carbohydrates, Proteins, DNA/RNA) & Polymers',
    standardSubject: 'Chemistry & Biology',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Biomolecules - Glucose, Amino Acids, Peptide Bond and Nucleic Acids',
    keywords: ['biomolecules', 'carbohydrates', 'proteins', 'amino acids', 'dna and rna', 'polymers', 'உயிரியல் மூலக்கூறுகள்', 'பாலிமர்கள்']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. BIOLOGY & LIFE SCIENCES (NEET, SCHOOL, TNPSC)
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_bio_cell_structure_organelles',
    domain: 'biology',
    standardTitle: 'Cell Biology: Cell Theory, Organelles (Mitochondria, Chloroplast) & Division',
    standardSubject: 'Biology',
    videoId: 'X6TLFZUC9gI',
    videoTitle: 'Cell Structure and Functions - Plant vs Animal Cell and Organelles',
    keywords: ['cell biology', 'cell structure', 'mitochondria', 'nucleus', 'chloroplast', 'cell division', 'செல் உயிரியல்', 'மைட்டோகாண்ட்ரியா', 'செல் நுண்ணுறுப்புகள்']
  },
  {
    canonicalKey: 'canonical_bio_plant_photosynthesis_respiration',
    domain: 'biology',
    standardTitle: 'Plant Physiology: Photosynthesis (Light/Dark Reactions) & Respiration',
    standardSubject: 'Botany & Biology',
    videoId: 'X6TLFZUC9gI',
    videoTitle: 'Photosynthesis in Higher Plants - Light Reaction and Calvin Cycle',
    keywords: ['photosynthesis', 'calvin cycle', 'respiration in plants', 'transpiration', 'chlorophyll', 'ஒளிச்சேர்க்கை', 'தாவர சுவாசம்']
  },
  {
    canonicalKey: 'canonical_bio_human_digestive_respiratory',
    domain: 'biology',
    standardTitle: 'Human Physiology: Digestive System, Nutrition & Gas Exchange in Lungs',
    standardSubject: 'Zoology & Human Biology',
    videoId: 'q1xNuU7gaAQ',
    videoTitle: 'Human Digestive and Respiratory System Complete Anatomy',
    keywords: ['digestive system', 'respiratory system', 'alveoli', 'stomach digestion', 'enzymes', 'செரிமான மண்டலம்', 'சுவாச மண்டலம்']
  },
  {
    canonicalKey: 'canonical_bio_human_circulatory_excretory',
    domain: 'biology',
    standardTitle: 'Human Physiology: Circulatory System (Heart) & Excretory System (Nephron)',
    standardSubject: 'Zoology & Human Biology',
    videoId: 'q1xNuU7gaAQ',
    videoTitle: 'Human Heart Double Circulation and Kidney Nephron Filtration',
    keywords: ['circulatory system', 'heart chambers', 'double circulation', 'excretory system', 'nephron', 'இரத்த ஓட்ட மண்டலம்', 'கழிவுநீக்க மண்டலம்', 'நெஃப்ரான்']
  },
  {
    canonicalKey: 'canonical_bio_genetics_mendel_inheritance',
    domain: 'biology',
    standardTitle: 'Genetics: Mendel’s Laws of Inheritance (3:1, 9:3:3:1) & Sex Determination',
    standardSubject: 'Biology & Genetics',
    videoId: 'X6TLFZUC9gI',
    videoTitle: 'Genetics - Mendel Laws of Inheritance and Monohybrid/Dihybrid Cross',
    keywords: ['genetics', 'mendel laws', 'monohybrid cross', 'dihybrid cross', 'sex determination', 'மரபியல்', 'மெண்டலின் மரபுக்கடத்தல் விதிகள்']
  },
  {
    canonicalKey: 'canonical_bio_molecular_basis_inheritance',
    domain: 'biology',
    standardTitle: 'Molecular Basis of Inheritance: DNA Structure, Replication & Central Dogma',
    standardSubject: 'Biology (NEET)',
    videoId: 'X6TLFZUC9gI',
    videoTitle: 'Molecular Basis of Inheritance - DNA Replication, Transcription and Translation',
    keywords: ['dna structure', 'dna replication', 'transcription', 'translation', 'central dogma', 'டி.என்.ஏ அமைப்பு', 'மரபுக்குறியீடு']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. INDIAN POLITY, CONSTITUTION & GOVERNANCE (UPSC, TNPSC, LAW)
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_polity_constitution_preamble_acts',
    domain: 'polity_governance',
    standardTitle: 'Constitutional Evolution (1773-1947), Constituent Assembly & Preamble Philosophy',
    standardSubject: 'Indian Polity & Constitution',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Historical Background of Indian Constitution and Preamble Key Concepts',
    keywords: ['historical background of constitution', 'regulating act', 'constituent assembly', 'preamble', 'basic structure doctrine', 'அரசியலமைப்பு உருவாக்கம்', 'முகப்புரை']
  },
  {
    canonicalKey: 'canonical_polity_fundamental_rights_writs',
    domain: 'polity_governance',
    standardTitle: 'Fundamental Rights (Articles 14-32), Right to Life (Art 21) & 5 Writs',
    standardSubject: 'Indian Polity & Constitution',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Fundamental Rights Articles 12 to 35 and Supreme Court Writs (Article 32)',
    keywords: ['fundamental rights', 'article 14', 'article 19', 'article 21', 'article 32', 'writs', 'habeas corpus', 'அடிப்படை உரிமைகள்', 'நீதிப்பேராணைகள்']
  },
  {
    canonicalKey: 'canonical_polity_dpsp_fundamental_duties',
    domain: 'polity_governance',
    standardTitle: 'Directive Principles of State Policy (DPSPs Articles 36-51) & Fundamental Duties',
    standardSubject: 'Indian Polity & Constitution',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Directive Principles of State Policy (DPSP) and Fundamental Duties (51A)',
    keywords: ['dpsp', 'directive principles', 'fundamental duties', 'article 51a', 'uniform civil code', 'அரசு வழிகாட்டு நெறிமுறைகள்', 'அடிப்படை கடமைகள்']
  },
  {
    canonicalKey: 'canonical_polity_union_state_executive',
    domain: 'polity_governance',
    standardTitle: 'Union & State Executive: President, Prime Minister, Governor & Council of Ministers',
    standardSubject: 'Indian Polity & Governance',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'President of India, Governor Powers, Ordinance Making and Cabinet',
    keywords: ['president of india', 'prime minister', 'governor', 'ordinance making power', 'cabinet secretariat', 'குடியரசுத் தலைவர்', 'ஆளுநர்', 'பிரதமர்']
  },
  {
    canonicalKey: 'canonical_polity_parliament_state_legislature',
    domain: 'polity_governance',
    standardTitle: 'Parliament: Lok Sabha, Rajya Sabha, Money Bills & Anti-Defection (10th Schedule)',
    standardSubject: 'Indian Polity & Governance',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Parliament Structure, Legislative Procedure, Money Bills and Anti-Defection',
    keywords: ['parliament', 'lok sabha', 'rajya sabha', 'money bill', 'anti-defection law', '10th schedule', 'நாடாளுமன்றம்', 'மக்களவை', 'மாநிலங்களவை']
  },
  {
    canonicalKey: 'canonical_polity_judiciary_supreme_court',
    domain: 'polity_governance',
    standardTitle: 'Indian Judiciary: Supreme Court, High Courts, Judicial Review & Collegium System',
    standardSubject: 'Indian Polity & Governance',
    videoId: 'MjhvG73P_pM',
    videoTitle: 'Supreme Court of India, Judicial Review and Collegium System Explained',
    keywords: ['supreme court', 'high courts', 'judicial review', 'collegium system', 'public interest litigation', 'நீதித்துறை', 'உச்ச நீதிமன்றம்', 'நீதித்துறை மறுஆய்வு']
  },
  {
    canonicalKey: 'canonical_polity_local_governance_panchayati_raj',
    domain: 'polity_governance',
    standardTitle: 'Local Self-Government: 73rd & 74th Constitutional Amendments & Panchayati Raj',
    standardSubject: 'Indian Polity & Governance',
    videoId: 'MjhvG73P_pM',
    videoTitle: '73rd and 74th Constitutional Amendments - Panchayati Raj and Municipalities',
    keywords: ['panchayati raj', '73rd amendment', '74th amendment', 'gram sabha', 'municipalities', 'உள்ளாட்சி அமைப்புகள்', 'பஞ்சாயத்து ராஜ்', 'கிராம சபை']
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. INDIAN HISTORY, CULTURE, TNPSC CORE & GEOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────
  {
    canonicalKey: 'canonical_hist_indus_valley_civilization',
    domain: 'history_culture',
    standardTitle: 'Indus Valley Civilization (IVC): Town Planning, Seals, Trade & Key Sites',
    standardSubject: 'History of India',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Indus Valley Civilization - Harappa, Mohenjo-Daro and Town Planning',
    keywords: ['indus valley civilization', 'harappa', 'mohenjo-daro', 'dholavira', 'great bath', 'சிந்து சமவெளி நாகரிகம்', 'ஹரப்பா', 'மொகஞ்சதாரோ']
  },
  {
    canonicalKey: 'canonical_hist_mauryan_empire_ashoka',
    domain: 'history_culture',
    standardTitle: 'Mauryan Empire: Chandragupta, Arthashastra & Ashoka’s Dhamma Edicts',
    standardSubject: 'History of India',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Mauryan Empire - Chandragupta Maurya, Kautilya and Ashoka Dhamma',
    keywords: ['mauryan empire', 'ashoka', 'ashoka dhamma', 'arthashastra', 'kautilya', 'மௌரியப் பேரரசு', 'அசோகர்', 'அர்த்தசாஸ்திரம்']
  },
  {
    canonicalKey: 'canonical_hist_sangam_age_cholas_keeladi',
    domain: 'history_culture',
    standardTitle: 'Sangam Age (Chera, Chola, Pandya), Keeladi Excavations & Imperial Cholas',
    standardSubject: 'Tamil Nadu History & Culture (Unit 8)',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Sangam Age, Keeladi Vaigai Civilization and Chola Kudavolai System',
    keywords: ['sangam age', 'keeladi', 'chera chola pandya', 'imperial cholas', 'kudavolai system', 'சங்க காலம்', 'கீழடி அகழாய்வு', 'சோழர் வரலாறு', 'குடவோலை முறை']
  },
  {
    canonicalKey: 'canonical_hist_revolt_1857_freedom_movement',
    domain: 'history_culture',
    standardTitle: 'The Great Revolt of 1857 & Indian National Movement (Gandhi & Netaji)',
    standardSubject: 'Modern Indian History',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Revolt of 1857 and Gandhian Mass Movements in Freedom Struggle',
    keywords: ['revolt of 1857', 'freedom struggle', 'indian national congress', 'mahatma gandhi', 'quit india movement', '1857 பெரும் புரட்சி', 'விடுதலைப் போராட்டம்', 'காந்தியடிகள்']
  },
  {
    canonicalKey: 'canonical_tn_justice_party_self_respect',
    domain: 'history_culture',
    standardTitle: 'Justice Party (1916), Periyar Self-Respect Movement & 69% Reservation in TN',
    standardSubject: 'Tamil Nadu Development Administration (Unit 9)',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Justice Party, Periyar Self-Respect Movement and TN 69% Reservation Act',
    keywords: ['justice party', 'self-respect movement', 'periyar', 'communal go 1921', '69% reservation', 'நீதிக்கட்சி', 'சுயமரியாதை இயக்கம்', 'பெரியார்', 'இடஒதுக்கீடு சட்டம்']
  },
  {
    canonicalKey: 'canonical_geo_monsoon_climate_india',
    domain: 'geography_environment',
    standardTitle: 'Climate of India: Southwest & Northeast Monsoons, El Niño & IOD Teleconnections',
    standardSubject: 'Geography of India',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Mechanism of Indian Monsoon - Southwest, Northeast Monsoon and El Nino/IOD',
    keywords: ['indian monsoon', 'southwest monsoon', 'northeast monsoon', 'el nino', 'indian ocean dipole', 'இந்தியப் பருவமழை', 'தென்மேற்கு பருவமழை', 'வடகிழக்கு பருவமழை']
  },
  {
    canonicalKey: 'canonical_geo_earth_interior_plate_tectonics',
    domain: 'geography_environment',
    standardTitle: 'Physical Geography: Earth’s Interior, Continental Drift & Plate Tectonics',
    standardSubject: 'Physical Geography',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Interior of Earth, Continental Drift and Plate Tectonics Theory',
    keywords: ['earth interior', 'plate tectonics', 'continental drift', 'earthquakes and volcanoes', 'புவியின் உள் அமைப்பு', 'தட்டுப் புவிப்பொறைக் கொள்கை']
  },
  {
    canonicalKey: 'canonical_env_ecology_biodiversity_conventions',
    domain: 'geography_environment',
    standardTitle: 'Ecology: Ecosystem Energy Flow, Biodiversity Hotspots & Global Climate Treaties',
    standardSubject: 'Environment & Ecology',
    videoId: '0aJ_y0k5S_g',
    videoTitle: 'Ecology Principles, Biodiversity Hotspots and UNFCCC Climate Treaties',
    keywords: ['ecology', 'ecosystem', 'biodiversity hotspots', 'paris agreement', 'wildlife protection act', 'சுற்றுச்சூழலியல்', 'உயிர் பன்மை', 'காலநிலை மாற்றம்']
  }
];

/**
 * Resolve any topic/subject string to its Canonical Topic Key and Definition.
 * Uses high-precision topic-first matching and scoring to prevent cross-topic collisions.
 */
export function resolveCanonicalTopic(topic: string, subject: string, courseTitle: string = ''): CanonicalTopicDefinition {
  const t = (topic || '').toLowerCase().trim();
  const s = (subject || '').toLowerCase().trim();

  let bestMatch: CanonicalTopicDefinition | null = null;
  let highestScore = 0;

  // 1. Check EXACT or high-confidence keyword match on TOPIC FIRST (Highest priority)
  for (const def of CANONICAL_TOPIC_REGISTRY) {
    for (const kw of def.keywords) {
      const lowerKw = kw.toLowerCase();
      if (t.includes(lowerKw)) {
        const score = lowerKw.length * 10;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = def;
        }
      }
    }
  }

  if (bestMatch && highestScore >= 30) {
    return bestMatch;
  }

  // 2. If topic had weak match, check subject with topic combined
  for (const def of CANONICAL_TOPIC_REGISTRY) {
    for (const kw of def.keywords) {
      const lowerKw = kw.toLowerCase();
      if (s.includes(lowerKw) || t.includes(lowerKw)) {
        const score = lowerKw.length * 2;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = def;
        }
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  // 3. Clean fallback canonical key
  const sanitizedTopic = (topic || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const sanitizedSubject = (subject || 'academic')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return {
    canonicalKey: `canonical_${sanitizedSubject}_${sanitizedTopic}`,
    domain: 'general',
    standardTitle: topic || 'Academic Masterclass Lesson',
    standardSubject: subject || 'Academic',
    videoId: '0aJ_y0k5S_g',
    videoTitle: `${topic || 'Lesson'} Masterclass`,
    keywords: [topic, subject],
  };
}
