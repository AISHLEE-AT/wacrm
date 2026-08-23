import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'dart:async';
import '../../teacho/screens/teacho_player_sheet.dart';

class TestoScreen extends StatefulWidget {
  const TestoScreen({super.key});

  @override
  State<TestoScreen> createState() => _TestoScreenState();
}

class _TestoScreenState extends State<TestoScreen> {
  // 'hub' | 'exam' | 'result'
  String viewMode = 'hub';

  // Hub
  List<Map<String, dynamic>> sections = [];
  bool isLoading = true;
  String searchQuery = '';
  bool isSyllabusMode = false;
  int selectedCourseIndex = 0;

  final List<Map<String, dynamic>> syllabusCourses = [
    {
      'id': 'class_6_8_middle',
      'title': 'Class 6–8 (Middle School Nano-Curriculum)',
      'sub': 'Days 1–57: Maths, Science & Tamil Nano-Units with 1-Tap CBT',
      'units': [
        {
          'subject': 'Mathematics (கணிதம் — Days 1–18)',
          'title': 'Unit 1: BODMAS, HCF/LCM, Statistics & Geometry Nano-Topics',
          'topics': [
            {'title': 'Day 1: BODMAS Brackets Hierarchy (), {}, []', 'law': 'Innermost () -> {} -> Outer []'},
            {'title': 'Day 2: BODMAS Division & Multiplication Precedence', 'law': 'Equal Priority: Evaluate Left-to-Right'},
            {'title': 'Day 3: BODMAS Addition & Subtraction Precedence', 'law': 'Equal Priority: Evaluate Left-to-Right'},
            {'title': 'Day 4: HCF Prime Factorization Tree Method', 'law': 'Product of lowest powers of common prime factors'},
            {'title': 'Day 5: HCF Euclid Division / Long Division', 'law': 'a = bq + r until remainder r = 0'},
            {'title': 'Day 6: LCM Common Division Method', 'law': 'Product of all divisors & undivided remainders'},
            {'title': 'Day 7: HCF × LCM = a × b Core Identity', 'law': 'Number₁ × Number₂ = HCF(a,b) × LCM(a,b)'},
            {'title': 'Day 8: HCF & LCM Word Problems (Bells & Tiles)', 'law': 'HCF for tile size; LCM for bell intervals'},
            {'title': 'Day 9: Arithmetic Mean: Raw Data Average', 'law': 'Mean x̄ = (Σ x) / N'},
            {'title': 'Day 10: Median: Middle Term for ODD Dataset', 'law': 'Median = [(n + 1)/2]ᵗʰ sorted term'},
            {'title': 'Day 11: Median: Middle Average for EVEN Dataset', 'law': 'Median = Average of (n/2)ᵗʰ & (n/2+1)ᵗʰ'},
            {'title': 'Day 12: Mode: Peak Frequency Detection', 'law': 'Mode = Most frequent observation'},
            {'title': 'Day 13: Range & Coefficient of Range', 'law': 'Range = Largest - Smallest | Coeff = (L-S)/(L+S)'},
            {'title': 'Day 14: Empirical Relation: Mode, Median & Mean', 'law': 'Mode ≈ 3(Median) - 2(Mean)'},
            {'title': 'Day 15: Pythagoras Theorem: Hypotenuse Formula', 'law': 'c² = a² + b² (c = √(a² + b²))'},
            {'title': 'Day 16: Pythagorean Triplets (3-4-5, 5-12-13)', 'law': '(2m, m² - 1, m² + 1)'},
            {'title': 'Day 17: Circle Circumference Formula (2πr)', 'law': 'Circumference = 2 × (22/7) × r'},
            {'title': 'Day 18: Circle Area Formula (πr²)', 'law': 'Area = (22/7) × r²'}
          ]
        },
        {
          'subject': 'Science (அறிவியல் — Days 19–40)',
          'title': 'Unit 2: Physics, Chemistry & Biology Nano-Units',
          'topics': [
            {'title': 'Day 19: Speed, Velocity & Acceleration', 'law': 'Speed = Distance/Time | a = (v - u)/t'},
            {'title': 'Day 20: Fluid Pressure P = F/A & Liquid Depth P = ρgh', 'law': 'Pressure = Force/Area (Pa) | Liquid P = hρg'},
            {'title': 'Day 21: Newton 1st Law: Inertia of Rest & Motion', 'law': 'Objects resist change in motion (Inertia)'},
            {'title': 'Day 22: Newton 2nd Law: Force Formula F = ma', 'law': 'F = ma = (mv - mu)/t | Impulse J = F × Δt'},
            {'title': 'Day 23: Newton 3rd Law: Action & Reaction Pairs', 'law': 'F₁₂ = -F₂₁ (Equal & Opposite Action-Reaction)'},
            {'title': 'Day 24: Ohm\'s Law: V = IR & Resistance', 'law': 'V = IR | Current is proportional to Voltage'},
            {'title': 'Day 25: Resistors in Series: R_s = R₁ + R₂ + R₃', 'law': 'Same Current; Resistances add up directly'},
            {'title': 'Day 26: Resistors in Parallel: 1/R_p = 1/R₁ + 1/R₂', 'law': 'Same Voltage; Reciprocals add up'},
            {'title': 'Day 27: Acids, Bases & Litmus Indicators', 'law': 'Acids: Blue -> Red | Bases: Red -> Blue'},
            {'title': 'Day 28: Neutralization: Acid + Base -> Salt + Water', 'law': 'HCl + NaOH -> NaCl + H₂O + Heat'},
            {'title': 'Day 29: pH Scale: 0 to 14 Acidity & Basicity', 'law': 'pH = -log₁₀[H⁺] | <7 Acid | 7 Neutral | >7 Base'},
            {'title': 'Day 30: Atomic Structure: Protons, Neutrons, Electrons', 'law': 'Atomic No Z = Protons | Mass No A = Z + Neutrons'},
            {'title': 'Day 31: Photosynthesis: Light Reaction in Thylakoids', 'law': 'Photolysis: 2H₂O + Light -> O₂ + ATP + NADPH'},
            {'title': 'Day 32: Photosynthesis: Dark Reaction Calvin Cycle', 'law': 'RuBisCO fixes CO₂ + ATP + NADPH -> Glucose'},
            {'title': 'Day 33: Human Heart: SA Node Natural Pacemaker', 'law': 'Sinoatrial node generates 72 electrical pulses/min'},
            {'title': 'Day 34: Human Heart: Double Circulation Flow', 'law': 'Pulmonary (Lungs) + Systemic (Body)'},
            {'title': 'Day 35: Nephron: Glomerular Ultrafiltration', 'law': 'Bowman\'s capsule filters 180 L/day at high pressure'},
            {'title': 'Day 36: Nephron: Selective Reabsorption in Henle Loop', 'law': 'Reabsorbs 99% water, glucose and amino acids'},
            {'title': 'Day 37: Human Brain: Cerebrum Cognitive Functions', 'law': 'Cerebrum governs logic, thought and memory'},
            {'title': 'Day 38: Human Brain: Cerebellum Body Equilibrium', 'law': 'Cerebellum coordinates posture and balance'},
            {'title': 'Day 39: Plant Hormones: Auxin & Phototropism', 'law': 'Auxin elongates shaded cells -> Bends to light'},
            {'title': 'Day 40: Plant Hormones: Ethylene & Fruit Ripening', 'law': 'Gaseous hormone converts starch to fruit sugar'}
          ]
        },
        {
          'subject': 'Tamil (தமிழ் — Days 41–57)',
          'title': 'Unit 3: தமிழ் எழுத்து, காலம் & தொகைநிலைத் தொடர்கள்',
          'topics': [
            {'title': 'Day 41: உயிர் எழுத்துகள் 5 குறில் எழுத்துகள்', 'law': 'அ, இ, உ, எ, ஒ — 1 மாத்திரை கால அளவு'},
            {'title': 'Day 42: உயிர் எழுத்துகள் 7 நெடில் எழுத்துகள்', 'law': 'ஆ, ஈ, ஊ, ஏ, ஐ, ஓ, ஔ — 2 மாத்திரை கால அளவு'},
            {'title': 'Day 43: வல்லின மெய் எழுத்துகள் (க், ச், ட், த், ப், ற்)', 'law': 'கசடதபற — வன்மையான ஓசை (½ மாத்திரை)'},
            {'title': 'Day 44: மெல்லின மெய் எழுத்துகள் (ங், ஞ், ண், ந், ம், ன்)', 'law': 'ஙஞணநமன — மெல்லிய மூக்கொலி (½ மாத்திரை)'},
            {'title': 'Day 45: இடையின மெய் எழுத்துகள் (ய், ர், ல், வ், ழ், ள்)', 'law': 'யரலவழள — இடைப்பட்ட ஓசை (½ மாத்திரை)'},
            {'title': 'Day 46: ஆய்த எழுத்து (ஃ) நடுநிலை பயன்பாட்டு விதிகள்', 'law': 'எஃகு, அஃது — சொல்லின் இடையில் மட்டுமே வரும்'},
            {'title': 'Day 47: திணை பாகுபாடு: உயர்திணை vs அஃறிணை', 'law': 'மனிதர் உயர்திணை; பறவை, விலங்கு, பொருட்கள் அஃறிணை'},
            {'title': 'Day 48: ஐம்பால் பாகுபாடு (ஆண், பெண், பலர், ஒன்று, பல)', 'law': 'உயர்திணை 3 பால்; அஃறிணை 2 பால்'},
            {'title': 'Day 49: முக்காலம்: இறந்த கால இடைநிலைகள் (த், ட், ற், இன்)', 'law': 'செய்தான் (த்), உண்டான் (ட்), பாடினான் (இன்)'},
            {'title': 'Day 50: முக்காலம்: நிகழ்கால இடைநிலைகள் (கிறு, கின்று, ஆநின்று)', 'law': 'செய்கிறான் (கிறு), உண்கின்றான் (கின்று)'},
            {'title': 'Day 51: முக்காலம்: எதிர்கால இடைநிலைகள் (ப், வ்)', 'law': 'படிப்பான் (ப்), வருவான் (வ்)'},
            {'title': 'Day 52: வேற்றுமைத் தொகை: ஐ, ஆல், கு, இன், அது, கண்', 'law': 'பால் குடித்தான் = பாலைக் குடித்தான் (ஐ மறைந்தது)'},
            {'title': 'Day 53: வினைத்தொகை: ஊறுகாய் முக்காலம் மறைதல்', 'law': 'ஊறிய, ஊறுகின்ற, ஊறும் காய் (காலம் கரந்தது)'},
            {'title': 'Day 54: பண்புத்தொகை: செந்தாமரை மை விகுதி மறைதல்', 'law': 'செம்மையாகிய தாமரை | வெண்ணிலவு'},
            {'title': 'Day 55: உவமைத்தொகை & உம்மைத்தொகை', 'law': 'மலர்விழி (போல) | தாய் தந்தை (உம் மறைந்தது)'},
            {'title': 'Day 56: வல்லினம் மிகும் இடங்கள்: அந்த, இந்த சுட்டு', 'law': 'அந்த + காடு = அந்தக்காடு | இந்த + பையன் = இந்தப்பையன்'},
            {'title': 'Day 57: வல்லினம் மிகா இடங்கள்: வினைத்தொகை & அது, இது', 'law': 'குடி தண்ணீர் (மிகாது) | அது சென்றது (மிகாது)'}
          ]
        }
      ]
    },
    {
      'id': 'class_10_tn',
      'title': 'Class 10 (SSLC 10th)',
      'sub': 'Science (Bio/Phy/Chem), Maths, Tamil, English, Social',
      'units': [
        {
          'subject': 'Biology (உயிரியல்)',
          'title': 'Unit 3: Life Processes & Genetics (வாழ்க்கைச் செயல்கள்)',
          'topics': [
            {'title': 'Photosynthesis & Plant Physiology (ஒளிச்சேர்க்கை)', 'law': '6CO₂ + 6H₂O + Sunlight -> C₆H₁₂O₆ + 6O₂ (Light & Dark Reactions)'},
            {'title': 'Human Heart & Double Circulation (மனித இதயம்)', 'law': '4 Chambers, Tricuspid/Bicuspid Valves, BP = 120/80 mmHg'},
            {'title': 'Nephron & Excretory System (நெஃப்ரான் கழிவுநீக்கம்)', 'law': 'Glomerular Ultrafiltration & Selective Tubular Reabsorption'},
            {'title': 'Human Brain & Reflex Action (மனித மூளை)', 'law': 'Cerebrum, Cerebellum, Medulla & Reflex Arc Action'},
            {'title': 'Plant Hormones (தாவர ஹார்மோன்கள் - ஆக்சின், எத்திலீன்)', 'law': 'Auxin = Shoot Growth | Cytokinin = Cell Division | Ethylene = Ripening'},
            {'title': "Mendel's Laws of Inheritance (மெண்டலின் மரபியல்)", 'law': 'Monohybrid Cross 3:1 | Dihybrid Cross 9:3:3:1'},
            {'title': 'DNA Structure - Watson & Crick Model (DNA இரட்டைச் சுருள்)', 'law': 'Double Helix with A=T and G≡C Complementary Base Pairs'}
          ]
        },
        {
          'subject': 'Physics (இயற்பியல்)',
          'title': 'Unit 1: Laws of Motion, Optics & Electricity',
          'topics': [
            {'title': "Newton's Laws of Motion (நியூட்டனின் இயக்க விதிகள்)", 'law': 'F = ma | Momentum p = mv | Recoil v = -(m/M)u'},
            {'title': 'Optics & Lens Formula (ஒளியியல் & லென்ஸ் சூத்திரம்)', 'law': '1/v - 1/u = 1/f | Power of Lens P = 1/f(m) Dioptre'},
            {'title': "Electricity & Ohm's Law (மின்னியல் & ஓம் விதி)", 'law': 'V = IR | Series R_s = R₁ + R₂ | Joule Heat H = I²Rt'},
            {'title': 'Nuclear Physics & Radioactivity (அணுக்கரு இயற்பியல்)', 'law': 'E = mc² | Nuclear Fission & Fusion Energy'}
          ]
        },
        {
          'subject': 'Chemistry (வேதியியல்)',
          'title': 'Unit 2: Atoms, Solutions & Carbon Compounds',
          'topics': [
            {'title': 'Mole Concept & Avogadro Number (மோல் தத்துவம்)', 'law': 'Mole n = Mass / Molar Mass | N_A = 6.023 × 10²³'},
            {'title': 'pH Scale & Acid-Base Indicators (pH அளவீடு)', 'law': 'pH = -log₁₀[H⁺] | Acidic < 7 | Neutral = 7 | Basic > 7'},
            {'title': 'Carbon Compounds & Esterification (கார்பன் சேர்மங்கள்)', 'law': 'CH₃COOH + C₂H₅OH -> CH₃COOC₂H₅ (Ester) + H₂O'}
          ]
        },
        {
          'subject': 'Mathematics (கணிதம்)',
          'title': 'Unit 1: Numbers, Algebra, Geometry & Trigonometry',
          'topics': [
            {'title': "Euclid's Division Lemma (யூக்ளிட் வகுத்தல் வழிமுறை)", 'law': 'a = bq + r (0 ≤ r < b) for HCF Algorithm'},
            {'title': 'Arithmetic Progression AP (கூட்டுத்தொடர் AP)', 'law': 't_n = a + (n - 1)d | S_n = n/2 [2a + (n - 1)d]'},
            {'title': 'Geometric Progression GP (பெருக்குத்தொடர் GP)', 'law': 't_n = a rⁿ⁻¹ | S_n = a(rⁿ - 1)/(r - 1)'},
            {'title': 'Quadratic Nature of Roots (இருபடிச் சமன்பாடுகள்)', 'law': 'D = b² - 4ac | x = [-b ± √(b² - 4ac)] / (2a)'},
            {'title': 'Thales Theorem & BPT (தேல்ஸ் தேற்றம்)', 'law': 'AD/DB = AE/EC in triangle with parallel line'},
            {'title': 'Trigonometric Identities (முக்கோணவியல்)', 'law': 'sin²θ + cos²θ = 1 | 1 + tan²θ = sec²θ'}
          ]
        },
        {
          'subject': 'Tamil (தமிழ்)',
          'title': 'இயல் 1 முதல் 5: செய்யுள், உரைநடை & இலக்கணம்',
          'topics': [
            {'title': 'அன்னை மொழியே (பாவலேறு பெருஞ்சித்திரனார்)', 'law': 'கணிச்சாறு: நறுங்கனியே செந்தமிழே வாழ்த்துப் பாடல்'},
            {'title': 'காற்றே வா (மகாகவி பாரதியார் வசன கவிதை)', 'law': 'மகரந்தத் தூளைச் சுமந்து வரும் தென்றல் காற்று'},
            {'title': 'முல்லைப்பாட்டு (நப்பூதனார் சங்க இலக்கியம்)', 'law': 'பத்துப்பாட்டு: முல்லை நில உரிப்பொருள் & விரிச்சி கேட்டல்'},
            {'title': 'தொகைநிலைத் தொடர்கள் (6 வகைகள்)', 'law': 'வேற்றுமை, வினை, பண்பு, உவமை, உம்மை, அன்மொழித்தொகை'},
            {'title': 'தொகாநிலைத் தொடர்கள் (9 வகைகள்)', 'law': 'எழுவாய், விளி, வினைமுற்று, பெயரெச்ச, வினையெச்சத் தொடர்'},
            {'title': 'வழு, வழாநிலை & வழுவமைதி (இலக்கணம்)', 'law': 'திணை, பால், இடம், கால, மரபு வழுவமைதி 5 வகை'}
          ]
        }
      ]
    },
    {
      'id': 'class_12_tn',
      'title': 'Class 12 Board Exam',
      'sub': 'Maths, Physics, Chem, Bio, CS, Commerce, Accounts, Tamil',
      'units': [
        {
          'subject': 'Physics (இயற்பியல்)',
          'title': 'Unit 1: Electrostatics',
          'topics': [
            {'title': "Coulomb's Law & Vector Form", 'law': "F = (1 / 4πε₀) · (q₁q₂ / r²)"},
            {'title': 'Electric Flux & Gauss Theorem', 'law': '∮ E · dA = Q_enclosed / ε₀'},
            {'title': 'Capacitance & Dielectric Energy', 'law': 'U = 1/2 CV²'}
          ]
        },
        {
          'subject': 'Mathematics (கணிதம்)',
          'title': 'Unit 1: Applications of Matrices & Determinants',
          'topics': [
            {'title': 'Inverse of Non-Singular Matrix', 'law': 'A⁻¹ = (1 / |A|) · adj(A)'},
            {'title': "Cramer's Rule & Rank Analysis", 'law': 'x = Δx / Δ, y = Δy / Δ'},
            {'title': 'Orthogonal Transformations', 'law': 'A · Aᵀ = I'}
          ]
        },
        {
          'subject': 'Chemistry (வேதியியல்)',
          'title': 'Unit 1: Metallurgy & Extraction',
          'topics': [
            {'title': 'Froth Flotation & Leaching', 'law': 'Mineral separation via Pine Oil & NaCN'},
            {'title': 'Ellingham Diagram & Thermodynamic Free Energy', 'law': 'ΔG° = ΔH° - TΔS°'},
            {'title': 'Zone Refining & Van Arkel Method', 'law': 'Vapour phase refining for Ultra-pure metals'}
          ]
        }
      ]
    },
    {
      'id': 'neet_ug_2026',
      'title': 'NEET UG 2026',
      'sub': 'Physics, Chemistry, Botany, Zoology (720 Marks)',
      'units': [
        {
          'subject': 'Botany & Zoology',
          'title': 'Genetics & Molecular Basis of Inheritance',
          'topics': [
            {'title': 'Mendelian Dihybrid Cross & Law of Segregation', 'law': 'Phenotypic Ratio 9:3:3:1'},
            {'title': 'DNA Replication Semi-Conservative Model', 'law': 'Meselson-Stahl Proof & DNA Polymerase III'},
            {'title': 'Lac Operon & Gene Regulation', 'law': 'Repressor binds operator in absence of allolactose'}
          ]
        }
      ]
    },
    {
      'id': 'tnpsc_group_1_2_4',
      'title': 'TNPSC Gr 1, 2, 4 & VAO',
      'sub': 'General Tamil 100M, General Studies 75M, Aptitude 25M',
      'units': [
        {
          'subject': 'General Tamil (பொதுத்தமிழ்)',
          'title': 'பகுதி-அ: இலக்கணம் & இலக்கியம்',
          'topics': [
            {'title': 'எட்டுத்தொகை & பத்துப்பாட்டு நூல்கள்', 'law': 'சங்க இலக்கிய திணை & ஆசிரியர்கள் பகுப்பாய்வு'},
            {'title': 'திருக்குறள் அறுபத்துநான்கு அதிகாரங்கள்', 'law': 'பொருட்பால் & அறத்துப்பால் முக்கிய வினாக்கள்'},
            {'title': 'சொல் வகை & புணர்ச்சி விதிகள்', 'law': 'உயிரீறு, மெய்யீறு, உடம்படுமெய் இலக்கணம்'}
          ]
        }
      ]
    }
  ];

  // Exam State
  dynamic activeTest;
  List<dynamic> questions = [];
  int currentIdx = 0;
  Map<int, String> answers = {};
  Map<int, String> qStatus = {}; // 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'REVIEW'
  int timeLeft = 30 * 60;
  Timer? examTimer;

  // Results State
  int score = 0;

  @override
  void initState() {
    super.initState();
    _fetchTests();
  }

  @override
  void dispose() {
    examTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchTests() async {
    try {
      final response = await Supabase.instance.client
          .from('unified_master_data')
          .select('*')
          .eq('item_type', 'o_test')
          .limit(2000);

      Map<String, List<dynamic>> groups = {};

      for (var item in (response as List<dynamic>)) {
        dynamic ai = item['additional_info'];
        if (ai is String) {
          try { ai = jsonDecode(ai); } catch (e) {}
        }

        if (ai != null && ai['questions'] != null && (ai['questions'] as List).isNotEmpty) {
          String title = item['title_name'] ?? '';
          String courseName = 'General Tests';
          String testName = title;

          if (title.contains(':')) {
            var parts = title.split(':');
            courseName = parts[0].trim();
            testName = parts.sublist(1).join(':').trim();
          }

          item['displayTitle'] = testName;
          item['questionCount'] = (ai['questions'] as List).length;

          if (!groups.containsKey(courseName)) {
            groups[courseName] = [];
          }
          groups[courseName]!.add(item);
        }
      }

      List<Map<String, dynamic>> formattedSections = groups.entries.map((e) => {
        'title': e.key,
        'data': e.value
      }).toList();

      setState(() {
        sections = formattedSections;
        isLoading = false;
      });
    } catch (e) {
      print('Error fetching tests: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  void _startExam(dynamic test) {
    dynamic ai = test['additional_info'];
    if (ai is String) {
      try { ai = jsonDecode(ai); } catch (e) {}
    }

    List<dynamic> qs = [];
    if (ai != null && ai['questions'] is List) {
      qs = ai['questions'];
    }

    if (qs.isEmpty) {
      qs = [
        {
          'question': 'Sample Question 1: What is the primary function of chlorophyll in plants?',
          'options': ['Photosynthesis', 'Transpiration', 'Respiration', 'Absorption'],
          'correct_answer': 'Photosynthesis',
          'explanation': 'Chlorophyll absorbs light energy for photosynthesis.'
        }
      ];
    }

    Map<int, String> initialStatus = {};
    for (int i = 0; i < qs.length; i++) {
      initialStatus[i] = i == 0 ? 'NOT_ANSWERED' : 'NOT_VISITED';
    }

    setState(() {
      activeTest = test;
      questions = qs;
      currentIdx = 0;
      answers = {};
      qStatus = initialStatus;
      timeLeft = qs.length * 60;
      viewMode = 'exam';
    });

    examTimer?.cancel();
    examTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (timeLeft <= 1) {
        timer.cancel();
        _submitExam();
      } else {
        setState(() {
          timeLeft--;
        });
      }
    });
  }

  void _submitExam() {
    examTimer?.cancel();
    int calculatedScore = 0;
    for (int i = 0; i < questions.length; i++) {
      final q = questions[i];
      final uAns = answers[i];
      final cAns = q['correct_answer'] ?? q['correctAnswer'] ?? q['answer'];
      if (uAns != null && cAns != null && uAns.toString().trim().toLowerCase() == cAns.toString().trim().toLowerCase()) {
        calculatedScore++;
      }
    }

    setState(() {
      score = calculatedScore;
      viewMode = 'result';
    });
  }

  String _formatTime(int secs) {
    int m = secs ~/ 60;
    int s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  // --- CBT EXAM UI ---
  Widget _buildExamScreen() {
    final currentQ = questions[currentIdx];
    final options = (currentQ['options'] as List? ?? []);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: const Color(0xFF1E293B),
                title: const Text('Exit Exam?', style: TextStyle(color: Colors.white)),
                content: const Text('Your current progress will be lost.', style: TextStyle(color: Color(0xFF94A3B8))),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.white70))),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      examTimer?.cancel();
                      setState(() => viewMode = 'hub');
                    },
                    child: const Text('Exit', style: TextStyle(color: Colors.redAccent)),
                  ),
                ],
              ),
            );
          },
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(activeTest?['displayTitle'] ?? 'Mock Exam', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Q ${currentIdx + 1} of ${questions.length}', style: const TextStyle(fontSize: 11, color: Color(0xFF8B5CF6))),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0F1E),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: timeLeft < 300 ? Colors.redAccent : const Color(0xFF8B5CF6)),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.clock, size: 14, color: timeLeft < 300 ? Colors.redAccent : const Color(0xFF8B5CF6)),
                const SizedBox(width: 4),
                Text(_formatTime(timeLeft), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: timeLeft < 300 ? Colors.redAccent : Colors.white)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.layoutGrid, color: Colors.white),
            onPressed: () => _openPaletteSheet(),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question Prompt Card
            Card(
              color: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  currentQ['question'] ?? 'No question text',
                  style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.4, fontWeight: FontWeight.w600),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Options List
            Expanded(
              child: ListView.builder(
                itemCount: options.length,
                itemBuilder: (context, idx) {
                  final opt = options[idx].toString();
                  final isSelected = answers[currentIdx] == opt;

                  return Card(
                    color: isSelected ? const Color(0xFF8B5CF6).withOpacity(0.2) : const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF334155)),
                    ),
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      onTap: () {
                        setState(() {
                          answers[currentIdx] = opt;
                          qStatus[currentIdx] = 'ANSWERED';
                        });
                      },
                      leading: CircleAvatar(
                        radius: 14,
                        backgroundColor: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF334155),
                        child: Text(
                          String.fromCharCode(65 + idx),
                          style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                      title: Text(opt, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFFE2E8F0), fontSize: 14)),
                      trailing: isSelected ? const Icon(LucideIcons.checkCircle2, color: Color(0xFF8B5CF6)) : null,
                    ),
                  );
                },
              ),
            ),

            // Bottom Exam Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton.icon(
                  onPressed: () {
                    setState(() {
                      qStatus[currentIdx] = 'REVIEW';
                    });
                  },
                  icon: const Icon(LucideIcons.alertTriangle, size: 14, color: Color(0xFFA855F7)),
                  label: const Text('Review', style: TextStyle(color: Color(0xFFA855F7), fontSize: 12)),
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFA855F7))),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      answers.remove(currentIdx);
                      qStatus[currentIdx] = 'NOT_ANSWERED';
                    });
                  },
                  child: const Text('Clear', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                ),
                if (currentIdx > 0)
                  IconButton(
                    icon: const Icon(LucideIcons.chevronLeft, color: Colors.white),
                    onPressed: () => setState(() => currentIdx--),
                  ),
                ElevatedButton(
                  onPressed: () {
                    if (currentIdx < questions.length - 1) {
                      setState(() => currentIdx++);
                    } else {
                      _showSubmitConfirm();
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6)),
                  child: Text(currentIdx < questions.length - 1 ? 'Save & Next' : 'Finish', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _openPaletteSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Question Palette', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: List.generate(questions.length, (idx) {
                final st = qStatus[idx] ?? 'NOT_VISITED';
                Color bg = const Color(0xFF334155);
                if (st == 'ANSWERED') bg = const Color(0xFF10B981);
                if (st == 'NOT_ANSWERED') bg = const Color(0xFFEF4444);
                if (st == 'REVIEW') bg = const Color(0xFFA855F7);

                return InkWell(
                  onTap: () {
                    Navigator.pop(ctx);
                    setState(() => currentIdx = idx);
                  },
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: bg,
                      borderRadius: BorderRadius.circular(8),
                      border: currentIdx == idx ? Border.all(color: Colors.white, width: 2) : null,
                    ),
                    alignment: Alignment.center,
                    child: Text('${idx + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                );
              }),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                _showSubmitConfirm();
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), minimumSize: const Size.fromHeight(44)),
              child: const Text('Submit Exam', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showSubmitConfirm() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Submit Test?', style: TextStyle(color: Colors.white)),
        content: Text('You have answered ${answers.length} out of ${questions.length} questions.', style: const TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Continue Test', style: TextStyle(color: Colors.white70))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _submitExam();
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            child: const Text('Yes, Submit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // --- RESULTS UI ---
  Widget _buildResultScreen() {
    final accuracy = questions.isNotEmpty ? ((score / questions.length) * 100).toStringAsFixed(1) : '0';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: const Text('Exam Results', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => setState(() => viewMode = 'hub'),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: const Color(0xFF8B5CF6).withOpacity(0.2),
                    child: Text('$accuracy%', style: const TextStyle(color: Color(0xFF8B5CF6), fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 16),
                  Text('Score: $score / ${questions.length}', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text('Completed successfully', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: () => _startExam(activeTest),
                        icon: const Icon(LucideIcons.rotateCcw, size: 16, color: Colors.white),
                        label: const Text('Retake', style: TextStyle(color: Colors.white)),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6)),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () => setState(() => viewMode = 'hub'),
                        child: const Text('Back to Hub', style: TextStyle(color: Color(0xFF94A3B8))),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Detailed Review', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 12),
          ...List.generate(questions.length, (idx) {
            final q = questions[idx];
            final uAns = answers[idx];
            final cAns = q['correct_answer'] ?? q['correctAnswer'] ?? q['answer'];
            final isCorrect = uAns != null && cAns != null && uAns.toString().trim().toLowerCase() == cAns.toString().trim().toLowerCase();

            return Card(
              color: const Color(0xFF1E293B),
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(color: isCorrect ? const Color(0xFF10B981).withOpacity(0.5) : const Color(0xFFEF4444).withOpacity(0.5)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Q${idx + 1}. ${q['question']}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 8),
                    Text('Your Answer: ${uAns ?? 'Not Answered'}', style: TextStyle(color: isCorrect ? const Color(0xFF10B981) : const Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold)),
                    Text('Correct Answer: $cAns', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                    if (q['explanation'] != null) ...[
                      const SizedBox(height: 6),
                      Text('Explanation: ${q['explanation']}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  void startMicroTopicExam(String topicTitle, String courseName) {
    final mockQs = [
      {
        'question': 'Which of the following principles best describes $topicTitle?',
        'options': [
          'Fundamental governing law and empirical observation',
          'Secondary reaction principle',
          'Arbitrary mathematical convention',
          'Hypothetical model without experimental proof'
        ],
        'correct_answer': 'Fundamental governing law and empirical observation',
        'explanation': 'In $courseName, $topicTitle provides the fundamental foundational law and core analytical mechanism.'
      },
      {
        'question': 'What is the primary application of $topicTitle in examinations and real-world systems?',
        'options': [
          'Direct problem solving and state transformation analysis',
          'Irrelevant decorative theory',
          'Historical background only',
          'Discontinued experimental method'
        ],
        'correct_answer': 'Direct problem solving and state transformation analysis',
        'explanation': '$topicTitle directly governs state changes and analytical derivations.'
      },
      {
        'question': 'Under standard conditions, how does $topicTitle interact with core constraints?',
        'options': [
          'Follows conservation and equilibrium rules',
          'Breaks thermodynamic limits',
          'Cannot be evaluated quantitatively',
          'Produces infinite output'
        ],
        'correct_answer': 'Follows conservation and equilibrium rules',
        'explanation': 'Conservation and boundary conditions apply strictly.'
      }
    ];

    _startExam({
      'title_name': '$topicTitle (10-Q CBT)',
      'displayTitle': '$topicTitle (Micro-Topic CBT)',
      'additional_info': {'questions': mockQs}
    });
  }

  // --- HUB UI ---
  @override
  Widget build(BuildContext context) {
    if (viewMode == 'exam') return _buildExamScreen();
    if (viewMode == 'result') return _buildResultScreen();

    final activeCourse = syllabusCourses[selectedCourseIndex];
    final units = activeCourse['units'] as List<dynamic>? ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(LucideIcons.award, color: Color(0xFF10B981)),
            const SizedBox(width: 8),
            const Text('TestO Hub', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
              ),
              child: const Text('தேர்வு CBT', style: TextStyle(fontSize: 10, color: Color(0xFF6EE7B7), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0A0F1E),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Mode Switcher
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => isSyllabusMode = false),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: !isSyllabusMode ? const Color(0xFF10B981) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Full Mock Exams',
                        style: TextStyle(
                          color: !isSyllabusMode ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => isSyllabusMode = true),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSyllabusMode ? const Color(0xFF10B981) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'Syllabus 10-Q CBT',
                        style: TextStyle(
                          color: isSyllabusMode ? const Color(0xFF0A0F1E) : const Color(0xFF94A3B8),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: isSyllabusMode
                ? ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // Course Selector Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: List.generate(syllabusCourses.length, (idx) {
                            final c = syllabusCourses[idx];
                            final isSel = selectedCourseIndex == idx;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text(c['title'] as String),
                                selected: isSel,
                                selectedColor: const Color(0xFF10B981),
                                backgroundColor: const Color(0xFF1E293B),
                                labelStyle: TextStyle(
                                  color: isSel ? const Color(0xFF0A0F1E) : Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                                onSelected: (val) {
                                  if (val) setState(() => selectedCourseIndex = idx);
                                },
                              ),
                            );
                          }),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Course Header Card
                      Card(
                        color: const Color(0xFF111827),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: Color(0xFF1E293B)),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(14.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                activeCourse['title'] as String,
                                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                activeCourse['sub'] as String,
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Units & Micro-topics
                      ...units.map((u) {
                        final topics = u['topics'] as List<dynamic>? ?? [];
                        return Card(
                          color: const Color(0xFF111827),
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                            side: const BorderSide(color: Color(0xFF1E293B)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  u['subject'] as String,
                                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  u['title'] as String,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                const Divider(color: Color(0xFF1E293B), height: 16),
                                ...topics.map((t) => Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F172A),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              t['title'] as String,
                                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                            ),
                                            if (t['law'] != null) ...[
                                              const SizedBox(height: 2),
                                              Text(
                                                t['law'] as String,
                                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      ElevatedButton(
                                        onPressed: () => startMicroTopicExam(t['title'] as String, activeCourse['title'] as String),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF10B981),
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          minimumSize: Size.zero,
                                        ),
                                        child: const Text('10-Q CBT', style: TextStyle(color: Color(0xFF0A0F1E), fontWeight: FontWeight.w900, fontSize: 11)),
                                      ),
                                      const SizedBox(width: 6),
                                      OutlinedButton(
                                        onPressed: () {
                                          TeachoPlayerSheet.show(
                                            context,
                                            topicTitle: t['title'] as String,
                                            subject: u['subject'] as String,
                                            courseTitle: activeCourse['title'] as String,
                                            courseId: activeCourse['id'] as String,
                                            dayNumber: 1,
                                          );
                                        },
                                        style: OutlinedButton.styleFrom(
                                          side: const BorderSide(color: Color(0xFF38BDF8)),
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          minimumSize: Size.zero,
                                        ),
                                        child: const Text('Player ➔', style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 11)),
                                      ),
                                    ],
                                  ),
                                )),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  )
                : isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                    : sections.isEmpty
                        ? const Center(child: Text('No tests available right now.', style: TextStyle(color: Colors.white)))
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: sections.length,
                            itemBuilder: (context, index) {
                              final section = sections[index];
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            section['title'],
                                            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                        Text(
                                          '${section['data'].length} Tests',
                                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ...((section['data'] as List<dynamic>).map((test) => Card(
                                    color: const Color(0xFF1E293B),
                                    margin: const EdgeInsets.only(bottom: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    child: ListTile(
                                      onTap: () => _startExam(test),
                                      leading: const CircleAvatar(
                                        backgroundColor: Color(0xFF27272A),
                                        child: Icon(LucideIcons.fileCheck, color: Color(0xFF10B981), size: 18),
                                      ),
                                      title: Text(
                                        test['displayTitle'] ?? test['title_name'],
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                      subtitle: Text(
                                        '${test['questionCount']} Questions • ~30m',
                                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                      ),
                                      trailing: ElevatedButton(
                                        onPressed: () => _startExam(test),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF10B981),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        ),
                                        child: const Text('Start', style: TextStyle(color: Color(0xFF0A0F1E), fontWeight: FontWeight.bold, fontSize: 12)),
                                      ),
                                    ),
                                  )).toList()),
                                ],
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
