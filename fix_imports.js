const fs = require('fs'); 
const file = 'C:/Users/fastg/.gemini/antigravity/scratch/wacrm/apps/web/src/app/(aishlee)/admin/course-builder/page.tsx'; 
const src = 'C:/Users/fastg/.gemini/antigravity/scratch/aishlee-web/src/pages/AdminCourseBuilder.jsx'; 
let content = fs.readFileSync(src, 'utf8'); 
content = "'use client';\n" + content; 

// Replace routing
content = content.replace(/import \{ useNavigate, useLocation \} from 'react-router-dom';/g, "import { useRouter, useSearchParams } from 'next/navigation';"); 
content = content.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();\n  const navigate = (path: any) => router.push(path);"); 
content = content.replace(/const location = useLocation\(\);/g, "const searchParams = useSearchParams();\n  const location = { state: { editCourse: null } } as any;"); 

// Replace paths
content = content.replace(/\.\.\/context\/AppProvider/g, '@/aishlee/context/AppProvider'); 
content = content.replace(/\.\.\/services\/geminiService/g, '@/aishlee/services/geminiService'); 
content = content.replace(/\.\.\/services\/lmsService/g, '@/aishlee/services/lmsService'); 
content = content.replace(/\.\.\/constants\/exams/g, '@/aishlee/constants/exams'); 
content = content.replace(/\.\.\/lib\/supabaseClient/g, '@/aishlee/lib/supabaseClient'); 
content = content.replace(/\.\.\/services\/youtubeService/g, '@/aishlee/services/youtubeService'); 

// Replace TS Types
content = content.replace(/const \[curriculum, setCurriculum\] = useState\(\[\]\);/g, "const [curriculum, setCurriculum] = useState<any[]>([]);"); 
content = content.replace(/catch \(err\)/g, "catch (err: any)"); 

// Fix API key issues
content = content.replace(/await geminiService.generateCourseSyllabus\(title, category, language, apiKey\);/g, "await geminiService.generateCourseSyllabus(title, category, language, apiKey || '');"); 
content = content.replace(/generateCompleteTopicContent\(title, topic.title, category, language, quizCount, quizDifficulty, apiKey\)/g, "generateCompleteTopicContent(title, topic.title, category, language, quizCount, quizDifficulty, apiKey || '')"); 
content = content.replace(/generateTopicContent\(title, topic.title, category, language, apiKey\)/g, "generateTopicContent(title, topic.title, category, language, apiKey || '')"); 
content = content.replace(/generateQuizForTopic\(title, topic.title, category, language, quizCount, quizDifficulty, apiKey\)/g, "generateQuizForTopic(title, topic.title, category, language, quizCount, quizDifficulty, apiKey || '')"); 

fs.writeFileSync(file, content);
console.log("File patched successfully!");
