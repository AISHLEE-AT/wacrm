export interface KindleMCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface KindleVSAQ {
  question: string;
  answer: string;
}

export interface KindleShortAnswer {
  question: string;
  marks: string;
  solutionSteps: string[];
  keyTips: string;
}

export interface KindleTopicBook {
  topicTitle: string;
  courseTitle: string;
  category: string;
  readingTime: string;
  overview: string;
  coreConcepts: {
    heading: string;
    content: string;
    example?: string;
  }[];
  tamilExplanation: {
    simpleTitle: string;
    colloquialIntro: string;
    everydayAnalogy: string;
    keyPointsTamil: string[];
  };
  vsaqs: KindleVSAQ[];
  shortAnswers: KindleShortAnswer[];
  mcqs: KindleMCQ[];
  formulasAndMnemonics: {
    formula: string;
    meaning: string;
    mnemonic?: string;
  }[];
}

export function generateKindleBook(topic: string, courseTitle: string, category: string = ''): KindleTopicBook {
  const cleanTopic = topic || 'Core Fundamentals';
  const cleanCourse = courseTitle || 'Masterclass Course';

  const overview = `In this comprehensive Kindle-style lesson on "${cleanTopic}", we explore the fundamental principles, real-world applications, mathematical formulations, and high-yield examination problem-solving techniques.`;

  const coreConcepts = [
    {
      heading: `1. Foundational Axioms & Definitions of ${cleanTopic}`,
      content: `The conceptual foundation of ${cleanTopic} is rooted in standard academic frameworks. Every problem begins by identifying the core boundary conditions, governing equations, and fundamental definitions.`,
      example: `Real-World Application: In engineering and modern technology, these principles are used to calculate system efficiency, optimize resources, and minimize errors.`
    },
    {
      heading: `2. Detailed Theoretical Breakdown & Derivations`,
      content: `By applying consistent step-by-step logic, complex multi-variable relationships are reduced to simple, solvable linear and non-linear forms. Always verify unit dimensions before proceeding to final numerical solutions.`,
      example: `Standard Model: When parameters change continuously, rate equations or transformation matrices ensure equilibrium.`
    },
    {
      heading: `3. High-Yield Exam Traps & Optimization Shortcuts`,
      content: `Competitive and board examiners frequently test edge cases. Always watch out for sign conventions, implicit assumptions, and boundary limitations.`,
      example: `Exam Tip: Eliminating impossible options by checking dimension consistency saves over 45 seconds per question.`
    }
  ];

  const tamilExplanation = {
    simpleTitle: `${cleanTopic} — எளிய தமிழில் முழு விளக்கம்`,
    colloquialIntro: `"${cleanTopic}" என்பதை நாம் அன்றாட வாழ்க்கையோடு ஒப்பிட்டு மிக எளிதாகப் புரிந்து கொள்ளலாம். எதையும் மனப்பாடம் செய்யாமல் அதன் அடிப்படை தத்துவத்தைப் புரிந்து கொண்டால் 100% மதிப்பெண் பெறலாம்.`,
    everydayAnalogy: `உதாரணமாக, நாம் ஒரு சைக்கிள் ஓட்டும் போது சமநிலையைக் காப்பது போல, அல்லது மளிகைக் கடையில் வரவு-செலவு கணக்கிடுவது போல, இந்த பாடத்தின் விதிகளும் எளிய நடைமுறை தத்துவங்களின் அடிப்படையில் உருவானவை.`,
    keyPointsTamil: [
      `1. முதன்மை விதியைத் தெளிவாக நினைவில் வையுங்கள் (Basic Core Principle).`,
      `2. சூத்திரங்களைப் பயன்படுத்தும் போது அலகுகளை (SI Units) கட்டாயம் சரிபார்க்கவும்.`,
      `3. தேர்வு வினாக்களில் கொடுக்கப்பட்டுள்ள மதிப்புகளை முதலில் தனியாக எடுத்து எழுதுங்கள்.`
    ]
  };

  const vsaqs: KindleVSAQ[] = [
    {
      question: `What is the primary governing definition of ${cleanTopic}?`,
      answer: `It is the foundational standard relation that establishes direct proportionality between input parameters and state responses.`
    },
    {
      question: `What is the standard SI unit associated with calculations in ${cleanTopic}?`,
      answer: `Standard International (SI) coherent base units or dimensionless normalized ratio units.`
    },
    {
      question: `Why is unit consistency critical when solving numericals in ${cleanTopic}?`,
      answer: `Because mixing non-SI units leads to magnitude errors by powers of 10 in final numerical calculations.`
    },
    {
      question: `State one major real-world application of ${cleanTopic}.`,
      answer: `Used in automated control systems, data modeling, algorithm optimization, and physical engine simulations.`
    },
    {
      question: `What is the fastest technique to verify an answer in competitive exams?`,
      answer: `Dimensional analysis and substituting boundary values (e.g., 0, 1, or infinity).`
    }
  ];

  const shortAnswers: KindleShortAnswer[] = [
    {
      question: `Explain the fundamental working principle of ${cleanTopic} with a structured diagrammatic approach.`,
      marks: '2 Marks',
      solutionSteps: [
        `Step 1: State the precise academic definition and standard governing equation.`,
        `Step 2: Define all variables and state standard assumptions (e.g. constant temperature or ideal medium).`,
        `Step 3: Conclude with the physical significance of the derived outcome.`
      ],
      keyTips: `Examiners award 1 full mark for the correct formula and 1 mark for mentioning units and standard conditions.`
    },
    {
      question: `Derive the standard mathematical relationship for ${cleanTopic} and discuss its boundary limitations.`,
      marks: '5 Marks',
      solutionSteps: [
        `Step 1: Formulate the initial differential or algebraic relation from first principles.`,
        `Step 2: Integrate or solve step-by-step showing every intermediate algebraic substitution.`,
        `Step 3: Apply boundary conditions to determine integration constants.`,
        `Step 4: State the 2 conditions where this formula fails (e.g. non-linear regions, relativistic speeds).`
      ],
      keyTips: `Highlight final boxed formulas with SI units for maximum score retention.`
    }
  ];

  const mcqs: KindleMCQ[] = [
    {
      question: `In ${cleanTopic}, what is the foundational governing relation between the primary variables?`,
      options: [
        `A) Direct Linear Proportionality`,
        `B) Inverse Quadratic Equilibrium`,
        `C) Logarithmic Rate Decay`,
        `D) Discontinuous Random Variance`
      ],
      correct: 0,
      explanation: `Option A is correct because the standard formulation assumes first-order linear response under equilibrium conditions.`
    },
    {
      question: `Which parameter remains constant during standard ideal transformations in ${cleanTopic}?`,
      options: [
        `A) Total System Invariant Energy / Mass`,
        `B) Instantaneous Velocity only`,
        `C) Ambient Temperature only`,
        `D) External Frictional Dissipation`
      ],
      correct: 0,
      explanation: `Option A is correct due to the fundamental conservation theorems governing closed systems.`
    },
    {
      question: `What happens when the input scale factor is doubled in the primary equation of ${cleanTopic}?`,
      options: [
        `A) Output response scales by 2x or 4x according to power index`,
        `B) Output drops immediately to zero`,
        `C) System loses stability completely`,
        `D) No change occurs in dependent variables`
      ],
      correct: 0,
      explanation: `Option A is correct because physical systems obey standard power-law scaling responses.`
    },
    {
      question: `Which common student mistake should be strictly avoided in competitive examinations for ${cleanTopic}?`,
      options: [
        `A) Omitting sign conventions and mixing non-standard units`,
        `B) Writing step-by-step formulas clearly`,
        `C) Verifying dimensions before marking options`,
        `D) Double checking calculations`
      ],
      correct: 0,
      explanation: `Option A is the most frequent trap where negative signs in vectors or gradients are missed.`
    },
    {
      question: `What is the optimal problem-solving strategy for high-percentile accuracy in ${cleanTopic}?`,
      options: [
        `A) Formula Identification -> Unit Check -> Boundary Elimination -> Final Solve`,
        `B) Blind Guessing based on option lengths`,
        `C) Memorizing numbers without understanding derivations`,
        `D) Skipping all question statements`
      ],
      correct: 0,
      explanation: `Option A is the proven high-speed method used by top rankers to achieve 100% accuracy under exam pressure.`
    }
  ];

  const formulasAndMnemonics = [
    {
      formula: `F(x) = k * Delta_x`,
      meaning: `Linear Governing Equation (Restoring / Equilibrium response)`,
      mnemonic: `Fast Knowledge Always Delivers (F = k * Delta_x)`
    },
    {
      formula: `Efficiency = (Output / Input) * 100%`,
      meaning: `Efficiency Percentage Formula`,
      mnemonic: `Out Over In times Hundred`
    },
    {
      formula: `Relative Error = |Delta_a / a| * 100%`,
      meaning: `Relative Percentage Error Calculation`,
      mnemonic: `Delta Over True Value`
    }
  ];

  return {
    topicTitle: cleanTopic,
    courseTitle: cleanCourse,
    category,
    readingTime: '6 min read',
    overview,
    coreConcepts,
    tamilExplanation,
    vsaqs,
    shortAnswers,
    mcqs,
    formulasAndMnemonics,
  };
}