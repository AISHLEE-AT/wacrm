import type { OfficialCourseSyllabus } from './officialGovernmentSyllabusRegistry';

const RAW_K12_DATA: Record<string, any> = {
  "school-lkg": {
    "id": "school-lkg",
    "title": "LKG",
    "tamilTitle": "எல்.கே.ஜி",
    "subjects": [
      {
        "id": "subj-lkg-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-lkg-tam-1",
            "title": "உயிர் எழுத்துகள்",
            "tamilTitle": "உயிர் எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-LKG-TAM-1-1",
                "title": "Vowels",
                "tamilTitle": "உயிர் எழுத்துகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-LKG-U1-N1",
                    "conceptCode": "TAM-LKG-U1-N1",
                    "name": "Vowels Introduction",
                    "tamilName": "உயிர் எழுத்துகள் அறிமுகம்",
                    "description": "Detailed study of Vowels Introduction",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-lkg-tam-2",
            "title": "மெய் எழுத்துகள்",
            "tamilTitle": "மெய் எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-LKG-TAM-2-1",
                "title": "Consonants",
                "tamilTitle": "மெய் எழுத்துகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-LKG-U2-N1",
                    "conceptCode": "TAM-LKG-U2-N1",
                    "name": "Consonants Intro",
                    "tamilName": "மெய் எழுத்துகள் அறிமுகம்",
                    "description": "Detailed study of Consonants Intro",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-lkg-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-lkg-eng-1",
            "title": "Alphabet",
            "tamilTitle": "ஆங்கில எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-LKG-ENG-1-1",
                "title": "A-Z",
                "tamilTitle": "A முதல் Z வரை",
                "nanoConcepts": [
                  {
                    "id": "ENG-LKG-U1-N1",
                    "conceptCode": "ENG-LKG-U1-N1",
                    "name": "Letters A-Z",
                    "tamilName": "A-Z எழுத்துகள்",
                    "description": "Detailed study of Letters A-Z",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-lkg-eng-2",
            "title": "Phonics",
            "tamilTitle": "ஒலியியல்",
            "microTopics": [
              {
                "id": "mt-LKG-ENG-2-1",
                "title": "Basic Phonics",
                "tamilTitle": "அடிப்படை ஒலியியல்",
                "nanoConcepts": [
                  {
                    "id": "ENG-LKG-U2-N1",
                    "conceptCode": "ENG-LKG-U2-N1",
                    "name": "Letter Sounds",
                    "tamilName": "எழுத்து ஒலிகள்",
                    "description": "Detailed study of Letter Sounds",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-lkg-num",
        "title": "Numbers",
        "tamilTitle": "எண்கள்",
        "chapters": [
          {
            "id": "chap-lkg-num-1",
            "title": "Numbers 1-50",
            "tamilTitle": "எண்கள் 1-50",
            "microTopics": [
              {
                "id": "mt-LKG-MAT-1-1",
                "title": "Counting",
                "tamilTitle": "எண்ணுதல்",
                "nanoConcepts": [
                  {
                    "id": "MAT-LKG-U1-N1",
                    "conceptCode": "MAT-LKG-U1-N1",
                    "name": "1-50 Counting",
                    "tamilName": "1-50 எண்ணுதல்",
                    "description": "Detailed study of 1-50 Counting",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-lkg-evs",
        "title": "EVS",
        "tamilTitle": "சுற்றுச்சூழல்",
        "chapters": [
          {
            "id": "chap-lkg-evs-1",
            "title": "My Body",
            "tamilTitle": "எனது உடல்",
            "microTopics": [
              {
                "id": "mt-LKG-EVS-1-1",
                "title": "Body Parts",
                "tamilTitle": "உடல் பாகங்கள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-LKG-U1-N1",
                    "conceptCode": "EVS-LKG-U1-N1",
                    "name": "Identify Parts",
                    "tamilName": "பாகங்களை அறிதல்",
                    "description": "Detailed study of Identify Parts",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-lkg-evs-2",
            "title": "Family",
            "tamilTitle": "குடும்பம்",
            "microTopics": [
              {
                "id": "mt-LKG-EVS-2-1",
                "title": "Family Members",
                "tamilTitle": "குடும்ப உறுப்பினர்கள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-LKG-U2-N1",
                    "conceptCode": "EVS-LKG-U2-N1",
                    "name": "Mother Father",
                    "tamilName": "அம்மா அப்பா",
                    "description": "Detailed study of Mother Father",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-lkg-evs-3",
            "title": "Food",
            "tamilTitle": "உணவு",
            "microTopics": [
              {
                "id": "mt-LKG-EVS-3-1",
                "title": "Healthy Food",
                "tamilTitle": "சத்தான உணவு",
                "nanoConcepts": [
                  {
                    "id": "EVS-LKG-U3-N1",
                    "conceptCode": "EVS-LKG-U3-N1",
                    "name": "Fruits & Veg",
                    "tamilName": "பழங்கள் காய்கறிகள்",
                    "description": "Detailed study of Fruits & Veg",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-ukg": {
    "id": "school-ukg",
    "title": "UKG",
    "tamilTitle": "யூ.கே.ஜி",
    "subjects": [
      {
        "id": "subj-ukg-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-ukg-tam-1",
            "title": "உயிர் எழுத்துகள்",
            "tamilTitle": "உயிர் எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-UKG-TAM-1-1",
                "title": "Vowels",
                "tamilTitle": "உயிர்",
                "nanoConcepts": [
                  {
                    "id": "TAM-UKG-U1-N1",
                    "conceptCode": "TAM-UKG-U1-N1",
                    "name": "Recall",
                    "tamilName": "நினைவு கூறுதல்",
                    "description": "Detailed study of Recall",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-ukg-tam-2",
            "title": "மெய் எழுத்துகள்",
            "tamilTitle": "மெய் எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-UKG-TAM-2-1",
                "title": "Consonants",
                "tamilTitle": "மெய்",
                "nanoConcepts": [
                  {
                    "id": "TAM-UKG-U2-N1",
                    "conceptCode": "TAM-UKG-U2-N1",
                    "name": "Recall",
                    "tamilName": "நினைவு கூறுதல்",
                    "description": "Detailed study of Recall",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-ukg-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-ukg-eng-1",
            "title": "Alphabet",
            "tamilTitle": "ஆங்கில எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-UKG-ENG-1-1",
                "title": "A-Z Words",
                "tamilTitle": "A-Z வார்த்தைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-UKG-U1-N1",
                    "conceptCode": "ENG-UKG-U1-N1",
                    "name": "Words",
                    "tamilName": "வார்த்தைகள்",
                    "description": "Detailed study of Words",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-ukg-eng-2",
            "title": "Phonics",
            "tamilTitle": "ஒலியியல்",
            "microTopics": [
              {
                "id": "mt-UKG-ENG-2-1",
                "title": "Blends",
                "tamilTitle": "கலவை ஒலிகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-UKG-U2-N1",
                    "conceptCode": "ENG-UKG-U2-N1",
                    "name": "Blends",
                    "tamilName": "கலவை ஒலிகள்",
                    "description": "Detailed study of Blends",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-ukg-num",
        "title": "Numbers",
        "tamilTitle": "எண்கள்",
        "chapters": [
          {
            "id": "chap-ukg-num-1",
            "title": "Numbers 1-100",
            "tamilTitle": "எண்கள் 1-100",
            "microTopics": [
              {
                "id": "mt-UKG-MAT-1-1",
                "title": "1-100 Counting",
                "tamilTitle": "1-100 எண்ணுதல்",
                "nanoConcepts": [
                  {
                    "id": "MAT-UKG-U1-N1",
                    "conceptCode": "MAT-UKG-U1-N1",
                    "name": "Count to 100",
                    "tamilName": "100 வரை எண்ணுதல்",
                    "description": "Detailed study of Count to 100",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-ukg-evs",
        "title": "EVS",
        "tamilTitle": "சுற்றுச்சூழல்",
        "chapters": [
          {
            "id": "chap-ukg-evs-1",
            "title": "My Body",
            "tamilTitle": "எனது உடல்",
            "microTopics": [
              {
                "id": "mt-UKG-EVS-1-1",
                "title": "Senses",
                "tamilTitle": "புலன்கள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-UKG-U1-N1",
                    "conceptCode": "EVS-UKG-U1-N1",
                    "name": "5 Senses",
                    "tamilName": "5 புலன்கள்",
                    "description": "Detailed study of 5 Senses",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-ukg-evs-2",
            "title": "Family",
            "tamilTitle": "குடும்பம்",
            "microTopics": [
              {
                "id": "mt-UKG-EVS-2-1",
                "title": "Roles",
                "tamilTitle": "பங்குகள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-UKG-U2-N1",
                    "conceptCode": "EVS-UKG-U2-N1",
                    "name": "Family Roles",
                    "tamilName": "குடும்ப பங்குகள்",
                    "description": "Detailed study of Family Roles",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-ukg-evs-3",
            "title": "Food",
            "tamilTitle": "உணவு",
            "microTopics": [
              {
                "id": "mt-UKG-EVS-3-1",
                "title": "Meals",
                "tamilTitle": "உணவு வேளைகள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-UKG-U3-N1",
                    "conceptCode": "EVS-UKG-U3-N1",
                    "name": "Meals of day",
                    "tamilName": "நாள் உணவுகள்",
                    "description": "Detailed study of Meals of day",
                    "questionType": "Oral",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-1": {
    "id": "school-std-1",
    "title": "1st Standard",
    "tamilTitle": "1-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-1-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-1-tam-1",
            "title": "உயிர்/மெய் எழுத்துகள்",
            "tamilTitle": "உயிர்/மெய் எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-STD1-TAM-1-1",
                "title": "Basics of உயிர்/மெய் எழுத்துகள்",
                "tamilTitle": "உயிர்/மெய் எழுத்துகள் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD1-U1-N1",
                    "conceptCode": "TAM-STD1-U1-N1",
                    "name": "Concept 1 of உயிர்/மெய் எழுத்துகள்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of உயிர்/மெய் எழுத்துகள்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD1-U1-N2",
                    "conceptCode": "TAM-STD1-U1-N2",
                    "name": "Concept 2 of உயிர்/மெய் எழுத்துகள்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of உயிர்/மெய் எழுத்துகள்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-1-tam-2",
            "title": "எளிய சொற்கள்",
            "tamilTitle": "எளிய சொற்கள்",
            "microTopics": [
              {
                "id": "mt-STD1-TAM-2-1",
                "title": "Basics of எளிய சொற்கள்",
                "tamilTitle": "எளிய சொற்கள் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD1-U2-N1",
                    "conceptCode": "TAM-STD1-U2-N1",
                    "name": "Concept 1 of எளிய சொற்கள்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of எளிய சொற்கள்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD1-U2-N2",
                    "conceptCode": "TAM-STD1-U2-N2",
                    "name": "Concept 2 of எளிய சொற்கள்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of எளிய சொற்கள்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-1-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-1-eng-1",
            "title": "Letters",
            "tamilTitle": "Letters",
            "microTopics": [
              {
                "id": "mt-STD1-ENG-1-1",
                "title": "Basics of Letters",
                "tamilTitle": "Letters அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD1-U1-N1",
                    "conceptCode": "ENG-STD1-U1-N1",
                    "name": "Concept 1 of Letters",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Letters",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD1-U1-N2",
                    "conceptCode": "ENG-STD1-U1-N2",
                    "name": "Concept 2 of Letters",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Letters",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-1-eng-2",
            "title": "Simple Words",
            "tamilTitle": "Simple Words",
            "microTopics": [
              {
                "id": "mt-STD1-ENG-2-1",
                "title": "Basics of Simple Words",
                "tamilTitle": "Simple Words அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD1-U2-N1",
                    "conceptCode": "ENG-STD1-U2-N1",
                    "name": "Concept 1 of Simple Words",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Simple Words",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD1-U2-N2",
                    "conceptCode": "ENG-STD1-U2-N2",
                    "name": "Concept 2 of Simple Words",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Simple Words",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-1-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-1-mat-1",
            "title": "Numbers 1-100",
            "tamilTitle": "Numbers 1-100",
            "microTopics": [
              {
                "id": "mt-STD1-MAT-1-1",
                "title": "Basics of Numbers 1-100",
                "tamilTitle": "Numbers 1-100 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD1-U1-N1",
                    "conceptCode": "MAT-STD1-U1-N1",
                    "name": "Concept 1 of Numbers 1-100",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Numbers 1-100",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD1-U1-N2",
                    "conceptCode": "MAT-STD1-U1-N2",
                    "name": "Concept 2 of Numbers 1-100",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Numbers 1-100",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-1-mat-2",
            "title": "Addition/Subtraction",
            "tamilTitle": "Addition/Subtraction",
            "microTopics": [
              {
                "id": "mt-STD1-MAT-2-1",
                "title": "Basics of Addition/Subtraction",
                "tamilTitle": "Addition/Subtraction அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD1-U2-N1",
                    "conceptCode": "MAT-STD1-U2-N1",
                    "name": "Concept 1 of Addition/Subtraction",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Addition/Subtraction",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD1-U2-N2",
                    "conceptCode": "MAT-STD1-U2-N2",
                    "name": "Concept 2 of Addition/Subtraction",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Addition/Subtraction",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-1-evs",
        "title": "EVS",
        "tamilTitle": "சுற்றுச்சூழல்",
        "chapters": [
          {
            "id": "chap-1-evs-1",
            "title": "Plants",
            "tamilTitle": "Plants",
            "microTopics": [
              {
                "id": "mt-STD1-EVS-1-1",
                "title": "Basics of Plants",
                "tamilTitle": "Plants அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-STD1-U1-N1",
                    "conceptCode": "EVS-STD1-U1-N1",
                    "name": "Concept 1 of Plants",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Plants",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "EVS-STD1-U1-N2",
                    "conceptCode": "EVS-STD1-U1-N2",
                    "name": "Concept 2 of Plants",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Plants",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-1-evs-2",
            "title": "Animals",
            "tamilTitle": "Animals",
            "microTopics": [
              {
                "id": "mt-STD1-EVS-2-1",
                "title": "Basics of Animals",
                "tamilTitle": "Animals அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-STD1-U2-N1",
                    "conceptCode": "EVS-STD1-U2-N1",
                    "name": "Concept 1 of Animals",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Animals",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "EVS-STD1-U2-N2",
                    "conceptCode": "EVS-STD1-U2-N2",
                    "name": "Concept 2 of Animals",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Animals",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-1-evs-3",
            "title": "My Home",
            "tamilTitle": "My Home",
            "microTopics": [
              {
                "id": "mt-STD1-EVS-3-1",
                "title": "Basics of My Home",
                "tamilTitle": "My Home அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-STD1-U3-N1",
                    "conceptCode": "EVS-STD1-U3-N1",
                    "name": "Concept 1 of My Home",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of My Home",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "EVS-STD1-U3-N2",
                    "conceptCode": "EVS-STD1-U3-N2",
                    "name": "Concept 2 of My Home",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of My Home",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-2": {
    "id": "school-std-2",
    "title": "2nd Standard",
    "tamilTitle": "2-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-2-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-2-tam-1",
            "title": "உயிர்மெய் எழுத்துகள்",
            "tamilTitle": "உயிர்மெய் எழுத்துகள்",
            "microTopics": [
              {
                "id": "mt-STD2-TAM-1-1",
                "title": "Basics of உயிர்மெய் எழுத்துகள்",
                "tamilTitle": "உயிர்மெய் எழுத்துகள் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD2-U1-N1",
                    "conceptCode": "TAM-STD2-U1-N1",
                    "name": "Concept 1 of உயிர்மெய் எழுத்துகள்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of உயிர்மெய் எழுத்துகள்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD2-U1-N2",
                    "conceptCode": "TAM-STD2-U1-N2",
                    "name": "Concept 2 of உயிர்மெய் எழுத்துகள்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of உயிர்மெய் எழுத்துகள்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-2-tam-2",
            "title": "எளிய வாக்கியங்கள்",
            "tamilTitle": "எளிய வாக்கியங்கள்",
            "microTopics": [
              {
                "id": "mt-STD2-TAM-2-1",
                "title": "Basics of எளிய வாக்கியங்கள்",
                "tamilTitle": "எளிய வாக்கியங்கள் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD2-U2-N1",
                    "conceptCode": "TAM-STD2-U2-N1",
                    "name": "Concept 1 of எளிய வாக்கியங்கள்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of எளிய வாக்கியங்கள்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD2-U2-N2",
                    "conceptCode": "TAM-STD2-U2-N2",
                    "name": "Concept 2 of எளிய வாக்கியங்கள்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of எளிய வாக்கியங்கள்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-2-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-2-eng-1",
            "title": "Sentences",
            "tamilTitle": "Sentences",
            "microTopics": [
              {
                "id": "mt-STD2-ENG-1-1",
                "title": "Basics of Sentences",
                "tamilTitle": "Sentences அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD2-U1-N1",
                    "conceptCode": "ENG-STD2-U1-N1",
                    "name": "Concept 1 of Sentences",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Sentences",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD2-U1-N2",
                    "conceptCode": "ENG-STD2-U1-N2",
                    "name": "Concept 2 of Sentences",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Sentences",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-2-eng-2",
            "title": "Grammar Intro",
            "tamilTitle": "Grammar Intro",
            "microTopics": [
              {
                "id": "mt-STD2-ENG-2-1",
                "title": "Basics of Grammar Intro",
                "tamilTitle": "Grammar Intro அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD2-U2-N1",
                    "conceptCode": "ENG-STD2-U2-N1",
                    "name": "Concept 1 of Grammar Intro",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Grammar Intro",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD2-U2-N2",
                    "conceptCode": "ENG-STD2-U2-N2",
                    "name": "Concept 2 of Grammar Intro",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Grammar Intro",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-2-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-2-mat-1",
            "title": "2-Digit Operations",
            "tamilTitle": "2-Digit Operations",
            "microTopics": [
              {
                "id": "mt-STD2-MAT-1-1",
                "title": "Basics of 2-Digit Operations",
                "tamilTitle": "2-Digit Operations அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD2-U1-N1",
                    "conceptCode": "MAT-STD2-U1-N1",
                    "name": "Concept 1 of 2-Digit Operations",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of 2-Digit Operations",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD2-U1-N2",
                    "conceptCode": "MAT-STD2-U1-N2",
                    "name": "Concept 2 of 2-Digit Operations",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of 2-Digit Operations",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-2-mat-2",
            "title": "Shapes",
            "tamilTitle": "Shapes",
            "microTopics": [
              {
                "id": "mt-STD2-MAT-2-1",
                "title": "Basics of Shapes",
                "tamilTitle": "Shapes அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD2-U2-N1",
                    "conceptCode": "MAT-STD2-U2-N1",
                    "name": "Concept 1 of Shapes",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Shapes",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD2-U2-N2",
                    "conceptCode": "MAT-STD2-U2-N2",
                    "name": "Concept 2 of Shapes",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Shapes",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-2-evs",
        "title": "EVS",
        "tamilTitle": "சுற்றுச்சூழல்",
        "chapters": [
          {
            "id": "chap-2-evs-1",
            "title": "Living/Non-Living",
            "tamilTitle": "Living/Non-Living",
            "microTopics": [
              {
                "id": "mt-STD2-EVS-1-1",
                "title": "Basics of Living/Non-Living",
                "tamilTitle": "Living/Non-Living அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "EVS-STD2-U1-N1",
                    "conceptCode": "EVS-STD2-U1-N1",
                    "name": "Concept 1 of Living/Non-Living",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Living/Non-Living",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "EVS-STD2-U1-N2",
                    "conceptCode": "EVS-STD2-U1-N2",
                    "name": "Concept 2 of Living/Non-Living",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Living/Non-Living",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-3": {
    "id": "school-std-3",
    "title": "3rd Standard",
    "tamilTitle": "3-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-3-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-3-tam-1",
            "title": "புணர்ச்சி அறிமுகம்",
            "tamilTitle": "புணர்ச்சி அறிமுகம்",
            "microTopics": [
              {
                "id": "mt-STD3-TAM-1-1",
                "title": "Basics of புணர்ச்சி அறிமுகம்",
                "tamilTitle": "புணர்ச்சி அறிமுகம் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD3-U1-N1",
                    "conceptCode": "TAM-STD3-U1-N1",
                    "name": "Concept 1 of புணர்ச்சி அறிமுகம்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of புணர்ச்சி அறிமுகம்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD3-U1-N2",
                    "conceptCode": "TAM-STD3-U1-N2",
                    "name": "Concept 2 of புணர்ச்சி அறிமுகம்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of புணர்ச்சி அறிமுகம்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-3-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-3-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD3-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD3-U1-N1",
                    "conceptCode": "ENG-STD3-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD3-U1-N2",
                    "conceptCode": "ENG-STD3-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-3-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD3-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD3-U2-N1",
                    "conceptCode": "ENG-STD3-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD3-U2-N2",
                    "conceptCode": "ENG-STD3-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-3-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-3-mat-1",
            "title": "Multiplication Tables",
            "tamilTitle": "Multiplication Tables",
            "microTopics": [
              {
                "id": "mt-STD3-MAT-1-1",
                "title": "Basics of Multiplication Tables",
                "tamilTitle": "Multiplication Tables அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD3-U1-N1",
                    "conceptCode": "MAT-STD3-U1-N1",
                    "name": "Concept 1 of Multiplication Tables",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Multiplication Tables",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD3-U1-N2",
                    "conceptCode": "MAT-STD3-U1-N2",
                    "name": "Concept 2 of Multiplication Tables",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Multiplication Tables",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-3-mat-2",
            "title": "Fractions Intro",
            "tamilTitle": "Fractions Intro",
            "microTopics": [
              {
                "id": "mt-STD3-MAT-2-1",
                "title": "Basics of Fractions Intro",
                "tamilTitle": "Fractions Intro அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD3-U2-N1",
                    "conceptCode": "MAT-STD3-U2-N1",
                    "name": "Concept 1 of Fractions Intro",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Fractions Intro",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD3-U2-N2",
                    "conceptCode": "MAT-STD3-U2-N2",
                    "name": "Concept 2 of Fractions Intro",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Fractions Intro",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-3-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-3-sci-1",
            "title": "Food/Nutrition",
            "tamilTitle": "Food/Nutrition",
            "microTopics": [
              {
                "id": "mt-STD3-SCI-1-1",
                "title": "Basics of Food/Nutrition",
                "tamilTitle": "Food/Nutrition அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD3-U1-N1",
                    "conceptCode": "SCI-STD3-U1-N1",
                    "name": "Concept 1 of Food/Nutrition",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Food/Nutrition",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD3-U1-N2",
                    "conceptCode": "SCI-STD3-U1-N2",
                    "name": "Concept 2 of Food/Nutrition",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Food/Nutrition",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-3-sci-2",
            "title": "Water",
            "tamilTitle": "Water",
            "microTopics": [
              {
                "id": "mt-STD3-SCI-2-1",
                "title": "Basics of Water",
                "tamilTitle": "Water அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD3-U2-N1",
                    "conceptCode": "SCI-STD3-U2-N1",
                    "name": "Concept 1 of Water",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Water",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD3-U2-N2",
                    "conceptCode": "SCI-STD3-U2-N2",
                    "name": "Concept 2 of Water",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Water",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-3-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-3-soc-1",
            "title": "Family/Society",
            "tamilTitle": "Family/Society",
            "microTopics": [
              {
                "id": "mt-STD3-SOC-1-1",
                "title": "Basics of Family/Society",
                "tamilTitle": "Family/Society அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD3-U1-N1",
                    "conceptCode": "SOC-STD3-U1-N1",
                    "name": "Concept 1 of Family/Society",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Family/Society",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD3-U1-N2",
                    "conceptCode": "SOC-STD3-U1-N2",
                    "name": "Concept 2 of Family/Society",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Family/Society",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-4": {
    "id": "school-std-4",
    "title": "4th Standard",
    "tamilTitle": "4-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-4-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-4-tam-1",
            "title": "பெயர்ச்சொல்",
            "tamilTitle": "பெயர்ச்சொல்",
            "microTopics": [
              {
                "id": "mt-STD4-TAM-1-1",
                "title": "Basics of பெயர்ச்சொல்",
                "tamilTitle": "பெயர்ச்சொல் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD4-U1-N1",
                    "conceptCode": "TAM-STD4-U1-N1",
                    "name": "Concept 1 of பெயர்ச்சொல்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of பெயர்ச்சொல்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD4-U1-N2",
                    "conceptCode": "TAM-STD4-U1-N2",
                    "name": "Concept 2 of பெயர்ச்சொல்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of பெயர்ச்சொல்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-4-tam-2",
            "title": "வினைச்சொல்",
            "tamilTitle": "வினைச்சொல்",
            "microTopics": [
              {
                "id": "mt-STD4-TAM-2-1",
                "title": "Basics of வினைச்சொல்",
                "tamilTitle": "வினைச்சொல் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD4-U2-N1",
                    "conceptCode": "TAM-STD4-U2-N1",
                    "name": "Concept 1 of வினைச்சொல்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of வினைச்சொல்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD4-U2-N2",
                    "conceptCode": "TAM-STD4-U2-N2",
                    "name": "Concept 2 of வினைச்சொல்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of வினைச்சொல்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-4-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-4-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD4-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD4-U1-N1",
                    "conceptCode": "ENG-STD4-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD4-U1-N2",
                    "conceptCode": "ENG-STD4-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-4-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD4-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD4-U2-N1",
                    "conceptCode": "ENG-STD4-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD4-U2-N2",
                    "conceptCode": "ENG-STD4-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-4-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-4-mat-1",
            "title": "Large Numbers",
            "tamilTitle": "Large Numbers",
            "microTopics": [
              {
                "id": "mt-STD4-MAT-1-1",
                "title": "Basics of Large Numbers",
                "tamilTitle": "Large Numbers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD4-U1-N1",
                    "conceptCode": "MAT-STD4-U1-N1",
                    "name": "Concept 1 of Large Numbers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Large Numbers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD4-U1-N2",
                    "conceptCode": "MAT-STD4-U1-N2",
                    "name": "Concept 2 of Large Numbers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Large Numbers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-4-mat-2",
            "title": "Division",
            "tamilTitle": "Division",
            "microTopics": [
              {
                "id": "mt-STD4-MAT-2-1",
                "title": "Basics of Division",
                "tamilTitle": "Division அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD4-U2-N1",
                    "conceptCode": "MAT-STD4-U2-N1",
                    "name": "Concept 1 of Division",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Division",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD4-U2-N2",
                    "conceptCode": "MAT-STD4-U2-N2",
                    "name": "Concept 2 of Division",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Division",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-4-mat-3",
            "title": "Geometry Basics",
            "tamilTitle": "Geometry Basics",
            "microTopics": [
              {
                "id": "mt-STD4-MAT-3-1",
                "title": "Basics of Geometry Basics",
                "tamilTitle": "Geometry Basics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD4-U3-N1",
                    "conceptCode": "MAT-STD4-U3-N1",
                    "name": "Concept 1 of Geometry Basics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geometry Basics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD4-U3-N2",
                    "conceptCode": "MAT-STD4-U3-N2",
                    "name": "Concept 2 of Geometry Basics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geometry Basics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-4-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-4-sci-1",
            "title": "Internal Organs",
            "tamilTitle": "Internal Organs",
            "microTopics": [
              {
                "id": "mt-STD4-SCI-1-1",
                "title": "Basics of Internal Organs",
                "tamilTitle": "Internal Organs அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD4-U1-N1",
                    "conceptCode": "SCI-STD4-U1-N1",
                    "name": "Concept 1 of Internal Organs",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Internal Organs",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD4-U1-N2",
                    "conceptCode": "SCI-STD4-U1-N2",
                    "name": "Concept 2 of Internal Organs",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Internal Organs",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-4-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-4-soc-1",
            "title": "Sangam Age",
            "tamilTitle": "Sangam Age",
            "microTopics": [
              {
                "id": "mt-STD4-SOC-1-1",
                "title": "Basics of Sangam Age",
                "tamilTitle": "Sangam Age அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD4-U1-N1",
                    "conceptCode": "SOC-STD4-U1-N1",
                    "name": "Concept 1 of Sangam Age",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Sangam Age",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD4-U1-N2",
                    "conceptCode": "SOC-STD4-U1-N2",
                    "name": "Concept 2 of Sangam Age",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Sangam Age",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-5": {
    "id": "school-std-5",
    "title": "5th Standard",
    "tamilTitle": "5-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-5-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-5-tam-1",
            "title": "இலக்கணம் அறிமுகம்",
            "tamilTitle": "இலக்கணம் அறிமுகம்",
            "microTopics": [
              {
                "id": "mt-STD5-TAM-1-1",
                "title": "Basics of இலக்கணம் அறிமுகம்",
                "tamilTitle": "இலக்கணம் அறிமுகம் அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD5-U1-N1",
                    "conceptCode": "TAM-STD5-U1-N1",
                    "name": "Concept 1 of இலக்கணம் அறிமுகம்",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இலக்கணம் அறிமுகம்",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD5-U1-N2",
                    "conceptCode": "TAM-STD5-U1-N2",
                    "name": "Concept 2 of இலக்கணம் அறிமுகம்",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இலக்கணம் அறிமுகம்",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-5-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-5-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD5-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD5-U1-N1",
                    "conceptCode": "ENG-STD5-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD5-U1-N2",
                    "conceptCode": "ENG-STD5-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-5-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD5-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD5-U2-N1",
                    "conceptCode": "ENG-STD5-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD5-U2-N2",
                    "conceptCode": "ENG-STD5-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-5-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-5-mat-1",
            "title": "LCM/HCF",
            "tamilTitle": "LCM/HCF",
            "microTopics": [
              {
                "id": "mt-STD5-MAT-1-1",
                "title": "Basics of LCM/HCF",
                "tamilTitle": "LCM/HCF அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD5-U1-N1",
                    "conceptCode": "MAT-STD5-U1-N1",
                    "name": "Concept 1 of LCM/HCF",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of LCM/HCF",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD5-U1-N2",
                    "conceptCode": "MAT-STD5-U1-N2",
                    "name": "Concept 2 of LCM/HCF",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of LCM/HCF",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-5-mat-2",
            "title": "Decimals",
            "tamilTitle": "Decimals",
            "microTopics": [
              {
                "id": "mt-STD5-MAT-2-1",
                "title": "Basics of Decimals",
                "tamilTitle": "Decimals அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD5-U2-N1",
                    "conceptCode": "MAT-STD5-U2-N1",
                    "name": "Concept 1 of Decimals",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Decimals",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD5-U2-N2",
                    "conceptCode": "MAT-STD5-U2-N2",
                    "name": "Concept 2 of Decimals",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Decimals",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-5-mat-3",
            "title": "Data Handling",
            "tamilTitle": "Data Handling",
            "microTopics": [
              {
                "id": "mt-STD5-MAT-3-1",
                "title": "Basics of Data Handling",
                "tamilTitle": "Data Handling அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD5-U3-N1",
                    "conceptCode": "MAT-STD5-U3-N1",
                    "name": "Concept 1 of Data Handling",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Data Handling",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD5-U3-N2",
                    "conceptCode": "MAT-STD5-U3-N2",
                    "name": "Concept 2 of Data Handling",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Data Handling",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-5-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-5-sci-1",
            "title": "Matter & Energy",
            "tamilTitle": "Matter & Energy",
            "microTopics": [
              {
                "id": "mt-STD5-SCI-1-1",
                "title": "Basics of Matter & Energy",
                "tamilTitle": "Matter & Energy அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD5-U1-N1",
                    "conceptCode": "SCI-STD5-U1-N1",
                    "name": "Concept 1 of Matter & Energy",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Matter & Energy",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD5-U1-N2",
                    "conceptCode": "SCI-STD5-U1-N2",
                    "name": "Concept 2 of Matter & Energy",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Matter & Energy",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-5-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-5-soc-1",
            "title": "Earth & Continents",
            "tamilTitle": "Earth & Continents",
            "microTopics": [
              {
                "id": "mt-STD5-SOC-1-1",
                "title": "Basics of Earth & Continents",
                "tamilTitle": "Earth & Continents அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD5-U1-N1",
                    "conceptCode": "SOC-STD5-U1-N1",
                    "name": "Concept 1 of Earth & Continents",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Earth & Continents",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD5-U1-N2",
                    "conceptCode": "SOC-STD5-U1-N2",
                    "name": "Concept 2 of Earth & Continents",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Earth & Continents",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-6": {
    "id": "school-std-6",
    "title": "6th Standard",
    "tamilTitle": "6-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-6-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-6-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD6-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD6-U1-N1",
                    "conceptCode": "TAM-STD6-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD6-U1-N2",
                    "conceptCode": "TAM-STD6-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD6-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD6-U2-N1",
                    "conceptCode": "TAM-STD6-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD6-U2-N2",
                    "conceptCode": "TAM-STD6-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-6-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-6-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD6-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD6-U1-N1",
                    "conceptCode": "ENG-STD6-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD6-U1-N2",
                    "conceptCode": "ENG-STD6-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD6-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD6-U2-N1",
                    "conceptCode": "ENG-STD6-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD6-U2-N2",
                    "conceptCode": "ENG-STD6-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-6-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-6-mat-1",
            "title": "Numbers",
            "tamilTitle": "Numbers",
            "microTopics": [
              {
                "id": "mt-STD6-MAT-1-1",
                "title": "Basics of Numbers",
                "tamilTitle": "Numbers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD6-U1-N1",
                    "conceptCode": "MAT-STD6-U1-N1",
                    "name": "Concept 1 of Numbers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Numbers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD6-U1-N2",
                    "conceptCode": "MAT-STD6-U1-N2",
                    "name": "Concept 2 of Numbers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Numbers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-mat-2",
            "title": "Integers",
            "tamilTitle": "Integers",
            "microTopics": [
              {
                "id": "mt-STD6-MAT-2-1",
                "title": "Basics of Integers",
                "tamilTitle": "Integers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD6-U2-N1",
                    "conceptCode": "MAT-STD6-U2-N1",
                    "name": "Concept 1 of Integers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Integers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD6-U2-N2",
                    "conceptCode": "MAT-STD6-U2-N2",
                    "name": "Concept 2 of Integers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Integers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-mat-3",
            "title": "Algebra Intro",
            "tamilTitle": "Algebra Intro",
            "microTopics": [
              {
                "id": "mt-STD6-MAT-3-1",
                "title": "Basics of Algebra Intro",
                "tamilTitle": "Algebra Intro அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD6-U3-N1",
                    "conceptCode": "MAT-STD6-U3-N1",
                    "name": "Concept 1 of Algebra Intro",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Algebra Intro",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD6-U3-N2",
                    "conceptCode": "MAT-STD6-U3-N2",
                    "name": "Concept 2 of Algebra Intro",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Algebra Intro",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-mat-4",
            "title": "Measurements",
            "tamilTitle": "Measurements",
            "microTopics": [
              {
                "id": "mt-STD6-MAT-4-1",
                "title": "Basics of Measurements",
                "tamilTitle": "Measurements அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD6-U4-N1",
                    "conceptCode": "MAT-STD6-U4-N1",
                    "name": "Concept 1 of Measurements",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Measurements",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD6-U4-N2",
                    "conceptCode": "MAT-STD6-U4-N2",
                    "name": "Concept 2 of Measurements",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Measurements",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-mat-5",
            "title": "Geometry",
            "tamilTitle": "Geometry",
            "microTopics": [
              {
                "id": "mt-STD6-MAT-5-1",
                "title": "Basics of Geometry",
                "tamilTitle": "Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD6-U5-N1",
                    "conceptCode": "MAT-STD6-U5-N1",
                    "name": "Concept 1 of Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD6-U5-N2",
                    "conceptCode": "MAT-STD6-U5-N2",
                    "name": "Concept 2 of Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-mat-6",
            "title": "Data Handling",
            "tamilTitle": "Data Handling",
            "microTopics": [
              {
                "id": "mt-STD6-MAT-6-1",
                "title": "Basics of Data Handling",
                "tamilTitle": "Data Handling அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD6-U6-N1",
                    "conceptCode": "MAT-STD6-U6-N1",
                    "name": "Concept 1 of Data Handling",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Data Handling",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD6-U6-N2",
                    "conceptCode": "MAT-STD6-U6-N2",
                    "name": "Concept 2 of Data Handling",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Data Handling",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-6-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-6-sci-1",
            "title": "Measurements",
            "tamilTitle": "Measurements",
            "microTopics": [
              {
                "id": "mt-STD6-SCI-1-1",
                "title": "Basics of Measurements",
                "tamilTitle": "Measurements அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD6-U1-N1",
                    "conceptCode": "SCI-STD6-U1-N1",
                    "name": "Concept 1 of Measurements",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Measurements",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD6-U1-N2",
                    "conceptCode": "SCI-STD6-U1-N2",
                    "name": "Concept 2 of Measurements",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Measurements",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-sci-2",
            "title": "Force",
            "tamilTitle": "Force",
            "microTopics": [
              {
                "id": "mt-STD6-SCI-2-1",
                "title": "Basics of Force",
                "tamilTitle": "Force அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD6-U2-N1",
                    "conceptCode": "SCI-STD6-U2-N1",
                    "name": "Concept 1 of Force",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Force",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD6-U2-N2",
                    "conceptCode": "SCI-STD6-U2-N2",
                    "name": "Concept 2 of Force",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Force",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-sci-3",
            "title": "Cell",
            "tamilTitle": "Cell",
            "microTopics": [
              {
                "id": "mt-STD6-SCI-3-1",
                "title": "Basics of Cell",
                "tamilTitle": "Cell அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD6-U3-N1",
                    "conceptCode": "SCI-STD6-U3-N1",
                    "name": "Concept 1 of Cell",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Cell",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD6-U3-N2",
                    "conceptCode": "SCI-STD6-U3-N2",
                    "name": "Concept 2 of Cell",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Cell",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-sci-4",
            "title": "Living World",
            "tamilTitle": "Living World",
            "microTopics": [
              {
                "id": "mt-STD6-SCI-4-1",
                "title": "Basics of Living World",
                "tamilTitle": "Living World அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD6-U4-N1",
                    "conceptCode": "SCI-STD6-U4-N1",
                    "name": "Concept 1 of Living World",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Living World",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD6-U4-N2",
                    "conceptCode": "SCI-STD6-U4-N2",
                    "name": "Concept 2 of Living World",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Living World",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-sci-5",
            "title": "Matter",
            "tamilTitle": "Matter",
            "microTopics": [
              {
                "id": "mt-STD6-SCI-5-1",
                "title": "Basics of Matter",
                "tamilTitle": "Matter அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD6-U5-N1",
                    "conceptCode": "SCI-STD6-U5-N1",
                    "name": "Concept 1 of Matter",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Matter",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD6-U5-N2",
                    "conceptCode": "SCI-STD6-U5-N2",
                    "name": "Concept 2 of Matter",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Matter",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-sci-6",
            "title": "Electricity",
            "tamilTitle": "Electricity",
            "microTopics": [
              {
                "id": "mt-STD6-SCI-6-1",
                "title": "Basics of Electricity",
                "tamilTitle": "Electricity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD6-U6-N1",
                    "conceptCode": "SCI-STD6-U6-N1",
                    "name": "Concept 1 of Electricity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electricity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD6-U6-N2",
                    "conceptCode": "SCI-STD6-U6-N2",
                    "name": "Concept 2 of Electricity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electricity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-6-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-6-soc-1",
            "title": "What is History?",
            "tamilTitle": "What is History?",
            "microTopics": [
              {
                "id": "mt-STD6-SOC-1-1",
                "title": "Basics of What is History?",
                "tamilTitle": "What is History? அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD6-U1-N1",
                    "conceptCode": "SOC-STD6-U1-N1",
                    "name": "Concept 1 of What is History?",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of What is History?",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD6-U1-N2",
                    "conceptCode": "SOC-STD6-U1-N2",
                    "name": "Concept 2 of What is History?",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of What is History?",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-soc-2",
            "title": "Indus Valley",
            "tamilTitle": "Indus Valley",
            "microTopics": [
              {
                "id": "mt-STD6-SOC-2-1",
                "title": "Basics of Indus Valley",
                "tamilTitle": "Indus Valley அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD6-U2-N1",
                    "conceptCode": "SOC-STD6-U2-N1",
                    "name": "Concept 1 of Indus Valley",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Indus Valley",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD6-U2-N2",
                    "conceptCode": "SOC-STD6-U2-N2",
                    "name": "Concept 2 of Indus Valley",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Indus Valley",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-soc-3",
            "title": "Asia",
            "tamilTitle": "Asia",
            "microTopics": [
              {
                "id": "mt-STD6-SOC-3-1",
                "title": "Basics of Asia",
                "tamilTitle": "Asia அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD6-U3-N1",
                    "conceptCode": "SOC-STD6-U3-N1",
                    "name": "Concept 1 of Asia",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Asia",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD6-U3-N2",
                    "conceptCode": "SOC-STD6-U3-N2",
                    "name": "Concept 2 of Asia",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Asia",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-6-soc-4",
            "title": "Maps",
            "tamilTitle": "Maps",
            "microTopics": [
              {
                "id": "mt-STD6-SOC-4-1",
                "title": "Basics of Maps",
                "tamilTitle": "Maps அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD6-U4-N1",
                    "conceptCode": "SOC-STD6-U4-N1",
                    "name": "Concept 1 of Maps",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Maps",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD6-U4-N2",
                    "conceptCode": "SOC-STD6-U4-N2",
                    "name": "Concept 2 of Maps",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Maps",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-7": {
    "id": "school-std-7",
    "title": "7th Standard",
    "tamilTitle": "7-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-7-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-7-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD7-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD7-U1-N1",
                    "conceptCode": "TAM-STD7-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD7-U1-N2",
                    "conceptCode": "TAM-STD7-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD7-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD7-U2-N1",
                    "conceptCode": "TAM-STD7-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD7-U2-N2",
                    "conceptCode": "TAM-STD7-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-7-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-7-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD7-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD7-U1-N1",
                    "conceptCode": "ENG-STD7-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD7-U1-N2",
                    "conceptCode": "ENG-STD7-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD7-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD7-U2-N1",
                    "conceptCode": "ENG-STD7-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD7-U2-N2",
                    "conceptCode": "ENG-STD7-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-7-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-7-mat-1",
            "title": "Number System",
            "tamilTitle": "Number System",
            "microTopics": [
              {
                "id": "mt-STD7-MAT-1-1",
                "title": "Basics of Number System",
                "tamilTitle": "Number System அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD7-U1-N1",
                    "conceptCode": "MAT-STD7-U1-N1",
                    "name": "Concept 1 of Number System",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Number System",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD7-U1-N2",
                    "conceptCode": "MAT-STD7-U1-N2",
                    "name": "Concept 2 of Number System",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Number System",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-mat-2",
            "title": "Percentage",
            "tamilTitle": "Percentage",
            "microTopics": [
              {
                "id": "mt-STD7-MAT-2-1",
                "title": "Basics of Percentage",
                "tamilTitle": "Percentage அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD7-U2-N1",
                    "conceptCode": "MAT-STD7-U2-N1",
                    "name": "Concept 1 of Percentage",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Percentage",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD7-U2-N2",
                    "conceptCode": "MAT-STD7-U2-N2",
                    "name": "Concept 2 of Percentage",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Percentage",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-mat-3",
            "title": "Algebra",
            "tamilTitle": "Algebra",
            "microTopics": [
              {
                "id": "mt-STD7-MAT-3-1",
                "title": "Basics of Algebra",
                "tamilTitle": "Algebra அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD7-U3-N1",
                    "conceptCode": "MAT-STD7-U3-N1",
                    "name": "Concept 1 of Algebra",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Algebra",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD7-U3-N2",
                    "conceptCode": "MAT-STD7-U3-N2",
                    "name": "Concept 2 of Algebra",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Algebra",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-mat-4",
            "title": "Direct/Inverse Proportion",
            "tamilTitle": "Direct/Inverse Proportion",
            "microTopics": [
              {
                "id": "mt-STD7-MAT-4-1",
                "title": "Basics of Direct/Inverse Proportion",
                "tamilTitle": "Direct/Inverse Proportion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD7-U4-N1",
                    "conceptCode": "MAT-STD7-U4-N1",
                    "name": "Concept 1 of Direct/Inverse Proportion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Direct/Inverse Proportion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD7-U4-N2",
                    "conceptCode": "MAT-STD7-U4-N2",
                    "name": "Concept 2 of Direct/Inverse Proportion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Direct/Inverse Proportion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-mat-5",
            "title": "Geometry",
            "tamilTitle": "Geometry",
            "microTopics": [
              {
                "id": "mt-STD7-MAT-5-1",
                "title": "Basics of Geometry",
                "tamilTitle": "Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD7-U5-N1",
                    "conceptCode": "MAT-STD7-U5-N1",
                    "name": "Concept 1 of Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD7-U5-N2",
                    "conceptCode": "MAT-STD7-U5-N2",
                    "name": "Concept 2 of Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-mat-6",
            "title": "Data Handling",
            "tamilTitle": "Data Handling",
            "microTopics": [
              {
                "id": "mt-STD7-MAT-6-1",
                "title": "Basics of Data Handling",
                "tamilTitle": "Data Handling அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD7-U6-N1",
                    "conceptCode": "MAT-STD7-U6-N1",
                    "name": "Concept 1 of Data Handling",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Data Handling",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD7-U6-N2",
                    "conceptCode": "MAT-STD7-U6-N2",
                    "name": "Concept 2 of Data Handling",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Data Handling",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-7-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-7-sci-1",
            "title": "Heat",
            "tamilTitle": "Heat",
            "microTopics": [
              {
                "id": "mt-STD7-SCI-1-1",
                "title": "Basics of Heat",
                "tamilTitle": "Heat அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD7-U1-N1",
                    "conceptCode": "SCI-STD7-U1-N1",
                    "name": "Concept 1 of Heat",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Heat",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD7-U1-N2",
                    "conceptCode": "SCI-STD7-U1-N2",
                    "name": "Concept 2 of Heat",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Heat",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-sci-2",
            "title": "Measurement",
            "tamilTitle": "Measurement",
            "microTopics": [
              {
                "id": "mt-STD7-SCI-2-1",
                "title": "Basics of Measurement",
                "tamilTitle": "Measurement அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD7-U2-N1",
                    "conceptCode": "SCI-STD7-U2-N1",
                    "name": "Concept 1 of Measurement",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Measurement",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD7-U2-N2",
                    "conceptCode": "SCI-STD7-U2-N2",
                    "name": "Concept 2 of Measurement",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Measurement",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-sci-3",
            "title": "Motion & Time",
            "tamilTitle": "Motion & Time",
            "microTopics": [
              {
                "id": "mt-STD7-SCI-3-1",
                "title": "Basics of Motion & Time",
                "tamilTitle": "Motion & Time அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD7-U3-N1",
                    "conceptCode": "SCI-STD7-U3-N1",
                    "name": "Concept 1 of Motion & Time",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Motion & Time",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD7-U3-N2",
                    "conceptCode": "SCI-STD7-U3-N2",
                    "name": "Concept 2 of Motion & Time",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Motion & Time",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-sci-4",
            "title": "Reproduction",
            "tamilTitle": "Reproduction",
            "microTopics": [
              {
                "id": "mt-STD7-SCI-4-1",
                "title": "Basics of Reproduction",
                "tamilTitle": "Reproduction அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD7-U4-N1",
                    "conceptCode": "SCI-STD7-U4-N1",
                    "name": "Concept 1 of Reproduction",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Reproduction",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD7-U4-N2",
                    "conceptCode": "SCI-STD7-U4-N2",
                    "name": "Concept 2 of Reproduction",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Reproduction",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-sci-5",
            "title": "Nutrition",
            "tamilTitle": "Nutrition",
            "microTopics": [
              {
                "id": "mt-STD7-SCI-5-1",
                "title": "Basics of Nutrition",
                "tamilTitle": "Nutrition அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD7-U5-N1",
                    "conceptCode": "SCI-STD7-U5-N1",
                    "name": "Concept 1 of Nutrition",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Nutrition",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD7-U5-N2",
                    "conceptCode": "SCI-STD7-U5-N2",
                    "name": "Concept 2 of Nutrition",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Nutrition",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-sci-6",
            "title": "Electric Current",
            "tamilTitle": "Electric Current",
            "microTopics": [
              {
                "id": "mt-STD7-SCI-6-1",
                "title": "Basics of Electric Current",
                "tamilTitle": "Electric Current அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD7-U6-N1",
                    "conceptCode": "SCI-STD7-U6-N1",
                    "name": "Concept 1 of Electric Current",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electric Current",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD7-U6-N2",
                    "conceptCode": "SCI-STD7-U6-N2",
                    "name": "Concept 2 of Electric Current",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electric Current",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-7-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-7-soc-1",
            "title": "Medieval India",
            "tamilTitle": "Medieval India",
            "microTopics": [
              {
                "id": "mt-STD7-SOC-1-1",
                "title": "Basics of Medieval India",
                "tamilTitle": "Medieval India அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD7-U1-N1",
                    "conceptCode": "SOC-STD7-U1-N1",
                    "name": "Concept 1 of Medieval India",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Medieval India",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD7-U1-N2",
                    "conceptCode": "SOC-STD7-U1-N2",
                    "name": "Concept 2 of Medieval India",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Medieval India",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-soc-2",
            "title": "Delhi Sultanate",
            "tamilTitle": "Delhi Sultanate",
            "microTopics": [
              {
                "id": "mt-STD7-SOC-2-1",
                "title": "Basics of Delhi Sultanate",
                "tamilTitle": "Delhi Sultanate அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD7-U2-N1",
                    "conceptCode": "SOC-STD7-U2-N1",
                    "name": "Concept 1 of Delhi Sultanate",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Delhi Sultanate",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD7-U2-N2",
                    "conceptCode": "SOC-STD7-U2-N2",
                    "name": "Concept 2 of Delhi Sultanate",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Delhi Sultanate",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-7-soc-3",
            "title": "Mughal Empire",
            "tamilTitle": "Mughal Empire",
            "microTopics": [
              {
                "id": "mt-STD7-SOC-3-1",
                "title": "Basics of Mughal Empire",
                "tamilTitle": "Mughal Empire அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD7-U3-N1",
                    "conceptCode": "SOC-STD7-U3-N1",
                    "name": "Concept 1 of Mughal Empire",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Mughal Empire",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD7-U3-N2",
                    "conceptCode": "SOC-STD7-U3-N2",
                    "name": "Concept 2 of Mughal Empire",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Mughal Empire",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-8": {
    "id": "school-std-8",
    "title": "8th Standard",
    "tamilTitle": "8-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-8-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-8-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD8-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD8-U1-N1",
                    "conceptCode": "TAM-STD8-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD8-U1-N2",
                    "conceptCode": "TAM-STD8-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD8-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD8-U2-N1",
                    "conceptCode": "TAM-STD8-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD8-U2-N2",
                    "conceptCode": "TAM-STD8-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-8-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-8-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD8-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD8-U1-N1",
                    "conceptCode": "ENG-STD8-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD8-U1-N2",
                    "conceptCode": "ENG-STD8-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD8-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD8-U2-N1",
                    "conceptCode": "ENG-STD8-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD8-U2-N2",
                    "conceptCode": "ENG-STD8-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-8-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-8-mat-1",
            "title": "Rational Numbers",
            "tamilTitle": "Rational Numbers",
            "microTopics": [
              {
                "id": "mt-STD8-MAT-1-1",
                "title": "Basics of Rational Numbers",
                "tamilTitle": "Rational Numbers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD8-U1-N1",
                    "conceptCode": "MAT-STD8-U1-N1",
                    "name": "Concept 1 of Rational Numbers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Rational Numbers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD8-U1-N2",
                    "conceptCode": "MAT-STD8-U1-N2",
                    "name": "Concept 2 of Rational Numbers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Rational Numbers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-mat-2",
            "title": "Measurements",
            "tamilTitle": "Measurements",
            "microTopics": [
              {
                "id": "mt-STD8-MAT-2-1",
                "title": "Basics of Measurements",
                "tamilTitle": "Measurements அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD8-U2-N1",
                    "conceptCode": "MAT-STD8-U2-N1",
                    "name": "Concept 1 of Measurements",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Measurements",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD8-U2-N2",
                    "conceptCode": "MAT-STD8-U2-N2",
                    "name": "Concept 2 of Measurements",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Measurements",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-mat-3",
            "title": "Algebra",
            "tamilTitle": "Algebra",
            "microTopics": [
              {
                "id": "mt-STD8-MAT-3-1",
                "title": "Basics of Algebra",
                "tamilTitle": "Algebra அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD8-U3-N1",
                    "conceptCode": "MAT-STD8-U3-N1",
                    "name": "Concept 1 of Algebra",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Algebra",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD8-U3-N2",
                    "conceptCode": "MAT-STD8-U3-N2",
                    "name": "Concept 2 of Algebra",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Algebra",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-mat-4",
            "title": "Geometry",
            "tamilTitle": "Geometry",
            "microTopics": [
              {
                "id": "mt-STD8-MAT-4-1",
                "title": "Basics of Geometry",
                "tamilTitle": "Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD8-U4-N1",
                    "conceptCode": "MAT-STD8-U4-N1",
                    "name": "Concept 1 of Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD8-U4-N2",
                    "conceptCode": "MAT-STD8-U4-N2",
                    "name": "Concept 2 of Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-mat-5",
            "title": "Data Handling",
            "tamilTitle": "Data Handling",
            "microTopics": [
              {
                "id": "mt-STD8-MAT-5-1",
                "title": "Basics of Data Handling",
                "tamilTitle": "Data Handling அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD8-U5-N1",
                    "conceptCode": "MAT-STD8-U5-N1",
                    "name": "Concept 1 of Data Handling",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Data Handling",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD8-U5-N2",
                    "conceptCode": "MAT-STD8-U5-N2",
                    "name": "Concept 2 of Data Handling",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Data Handling",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-mat-6",
            "title": "Graph",
            "tamilTitle": "Graph",
            "microTopics": [
              {
                "id": "mt-STD8-MAT-6-1",
                "title": "Basics of Graph",
                "tamilTitle": "Graph அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD8-U6-N1",
                    "conceptCode": "MAT-STD8-U6-N1",
                    "name": "Concept 1 of Graph",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Graph",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD8-U6-N2",
                    "conceptCode": "MAT-STD8-U6-N2",
                    "name": "Concept 2 of Graph",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Graph",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-8-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-8-sci-1",
            "title": "Measurement",
            "tamilTitle": "Measurement",
            "microTopics": [
              {
                "id": "mt-STD8-SCI-1-1",
                "title": "Basics of Measurement",
                "tamilTitle": "Measurement அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD8-U1-N1",
                    "conceptCode": "SCI-STD8-U1-N1",
                    "name": "Concept 1 of Measurement",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Measurement",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD8-U1-N2",
                    "conceptCode": "SCI-STD8-U1-N2",
                    "name": "Concept 2 of Measurement",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Measurement",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-sci-2",
            "title": "Force",
            "tamilTitle": "Force",
            "microTopics": [
              {
                "id": "mt-STD8-SCI-2-1",
                "title": "Basics of Force",
                "tamilTitle": "Force அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD8-U2-N1",
                    "conceptCode": "SCI-STD8-U2-N1",
                    "name": "Concept 1 of Force",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Force",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD8-U2-N2",
                    "conceptCode": "SCI-STD8-U2-N2",
                    "name": "Concept 2 of Force",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Force",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-sci-3",
            "title": "Universe",
            "tamilTitle": "Universe",
            "microTopics": [
              {
                "id": "mt-STD8-SCI-3-1",
                "title": "Basics of Universe",
                "tamilTitle": "Universe அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD8-U3-N1",
                    "conceptCode": "SCI-STD8-U3-N1",
                    "name": "Concept 1 of Universe",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Universe",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD8-U3-N2",
                    "conceptCode": "SCI-STD8-U3-N2",
                    "name": "Concept 2 of Universe",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Universe",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-sci-4",
            "title": "Elements & Compounds",
            "tamilTitle": "Elements & Compounds",
            "microTopics": [
              {
                "id": "mt-STD8-SCI-4-1",
                "title": "Basics of Elements & Compounds",
                "tamilTitle": "Elements & Compounds அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD8-U4-N1",
                    "conceptCode": "SCI-STD8-U4-N1",
                    "name": "Concept 1 of Elements & Compounds",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Elements & Compounds",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD8-U4-N2",
                    "conceptCode": "SCI-STD8-U4-N2",
                    "name": "Concept 2 of Elements & Compounds",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Elements & Compounds",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-sci-5",
            "title": "Cell Biology",
            "tamilTitle": "Cell Biology",
            "microTopics": [
              {
                "id": "mt-STD8-SCI-5-1",
                "title": "Basics of Cell Biology",
                "tamilTitle": "Cell Biology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD8-U5-N1",
                    "conceptCode": "SCI-STD8-U5-N1",
                    "name": "Concept 1 of Cell Biology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Cell Biology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD8-U5-N2",
                    "conceptCode": "SCI-STD8-U5-N2",
                    "name": "Concept 2 of Cell Biology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Cell Biology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-sci-6",
            "title": "Plant Kingdom",
            "tamilTitle": "Plant Kingdom",
            "microTopics": [
              {
                "id": "mt-STD8-SCI-6-1",
                "title": "Basics of Plant Kingdom",
                "tamilTitle": "Plant Kingdom அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD8-U6-N1",
                    "conceptCode": "SCI-STD8-U6-N1",
                    "name": "Concept 1 of Plant Kingdom",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Plant Kingdom",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD8-U6-N2",
                    "conceptCode": "SCI-STD8-U6-N2",
                    "name": "Concept 2 of Plant Kingdom",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Plant Kingdom",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-8-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-8-soc-1",
            "title": "British Rule",
            "tamilTitle": "British Rule",
            "microTopics": [
              {
                "id": "mt-STD8-SOC-1-1",
                "title": "Basics of British Rule",
                "tamilTitle": "British Rule அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD8-U1-N1",
                    "conceptCode": "SOC-STD8-U1-N1",
                    "name": "Concept 1 of British Rule",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of British Rule",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD8-U1-N2",
                    "conceptCode": "SOC-STD8-U1-N2",
                    "name": "Concept 2 of British Rule",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of British Rule",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-soc-2",
            "title": "Advent of Europeans",
            "tamilTitle": "Advent of Europeans",
            "microTopics": [
              {
                "id": "mt-STD8-SOC-2-1",
                "title": "Basics of Advent of Europeans",
                "tamilTitle": "Advent of Europeans அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD8-U2-N1",
                    "conceptCode": "SOC-STD8-U2-N1",
                    "name": "Concept 1 of Advent of Europeans",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Advent of Europeans",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD8-U2-N2",
                    "conceptCode": "SOC-STD8-U2-N2",
                    "name": "Concept 2 of Advent of Europeans",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Advent of Europeans",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-8-soc-3",
            "title": "Revolt 1857",
            "tamilTitle": "Revolt 1857",
            "microTopics": [
              {
                "id": "mt-STD8-SOC-3-1",
                "title": "Basics of Revolt 1857",
                "tamilTitle": "Revolt 1857 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD8-U3-N1",
                    "conceptCode": "SOC-STD8-U3-N1",
                    "name": "Concept 1 of Revolt 1857",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Revolt 1857",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD8-U3-N2",
                    "conceptCode": "SOC-STD8-U3-N2",
                    "name": "Concept 2 of Revolt 1857",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Revolt 1857",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-9": {
    "id": "school-std-9",
    "title": "9th Standard",
    "tamilTitle": "9-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-9-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-9-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD9-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD9-U1-N1",
                    "conceptCode": "TAM-STD9-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD9-U1-N2",
                    "conceptCode": "TAM-STD9-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD9-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD9-U2-N1",
                    "conceptCode": "TAM-STD9-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD9-U2-N2",
                    "conceptCode": "TAM-STD9-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-9-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-9-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD9-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD9-U1-N1",
                    "conceptCode": "ENG-STD9-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD9-U1-N2",
                    "conceptCode": "ENG-STD9-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD9-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD9-U2-N1",
                    "conceptCode": "ENG-STD9-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD9-U2-N2",
                    "conceptCode": "ENG-STD9-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-9-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-9-mat-1",
            "title": "Set Language",
            "tamilTitle": "Set Language",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-1-1",
                "title": "Basics of Set Language",
                "tamilTitle": "Set Language அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U1-N1",
                    "conceptCode": "MAT-STD9-U1-N1",
                    "name": "Concept 1 of Set Language",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Set Language",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U1-N2",
                    "conceptCode": "MAT-STD9-U1-N2",
                    "name": "Concept 2 of Set Language",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Set Language",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-2",
            "title": "Real Numbers",
            "tamilTitle": "Real Numbers",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-2-1",
                "title": "Basics of Real Numbers",
                "tamilTitle": "Real Numbers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U2-N1",
                    "conceptCode": "MAT-STD9-U2-N1",
                    "name": "Concept 1 of Real Numbers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Real Numbers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U2-N2",
                    "conceptCode": "MAT-STD9-U2-N2",
                    "name": "Concept 2 of Real Numbers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Real Numbers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-3",
            "title": "Algebra",
            "tamilTitle": "Algebra",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-3-1",
                "title": "Basics of Algebra",
                "tamilTitle": "Algebra அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U3-N1",
                    "conceptCode": "MAT-STD9-U3-N1",
                    "name": "Concept 1 of Algebra",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Algebra",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U3-N2",
                    "conceptCode": "MAT-STD9-U3-N2",
                    "name": "Concept 2 of Algebra",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Algebra",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-4",
            "title": "Geometry",
            "tamilTitle": "Geometry",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-4-1",
                "title": "Basics of Geometry",
                "tamilTitle": "Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U4-N1",
                    "conceptCode": "MAT-STD9-U4-N1",
                    "name": "Concept 1 of Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U4-N2",
                    "conceptCode": "MAT-STD9-U4-N2",
                    "name": "Concept 2 of Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-5",
            "title": "Coordinate Geometry",
            "tamilTitle": "Coordinate Geometry",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-5-1",
                "title": "Basics of Coordinate Geometry",
                "tamilTitle": "Coordinate Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U5-N1",
                    "conceptCode": "MAT-STD9-U5-N1",
                    "name": "Concept 1 of Coordinate Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Coordinate Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U5-N2",
                    "conceptCode": "MAT-STD9-U5-N2",
                    "name": "Concept 2 of Coordinate Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Coordinate Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-6",
            "title": "Trigonometry",
            "tamilTitle": "Trigonometry",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-6-1",
                "title": "Basics of Trigonometry",
                "tamilTitle": "Trigonometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U6-N1",
                    "conceptCode": "MAT-STD9-U6-N1",
                    "name": "Concept 1 of Trigonometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Trigonometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U6-N2",
                    "conceptCode": "MAT-STD9-U6-N2",
                    "name": "Concept 2 of Trigonometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Trigonometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-7",
            "title": "Statistics",
            "tamilTitle": "Statistics",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-7-1",
                "title": "Basics of Statistics",
                "tamilTitle": "Statistics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U7-N1",
                    "conceptCode": "MAT-STD9-U7-N1",
                    "name": "Concept 1 of Statistics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Statistics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U7-N2",
                    "conceptCode": "MAT-STD9-U7-N2",
                    "name": "Concept 2 of Statistics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Statistics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-mat-8",
            "title": "Probability",
            "tamilTitle": "Probability",
            "microTopics": [
              {
                "id": "mt-STD9-MAT-8-1",
                "title": "Basics of Probability",
                "tamilTitle": "Probability அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD9-U8-N1",
                    "conceptCode": "MAT-STD9-U8-N1",
                    "name": "Concept 1 of Probability",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Probability",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD9-U8-N2",
                    "conceptCode": "MAT-STD9-U8-N2",
                    "name": "Concept 2 of Probability",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Probability",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-9-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-9-sci-1",
            "title": "Measurement",
            "tamilTitle": "Measurement",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-1-1",
                "title": "Basics of Measurement",
                "tamilTitle": "Measurement அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U1-N1",
                    "conceptCode": "SCI-STD9-U1-N1",
                    "name": "Concept 1 of Measurement",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Measurement",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U1-N2",
                    "conceptCode": "SCI-STD9-U1-N2",
                    "name": "Concept 2 of Measurement",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Measurement",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-2",
            "title": "Motion",
            "tamilTitle": "Motion",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-2-1",
                "title": "Basics of Motion",
                "tamilTitle": "Motion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U2-N1",
                    "conceptCode": "SCI-STD9-U2-N1",
                    "name": "Concept 1 of Motion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Motion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U2-N2",
                    "conceptCode": "SCI-STD9-U2-N2",
                    "name": "Concept 2 of Motion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Motion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-3",
            "title": "Fluids",
            "tamilTitle": "Fluids",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-3-1",
                "title": "Basics of Fluids",
                "tamilTitle": "Fluids அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U3-N1",
                    "conceptCode": "SCI-STD9-U3-N1",
                    "name": "Concept 1 of Fluids",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Fluids",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U3-N2",
                    "conceptCode": "SCI-STD9-U3-N2",
                    "name": "Concept 2 of Fluids",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Fluids",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-4",
            "title": "Electric Charge",
            "tamilTitle": "Electric Charge",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-4-1",
                "title": "Basics of Electric Charge",
                "tamilTitle": "Electric Charge அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U4-N1",
                    "conceptCode": "SCI-STD9-U4-N1",
                    "name": "Concept 1 of Electric Charge",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electric Charge",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U4-N2",
                    "conceptCode": "SCI-STD9-U4-N2",
                    "name": "Concept 2 of Electric Charge",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electric Charge",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-5",
            "title": "Magnetism",
            "tamilTitle": "Magnetism",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-5-1",
                "title": "Basics of Magnetism",
                "tamilTitle": "Magnetism அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U5-N1",
                    "conceptCode": "SCI-STD9-U5-N1",
                    "name": "Concept 1 of Magnetism",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Magnetism",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U5-N2",
                    "conceptCode": "SCI-STD9-U5-N2",
                    "name": "Concept 2 of Magnetism",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Magnetism",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-6",
            "title": "Chemical Reactions",
            "tamilTitle": "Chemical Reactions",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-6-1",
                "title": "Basics of Chemical Reactions",
                "tamilTitle": "Chemical Reactions அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U6-N1",
                    "conceptCode": "SCI-STD9-U6-N1",
                    "name": "Concept 1 of Chemical Reactions",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Reactions",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U6-N2",
                    "conceptCode": "SCI-STD9-U6-N2",
                    "name": "Concept 2 of Chemical Reactions",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Reactions",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-7",
            "title": "Atoms",
            "tamilTitle": "Atoms",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-7-1",
                "title": "Basics of Atoms",
                "tamilTitle": "Atoms அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U7-N1",
                    "conceptCode": "SCI-STD9-U7-N1",
                    "name": "Concept 1 of Atoms",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Atoms",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U7-N2",
                    "conceptCode": "SCI-STD9-U7-N2",
                    "name": "Concept 2 of Atoms",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Atoms",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-8",
            "title": "Periodic Table",
            "tamilTitle": "Periodic Table",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-8-1",
                "title": "Basics of Periodic Table",
                "tamilTitle": "Periodic Table அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U8-N1",
                    "conceptCode": "SCI-STD9-U8-N1",
                    "name": "Concept 1 of Periodic Table",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Periodic Table",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U8-N2",
                    "conceptCode": "SCI-STD9-U8-N2",
                    "name": "Concept 2 of Periodic Table",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Periodic Table",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-9",
            "title": "Living World",
            "tamilTitle": "Living World",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-9-1",
                "title": "Basics of Living World",
                "tamilTitle": "Living World அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U9-N1",
                    "conceptCode": "SCI-STD9-U9-N1",
                    "name": "Concept 1 of Living World",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Living World",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U9-N2",
                    "conceptCode": "SCI-STD9-U9-N2",
                    "name": "Concept 2 of Living World",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Living World",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-10",
            "title": "Organisation of Life",
            "tamilTitle": "Organisation of Life",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-10-1",
                "title": "Basics of Organisation of Life",
                "tamilTitle": "Organisation of Life அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U10-N1",
                    "conceptCode": "SCI-STD9-U10-N1",
                    "name": "Concept 1 of Organisation of Life",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Organisation of Life",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U10-N2",
                    "conceptCode": "SCI-STD9-U10-N2",
                    "name": "Concept 2 of Organisation of Life",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Organisation of Life",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-sci-11",
            "title": "Tissues",
            "tamilTitle": "Tissues",
            "microTopics": [
              {
                "id": "mt-STD9-SCI-11-1",
                "title": "Basics of Tissues",
                "tamilTitle": "Tissues அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD9-U11-N1",
                    "conceptCode": "SCI-STD9-U11-N1",
                    "name": "Concept 1 of Tissues",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Tissues",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD9-U11-N2",
                    "conceptCode": "SCI-STD9-U11-N2",
                    "name": "Concept 2 of Tissues",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Tissues",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-9-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-9-soc-1",
            "title": "Evolution of Humans",
            "tamilTitle": "Evolution of Humans",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-1-1",
                "title": "Basics of Evolution of Humans",
                "tamilTitle": "Evolution of Humans அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U1-N1",
                    "conceptCode": "SOC-STD9-U1-N1",
                    "name": "Concept 1 of Evolution of Humans",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Evolution of Humans",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U1-N2",
                    "conceptCode": "SOC-STD9-U1-N2",
                    "name": "Concept 2 of Evolution of Humans",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Evolution of Humans",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-2",
            "title": "Ancient Civilisations",
            "tamilTitle": "Ancient Civilisations",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-2-1",
                "title": "Basics of Ancient Civilisations",
                "tamilTitle": "Ancient Civilisations அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U2-N1",
                    "conceptCode": "SOC-STD9-U2-N1",
                    "name": "Concept 1 of Ancient Civilisations",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Ancient Civilisations",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U2-N2",
                    "conceptCode": "SOC-STD9-U2-N2",
                    "name": "Concept 2 of Ancient Civilisations",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Ancient Civilisations",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-3",
            "title": "Medieval India",
            "tamilTitle": "Medieval India",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-3-1",
                "title": "Basics of Medieval India",
                "tamilTitle": "Medieval India அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U3-N1",
                    "conceptCode": "SOC-STD9-U3-N1",
                    "name": "Concept 1 of Medieval India",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Medieval India",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U3-N2",
                    "conceptCode": "SOC-STD9-U3-N2",
                    "name": "Concept 2 of Medieval India",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Medieval India",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-4",
            "title": "Modern Age",
            "tamilTitle": "Modern Age",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-4-1",
                "title": "Basics of Modern Age",
                "tamilTitle": "Modern Age அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U4-N1",
                    "conceptCode": "SOC-STD9-U4-N1",
                    "name": "Concept 1 of Modern Age",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Modern Age",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U4-N2",
                    "conceptCode": "SOC-STD9-U4-N2",
                    "name": "Concept 2 of Modern Age",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Modern Age",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-5",
            "title": "Geography of India",
            "tamilTitle": "Geography of India",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-5-1",
                "title": "Basics of Geography of India",
                "tamilTitle": "Geography of India அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U5-N1",
                    "conceptCode": "SOC-STD9-U5-N1",
                    "name": "Concept 1 of Geography of India",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geography of India",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U5-N2",
                    "conceptCode": "SOC-STD9-U5-N2",
                    "name": "Concept 2 of Geography of India",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geography of India",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-6",
            "title": "TN Geography",
            "tamilTitle": "TN Geography",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-6-1",
                "title": "Basics of TN Geography",
                "tamilTitle": "TN Geography அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U6-N1",
                    "conceptCode": "SOC-STD9-U6-N1",
                    "name": "Concept 1 of TN Geography",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of TN Geography",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U6-N2",
                    "conceptCode": "SOC-STD9-U6-N2",
                    "name": "Concept 2 of TN Geography",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of TN Geography",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-7",
            "title": "Indian Constitution",
            "tamilTitle": "Indian Constitution",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-7-1",
                "title": "Basics of Indian Constitution",
                "tamilTitle": "Indian Constitution அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U7-N1",
                    "conceptCode": "SOC-STD9-U7-N1",
                    "name": "Concept 1 of Indian Constitution",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Indian Constitution",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U7-N2",
                    "conceptCode": "SOC-STD9-U7-N2",
                    "name": "Concept 2 of Indian Constitution",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Indian Constitution",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-8",
            "title": "Elections",
            "tamilTitle": "Elections",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-8-1",
                "title": "Basics of Elections",
                "tamilTitle": "Elections அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U8-N1",
                    "conceptCode": "SOC-STD9-U8-N1",
                    "name": "Concept 1 of Elections",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Elections",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U8-N2",
                    "conceptCode": "SOC-STD9-U8-N2",
                    "name": "Concept 2 of Elections",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Elections",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-9-soc-9",
            "title": "Disaster Management",
            "tamilTitle": "Disaster Management",
            "microTopics": [
              {
                "id": "mt-STD9-SOC-9-1",
                "title": "Basics of Disaster Management",
                "tamilTitle": "Disaster Management அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD9-U9-N1",
                    "conceptCode": "SOC-STD9-U9-N1",
                    "name": "Concept 1 of Disaster Management",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Disaster Management",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD9-U9-N2",
                    "conceptCode": "SOC-STD9-U9-N2",
                    "name": "Concept 2 of Disaster Management",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Disaster Management",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-10": {
    "id": "school-std-10",
    "title": "10th Standard (SSLC)",
    "tamilTitle": "10-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-10-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-10-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U1-N1",
                    "conceptCode": "TAM-STD10-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U1-N2",
                    "conceptCode": "TAM-STD10-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U2-N1",
                    "conceptCode": "TAM-STD10-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U2-N2",
                    "conceptCode": "TAM-STD10-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-3",
            "title": "இயல் 3",
            "tamilTitle": "இயல் 3",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-3-1",
                "title": "Basics of இயல் 3",
                "tamilTitle": "இயல் 3 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U3-N1",
                    "conceptCode": "TAM-STD10-U3-N1",
                    "name": "Concept 1 of இயல் 3",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 3",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U3-N2",
                    "conceptCode": "TAM-STD10-U3-N2",
                    "name": "Concept 2 of இயல் 3",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 3",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-4",
            "title": "இயல் 4",
            "tamilTitle": "இயல் 4",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-4-1",
                "title": "Basics of இயல் 4",
                "tamilTitle": "இயல் 4 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U4-N1",
                    "conceptCode": "TAM-STD10-U4-N1",
                    "name": "Concept 1 of இயல் 4",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 4",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U4-N2",
                    "conceptCode": "TAM-STD10-U4-N2",
                    "name": "Concept 2 of இயல் 4",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 4",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-5",
            "title": "இயல் 5",
            "tamilTitle": "இயல் 5",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-5-1",
                "title": "Basics of இயல் 5",
                "tamilTitle": "இயல் 5 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U5-N1",
                    "conceptCode": "TAM-STD10-U5-N1",
                    "name": "Concept 1 of இயல் 5",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 5",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U5-N2",
                    "conceptCode": "TAM-STD10-U5-N2",
                    "name": "Concept 2 of இயல் 5",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 5",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-6",
            "title": "இயல் 6",
            "tamilTitle": "இயல் 6",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-6-1",
                "title": "Basics of இயல் 6",
                "tamilTitle": "இயல் 6 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U6-N1",
                    "conceptCode": "TAM-STD10-U6-N1",
                    "name": "Concept 1 of இயல் 6",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 6",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U6-N2",
                    "conceptCode": "TAM-STD10-U6-N2",
                    "name": "Concept 2 of இயல் 6",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 6",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-7",
            "title": "இயல் 7",
            "tamilTitle": "இயல் 7",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-7-1",
                "title": "Basics of இயல் 7",
                "tamilTitle": "இயல் 7 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U7-N1",
                    "conceptCode": "TAM-STD10-U7-N1",
                    "name": "Concept 1 of இயல் 7",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 7",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U7-N2",
                    "conceptCode": "TAM-STD10-U7-N2",
                    "name": "Concept 2 of இயல் 7",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 7",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-8",
            "title": "இயல் 8",
            "tamilTitle": "இயல் 8",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-8-1",
                "title": "Basics of இயல் 8",
                "tamilTitle": "இயல் 8 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U8-N1",
                    "conceptCode": "TAM-STD10-U8-N1",
                    "name": "Concept 1 of இயல் 8",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 8",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U8-N2",
                    "conceptCode": "TAM-STD10-U8-N2",
                    "name": "Concept 2 of இயல் 8",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 8",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-tam-9",
            "title": "இயல் 9",
            "tamilTitle": "இயல் 9",
            "microTopics": [
              {
                "id": "mt-STD10-TAM-9-1",
                "title": "Basics of இயல் 9",
                "tamilTitle": "இயல் 9 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD10-U9-N1",
                    "conceptCode": "TAM-STD10-U9-N1",
                    "name": "Concept 1 of இயல் 9",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 9",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD10-U9-N2",
                    "conceptCode": "TAM-STD10-U9-N2",
                    "name": "Concept 2 of இயல் 9",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 9",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-10-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-10-eng-1",
            "title": "Unit 1",
            "tamilTitle": "Unit 1",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-1-1",
                "title": "Basics of Unit 1",
                "tamilTitle": "Unit 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U1-N1",
                    "conceptCode": "ENG-STD10-U1-N1",
                    "name": "Concept 1 of Unit 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U1-N2",
                    "conceptCode": "ENG-STD10-U1-N2",
                    "name": "Concept 2 of Unit 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-eng-2",
            "title": "Unit 2",
            "tamilTitle": "Unit 2",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-2-1",
                "title": "Basics of Unit 2",
                "tamilTitle": "Unit 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U2-N1",
                    "conceptCode": "ENG-STD10-U2-N1",
                    "name": "Concept 1 of Unit 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U2-N2",
                    "conceptCode": "ENG-STD10-U2-N2",
                    "name": "Concept 2 of Unit 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-eng-3",
            "title": "Unit 3",
            "tamilTitle": "Unit 3",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-3-1",
                "title": "Basics of Unit 3",
                "tamilTitle": "Unit 3 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U3-N1",
                    "conceptCode": "ENG-STD10-U3-N1",
                    "name": "Concept 1 of Unit 3",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 3",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U3-N2",
                    "conceptCode": "ENG-STD10-U3-N2",
                    "name": "Concept 2 of Unit 3",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 3",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-eng-4",
            "title": "Unit 4",
            "tamilTitle": "Unit 4",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-4-1",
                "title": "Basics of Unit 4",
                "tamilTitle": "Unit 4 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U4-N1",
                    "conceptCode": "ENG-STD10-U4-N1",
                    "name": "Concept 1 of Unit 4",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 4",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U4-N2",
                    "conceptCode": "ENG-STD10-U4-N2",
                    "name": "Concept 2 of Unit 4",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 4",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-eng-5",
            "title": "Unit 5",
            "tamilTitle": "Unit 5",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-5-1",
                "title": "Basics of Unit 5",
                "tamilTitle": "Unit 5 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U5-N1",
                    "conceptCode": "ENG-STD10-U5-N1",
                    "name": "Concept 1 of Unit 5",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 5",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U5-N2",
                    "conceptCode": "ENG-STD10-U5-N2",
                    "name": "Concept 2 of Unit 5",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 5",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-eng-6",
            "title": "Unit 6",
            "tamilTitle": "Unit 6",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-6-1",
                "title": "Basics of Unit 6",
                "tamilTitle": "Unit 6 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U6-N1",
                    "conceptCode": "ENG-STD10-U6-N1",
                    "name": "Concept 1 of Unit 6",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 6",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U6-N2",
                    "conceptCode": "ENG-STD10-U6-N2",
                    "name": "Concept 2 of Unit 6",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 6",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-eng-7",
            "title": "Unit 7",
            "tamilTitle": "Unit 7",
            "microTopics": [
              {
                "id": "mt-STD10-ENG-7-1",
                "title": "Basics of Unit 7",
                "tamilTitle": "Unit 7 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD10-U7-N1",
                    "conceptCode": "ENG-STD10-U7-N1",
                    "name": "Concept 1 of Unit 7",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Unit 7",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD10-U7-N2",
                    "conceptCode": "ENG-STD10-U7-N2",
                    "name": "Concept 2 of Unit 7",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Unit 7",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-10-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-10-mat-1",
            "title": "Relations & Functions",
            "tamilTitle": "Relations & Functions",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-1-1",
                "title": "Basics of Relations & Functions",
                "tamilTitle": "Relations & Functions அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U1-N1",
                    "conceptCode": "MAT-STD10-U1-N1",
                    "name": "Concept 1 of Relations & Functions",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Relations & Functions",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U1-N2",
                    "conceptCode": "MAT-STD10-U1-N2",
                    "name": "Concept 2 of Relations & Functions",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Relations & Functions",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-2",
            "title": "Numbers & Sequences",
            "tamilTitle": "Numbers & Sequences",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-2-1",
                "title": "Basics of Numbers & Sequences",
                "tamilTitle": "Numbers & Sequences அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U2-N1",
                    "conceptCode": "MAT-STD10-U2-N1",
                    "name": "Concept 1 of Numbers & Sequences",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Numbers & Sequences",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U2-N2",
                    "conceptCode": "MAT-STD10-U2-N2",
                    "name": "Concept 2 of Numbers & Sequences",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Numbers & Sequences",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-3",
            "title": "Algebra",
            "tamilTitle": "Algebra",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-3-1",
                "title": "Basics of Algebra",
                "tamilTitle": "Algebra அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U3-N1",
                    "conceptCode": "MAT-STD10-U3-N1",
                    "name": "Concept 1 of Algebra",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Algebra",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U3-N2",
                    "conceptCode": "MAT-STD10-U3-N2",
                    "name": "Concept 2 of Algebra",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Algebra",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-4",
            "title": "Geometry",
            "tamilTitle": "Geometry",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-4-1",
                "title": "Basics of Geometry",
                "tamilTitle": "Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U4-N1",
                    "conceptCode": "MAT-STD10-U4-N1",
                    "name": "Concept 1 of Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U4-N2",
                    "conceptCode": "MAT-STD10-U4-N2",
                    "name": "Concept 2 of Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-5",
            "title": "Coordinate Geometry",
            "tamilTitle": "Coordinate Geometry",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-5-1",
                "title": "Basics of Coordinate Geometry",
                "tamilTitle": "Coordinate Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U5-N1",
                    "conceptCode": "MAT-STD10-U5-N1",
                    "name": "Concept 1 of Coordinate Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Coordinate Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U5-N2",
                    "conceptCode": "MAT-STD10-U5-N2",
                    "name": "Concept 2 of Coordinate Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Coordinate Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-6",
            "title": "Trigonometry",
            "tamilTitle": "Trigonometry",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-6-1",
                "title": "Basics of Trigonometry",
                "tamilTitle": "Trigonometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U6-N1",
                    "conceptCode": "MAT-STD10-U6-N1",
                    "name": "Concept 1 of Trigonometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Trigonometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U6-N2",
                    "conceptCode": "MAT-STD10-U6-N2",
                    "name": "Concept 2 of Trigonometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Trigonometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-7",
            "title": "Mensuration",
            "tamilTitle": "Mensuration",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-7-1",
                "title": "Basics of Mensuration",
                "tamilTitle": "Mensuration அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U7-N1",
                    "conceptCode": "MAT-STD10-U7-N1",
                    "name": "Concept 1 of Mensuration",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Mensuration",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U7-N2",
                    "conceptCode": "MAT-STD10-U7-N2",
                    "name": "Concept 2 of Mensuration",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Mensuration",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-mat-8",
            "title": "Statistics & Probability",
            "tamilTitle": "Statistics & Probability",
            "microTopics": [
              {
                "id": "mt-STD10-MAT-8-1",
                "title": "Basics of Statistics & Probability",
                "tamilTitle": "Statistics & Probability அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD10-U8-N1",
                    "conceptCode": "MAT-STD10-U8-N1",
                    "name": "Concept 1 of Statistics & Probability",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Statistics & Probability",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD10-U8-N2",
                    "conceptCode": "MAT-STD10-U8-N2",
                    "name": "Concept 2 of Statistics & Probability",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Statistics & Probability",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-10-sci",
        "title": "Science",
        "tamilTitle": "அறிவியல்",
        "chapters": [
          {
            "id": "chap-10-sci-1",
            "title": "Laws of Motion",
            "tamilTitle": "Laws of Motion",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-1-1",
                "title": "Basics of Laws of Motion",
                "tamilTitle": "Laws of Motion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U1-N1",
                    "conceptCode": "SCI-STD10-U1-N1",
                    "name": "Concept 1 of Laws of Motion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Laws of Motion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U1-N2",
                    "conceptCode": "SCI-STD10-U1-N2",
                    "name": "Concept 2 of Laws of Motion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Laws of Motion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-2",
            "title": "Optics",
            "tamilTitle": "Optics",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-2-1",
                "title": "Basics of Optics",
                "tamilTitle": "Optics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U2-N1",
                    "conceptCode": "SCI-STD10-U2-N1",
                    "name": "Concept 1 of Optics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Optics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U2-N2",
                    "conceptCode": "SCI-STD10-U2-N2",
                    "name": "Concept 2 of Optics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Optics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-3",
            "title": "Thermal Physics",
            "tamilTitle": "Thermal Physics",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-3-1",
                "title": "Basics of Thermal Physics",
                "tamilTitle": "Thermal Physics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U3-N1",
                    "conceptCode": "SCI-STD10-U3-N1",
                    "name": "Concept 1 of Thermal Physics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Thermal Physics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U3-N2",
                    "conceptCode": "SCI-STD10-U3-N2",
                    "name": "Concept 2 of Thermal Physics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Thermal Physics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-4",
            "title": "Electricity",
            "tamilTitle": "Electricity",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-4-1",
                "title": "Basics of Electricity",
                "tamilTitle": "Electricity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U4-N1",
                    "conceptCode": "SCI-STD10-U4-N1",
                    "name": "Concept 1 of Electricity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electricity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U4-N2",
                    "conceptCode": "SCI-STD10-U4-N2",
                    "name": "Concept 2 of Electricity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electricity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-5",
            "title": "Acoustics",
            "tamilTitle": "Acoustics",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-5-1",
                "title": "Basics of Acoustics",
                "tamilTitle": "Acoustics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U5-N1",
                    "conceptCode": "SCI-STD10-U5-N1",
                    "name": "Concept 1 of Acoustics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Acoustics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U5-N2",
                    "conceptCode": "SCI-STD10-U5-N2",
                    "name": "Concept 2 of Acoustics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Acoustics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-6",
            "title": "Nuclear Physics",
            "tamilTitle": "Nuclear Physics",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-6-1",
                "title": "Basics of Nuclear Physics",
                "tamilTitle": "Nuclear Physics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U6-N1",
                    "conceptCode": "SCI-STD10-U6-N1",
                    "name": "Concept 1 of Nuclear Physics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Nuclear Physics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U6-N2",
                    "conceptCode": "SCI-STD10-U6-N2",
                    "name": "Concept 2 of Nuclear Physics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Nuclear Physics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-7",
            "title": "Atoms & Molecules",
            "tamilTitle": "Atoms & Molecules",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-7-1",
                "title": "Basics of Atoms & Molecules",
                "tamilTitle": "Atoms & Molecules அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U7-N1",
                    "conceptCode": "SCI-STD10-U7-N1",
                    "name": "Concept 1 of Atoms & Molecules",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Atoms & Molecules",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U7-N2",
                    "conceptCode": "SCI-STD10-U7-N2",
                    "name": "Concept 2 of Atoms & Molecules",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Atoms & Molecules",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-8",
            "title": "Chemical Bonding",
            "tamilTitle": "Chemical Bonding",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-8-1",
                "title": "Basics of Chemical Bonding",
                "tamilTitle": "Chemical Bonding அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U8-N1",
                    "conceptCode": "SCI-STD10-U8-N1",
                    "name": "Concept 1 of Chemical Bonding",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Bonding",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U8-N2",
                    "conceptCode": "SCI-STD10-U8-N2",
                    "name": "Concept 2 of Chemical Bonding",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Bonding",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-9",
            "title": "Acids & Bases",
            "tamilTitle": "Acids & Bases",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-9-1",
                "title": "Basics of Acids & Bases",
                "tamilTitle": "Acids & Bases அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U9-N1",
                    "conceptCode": "SCI-STD10-U9-N1",
                    "name": "Concept 1 of Acids & Bases",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Acids & Bases",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U9-N2",
                    "conceptCode": "SCI-STD10-U9-N2",
                    "name": "Concept 2 of Acids & Bases",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Acids & Bases",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-10",
            "title": "Periodicity",
            "tamilTitle": "Periodicity",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-10-1",
                "title": "Basics of Periodicity",
                "tamilTitle": "Periodicity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U10-N1",
                    "conceptCode": "SCI-STD10-U10-N1",
                    "name": "Concept 1 of Periodicity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Periodicity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U10-N2",
                    "conceptCode": "SCI-STD10-U10-N2",
                    "name": "Concept 2 of Periodicity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Periodicity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-11",
            "title": "Solutions",
            "tamilTitle": "Solutions",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-11-1",
                "title": "Basics of Solutions",
                "tamilTitle": "Solutions அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U11-N1",
                    "conceptCode": "SCI-STD10-U11-N1",
                    "name": "Concept 1 of Solutions",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Solutions",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U11-N2",
                    "conceptCode": "SCI-STD10-U11-N2",
                    "name": "Concept 2 of Solutions",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Solutions",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-12",
            "title": "Metallurgy",
            "tamilTitle": "Metallurgy",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-12-1",
                "title": "Basics of Metallurgy",
                "tamilTitle": "Metallurgy அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U12-N1",
                    "conceptCode": "SCI-STD10-U12-N1",
                    "name": "Concept 1 of Metallurgy",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Metallurgy",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U12-N2",
                    "conceptCode": "SCI-STD10-U12-N2",
                    "name": "Concept 2 of Metallurgy",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Metallurgy",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-13",
            "title": "Carbon & Its Compounds",
            "tamilTitle": "Carbon & Its Compounds",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-13-1",
                "title": "Basics of Carbon & Its Compounds",
                "tamilTitle": "Carbon & Its Compounds அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U13-N1",
                    "conceptCode": "SCI-STD10-U13-N1",
                    "name": "Concept 1 of Carbon & Its Compounds",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Carbon & Its Compounds",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U13-N2",
                    "conceptCode": "SCI-STD10-U13-N2",
                    "name": "Concept 2 of Carbon & Its Compounds",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Carbon & Its Compounds",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-14",
            "title": "Plant Anatomy",
            "tamilTitle": "Plant Anatomy",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-14-1",
                "title": "Basics of Plant Anatomy",
                "tamilTitle": "Plant Anatomy அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U14-N1",
                    "conceptCode": "SCI-STD10-U14-N1",
                    "name": "Concept 1 of Plant Anatomy",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Plant Anatomy",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U14-N2",
                    "conceptCode": "SCI-STD10-U14-N2",
                    "name": "Concept 2 of Plant Anatomy",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Plant Anatomy",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-15",
            "title": "Plant Physiology",
            "tamilTitle": "Plant Physiology",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-15-1",
                "title": "Basics of Plant Physiology",
                "tamilTitle": "Plant Physiology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U15-N1",
                    "conceptCode": "SCI-STD10-U15-N1",
                    "name": "Concept 1 of Plant Physiology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Plant Physiology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U15-N2",
                    "conceptCode": "SCI-STD10-U15-N2",
                    "name": "Concept 2 of Plant Physiology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Plant Physiology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-16",
            "title": "Animal Nutrition",
            "tamilTitle": "Animal Nutrition",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-16-1",
                "title": "Basics of Animal Nutrition",
                "tamilTitle": "Animal Nutrition அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U16-N1",
                    "conceptCode": "SCI-STD10-U16-N1",
                    "name": "Concept 1 of Animal Nutrition",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Animal Nutrition",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U16-N2",
                    "conceptCode": "SCI-STD10-U16-N2",
                    "name": "Concept 2 of Animal Nutrition",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Animal Nutrition",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-17",
            "title": "Nervous System",
            "tamilTitle": "Nervous System",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-17-1",
                "title": "Basics of Nervous System",
                "tamilTitle": "Nervous System அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U17-N1",
                    "conceptCode": "SCI-STD10-U17-N1",
                    "name": "Concept 1 of Nervous System",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Nervous System",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U17-N2",
                    "conceptCode": "SCI-STD10-U17-N2",
                    "name": "Concept 2 of Nervous System",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Nervous System",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-18",
            "title": "Heredity",
            "tamilTitle": "Heredity",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-18-1",
                "title": "Basics of Heredity",
                "tamilTitle": "Heredity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U18-N1",
                    "conceptCode": "SCI-STD10-U18-N1",
                    "name": "Concept 1 of Heredity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Heredity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U18-N2",
                    "conceptCode": "SCI-STD10-U18-N2",
                    "name": "Concept 2 of Heredity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Heredity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-19",
            "title": "Biotechnology",
            "tamilTitle": "Biotechnology",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-19-1",
                "title": "Basics of Biotechnology",
                "tamilTitle": "Biotechnology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U19-N1",
                    "conceptCode": "SCI-STD10-U19-N1",
                    "name": "Concept 1 of Biotechnology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Biotechnology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U19-N2",
                    "conceptCode": "SCI-STD10-U19-N2",
                    "name": "Concept 2 of Biotechnology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Biotechnology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-20",
            "title": "Health & Diseases",
            "tamilTitle": "Health & Diseases",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-20-1",
                "title": "Basics of Health & Diseases",
                "tamilTitle": "Health & Diseases அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U20-N1",
                    "conceptCode": "SCI-STD10-U20-N1",
                    "name": "Concept 1 of Health & Diseases",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Health & Diseases",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U20-N2",
                    "conceptCode": "SCI-STD10-U20-N2",
                    "name": "Concept 2 of Health & Diseases",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Health & Diseases",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-21",
            "title": "Reproductive System",
            "tamilTitle": "Reproductive System",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-21-1",
                "title": "Basics of Reproductive System",
                "tamilTitle": "Reproductive System அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U21-N1",
                    "conceptCode": "SCI-STD10-U21-N1",
                    "name": "Concept 1 of Reproductive System",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Reproductive System",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U21-N2",
                    "conceptCode": "SCI-STD10-U21-N2",
                    "name": "Concept 2 of Reproductive System",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Reproductive System",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-sci-22",
            "title": "Environmental Management",
            "tamilTitle": "Environmental Management",
            "microTopics": [
              {
                "id": "mt-STD10-SCI-22-1",
                "title": "Basics of Environmental Management",
                "tamilTitle": "Environmental Management அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SCI-STD10-U22-N1",
                    "conceptCode": "SCI-STD10-U22-N1",
                    "name": "Concept 1 of Environmental Management",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Environmental Management",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SCI-STD10-U22-N2",
                    "conceptCode": "SCI-STD10-U22-N2",
                    "name": "Concept 2 of Environmental Management",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Environmental Management",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-10-soc",
        "title": "Social Science",
        "tamilTitle": "சமூக அறிவியல்",
        "chapters": [
          {
            "id": "chap-10-soc-1",
            "title": "History: Nationalism",
            "tamilTitle": "History: Nationalism",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-1-1",
                "title": "Basics of History: Nationalism",
                "tamilTitle": "History: Nationalism அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U1-N1",
                    "conceptCode": "SOC-STD10-U1-N1",
                    "name": "Concept 1 of History: Nationalism",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of History: Nationalism",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U1-N2",
                    "conceptCode": "SOC-STD10-U1-N2",
                    "name": "Concept 2 of History: Nationalism",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of History: Nationalism",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-soc-2",
            "title": "WWI & II",
            "tamilTitle": "WWI & II",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-2-1",
                "title": "Basics of WWI & II",
                "tamilTitle": "WWI & II அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U2-N1",
                    "conceptCode": "SOC-STD10-U2-N1",
                    "name": "Concept 1 of WWI & II",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of WWI & II",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U2-N2",
                    "conceptCode": "SOC-STD10-U2-N2",
                    "name": "Concept 2 of WWI & II",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of WWI & II",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-soc-3",
            "title": "UN",
            "tamilTitle": "UN",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-3-1",
                "title": "Basics of UN",
                "tamilTitle": "UN அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U3-N1",
                    "conceptCode": "SOC-STD10-U3-N1",
                    "name": "Concept 1 of UN",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of UN",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U3-N2",
                    "conceptCode": "SOC-STD10-U3-N2",
                    "name": "Concept 2 of UN",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of UN",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-soc-4",
            "title": "Geography: India Climate",
            "tamilTitle": "Geography: India Climate",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-4-1",
                "title": "Basics of Geography: India Climate",
                "tamilTitle": "Geography: India Climate அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U4-N1",
                    "conceptCode": "SOC-STD10-U4-N1",
                    "name": "Concept 1 of Geography: India Climate",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Geography: India Climate",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U4-N2",
                    "conceptCode": "SOC-STD10-U4-N2",
                    "name": "Concept 2 of Geography: India Climate",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Geography: India Climate",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-soc-5",
            "title": "Resources",
            "tamilTitle": "Resources",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-5-1",
                "title": "Basics of Resources",
                "tamilTitle": "Resources அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U5-N1",
                    "conceptCode": "SOC-STD10-U5-N1",
                    "name": "Concept 1 of Resources",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Resources",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U5-N2",
                    "conceptCode": "SOC-STD10-U5-N2",
                    "name": "Concept 2 of Resources",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Resources",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-soc-6",
            "title": "Civics: Indian Constitution",
            "tamilTitle": "Civics: Indian Constitution",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-6-1",
                "title": "Basics of Civics: Indian Constitution",
                "tamilTitle": "Civics: Indian Constitution அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U6-N1",
                    "conceptCode": "SOC-STD10-U6-N1",
                    "name": "Concept 1 of Civics: Indian Constitution",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Civics: Indian Constitution",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U6-N2",
                    "conceptCode": "SOC-STD10-U6-N2",
                    "name": "Concept 2 of Civics: Indian Constitution",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Civics: Indian Constitution",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-10-soc-7",
            "title": "Economics: Globalisation",
            "tamilTitle": "Economics: Globalisation",
            "microTopics": [
              {
                "id": "mt-STD10-SOC-7-1",
                "title": "Basics of Economics: Globalisation",
                "tamilTitle": "Economics: Globalisation அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "SOC-STD10-U7-N1",
                    "conceptCode": "SOC-STD10-U7-N1",
                    "name": "Concept 1 of Economics: Globalisation",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Economics: Globalisation",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "SOC-STD10-U7-N2",
                    "conceptCode": "SOC-STD10-U7-N2",
                    "name": "Concept 2 of Economics: Globalisation",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Economics: Globalisation",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-11": {
    "id": "school-std-11",
    "title": "11th Standard",
    "tamilTitle": "11-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-11-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-11-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD11-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD11-U1-N1",
                    "conceptCode": "TAM-STD11-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD11-U1-N2",
                    "conceptCode": "TAM-STD11-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD11-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD11-U2-N1",
                    "conceptCode": "TAM-STD11-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD11-U2-N2",
                    "conceptCode": "TAM-STD11-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-11-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-11-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD11-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD11-U1-N1",
                    "conceptCode": "ENG-STD11-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD11-U1-N2",
                    "conceptCode": "ENG-STD11-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD11-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD11-U2-N1",
                    "conceptCode": "ENG-STD11-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD11-U2-N2",
                    "conceptCode": "ENG-STD11-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-11-phy",
        "title": "Physics",
        "tamilTitle": "இயற்பியல்",
        "chapters": [
          {
            "id": "chap-11-phy-1",
            "title": "Units",
            "tamilTitle": "Units",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-1-1",
                "title": "Basics of Units",
                "tamilTitle": "Units அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U1-N1",
                    "conceptCode": "PHY-STD11-U1-N1",
                    "name": "Concept 1 of Units",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Units",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U1-N2",
                    "conceptCode": "PHY-STD11-U1-N2",
                    "name": "Concept 2 of Units",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Units",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-2",
            "title": "Kinematics",
            "tamilTitle": "Kinematics",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-2-1",
                "title": "Basics of Kinematics",
                "tamilTitle": "Kinematics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U2-N1",
                    "conceptCode": "PHY-STD11-U2-N1",
                    "name": "Concept 1 of Kinematics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Kinematics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U2-N2",
                    "conceptCode": "PHY-STD11-U2-N2",
                    "name": "Concept 2 of Kinematics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Kinematics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-3",
            "title": "Laws of Motion",
            "tamilTitle": "Laws of Motion",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-3-1",
                "title": "Basics of Laws of Motion",
                "tamilTitle": "Laws of Motion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U3-N1",
                    "conceptCode": "PHY-STD11-U3-N1",
                    "name": "Concept 1 of Laws of Motion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Laws of Motion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U3-N2",
                    "conceptCode": "PHY-STD11-U3-N2",
                    "name": "Concept 2 of Laws of Motion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Laws of Motion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-4",
            "title": "Work-Energy-Power",
            "tamilTitle": "Work-Energy-Power",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-4-1",
                "title": "Basics of Work-Energy-Power",
                "tamilTitle": "Work-Energy-Power அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U4-N1",
                    "conceptCode": "PHY-STD11-U4-N1",
                    "name": "Concept 1 of Work-Energy-Power",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Work-Energy-Power",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U4-N2",
                    "conceptCode": "PHY-STD11-U4-N2",
                    "name": "Concept 2 of Work-Energy-Power",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Work-Energy-Power",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-5",
            "title": "Gravitation",
            "tamilTitle": "Gravitation",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-5-1",
                "title": "Basics of Gravitation",
                "tamilTitle": "Gravitation அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U5-N1",
                    "conceptCode": "PHY-STD11-U5-N1",
                    "name": "Concept 1 of Gravitation",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Gravitation",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U5-N2",
                    "conceptCode": "PHY-STD11-U5-N2",
                    "name": "Concept 2 of Gravitation",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Gravitation",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-6",
            "title": "Properties of Matter",
            "tamilTitle": "Properties of Matter",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-6-1",
                "title": "Basics of Properties of Matter",
                "tamilTitle": "Properties of Matter அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U6-N1",
                    "conceptCode": "PHY-STD11-U6-N1",
                    "name": "Concept 1 of Properties of Matter",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Properties of Matter",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U6-N2",
                    "conceptCode": "PHY-STD11-U6-N2",
                    "name": "Concept 2 of Properties of Matter",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Properties of Matter",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-7",
            "title": "Thermal Physics",
            "tamilTitle": "Thermal Physics",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-7-1",
                "title": "Basics of Thermal Physics",
                "tamilTitle": "Thermal Physics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U7-N1",
                    "conceptCode": "PHY-STD11-U7-N1",
                    "name": "Concept 1 of Thermal Physics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Thermal Physics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U7-N2",
                    "conceptCode": "PHY-STD11-U7-N2",
                    "name": "Concept 2 of Thermal Physics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Thermal Physics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-8",
            "title": "Oscillations",
            "tamilTitle": "Oscillations",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-8-1",
                "title": "Basics of Oscillations",
                "tamilTitle": "Oscillations அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U8-N1",
                    "conceptCode": "PHY-STD11-U8-N1",
                    "name": "Concept 1 of Oscillations",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Oscillations",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U8-N2",
                    "conceptCode": "PHY-STD11-U8-N2",
                    "name": "Concept 2 of Oscillations",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Oscillations",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-9",
            "title": "Waves",
            "tamilTitle": "Waves",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-9-1",
                "title": "Basics of Waves",
                "tamilTitle": "Waves அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U9-N1",
                    "conceptCode": "PHY-STD11-U9-N1",
                    "name": "Concept 1 of Waves",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Waves",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U9-N2",
                    "conceptCode": "PHY-STD11-U9-N2",
                    "name": "Concept 2 of Waves",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Waves",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-10",
            "title": "Kinetic Theory",
            "tamilTitle": "Kinetic Theory",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-10-1",
                "title": "Basics of Kinetic Theory",
                "tamilTitle": "Kinetic Theory அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U10-N1",
                    "conceptCode": "PHY-STD11-U10-N1",
                    "name": "Concept 1 of Kinetic Theory",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Kinetic Theory",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U10-N2",
                    "conceptCode": "PHY-STD11-U10-N2",
                    "name": "Concept 2 of Kinetic Theory",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Kinetic Theory",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-phy-11",
            "title": "Thermodynamics",
            "tamilTitle": "Thermodynamics",
            "microTopics": [
              {
                "id": "mt-STD11-PHY-11-1",
                "title": "Basics of Thermodynamics",
                "tamilTitle": "Thermodynamics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD11-U11-N1",
                    "conceptCode": "PHY-STD11-U11-N1",
                    "name": "Concept 1 of Thermodynamics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Thermodynamics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD11-U11-N2",
                    "conceptCode": "PHY-STD11-U11-N2",
                    "name": "Concept 2 of Thermodynamics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Thermodynamics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-11-che",
        "title": "Chemistry",
        "tamilTitle": "வேதியியல்",
        "chapters": [
          {
            "id": "chap-11-che-1",
            "title": "Basic Concepts",
            "tamilTitle": "Basic Concepts",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-1-1",
                "title": "Basics of Basic Concepts",
                "tamilTitle": "Basic Concepts அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U1-N1",
                    "conceptCode": "CHE-STD11-U1-N1",
                    "name": "Concept 1 of Basic Concepts",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Basic Concepts",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U1-N2",
                    "conceptCode": "CHE-STD11-U1-N2",
                    "name": "Concept 2 of Basic Concepts",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Basic Concepts",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-2",
            "title": "Atomic Structure",
            "tamilTitle": "Atomic Structure",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-2-1",
                "title": "Basics of Atomic Structure",
                "tamilTitle": "Atomic Structure அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U2-N1",
                    "conceptCode": "CHE-STD11-U2-N1",
                    "name": "Concept 1 of Atomic Structure",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Atomic Structure",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U2-N2",
                    "conceptCode": "CHE-STD11-U2-N2",
                    "name": "Concept 2 of Atomic Structure",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Atomic Structure",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-3",
            "title": "Periodic Classification",
            "tamilTitle": "Periodic Classification",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-3-1",
                "title": "Basics of Periodic Classification",
                "tamilTitle": "Periodic Classification அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U3-N1",
                    "conceptCode": "CHE-STD11-U3-N1",
                    "name": "Concept 1 of Periodic Classification",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Periodic Classification",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U3-N2",
                    "conceptCode": "CHE-STD11-U3-N2",
                    "name": "Concept 2 of Periodic Classification",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Periodic Classification",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-4",
            "title": "Hydrogen",
            "tamilTitle": "Hydrogen",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-4-1",
                "title": "Basics of Hydrogen",
                "tamilTitle": "Hydrogen அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U4-N1",
                    "conceptCode": "CHE-STD11-U4-N1",
                    "name": "Concept 1 of Hydrogen",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Hydrogen",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U4-N2",
                    "conceptCode": "CHE-STD11-U4-N2",
                    "name": "Concept 2 of Hydrogen",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Hydrogen",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-5",
            "title": "s-Block",
            "tamilTitle": "s-Block",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-5-1",
                "title": "Basics of s-Block",
                "tamilTitle": "s-Block அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U5-N1",
                    "conceptCode": "CHE-STD11-U5-N1",
                    "name": "Concept 1 of s-Block",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of s-Block",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U5-N2",
                    "conceptCode": "CHE-STD11-U5-N2",
                    "name": "Concept 2 of s-Block",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of s-Block",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-6",
            "title": "p-Block",
            "tamilTitle": "p-Block",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-6-1",
                "title": "Basics of p-Block",
                "tamilTitle": "p-Block அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U6-N1",
                    "conceptCode": "CHE-STD11-U6-N1",
                    "name": "Concept 1 of p-Block",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of p-Block",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U6-N2",
                    "conceptCode": "CHE-STD11-U6-N2",
                    "name": "Concept 2 of p-Block",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of p-Block",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-7",
            "title": "Chemical Bonding",
            "tamilTitle": "Chemical Bonding",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-7-1",
                "title": "Basics of Chemical Bonding",
                "tamilTitle": "Chemical Bonding அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U7-N1",
                    "conceptCode": "CHE-STD11-U7-N1",
                    "name": "Concept 1 of Chemical Bonding",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Bonding",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U7-N2",
                    "conceptCode": "CHE-STD11-U7-N2",
                    "name": "Concept 2 of Chemical Bonding",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Bonding",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-8",
            "title": "Thermodynamics",
            "tamilTitle": "Thermodynamics",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-8-1",
                "title": "Basics of Thermodynamics",
                "tamilTitle": "Thermodynamics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U8-N1",
                    "conceptCode": "CHE-STD11-U8-N1",
                    "name": "Concept 1 of Thermodynamics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Thermodynamics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U8-N2",
                    "conceptCode": "CHE-STD11-U8-N2",
                    "name": "Concept 2 of Thermodynamics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Thermodynamics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-9",
            "title": "Solutions",
            "tamilTitle": "Solutions",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-9-1",
                "title": "Basics of Solutions",
                "tamilTitle": "Solutions அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U9-N1",
                    "conceptCode": "CHE-STD11-U9-N1",
                    "name": "Concept 1 of Solutions",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Solutions",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U9-N2",
                    "conceptCode": "CHE-STD11-U9-N2",
                    "name": "Concept 2 of Solutions",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Solutions",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-10",
            "title": "Chemical Equilibrium",
            "tamilTitle": "Chemical Equilibrium",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-10-1",
                "title": "Basics of Chemical Equilibrium",
                "tamilTitle": "Chemical Equilibrium அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U10-N1",
                    "conceptCode": "CHE-STD11-U10-N1",
                    "name": "Concept 1 of Chemical Equilibrium",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Equilibrium",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U10-N2",
                    "conceptCode": "CHE-STD11-U10-N2",
                    "name": "Concept 2 of Chemical Equilibrium",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Equilibrium",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-11",
            "title": "Chemical Kinetics",
            "tamilTitle": "Chemical Kinetics",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-11-1",
                "title": "Basics of Chemical Kinetics",
                "tamilTitle": "Chemical Kinetics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U11-N1",
                    "conceptCode": "CHE-STD11-U11-N1",
                    "name": "Concept 1 of Chemical Kinetics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Kinetics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U11-N2",
                    "conceptCode": "CHE-STD11-U11-N2",
                    "name": "Concept 2 of Chemical Kinetics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Kinetics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-12",
            "title": "Surface Chemistry",
            "tamilTitle": "Surface Chemistry",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-12-1",
                "title": "Basics of Surface Chemistry",
                "tamilTitle": "Surface Chemistry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U12-N1",
                    "conceptCode": "CHE-STD11-U12-N1",
                    "name": "Concept 1 of Surface Chemistry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Surface Chemistry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U12-N2",
                    "conceptCode": "CHE-STD11-U12-N2",
                    "name": "Concept 2 of Surface Chemistry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Surface Chemistry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-13",
            "title": "Hydrocarbons",
            "tamilTitle": "Hydrocarbons",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-13-1",
                "title": "Basics of Hydrocarbons",
                "tamilTitle": "Hydrocarbons அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U13-N1",
                    "conceptCode": "CHE-STD11-U13-N1",
                    "name": "Concept 1 of Hydrocarbons",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Hydrocarbons",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U13-N2",
                    "conceptCode": "CHE-STD11-U13-N2",
                    "name": "Concept 2 of Hydrocarbons",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Hydrocarbons",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-14",
            "title": "Environmental Chemistry",
            "tamilTitle": "Environmental Chemistry",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-14-1",
                "title": "Basics of Environmental Chemistry",
                "tamilTitle": "Environmental Chemistry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U14-N1",
                    "conceptCode": "CHE-STD11-U14-N1",
                    "name": "Concept 1 of Environmental Chemistry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Environmental Chemistry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U14-N2",
                    "conceptCode": "CHE-STD11-U14-N2",
                    "name": "Concept 2 of Environmental Chemistry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Environmental Chemistry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-che-15",
            "title": "Haloalkanes",
            "tamilTitle": "Haloalkanes",
            "microTopics": [
              {
                "id": "mt-STD11-CHE-15-1",
                "title": "Basics of Haloalkanes",
                "tamilTitle": "Haloalkanes அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD11-U15-N1",
                    "conceptCode": "CHE-STD11-U15-N1",
                    "name": "Concept 1 of Haloalkanes",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Haloalkanes",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD11-U15-N2",
                    "conceptCode": "CHE-STD11-U15-N2",
                    "name": "Concept 2 of Haloalkanes",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Haloalkanes",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-11-bio",
        "title": "Biology",
        "tamilTitle": "உயிரியல்",
        "chapters": [
          {
            "id": "chap-11-bio-1",
            "title": "Living World",
            "tamilTitle": "Living World",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-1-1",
                "title": "Basics of Living World",
                "tamilTitle": "Living World அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U1-N1",
                    "conceptCode": "BIO-STD11-U1-N1",
                    "name": "Concept 1 of Living World",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Living World",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U1-N2",
                    "conceptCode": "BIO-STD11-U1-N2",
                    "name": "Concept 2 of Living World",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Living World",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-2",
            "title": "Biological Classification",
            "tamilTitle": "Biological Classification",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-2-1",
                "title": "Basics of Biological Classification",
                "tamilTitle": "Biological Classification அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U2-N1",
                    "conceptCode": "BIO-STD11-U2-N1",
                    "name": "Concept 1 of Biological Classification",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Biological Classification",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U2-N2",
                    "conceptCode": "BIO-STD11-U2-N2",
                    "name": "Concept 2 of Biological Classification",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Biological Classification",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-3",
            "title": "Plant Kingdom",
            "tamilTitle": "Plant Kingdom",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-3-1",
                "title": "Basics of Plant Kingdom",
                "tamilTitle": "Plant Kingdom அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U3-N1",
                    "conceptCode": "BIO-STD11-U3-N1",
                    "name": "Concept 1 of Plant Kingdom",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Plant Kingdom",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U3-N2",
                    "conceptCode": "BIO-STD11-U3-N2",
                    "name": "Concept 2 of Plant Kingdom",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Plant Kingdom",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-4",
            "title": "Animal Kingdom",
            "tamilTitle": "Animal Kingdom",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-4-1",
                "title": "Basics of Animal Kingdom",
                "tamilTitle": "Animal Kingdom அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U4-N1",
                    "conceptCode": "BIO-STD11-U4-N1",
                    "name": "Concept 1 of Animal Kingdom",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Animal Kingdom",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U4-N2",
                    "conceptCode": "BIO-STD11-U4-N2",
                    "name": "Concept 2 of Animal Kingdom",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Animal Kingdom",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-5",
            "title": "Morphology",
            "tamilTitle": "Morphology",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-5-1",
                "title": "Basics of Morphology",
                "tamilTitle": "Morphology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U5-N1",
                    "conceptCode": "BIO-STD11-U5-N1",
                    "name": "Concept 1 of Morphology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Morphology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U5-N2",
                    "conceptCode": "BIO-STD11-U5-N2",
                    "name": "Concept 2 of Morphology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Morphology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-6",
            "title": "Anatomy",
            "tamilTitle": "Anatomy",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-6-1",
                "title": "Basics of Anatomy",
                "tamilTitle": "Anatomy அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U6-N1",
                    "conceptCode": "BIO-STD11-U6-N1",
                    "name": "Concept 1 of Anatomy",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Anatomy",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U6-N2",
                    "conceptCode": "BIO-STD11-U6-N2",
                    "name": "Concept 2 of Anatomy",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Anatomy",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-7",
            "title": "Cell Biology",
            "tamilTitle": "Cell Biology",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-7-1",
                "title": "Basics of Cell Biology",
                "tamilTitle": "Cell Biology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U7-N1",
                    "conceptCode": "BIO-STD11-U7-N1",
                    "name": "Concept 1 of Cell Biology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Cell Biology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U7-N2",
                    "conceptCode": "BIO-STD11-U7-N2",
                    "name": "Concept 2 of Cell Biology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Cell Biology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-8",
            "title": "Cell Division",
            "tamilTitle": "Cell Division",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-8-1",
                "title": "Basics of Cell Division",
                "tamilTitle": "Cell Division அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U8-N1",
                    "conceptCode": "BIO-STD11-U8-N1",
                    "name": "Concept 1 of Cell Division",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Cell Division",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U8-N2",
                    "conceptCode": "BIO-STD11-U8-N2",
                    "name": "Concept 2 of Cell Division",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Cell Division",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-9",
            "title": "Biomolecules",
            "tamilTitle": "Biomolecules",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-9-1",
                "title": "Basics of Biomolecules",
                "tamilTitle": "Biomolecules அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U9-N1",
                    "conceptCode": "BIO-STD11-U9-N1",
                    "name": "Concept 1 of Biomolecules",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Biomolecules",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U9-N2",
                    "conceptCode": "BIO-STD11-U9-N2",
                    "name": "Concept 2 of Biomolecules",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Biomolecules",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-10",
            "title": "Transport in Plants",
            "tamilTitle": "Transport in Plants",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-10-1",
                "title": "Basics of Transport in Plants",
                "tamilTitle": "Transport in Plants அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U10-N1",
                    "conceptCode": "BIO-STD11-U10-N1",
                    "name": "Concept 1 of Transport in Plants",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Transport in Plants",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U10-N2",
                    "conceptCode": "BIO-STD11-U10-N2",
                    "name": "Concept 2 of Transport in Plants",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Transport in Plants",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-11",
            "title": "Mineral Nutrition",
            "tamilTitle": "Mineral Nutrition",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-11-1",
                "title": "Basics of Mineral Nutrition",
                "tamilTitle": "Mineral Nutrition அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U11-N1",
                    "conceptCode": "BIO-STD11-U11-N1",
                    "name": "Concept 1 of Mineral Nutrition",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Mineral Nutrition",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U11-N2",
                    "conceptCode": "BIO-STD11-U11-N2",
                    "name": "Concept 2 of Mineral Nutrition",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Mineral Nutrition",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-12",
            "title": "Photosynthesis",
            "tamilTitle": "Photosynthesis",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-12-1",
                "title": "Basics of Photosynthesis",
                "tamilTitle": "Photosynthesis அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U12-N1",
                    "conceptCode": "BIO-STD11-U12-N1",
                    "name": "Concept 1 of Photosynthesis",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Photosynthesis",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U12-N2",
                    "conceptCode": "BIO-STD11-U12-N2",
                    "name": "Concept 2 of Photosynthesis",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Photosynthesis",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-13",
            "title": "Respiration",
            "tamilTitle": "Respiration",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-13-1",
                "title": "Basics of Respiration",
                "tamilTitle": "Respiration அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U13-N1",
                    "conceptCode": "BIO-STD11-U13-N1",
                    "name": "Concept 1 of Respiration",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Respiration",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U13-N2",
                    "conceptCode": "BIO-STD11-U13-N2",
                    "name": "Concept 2 of Respiration",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Respiration",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-14",
            "title": "Plant Growth",
            "tamilTitle": "Plant Growth",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-14-1",
                "title": "Basics of Plant Growth",
                "tamilTitle": "Plant Growth அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U14-N1",
                    "conceptCode": "BIO-STD11-U14-N1",
                    "name": "Concept 1 of Plant Growth",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Plant Growth",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U14-N2",
                    "conceptCode": "BIO-STD11-U14-N2",
                    "name": "Concept 2 of Plant Growth",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Plant Growth",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-15",
            "title": "Digestion",
            "tamilTitle": "Digestion",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-15-1",
                "title": "Basics of Digestion",
                "tamilTitle": "Digestion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U15-N1",
                    "conceptCode": "BIO-STD11-U15-N1",
                    "name": "Concept 1 of Digestion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Digestion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U15-N2",
                    "conceptCode": "BIO-STD11-U15-N2",
                    "name": "Concept 2 of Digestion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Digestion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-16",
            "title": "Breathing",
            "tamilTitle": "Breathing",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-16-1",
                "title": "Basics of Breathing",
                "tamilTitle": "Breathing அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U16-N1",
                    "conceptCode": "BIO-STD11-U16-N1",
                    "name": "Concept 1 of Breathing",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Breathing",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U16-N2",
                    "conceptCode": "BIO-STD11-U16-N2",
                    "name": "Concept 2 of Breathing",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Breathing",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-17",
            "title": "Body Fluids",
            "tamilTitle": "Body Fluids",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-17-1",
                "title": "Basics of Body Fluids",
                "tamilTitle": "Body Fluids அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U17-N1",
                    "conceptCode": "BIO-STD11-U17-N1",
                    "name": "Concept 1 of Body Fluids",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Body Fluids",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U17-N2",
                    "conceptCode": "BIO-STD11-U17-N2",
                    "name": "Concept 2 of Body Fluids",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Body Fluids",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-18",
            "title": "Excretion",
            "tamilTitle": "Excretion",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-18-1",
                "title": "Basics of Excretion",
                "tamilTitle": "Excretion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U18-N1",
                    "conceptCode": "BIO-STD11-U18-N1",
                    "name": "Concept 1 of Excretion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Excretion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U18-N2",
                    "conceptCode": "BIO-STD11-U18-N2",
                    "name": "Concept 2 of Excretion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Excretion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-19",
            "title": "Locomotion",
            "tamilTitle": "Locomotion",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-19-1",
                "title": "Basics of Locomotion",
                "tamilTitle": "Locomotion அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U19-N1",
                    "conceptCode": "BIO-STD11-U19-N1",
                    "name": "Concept 1 of Locomotion",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Locomotion",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U19-N2",
                    "conceptCode": "BIO-STD11-U19-N2",
                    "name": "Concept 2 of Locomotion",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Locomotion",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-20",
            "title": "Neural Control",
            "tamilTitle": "Neural Control",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-20-1",
                "title": "Basics of Neural Control",
                "tamilTitle": "Neural Control அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U20-N1",
                    "conceptCode": "BIO-STD11-U20-N1",
                    "name": "Concept 1 of Neural Control",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Neural Control",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U20-N2",
                    "conceptCode": "BIO-STD11-U20-N2",
                    "name": "Concept 2 of Neural Control",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Neural Control",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-bio-21",
            "title": "Chemical Coordination",
            "tamilTitle": "Chemical Coordination",
            "microTopics": [
              {
                "id": "mt-STD11-BIO-21-1",
                "title": "Basics of Chemical Coordination",
                "tamilTitle": "Chemical Coordination அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD11-U21-N1",
                    "conceptCode": "BIO-STD11-U21-N1",
                    "name": "Concept 1 of Chemical Coordination",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Coordination",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD11-U21-N2",
                    "conceptCode": "BIO-STD11-U21-N2",
                    "name": "Concept 2 of Chemical Coordination",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Coordination",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-11-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-11-mat-1",
            "title": "Sets",
            "tamilTitle": "Sets",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-1-1",
                "title": "Basics of Sets",
                "tamilTitle": "Sets அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U1-N1",
                    "conceptCode": "MAT-STD11-U1-N1",
                    "name": "Concept 1 of Sets",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Sets",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U1-N2",
                    "conceptCode": "MAT-STD11-U1-N2",
                    "name": "Concept 2 of Sets",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Sets",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-2",
            "title": "Relations",
            "tamilTitle": "Relations",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-2-1",
                "title": "Basics of Relations",
                "tamilTitle": "Relations அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U2-N1",
                    "conceptCode": "MAT-STD11-U2-N1",
                    "name": "Concept 1 of Relations",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Relations",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U2-N2",
                    "conceptCode": "MAT-STD11-U2-N2",
                    "name": "Concept 2 of Relations",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Relations",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-3",
            "title": "Trigonometry",
            "tamilTitle": "Trigonometry",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-3-1",
                "title": "Basics of Trigonometry",
                "tamilTitle": "Trigonometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U3-N1",
                    "conceptCode": "MAT-STD11-U3-N1",
                    "name": "Concept 1 of Trigonometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Trigonometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U3-N2",
                    "conceptCode": "MAT-STD11-U3-N2",
                    "name": "Concept 2 of Trigonometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Trigonometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-4",
            "title": "Combinatorics",
            "tamilTitle": "Combinatorics",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-4-1",
                "title": "Basics of Combinatorics",
                "tamilTitle": "Combinatorics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U4-N1",
                    "conceptCode": "MAT-STD11-U4-N1",
                    "name": "Concept 1 of Combinatorics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Combinatorics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U4-N2",
                    "conceptCode": "MAT-STD11-U4-N2",
                    "name": "Concept 2 of Combinatorics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Combinatorics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-5",
            "title": "Binomial",
            "tamilTitle": "Binomial",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-5-1",
                "title": "Basics of Binomial",
                "tamilTitle": "Binomial அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U5-N1",
                    "conceptCode": "MAT-STD11-U5-N1",
                    "name": "Concept 1 of Binomial",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Binomial",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U5-N2",
                    "conceptCode": "MAT-STD11-U5-N2",
                    "name": "Concept 2 of Binomial",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Binomial",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-6",
            "title": "Sequences",
            "tamilTitle": "Sequences",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-6-1",
                "title": "Basics of Sequences",
                "tamilTitle": "Sequences அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U6-N1",
                    "conceptCode": "MAT-STD11-U6-N1",
                    "name": "Concept 1 of Sequences",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Sequences",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U6-N2",
                    "conceptCode": "MAT-STD11-U6-N2",
                    "name": "Concept 2 of Sequences",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Sequences",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-7",
            "title": "Conic Sections",
            "tamilTitle": "Conic Sections",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-7-1",
                "title": "Basics of Conic Sections",
                "tamilTitle": "Conic Sections அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U7-N1",
                    "conceptCode": "MAT-STD11-U7-N1",
                    "name": "Concept 1 of Conic Sections",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Conic Sections",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U7-N2",
                    "conceptCode": "MAT-STD11-U7-N2",
                    "name": "Concept 2 of Conic Sections",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Conic Sections",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-8",
            "title": "Vector Algebra",
            "tamilTitle": "Vector Algebra",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-8-1",
                "title": "Basics of Vector Algebra",
                "tamilTitle": "Vector Algebra அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U8-N1",
                    "conceptCode": "MAT-STD11-U8-N1",
                    "name": "Concept 1 of Vector Algebra",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Vector Algebra",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U8-N2",
                    "conceptCode": "MAT-STD11-U8-N2",
                    "name": "Concept 2 of Vector Algebra",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Vector Algebra",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-9",
            "title": "Differential Calculus",
            "tamilTitle": "Differential Calculus",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-9-1",
                "title": "Basics of Differential Calculus",
                "tamilTitle": "Differential Calculus அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U9-N1",
                    "conceptCode": "MAT-STD11-U9-N1",
                    "name": "Concept 1 of Differential Calculus",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Differential Calculus",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U9-N2",
                    "conceptCode": "MAT-STD11-U9-N2",
                    "name": "Concept 2 of Differential Calculus",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Differential Calculus",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-10",
            "title": "Integral Calculus",
            "tamilTitle": "Integral Calculus",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-10-1",
                "title": "Basics of Integral Calculus",
                "tamilTitle": "Integral Calculus அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U10-N1",
                    "conceptCode": "MAT-STD11-U10-N1",
                    "name": "Concept 1 of Integral Calculus",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Integral Calculus",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U10-N2",
                    "conceptCode": "MAT-STD11-U10-N2",
                    "name": "Concept 2 of Integral Calculus",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Integral Calculus",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-11",
            "title": "Statistics",
            "tamilTitle": "Statistics",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-11-1",
                "title": "Basics of Statistics",
                "tamilTitle": "Statistics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U11-N1",
                    "conceptCode": "MAT-STD11-U11-N1",
                    "name": "Concept 1 of Statistics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Statistics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U11-N2",
                    "conceptCode": "MAT-STD11-U11-N2",
                    "name": "Concept 2 of Statistics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Statistics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-mat-12",
            "title": "Probability",
            "tamilTitle": "Probability",
            "microTopics": [
              {
                "id": "mt-STD11-MAT-12-1",
                "title": "Basics of Probability",
                "tamilTitle": "Probability அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD11-U12-N1",
                    "conceptCode": "MAT-STD11-U12-N1",
                    "name": "Concept 1 of Probability",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Probability",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD11-U12-N2",
                    "conceptCode": "MAT-STD11-U12-N2",
                    "name": "Concept 2 of Probability",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Probability",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-11-com",
        "title": "Commerce",
        "tamilTitle": "வணிகவியல்",
        "chapters": [
          {
            "id": "chap-11-com-1",
            "title": "Accountancy",
            "tamilTitle": "Accountancy",
            "microTopics": [
              {
                "id": "mt-STD11-COM-1-1",
                "title": "Basics of Accountancy",
                "tamilTitle": "Accountancy அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "COM-STD11-U1-N1",
                    "conceptCode": "COM-STD11-U1-N1",
                    "name": "Concept 1 of Accountancy",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Accountancy",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "COM-STD11-U1-N2",
                    "conceptCode": "COM-STD11-U1-N2",
                    "name": "Concept 2 of Accountancy",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Accountancy",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-com-2",
            "title": "Business Studies",
            "tamilTitle": "Business Studies",
            "microTopics": [
              {
                "id": "mt-STD11-COM-2-1",
                "title": "Basics of Business Studies",
                "tamilTitle": "Business Studies அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "COM-STD11-U2-N1",
                    "conceptCode": "COM-STD11-U2-N1",
                    "name": "Concept 1 of Business Studies",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Business Studies",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "COM-STD11-U2-N2",
                    "conceptCode": "COM-STD11-U2-N2",
                    "name": "Concept 2 of Business Studies",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Business Studies",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-11-com-3",
            "title": "Economics",
            "tamilTitle": "Economics",
            "microTopics": [
              {
                "id": "mt-STD11-COM-3-1",
                "title": "Basics of Economics",
                "tamilTitle": "Economics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "COM-STD11-U3-N1",
                    "conceptCode": "COM-STD11-U3-N1",
                    "name": "Concept 1 of Economics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Economics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "COM-STD11-U3-N2",
                    "conceptCode": "COM-STD11-U3-N2",
                    "name": "Concept 2 of Economics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Economics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "school-std-12": {
    "id": "school-std-12",
    "title": "12th Standard",
    "tamilTitle": "12-ஆம் வகுப்பு",
    "subjects": [
      {
        "id": "subj-12-tam",
        "title": "Tamil",
        "tamilTitle": "தமிழ்",
        "chapters": [
          {
            "id": "chap-12-tam-1",
            "title": "இயல் 1",
            "tamilTitle": "இயல் 1",
            "microTopics": [
              {
                "id": "mt-STD12-TAM-1-1",
                "title": "Basics of இயல் 1",
                "tamilTitle": "இயல் 1 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD12-U1-N1",
                    "conceptCode": "TAM-STD12-U1-N1",
                    "name": "Concept 1 of இயல் 1",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 1",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD12-U1-N2",
                    "conceptCode": "TAM-STD12-U1-N2",
                    "name": "Concept 2 of இயல் 1",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 1",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-tam-2",
            "title": "இயல் 2",
            "tamilTitle": "இயல் 2",
            "microTopics": [
              {
                "id": "mt-STD12-TAM-2-1",
                "title": "Basics of இயல் 2",
                "tamilTitle": "இயல் 2 அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "TAM-STD12-U2-N1",
                    "conceptCode": "TAM-STD12-U2-N1",
                    "name": "Concept 1 of இயல் 2",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of இயல் 2",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "TAM-STD12-U2-N2",
                    "conceptCode": "TAM-STD12-U2-N2",
                    "name": "Concept 2 of இயல் 2",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of இயல் 2",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-12-eng",
        "title": "English",
        "tamilTitle": "ஆங்கிலம்",
        "chapters": [
          {
            "id": "chap-12-eng-1",
            "title": "Prose",
            "tamilTitle": "Prose",
            "microTopics": [
              {
                "id": "mt-STD12-ENG-1-1",
                "title": "Basics of Prose",
                "tamilTitle": "Prose அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD12-U1-N1",
                    "conceptCode": "ENG-STD12-U1-N1",
                    "name": "Concept 1 of Prose",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Prose",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD12-U1-N2",
                    "conceptCode": "ENG-STD12-U1-N2",
                    "name": "Concept 2 of Prose",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Prose",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-eng-2",
            "title": "Poem",
            "tamilTitle": "Poem",
            "microTopics": [
              {
                "id": "mt-STD12-ENG-2-1",
                "title": "Basics of Poem",
                "tamilTitle": "Poem அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "ENG-STD12-U2-N1",
                    "conceptCode": "ENG-STD12-U2-N1",
                    "name": "Concept 1 of Poem",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Poem",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "ENG-STD12-U2-N2",
                    "conceptCode": "ENG-STD12-U2-N2",
                    "name": "Concept 2 of Poem",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Poem",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-12-phy",
        "title": "Physics",
        "tamilTitle": "இயற்பியல்",
        "chapters": [
          {
            "id": "chap-12-phy-1",
            "title": "Electrostatics",
            "tamilTitle": "Electrostatics",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-1-1",
                "title": "Basics of Electrostatics",
                "tamilTitle": "Electrostatics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U1-N1",
                    "conceptCode": "PHY-STD12-U1-N1",
                    "name": "Concept 1 of Electrostatics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electrostatics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U1-N2",
                    "conceptCode": "PHY-STD12-U1-N2",
                    "name": "Concept 2 of Electrostatics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electrostatics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-2",
            "title": "Current Electricity",
            "tamilTitle": "Current Electricity",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-2-1",
                "title": "Basics of Current Electricity",
                "tamilTitle": "Current Electricity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U2-N1",
                    "conceptCode": "PHY-STD12-U2-N1",
                    "name": "Concept 1 of Current Electricity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Current Electricity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U2-N2",
                    "conceptCode": "PHY-STD12-U2-N2",
                    "name": "Concept 2 of Current Electricity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Current Electricity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-3",
            "title": "Magnetism",
            "tamilTitle": "Magnetism",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-3-1",
                "title": "Basics of Magnetism",
                "tamilTitle": "Magnetism அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U3-N1",
                    "conceptCode": "PHY-STD12-U3-N1",
                    "name": "Concept 1 of Magnetism",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Magnetism",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U3-N2",
                    "conceptCode": "PHY-STD12-U3-N2",
                    "name": "Concept 2 of Magnetism",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Magnetism",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-4",
            "title": "Electromagnetic Induction",
            "tamilTitle": "Electromagnetic Induction",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-4-1",
                "title": "Basics of Electromagnetic Induction",
                "tamilTitle": "Electromagnetic Induction அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U4-N1",
                    "conceptCode": "PHY-STD12-U4-N1",
                    "name": "Concept 1 of Electromagnetic Induction",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electromagnetic Induction",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U4-N2",
                    "conceptCode": "PHY-STD12-U4-N2",
                    "name": "Concept 2 of Electromagnetic Induction",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electromagnetic Induction",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-5",
            "title": "EM Waves",
            "tamilTitle": "EM Waves",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-5-1",
                "title": "Basics of EM Waves",
                "tamilTitle": "EM Waves அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U5-N1",
                    "conceptCode": "PHY-STD12-U5-N1",
                    "name": "Concept 1 of EM Waves",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of EM Waves",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U5-N2",
                    "conceptCode": "PHY-STD12-U5-N2",
                    "name": "Concept 2 of EM Waves",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of EM Waves",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-6",
            "title": "Optics",
            "tamilTitle": "Optics",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-6-1",
                "title": "Basics of Optics",
                "tamilTitle": "Optics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U6-N1",
                    "conceptCode": "PHY-STD12-U6-N1",
                    "name": "Concept 1 of Optics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Optics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U6-N2",
                    "conceptCode": "PHY-STD12-U6-N2",
                    "name": "Concept 2 of Optics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Optics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-7",
            "title": "Dual Nature",
            "tamilTitle": "Dual Nature",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-7-1",
                "title": "Basics of Dual Nature",
                "tamilTitle": "Dual Nature அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U7-N1",
                    "conceptCode": "PHY-STD12-U7-N1",
                    "name": "Concept 1 of Dual Nature",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Dual Nature",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U7-N2",
                    "conceptCode": "PHY-STD12-U7-N2",
                    "name": "Concept 2 of Dual Nature",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Dual Nature",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-8",
            "title": "Atoms",
            "tamilTitle": "Atoms",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-8-1",
                "title": "Basics of Atoms",
                "tamilTitle": "Atoms அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U8-N1",
                    "conceptCode": "PHY-STD12-U8-N1",
                    "name": "Concept 1 of Atoms",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Atoms",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U8-N2",
                    "conceptCode": "PHY-STD12-U8-N2",
                    "name": "Concept 2 of Atoms",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Atoms",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-9",
            "title": "Nuclei",
            "tamilTitle": "Nuclei",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-9-1",
                "title": "Basics of Nuclei",
                "tamilTitle": "Nuclei அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U9-N1",
                    "conceptCode": "PHY-STD12-U9-N1",
                    "name": "Concept 1 of Nuclei",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Nuclei",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U9-N2",
                    "conceptCode": "PHY-STD12-U9-N2",
                    "name": "Concept 2 of Nuclei",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Nuclei",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-10",
            "title": "Semiconductor",
            "tamilTitle": "Semiconductor",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-10-1",
                "title": "Basics of Semiconductor",
                "tamilTitle": "Semiconductor அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U10-N1",
                    "conceptCode": "PHY-STD12-U10-N1",
                    "name": "Concept 1 of Semiconductor",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Semiconductor",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U10-N2",
                    "conceptCode": "PHY-STD12-U10-N2",
                    "name": "Concept 2 of Semiconductor",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Semiconductor",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-phy-11",
            "title": "Communication Systems",
            "tamilTitle": "Communication Systems",
            "microTopics": [
              {
                "id": "mt-STD12-PHY-11-1",
                "title": "Basics of Communication Systems",
                "tamilTitle": "Communication Systems அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "PHY-STD12-U11-N1",
                    "conceptCode": "PHY-STD12-U11-N1",
                    "name": "Concept 1 of Communication Systems",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Communication Systems",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "PHY-STD12-U11-N2",
                    "conceptCode": "PHY-STD12-U11-N2",
                    "name": "Concept 2 of Communication Systems",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Communication Systems",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-12-che",
        "title": "Chemistry",
        "tamilTitle": "வேதியியல்",
        "chapters": [
          {
            "id": "chap-12-che-1",
            "title": "Solid State",
            "tamilTitle": "Solid State",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-1-1",
                "title": "Basics of Solid State",
                "tamilTitle": "Solid State அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U1-N1",
                    "conceptCode": "CHE-STD12-U1-N1",
                    "name": "Concept 1 of Solid State",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Solid State",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U1-N2",
                    "conceptCode": "CHE-STD12-U1-N2",
                    "name": "Concept 2 of Solid State",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Solid State",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-2",
            "title": "Solutions",
            "tamilTitle": "Solutions",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-2-1",
                "title": "Basics of Solutions",
                "tamilTitle": "Solutions அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U2-N1",
                    "conceptCode": "CHE-STD12-U2-N1",
                    "name": "Concept 1 of Solutions",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Solutions",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U2-N2",
                    "conceptCode": "CHE-STD12-U2-N2",
                    "name": "Concept 2 of Solutions",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Solutions",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-3",
            "title": "Electrochemistry",
            "tamilTitle": "Electrochemistry",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-3-1",
                "title": "Basics of Electrochemistry",
                "tamilTitle": "Electrochemistry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U3-N1",
                    "conceptCode": "CHE-STD12-U3-N1",
                    "name": "Concept 1 of Electrochemistry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Electrochemistry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U3-N2",
                    "conceptCode": "CHE-STD12-U3-N2",
                    "name": "Concept 2 of Electrochemistry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Electrochemistry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-4",
            "title": "Chemical Kinetics",
            "tamilTitle": "Chemical Kinetics",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-4-1",
                "title": "Basics of Chemical Kinetics",
                "tamilTitle": "Chemical Kinetics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U4-N1",
                    "conceptCode": "CHE-STD12-U4-N1",
                    "name": "Concept 1 of Chemical Kinetics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemical Kinetics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U4-N2",
                    "conceptCode": "CHE-STD12-U4-N2",
                    "name": "Concept 2 of Chemical Kinetics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemical Kinetics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-5",
            "title": "Surface Chemistry",
            "tamilTitle": "Surface Chemistry",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-5-1",
                "title": "Basics of Surface Chemistry",
                "tamilTitle": "Surface Chemistry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U5-N1",
                    "conceptCode": "CHE-STD12-U5-N1",
                    "name": "Concept 1 of Surface Chemistry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Surface Chemistry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U5-N2",
                    "conceptCode": "CHE-STD12-U5-N2",
                    "name": "Concept 2 of Surface Chemistry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Surface Chemistry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-6",
            "title": "p-Block",
            "tamilTitle": "p-Block",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-6-1",
                "title": "Basics of p-Block",
                "tamilTitle": "p-Block அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U6-N1",
                    "conceptCode": "CHE-STD12-U6-N1",
                    "name": "Concept 1 of p-Block",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of p-Block",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U6-N2",
                    "conceptCode": "CHE-STD12-U6-N2",
                    "name": "Concept 2 of p-Block",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of p-Block",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-7",
            "title": "d-Block",
            "tamilTitle": "d-Block",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-7-1",
                "title": "Basics of d-Block",
                "tamilTitle": "d-Block அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U7-N1",
                    "conceptCode": "CHE-STD12-U7-N1",
                    "name": "Concept 1 of d-Block",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of d-Block",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U7-N2",
                    "conceptCode": "CHE-STD12-U7-N2",
                    "name": "Concept 2 of d-Block",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of d-Block",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-8",
            "title": "f-Block",
            "tamilTitle": "f-Block",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-8-1",
                "title": "Basics of f-Block",
                "tamilTitle": "f-Block அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U8-N1",
                    "conceptCode": "CHE-STD12-U8-N1",
                    "name": "Concept 1 of f-Block",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of f-Block",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U8-N2",
                    "conceptCode": "CHE-STD12-U8-N2",
                    "name": "Concept 2 of f-Block",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of f-Block",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-9",
            "title": "Coordination Compounds",
            "tamilTitle": "Coordination Compounds",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-9-1",
                "title": "Basics of Coordination Compounds",
                "tamilTitle": "Coordination Compounds அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U9-N1",
                    "conceptCode": "CHE-STD12-U9-N1",
                    "name": "Concept 1 of Coordination Compounds",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Coordination Compounds",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U9-N2",
                    "conceptCode": "CHE-STD12-U9-N2",
                    "name": "Concept 2 of Coordination Compounds",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Coordination Compounds",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-10",
            "title": "Haloalkanes",
            "tamilTitle": "Haloalkanes",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-10-1",
                "title": "Basics of Haloalkanes",
                "tamilTitle": "Haloalkanes அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U10-N1",
                    "conceptCode": "CHE-STD12-U10-N1",
                    "name": "Concept 1 of Haloalkanes",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Haloalkanes",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U10-N2",
                    "conceptCode": "CHE-STD12-U10-N2",
                    "name": "Concept 2 of Haloalkanes",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Haloalkanes",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-11",
            "title": "Alcohols",
            "tamilTitle": "Alcohols",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-11-1",
                "title": "Basics of Alcohols",
                "tamilTitle": "Alcohols அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U11-N1",
                    "conceptCode": "CHE-STD12-U11-N1",
                    "name": "Concept 1 of Alcohols",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Alcohols",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U11-N2",
                    "conceptCode": "CHE-STD12-U11-N2",
                    "name": "Concept 2 of Alcohols",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Alcohols",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-12",
            "title": "Aldehydes",
            "tamilTitle": "Aldehydes",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-12-1",
                "title": "Basics of Aldehydes",
                "tamilTitle": "Aldehydes அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U12-N1",
                    "conceptCode": "CHE-STD12-U12-N1",
                    "name": "Concept 1 of Aldehydes",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Aldehydes",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U12-N2",
                    "conceptCode": "CHE-STD12-U12-N2",
                    "name": "Concept 2 of Aldehydes",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Aldehydes",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-13",
            "title": "Amines",
            "tamilTitle": "Amines",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-13-1",
                "title": "Basics of Amines",
                "tamilTitle": "Amines அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U13-N1",
                    "conceptCode": "CHE-STD12-U13-N1",
                    "name": "Concept 1 of Amines",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Amines",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U13-N2",
                    "conceptCode": "CHE-STD12-U13-N2",
                    "name": "Concept 2 of Amines",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Amines",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-14",
            "title": "Biomolecules",
            "tamilTitle": "Biomolecules",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-14-1",
                "title": "Basics of Biomolecules",
                "tamilTitle": "Biomolecules அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U14-N1",
                    "conceptCode": "CHE-STD12-U14-N1",
                    "name": "Concept 1 of Biomolecules",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Biomolecules",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U14-N2",
                    "conceptCode": "CHE-STD12-U14-N2",
                    "name": "Concept 2 of Biomolecules",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Biomolecules",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-15",
            "title": "Polymers",
            "tamilTitle": "Polymers",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-15-1",
                "title": "Basics of Polymers",
                "tamilTitle": "Polymers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U15-N1",
                    "conceptCode": "CHE-STD12-U15-N1",
                    "name": "Concept 1 of Polymers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Polymers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U15-N2",
                    "conceptCode": "CHE-STD12-U15-N2",
                    "name": "Concept 2 of Polymers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Polymers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-che-16",
            "title": "Chemistry in Everyday Life",
            "tamilTitle": "Chemistry in Everyday Life",
            "microTopics": [
              {
                "id": "mt-STD12-CHE-16-1",
                "title": "Basics of Chemistry in Everyday Life",
                "tamilTitle": "Chemistry in Everyday Life அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "CHE-STD12-U16-N1",
                    "conceptCode": "CHE-STD12-U16-N1",
                    "name": "Concept 1 of Chemistry in Everyday Life",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Chemistry in Everyday Life",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "CHE-STD12-U16-N2",
                    "conceptCode": "CHE-STD12-U16-N2",
                    "name": "Concept 2 of Chemistry in Everyday Life",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Chemistry in Everyday Life",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-12-bio",
        "title": "Biology",
        "tamilTitle": "உயிரியல்",
        "chapters": [
          {
            "id": "chap-12-bio-1",
            "title": "Reproduction in Organisms",
            "tamilTitle": "Reproduction in Organisms",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-1-1",
                "title": "Basics of Reproduction in Organisms",
                "tamilTitle": "Reproduction in Organisms அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U1-N1",
                    "conceptCode": "BIO-STD12-U1-N1",
                    "name": "Concept 1 of Reproduction in Organisms",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Reproduction in Organisms",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U1-N2",
                    "conceptCode": "BIO-STD12-U1-N2",
                    "name": "Concept 2 of Reproduction in Organisms",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Reproduction in Organisms",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-2",
            "title": "Sexual Reproduction",
            "tamilTitle": "Sexual Reproduction",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-2-1",
                "title": "Basics of Sexual Reproduction",
                "tamilTitle": "Sexual Reproduction அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U2-N1",
                    "conceptCode": "BIO-STD12-U2-N1",
                    "name": "Concept 1 of Sexual Reproduction",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Sexual Reproduction",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U2-N2",
                    "conceptCode": "BIO-STD12-U2-N2",
                    "name": "Concept 2 of Sexual Reproduction",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Sexual Reproduction",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-3",
            "title": "Human Reproduction",
            "tamilTitle": "Human Reproduction",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-3-1",
                "title": "Basics of Human Reproduction",
                "tamilTitle": "Human Reproduction அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U3-N1",
                    "conceptCode": "BIO-STD12-U3-N1",
                    "name": "Concept 1 of Human Reproduction",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Human Reproduction",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U3-N2",
                    "conceptCode": "BIO-STD12-U3-N2",
                    "name": "Concept 2 of Human Reproduction",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Human Reproduction",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-4",
            "title": "Reproductive Health",
            "tamilTitle": "Reproductive Health",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-4-1",
                "title": "Basics of Reproductive Health",
                "tamilTitle": "Reproductive Health அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U4-N1",
                    "conceptCode": "BIO-STD12-U4-N1",
                    "name": "Concept 1 of Reproductive Health",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Reproductive Health",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U4-N2",
                    "conceptCode": "BIO-STD12-U4-N2",
                    "name": "Concept 2 of Reproductive Health",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Reproductive Health",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-5",
            "title": "Genetics",
            "tamilTitle": "Genetics",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-5-1",
                "title": "Basics of Genetics",
                "tamilTitle": "Genetics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U5-N1",
                    "conceptCode": "BIO-STD12-U5-N1",
                    "name": "Concept 1 of Genetics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Genetics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U5-N2",
                    "conceptCode": "BIO-STD12-U5-N2",
                    "name": "Concept 2 of Genetics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Genetics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-6",
            "title": "Molecular Biology",
            "tamilTitle": "Molecular Biology",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-6-1",
                "title": "Basics of Molecular Biology",
                "tamilTitle": "Molecular Biology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U6-N1",
                    "conceptCode": "BIO-STD12-U6-N1",
                    "name": "Concept 1 of Molecular Biology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Molecular Biology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U6-N2",
                    "conceptCode": "BIO-STD12-U6-N2",
                    "name": "Concept 2 of Molecular Biology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Molecular Biology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-7",
            "title": "Evolution",
            "tamilTitle": "Evolution",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-7-1",
                "title": "Basics of Evolution",
                "tamilTitle": "Evolution அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U7-N1",
                    "conceptCode": "BIO-STD12-U7-N1",
                    "name": "Concept 1 of Evolution",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Evolution",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U7-N2",
                    "conceptCode": "BIO-STD12-U7-N2",
                    "name": "Concept 2 of Evolution",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Evolution",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-8",
            "title": "Health",
            "tamilTitle": "Health",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-8-1",
                "title": "Basics of Health",
                "tamilTitle": "Health அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U8-N1",
                    "conceptCode": "BIO-STD12-U8-N1",
                    "name": "Concept 1 of Health",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Health",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U8-N2",
                    "conceptCode": "BIO-STD12-U8-N2",
                    "name": "Concept 2 of Health",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Health",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-9",
            "title": "Immunity",
            "tamilTitle": "Immunity",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-9-1",
                "title": "Basics of Immunity",
                "tamilTitle": "Immunity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U9-N1",
                    "conceptCode": "BIO-STD12-U9-N1",
                    "name": "Concept 1 of Immunity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Immunity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U9-N2",
                    "conceptCode": "BIO-STD12-U9-N2",
                    "name": "Concept 2 of Immunity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Immunity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-10",
            "title": "Strategies for Food Enhancement",
            "tamilTitle": "Strategies for Food Enhancement",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-10-1",
                "title": "Basics of Strategies for Food Enhancement",
                "tamilTitle": "Strategies for Food Enhancement அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U10-N1",
                    "conceptCode": "BIO-STD12-U10-N1",
                    "name": "Concept 1 of Strategies for Food Enhancement",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Strategies for Food Enhancement",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U10-N2",
                    "conceptCode": "BIO-STD12-U10-N2",
                    "name": "Concept 2 of Strategies for Food Enhancement",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Strategies for Food Enhancement",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-11",
            "title": "Microbes",
            "tamilTitle": "Microbes",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-11-1",
                "title": "Basics of Microbes",
                "tamilTitle": "Microbes அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U11-N1",
                    "conceptCode": "BIO-STD12-U11-N1",
                    "name": "Concept 1 of Microbes",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Microbes",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U11-N2",
                    "conceptCode": "BIO-STD12-U11-N2",
                    "name": "Concept 2 of Microbes",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Microbes",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-12",
            "title": "Biotechnology",
            "tamilTitle": "Biotechnology",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-12-1",
                "title": "Basics of Biotechnology",
                "tamilTitle": "Biotechnology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U12-N1",
                    "conceptCode": "BIO-STD12-U12-N1",
                    "name": "Concept 1 of Biotechnology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Biotechnology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U12-N2",
                    "conceptCode": "BIO-STD12-U12-N2",
                    "name": "Concept 2 of Biotechnology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Biotechnology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-13",
            "title": "Ecology",
            "tamilTitle": "Ecology",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-13-1",
                "title": "Basics of Ecology",
                "tamilTitle": "Ecology அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U13-N1",
                    "conceptCode": "BIO-STD12-U13-N1",
                    "name": "Concept 1 of Ecology",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Ecology",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U13-N2",
                    "conceptCode": "BIO-STD12-U13-N2",
                    "name": "Concept 2 of Ecology",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Ecology",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-14",
            "title": "Biodiversity",
            "tamilTitle": "Biodiversity",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-14-1",
                "title": "Basics of Biodiversity",
                "tamilTitle": "Biodiversity அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U14-N1",
                    "conceptCode": "BIO-STD12-U14-N1",
                    "name": "Concept 1 of Biodiversity",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Biodiversity",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U14-N2",
                    "conceptCode": "BIO-STD12-U14-N2",
                    "name": "Concept 2 of Biodiversity",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Biodiversity",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-bio-15",
            "title": "Environmental Issues",
            "tamilTitle": "Environmental Issues",
            "microTopics": [
              {
                "id": "mt-STD12-BIO-15-1",
                "title": "Basics of Environmental Issues",
                "tamilTitle": "Environmental Issues அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "BIO-STD12-U15-N1",
                    "conceptCode": "BIO-STD12-U15-N1",
                    "name": "Concept 1 of Environmental Issues",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Environmental Issues",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "BIO-STD12-U15-N2",
                    "conceptCode": "BIO-STD12-U15-N2",
                    "name": "Concept 2 of Environmental Issues",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Environmental Issues",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "subj-12-mat",
        "title": "Mathematics",
        "tamilTitle": "கணிதம்",
        "chapters": [
          {
            "id": "chap-12-mat-1",
            "title": "Matrices",
            "tamilTitle": "Matrices",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-1-1",
                "title": "Basics of Matrices",
                "tamilTitle": "Matrices அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U1-N1",
                    "conceptCode": "MAT-STD12-U1-N1",
                    "name": "Concept 1 of Matrices",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Matrices",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U1-N2",
                    "conceptCode": "MAT-STD12-U1-N2",
                    "name": "Concept 2 of Matrices",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Matrices",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-2",
            "title": "Vector Algebra",
            "tamilTitle": "Vector Algebra",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-2-1",
                "title": "Basics of Vector Algebra",
                "tamilTitle": "Vector Algebra அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U2-N1",
                    "conceptCode": "MAT-STD12-U2-N1",
                    "name": "Concept 1 of Vector Algebra",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Vector Algebra",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U2-N2",
                    "conceptCode": "MAT-STD12-U2-N2",
                    "name": "Concept 2 of Vector Algebra",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Vector Algebra",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-3",
            "title": "Complex Numbers",
            "tamilTitle": "Complex Numbers",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-3-1",
                "title": "Basics of Complex Numbers",
                "tamilTitle": "Complex Numbers அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U3-N1",
                    "conceptCode": "MAT-STD12-U3-N1",
                    "name": "Concept 1 of Complex Numbers",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Complex Numbers",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U3-N2",
                    "conceptCode": "MAT-STD12-U3-N2",
                    "name": "Concept 2 of Complex Numbers",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Complex Numbers",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-4",
            "title": "Analytical Geometry",
            "tamilTitle": "Analytical Geometry",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-4-1",
                "title": "Basics of Analytical Geometry",
                "tamilTitle": "Analytical Geometry அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U4-N1",
                    "conceptCode": "MAT-STD12-U4-N1",
                    "name": "Concept 1 of Analytical Geometry",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Analytical Geometry",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U4-N2",
                    "conceptCode": "MAT-STD12-U4-N2",
                    "name": "Concept 2 of Analytical Geometry",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Analytical Geometry",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-5",
            "title": "Ordinary Differential Equations",
            "tamilTitle": "Ordinary Differential Equations",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-5-1",
                "title": "Basics of Ordinary Differential Equations",
                "tamilTitle": "Ordinary Differential Equations அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U5-N1",
                    "conceptCode": "MAT-STD12-U5-N1",
                    "name": "Concept 1 of Ordinary Differential Equations",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Ordinary Differential Equations",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U5-N2",
                    "conceptCode": "MAT-STD12-U5-N2",
                    "name": "Concept 2 of Ordinary Differential Equations",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Ordinary Differential Equations",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-6",
            "title": "Probability",
            "tamilTitle": "Probability",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-6-1",
                "title": "Basics of Probability",
                "tamilTitle": "Probability அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U6-N1",
                    "conceptCode": "MAT-STD12-U6-N1",
                    "name": "Concept 1 of Probability",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Probability",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U6-N2",
                    "conceptCode": "MAT-STD12-U6-N2",
                    "name": "Concept 2 of Probability",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Probability",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-7",
            "title": "Discrete Mathematics",
            "tamilTitle": "Discrete Mathematics",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-7-1",
                "title": "Basics of Discrete Mathematics",
                "tamilTitle": "Discrete Mathematics அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U7-N1",
                    "conceptCode": "MAT-STD12-U7-N1",
                    "name": "Concept 1 of Discrete Mathematics",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Discrete Mathematics",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U7-N2",
                    "conceptCode": "MAT-STD12-U7-N2",
                    "name": "Concept 2 of Discrete Mathematics",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Discrete Mathematics",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-8",
            "title": "Groups",
            "tamilTitle": "Groups",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-8-1",
                "title": "Basics of Groups",
                "tamilTitle": "Groups அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U8-N1",
                    "conceptCode": "MAT-STD12-U8-N1",
                    "name": "Concept 1 of Groups",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Groups",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U8-N2",
                    "conceptCode": "MAT-STD12-U8-N2",
                    "name": "Concept 2 of Groups",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Groups",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          },
          {
            "id": "chap-12-mat-9",
            "title": "Integral Calculus Applications",
            "tamilTitle": "Integral Calculus Applications",
            "microTopics": [
              {
                "id": "mt-STD12-MAT-9-1",
                "title": "Basics of Integral Calculus Applications",
                "tamilTitle": "Integral Calculus Applications அடிப்படைகள்",
                "nanoConcepts": [
                  {
                    "id": "MAT-STD12-U9-N1",
                    "conceptCode": "MAT-STD12-U9-N1",
                    "name": "Concept 1 of Integral Calculus Applications",
                    "tamilName": "கருத்து 1",
                    "description": "Detailed study of Concept 1 of Integral Calculus Applications",
                    "questionType": "1-Mark MCQ",
                    "estimatedMinutes": 20
                  },
                  {
                    "id": "MAT-STD12-U9-N2",
                    "conceptCode": "MAT-STD12-U9-N2",
                    "name": "Concept 2 of Integral Calculus Applications",
                    "tamilName": "கருத்து 2",
                    "description": "Detailed study of Concept 2 of Integral Calculus Applications",
                    "questionType": "2-Mark",
                    "estimatedMinutes": 20
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};


// Normalize raw K12 data to match OfficialCourseSyllabus interface
function normalizeK12Entry(key: string, raw: any): any {
  if (!raw) return raw;

  const subjects = (raw.subjects || []).map((s: any) => ({
    subjectId: s.id || s.subjectId || key + '-s',
    subjectName: s.title || s.subjectName || 'Subject',
    tamilName: s.tamilTitle || s.tamilName,
    icon: s.icon || '📚',
    color: s.color || '#2563eb',
    totalChapters: (s.chapters || []).length,
    totalTopics: (s.chapters || []).reduce((sum: number, ch: any) => sum + ((ch.microTopics || ch.topics || []).length), 0),
    totalNanoConcepts: (s.chapters || []).reduce((sum: number, ch: any) => {
      return sum + (ch.microTopics || ch.topics || []).reduce((ts: number, t: any) => ts + ((t.nanoConcepts || []).length), 0);
    }, 0),
    totalMarks: s.totalMarks || 100,
    chapters: (s.chapters || []).map((ch: any, ci: number) => ({
      chapterNumber: ch.chapterNumber || ci + 1,
      chapterTitle: ch.title || ch.chapterTitle || 'Chapter ' + (ci + 1),
      tamilTitle: ch.tamilTitle,
      unitNumber: ch.unitNumber || ch.unit || ('Unit ' + (ci + 1)),
      term: ch.term || 'Full Year',
      description: ch.description,
      topicsCount: (ch.microTopics || ch.topics || []).length,
      isFreePreview: ci === 0,
      topics: (ch.microTopics || ch.topics || []).map((t: any, ti: number) => ({
        id: t.id || key + '_t' + ci + '_' + ti,
        topicCode: t.topicCode || t.conceptCode || (key.toUpperCase().replace(/-/g, '') + '-C' + ci + '-T' + ti),
        title: t.title || t.name || 'Topic ' + (ti + 1),
        tamilTitle: t.tamilTitle || t.tamilName,
        keyAxiomOrLaw: t.keyAxiomOrLaw || t.keyRule,
        keyFormula: t.keyFormula || t.keyRuleOrFormula,
        marksWeightage: t.marksWeightage,
        questionArchetype: t.questionArchetype || t.questionType,
        estimatedMinutes: t.estimatedMinutes || 15,
        importance: t.importance || 'Core Standard',
        hasVideo: t.hasVideo !== undefined ? t.hasVideo : true,
        hasNotes: t.hasNotes !== undefined ? t.hasNotes : true,
        hasQuiz: t.hasQuiz !== undefined ? t.hasQuiz : true,
        nanoConcepts: (t.nanoConcepts || []).map((n: any) => ({
          id: n.id || n.conceptCode,
          conceptCode: n.conceptCode || n.id,
          name: n.name || n.title || 'Concept',
          tamilName: n.tamilName || n.tamilTitle,
          description: n.description || '',
          keyRuleOrFormula: n.keyRuleOrFormula || n.keyRule || n.keyFormula,
          solvedExampleOrLaw: n.solvedExampleOrLaw || n.example,
          questionType: n.questionType || '2-Mark Short Answer',
          estimatedMinutes: n.estimatedMinutes || 10,
          pyqReferences: n.pyqReferences || [],
        })),
      })),
    })),
  }));

  const totalChapters = subjects.reduce((s: number, subj: any) => s + subj.totalChapters, 0);
  const totalTopics = subjects.reduce((s: number, subj: any) => s + subj.totalTopics, 0);
  const totalNano = subjects.reduce((s: number, subj: any) => s + (subj.totalNanoConcepts || 0), 0);

  return {
    courseId: raw.id || raw.courseId || key,
    courseTitle: raw.title || raw.courseTitle || key.toUpperCase(),
    boardOrAuthority: raw.boardOrAuthority || raw.board || 'Government of Tamil Nadu - SCERT & DGE Samacheer Kalvi',
    notificationRef: raw.notificationRef || raw.notification || 'Official Curriculum Blueprint (G.O. Ms. No. 132)',
    gazetteOrder: raw.gazetteOrder,
    academicYear: raw.academicYear || '2025-2026',
    medium: raw.medium || 'Bilingual',
    examPatternSummary: raw.examPatternSummary || raw.examPattern || 'Term-wise Evaluation',
    markingScheme: raw.markingScheme || 'CCE + Summative Exams (100 Marks)',
    totalSubjects: subjects.length,
    totalChapters,
    totalTopics,
    totalNanoConcepts: totalNano,
    subjects,
  };
}

export const K12_SYLLABI: Record<string, any> = Object.fromEntries(
  Object.entries(RAW_K12_DATA).map(([key, val]) => [key, normalizeK12Entry(key, val)])
);
