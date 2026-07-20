import Papa from 'papaparse';

const ASTRO_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3Eu7dTRLuviznTlPbDaw_TDKBcvBpCRdU3xTtt0aqsRIaaLJkyTcgZSflAck_ZAbuEMnYoK_s5vRO/pub?output=csv";

// A collection of dynamic Tamil predictions (Financial, Career, Health, General Good News)
const PREDICTIONS = [
  "இன்று உங்களுக்கு எதிர்பாராத பணவரவு கிடைக்கும். புதிய முயற்சிகளில் வெற்றி கிட்டும்.",
  "தொழிலில் நல்ல முன்னேற்றம் ஏற்படும். குடும்பத்தில் மகிழ்ச்சி நிலவும்.",
  "பணிவிடத்தில் உயர் அதிகாரிகளின் ஆதரவு கிடைக்கும். புதிய வாய்ப்புகள் தேடி வரும்.",
  "உங்கள் திறமைகளை வெளிப்படுத்த நல்ல நாள். எதிர்பாராத நற்செய்தி வரும்.",
  "உடல் ஆரோக்கியம் மேம்படும். தடைப்பட்ட காரியங்கள் இன்று சுமுகமாக முடியும்.",
  "பணவரவு திருப்திகரமாக இருக்கும். நண்பர்கள் மூலம் நல்ல உதவி கிடைக்கும்.",
  "இன்று ஆன்மீக சிந்தனைகள் அதிகரிக்கும். வெளியூர் பயணங்கள் நன்மையை தரும்.",
  "குடும்பத்தில் அமைதி நிலவும். சுபகாரிய முயற்சிகள் வெற்றி பெறும்.",
  "வியாபாரத்தில் புதிய முதலீடுகள் லாபத்தை தரும். மனக்கவலைகள் நீங்கும்.",
  "தன்னம்பிக்கையுடன் செயல்பட்டால் வெற்றி நிச்சயம். எதிர்பாராத லாபம் கிடைக்கும்.",
  "இன்று உங்களுக்கு மிகவும் அதிர்ஷ்டமான நாள். உங்களின் நீண்ட நாள் ஆசை நிறைவேறும்.",
  "கல்வி மற்றும் வேலைவாய்ப்பில் நல்ல செய்தி கிடைக்கும். மகிழ்ச்சியான நாள்.",
  "குடும்ப உறுப்பினர்களுடன் நேரத்தை செலவிடுவீர்கள். வருமானம் கூடும்.",
  "சவால்களை எளிதில் முறியடிப்பீர்கள். எதிரிகள் விலகிச் செல்வார்கள்.",
  "இன்று நீங்கள் எடுக்கும் எல்லா முடிவுகளும் உங்களுக்கு சாதகமாக அமையும்."
];

const RASIS = [
  "மேஷம் (Mesham)", "ரிஷபம் (Rishabam)", "மிதுனம் (Midhunam)", 
  "கடகம் (Kadagam)", "சிம்மம் (Simmam)", "கன்னி (Kanni)", 
  "துலாம் (Thulam)", "விருச்சிகம் (Viruchigam)", "தனுசு (Dhanusu)", 
  "மகரம் (Magaram)", "கும்பம் (Kumbam)", "மீனம் (Meenam)"
];

// Simple seeded random number generator based on string
const getSeededRandom = (seedString) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
};

export const astroService = {
  getDailyPrediction: async (rasiName, userName = "User") => {
    // 1. Fetch CSV for any global 'GoodNews' or 'Alert' of the day (Panchangam info)
    let globalInfo = "";
    try {
      const results = await new Promise((resolve) => {
        Papa.parse(ASTRO_CSV_URL, {
          download: true,
          header: true,
          complete: resolve
        });
      });
      // If the sheet has data, we can use the first row as a global alert if needed
      if (results && results.data && results.data.length > 0) {
         // This is a fallback if the user typed something specific in the sheet
      }
    } catch (e) {
      console.error("Astro CSV fetch failed", e);
    }

    // 2. Generate the unique Daily Auto Teller prediction based on Rasi + Date
    const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format

    
    // Create a unique seed for this specific Rasi on this specific Day
    const seed = `${rasiName}-${today}-${userName}`;
    const randIndex = getSeededRandom(seed) % PREDICTIONS.length;
    
    // Add some dynamic lucky metrics
    const luckyNumber = (getSeededRandom(seed + "num") % 9) + 1;
    const colors = ["சிவப்பு", "பச்சை", "நீலம்", "மஞ்சள்", "வெள்ளை", "ஆரஞ்சு"];
    const luckyColor = colors[getSeededRandom(seed + "color") % colors.length];

    return {
      date: today,
      rasi: rasiName,
      prediction: PREDICTIONS[randIndex],
      luckyNumber: luckyNumber,
      luckyColor: luckyColor,
      globalAlert: globalInfo
    };
  },
  
  getAllRasis: () => RASIS
};
