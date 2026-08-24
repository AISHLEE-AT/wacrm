const fs = require('fs');
const path = require('path');

const generateNanoConcepts = (topicName, index) => {
    return [
        {
            id: `nc_${topicName.replace(/[^a-zA-Z0-9]/g, '_')}_${index}_1`,
            conceptCode: `NC-${topicName.substring(0, 3).toUpperCase()}-${index}01`,
            name: `${topicName} Concept 1`,
            tamilName: `${topicName} கருத்து 1`,
            description: `Detailed explanation of ${topicName} concept 1.`,
            keyRuleOrFormula: `Formula 1`,
            solvedExampleOrLaw: `Example 1`,
            questionType: '1-Mark MCQ',
            estimatedMinutes: 15,
            pyqReferences: ['PYQ-2021', 'PYQ-2022']
        },
        {
            id: `nc_${topicName.replace(/[^a-zA-Z0-9]/g, '_')}_${index}_2`,
            conceptCode: `NC-${topicName.substring(0, 3).toUpperCase()}-${index}02`,
            name: `${topicName} Concept 2`,
            tamilName: `${topicName} கருத்து 2`,
            description: `Detailed explanation of ${topicName} concept 2.`,
            keyRuleOrFormula: `Formula 2`,
            solvedExampleOrLaw: `Example 2`,
            questionType: '2-Mark',
            estimatedMinutes: 20,
            pyqReferences: ['PYQ-2023']
        },
        {
            id: `nc_${topicName.replace(/[^a-zA-Z0-9]/g, '_')}_${index}_3`,
            conceptCode: `NC-${topicName.substring(0, 3).toUpperCase()}-${index}03`,
            name: `${topicName} Concept 3`,
            tamilName: `${topicName} கருத்து 3`,
            description: `Detailed explanation of ${topicName} concept 3.`,
            keyRuleOrFormula: `Formula 3`,
            solvedExampleOrLaw: `Example 3`,
            questionType: '5-Mark',
            estimatedMinutes: 30,
            pyqReferences: ['PYQ-2024']
        }
    ];
};

const generateMicroTopics = (chapterName, index) => {
    return [
        {
            id: `mt_${chapterName.replace(/[^a-zA-Z0-9]/g, '_')}_1`,
            name: `${chapterName} Intro`,
            tamilName: `${chapterName} அறிமுகம்`,
            description: `Introduction to ${chapterName}`,
            weightage: 'High',
            nanoConcepts: generateNanoConcepts(`${chapterName} Intro`, 1)
        },
        {
            id: `mt_${chapterName.replace(/[^a-zA-Z0-9]/g, '_')}_2`,
            name: `${chapterName} Advanced`,
            tamilName: `${chapterName} மேம்பட்ட`,
            description: `Advanced topics in ${chapterName}`,
            weightage: 'Medium',
            nanoConcepts: generateNanoConcepts(`${chapterName} Advanced`, 2)
        }
    ];
};

const generateChapters = (subjectName, chaptersList) => {
    return chaptersList.map((ch, idx) => ({
        id: `ch_${ch.replace(/[^a-zA-Z0-9]/g, '_')}_${idx}`,
        chapterNumber: idx + 1,
        title: ch,
        tamilTitle: `${ch} (தமிழ்)`,
        description: `Complete syllabus for ${ch}`,
        termOrSemester: 'Term 1',
        totalHours: 10,
        microTopics: generateMicroTopics(ch, idx)
    }));
};

const courseData = {
    'entrance-neet': {
        name: 'NEET',
        tamilName: 'நீட்',
        subjects: [
            { id: 'neet_phy', name: 'Physics', tamilName: 'இயற்பியல்', code: 'PHY', chapters: ['Units', 'Kinematics', 'Laws of Motion', 'Work-Energy', 'Gravitation', 'Properties of Matter', 'Thermodynamics', 'KTG', 'Oscillations', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetism', 'EM Waves', 'Optics', 'Dual Nature', 'Atoms', 'Nuclei', 'Semiconductor'] },
            { id: 'neet_chem', name: 'Chemistry', tamilName: 'வேதியியல்', code: 'CHE', chapters: ['Atomic Structure', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox', 'Hydrogen', 's-Block', 'p-Block', 'd-Block', 'Coordination', 'Hydrocarbons', 'Polymers', 'Biomolecules', 'Chemistry Everyday Life'] },
            { id: 'neet_bio', name: 'Biology', tamilName: 'உயிரியல்', code: 'BIO', chapters: ['Diversity', 'Plant/Animal Kingdom', 'Morphology', 'Cell', 'Biomolecules', 'Cell Division', 'Transport', 'Photosynthesis', 'Respiration', 'Plant Growth', 'Digestion', 'Breathing', 'Body Fluids', 'Excretion', 'Locomotion', 'Neural Control', 'Reproduction', 'Genetics', 'Evolution', 'Ecology', 'Biotechnology', 'Health'] }
        ]
    },
    'entrance-jee': {
        name: 'JEE Main & Advanced',
        tamilName: 'ஜே.இ.இ',
        subjects: [
            { id: 'jee_phy', name: 'Physics', tamilName: 'இயற்பியல்', code: 'PHY', chapters: ['Mechanics', 'Electrostatics', 'Magnetism', 'Optics', 'Modern Physics', 'Waves', 'Thermodynamics'] },
            { id: 'jee_chem', name: 'Chemistry', tamilName: 'வேதியியல்', code: 'CHE', chapters: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] },
            { id: 'jee_math', name: 'Mathematics', tamilName: 'கணிதம்', code: 'MAT', chapters: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry', 'Vectors', 'Probability'] }
        ]
    },
    'entrance-cuet': { name: 'CUET', tamilName: 'CUET', subjects: [{ id: 'cuet_all', name: 'CUET Subjects', tamilName: 'CUET பாடங்கள்', code: 'CUET', chapters: ['General Test', 'Domain Subjects', 'Language'] }] },
    'entrance-tancet': { name: 'TANCET', tamilName: 'TANCET', subjects: [{ id: 'tancet_all', name: 'TANCET Subjects', tamilName: 'TANCET பாடங்கள்', code: 'TAN', chapters: ['MBA Quant', 'Verbal', 'Data', 'LR', 'MCA Maths', 'Computer', 'ME Engineering Math'] }] },
    'entrance-gate': { name: 'GATE', tamilName: 'GATE', subjects: [{ id: 'gate_all', name: 'GATE Subjects', tamilName: 'GATE பாடங்கள்', code: 'GATE', chapters: ['Engineering Mathematics', 'General Aptitude', 'Core Subject'] }] },
    'entrance-cat': { name: 'CAT', tamilName: 'CAT', subjects: [{ id: 'cat_all', name: 'CAT Subjects', tamilName: 'CAT பாடங்கள்', code: 'CAT', chapters: ['VARC', 'DILR', 'Quantitative Ability'] }] },
    'entrance-clat': { name: 'CLAT', tamilName: 'CLAT', subjects: [{ id: 'clat_all', name: 'CLAT Subjects', tamilName: 'CLAT பாடங்கள்', code: 'CLAT', chapters: ['English', 'GK/Current Affairs', 'Legal Reasoning', 'Logical Reasoning', 'Quantitative'] }] },
    'entrance-nata': { name: 'NATA', tamilName: 'NATA', subjects: [{ id: 'nata_all', name: 'NATA Subjects', tamilName: 'NATA பாடங்கள்', code: 'NATA', chapters: ['Mathematics', 'General Aptitude', 'Drawing'] }] },

    'tnpsc-group4': {
        name: 'TNPSC Group 4',
        tamilName: 'TNPSC Group 4',
        subjects: [
            { id: 'g4_tamil', name: 'Part A Tamil', tamilName: 'பகுதி அ தமிழ்', code: 'TAM', chapters: ['இலக்கணம் 20 பகுதிகள்', 'இலக்கியம் 10', 'தமிழ் அறிஞர்கள் 20'] },
            { id: 'g4_gs', name: 'Part B General Studies', tamilName: 'பகுதி ஆ பொது அறிவு', code: 'GS', chapters: ['History', 'Polity', 'Geography', 'Science', 'Economy', 'Current Events'] },
            { id: 'g4_apt', name: 'Aptitude', tamilName: 'திறனறிதல்', code: 'APT', chapters: ['Simplification', 'Percentage', 'Ratio', 'SI/CI', 'Time/Work/Speed', 'Logical Reasoning', 'Number Series', 'Coding'] }
        ]
    },
    'tnpsc-group2': { name: 'TNPSC Group 2', tamilName: 'TNPSC Group 2', subjects: [{ id: 'g2_all', name: 'Group 2 Subjects', tamilName: 'Group 2 பாடங்கள்', code: 'G2', chapters: ['Paper I Tamil & English', 'Paper II GS & Aptitude'] }] },
    'tnpsc-group1': { name: 'TNPSC Group 1', tamilName: 'TNPSC Group 1', subjects: [{ id: 'g1_all', name: 'Group 1 Subjects', tamilName: 'Group 1 பாடங்கள்', code: 'G1', chapters: ['Prelims GS', 'Mains Paper I', 'Mains Paper II', 'Mains Paper III'] }] },
    'tnusrb-si': { name: 'TNUSRB SI', tamilName: 'TNUSRB SI', subjects: [{ id: 'si_all', name: 'SI Subjects', tamilName: 'SI பாடங்கள்', code: 'SI', chapters: ['General Knowledge', 'Psychology/Mental Ability', 'Tamil Eligibility', 'Physical Test'] }] },
    'tnusrb-pc': { name: 'TNUSRB PC', tamilName: 'TNUSRB PC', subjects: [{ id: 'pc_all', name: 'PC Subjects', tamilName: 'PC பாடங்கள்', code: 'PC', chapters: ['GK', 'Aptitude', 'Tamil'] }] },
    'trb-tet': { name: 'TRB TET', tamilName: 'TRB TET', subjects: [{ id: 'tet_all', name: 'TET Subjects', tamilName: 'TET பாடங்கள்', code: 'TET', chapters: ['Child Development', 'Language I Tamil', 'Language II English', 'Maths/Science', 'Social Science'] }] },
    'tn-forest': { name: 'TN Forest', tamilName: 'TN Forest', subjects: [{ id: 'forest_all', name: 'Forest Subjects', tamilName: 'Forest பாடங்கள்', code: 'FOR', chapters: ['GK', 'Aptitude', 'Tamil', 'Forest-specific topics'] }] },

    'banking-ibps-sbi': { name: 'Banking IBPS/SBI', tamilName: 'வங்கி தேர்வுகள்', subjects: [{ id: 'bank_all', name: 'Banking Subjects', tamilName: 'வங்கி பாடங்கள்', code: 'BANK', chapters: ['Reasoning', 'Quantitative Aptitude', 'English', 'General Awareness', 'Computer Knowledge'] }] },
    'ssc-cgl': { name: 'SSC CGL', tamilName: 'SSC CGL', subjects: [{ id: 'cgl_all', name: 'CGL Subjects', tamilName: 'CGL பாடங்கள்', code: 'CGL', chapters: ['Tier 1 GI/Reasoning', 'Tier 1 Quant', 'Tier 1 English', 'Tier 1 GK', 'Tier 2 Quant', 'Tier 2 English', 'Statistics/Finance'] }] },
    'ssc-chsl-mts': { name: 'SSC CHSL/MTS', tamilName: 'SSC CHSL/MTS', subjects: [{ id: 'chsl_all', name: 'CHSL Subjects', tamilName: 'CHSL பாடங்கள்', code: 'CHSL', chapters: ['GI/Reasoning', 'Quant', 'English', 'GK'] }] },
    'ssc-gd': { name: 'SSC GD', tamilName: 'SSC GD', subjects: [{ id: 'gd_all', name: 'GD Subjects', tamilName: 'GD பாடங்கள்', code: 'GD', chapters: ['GI/Reasoning', 'Quant', 'English/Hindi', 'GK'] }] },
    'rrb-ntpc': { name: 'RRB NTPC', tamilName: 'RRB NTPC', subjects: [{ id: 'ntpc_all', name: 'NTPC Subjects', tamilName: 'NTPC பாடங்கள்', code: 'NTPC', chapters: ['Maths', 'GI/Reasoning', 'General Awareness'] }] },
    'rrb-alp-group-d': { name: 'RRB ALP/Group D', tamilName: 'RRB ALP/Group D', subjects: [{ id: 'alp_all', name: 'ALP Subjects', tamilName: 'ALP பாடங்கள்', code: 'ALP', chapters: ['Maths', 'GI/Reasoning', 'General Science', 'General Awareness'] }] },
    'upsc-cse': { name: 'UPSC CSE', tamilName: 'UPSC CSE', subjects: [{ id: 'upsc_all', name: 'UPSC Subjects', tamilName: 'UPSC பாடங்கள்', code: 'UPSC', chapters: ['Prelims GS', 'CSAT Comprehension', 'CSAT Reasoning', 'CSAT Quant', 'Decision Making'] }] },
    'defense-exams': { name: 'Defense Exams', tamilName: 'பாதுகாப்பு தேர்வுகள்', subjects: [{ id: 'def_all', name: 'Defense Subjects', tamilName: 'பாதுகாப்பு பாடங்கள்', code: 'DEF', chapters: ['Maths', 'English', 'GK', 'Reasoning'] }] },

    'degree-be-cse': { name: 'B.E CSE', tamilName: 'B.E CSE', subjects: [{ id: 'cse_all', name: 'CSE Subjects', tamilName: 'CSE பாடங்கள்', code: 'CSE', chapters: ['C Programming', 'Data Structures', 'DBMS', 'OS', 'Computer Networks', 'Software Engineering', 'AI/ML', 'Cloud Computing', 'Web Technologies', 'Compiler Design'] }] },
    'degree-be-ece': { name: 'B.E ECE', tamilName: 'B.E ECE', subjects: [{ id: 'ece_all', name: 'ECE Subjects', tamilName: 'ECE பாடங்கள்', code: 'ECE', chapters: ['Circuit Theory', 'Signals & Systems', 'Digital Electronics', 'Communication Systems', 'VLSI', 'Embedded Systems'] }] },
    'degree-be-mech': { name: 'B.E Mechanical', tamilName: 'B.E Mechanical', subjects: [{ id: 'mech_all', name: 'Mech Subjects', tamilName: 'Mech பாடங்கள்', code: 'MECH', chapters: ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing', 'CAD/CAM', 'IC Engines'] }] },
    'degree-bsc-cs': { name: 'B.Sc CS', tamilName: 'B.Sc CS', subjects: [{ id: 'bsc_cs', name: 'B.Sc CS Subjects', tamilName: 'B.Sc CS பாடங்கள்', code: 'BSCS', chapters: ['C/C++', 'Java', 'Data Structures', 'DBMS', 'Web Tech', 'Networks', 'Software Engineering'] }] },
    'degree-bsc-agri': { name: 'B.Sc Agriculture', tamilName: 'B.Sc விவசாயம்', subjects: [{ id: 'agri_all', name: 'Agri Subjects', tamilName: 'Agri பாடங்கள்', code: 'AGRI', chapters: ['Agronomy', 'Soil Science', 'Plant Pathology', 'Genetics', 'Agricultural Economics', 'Extension'] }] },
    'degree-bcom': { name: 'B.Com', tamilName: 'B.Com', subjects: [{ id: 'bcom_all', name: 'B.Com Subjects', tamilName: 'B.Com பாடங்கள்', code: 'BCOM', chapters: ['Financial Accounting', 'Cost Accounting', 'Corporate Law', 'Income Tax', 'Auditing', 'Banking'] }] },
    'degree-bba-mba': { name: 'BBA/MBA', tamilName: 'BBA/MBA', subjects: [{ id: 'bba_all', name: 'BBA Subjects', tamilName: 'BBA பாடங்கள்', code: 'BBA', chapters: ['Management Principles', 'Marketing', 'Finance', 'HR', 'Operations', 'Strategic Management'] }] },
    'degree-bca-mca': { name: 'BCA/MCA', tamilName: 'BCA/MCA', subjects: [{ id: 'bca_all', name: 'BCA Subjects', tamilName: 'BCA பாடங்கள்', code: 'BCA', chapters: ['C Programming', 'OOP', 'DBMS', 'Web Development', 'Networks', 'Software Engineering'] }] },
    'degree-ba': { name: 'B.A', tamilName: 'B.A', subjects: [{ id: 'ba_all', name: 'B.A Subjects', tamilName: 'B.A பாடங்கள்', code: 'BA', chapters: ['Literature', 'History', 'Political Science', 'Economics', 'Sociology', 'Philosophy'] }] },
    'degree-bpharm': { name: 'B.Pharm', tamilName: 'B.Pharm', subjects: [{ id: 'bpharm_all', name: 'B.Pharm Subjects', tamilName: 'B.Pharm பாடங்கள்', code: 'BPHARM', chapters: ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry', 'Pharmacognosy', 'Hospital Pharmacy'] }] },

    'skill-fullstack': { name: 'Fullstack Dev', tamilName: 'Fullstack Dev', subjects: [{ id: 'fs_all', name: 'Fullstack Topics', tamilName: 'Fullstack தலைப்புகள்', code: 'FS', chapters: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs', 'Git', 'Deployment'] }] },
    'skill-python-ai': { name: 'Python & AI', tamilName: 'Python & AI', subjects: [{ id: 'pai_all', name: 'Python/AI Topics', tamilName: 'Python/AI தலைப்புகள்', code: 'PAI', chapters: ['Python Basics', 'NumPy', 'Pandas', 'ML (Scikit-learn)', 'Deep Learning (TensorFlow)', 'NLP', 'Gen AI (LangChain)'] }] },
    'skill-data-analytics': { name: 'Data Analytics', tamilName: 'Data Analytics', subjects: [{ id: 'da_all', name: 'DA Topics', tamilName: 'DA தலைப்புகள்', code: 'DA', chapters: ['Excel', 'SQL', 'Python', 'Tableau/Power BI', 'Statistics', 'A/B Testing'] }] },
    'skill-digital-marketing': { name: 'Digital Marketing', tamilName: 'Digital Marketing', subjects: [{ id: 'dm_all', name: 'DM Topics', tamilName: 'DM தலைப்புகள்', code: 'DM', chapters: ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Email', 'Analytics', 'Google Ads'] }] },
    'skill-tally-gst': { name: 'Tally & GST', tamilName: 'Tally & GST', subjects: [{ id: 'tally_all', name: 'Tally Topics', tamilName: 'Tally தலைப்புகள்', code: 'TALLY', chapters: ['Tally Prime', 'GST Filing', 'TDS', 'Payroll', 'Inventory', 'Financial Statements'] }] },
    'skill-uiux-figma': { name: 'UI/UX & Figma', tamilName: 'UI/UX & Figma', subjects: [{ id: 'ui_all', name: 'UI/UX Topics', tamilName: 'UI/UX தலைப்புகள்', code: 'UIUX', chapters: ['Design Principles', 'Wireframing', 'Figma', 'Prototyping', 'User Research', 'Design Systems'] }] },
    'skill-spoken-english': { name: 'Spoken English', tamilName: 'Spoken English', subjects: [{ id: 'se_all', name: 'Spoken English Topics', tamilName: 'Spoken English தலைப்புகள்', code: 'SE', chapters: ['Phonetics', 'Grammar', 'Vocabulary', 'Conversation', 'Public Speaking', 'Interview Skills'] }] },
    'skill-stock-trading': { name: 'Stock Trading', tamilName: 'Stock Trading', subjects: [{ id: 'st_all', name: 'Stock Trading Topics', tamilName: 'Stock Trading தலைப்புகள்', code: 'ST', chapters: ['Market Basics', 'Technical Analysis', 'Fundamental Analysis', 'Options', 'Risk Management'] }] },
    'skill-ev-solar': { name: 'EV & Solar', tamilName: 'EV & Solar', subjects: [{ id: 'ev_all', name: 'EV Topics', tamilName: 'EV தலைப்புகள்', code: 'EV', chapters: ['EV Architecture', 'Battery Technology', 'Solar Panel Installation', 'Inverters', 'Grid Systems'] }] },
    'skill-entrepreneurship': { name: 'Entrepreneurship', tamilName: 'Entrepreneurship', subjects: [{ id: 'ent_all', name: 'Entrepreneurship Topics', tamilName: 'Entrepreneurship தலைப்புகள்', code: 'ENT', chapters: ['Ideation', 'Business Model Canvas', 'Financial Planning', 'Legal', 'Marketing', 'Scaling'] }] }
};

let outputDict = {};

for (const [courseId, courseInfo] of Object.entries(courseData)) {
    outputDict[courseId] = {
        id: courseId,
        board: 'VARIOUS',
        boardTamil: 'பல்வேறு',
        medium: 'English/Tamil',
        className: courseInfo.name,
        classNameTamil: courseInfo.tamilName,
        academicYear: '2023-2024',
        lastUpdated: new Date().toISOString(),
        subjects: courseInfo.subjects.map((sub, sIdx) => ({
            id: sub.id,
            name: sub.name,
            tamilName: sub.tamilName,
            subjectCode: sub.code,
            isOptional: false,
            chapters: generateChapters(sub.name, sub.chapters)
        }))
    };
}

const fileContent = `import { OfficialCourseSyllabus, OfficialNanoConcept } from './officialGovernmentSyllabusRegistry';

export const EXAMS_DEGREES_SKILLS_SYLLABI: Record<string, OfficialCourseSyllabus> = ${JSON.stringify(outputDict, null, 2)};
`;

const filePaths = [
    'D:\\\\w\\\\apps\\\\mobile\\\\src\\\\data\\\\curriculum\\\\syllabusExamsDegreesSkills.ts',
    'D:\\\\w\\\\apps\\\\web\\\\src\\\\data\\\\curriculum\\\\syllabusExamsDegreesSkills.ts'
];

filePaths.forEach(fp => {
    const dir = path.dirname(fp);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fp, fileContent, 'utf8');
    console.log('Wrote', fp);
});
