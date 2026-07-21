// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/aishlee/context/AppProvider';
import { geminiService } from '@/aishlee/services/geminiService';
import { lmsService } from '@/aishlee/services/lmsService';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, BookOpen, ChevronRight, Video, FileText, CheckCircle, ArrowLeft, Loader, Plus, Save, Share2, Link as LinkIcon, Database, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { EXAM_CATEGORIES } from '@/aishlee/constants/exams';
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { youtubeService } from '@/aishlee/services/youtubeService';

const coachLink = "Need help? Contact your Coach on WhatsApp: [Click here](https://wa.me/916381029380)";

const seoBasicCurriculum = [
  {
    title: "Module 1: Foundations of SEO",
    topics: [
      {
        title: "SEO Tool Proficiency",
        content: "Learn how to use Semrush, Ahrefs, and Moz for daily SEO operations. Understand the dashboard and key metrics.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/PjhJ2oW9eD0",
        ai_quiz: [
          { question: "Which tool is primarily used for comprehensive SEO analysis?", options: ["Ahrefs", "Canva", "Trello", "Slack"], answer: "Ahrefs" },
          { question: "What is the main purpose of SEO tools?", options: ["Creating images", "Analyzing website performance and keywords", "Writing code", "Sending emails"], answer: "Analyzing website performance and keywords" },
          { question: "Which metric is commonly tracked in SEO tools?", options: ["Followers", "Domain Authority", "Likes", "Retweets"], answer: "Domain Authority" }
        ]
      },
      {
        title: "Google Analytics",
        content: "Master Google Analytics 4 (GA4). Learn to track traffic, setup events, and monitor conversions.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/U3B5P1vA23I",
        ai_quiz: [
          { question: "What is GA4?", options: ["A social network", "Google Analytics 4", "A video game", "A cloud storage service"], answer: "Google Analytics 4" },
          { question: "What can you track with Google Analytics?", options: ["Website traffic and user behavior", "Server temperature", "Employee salaries", "Physical inventory"], answer: "Website traffic and user behavior" },
          { question: "What is a 'Session' in Analytics?", options: ["A period of time a user is active on your site", "A meeting with Google", "A type of cookie", "A database query"], answer: "A period of time a user is active on your site" }
        ]
      }
    ]
  },
  {
    title: "Module 2: Keyword & Content Optimization",
    topics: [
      {
        title: "Keyword Strategy",
        content: "Discover search intent, identify long-tail keywords, and plan a content calendar around keyword clusters.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/xsVTqzcsI7M",
        ai_quiz: [
          { question: "What is a long-tail keyword?", options: ["A very short keyword", "A highly specific, longer search phrase", "A keyword that ends in 'tail'", "A keyword with low search volume and high competition"], answer: "A highly specific, longer search phrase" },
          { question: "Why is search intent important?", options: ["It dictates the color of the website", "It tells you why the user is searching", "It reduces hosting costs", "It hides the website from competitors"], answer: "It tells you why the user is searching" },
          { question: "What is a keyword cluster?", options: ["A group of related keywords", "A server farm", "A spam technique", "A type of backlink"], answer: "A group of related keywords" }
        ]
      },
      {
        title: "Content SEO Alignment",
        content: "Optimize headings, improve readability, and ensure appropriate keyword density without keyword stuffing.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/qYmG4eD5z70",
        ai_quiz: [
          { question: "What is keyword stuffing?", options: ["Using a keyword too many times", "Adding keywords to a database", "Hiding keywords in images", "Buying keywords"], answer: "Using a keyword too many times" },
          { question: "Which HTML tag is most important for a page title?", options: ["<h1>", "<b>", "<i>", "<span>"], answer: "<h1>" },
          { question: "Why is readability important for SEO?", options: ["It helps search engines parse code", "It keeps users engaged and lowers bounce rate", "It increases server speed", "It is required by law"], answer: "It keeps users engaged and lowers bounce rate" }
        ]
      },
      {
        title: "On-Page Optimization",
        content: "Master meta tags, URL structuring, and internal linking strategies to boost page relevance.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/Pj13k8V-kEI",
        ai_quiz: [
          { question: "What is a meta description?", options: ["A summary of the page content shown in search results", "The main content of the page", "A hidden link", "A script that runs on page load"], answer: "A summary of the page content shown in search results" },
          { question: "What is an ideal URL structure?", options: ["Long and complex", "Short, descriptive, and containing the target keyword", "Containing only numbers", "Randomly generated"], answer: "Short, descriptive, and containing the target keyword" },
          { question: "What is internal linking?", options: ["Linking to other domains", "Linking to pages within the same website", "Linking from social media", "Linking to a payment gateway"], answer: "Linking to pages within the same website" }
        ]
      }
    ]
  }
];

const seoAdvancedCurriculum = [
  {
    title: "Module 1: Technical & Off-Page SEO",
    topics: [
      {
        title: "SEO Audits",
        content: "Perform comprehensive technical audits. Cover crawling, indexing, and Core Web Vitals.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/5aC4j4tF4kQ",
        ai_quiz: [
          { question: "What does an SEO audit primarily check?", options: ["Website design", "Technical health and SEO performance", "Company financial records", "Employee performance"], answer: "Technical health and SEO performance" },
          { question: "What are Core Web Vitals?", options: ["Metrics related to speed, responsiveness, and visual stability", "The main HTML tags", "The most important backlinks", "A list of target keywords"], answer: "Metrics related to speed, responsiveness, and visual stability" },
          { question: "What is a crawling error?", options: ["When a user scrolls too fast", "When search engine bots cannot access a page", "When a website is hacked", "When a server crashes"], answer: "When search engine bots cannot access a page" }
        ]
      },
      {
        title: "Back Link Architecture",
        content: "Develop effective link building strategies and understand the importance of anchor text and link quality.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/7X8mC0F7n-k",
        ai_quiz: [
          { question: "What is a backlink?", options: ["A link from another website to yours", "A link on your homepage", "A link to a deleted page", "A link in a local file"], answer: "A link from another website to yours" },
          { question: "What is anchor text?", options: ["The clickable text in a hyperlink", "Text that is locked in place", "The footer text", "The main heading of a page"], answer: "The clickable text in a hyperlink" },
          { question: "Why is link quality important?", options: ["High-quality links pass more authority", "It saves bandwidth", "It looks better", "It is required for HTTPS"], answer: "High-quality links pass more authority" }
        ]
      }
    ]
  },
  {
    title: "Module 2: Advanced SEO Tactics",
    topics: [
      {
        title: "Competitor Analysis",
        content: "Identify keyword gaps, backlink gaps, and reverse engineer competitor success.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/0G3h0R-N340",
        ai_quiz: [
          { question: "What is a keyword gap analysis?", options: ["Finding keywords competitors rank for that you do not", "Deleting old keywords", "Finding mispelled keywords", "Counting the number of keywords on a page"], answer: "Finding keywords competitors rank for that you do not" },
          { question: "Why analyze competitors?", options: ["To copy their design", "To identify opportunities and improve your strategy", "To hack their site", "To report them to Google"], answer: "To identify opportunities and improve your strategy" },
          { question: "Which tool is often used for competitor backlink analysis?", options: ["Ahrefs", "Microsoft Word", "Adobe Photoshop", "Zoom"], answer: "Ahrefs" }
        ]
      },
      {
        title: "Local and Voice Search",
        content: "Optimize for Google My Business and implement schema markup for rich snippets and voice search readiness.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/d3J2Z2qG5Y8",
        ai_quiz: [
          { question: "What is Google My Business essential for?", options: ["Local SEO", "Global SEO", "Social Media", "Email Marketing"], answer: "Local SEO" },
          { question: "What does Schema markup help achieve?", options: ["Rich snippets in search results", "Faster server response", "Better image compression", "More social media followers"], answer: "Rich snippets in search results" },
          { question: "How does voice search differ from text search?", options: ["Queries are often longer and more conversational", "Queries are shorter", "Queries don't use keywords", "Voice search only works on mobile"], answer: "Queries are often longer and more conversational" }
        ]
      },
      {
        title: "Performance Tracking",
        content: "Set up reporting dashboards and track KPIs to demonstrate SEO ROI.\n\n" + coachLink,
        video_url: "https://www.youtube.com/embed/3zH2x3gX_Yk",
        ai_quiz: [
          { question: "What is a KPI?", options: ["Key Performance Indicator", "Key Page Index", "Keyword Position Indicator", "Known Problem Issue"], answer: "Key Performance Indicator" },
          { question: "Which tool is commonly used for SEO reporting dashboards?", options: ["Google Data Studio (Looker Studio)", "Microsoft Paint", "Notepad", "Audacity"], answer: "Google Data Studio (Looker Studio)" },
          { question: "Why is performance tracking crucial?", options: ["To measure the success and ROI of SEO efforts", "To increase server costs", "To slow down the website", "To generate random numbers"], answer: "To measure the success and ROI of SEO efforts" }
        ]
      }
    ]
  }
];

export default function AdminCourseBuilder() {
  const { currentUser } = useApp();
  const router = useRouter();
  const navigate = (path: any) => router.push(path);
  const searchParams = useSearchParams();
  const location = { state: { editCourse: null } } as any;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingCourseId, setEditingCourseId] = useState<any>(null);

  // Course Meta
  const [productType, setProductType] = useState('Course');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState('TNPSC Group 4 & VAO');
  const [language, setLanguage] = useState('Tamil');
  const [price, setPrice] = useState(0);

  // Syllabus State
  const [curriculum, setCurriculum] = useState<any[]>([]);
  
  // Editor State
  const [activeModuleIdx, setActiveModuleIdx] = useState<any>(null);
  const [activeTopicIdx, setActiveTopicIdx] = useState<any>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editVideo, setEditVideo] = useState<string>('');
  const [editPdf, setEditPdf] = useState<string>('');
  const [editTestLink, setEditTestLink] = useState<string>('');
  const [editAiQuiz, setEditAiQuiz] = useState<string>('');

  // Quiz Builder State
  const [quizCount, setQuizCount] = useState(5);
  const [quizType, setQuizType] = useState('Multiple Choice');
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [quizContext, setQuizContext] = useState<string>('');

  // Test Series State
  const [testSource, setTestSource] = useState('Google Sheet');
  const [testUrl, setTestUrl] = useState<string>('');
  const [testStart, setTestStart] = useState<string>('');
  const [testEnd, setTestEnd] = useState<string>('');
  const [isProctored, setIsProctored] = useState(false);
  const [limitAttempts, setLimitAttempts] = useState(true);

  // Bulk Generation State
  const [bulkGenContent, setBulkGenContent] = useState(false);
  const [bulkGenVideos, setBulkGenVideos] = useState(false);
  const [bulkGenQuizzes, setBulkGenQuizzes] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string>('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';

  useEffect(() => {
    if (location.state?.editCourse) {
      const course = location.state.editCourse;
      setEditingCourseId(course.id);
      setTitle(course.title);
      setProductType(course.type);
      setCategory(course.class_level);
      setLanguage(course.language);
      setPrice(course.price);
      
      if (course.type === 'Test Series') {
        const config = course.curriculum?.[0] || {};
        setTestSource(config.test_source || 'Google Sheet');
        setTestUrl(config.url || '');
        setTestStart(config.start || '');
        setTestEnd(config.end || '');
        setIsProctored(config.is_proctored || false);
        setLimitAttempts(config.limit_attempts !== undefined ? config.limit_attempts : true);
        setStep(1);
      } else {
        setCurriculum(course.curriculum || []);
        setStep(2); // Jump straight to content editor for courses
      }
    }
  }, [location.state]);

  if (!isAdmin) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Access Denied. Admins only.</div>;
  }

  const handleGenerateSyllabus = async () => {
    if (!title.trim()) return setError('Please enter a course title/topic first.');
    if (productType === 'Test Series') {
      if (!testUrl.trim()) return setError('Please enter the data source URL.');
      const testConfig = [{
        test_source: testSource,
        url: testUrl,
        start: testStart,
        end: testEnd,
        is_proctored: isProctored,
        limit_attempts: limitAttempts
      }];
      setCurriculum(testConfig);
      await handlePublishWithCurriculum(testConfig);
      return;
    }
    
    setLoading(true);
    setError('');
    setBulkProgress('Generating Syllabus...');
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const generatedSyllabus = await geminiService.generateCourseSyllabus(title, category, language, apiKey || '');
      
      let finalCurriculum = generatedSyllabus;

      setCurriculum(finalCurriculum);
      setBulkProgress('');
      setStep(2);
    } catch (err: any) {
      setError('Failed to generate syllabus. Ensure your topic is clear. Error: ' + err.message);
      setBulkProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBulkContent = async () => {
    if (!bulkGenContent && !bulkGenVideos && !bulkGenQuizzes) {
      return setError("Please select at least one content type to generate.");
    }
    
    setLoading(true);
    setError('');
    const apiKey = localStorage.getItem('gemini_api_key');
    let finalCurriculum = [...curriculum];
    
    try {
      for (let mIdx = 0; mIdx < finalCurriculum.length; mIdx++) {
        for (let tIdx = 0; tIdx < finalCurriculum[mIdx].topics.length; tIdx++) {
          const topic = finalCurriculum[mIdx].topics[tIdx];
          
          // Skip if already filled? The user might want to overwrite, but let's just generate for what's requested
          setBulkProgress(`Generating Content: ${finalCurriculum[mIdx].module_title} -> ${topic.title}...`);
          
          let newContent = topic.content || '';
          let newVideo = topic.video_url || '';
          let newQuiz = topic.ai_quiz ? JSON.stringify(topic.ai_quiz) : '';

          const isContentShortOrMissing = !newContent || newContent.length < 1000;

          // 1. Content & Quiz (Generate this FIRST to use for YouTube search)
          if (bulkGenContent && bulkGenQuizzes && (isContentShortOrMissing || !topic.ai_quiz)) {
             const res = await geminiService.generateCompleteTopicContent(title, topic.title, category, language, quizCount, quizDifficulty, apiKey || '');
             newContent = res.content;
             newQuiz = res.ai_quiz;
          } else if (bulkGenContent && isContentShortOrMissing) {
             newContent = await geminiService.generateMicroContent(title, topic.title, category, language, apiKey || '');
          } else if (bulkGenQuizzes && !topic.ai_quiz) {
             newQuiz = await geminiService.generateInteractiveQuiz(topic.title, category, language, quizCount, quizType, quizDifficulty, quizContext, apiKey || '');
          }

          // 2. YouTube Video (Use generated content for better search)
          if (bulkGenVideos && !newVideo) {
            const videoUrl = await youtubeService.searchMultipleVideos(title, topic.title, newContent);
            if (videoUrl) {
              newVideo = videoUrl;
            } else {
              setError(`Could not find YouTube videos for: ${topic.title}`);
            }
          }

          finalCurriculum[mIdx].topics[tIdx] = {
            ...topic,
            content: newContent,
            video_url: newVideo,
            ai_quiz: newQuiz ? (typeof newQuiz === 'string' ? JSON.parse(newQuiz) : newQuiz) : null
          };
          
          // Force UI update so user sees progress
          setCurriculum([...finalCurriculum]);
          
          // Auto-save to database after each topic finishes so progress isn't lost
          if (editingCourseId && currentUser) {
            try {
              await lmsService.updateCourse(editingCourseId, { curriculum: finalCurriculum }, currentUser.id);
            } catch (saveErr) {
              console.error('Auto-save failed for topic:', topic.title, saveErr);
            }
          }
          
          // If the currently open editor is this topic, update its text boxes so they don't stay blank
          if (activeModuleIdx === mIdx && activeTopicIdx === tIdx) {
            setEditContent(newContent || '');
            setEditVideo(newVideo || '');
            setEditAiQuiz(newQuiz ? (typeof newQuiz === 'object' ? JSON.stringify(newQuiz, null, 2) : newQuiz) : '');
          }
        }
      }
      setBulkProgress('');
    } catch (err: any) {
      setError('Content generation interrupted: ' + err.message);
      setBulkProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditor = (mIdx: number, tIdx: number) => {
    setActiveModuleIdx(mIdx);
    setActiveTopicIdx(tIdx);
    const topic = curriculum[mIdx].topics[tIdx];
    setEditContent(topic.content || '');
    setEditVideo(topic.video_url || '');
    setEditPdf(topic.pdf_url || '');
    setEditTestLink(topic.test_link || '');
    setEditAiQuiz(topic.ai_quiz ? JSON.stringify(topic.ai_quiz, null, 2) : '');
  };

  const handleGenerateMicroContent = async () => {
    if (activeModuleIdx === null || activeTopicIdx === null) return;
    setLoading(true);
    setError('');
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const topicName = curriculum[activeModuleIdx].topics[activeTopicIdx].title;
      const content = await geminiService.generateMicroContent(title, topicName, category, language, apiKey);
      setEditContent(content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (activeModuleIdx === null || activeTopicIdx === null) return;
    setLoading(true);
    setError('');
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const topicName = curriculum[activeModuleIdx].topics[activeTopicIdx].title;
      const quizResult = await geminiService.generateInteractiveQuiz(
        topicName, 
        category, 
        language, 
        quizCount,
        quizType,
        quizDifficulty,
        quizContext,
        apiKey
      );
      setEditAiQuiz(quizResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTopic = async () => {
    if (activeModuleIdx === null || activeTopicIdx === null) return;
    const newCurriculum = [...curriculum];
    newCurriculum[activeModuleIdx].topics[activeTopicIdx] = {
      ...newCurriculum[activeModuleIdx].topics[activeTopicIdx],
      content: editContent,
      video_url: editVideo,
      pdf_url: editPdf,
      test_link: editTestLink,
      ai_quiz: editAiQuiz ? editAiQuiz : null
    };
    setCurriculum(newCurriculum);
    
    if (editingCourseId) {
      setLoading(true);
      try {
        await lmsService.updateCourse(editingCourseId, { curriculum: newCurriculum }, currentUser.id);
        showToast('Topic Saved and Course Updated successfully!', 'success');
      } catch (e) {
        showToast(`Failed to save to database: ${e.message}`, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Topic Saved locally! Remember to click Publish Course when done building all topics.', 'info');
    }
  };

  const handleSharePDF = () => {
    if (!editContent.trim()) return showToast("No content available to export as PDF.", 'error');
    const doc = new jsPDF('p', 'mm', 'a4');
    const topicTitle = curriculum[activeModuleIdx].topics[activeTopicIdx].title;
    
    doc.setFontSize(16);
    doc.text(topicTitle, 15, 20);
    
    doc.setFontSize(12);
    // basic text wrapping
    const splitText = doc.splitTextToSize(editContent, 180);
    doc.text(splitText, 15, 30);
    
    doc.save(`${topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const handlePublishWithCurriculum = async (currToSave: any) => {
    setLoading(true);
    setError('');
    try {
      if (editingCourseId) {
        await lmsService.updateCourse(editingCourseId, {
          title,
          content: productType === 'Test Series' ? "Test Series with automated grading and explanations." : "Master content with rich curriculum.",
          type: productType,
          class_level: category,
          language,
          curriculum: currToSave,
          price: parseFloat(price) || 0
        }, currentUser.id);
        showToast('Updated Successfully!', 'success');
      } else {
        await lmsService.publishCourse({
          adminId: currentUser.id,
          title,
          content: productType === 'Test Series' ? "Test Series with automated grading and explanations." : "Master content with rich curriculum.",
          type: productType,
          classLevel: category,
          language,
          curriculum: currToSave,
          price: parseFloat(price) || 0
        });
        showToast('Published Successfully!', 'success');
      }
      navigate('/lms');
    } catch (err: any) {
      setError('Publish failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    return handlePublishWithCurriculum(curriculum);
  };

  const handleImportSEOCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const basicCourse = {
        admin_id: currentUser.id,
        title: "SEO Executive Skills Certification - Basic",
        content: "Start your journey into SEO with this comprehensive basic course. Perfect for beginners looking to master the fundamentals of search engine optimization.",
        type: "Course",
        class_level: "IT SKILLs",
        language: "English",
        price: 999,
        curriculum: seoBasicCurriculum,
      };

      const advancedCourse = {
        admin_id: currentUser.id,
        title: "SEO Executive Skills Certification - Advanced",
        content: "Take your SEO skills to the next level. Master technical audits, advanced competitor analysis, and local search strategies.",
        type: "Course",
        class_level: "IT SKILLs",
        language: "English",
        price: 999,
        curriculum: seoAdvancedCurriculum,
      };

      const { error: insertError } = await supabase.from('lms_courses').insert([basicCourse, advancedCourse]);
      if (insertError) throw insertError;
      
      showToast("SEO Courses (Basic & Advanced) imported successfully!", 'success');
      navigate('/lms');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/lms')} className="btn-outline" style={{ border: 'none', padding: 0 }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="gradient-text-teal" style={{ fontSize: '28px', margin: 0 }}>Aishlee Course Builder</h1>

          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>AI-Assisted Syllabus, Quizzes & Content Generator</p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px' }}>{error}</div>}

      {/* STEP 1: METADATA */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', marginTop: 0 }}>Step 1: Define {productType}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Product Type</label>
              <select className="input-field" value={productType} onChange={e => setProductType(e.target.value)}>
                <option value="Course">Course (Video / Notes / PDFs)</option>
                <option value="Test Series">Test Series (Quizzes / Mock Tests / Explanations)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Subject / Topic / Exam</label>
              <input type="text" className="input-field" placeholder={`e.g. Indian Polity ${productType === 'Test Series' ? 'Mock Tests' : 'for TNPSC Group 1'}`} value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            
            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Target Audience</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {EXAM_CATEGORIES.map((cat, idx) => (
                  <optgroup key={idx} label={cat.group}>
                    {cat.exams.map((exam, examIdx) => (
                      <option key={examIdx} value={exam}>{exam}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Language</label>
              <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '14px' }}>Price (₹) - 0 for Free</label>
              <input type="number" className="input-field" value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            {productType === 'Test Series' && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--tech-gold)' }}>
                <h3 style={{ margin: '0 0 16px 0', color: 'white', fontSize: '15px' }}>Test Series Configuration</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Test Source</label>
                    <select className="input-field" value={testSource} onChange={e => setTestSource(e.target.value)}>
                      <option value="Google Sheet">Google Sheet (CSV)</option>
                      <option value="Google Form">Google Form (Embed)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Source Link (URL)</label>
                    <input type="text" className="input-field" placeholder="https://docs.google.com/..." value={testUrl} onChange={e => setTestUrl(e.target.value)} />
                  </div>
                  {testSource === 'Google Sheet' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Start Question # (Optional)</label>
                        <input type="number" className="input-field" placeholder="e.g. 50" value={testStart} onChange={e => setTestStart(e.target.value)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>End Question # (Optional)</label>
                        <input type="number" className="input-field" placeholder="e.g. 100" value={testEnd} onChange={e => setTestEnd(e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="proctorCheck" checked={isProctored} onChange={e => setIsProctored(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <label htmlFor="proctorCheck" style={{ color: 'white', fontSize: '13px', cursor: 'pointer' }}>Enable Strict Proctoring (Camera & Fullscreen Enforced)</label>
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="limitCheck" checked={limitAttempts} onChange={e => setLimitAttempts(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <label htmlFor="limitCheck" style={{ color: 'white', fontSize: '13px', cursor: 'pointer' }}>Limit to 1 Attempt (Requires Creator Permission Code for retakes)</label>
                  </div>
                </div>
              </div>
            )}
            {productType === 'Course' && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--tech-cyan)' }}>
                <p style={{ color: 'var(--cool-gray)', fontSize: '13px', margin: '0 0 16px 0' }}>Click "Generate Course Syllabus" to create the structure. You can add content in Step 2.</p>
              </div>
            )}

            {editingCourseId && productType === 'Course' && (
              <button 
                onClick={() => setStep(2)} 
                className="btn-primary" 
                style={{ marginTop: '16px', padding: '16px', fontSize: '16px', background: 'var(--tech-gold)', color: 'black', fontWeight: 'bold' }}
              >
                Continue to Editor (Keep Current Syllabus)
              </button>
            )}

            {editingCourseId && productType === 'Test Series' && (
              <button 
                onClick={handleGenerateSyllabus} 
                disabled={loading}
                className="btn-primary" 
                style={{ marginTop: '16px', padding: '16px', fontSize: '16px', background: 'var(--tech-gold)', color: 'black', fontWeight: 'bold' }}
              >
                {loading ? 'Updating...' : 'Update Test Series Settings'}
              </button>
            )}

            {!(editingCourseId && productType === 'Test Series') && (
              <button 
                onClick={handleGenerateSyllabus} 
                disabled={loading} 
                className={editingCourseId ? "btn-outline" : "btn-primary"} 
                style={{ 
                  marginTop: editingCourseId ? '12px' : '16px', 
                  padding: '16px', 
                  fontSize: '16px',
                  borderColor: editingCourseId ? '#EF4444' : undefined,
                  color: editingCourseId ? '#EF4444' : undefined
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    {bulkProgress || 'Generating...'}
                  </div>
                ) : editingCourseId ? '⚠️ Danger: Regenerate Syllabus Structure (Wipes Current)' : (productType === 'Course' ? 'Generate Course Syllabus' : 'Initialize Test Series')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: SYLLABUS AND CONTENT EDITOR */}
      {step === 2 && (
        <div className="lms-layout-container" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Left Pane: Syllabus Tree */}
          <div className="glass-panel lms-sidebar lms-sidebar-350" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>Curriculum Structure</h3>
              <button onClick={() => setStep(1)} className="btn-outline" style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={14} style={{ marginRight: '4px' }} /> Edit Details
              </button>
            </div>
            
            {productType === 'Course' && (
              <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px' }}>Auto-Fill Empty Topics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={bulkGenVideos} onChange={e => setBulkGenVideos(e.target.checked)} style={{ width: '14px', height: '14px' }} />
                    Fetch YouTube Videos
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={bulkGenContent} onChange={e => setBulkGenContent(e.target.checked)} style={{ width: '14px', height: '14px' }} />
                    Generate Markdown Notes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={bulkGenQuizzes} onChange={e => setBulkGenQuizzes(e.target.checked)} style={{ width: '14px', height: '14px' }} />
                    Generate AI Quizzes
                  </label>
                  
                  {bulkGenQuizzes && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input type="number" min="1" max="20" className="input-field" value={quizCount} onChange={e => setQuizCount(parseInt(e.target.value) || 5)} style={{ padding: '4px 8px', fontSize: '12px', width: '60px' }} title="Questions per Topic" />
                      <select className="input-field" value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value)} style={{ padding: '4px 8px', fontSize: '12px', flex: 1 }}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  )}
                  
                  <button onClick={handleGenerateBulkContent} disabled={loading} className="btn-primary" style={{ padding: '8px', fontSize: '13px', marginTop: '8px', background: 'var(--tech-cyan)' }}>
                    {loading && bulkProgress ? bulkProgress : 'Generate Selected Content'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }}>
              {curriculum.map((mod, mIdx) => (
                <div key={mIdx} style={{ marginBottom: '24px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ color: 'var(--tech-cyan)', margin: '0 0 12px 0', fontSize: '14px', background: 'transparent', border: '1px solid transparent', padding: '4px', width: '100%', outline: 'none' }}
                    value={mod.module_title}
                    onChange={(e: any) => {
                      const newCurr = [...curriculum];
                      newCurr[mIdx].module_title = e.target.value;
                      setCurriculum(newCurr);
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                    {(mod.topics || []).map((topic, tIdx) => {
                      const isActive = activeModuleIdx === mIdx && activeTopicIdx === tIdx;
                      const hasContent = topic.content || topic.video_url || topic.pdf_url;
                      return (
                        <div 
                          key={tIdx} 
                          onClick={() => handleOpenEditor(mIdx, tIdx)}
                          style={{ 
                            padding: '8px 12px', 
                            background: isActive ? 'rgba(0,229,255,0.1)' : 'rgba(0,0,0,0.2)', 
                            border: isActive ? '1px solid var(--tech-cyan)' : '1px solid transparent',
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: isActive ? 'white' : 'var(--cool-gray)',
                            fontSize: '13px'
                          }}
                        >
                          <span>{topic.title}</span>
                          {hasContent && <CheckCircle size={14} color="var(--tech-green)" />}
                        </div>
                      )
                    })}
                    <button 
                      onClick={() => {
                        const newCurr = [...curriculum];
                        newCurr[mIdx].topics.push({ title: 'New Topic', content: '', video_url: '', pdf_url: '' });
                        setCurriculum(newCurr);
                      }}
                      className="btn-outline" 
                      style={{ padding: '4px 8px', fontSize: '12px', width: 'fit-content', marginTop: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={12} style={{ marginRight: '4px' }} /> Add Topic
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setCurriculum([...curriculum, { module_title: 'New Module', topics: [] }])}
                className="btn-outline" 
                style={{ padding: '8px', fontSize: '13px', width: '100%', borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} style={{ marginRight: '4px' }} /> Add Module
              </button>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)' }}>
              <button onClick={handlePublish} disabled={loading} className="btn-primary" style={{ width: '100%', background: 'var(--tech-gold)', color: 'black' }}>
                {loading ? 'Saving...' : editingCourseId ? `Update ${productType}` : `Publish ${productType} to Academy`}
              </button>
            </div>
          </div>

          {/* Right Pane: Topic Content Editor */}
          <div className="glass-panel lms-main" style={{ padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {activeModuleIdx === null ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--cool-gray)' }}>
                <BookOpen size={48} style={{ opacity: 0.5, margin: '0 auto 16px' }} />
                Select a topic from the curriculum to add content.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--surface-border)' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ fontSize: '20px', fontWeight: 'bold', padding: '8px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)' }}
                    value={curriculum[activeModuleIdx].topics[activeTopicIdx].title}
                    onChange={(e: any) => {
                      const newCurr = [...curriculum];
                      newCurr[activeModuleIdx].topics[activeTopicIdx].title = e.target.value;
                      setCurriculum(newCurr);
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 100%' }}>
                    <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '13px' }}>YouTube Explanation Video URL(s) - Comma or newline separated</label>
                    <div style={{ position: 'relative' }}>
                      <Video size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                      <textarea className="input-field" style={{ paddingLeft: '36px', minHeight: '60px', resize: 'vertical' }} placeholder="https://youtube.com/watch?v=..." value={editVideo} onChange={e => setEditVideo(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ flex: '1 1 45%' }}>
                    <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '8px', fontSize: '13px' }}>PDF Material URL</label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={16} color="var(--cool-gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                      <input type="text" className="input-field" style={{ paddingLeft: '36px' }} placeholder="https://.../notes.pdf" value={editPdf} onChange={e => setEditPdf(e.target.value)} />
                    </div>
                  </div>
                  
                  <div style={{ flex: '1 1 100%', marginTop: '8px' }}>
                    <label style={{ display: 'block', color: 'var(--tech-cyan)', marginBottom: '8px', fontSize: '13px' }}>External Test Link (Google Forms / Sheets)</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={16} color="var(--tech-cyan)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                      <input type="text" className="input-field" style={{ paddingLeft: '36px', borderColor: 'var(--tech-cyan)' }} placeholder="https://docs.google.com/forms/d/e/..." value={editTestLink} onChange={e => setEditTestLink(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <label style={{ color: 'var(--cool-gray)', fontSize: '13px' }}>Study Notes / Markdown Content</label>
                    <button onClick={handleGenerateMicroContent} disabled={loading} className="btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>
                      {loading ? 'Generating...' : <><Brain size={14} /> Auto-Generate with AI</>}
                    </button>
                  </div>
                  <textarea 
                    className="input-field" 
                    style={{ flex: 1, minHeight: '200px', resize: 'vertical', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Write content here or generate using AI..."
                  />
                </div>

                {true && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: 'var(--tech-cyan)', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={16} /> AI Interactive Quiz Builder
                      </label>
                      <button onClick={handleGenerateAIQuiz} disabled={loading} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--tech-cyan)', color: 'black' }}>
                        {loading ? 'Generating...' : 'Build Auto-Quiz'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Count</label>
                        <input type="number" min="1" max="50" className="input-field" value={quizCount} onChange={e => setQuizCount(parseInt(e.target.value) || 5)} style={{ padding: '8px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Type</label>
                        <select className="input-field" value={quizType} onChange={e => setQuizType(e.target.value)} style={{ padding: '8px' }}>
                          <option value="Multiple Choice">Multiple Choice</option>
                          <option value="Fill in the Blanks">Fill in the Blanks</option>
                          <option value="One Line Answer">One Line Answer</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Difficulty</label>
                        <select className="input-field" value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value)} style={{ padding: '8px' }}>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                          <option value="Expert">Expert (Exam Level)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--cool-gray)', marginBottom: '4px', fontSize: '12px' }}>Custom Context & Insights (Optional)</label>
                      <textarea className="input-field" rows={2} placeholder="e.g. Focus exclusively on fundamental rights and articles..." value={quizContext} onChange={e => setQuizContext(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    </div>

                    <textarea 
                      className="input-field" 
                      style={{ minHeight: '150px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5', borderColor: 'rgba(0,229,255,0.4)', background: 'rgba(0,0,0,0.5)', marginTop: '8px' }}
                      value={editAiQuiz}
                      onChange={e => setEditAiQuiz(e.target.value)}
                      placeholder="JSON Output will appear here..."
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleSaveTopic} className="btn-primary" style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={16} /> Save Topic Content
                  </button>
                  <button onClick={handleSharePDF} className="btn-outline" style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tech-cyan)', borderColor: 'var(--tech-cyan)' }}>
                    <Share2 size={16} /> Share PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast.show && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '14px 28px', borderRadius: '14px', zIndex: 99999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'success' ? '#10B981' : 'var(--tech-cyan)',
          color: '#fff', fontWeight: '700', fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.3s ease-out',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.message}
        </div>,
        document.body
      )}
    </div>
  );
}
