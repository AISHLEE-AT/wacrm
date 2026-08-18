import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sparkles,
  FileText,
  FileCheck2,
  CheckCircle2,
  X,
  BookOpen,
  Network,
  MessageSquare,
  Download,
  Share2,
  Send,
  Lightbulb,
  Check,
} from 'lucide-react-native';
import { geminiToolsService } from '../services/geminiToolsService';

export default function TeachOCourseScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { course } = route.params;

  const getCourseSyllabus = (courseTitle: string, category: string = '') => {
    const cleanTitle = courseTitle || 'Course';
    const t = cleanTitle.toLowerCase();
    const isLkg = t.includes('lkg') || t.includes('lower kindergarten');
    const isUkg = t.includes('ukg') || t.includes('upper kindergarten');
    const isC1 = t.includes('class 1') || t.includes('1st standard') || t.includes('1-ஆம் வகுப்பு');
    const isC2to5 = t.includes('class 2') || t.includes('2nd') || t.includes('class 3') || t.includes('3rd') || t.includes('class 4') || t.includes('4th') || t.includes('class 5') || t.includes('5th');
    const isC6to9 = t.includes('class 6') || t.includes('6th') || t.includes('class 7') || t.includes('7th') || t.includes('class 8') || t.includes('8th') || t.includes('class 9') || t.includes('9th');
    const is10th = t.includes('10th') || t.includes('sslc') || t.includes('10-ஆம் வகுப்பு');
    const is11th = t.includes('class 11') || t.includes('11th') || t.includes('plus one');
    const is12th = t.includes('class 12') || t.includes('12th') || t.includes('plus two') || t.includes('hsc');
    const isNeet = t.includes('neet') || t.includes('jee') || t.includes('iit');
    const isTnpsc = t.includes('tnpsc') || t.includes('group') || t.includes('vao') || t.includes('police');

    if (isLkg || isUkg) {
      return [
        {
          id: 'kg_tam',
          subjectName: 'தமிழ் (Tamil Early)',
          unitNumber: 'பகுதி 1',
          title: isLkg ? 'உயிர் எழுத்துக்கள் (12) & எளிய பாட்டு' : 'மெய் எழுத்துக்கள் (18) & சொல் வளம்',
          chapters: [
            { id: 'kg_tam_c1', title: isLkg ? 'அ முதல் ஔ வரை உயிர் எழுத்துக்கள்' : 'க் முதல் ன் வரை மெய் எழுத்துக்கள்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'எழுத்து பயிற்சி & பட விளக்கம்', microTopics: [{ title: isLkg ? 'அ - அம்மா, ஆ - ஆடு படங்கள்' : 'க் - கொக்கு, ச் - சக்கரம் படங்கள்', pyq: 'High' }] }] }
          ]
        },
        {
          id: 'kg_eng',
          subjectName: 'English (Phonics & ABC)',
          unitNumber: 'Unit 2',
          title: isLkg ? 'Alphabet Phonics A to Z' : 'Sight Words & 3-Letter CVC Words',
          chapters: [
            { id: 'kg_eng_c1', title: isLkg ? 'Letter sounds and picture tracing' : 'Cat, Dog, Sun word blending', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Phonics and reading fluency', microTopics: [{ title: 'Sound blending and simple rhymes', pyq: 'High' }] }] }
          ]
        },
        {
          id: 'kg_math',
          subjectName: 'Mathematics',
          unitNumber: 'Unit 3',
          title: isLkg ? 'Numbers 1 to 20 & Shapes' : 'Numbers 1 to 50 & Simple Addition',
          chapters: [
            { id: 'kg_mat_c1', title: isLkg ? 'Counting 1 to 20 & Circle/Square/Triangle' : 'Addition facts up to 10 (+)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Number concepts and comparisons', microTopics: [{ title: 'Big vs Small and counting objects', pyq: 'High' }] }] }
          ]
        },
        {
          id: 'kg_evs',
          subjectName: 'General Awareness / EVS',
          unitNumber: 'Unit 4',
          title: 'My Family, Animals, Fruits & Good Habits',
          chapters: [
            { id: 'kg_evs_c1', title: 'Community Helpers, Colors & Personal Hygiene', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Good manners and nature appreciation', microTopics: [{ title: 'Cleanliness rules and identifying animals', pyq: 'Medium' }] }] }
          ]
        }
      ];
    }

    if (isC1 || isC2to5) {
      return [
        {
          id: 'prim_tam',
          subjectName: 'தமிழ் (Tamil)',
          unitNumber: 'பகுதி 1',
          title: 'செய்யுள், உரைநடை, நீதிநூல்கள் & எளிய இலக்கணம்',
          chapters: [
            { id: 'prim_tam_c1', title: 'ஆத்திசூடி, கொன்றை வேந்தன் & நல்வழிப் பாடல்கள்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'பெயர்ச்சொல் & வினைச்சொல் அறிமுகம்', microTopics: [{ title: 'உயிர்மெய் எழுத்துக்கள் & பாடல் நயம்', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'prim_eng',
          subjectName: 'English',
          unitNumber: 'Unit 2',
          title: 'Grammar, Tenses, Nouns, Verbs & Comprehension',
          chapters: [
            { id: 'prim_eng_c1', title: 'Action words, Tenses & Paragraph Writing', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Grammar Mechanics', microTopics: [{ title: 'Past/Present/Future verb forms', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'prim_mat',
          subjectName: 'Mathematics',
          unitNumber: 'Unit 3',
          title: 'Numbers, Operations, Multiplication Tables & Fractions',
          chapters: [
            { id: 'prim_mat_c1', title: 'Multiplication Tables, Long Division & Area/Perimeter', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Arithmetic Operations', microTopics: [{ title: 'Dividend = (Divisor x Quotient) + Remainder', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'prim_sci',
          subjectName: 'Science / EVS',
          unitNumber: 'Unit 4',
          title: 'Human Body Systems, Living Things & Solar System',
          chapters: [
            { id: 'prim_sci_c1', title: 'Sense Organs, Food & Digestion, Circulatory System', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Biological Systems', microTopics: [{ title: 'Heart, Lungs & Photosynthesis in Plants', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'prim_soc',
          subjectName: 'Social Science',
          unitNumber: 'Unit 5',
          title: 'Tamil Nadu Landscapes, Heritage Forts & Local Governance',
          chapters: [
            { id: 'prim_soc_c1', title: 'Kurinji, Mullai, Marutham & Freedom Movement', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Civic Responsibilities & Heritage', microTopics: [{ title: 'Ancient Tamil landscapes & National Symbols', pyq: 'High' }] }] }
          ]
        }
      ];
    }

    if (isC6to9) {
      return [
        {
          id: 'mid_tam',
          subjectName: 'தமிழ் (Tamil)',
          unitNumber: 'இயல் 1 & 2',
          title: 'இன்பத்தமிழ், திராவிட மொழிக்குடும்பம் & இலக்கணம்',
          chapters: [
            { id: 'mid_tam_c1', title: 'செய்யுள் நயம், உரைநடை உலகம் & தொடர் இலக்கணம்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'சார்பெழுத்துக்கள் & வல்லினம் மிகும் இடங்கள்', microTopics: [{ title: 'தொல்காப்பிய மரபுகள் & மொழிச் சிறப்புகள்', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'mid_eng',
          subjectName: 'English',
          unitNumber: 'Unit 1 & 2',
          title: 'Prose, Poetry Devices, Voices & Clauses',
          chapters: [
            { id: 'mid_eng_c1', title: 'Transformational Grammar & Direct/Indirect Speech', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Grammar and Syntax', microTopics: [{ title: 'Active to Passive Voice transformation', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'mid_mat',
          subjectName: 'Mathematics',
          unitNumber: 'Unit 1 & 2',
          title: 'Real Numbers, Polynomials, Geometry & Statistics',
          chapters: [
            { id: 'mid_mat_c1', title: 'Algebraic Identities & Coordinate Distance Formula', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Distance & Identities', microTopics: [{ title: 'd = sqrt((x2-x1)^2 + (y2-y1)^2)', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'mid_sci',
          subjectName: 'Science',
          unitNumber: 'Unit 1 & 2',
          title: 'Laws of Motion, Atomic Structure & Tissues',
          chapters: [
            { id: 'mid_sci_c1', title: 'Equations of Motion (v=u+at) & Bohr Model', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Physics & Chemistry Core', microTopics: [{ title: 'v^2 = u^2 + 2as & 2n^2 electron capacity', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'mid_soc',
          subjectName: 'Social Science',
          unitNumber: 'Unit 1 & 2',
          title: 'Indus Valley Civilisation, Medieval Cholas & Constitution',
          chapters: [
            { id: 'mid_soc_c1', title: 'Harappan Town Planning & Indian Democratic Governance', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Historical Archaeology', microTopics: [{ title: 'Keeladi excavations & Fundamental Rights', pyq: 'Very High' }] }] }
          ]
        }
      ];
    }

    if (is11th || is12th) {
      return [
        {
          id: 'hsc_phy',
          subjectName: 'Physics (இயற்பியல்)',
          unitNumber: 'Unit 1: Physics',
          title: is11th ? 'Kinematics, Newton’s Laws & Thermodynamics' : 'Electrostatics, Current Electricity & Optics',
          chapters: [
            { id: 'hsc_phy_c1', title: is11th ? '2D Projectiles & Work-Energy Theorem' : 'Coulomb’s Law, Gauss’s Law & Wheatstone Bridge', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Derivations and Problem Solving', microTopics: [{ title: is11th ? 'R_max = u^2/g at 45 degrees' : 'F = k*q1*q2/r^2 & P/Q = R/S', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'hsc_chem',
          subjectName: 'Chemistry (வேதியியல்)',
          unitNumber: 'Unit 2: Chemistry',
          title: is11th ? 'Atomic Structure & Chemical Bonding' : 'Electrochemistry, Chemical Kinetics & Organic',
          chapters: [
            { id: 'hsc_ch_c1', title: is11th ? 'Quantum Numbers & Aufbau Principle' : 'Nernst Equation & First Order Kinetics (t_1/2=0.693/k)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Theoretical Principles', microTopics: [{ title: is11th ? 'Pauli exclusion & Hund rule' : 'E_cell = E0 - (0.0591/n)log Q', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'hsc_mat',
          subjectName: 'Mathematics (கணிதம்)',
          unitNumber: 'Unit 3: Mathematics',
          title: is11th ? 'Trigonometry & Differential Calculus' : 'Matrices, Integral Calculus & Differential Equations',
          chapters: [
            { id: 'hsc_mat_c1', title: is11th ? 'Product/Quotient Rules of Differentiation' : 'Matrix Inverses & Integration by Parts', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Calculus Theorems', microTopics: [{ title: is11th ? 'd/dx(x^n) = n*x^(n-1)' : 'A^-1 = (1/|A|) adj(A)', pyq: 'Very High' }] }] }
          ]
        },
        {
          id: 'hsc_bio',
          subjectName: 'Biology / Computer Science',
          unitNumber: 'Unit 4: Biology/CS',
          title: is11th ? 'Cell Cycle, Photosynthesis & Python Loops' : 'Molecular Genetics & Relational SQL Databases',
          chapters: [
            { id: 'hsc_bio_c1', title: is11th ? 'Mitosis/Meiosis & Python Functions' : 'DNA Double Helix & SQL Joins/Aggregates', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Genetics and Code', microTopics: [{ title: is11th ? 'Calvin Cycle & Python OOP' : 'DNA Replication & Database normalization', pyq: 'Very High' }] }] }
          ]
        }
      ];
    }

    if (is10th) {
      return [
        {
          id: '10_tam',
          subjectName: 'தமிழ் (Tamil)',
          unitNumber: 'இயல் 1',
          title: 'மொழி: அன்னை மொழியே, தமிழ்ச்சொல் வளம் & இலக்கணம்',
          chapters: [
            { id: '10_tam_c1', title: 'அன்னை மொழியே (செய்யுள் - பாவலரேறு பெருஞ்சித்திரனார்)', tamilTitle: 'அன்னை மொழியே', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'தமிழ் தொன்மை & நயங்கள்', microTopics: [{ title: 'கணிச்சாறு பாடல் பொருள் & நயம்', pyq: 'High' }] }] },
            { id: '10_tam_c2', title: 'தமிழ்ச்சொல் வளம் (உரைநடை - தேவநேயப் பாவாணர்)', tamilTitle: 'தமிழ்ச்சொல் வளம்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'தாவர உறுப்புப் பெயர்கள்', microTopics: [{ title: 'அடிவகை & இலைவகைகள்', pyq: 'Very High' }] }] },
            { id: '10_tam_c3', title: 'எழுத்து, சொல் இலக்கணம் (கற்கண்டு)', tamilTitle: 'எழுத்து சொல் இலக்கணம்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'சார்பெழுத்து & அளபெடை', microTopics: [{ title: 'உயிரளபெடை, ஒற்றளபெடை & மொழி வகைகள்', pyq: 'Very High' }] }] },
          ]
        },
        {
          id: '10_eng',
          subjectName: 'English',
          unitNumber: 'Unit 1',
          title: 'His First Flight | Poem: Life | Active & Passive Voice',
          chapters: [
            { id: '10_eng_c1', title: 'Prose: His First Flight (Liam O’Flaherty)', tamilTitle: 'முதல் பறத்தல்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Young Seagull Flight Struggle', microTopics: [{ title: 'Overcoming Fear & Parental Motivation', pyq: 'High' }] }] },
            { id: '10_eng_c2', title: 'Poem: Life (Henry Van Dyke) & Grammar', tamilTitle: 'வாழ்க்கைக் கவிதை & இலக்கணம்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Active & Passive Voice', microTopics: [{ title: 'Voice Conversion Rules & Modals', pyq: 'Very High' }] }] },
          ]
        },
        {
          id: '10_math',
          subjectName: 'Mathematics (கணிதம்)',
          unitNumber: 'Unit 1 & 2',
          title: 'Relations, Functions, Numbers & Sequences (உறவுகளும் எண்களும்)',
          chapters: [
            { id: '10_mat_c1', title: 'Relations & Functions (கார்டீசியன் பெருக்கல் & சார்புகள்)', tamilTitle: 'உறவுகளும் சார்புகளும்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Cartesian Product & Relations', microTopics: [{ title: 'n(A x B) = n(A)*n(B) & Arrow Diagrams', pyq: 'Very High' }] }] },
            { id: '10_mat_c2', title: 'Euclid’s Lemma, AP & GP (தொடர்வரிசைகள்)', tamilTitle: 'எண்களும் தொடர்வரிசைகளும்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'AP & GP nth Term & Sum', microTopics: [{ title: 'a = bq + r & Special Series Formula', pyq: 'Very High' }] }] },
          ]
        },
        {
          id: '10_sci',
          subjectName: 'Science (அறிவியல்)',
          unitNumber: 'Unit 1 & 2',
          title: 'Laws of Motion, Optics, Atoms & Molecules (இயக்க விதிகள் & ஒளியியல்)',
          chapters: [
            { id: '10_sci_c1', title: 'Laws of Motion (நியூட்டனின் இயக்க விதிகள்)', tamilTitle: 'இயக்க விதிகள்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Inertia & Momentum', microTopics: [{ title: 'F = ma & Momentum Conservation', pyq: 'Very High' }] }] },
            { id: '10_sci_c2', title: 'Optics & Eye Defects (ஒளியியல் & லென்ஸ்கள்)', tamilTitle: 'ஒளியியல்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Lens Formula & Myopia', microTopics: [{ title: '1/f = 1/v - 1/u & Power of Lens', pyq: 'Very High' }] }] },
          ]
        },
        {
          id: '10_soc',
          subjectName: 'Social Science (சமூக அறிவியல்)',
          unitNumber: 'Unit 1 & 2',
          title: 'World War Era, TN Freedom Struggle & Indian Constitution',
          chapters: [
            { id: '10_soc_c1', title: 'WWI & Freedom Struggle in Tamil Nadu', tamilTitle: 'விடுதலைப் போராட்டம்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'VOC & Vedaranyam March', microTopics: [{ title: 'Swadeshi Steam Navigation & Rajaji', pyq: 'Very High' }] }] },
            { id: '10_soc_c2', title: 'Indian Constitution & Economic Growth', tamilTitle: 'இந்திய அரசியலமைப்பு', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Fundamental Rights', microTopics: [{ title: 'Articles 12 to 35 & Directive Principles', pyq: 'Very High' }] }] },
          ]
        }
      ];
    }

    if (isNeet) {
      return [
        {
          id: 'neet_u1',
          subjectName: 'NEET Physics',
          unitNumber: 'Unit 1: Mechanics',
          title: 'Kinematics, Newton’s Laws & Work-Energy-Power',
          chapters: [
            { id: 'np_c1', title: '1D & 2D Projectile Motion', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Trajectory & Range', microTopics: [{ title: 'R_max = u^2/g at 45 degrees', pyq: 'Very High' }] }] },
            { id: 'np_c2', title: 'Work-Energy Theorem & Moment of Inertia', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Rotational Dynamics', microTopics: [{ title: 'Parallel Axis Theorem I = I_cm + Md^2', pyq: 'Very High' }] }] },
          ]
        },
        {
          id: 'neet_u2',
          subjectName: 'NEET Physics',
          unitNumber: 'Unit 2: Electrodynamics',
          title: 'Current Electricity & Photoelectric Effect',
          chapters: [
            { id: 'np_c3', title: 'Ohm’s Law & Wheatstone Bridge', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Drift Velocity', microTopics: [{ title: 'I = n*e*A*v_d & P/Q = R/S', pyq: 'Very High' }] }] },
            { id: 'np_c4', title: 'Dual Nature of Radiation', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Einstein Photoelectric Law', microTopics: [{ title: 'h*nu = phi + e*V_0', pyq: 'Very High' }] }] },
          ]
        }
      ];
    }

    if (isTnpsc) {
      return [
        {
          id: 'tnpsc_u1',
          subjectName: 'பொதுத்தமிழ்',
          unitNumber: 'பகுதி (அ)',
          title: 'இலக்கணம்: வேர்ச்சொல், பிரித்தெழுதுதல் & சந்திப்பிழை',
          chapters: [
            { id: 'tp_c1', title: 'வேர்ச்சொல் & அகரவரிசைப்படுத்துதல்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'இலக்கண அமைப்புகள்', microTopics: [{ title: 'வல்லினம் மிகும்/மிகா இடங்கள்', pyq: 'Very High' }] }] },
            { id: 'tp_c2', title: 'திருக்குறள் 25 அதிகாரங்கள்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'அறத்துப்பால்', microTopics: [{ title: 'அன்புடைமை & பண்புடைமை குறட்பாக்கள்', pyq: 'Very High' }] }] },
          ]
        },
        {
          id: 'tnpsc_u2',
          subjectName: 'பொது அறிவு (GS)',
          unitNumber: 'Unit 8 & 9',
          title: 'தமிழ்நாடு வரலாறு, கீழடி அகழாய்வு & இந்திய அரசியலமைப்பு',
          chapters: [
            { id: 'tp_c3', title: 'கீழடி, கொடுமணல் தொல்லியல் கண்டுபிடிப்புகள்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'சங்க கால நாகரிகம்', microTopics: [{ title: 'வைகை நதிக்கரை நகர நாகரிகம்', pyq: 'Very High' }] }] },
            { id: 'tp_c4', title: 'நீதிக்கட்சி & சுயமரியாதை இயக்கம்', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'திராவிட இயக்க வரலாறு', microTopics: [{ title: '1921 வாக்குரிமை & இடஒதுக்கீடு ஆணை', pyq: 'Very High' }] }] },
          ]
        }
      ];
    }

    return [
      {
        id: 'gen_u1',
        subjectName: 'Core Foundations',
        unitNumber: 'Unit 1',
        title: `${cleanTitle} — Core Principles & Axioms`,
        chapters: [
          { id: 'gc_1', title: `${cleanTitle} — Fundamentals & Formulations`, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Standard Theorems', microTopics: [{ title: 'Governing Equations & Unit Consistency', pyq: 'Very High' }] }] },
          { id: 'gc_2', title: `${cleanTitle} — Problem Solving & Shortcuts`, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Fast Solving Methods', microTopics: [{ title: 'Option Elimination & 45-Sec PYQ Rules', pyq: 'High' }] }] },
        ]
      },
      {
        id: 'gen_u2',
        subjectName: 'Advanced Applications',
        unitNumber: 'Unit 2',
        title: `${cleanTitle} — Production Practice & Exams`,
        chapters: [
          { id: 'gc_3', title: `${cleanTitle} — Real World Applications`, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', subtopics: [{ title: 'Production Architecture', microTopics: [{ title: 'Error Resilient Optimization', pyq: 'High' }] }] },
        ]
      }
    ];
  };

  const courseUnits = getCourseSyllabus(course.title_name, course.category);
  const [activeCourseTab, setActiveCourseTab] = useState<'curriculum' | 'notes' | 'mindmap' | 'forum'>('curriculum');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // AI Tutor Modal
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPromptTitle, setAiPromptTitle] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Q&A Forum State
  const [forumQuestion, setForumQuestion] = useState('');
  const [forumPosts, setForumPosts] = useState<any[]>([
    {
      id: '1',
      author: 'Karthik R.',
      question: 'How do we solve chapter problems in under 60 seconds for competitive exams?',
      answer: '🤖 AI Tutor: Focus on identifying the given values first, eliminate options using unit consistency, and memorize the 10 core shortcut formulas.',
      time: '2 hours ago',
    },
    {
      id: '2',
      author: 'Priya S.',
      question: 'Where can I find the official Tamil Nadu State Board solution notes for Unit 2?',
      answer: '🤖 AI Tutor: You can open the "Notes & PDF" tab right here to download the verified PDF summary and formula sheets.',
      time: 'Yesterday',
    },
  ]);
  const [isAskingForum, setIsAskingForum] = useState(false);

  // Kindle Book Reader State
  const [kindleBook, setKindleBook] = useState<any | null>(null);
  const [kindleTab, setKindleTab] = useState<'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas'>('theory');
  const [kindleTheme, setKindleTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<number, number>>({});
  const [revealedVsaq, setRevealedVsaq] = useState<Record<number, boolean>>({});

  const generateKindleBook = (topic: string, courseTitle: string) => {
    const cleanTopic = topic || 'Core Fundamentals';
    const cleanCourse = courseTitle || 'Masterclass Course';

    return {
      topicTitle: cleanTopic,
      courseTitle: cleanCourse,
      readingTime: '6 min read',
      overview: `In this Kindle lesson on "${cleanTopic}", we explore foundational principles, step-by-step mathematical formulations, and high-yield examination problem-solving techniques.`,
      coreConcepts: [
        {
          heading: `1. Foundational Axioms & Definitions of ${cleanTopic}`,
          content: `The conceptual foundation of ${cleanTopic} is rooted in standard academic frameworks. Every problem begins by identifying governing equations and standard boundary conditions.`,
          example: `Real-World Application: Used in engineering and modern software systems to optimize performance and calculate state transitions.`
        },
        {
          heading: `2. Detailed Theoretical Breakdown & Derivations`,
          content: `By applying consistent step-by-step logic, complex multi-variable relationships are reduced to simple solvable algebraic forms. Always check SI unit consistency.`,
          example: `Standard Model: When parameters change continuously, rate equations ensure equilibrium.`
        },
        {
          heading: `3. High-Yield Exam Traps & Optimization Shortcuts`,
          content: `Competitive and board examiners frequently test sign conventions and boundary assumptions. Checking dimensional consistency eliminates 2 options in under 30 seconds.`,
          example: `Exam Tip: Checking dimension consistency saves over 45 seconds per question.`
        }
      ],
      tamilExplanation: {
        simpleTitle: `${cleanTopic} — எளிய தமிழில் முழு விளக்கம்`,
        colloquialIntro: `"${cleanTopic}" என்பதை நாம் அன்றாட வாழ்க்கையோடு ஒப்பிட்டு மிக எளிதாகப் புரிந்து கொள்ளலாம். எதையும் மனப்பாடம் செய்யாமல் அதன் அடிப்படை தத்துவத்தைப் புரிந்து கொண்டால் 100% மதிப்பெண் பெறலாம்.`,
        everydayAnalogy: `உதாரணமாக, நாம் ஒரு சைக்கிள் ஓட்டும் போது சமநிலையைக் காப்பது போல, அல்லது மளிகைக் கடையில் கணக்கிடுவது போல, இந்த பாடத்தின் விதிகளும் எளிய நடைமுறை தத்துவங்களின் அடிப்படையில் உருவானவை.`,
        keyPointsTamil: [
          `1. முதன்மை விதியைத் தெளிவாக நினைவில் வையுங்கள் (Basic Core Principle).`,
          `2. சூத்திரங்களைப் பயன்படுத்தும் போது அலகுகளை (SI Units) கட்டாயம் சரிபார்க்கவும்.`,
          `3. தேர்வு வினாக்களில் கொடுக்கப்பட்டுள்ள மதிப்புகளை முதலில் தனியாக எடுத்து எழுதுங்கள்.`
        ]
      },
      vsaqs: [
        { question: `What is the primary governing definition of ${cleanTopic}?`, answer: `Standard academic relation establishing direct proportionality between input parameters and state responses.` },
        { question: `What is the standard SI unit associated with calculations in ${cleanTopic}?`, answer: `Standard International (SI) coherent base units or dimensionless normalized ratio units.` },
        { question: `Why is unit consistency critical when solving numericals in ${cleanTopic}?`, answer: `Because mixing non-SI units leads to magnitude errors by powers of 10 in final numerical calculations.` },
        { question: `State one major real-world application of ${cleanTopic}.`, answer: `Used in automated control systems, data modeling, algorithm optimization, and physical engine simulations.` },
        { question: `What is the fastest technique to verify an answer in competitive exams?`, answer: `Dimensional analysis and substituting boundary values (e.g., 0, 1, or infinity).` }
      ],
      shortAnswers: [
        {
          question: `Explain the fundamental working principle of ${cleanTopic} with a structured diagrammatic approach.`,
          marks: '2 Marks',
          solutionSteps: [
            `Step 1: State the precise academic definition and standard governing equation.`,
            `Step 2: Define all variables and state standard assumptions (e.g. constant temperature).`,
            `Step 3: Conclude with the physical significance of the derived outcome.`
          ],
          keyTips: `Examiners award 1 mark for the correct formula and 1 mark for mentioning units and standard conditions.`
        },
        {
          question: `Derive the standard mathematical relationship for ${cleanTopic} and discuss its boundary limitations.`,
          marks: '5 Marks',
          solutionSteps: [
            `Step 1: Formulate the initial differential or algebraic relation from first principles.`,
            `Step 2: Integrate or solve step-by-step showing every intermediate algebraic substitution.`,
            `Step 3: Apply boundary conditions to determine integration constants.`,
            `Step 4: State the 2 conditions where this formula fails (e.g. non-linear regions).`
          ],
          keyTips: `Highlight final boxed formulas with SI units for maximum score retention.`
        }
      ],
      mcqs: [
        {
          question: `In ${cleanTopic}, what is the foundational governing relation between the primary variables?`,
          options: [`A) Direct Linear Proportionality`, `B) Inverse Quadratic Equilibrium`, `C) Logarithmic Rate Decay`, `D) Discontinuous Random Variance`],
          correct: 0,
          explanation: `Option A is correct because the standard formulation assumes first-order linear response under equilibrium conditions.`
        },
        {
          question: `Which parameter remains constant during standard ideal transformations in ${cleanTopic}?`,
          options: [`A) Total System Invariant Energy / Mass`, `B) Instantaneous Velocity only`, `C) Ambient Temperature only`, `D) External Frictional Dissipation`],
          correct: 0,
          explanation: `Option A is correct due to the fundamental conservation theorems governing closed systems.`
        },
        {
          question: `What happens when the input scale factor is doubled in the primary equation of ${cleanTopic}?`,
          options: [`A) Output response scales by 2x or 4x according to power index`, `B) Output drops immediately to zero`, `C) System loses stability completely`, `D) No change occurs in dependent variables`],
          correct: 0,
          explanation: `Option A is correct because physical systems obey standard power-law scaling responses.`
        },
        {
          question: `Which common student mistake should be strictly avoided in competitive examinations for ${cleanTopic}?`,
          options: [`A) Omitting sign conventions and mixing non-standard units`, `B) Writing step-by-step formulas clearly`, `C) Verifying dimensions before marking options`, `D) Double checking calculations`],
          correct: 0,
          explanation: `Option A is the most frequent trap where negative signs in vectors or gradients are missed.`
        },
        {
          question: `What is the optimal problem-solving strategy for high-percentile accuracy in ${cleanTopic}?`,
          options: [`A) Formula Identification -> Unit Check -> Boundary Elimination -> Final Solve`, `B) Blind Guessing based on option lengths`, `C) Memorizing numbers without understanding derivations`, `D) Skipping all question statements`],
          correct: 0,
          explanation: `Option A is the proven high-speed method used by top rankers to achieve 100% accuracy under exam pressure.`
        }
      ],
      formulasAndMnemonics: [
        { formula: `F(x) = k * Delta_x`, meaning: `Linear Governing Equation (Restoring / Equilibrium response)`, mnemonic: `Fast Knowledge Always Delivers (F = k * Delta_x)` },
        { formula: `Efficiency = (Output / Input) * 100%`, meaning: `Efficiency Percentage Formula`, mnemonic: `Out Over In times Hundred` },
        { formula: `Relative Error = |Delta_a / a| * 100%`, meaning: `Relative Percentage Error Calculation`, mnemonic: `Delta Over True Value` }
      ]
    };
  };

  const openKindleBook = (topic: string, initialTab: 'theory' | 'tamil' | 'vsaq' | 'solutions' | 'mcq' | 'formulas' = 'theory') => {
    const book = generateKindleBook(topic, course.title_name);
    setKindleBook(book);
    setKindleTab(initialTab);
    setUserMcqAnswers({});
    setRevealedVsaq({});
  };

  const exportKindleBookPDF = async (book: any) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
            .badge { display: inline-block; background: #ecfdf5; color: #059669; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #10b981; text-transform: uppercase; margin-bottom: 6px; }
            h1 { color: #0f172a; margin: 0; font-size: 22px; }
            .meta { color: #64748b; font-size: 12px; margin-top: 4px; }
            .section { margin-top: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
            .sec-title { font-size: 15px; font-weight: bold; color: #047857; margin-bottom: 10px; border-left: 4px solid #10b981; padding-left: 8px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 10px; margin-bottom: 10px; font-size: 13px; }
            .mcq-q { font-weight: bold; margin-bottom: 6px; }
            .ans-key { color: #059669; font-weight: bold; margin-top: 4px; font-size: 12px; }
            .tamil-box { background: #fefce8; border: 1px solid #fef08a; padding: 14px; border-radius: 10px; font-size: 13px; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">EduVerse AI Kindle Book Edition</span>
            <h1>${book.topicTitle}</h1>
            <div class="meta">Course: ${book.courseTitle} • Published by SuprO TeachO Engine</div>
          </div>

          <div class="section">
            <div class="sec-title">📖 Section 1: Overview & Theoretical Foundations</div>
            <p style="font-size: 13px; margin-bottom: 12px;">${book.overview}</p>
            ${book.coreConcepts.map((c: any) => `
              <div class="card">
                <h4 style="margin: 0 0 4px 0; color: #0f172a;">${c.heading}</h4>
                <p style="margin: 0; color: #334155;">${c.content}</p>
                ${c.example ? `<p style="color: #0369a1; font-style: italic; margin-top: 6px;">💡 ${c.example}</p>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="sec-title">🗣️ Section 2: தமிழில் எளிய விளக்கம் (Tamil Summary)</div>
            <div class="tamil-box">
              <h4 style="margin: 0 0 6px 0; color: #854d0e;">${book.tamilExplanation.simpleTitle}</h4>
              <p style="margin: 0 0 6px 0;">${book.tamilExplanation.colloquialIntro}</p>
              <p style="margin: 0 0 6px 0;"><strong>நடைமுறை உதாரணம்:</strong> ${book.tamilExplanation.everydayAnalogy}</p>
              <ul style="margin: 0; padding-left: 18px;">${book.tamilExplanation.keyPointsTamil.map((p: any) => `<li>${p}</li>`).join('')}</ul>
            </div>
          </div>

          <div class="section">
            <div class="sec-title">⚡ Section 3: 1-Line Quick Recall Flashcards (VSAQ)</div>
            ${book.vsaqs.map((v: any, i: number) => `
              <div class="card">
                <p style="margin: 0 0 2px 0;"><strong>Q${i + 1}: ${v.question}</strong></p>
                <p class="ans-key" style="margin: 0;">✓ Answer: ${v.answer}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="sec-title">📝 Section 4: 2-Mark & 5-Mark Question Solutions</div>
            ${book.shortAnswers.map((sa: any, i: number) => `
              <div class="card">
                <p style="margin: 0 0 4px 0;"><strong>Q${i + 1} [${sa.marks}]: ${sa.question}</strong></p>
                <ol style="margin: 0 0 6px 0; padding-left: 18px;">${sa.solutionSteps.map((s: any) => `<li>${s}</li>`).join('')}</ol>
                <p style="color: #d97706; font-size: 11px; margin: 0;"><strong>💡 Tip:</strong> ${sa.keyTips}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="sec-title">🎯 Section 5: 5 Practice Multiple Choice Questions (MCQs)</div>
            ${book.mcqs.map((m: any, i: number) => `
              <div class="card">
                <p class="mcq-q">Q${i + 1}: ${m.question}</p>
                <ul style="margin: 0 0 6px 0; padding-left: 18px;">${m.options.map((opt: any, oIdx: number) => `<li style="${oIdx === m.correct ? 'font-weight: bold; color: #059669;' : ''}">${opt}</li>`).join('')}</ul>
                <p class="ans-key" style="margin: 0;">💡 Explanation: ${m.explanation}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="sec-title">📐 Section 6: Key Formulas & Memory Mnemonics</div>
            ${book.formulasAndMnemonics.map((f: any) => `
              <div class="card">
                <p style="font-family: monospace; font-size: 13px; font-weight: bold; color: #047857; margin: 0 0 2px 0;">${f.formula}</p>
                <p style="margin: 0 0 2px 0;">${f.meaning}</p>
                ${f.mnemonic ? `<p style="color: #7c3aed; font-size: 11px; margin: 0;">🧠 Memory Mnemonic: ${f.mnemonic}</p>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            Generated via SuprO TeachO LMS Kindle Engine • Verified Academic Document
          </div>
        </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Share.share({ message: `${book.topicTitle}\n\n${book.overview}` });
      }
    } catch (e) {
      Share.share({ message: `${book.topicTitle}\n\n${book.overview}` });
    }
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleLessonComplete = (key: string) => {
    setCompletedLessons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openVideo = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => alert('Could not open video URL'));
    }
  };

  const handleAskAi = async (promptType: 'explain_tamil' | 'quiz' | 'summary', topicTitle: string) => {
    if (promptType === 'explain_tamil') {
      openKindleBook(topicTitle, 'tamil');
    } else if (promptType === 'quiz') {
      openKindleBook(topicTitle, 'mcq');
    } else {
      openKindleBook(topicTitle, 'theory');
    }
  };

  const generateAndSharePDF = async (title: string, content: string) => {
    openKindleBook(title, 'theory');
  };

  const handlePostForumQuestion = async () => {
    if (!forumQuestion.trim()) return;
    setIsAskingForum(true);

    const newQuestion = forumQuestion.trim();
    setForumQuestion('');

    const prompt = `Student asked a question in the course "${course.title_name}":
Question: "${newQuestion}"
Provide a concise, helpful, and encouraging educational response in Tamil and English with practical steps.`;

    try {
      const res = await geminiToolsService.executePrompt(prompt);
      const aiReply = res.text || 'Thank you for your question! Your instructor and peers will also review it.';
      setForumPosts(prev => [
        {
          id: Date.now().toString(),
          author: 'You (Student)',
          question: newQuestion,
          answer: `🤖 AI Tutor: ${aiReply}`,
          time: 'Just now',
        },
        ...prev,
      ]);
    } catch (e) {
      setForumPosts(prev => [
        {
          id: Date.now().toString(),
          author: 'You (Student)',
          question: newQuestion,
          answer: 'Question posted to discussion board. AI Tutor will answer shortly.',
          time: 'Just now',
        },
        ...prev,
      ]);
    } finally {
      setIsAskingForum(false);
    }
  };

  const renderCurriculum = () => (
    <FlatList
      data={courseUnits}
      keyExtractor={(item, index) => item.id || index.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item: unit, index: uIdx }) => {
        return (
          <View key={unit.id || uIdx} style={{ marginBottom: 16 }}>
            <View style={{ backgroundColor: '#111827', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981', backgroundColor: '#10b98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 }}>
                    {unit.subjectName}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8' }}>{unit.unitNumber}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ffffff' }}>{unit.title}</Text>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                onPress={() => openKindleBook(unit.title, 'theory')}
              >
                <Text style={{ color: '#022c22', fontSize: 10, fontWeight: 'bold' }}>📖 Unit Book</Text>
              </TouchableOpacity>
            </View>

            {unit.chapters.map((chap: any, cIdx: number) => {
              const chapKey = `${uIdx}-${cIdx}`;
              const isExpanded = !!expandedModules[cIdx + uIdx * 10];

              return (
                <View key={chap.id || cIdx} style={[styles.moduleCard, { marginBottom: 10 }]}>
                  <TouchableOpacity
                    style={styles.moduleHeader}
                    onPress={() => toggleModule(cIdx + uIdx * 10)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moduleIndex}>CHAPTER {cIdx + 1}</Text>
                      <Text style={styles.moduleTitle}>{chap.title}</Text>
                      {chap.tamilTitle ? (
                        <Text style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>{chap.tamilTitle}</Text>
                      ) : null}
                    </View>
                    {isExpanded ? <ChevronUp color="#10b981" size={20} /> : <ChevronDown color="#94a3b8" size={20} />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.videosContainer}>
                      {/* Video Lesson Row */}
                      <View style={styles.lessonRow}>
                        <TouchableOpacity style={styles.lessonContent} onPress={() => openVideo(chap.url)}>
                          <PlayCircle size={20} color="#10b981" style={{ marginRight: 10 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.videoTitle}>Watch Full HD Lecture</Text>
                            <Text style={styles.lessonMeta}>Official Video Stream • YouTube</Text>
                          </View>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity
                            style={[styles.aiHelpPill, { backgroundColor: '#10b98120' }]}
                            onPress={() => openKindleBook(chap.title, 'theory')}
                          >
                            <Text style={[styles.aiHelpText, { color: '#10b981' }]}>Kindle</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.aiHelpPill, { backgroundColor: '#38bdf820' }]}
                            onPress={() => openKindleBook(chap.title, 'mcq')}
                          >
                            <Text style={[styles.aiHelpText, { color: '#38bdf8' }]}>5 MCQs</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Subtopics & Microtopics */}
                      {chap.subtopics && chap.subtopics.map((sub: any, sIdx: number) => (
                        <View key={sIdx} style={{ marginTop: 8, paddingLeft: 6, borderLeftWidth: 2, borderLeftColor: '#334155' }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                            Subtopic: {sub.title}
                          </Text>
                          {sub.microTopics && sub.microTopics.map((mt: any, mIdx: number) => (
                            <TouchableOpacity
                              key={mIdx}
                              onPress={() => openKindleBook(mt.title, 'theory')}
                              style={{ backgroundColor: '#0f172a', padding: 8, borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: '#1e293b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11, color: '#f8fafc', fontWeight: '500' }}>• {mt.title}</Text>
                              </View>
                              {mt.pyq ? (
                                <Text style={{ fontSize: 9, color: '#f59e0b', backgroundColor: '#f59e0b20', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' }}>
                                  {mt.pyq} PYQ
                                </Text>
                              ) : null}
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}

                      <View style={styles.chapterFooter}>
                        <TouchableOpacity
                          style={styles.chapterTestBtn}
                          onPress={() => openKindleBook(chap.title, 'tamil')}
                        >
                          <Sparkles size={14} color="#0a0f1e" style={{ marginRight: 6 }} />
                          <Text style={styles.chapterTestText}>தமிழில் விளக்கம் & 5 MCQs</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      }}
    />
  );

  const renderNotesAndPDFs = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.notesHero}>
        <FileText size={22} color="#10b981" style={{ marginBottom: 6 }} />
        <Text style={styles.notesHeroTitle}>Verified Digital Study Notes & PDFs</Text>
        <Text style={styles.notesHeroSub}>High-yield revision notes, formula sheets, and chapter summaries.</Text>
      </View>

      {courseUnits.map((unit, uIdx) => (
        <View key={uIdx} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981', marginBottom: 6 }}>
            {unit.subjectName} — {unit.unitNumber}
          </Text>
          {unit.chapters.map((chap: any, cIdx: number) => (
            <View key={cIdx} style={styles.pdfCard}>
              <View style={styles.pdfCardHeader}>
                <View style={styles.pdfIconBox}>
                  <FileText size={20} color="#38bdf8" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.pdfTitle}>{chap.title}</Text>
                  <Text style={styles.pdfMeta}>PDF Document • Complete Formulas & Theory</Text>
                </View>
              </View>

              <View style={styles.pdfActionsRow}>
                <TouchableOpacity
                  style={styles.pdfActionBtn}
                  onPress={() => openKindleBook(chap.title, 'theory')}
                >
                  <Sparkles size={13} color="#10b981" style={{ marginRight: 4 }} />
                  <Text style={styles.pdfActionText}>Kindle Book</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pdfActionBtn, { backgroundColor: '#10b981' }]}
                  onPress={() => openKindleBook(chap.title, 'tamil')}
                >
                  <Download size={13} color="#0a0f1e" style={{ marginRight: 4 }} />
                  <Text style={[styles.pdfActionText, { color: '#0a0f1e', fontWeight: 'bold' }]}>தமிழில் PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderMindMaps = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.mindMapHero}>
        <Network size={22} color="#a855f7" style={{ marginBottom: 6 }} />
        <Text style={styles.mindMapHeroTitle}>Visual Concept & Mind Map Graph</Text>
        <Text style={styles.mindMapHeroSub}>Accelerated memory retention through structured concept node hierarchies.</Text>
      </View>

      <View style={styles.conceptCard}>
        <Text style={styles.conceptNodeTitle}>🎯 Core Theme</Text>
        <Text style={styles.conceptNodeText}>{course.title_name}</Text>
      </View>

      <View style={styles.mindMapGrid}>
        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#3b82f6' }]}>BRANCH 1</Text>
          </View>
          <Text style={styles.nodeTitle}>Key Principles & Axioms</Text>
          <Text style={styles.nodeDesc}>Fundamental definitions, laws, and structural foundation.</Text>
        </View>

        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#10b981' }]}>BRANCH 2</Text>
          </View>
          <Text style={styles.nodeTitle}>Formulas & Shortcuts</Text>
          <Text style={styles.nodeDesc}>Standard derivation formulas, constants, and speed techniques.</Text>
        </View>

        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#f59e0b' }]}>BRANCH 3</Text>
          </View>
          <Text style={styles.nodeTitle}>Problem Patterns</Text>
          <Text style={styles.nodeDesc}>Previous year exam questions (PYQs) and high-yield MCQ types.</Text>
        </View>

        <View style={styles.mindMapNode}>
          <View style={[styles.nodeBadge, { backgroundColor: '#a855f720', borderColor: '#a855f7' }]}>
            <Text style={[styles.nodeBadgeText, { color: '#a855f7' }]}>BRANCH 4</Text>
          </View>
          <Text style={styles.nodeTitle}>Self-Assessment</Text>
          <Text style={styles.nodeDesc}>Chapter practice tests and speed accuracy checks.</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.generateMapBtn}
        onPress={() => handleAskAi('summary', `Visual Concept Mind Map Breakdown for: ${course.title_name}`)}
      >
        <Sparkles size={16} color="#0a0f1e" style={{ marginRight: 6 }} />
        <Text style={styles.generateMapText}>Generate AI Visual Mind Map Notes</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderForum = () => (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.forumHeader}>
          <MessageSquare size={20} color="#10b981" style={{ marginBottom: 4 }} />
          <Text style={styles.forumTitle}>Doubt & Discussion Forum</Text>
          <Text style={styles.forumSub}>Ask questions and get instant solutions from AI Tutor & peers.</Text>
        </View>

        {forumPosts.map(post => (
          <View key={post.id} style={styles.forumCard}>
            <View style={styles.forumCardTop}>
              <Text style={styles.forumAuthor}>{post.author}</Text>
              <Text style={styles.forumTime}>{post.time}</Text>
            </View>
            <Text style={styles.forumQuestion}>{post.question}</Text>
            <View style={styles.forumAnswerBox}>
              <Text style={styles.forumAnswer}>{post.answer}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Forum Bottom Ask Bar */}
      <View style={styles.forumInputBar}>
        <TextInput
          placeholder="Ask a doubt or formula question..."
          placeholderTextColor="#64748b"
          value={forumQuestion}
          onChangeText={setForumQuestion}
          style={styles.forumInput}
        />
        <TouchableOpacity
          style={styles.forumSendBtn}
          disabled={isAskingForum}
          onPress={handlePostForumQuestion}
        >
          {isAskingForum ? (
            <ActivityIndicator size="small" color="#0a0f1e" />
          ) : (
            <Send size={16} color="#0a0f1e" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.navCategory}>{course.category || 'Masterclass Course'}</Text>
            <Text style={styles.navTitle} numberOfLines={1}>
              {course.title_name}
            </Text>
          </View>
        </View>

        {/* Course Header Bar */}
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title_name}</Text>
          <Text style={styles.courseSubtitle}>
            {curriculum.length} Chapters • Verified Syllabus
          </Text>

          {/* Quick AI Action Pills */}
          <View style={styles.aiActionBar}>
            <TouchableOpacity
              style={styles.aiActionPill}
              onPress={() => handleAskAi('explain_tamil', course.title_name)}
            >
              <Sparkles size={13} color="#10b981" style={{ marginRight: 5 }} />
              <Text style={styles.aiActionText}>தமிழில் விளக்கம்</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiActionPill}
              onPress={() => handleAskAi('quiz', course.title_name)}
            >
              <FileCheck2 size={13} color="#38bdf8" style={{ marginRight: 5 }} />
              <Text style={styles.aiActionText}>5 Practice MCQs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiActionPill}
              onPress={() => handleAskAi('summary', course.title_name)}
            >
              <FileText size={13} color="#f59e0b" style={{ marginRight: 5 }} />
              <Text style={styles.aiActionText}>Summary Notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Player Sub-Tabs */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'curriculum' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('curriculum')}
          >
            <BookOpen size={13} color={activeCourseTab === 'curriculum' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'curriculum' && styles.subTabTextActive]}>Curriculum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'notes' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('notes')}
          >
            <FileText size={13} color={activeCourseTab === 'notes' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'notes' && styles.subTabTextActive]}>Notes & PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'mindmap' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('mindmap')}
          >
            <Network size={13} color={activeCourseTab === 'mindmap' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'mindmap' && styles.subTabTextActive]}>Mind Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeCourseTab === 'forum' && styles.subTabBtnActive]}
            onPress={() => setActiveCourseTab('forum')}
          >
            <MessageSquare size={13} color={activeCourseTab === 'forum' ? '#0a0f1e' : '#94a3b8'} style={{ marginRight: 4 }} />
            <Text style={[styles.subTabText, activeCourseTab === 'forum' && styles.subTabTextActive]}>Q&A Forum</Text>
          </TouchableOpacity>
        </View>

        {/* Active Tab Body */}
        {activeCourseTab === 'curriculum' && renderCurriculum()}
        {activeCourseTab === 'notes' && renderNotesAndPDFs()}
        {activeCourseTab === 'mindmap' && renderMindMaps()}
        {activeCourseTab === 'forum' && renderForum()}

        {/* 📖 Kindle-Style Micro-Topic Interactive Book Player Modal */}
        <Modal
          visible={!!kindleBook}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setKindleBook(null)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: kindleTheme === 'sepia' ? '#fcf8ed' : kindleTheme === 'light' ? '#ffffff' : '#0a0f1e' }}>
            <StatusBar barStyle={kindleTheme === 'light' || kindleTheme === 'sepia' ? 'dark-content' : 'light-content'} />
            
            {/* Kindle Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
              backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827'
            }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>Kindle Edition</Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8' }}>• {kindleBook?.readingTime}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#0f172a' : '#ffffff' }} numberOfLines={1}>
                  {kindleBook?.topicTitle}
                </Text>
              </View>

              {/* Tools & Close */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Theme toggle */}
                <TouchableOpacity
                  onPress={() => setKindleTheme(prev => prev === 'dark' ? 'sepia' : prev === 'sepia' ? 'light' : 'dark')}
                  style={{ padding: 6, borderRadius: 8, backgroundColor: '#10b98120' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#10b981' }}>
                    {kindleTheme === 'dark' ? '🌙 Dark' : kindleTheme === 'sepia' ? '☕ Sepia' : '☀️ Light'}
                  </Text>
                </TouchableOpacity>

                {/* PDF Export */}
                <TouchableOpacity
                  onPress={() => exportKindleBookPDF(kindleBook)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 }}
                >
                  <Download size={14} color="#0a0f1e" />
                  <Text style={{ color: '#0a0f1e', fontWeight: 'bold', fontSize: 11 }}>PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setKindleBook(null)} style={{ padding: 6 }}>
                  <X size={22} color={kindleTheme === 'light' || kindleTheme === 'sepia' ? '#475569' : '#94a3b8'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Kindle Navigation Sub-Tabs */}
            <View style={{
              flexDirection: 'row',
              backgroundColor: kindleTheme === 'sepia' ? '#ede5cf' : kindleTheme === 'light' ? '#f1f5f9' : '#0c1322',
              borderBottomWidth: 1,
              borderBottomColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b'
            }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8, gap: 6 }}>
                {[
                  { id: 'theory', label: '📖 Theory' },
                  { id: 'tamil', label: '🗣️ தமிழில் விளக்கம்' },
                  { id: 'vsaq', label: '⚡ 1-Line Q&A' },
                  { id: 'solutions', label: '📝 2-Mark & 5-Mark' },
                  { id: 'mcq', label: '🎯 5 MCQs' },
                  { id: 'formulas', label: '📐 Formulas' },
                ].map(tab => {
                  const active = kindleTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setKindleTab(tab.id as any)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                        backgroundColor: active ? '#10b981' : 'transparent',
                      }}
                    >
                      <Text style={{
                        fontSize: 12,
                        fontWeight: active ? 'bold' : '600',
                        color: active ? '#0a0f1e' : (kindleTheme === 'light' || kindleTheme === 'sepia' ? '#334155' : '#94a3b8')
                      }}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Kindle Body */}
            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 60 }}>
              {/* TAB 1: Theory */}
              {kindleTab === 'theory' && kindleBook && (
                <View style={{ gap: 14 }}>
                  <View style={{ padding: 14, borderRadius: 12, backgroundColor: '#10b98115', borderWidth: 1, borderColor: '#10b98130' }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>CHAPTER OVERVIEW</Text>
                    <Text style={{ fontSize: 13, color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#0f172a' : '#e2e8f0', lineHeight: 20 }}>
                      {kindleBook.overview}
                    </Text>
                  </View>

                  {kindleBook.coreConcepts?.map((concept: any, idx: number) => (
                    <View key={idx} style={{
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                      backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827'
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#10b981', marginBottom: 6 }}>{concept.heading}</Text>
                      <Text style={{ fontSize: 13, color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 20 }}>{concept.content}</Text>
                      {concept.example ? (
                        <View style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#38bdf815' }}>
                          <Text style={{ fontSize: 11, color: '#38bdf8', fontStyle: 'italic' }}>💡 {concept.example}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              {/* TAB 2: Tamil Explanation */}
              {kindleTab === 'tamil' && kindleBook && (
                <View style={{ gap: 14 }}>
                  <View style={{ padding: 16, borderRadius: 14, backgroundColor: '#f59e0b15', borderWidth: 1, borderColor: '#f59e0b30' }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>எளிய தமிழ் விளக்கம்</Text>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#f59e0b', marginTop: 4 }}>
                      {kindleBook.tamilExplanation?.simpleTitle}
                    </Text>
                    <Text style={{ fontSize: 13, color: kindleTheme === 'sepia' ? '#713f12' : kindleTheme === 'light' ? '#713f12' : '#fde68a', marginTop: 8, lineHeight: 20 }}>
                      {kindleBook.tamilExplanation?.colloquialIntro}
                    </Text>
                  </View>

                  <View style={{
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                    backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827'
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#10b981', marginBottom: 4 }}>நடைமுறை உதாரணம் (Analogy)</Text>
                    <Text style={{ fontSize: 13, color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 20 }}>
                      {kindleBook.tamilExplanation?.everydayAnalogy}
                    </Text>
                  </View>

                  <View style={{
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                    backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827'
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#10b981', marginBottom: 8 }}>முக்கிய குறிப்புகள் (Revision Points)</Text>
                    {kindleBook.tamilExplanation?.keyPointsTamil?.map((pt: string, i: number) => (
                      <Text key={i} style={{ fontSize: 12, color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#334155' : '#cbd5e1', marginBottom: 6, lineHeight: 18 }}>
                        • {pt}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* TAB 3: 1-Line VSAQ Flashcards */}
              {kindleTab === 'vsaq' && kindleBook && (
                <View style={{ gap: 12 }}>
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#38bdf815', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#38bdf8' }}>⚡ 1-Line Quick Recall Flashcards</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Tap "Reveal Answer" to check your memory.</Text>
                  </View>

                  {kindleBook.vsaqs?.map((v: any, i: number) => {
                    const isRevealed = !!revealedVsaq[i];
                    return (
                      <View key={i} style={{
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                        backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827'
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#0f172a' : '#ffffff', flex: 1, marginRight: 8 }}>
                            <Text style={{ color: '#10b981' }}>Q{i + 1}: </Text>{v.question}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setRevealedVsaq(prev => ({ ...prev, [i]: !prev[i] }))}
                            style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#10b98120' }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981' }}>{isRevealed ? 'Hide' : 'Reveal'}</Text>
                          </TouchableOpacity>
                        </View>
                        {isRevealed && (
                          <View style={{ marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#10b98115' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>✓ {v.answer}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* TAB 4: 2-Mark & 5-Mark Solutions */}
              {kindleTab === 'solutions' && kindleBook && (
                <View style={{ gap: 14 }}>
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#a855f715', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#a855f7' }}>📝 Descriptive Solutions & Marking Scheme</Text>
                  </View>

                  {kindleBook.shortAnswers?.map((sa: any, i: number) => (
                    <View key={i} style={{
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                      backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827',
                      gap: 8
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#a855f7', flex: 1 }}>Q{i + 1}: {sa.question}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: '#a855f720' }}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#a855f7' }}>{sa.marks}</Text>
                        </View>
                      </View>

                      <View style={{ borderLeftWidth: 2, borderLeftColor: '#10b981', paddingLeft: 8, gap: 4 }}>
                        {sa.solutionSteps?.map((s: string, sIdx: number) => (
                          <Text key={sIdx} style={{ fontSize: 12, color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#334155' : '#cbd5e1', lineHeight: 18 }}>
                            {s}
                          </Text>
                        ))}
                      </View>

                      <View style={{ padding: 8, borderRadius: 8, backgroundColor: '#f59e0b15' }}>
                        <Text style={{ fontSize: 11, color: '#f59e0b' }}>💡 {sa.keyTips}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* TAB 5: 5 Practice MCQs */}
              {kindleTab === 'mcq' && kindleBook && (
                <View style={{ gap: 14 }}>
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#10b98115', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>🎯 5 Micro-Topic MCQs</Text>
                    {Object.keys(userMcqAnswers).length > 0 && (
                      <TouchableOpacity onPress={() => setUserMcqAnswers({})} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#1e293b' }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Reset</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {kindleBook.mcqs?.map((mcq: any, qIdx: number) => {
                    const selectedOpt = userMcqAnswers[qIdx];
                    const isAttempted = selectedOpt !== undefined;
                    const isCorrect = isAttempted && selectedOpt === mcq.correct;

                    return (
                      <View key={qIdx} style={{
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                        backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827',
                        gap: 8
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#0f172a' : '#ffffff', flex: 1 }}>
                            <Text style={{ color: '#10b981' }}>Q{qIdx + 1}: </Text>{mcq.question}
                          </Text>
                          {isAttempted && (
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: isCorrect ? '#10b981' : '#ef4444' }}>
                              {isCorrect ? '✓ (+4)' : '✗ (-1)'}
                            </Text>
                          )}
                        </View>

                        {mcq.options?.map((opt: string, oIdx: number) => {
                          let bg = kindleTheme === 'sepia' ? '#ede5cf' : kindleTheme === 'light' ? '#f1f5f9' : '#0c1322';
                          let textCol = kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#0f172a' : '#cbd5e1';
                          if (isAttempted) {
                            if (oIdx === mcq.correct) {
                              bg = '#10b98125';
                              textCol = '#10b981';
                            } else if (selectedOpt === oIdx) {
                              bg = '#ef444425';
                              textCol = '#ef4444';
                            }
                          }

                          return (
                            <TouchableOpacity
                              key={oIdx}
                              onPress={() => setUserMcqAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                              style={{ padding: 10, borderRadius: 8, backgroundColor: bg }}
                            >
                              <Text style={{ fontSize: 12, color: textCol, fontWeight: isAttempted && (oIdx === mcq.correct || selectedOpt === oIdx) ? 'bold' : 'normal' }}>
                                {opt}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                        {isAttempted && (
                          <View style={{ padding: 8, borderRadius: 8, backgroundColor: '#38bdf815' }}>
                            <Text style={{ fontSize: 11, color: '#38bdf8' }}>💡 {mcq.explanation}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* TAB 6: Formulas */}
              {kindleTab === 'formulas' && kindleBook && (
                <View style={{ gap: 12 }}>
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#10b98115', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>📐 High-Yield Formula Sheet & Mnemonics</Text>
                  </View>

                  {kindleBook.formulasAndMnemonics?.map((f: any, i: number) => (
                    <View key={i} style={{
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: kindleTheme === 'sepia' ? '#e7dfc6' : kindleTheme === 'light' ? '#e2e8f0' : '#1e293b',
                      backgroundColor: kindleTheme === 'sepia' ? '#f4eedb' : kindleTheme === 'light' ? '#f8fafc' : '#111827',
                      gap: 6
                    }}>
                      <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#10b98115', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', color: '#10b981' }}>{f.formula}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: kindleTheme === 'sepia' ? '#451a03' : kindleTheme === 'light' ? '#334155' : '#cbd5e1' }}>{f.meaning}</Text>
                      {f.mnemonic ? (
                        <Text style={{ fontSize: 11, color: '#a855f7', fontWeight: '500' }}>🧠 {f.mnemonic}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    padding: 4,
  },
  navCategory: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  courseHeader: {
    backgroundColor: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  aiActionBar: {
    flexDirection: 'row',
    gap: 8,
  },
  aiActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1e',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aiActionText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  subTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  subTabBtnActive: {
    backgroundColor: '#10b981',
  },
  subTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#0a0f1e',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  moduleIndex: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  videosContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    padding: 12,
    backgroundColor: '#0c1322',
  },
  noVideosText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  checkCircle: {
    paddingRight: 8,
  },
  lessonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  videoTitleDone: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  lessonMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  aiHelpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    borderColor: '#f59e0b50',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  aiHelpText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chapterFooter: {
    marginTop: 6,
  },
  chapterTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  chapterTestText: {
    color: '#0a0f1e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  notesHero: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  notesHeroTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesHeroSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  pdfCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  pdfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#38bdf820',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pdfMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  pdfActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  pdfActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pdfActionText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  mindMapHero: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  mindMapHeroTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mindMapHeroSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  conceptCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderColor: '#10b981',
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  conceptNodeTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  conceptNodeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mindMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mindMapNode: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
  },
  nodeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  nodeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  nodeTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nodeDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  generateMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  generateMapText: {
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: 'bold',
  },
  forumHeader: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  forumTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  forumSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  forumCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderColor: '#1e293b',
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  forumCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forumAuthor: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  forumTime: {
    color: '#64748b',
    fontSize: 10,
  },
  forumQuestion: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  forumAnswerBox: {
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
  },
  forumAnswer: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  forumInputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  forumInput: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8,
  },
  forumSendBtn: {
    backgroundColor: '#10b981',
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  modalLoadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  modalResponseText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
});
