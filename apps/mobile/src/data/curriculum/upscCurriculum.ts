/**
 * TeachO Master Curriculum — UPSC Civil Services (IAS/IPS), SSC CGL, Bank PO (360-Day Blueprint)
 * 100% Authentic UPSC Prelims + Mains Syllabus Mapping
 */

export interface CurriculumTopic {
  topic: string;
  subtopic: string;
  keyPoints: string[];
}

export const UPSC_POLITY_SYLLABUS: CurriculumTopic[] = [
  { topic: 'GS 2: Making of Indian Constitution & Key Committees', subtopic: 'Cabinet Mission, Constituent Assembly Debates, Drafting Committee & Preamble', keyPoints: ['Constituent Assembly Formed Dec 1946', 'Objective Resolution by Nehru', 'Dr. B.R. Ambedkar Chairmanship', '2 Years 11 Months 18 Days Duration'] },
  { topic: 'GS 2: Salient Features & Constitutional Philosophy', subtopic: 'Federal with Unitary Bias, Parliamentary Sovereignty vs Judicial Supremacy', keyPoints: ['Rigid yet Flexible Constitution', 'Single Integrated Judiciary', 'Universal Adult Franchise (61st Amendment)', 'Secular State Philosophy'] },
  { topic: 'GS 2: Fundamental Rights & Judicial Doctrines (Art 12–35)', subtopic: 'Doctrine of Severability, Eclipse, Basic Structure & Article 21 Evolution', keyPoints: ['AK Gopalan (1950) vs Maneka Gandhi (1978)', 'Kesavananda Bharati (1973) Basic Structure', 'Article 21A Right to Education', '5 Prerogative Writs under Art 32/226'] },
  { topic: 'GS 2: Directive Principles (DPSP) vs Fundamental Rights', subtopic: 'Socialistic, Gandhian & Liberal Principles, Article 44 Uniform Civil Code', keyPoints: ['Minerva Mills (1980) Harmony Doctrine', 'Champakam Dorairajan (1951)', 'Article 39(b) and 39(c) precedence', 'Uniform Civil Code Article 44 Nuances'] },
  { topic: 'GS 2: Union Executive — President, VP & Prime Minister', subtopic: 'Election, Ordinance Powers (Art 123), Pardoning Powers (Art 72), Cabinet Secretariat', keyPoints: ['Electoral College (Art 54)', 'Ordinance Making Power RC Cooper Case', 'Article 72 Pardoning Scope', 'Collective Responsibility Art 75(3)'] },
  { topic: 'GS 2: Parliament of India — Structure, Procedures & Committees', subtopic: 'Speaker Role, Money Bill vs Financial Bill, PAC, Estimates Committee, Anti-Defection', keyPoints: ['Money Bill Certification Article 110', 'Public Accounts Committee (PAC) Function', '10th Schedule Kihoto Hollohan (1992)', 'Joint Sitting of Parliament Art 108'] },
  { topic: 'GS 2: Indian Judiciary — Supreme Court & High Courts', subtopic: 'Collegium System, NJAC Verdict, Judicial Review, Curative Petitions & PIL', keyPoints: ['Three Judges Cases (1981, 1993, 1998)', 'NJAC 99th Amendment Struck Down (2015)', 'Public Interest Litigation (PN Bhagwati)', 'Court of Record Article 129'] },
  { topic: 'GS 2: Federalism & Centre-State Relations', subtopic: 'Legislative (Art 245-255), Administrative (Art 256-263) & Financial Relations (GST)', keyPoints: ['Sarkaria & Punchhi Commissions', 'Article 356 SR Bommai Case Guidelines', 'Inter-State Council Article 263', 'Finance Commission Article 280'] }
];

export const UPSC_HISTORY_SYLLABUS: CurriculumTopic[] = [
  { topic: 'GS 1: Indus Valley Civilization & Vedic Culture', subtopic: 'Town Planning, Seals, Trade, Rig Vedic Society vs Later Vedic Developments', keyPoints: ['Harappa & Mohenjo-Daro Grid Planning', 'Great Bath, Granaries & Drainage System', 'Early Vedic Egalitarian Society', 'Iron Age & Mahajanapadas Rise'] },
  { topic: 'GS 1: Buddhism, Jainism & Mauryan Empire', subtopic: 'Four Noble Truths, Ashoka Edicts, Arthashastra & Dhamma Philosophy', keyPoints: ['Gautama Buddha & Mahavira Teachings', 'Ashokan Rock Edicts & Kalinga War', 'Kautilya Arthashastra Governance', 'Mauryan Art & Sarnath Pillar'] },
  { topic: 'GS 1: Gupta Golden Age & Harshavardhana', subtopic: 'Literature (Kalidasa), Science (Aryabhata), Temple Architecture & Nalanda University', keyPoints: ['Gupta Coinage & Classical Art', 'Aryabhata Zero & Astronomy', 'Fa-Hien & Hiuen Tsang Travelogues', 'Nalanda & Taxila Ancient Universities'] },
  { topic: 'GS 1: Medieval Indian Empires & Bhakti-Sufi Movements', subtopic: 'Delhi Sultanate, Chola Naval Dominance, Vijayanagara Empire & Mughal Architecture', keyPoints: ['Chola Kudavolai Local Self Governance', 'Vijayanagara Krishna Deva Raya (Hampi)', 'Mughal Mansabdari & Din-i-Ilahi', 'Kabir, Guru Nanak & Mirabai Bhakti'] },
  { topic: 'GS 1: British Expansion & 1857 Revolt', subtopic: 'Subsidiary Alliance, Doctrine of Lapse, Drain of Wealth & 1857 Causes', keyPoints: ['Battle of Plassey 1757 & Buxar 1764', 'Lord Dalhousie Doctrine of Lapse', 'Dadabhai Naoroji Poverty and Un-British Rule in India', 'Queen Victoria Proclamation 1858'] },
  { topic: 'GS 1: Indian National Movement — Moderates & Extremists', subtopic: 'Partition of Bengal (1905), Swadeshi Movement, Surat Split & Home Rule League', keyPoints: ['Founding of INC (1885) by AO Hume', 'Swadeshi & Boycott Movement', 'Tilak "Swaraj is my birthright"', 'Lucknow Pact 1916'] }
];

export const UPSC_ECONOMY_SYLLABUS: CurriculumTopic[] = [
  { topic: 'GS 3: National Income Accounting & GDP Measurement', subtopic: 'GDP, GNP, NNP, Real vs Nominal GDP, Gross Value Added (GVA) & Deflator', keyPoints: ['GDP at Factor Cost vs Market Price', 'Base Year Revision Methodology', 'Nominal vs Real GDP Calculations', 'Purchasing Power Parity (PPP)'] },
  { topic: 'GS 3: Monetary Policy & RBI Framework', subtopic: 'Repo Rate, Reverse Repo, CRR, SLR, Open Market Operations & MPC Mandate', keyPoints: ['Monetary Policy Committee 4+/-2% Target', 'Liquidity Adjustment Facility (LAF)', 'Marginal Standing Facility (MSF)', 'Quantitative vs Qualitative Credit Controls'] },
  { topic: 'GS 3: Fiscal Policy, Taxation & Union Budget', subtopic: 'Direct vs Indirect Taxes, GST Council, Revenue vs Capital Expenditure, Fiscal Deficit', keyPoints: ['FRBM Act 2003 Target Rules', 'Fiscal vs Primary Deficit Formula', 'GST 101st Constitutional Amendment', 'Tax-to-GDP Ratio in India'] },
  { topic: 'GS 3: Banking System, NPAs & Insolvency Code', subtopic: 'Twin Balance Sheet Challenge, Prompt Corrective Action (PCA), IBC 2016 & Bad Bank (NARCL)', keyPoints: ['Asset Reconstruction Companies (ARCs)', 'IBC 330-Day Resolution Timeline', 'Basel III Capital Adequacy Norms', 'Priority Sector Lending (PSL) Mandate'] }
];
