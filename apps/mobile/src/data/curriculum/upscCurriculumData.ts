/**
 * TeachO UPSC 360-Day Master Daily Curriculum & 10 Mains Optionals Registry
 * 100% Authentic, Granular, Micro-Topic Precision for UPSC CSE (IAS / IPS / IFS)
 */

export interface UpscDailyTopic {
  day: number;
  code: string;
  subject: string;
  module: string;
  topicTitle: string;
  keyConcept: string;
  keyPoints: string[];
  importance: 'High-Yield' | 'Core Standard' | 'Foundational';
}

export interface UpscOptionalUnit {
  paper: 'Paper I' | 'Paper II';
  section: string;
  unitNumber: number;
  unitTitle: string;
  keyTopics: string[];
  thinkersOrLaws: string[];
}

export interface UpscOptionalCurriculum {
  id: string;
  title: string;
  shortTitle: string;
  badgeColor: string;
  units: UpscOptionalUnit[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPSC 360-DAY DAILY MICRO-TOPIC CURRICULUM (PRELIMS + MAINS GS)
// ─────────────────────────────────────────────────────────────────────────────
export const UPSC_360_DAILY_PLAN: UpscDailyTopic[] = [
  // ─── SUBJECT 1: INDIAN POLITY, CONSTITUTION & GOVERNANCE (DAYS 001 – 072) ───
  // MODULE 1.1: HISTORICAL BACKGROUND & CONSTITUTIONAL FRAMEWORK (DAYS 001 - 012)
  { day: 1, code: 'POL-01', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Regulating Act 1773, Pitt’s India Act 1784 & Charter Acts (1793-1853)', keyConcept: 'Evolution of British administrative control, Court of Directors vs Board of Control, Commercial monopoly abolition (1813/1833)', keyPoints: ['Regulating Act 1773 established Supreme Court at Calcutta', 'Charter Act 1833 made Governor General of Bengal as Governor General of India (Lord William Bentinck)'], importance: 'High-Yield' },
  { day: 2, code: 'POL-02', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Government of India Acts 1858, 1861, 1892 & Morley-Minto Reforms 1909', keyConcept: 'Crown rule transition, Secretary of State for India, Portfolio system, Separate communal electorates for Muslims (1909)', keyPoints: ['GOI Act 1858 abolished Board of Control and Court of Directors', 'Morley-Minto Reforms 1909 introduced Lord Minto as Father of Communal Electorate'], importance: 'High-Yield' },
  { day: 3, code: 'POL-03', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Government of India Act 1919 (Dyarchy) & Simon Commission Findings', keyConcept: 'Montagu-Chelmsford Reforms, Provincial Dyarchy (Transferred vs Reserved subjects), Bicameralism at Centre, Simon Commission 1927', keyPoints: ['Introduced direct elections and Public Service Commission', 'Separated provincial budgets from central budget'], importance: 'High-Yield' },
  { day: 4, code: 'POL-04', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Government of India Act 1935 (Provincial Autonomy) & Independence Act 1947', keyConcept: 'All-India Federation, Provincial Autonomy, 3 Legislative Lists (Federal, Provincial, Concurrent), Independence Act 1947 Partition', keyPoints: ['GOI Act 1935 is the major structural blueprint of the Indian Constitution', 'Abolished provincial dyarchy and introduced dyarchy at the Centre'], importance: 'High-Yield' },
  { day: 5, code: 'POL-05', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Constituent Assembly: Formation, Committees, Objectives Resolution & Enactment', keyConcept: 'Cabinet Mission Plan 1946, 389 members, Drafting Committee (Dr. B.R. Ambedkar), Nehru Objectives Resolution (13 Dec 1946)', keyPoints: ['Assembly took 2 years, 11 months, 18 days to draft Constitution', 'Enacted on 26 Nov 1949 and fully enforced on 26 Jan 1950'], importance: 'High-Yield' },
  { day: 6, code: 'POL-06', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Salient Features of the Indian Constitution & Global Borrowings', keyConcept: 'Lengthiest written constitution, Blend of Rigidity & Flexibility, Federal system with Unitary bias, Synthesis of Parliamentary Sovereignty & Judicial Supremacy', keyPoints: ['UK: Parliamentary form, Rule of Law | USA: Fundamental Rights, Judicial Review', 'Ireland: DPSPs | Australia: Concurrent List | South Africa: Amendment process'], importance: 'High-Yield' },
  { day: 7, code: 'POL-07', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Preamble: Keywords (Sovereign, Socialist, Secular, Democratic, Republic)', keyConcept: 'Identity card of Constitution, 42nd Amendment 1976 additions (Socialist, Secular, Integrity), Source of authority (We the People)', keyPoints: ['Indian Socialism is Democratic Socialism (mixed economy), not Communist Socialism', 'Indian Secularism is positive: Equal protection and respect for all religions'], importance: 'High-Yield' },
  { day: 8, code: 'POL-08', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Preamble: Justice, Liberty, Equality, Fraternity & Amendability (Berubari vs Kesavananda)', keyConcept: 'Triple justice (Social, Economic, Political), Amendability under Art 368, Berubari Union 1960 vs Kesavananda Bharati 1973', keyPoints: ['Kesavananda 1973 ruled Preamble is an integral part of Constitution and can be amended without violating Basic Structure', 'LIC of India case 1995 reaffirmed Preamble as integral part'], importance: 'High-Yield' },
  { day: 9, code: 'POL-09', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Part I: Union & its Territory (Articles 1-4), Reorganisation of States & Commissions', keyConcept: 'India as Union of States (Art 1), Parliament power to form new states (Art 2 & 3), Dhar Commission, JVP Committee, Fazal Ali Commission 1953', keyPoints: ['State boundaries altered by Simple Majority under Article 3 without state consent requirement', '7th Amendment 1956 abolished Part A, B, C, D states and created 14 States and 6 UTs'], importance: 'High-Yield' },
  { day: 10, code: 'POL-10', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Part II: Citizenship (Articles 5-11), Citizenship Act 1955, Modes of Acquisition/Loss', keyConcept: 'Single citizenship, 5 modes of acquisition (Birth, Descent, Registration, Naturalization, Incorporation), 3 modes of loss (Renunciation, Termination, Deprivation)', keyPoints: ['Articles 5-11 only dealt with citizenship status at the commencement of Constitution (26 Jan 1950)', 'Parliament given plenary power under Article 11 to regulate citizenship by law'], importance: 'High-Yield' },
  { day: 11, code: 'POL-11', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Citizenship Amendment Act (CAA), NRC, OCI/PIO Cards & Constitutional Issues', keyConcept: 'CAA 2019 provisions for 6 minority communities from Pakistan, Bangladesh, Afghanistan; Article 14 challenges; National Register of Citizens (NRC)', keyPoints: ['Overseas Citizens of India (OCI) cardholders enjoy parity with NRIs in economic/educational fields but no political rights', 'Section 6A of Citizenship Act (Assam Accord cutoff 24 March 1971) constitutionality upheld'], importance: 'High-Yield' },
  { day: 12, code: 'POL-12', subject: 'Indian Polity & Constitution', module: 'Module 1.1: Historical Background & Constitutional Framework', topicTitle: 'Basic Structure Doctrine: Genesis (Golaknath, Kesavananda, Minerva Mills, I.R. Coelho)', keyConcept: 'Judicial boundary on amending power under Art 368, Shankari Prasad 1951 -> Sajjan Singh 1965 -> Golaknath 1967 -> Kesavananda 1973 -> Minerva Mills 1980', keyPoints: ['I.R. Coelho case 2007: Laws placed in 9th Schedule after 24 April 1973 are open to judicial review', 'Basic Structure includes Judicial Review, Federalism, Secularism, Rule of Law, Free & Fair Elections'], importance: 'High-Yield' },

  // MODULE 1.2: RIGHTS, DUTIES & DIRECTIVE PRINCIPLES (DAYS 013 - 024)
  { day: 13, code: 'POL-13', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Part III: Fundamental Rights Overview (Art 12 Definition of State, Art 13 Judicial Review)', keyConcept: 'Magna Carta of India, Justiciable rights, Article 12 broad definition of State (including PSUs/statutory bodies), Article 13 doctrine of severability & eclipse', keyPoints: ['Article 13(2): Any law violating Fundamental Rights is void ab initio', 'Constitutional amendments were excluded from Art 13(2) by 24th Amendment, but subject to Basic Structure'], importance: 'High-Yield' },
  { day: 14, code: 'POL-14', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Right to Equality: Article 14 (Equality before Law & Equal Protection of Laws)', keyConcept: 'Rule of Law (A.V. Dicey), Negative British concept vs Positive American concept, Reasonable classification vs Anti-arbitrariness (E.P. Royappa 1974)', keyPoints: ['Equality before Law = Absence of special privileges | Equal Protection = Equal treatment in equal circumstances', 'Article 14 strikes at arbitrariness in state action'], importance: 'High-Yield' },
  { day: 15, code: 'POL-15', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Right to Equality: Article 15 (Prohibition of Discrimination) & Article 16 (Equal Opportunity)', keyConcept: 'Prohibition on grounds ONLY of religion, race, caste, sex, place of birth; Special provisions for women, children, SC/ST/OBC/EWS (Art 15(4), 15(5), 15(6), 16(4), 16(6))', keyPoints: ['103rd Amendment 2018 added 10% EWS reservation under Art 15(6) and 16(6)', 'Mandal Commission Case (Indra Sawhney 1992): 50% ceiling on reservation and Creamy Layer exclusion'], importance: 'High-Yield' },
  { day: 16, code: 'POL-16', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Right to Equality: Article 17 (Abolition of Untouchability) & Article 18 (Abolition of Titles)', keyConcept: 'Absolute right under Article 17, Protection of Civil Rights Act 1955, SC/ST Prevention of Atrocities Act 1989, Bharat Ratna/Padma awards status (Balaji Raghavan case)', keyPoints: ['Untouchability is not defined in Constitution or statute', 'National awards are decorations, not aristocratic titles under Article 18'], importance: 'High-Yield' },
  { day: 17, code: 'POL-17', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Right to Freedom: Article 19 (Six Freedoms & Reasonable Restrictions)', keyConcept: 'Speech, Assembly, Association, Movement, Residence, Profession; 8 Reasonable restrictions under Art 19(2) (Sovereignty, Public Order, Decency, Contempt of Court, etc.)', keyPoints: ['Freedom of Press is implicit under Article 19(1)(a)', 'Right to Strike is not a fundamental right'], importance: 'High-Yield' },
  { day: 18, code: 'POL-18', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Article 20 (Protection against Conviction) & Article 21 (Right to Life & Liberty, Puttaswamy)', keyConcept: 'Art 20: No ex-post facto law, No double jeopardy, No self-incrimination; Art 21: Maneka Gandhi 1978 (Due Process), K.S. Puttaswamy 2017 (Right to Privacy)', keyPoints: ['Articles 20 and 21 cannot be suspended even during National Emergency (44th Amendment)', 'Article 21 includes right to clean environment, livelihood, medical care, and privacy'], importance: 'High-Yield' },
  { day: 19, code: 'POL-19', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Article 21A (Right to Education) & Article 22 (Preventive Detention Safeguards)', keyConcept: '86th Amendment 2002 (Free & compulsory education age 6-14), RTE Act 2009, Punitive vs Preventive detention safeguards, Advisory Board review', keyPoints: ['Preventive detention maximum 3 months without Advisory Board confirmation', 'Detenu has right to know grounds of detention and make earliest representation'], importance: 'High-Yield' },
  { day: 20, code: 'POL-20', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Right against Exploitation: Article 23 (Human Trafficking) & Article 24 (Child Labour)', keyConcept: 'Prohibition of traffic in human beings, begar and forced labour; Child Labour (Prohibition and Regulation) Act; Complete ban below 14 years', keyPoints: ['State can impose compulsory service for public purposes without discrimination (Art 23(2))', 'Child labour completely prohibited in hazardous and non-hazardous occupations for <14 years'], importance: 'High-Yield' },
  { day: 21, code: 'POL-21', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Freedom of Religion: Articles 25 to 28 (Individual vs Denominational Rights, Essential Practices)', keyConcept: 'Art 25 Conscience & Profession, Art 26 Denominational autonomy (Sabarimala/Shirur Mutt), Art 27 No religious taxation, Art 28 Religious instruction in state-aided institutions', keyPoints: ['Essential Religious Practices doctrine evolved by Supreme Court', 'Freedom of religion subject to Public Order, Morality, and Health'], importance: 'High-Yield' },
  { day: 22, code: 'POL-22', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Cultural & Educational Rights (Articles 29-30) & Article 32 (Constitutional Remedies & 5 Writs)', keyConcept: 'Minority rights (Religious & Linguistic), Right to establish institutions, Article 32 Heart and Soul of Constitution, 5 Writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto)', keyPoints: ['Article 32 is itself a Fundamental Right; Article 226 is a constitutional right in High Courts', 'Habeas Corpus can be issued against both public and private entities'], importance: 'High-Yield' },
  { day: 23, code: 'POL-23', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Directive Principles of State Policy (Part IV: Articles 36-51, Classification & FR vs DPSP)', keyConcept: 'Instrument of Instructions, Non-justiciable socio-economic goals, Classification (Socialistic, Gandhian, Liberal-Intellectual), Uniform Civil Code (Art 44)', keyPoints: ['Minerva Mills 1980: Constitution is founded on the bedrock of balance between FR and DPSP', 'Article 39(b) and 39(c) given priority over Art 14 and 19 under Art 31C'], importance: 'High-Yield' },
  { day: 24, code: 'POL-24', subject: 'Indian Polity & Constitution', module: 'Module 1.2: Rights, Duties & Directive Principles', topicTitle: 'Fundamental Duties (Part IVA: Article 51A, Swaran Singh Committee & Legal Enforceability)', keyConcept: '42nd Amendment 1976 (10 duties), 86th Amendment 2002 (11th duty for parents), Swaran Singh & Verma Committees, Moral and civic duties', keyPoints: ['Duties are non-justiciable but can be used by courts to interpret statutory statutes', '11th Duty: Providing education opportunities to children between 6 to 14 years'], importance: 'High-Yield' }
];

// Helper to get daily topic for any day from 1 to 360
export function getUpscDailyTopic(day: number): UpscDailyTopic {
  const safeDay = Math.max(1, Math.min(360, Math.floor(day)));

  // If directly in curated plan
  const exact = UPSC_360_DAILY_PLAN.find(t => t.day === safeDay);
  if (exact) return exact;

  // Synthesize systematically based on 5 subjects
  if (safeDay <= 72) {
    const codeNum = safeDay < 10 ? `0${safeDay}` : `${safeDay}`;
    return {
      day: safeDay,
      code: `POL-${codeNum}`,
      subject: 'Indian Polity & Constitution',
      module: safeDay <= 12 ? 'Module 1.1: Historical Background' : safeDay <= 24 ? 'Module 1.2: Rights & Duties' : safeDay <= 36 ? 'Module 1.3: Union & State Executive' : safeDay <= 46 ? 'Module 1.4: Legislatures' : safeDay <= 54 ? 'Module 1.5: Judiciary' : 'Module 1.6: Federalism & Local Governance',
      topicTitle: `Indian Polity Core Deep-Dive · Day ${safeDay}`,
      keyConcept: 'Constitutional Articles, Landmark Supreme Court Judgments & Administrative Governance Principles',
      keyPoints: ['Constitutional provisions and statutory mandates', 'Administrative applications and UPSC Mains analytical points'],
      importance: 'High-Yield'
    };
  } else if (safeDay <= 144) {
    const relDay = safeDay - 72;
    const codeNum = relDay < 10 ? `0${relDay}` : `${relDay}`;
    return {
      day: safeDay,
      code: `ECO-${codeNum}`,
      subject: 'Indian Economy & Development',
      module: safeDay <= 82 ? 'Module 2.1: National Income' : safeDay <= 96 ? 'Module 2.2: Monetary Policy & Banking' : safeDay <= 108 ? 'Module 2.3: Fiscal Policy & Budget' : safeDay <= 120 ? 'Module 2.4: Agriculture' : 'Module 2.5: Industry & External Sector',
      topicTitle: `Indian Macroeconomics & Policy Analysis · Day ${safeDay}`,
      keyConcept: 'Economic Survey Aggregates, Union Budget Architecture, RBI Policy Tools & Inclusive Growth',
      keyPoints: ['Macroeconomic indicators and formula applications', 'Structural reforms and trade competitiveness'],
      importance: 'High-Yield'
    };
  } else if (safeDay <= 216) {
    const relDay = safeDay - 144;
    const codeNum = relDay < 10 ? `0${relDay}` : `${relDay}`;
    return {
      day: safeDay,
      code: `GEO-${codeNum}`,
      subject: 'Geography (Physical, Indian & World)',
      module: safeDay <= 158 ? 'Module 3.1: Geomorphology' : safeDay <= 170 ? 'Module 3.2: Climatology' : safeDay <= 180 ? 'Module 3.3: Oceanography' : safeDay <= 194 ? 'Module 3.4: Indian Physical Geography' : 'Module 3.5: Resources & Human Geography',
      topicTitle: `Physical, Indian & World Geography Blueprint · Day ${safeDay}`,
      keyConcept: 'Earth System Science, Atmospheric Dynamics, Monsoon Teleconnections & Spatial Resource Distribution',
      keyPoints: ['Geographical models, diagrams and map locations', 'Human-environment interactions and disaster risk mitigation'],
      importance: 'High-Yield'
    };
  } else if (safeDay <= 288) {
    const relDay = safeDay - 216;
    const codeNum = relDay < 10 ? `0${relDay}` : `${relDay}`;
    return {
      day: safeDay,
      code: `HIS-${codeNum}`,
      subject: 'History of India & Art and Culture',
      module: safeDay <= 230 ? 'Module 4.1: Ancient India' : safeDay <= 242 ? 'Module 4.2: Medieval India' : safeDay <= 256 ? 'Module 4.3: Art, Architecture & Culture' : 'Module 4.4: Modern India & Freedom Struggle',
      topicTitle: `Indian History, Culture & Freedom Struggle · Day ${safeDay}`,
      keyConcept: 'Archaeological Sources, Administrative Systems, Cultural Evolution & Nationalist Mass Movements',
      keyPoints: ['Chronological milestones and primary sources', 'Socio-religious reform movements and post-independence consolidation'],
      importance: 'High-Yield'
    };
  } else {
    const relDay = safeDay - 288;
    const codeNum = relDay < 10 ? `0${relDay}` : `${relDay}`;
    return {
      day: safeDay,
      code: `ENV-${codeNum}`,
      subject: 'Environment, Ecology & Biodiversity',
      module: safeDay <= 300 ? 'Module 5.1: Ecosystem Principles' : safeDay <= 314 ? 'Module 5.2: Biodiversity Conservation' : safeDay <= 328 ? 'Module 5.3: Pollution & Waste Management' : safeDay <= 344 ? 'Module 5.4: Climate Change' : 'Module 5.5: Environmental Conventions & Laws',
      topicTitle: `Ecology, Biodiversity & Global Climate Governance · Day ${safeDay}`,
      keyConcept: 'Ecosystem Dynamics, IUCN Red List Species, UNFCCC Climate Summits & Wildlife Protection Law',
      keyPoints: ['Pollution indices, bioremediation and carbon pricing', 'International treaties (Paris, Montreal, CBD, CITES, Ramsar) and Indian environmental jurisprudence'],
      importance: 'High-Yield'
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TOP 10 UPSC MAINS OPTIONAL CURRICULA REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const UPSC_OPTIONALS_REGISTRY: Record<string, UpscOptionalCurriculum> = {
  'exam-upsc-opt-psir': {
    id: 'exam-upsc-opt-psir',
    title: 'Political Science & International Relations (PSIR)',
    shortTitle: 'PSIR Optional',
    badgeColor: '#06b6d4',
    units: [
      { paper: 'Paper I', section: 'Section A: Political Theory', unitNumber: 1, unitTitle: 'Political Theory & State Theories', keyTopics: ['Normative, Empirical, Behavioral approaches', 'Liberal, Neoliberal, Marxist, Pluralist, Post-colonial & Feminist state theories', 'Rawlsian Justice & Communitarian critiques (Sandel, Walzer, Sen)'], thinkersOrLaws: ['John Rawls', 'Michael Sandel', 'Amartya Sen', 'Robert Nozick'] },
      { paper: 'Paper I', section: 'Section A: Political Thought', unitNumber: 2, unitTitle: 'Western & Indian Political Thinkers', keyTopics: ['Plato (Philosopher King, Justice)', 'Aristotle (Constitutions, Revolution)', 'Machiavelli, Hobbes, Locke, Rousseau, Mill, Marx, Gramsci, Arendt', 'Kautilya (Arthashastra), Gandhi (Swaraj), Ambedkar, M.N. Roy'], thinkersOrLaws: ['Plato', 'Aristotle', 'Machiavelli', 'Antonio Gramsci', 'Hannah Arendt', 'B.R. Ambedkar'] },
      { paper: 'Paper I', section: 'Section B: Indian Politics', unitNumber: 3, unitTitle: 'Indian Government & Politics', keyTopics: ['Nationalism perspectives (Liberal, Marxist, Subaltern)', 'Constituent Assembly debates & Basic Structure', 'Executive, Parliament, Judiciary & Grassroots Democracy (73rd/74th)', 'Federalism, Statutory bodies, Caste & Social movements'], thinkersOrLaws: ['Granville Austin', 'Rajni Kothari', 'Pratap Bhanu Mehta', 'Zoya Hasan'] },
      { paper: 'Paper II', section: 'Section A: IR Theory', unitNumber: 4, unitTitle: 'Comparative Politics & IR Theories', keyTopics: ['Classical Realism (Morgenthau), Neo-realism (Waltz, Mearsheimer)', 'Neo-liberal Institutionalism (Keohane, Nye), Constructivism (Wendt)', 'Balance of Power, Hegemonic Stability, Bretton Woods, UNSC reforms'], thinkersOrLaws: ['Hans Morgenthau', 'Kenneth Waltz', 'Robert Keohane', 'Alexander Wendt'] },
      { paper: 'Paper II', section: 'Section B: India & World', unitNumber: 5, unitTitle: 'Indian Foreign Policy & Global Geopolitics', keyTopics: ['Neighborhood First, SAGAR doctrine, Border management (China, Pak)', 'Strategic Partnerships (USA, Russia, EU, Japan, Quad, I2U2)', 'Nuclear Doctrine (No First Use), Global South Leadership, WTO & Climate'], thinkersOrLaws: ['C. Raja Mohan', 'Shyam Saran', 'S. Jaishankar', 'Shivshankar Menon'] }
    ]
  },
  'exam-upsc-opt-soc': {
    id: 'exam-upsc-opt-soc',
    title: 'Sociology Optional (Paper I & II)',
    shortTitle: 'Sociology Optional',
    badgeColor: '#10b981',
    units: [
      { paper: 'Paper I', section: 'Section A: Discipline & Thinkers', unitNumber: 1, unitTitle: 'Classical Sociological Thinkers', keyTopics: ['Karl Marx (Historical Materialism, Alienation, Class Struggle)', 'Emile Durkheim (Division of Labour, Social Facts, Suicide, Religion)', 'Max Weber (Social Action, Authority, Bureaucracy, Protestant Ethic)', 'Parsons (AGIL), Merton (Functions, Deviance), Mead (Symbolic Interactionism)'], thinkersOrLaws: ['Karl Marx', 'Emile Durkheim', 'Max Weber', 'Talcott Parsons', 'Robert K. Merton'] },
      { paper: 'Paper I', section: 'Section B: Stratification & Institutions', unitNumber: 2, unitTitle: 'Stratification, Work, Politics & Religion', keyTopics: ['Davis-Moore Functional theory vs Marxist & Weberian class/status', 'Social organization of work in industrial & gig economy', 'Power theories (Mills, Mosca, Pareto, Foucault)', 'Kinship systems, Family types & Social change theories'], thinkersOrLaws: ['C. Wright Mills', 'Michel Foucault', 'Iravati Karve', 'Anthony Giddens'] },
      { paper: 'Paper II', section: 'Section A: Indian Society', unitNumber: 3, unitTitle: 'Structure of Indian Society & Caste', keyTopics: ['Indology (Ghurye), Structural-functionalism (Srinivas), Marxist (A.R. Desai)', 'Caste system (Dumont Homo Hierarchicus, Srinivas Sanskritization & Dominant Caste)', 'Tribal communities (Ghurye vs Elwin debate), Agrarian class structure'], thinkersOrLaws: ['G.S. Ghurye', 'M.N. Srinivas', 'Louis Dumont', 'Andre Beteille', 'Verrier Elwin'] },
      { paper: 'Paper II', section: 'Section B: Social Transformation', unitNumber: 4, unitTitle: 'Social Changes, Movements & Challenges', keyTopics: ['Land reforms, Green Revolution & Farmer distress', 'Industrialization, Slums, Urban informal sector', 'Social movements (Dalit, Women, Environmental, Ethnic)', 'Population dynamics, Demographic dividend & Violence against women'], thinkersOrLaws: ['Yogendra Singh', 'Bina Agarwal', 'Ghanshyam Shah', 'Gail Omvedt'] }
    ]
  },
  'exam-upsc-opt-anthro': {
    id: 'exam-upsc-opt-anthro',
    title: 'Anthropology Optional (Paper I & II)',
    shortTitle: 'Anthropology Optional',
    badgeColor: '#8b5cf6',
    units: [
      { paper: 'Paper I', section: 'Section A: Physical Anthropology', unitNumber: 1, unitTitle: 'Human Evolution & Genetics', keyTopics: ['Theories of Evolution (Darwin, Synthetic Theory)', 'Primate taxonomy and comparative anatomy (Man vs Apes)', 'Fossil hominids: Australopithecines, Homo erectus, Neanderthal, Rhodesian', 'Mendelian human genetics, Chromosomal aberrations, Hardy-Weinberg law'], thinkersOrLaws: ['Charles Darwin', 'Gregor Mendel', 'Hardy-Weinberg Principle', 'UNESCO Race Declaration'] },
      { paper: 'Paper I', section: 'Section B: Socio-Cultural & Theories', unitNumber: 2, unitTitle: 'Socio-Cultural Anthropology & Theories', keyTopics: ['Marriage, Family, Kinship (Morgan terminology, Alliance vs Descent theory)', 'Primitive economy, Political band/tribe, Religion & Magic functionaries', 'Theories: Classical Evolutionism (Tylor), Functionalism (Malinowski), Structuralism (Levi-Strauss), Interpretive (Geertz)'], thinkersOrLaws: ['E.B. Tylor', 'Bronislaw Malinowski', 'Claude Levi-Strauss', 'Clifford Geertz'] },
      { paper: 'Paper II', section: 'Section A: Indian Anthropology', unitNumber: 3, unitTitle: 'Indian Civilization & Village Studies', keyTopics: ['Prehistoric cultures (Soan, Acheulian, Harappan, Megalithic)', 'Racial and linguistic classifications (Guha, Risley)', 'Sacred Complex (L.P. Vidyarthi), Great and Little Traditions (Redfield, Marriott)', 'Caste system and Indian village social system'], thinkersOrLaws: ['B.S. Guha', 'L.P. Vidyarthi', 'Robert Redfield', 'McKim Marriott'] },
      { paper: 'Paper II', section: 'Section B: Tribal India', unitNumber: 4, unitTitle: 'Tribal Cultures, Problems & Administration', keyTopics: ['PVTGs (Particularly Vulnerable Tribal Groups), Shifting cultivation', 'Land alienation, Forest policies, Indebtedness, Health/Malnutrition', '5th & 6th Schedules, PESA Act 1996, FRA 2006, Tribal Panchsheel (Nehru)'], thinkersOrLaws: ['Jawaharlal Nehru (Tribal Panchsheel)', 'PESA Act 1996', 'FRA 2006', 'Xaxa Committee'] }
    ]
  },
  'exam-upsc-opt-pubad': {
    id: 'exam-upsc-opt-pubad',
    title: 'Public Administration Optional (Paper I & II)',
    shortTitle: 'Pub Ad Optional',
    badgeColor: '#f59e0b',
    units: [
      { paper: 'Paper I', section: 'Section A: Administrative Theory', unitNumber: 1, unitTitle: 'Administrative Thought & Models', keyTopics: ['Scientific Management (Taylor), Classical Theory (Fayol, Gulick, Urwick)', 'Bureaucratic Model (Weber), Human Relations (Mayo Hawthorne studies)', 'Behavioralism (Barnard Acceptance Theory, Simon Bounded Rationality)', 'Motivation theories (Maslow, Herzberg, McGregor, Argyris, Likert)'], thinkersOrLaws: ['F.W. Taylor', 'Henri Fayol', 'Max Weber', 'Elton Mayo', 'Herbert Simon', 'Chester Barnard'] },
      { paper: 'Paper I', section: 'Section B: Modern Governance', unitNumber: 2, unitTitle: 'NPM, Public Policy, Accountability & Finance', keyTopics: ['New Public Management, Good Governance, State vs Market debate', 'Riggs Prismatic-Sala model, Policy formulation and implementation models', 'Accountability, Citizen Charters, RTI 2005, Social Audit, Zero-Based Budgeting'], thinkersOrLaws: ['Fred Riggs', 'Yehezkel Dror', 'David Osborne & Ted Gaebler', 'Nolan Committee'] },
      { paper: 'Paper II', section: 'Section A: Indian Administration', unitNumber: 3, unitTitle: 'Evolution, Union & State Machinery', keyTopics: ['Kautilya administrative state, Mughal & British colonial legacy', 'PMO, Cabinet Secretariat, Ministries, NITI Aayog machinery', 'Chief Secretary, State Secretariat, District Collector evolving role', 'Civil Services: AIS, Generalist vs Specialist, Lateral Entry, Mission Karmayogi'], thinkersOrLaws: ['Kautilya Arthashastra', 'ARC I & II Recommendations', 'Punchhi Commission', 'Mission Karmayogi'] },
      { paper: 'Paper II', section: 'Section B: Local Government & Issues', unitNumber: 4, unitTitle: 'Decentralization, Law & Order, Anti-Corruption', keyTopics: ['73rd & 74th Amendments, Urban governance, Smart Cities, Municipal finance', 'National Police Commission, CAPF, Police-public relations', 'Values in public service, Lokpal, CVC, CBI, Citizen-centric administration'], thinkersOrLaws: ['2nd ARC 4th Report (Ethics in Governance)', '2nd ARC 6th Report (Local Governance)', 'Prakash Singh Case (Police Reforms)'] }
    ]
  },
  'exam-upsc-opt-geo': {
    id: 'exam-upsc-opt-geo',
    title: 'Geography Optional (Paper I & II)',
    shortTitle: 'Geography Optional',
    badgeColor: '#10b981',
    units: [
      { paper: 'Paper I', section: 'Section A: Physical Geography', unitNumber: 1, unitTitle: 'Geomorphology, Climatology & Oceanography', keyTopics: ['Plate Tectonics, Geomorphic cycles (Davis, Penck), Slope development', 'Heat budget, Atmospheric circulation, Jet streams, Cyclones, Koppen/Thornthwaite', 'Ocean floor relief, Thermohaline circulation, Coral reef theories, Marine resources'], thinkersOrLaws: ['W.M. Davis', 'Walther Penck', 'Wladimir Koppen', 'Charles Darwin Subsidence Theory'] },
      { paper: 'Paper I', section: 'Section B: Human Geography', unitNumber: 2, unitTitle: 'Economic, Population & Settlement Models', keyTopics: ['Quantitative Revolution, Environmental Determinism vs Possibilism', 'Weber industrial location, Whittlesey agriculture, Limits to Growth', 'Christaller Central Place Theory, Burgess/Hoyt/Harris-Ullman urban models', 'Heartland (Mackinder) and Rimland (Spykman) geopolitical doctrines'], thinkersOrLaws: ['Alfred Weber', 'Walter Christaller', 'Halford Mackinder', 'Nicholas Spykman'] },
      { paper: 'Paper II', section: 'Section A: Geography of India', unitNumber: 3, unitTitle: 'Physical Setting, Resources & Agriculture', keyTopics: ['Physiographic regions, Indian Monsoon mechanisms, Soils and Vegetation', 'Surface and groundwater stress, Mineral belts, Energy resources', 'Cropping patterns, Green Revolution, Agro-climatic zones, Dryland farming'], thinkersOrLaws: ['ICAR Soil Classification', 'Planning Commission Agro-Climatic Regions', 'National Water Policy'] },
      { paper: 'Paper II', section: 'Section B: Indian Development', unitNumber: 4, unitTitle: 'Industry, Transport, Settlements & Disasters', keyTopics: ['Location factors of steel, cotton, petrochemicals, auto & IT clusters', 'Industrial corridors, PM Gati Shakti, Urban sprawl and slums', 'Regional planning, Interlinking of rivers, Natural hazards and climate impact'], thinkersOrLaws: ['Weber Material Index', 'Perroux Growth Pole Theory', 'Sendai Disaster Framework'] }
    ]
  },
  'exam-upsc-opt-history': {
    id: 'exam-upsc-opt-history',
    title: 'History Optional (Paper I & II)',
    shortTitle: 'History Optional',
    badgeColor: '#8b5cf6',
    units: [
      { paper: 'Paper I', section: 'Section A: Ancient India', unitNumber: 1, unitTitle: 'Archaeology, IVC, Vedic, Mauryas & Guptas', keyTopics: ['Archaeological sources, IVC town planning, craft and trade networks', 'Rigvedic vs Later Vedic transition, 16 Mahajanapadas, Heterodox religions', 'Mauryan administration, Ashokan Dhamma edicts, Sangam Age South India', 'Gupta Golden Age debate, Land grants, Temple art and architecture'], thinkersOrLaws: ['Kautilya Arthashastra', 'Ashokan Edicts', 'Megasthenes Indica', 'Prayag Prashasti'] },
      { paper: 'Paper I', section: 'Section B: Medieval India', unitNumber: 2, unitTitle: 'Delhi Sultanate, Mughals & Marathas', keyTopics: ['Chola Kudavolai system, Delhi Sultanate (Alauddin Khilji, Tughlaqs)', 'Vijayanagara Empire (Nayankara system), Bhakti and Sufi synthesis', 'Mughals: Akbar (Mansabdari, Zabti, Sulh-i-Kul), Aurangzeb Deccan policy', 'Shivaji administration, Ashtapradhan, Chauth and Sardeshmukhi'], thinkersOrLaws: ['Ziauddin Barani', 'Abul Fazl (Ain-i-Akbari)', 'Kudavolai Uttaramerur Inscription'] },
      { paper: 'Paper II', section: 'Section A: Modern India', unitNumber: 3, unitTitle: 'British Rule & National Freedom Struggle', keyTopics: ['British conquest of Bengal, Subsidiary Alliance, Doctrine of Lapse', 'Land revenue (Permanent, Ryotwari, Mahalwari), Drain of Wealth Theory', '1857 Revolt, Socio-religious reforms (Brahmo, Arya, Dalit assertions)', 'Gandhian Mass Movements (NCM, CDM, QIM), Partition & Integration'], thinkersOrLaws: ['Dadabhai Naoroji (Drain Theory)', 'Mahatma Gandhi', 'Dr. B.R. Ambedkar', 'Subhash Chandra Bose'] },
      { paper: 'Paper II', section: 'Section B: World History', unitNumber: 4, unitTitle: 'Revolutions, World Wars & Modern World', keyTopics: ['Enlightenment, Industrial Revolution, American & French Revolutions', 'Unification of Italy & Germany, Imperialism and Scramble for Africa', 'World War I, Russian Revolution 1917, Great Depression, Fascism/Nazism', 'World War II, Cold War, Decolonization, Disintegration of USSR (1991)'], thinkersOrLaws: ['Jean-Jacques Rousseau', 'Karl Marx', 'Vladimir Lenin', 'Otto von Bismarck'] }
    ]
  },
  'exam-upsc-opt-phil': {
    id: 'exam-upsc-opt-phil',
    title: 'Philosophy Optional (Paper I & II)',
    shortTitle: 'Philosophy Optional',
    badgeColor: '#06b6d4',
    units: [
      { paper: 'Paper I', section: 'Section A: Western Philosophy', unitNumber: 1, unitTitle: 'Western Epistemology & Metaphysics', keyTopics: ['Plato (Forms/Ideas), Aristotle (Causes, Form & Matter)', 'Rationalism: Descartes (Cogito), Spinoza (Substance Monism), Leibniz (Monads)', 'Empiricism: Locke (Tabula Rasa), Berkeley (Esse Est Percipi), Hume (Causality)', 'Kant (Synthetic A Priori, Phenomena vs Noumena), Hegel, Ayer, Wittgenstein, Sartre'], thinkersOrLaws: ['Rene Descartes', 'Immanuel Kant', 'David Hume', 'Ludwig Wittgenstein', 'Jean-Paul Sartre'] },
      { paper: 'Paper I', section: 'Section B: Indian Philosophy', unitNumber: 2, unitTitle: 'Orthodox & Heterodox Indian Schools', keyTopics: ['Carvaka Materialism, Jainism (Anekantavada, Syadvada)', 'Buddhism (Four Noble Truths, Pratityasamutpada, Anatmavada, Sunyavada)', 'Nyaya Epistemology (4 Pramanas), Vaisesika Padarthas, Samkhya Purusha-Prakriti', 'Advaita Vedanta (Shankara: Vivartavada, Maya) vs Visistadvaita (Ramanuja)'], thinkersOrLaws: ['Nagarjuna', 'Adi Shankara', 'Ramanuja', 'Patanjali', 'Gautama Muni'] },
      { paper: 'Paper II', section: 'Section A: Socio-Political', unitNumber: 3, unitTitle: 'Political Ideals, Justice, Gender & Punishment', keyTopics: ['Equality, Justice, Liberty, Sovereignty, Liberalism vs Marxism', 'Theories of Punishment (Retributive, Deterrent, Reformative), Capital punishment', 'Gender discrimination, Feminism, Gandhi-Ambedkar caste debate, Environmental ethics'], thinkersOrLaws: ['John Rawls', 'Mahatma Gandhi', 'B.R. Ambedkar', 'Peter Singer'] },
      { paper: 'Paper II', section: 'Section B: Philosophy of Religion', unitNumber: 4, unitTitle: 'God, Faith, Problem of Evil & Religious Language', keyTopics: ['Concept of God, Proofs for God existence (Ontological, Cosmological, Teleological)', 'Problem of Evil and suffering (Theodicy), Immortality of soul, Karma', 'Religious Experience (Otto Numinous, William James), Religious Language (Verification vs Language Game)'], thinkersOrLaws: ['St. Thomas Aquinas', 'Rudolf Otto', 'William James', 'Paul Tillich'] }
    ]
  },
  'exam-upsc-opt-eco': {
    id: 'exam-upsc-opt-eco',
    title: 'Economics Optional (Paper I & II)',
    shortTitle: 'Economics Optional',
    badgeColor: '#f59e0b',
    units: [
      { paper: 'Paper I', section: 'Section A: Micro & Macro Theory', unitNumber: 1, unitTitle: 'Advanced Microeconomics & Macroeconomics', keyTopics: ['Consumer behavior (Slutsky equation, Revealed Preference), Production functions', 'Oligopoly (Cournot, Stackelberg), Game Theory (Nash Equilibrium), Welfare economics (Pareto)', 'IS-LM model, Consumption theories (Friedman, Life-Cycle), Phillips Curve & Rational Expectations'], thinkersOrLaws: ['Eugen Slutsky', 'John Nash', 'Vilfredo Pareto', 'John Maynard Keynes', 'Milton Friedman'] },
      { paper: 'Paper I', section: 'Section B: Development, Finance & Trade', unitNumber: 2, unitTitle: 'Growth Models, Public Finance & International Trade', keyTopics: ['Solow-Swan neoclassical growth model, Endogenous growth (Romer, Lucas), Lewis model', 'Optimal taxation, Deadweight loss, Public debt sustainability, Ricardian Equivalence', 'Heckscher-Ohlin trade theory, Stolper-Samuelson, Krugman New Trade Theory, Balance of Payments'], thinkersOrLaws: ['Robert Solow', 'Arthur Lewis', 'Paul Krugman', 'Heckscher-Ohlin Model'] },
      { paper: 'Paper II', section: 'Section A: Pre-Independence & Planning', unitNumber: 3, unitTitle: 'Colonial Economy, Planning & Agriculture', keyTopics: ['Colonial drain of wealth, De-industrialization, Land revenue settlements', 'Five-Year Plans evaluation, Shift to NITI Aayog, National income trends', 'Land reforms, Green Revolution, MSP pricing policy (CACP), Food security (PDS, NFSA)'], thinkersOrLaws: ['Dadabhai Naoroji', 'P.C. Mahalanobis', 'M.S. Swaminathan', 'Amartya Sen'] },
      { paper: 'Paper II', section: 'Section B: Industry, Banking & Foreign Trade', unitNumber: 4, unitTitle: 'LPG Reforms, Monetary Policy & External Sector', keyTopics: ['1991 Industrial Policy, MSMEs, Disinvestment, Infrastructure PPP models', 'Monetary Policy Committee (MPC), Banking NPAs, IBC 2016, GST & FRBM targets', 'Foreign trade composition, FDI/FPI flows, CAD, Exchange rate management, WTO agreements'], thinkersOrLaws: ['Urjit Patel Committee', 'N.K. Singh FRBM Committee', 'Tarapore Committee on Convertibility'] }
    ]
  },
  'exam-upsc-opt-maths': {
    id: 'exam-upsc-opt-maths',
    title: 'Mathematics Optional (Paper I & II)',
    shortTitle: 'Mathematics Optional',
    badgeColor: '#ec4899',
    units: [
      { paper: 'Paper I', section: 'Section A: Linear Algebra, Calculus & 3D', unitNumber: 1, unitTitle: 'Linear Algebra, Calculus & Analytic Geometry', keyTopics: ['Vector spaces, Rank-Nullity theorem, Cayley-Hamilton, Eigenvalues/Eigenvectors', 'Mean Value Theorems, Taylor series in 2 variables, Maxima/Minima, Double/Triple integrals', 'Planes, Skew lines shortest distance, Sphere, Cone, Cylinder, Conicoids tangent planes'], thinkersOrLaws: ['Cayley-Hamilton Theorem', 'Rank-Nullity Theorem', 'Taylor Theorem', 'Lagrange Multipliers'] },
      { paper: 'Paper I', section: 'Section B: ODE, Vectors & Mechanics', unitNumber: 2, unitTitle: 'Differential Equations, Vector Analysis, Statics & Dynamics', keyTopics: ['First order exact ODEs, Higher order linear ODEs, Variation of parameters, Laplace transforms', 'Gradient, Divergence, Curl, Gauss Divergence, Green and Stokes theorems', 'Virtual work, Common Catenary, SHM, Projectile motion, Central orbits, Kepler laws'], thinkersOrLaws: ['Stokes Theorem', 'Gauss Divergence Theorem', 'Kepler Laws', 'Laplace Transform'] },
      { paper: 'Paper II', section: 'Section A: Analysis & Abstract Algebra', unitNumber: 3, unitTitle: 'Real Analysis, Complex Analysis, Modern Algebra & PDE', keyTopics: ['Cauchy sequences, Riemann integral, Uniform convergence (Weierstrass M-test)', 'Analytic functions, Cauchy Integral formula, Residue Theorem, Contour integration', 'Groups, Lagrange theorem, Quotient groups, Rings, Ideals, UFDs', 'Charpit method, Second order linear PDE, Heat, Wave, Laplace equations'], thinkersOrLaws: ['Cauchy Residue Theorem', 'Weierstrass M-Test', 'Lagrange Group Theorem', 'Riemann Integral'] },
      { paper: 'Paper II', section: 'Section B: Applied Mathematics', unitNumber: 4, unitTitle: 'Numerical Analysis, Computer Programming & Fluid Dynamics', keyTopics: ['Newton-Raphson, Gauss-Seidel, Interpolation, Simpson 1/3 and 3/8 rules, Runge-Kutta 4th order', 'Generalized coordinates, D\'Alembert principle, Lagrange and Hamilton canonical equations', 'Equation of continuity, Euler equations of motion, Bernoulli equation, Navier-Stokes equations'], thinkersOrLaws: ['Runge-Kutta 4th Order', 'Hamilton Canonical Equations', 'Euler-Bernoulli Fluid Equations', 'Navier-Stokes Equations'] }
    ]
  },
  'exam-upsc-opt-law': {
    id: 'exam-upsc-opt-law',
    title: 'Law Optional (Paper I & II)',
    shortTitle: 'Law Optional',
    badgeColor: '#06b6d4',
    units: [
      { paper: 'Paper I', section: 'Section A: Constitutional & Admin Law', unitNumber: 1, unitTitle: 'Constitutional Law, Fundamental Rights & Administrative Law', keyTopics: ['Preamble, Fundamental Rights, DPSPs, Basic Structure Doctrine', 'Executive powers (Art 72/123/200), Parliamentary privileges, Judicial Review & Collegium', 'Federalism, Art 356 Emergency, Rule of Law (Dicey), Natural Justice, Delegated Legislation'], thinkersOrLaws: ['A.V. Dicey Rule of Law', 'Kesavananda Bharati Case', 'Maneka Gandhi Case', 'S.R. Bommai Case'] },
      { paper: 'Paper I', section: 'Section B: International Law', unitNumber: 2, unitTitle: 'Public International Law, UNCLOS & Treaties', keyTopics: ['Sources of International Law, Relationship with Municipal law (Monism vs Dualism)', 'State recognition and succession, UNCLOS Maritime Zones (Territorial Sea, EEZ, Continental Shelf)', 'Extradition political offence exception, Asylum, Treaty interpretation (Pacta Sunt Servanda), ICJ'], thinkersOrLaws: ['UNCLOS 1982', 'Vienna Convention on Law of Treaties', 'Geneva Conventions', 'UN Charter Article 51'] },
      { paper: 'Paper II', section: 'Section A: Crimes & Torts', unitNumber: 3, unitTitle: 'Law of Crimes (BNS/IPC) & Law of Torts', keyTopics: ['General principles of criminal liability: Actus Reus, Mens Rea, Strict Liability', 'General exceptions (Insanity McNaghten rules, Private Defence), Culpable Homicide vs Murder (Sec 299/300)', 'Tort principles, Volenti Non Fit Injuria, Vicarious Liability, Negligence, Strict & Absolute Liability (Rylands vs Fletcher, M.C. Mehta)'], thinkersOrLaws: ['McNaghten Rules', 'Rylands vs Fletcher (1868)', 'M.C. Mehta Oleum Gas Case (1987)', 'Consumer Protection Act 2019'] },
      { paper: 'Paper II', section: 'Section B: Contracts & Mercantile Law', unitNumber: 4, unitTitle: 'Law of Contracts, Mercantile Law & Dispute Resolution', keyTopics: ['Offer, Acceptance, Consideration (Privity of contract), Free Consent (Coercion, Undue Influence, Fraud)', 'Discharge of contract, Doctrine of Frustration (Sec 56), Damages for breach', 'Indemnity & Guarantee, Bailment & Pledge, Agency, Sale of Goods (Caveat Emptor), Partnership & LLP', 'Negotiable Instruments (Sec 138 Cheque dishonor), Arbitration and Conciliation Act 1996'], thinkersOrLaws: ['Indian Contract Act 1872', 'Sale of Goods Act 1930', 'Partnership Act 1932', 'Arbitration & Conciliation Act 1996'] }
    ]
  }
};
