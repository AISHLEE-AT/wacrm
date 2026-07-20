// @ts-nocheck
'use client';
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  GraduationCap,
  BookOpen,
  Brain,
  Clock,
  ChevronLeft,
  Award,
  Edit,
  Trash2,
  Printer,
  Home,
  Share2,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Mic,
  FileText,
  Edit2,
  Check,
  PlusCircle,
  Save,
  Send,
} from "lucide-react";
import { lmsService } from '@/aishlee/services/lmsService';
import { geminiService } from '@/aishlee/services/geminiService';
import { customAiService } from '@/aishlee/services/customAiService';
import { useApp } from '@/aishlee/context/AppProvider';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { dashboardSheetsService } from '@/aishlee/services/dashboardSheetsService';
import { purchaseService } from '@/aishlee/services/purchaseService';
import { PaymentQR } from '@/aishlee/components/PaymentQR';
import {
  PlaySquare,
  X,
  PlayCircle,
  QrCode,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import TestSeriesRunner from '@/aishlee/components/TestSeriesRunner';
import CertificateApprovals from "./CertificateApprovals";
import ReactMarkdown from "react-markdown";
import CourseCard from '@/aishlee/components/lms/CourseCard';

const TeachO = () => {
  const { currentUser } = useApp();
  const router = useRouter();
const navigate = (path) => router.push(path);
  const isAdmin =
    currentUser?.role === "Admin" || currentUser?.role === "Super Admin";
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState<any>(null);

  // Tab System
  // Tab System removed
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.",
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setShowSuggestions(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const [unlockedCourses, setUnlockedCourses] = useState(() => {
    return JSON.parse(
      (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(`unlocked_courses_${currentUser?.id}`) : null) || "[]",
    );
  });

  useEffect(() => {
    if (currentUser?.id) {
      setUnlockedCourses(
        JSON.parse(
          (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(`unlocked_courses_${currentUser?.id}`) : null) || "[]",
        ),
      );
    }
  }, [currentUser?.id]);
  const [unlockingCourseId, setUnlockingCourseId] = useState<any>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");

  // Advanced Viewer State
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [showAdminApprovals, setShowAdminApprovals] = useState(false);

  // Progress Tracking
  const [completedTopics, setCompletedTopics] = useState<any[]>([]);
  const [certRequestStatus, setCertRequestStatus] = useState<any>(null);
  const [showFinalTest, setShowFinalTest] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [videoUnlocked, setVideoUnlocked] = useState(false);

  // Unacademy-style layout state
  const [expandedModules, setExpandedModules] = useState({});
  const [activeContentTab, setActiveContentTab] = useState('notes');

  useEffect(() => {
    setSelectedVideoIndex(0);
    setVideoUnlocked(false);
    setActiveContentTab('notes');
  }, [activeTopic]);

  // Auto-expand first module when course is opened
  useEffect(() => {
    if (activeCourse?.curriculum?.length > 0) {
      setExpandedModules({ 0: true });
    }
  }, [activeCourse]);

  // Purchase Flow State
  const [purchaseModal, setPurchaseModal] = useState({
    isOpen: false,
    course: null,
    paymentId: "",
    accessCodeInput: "",
    appliedDiscount: 0,
    appliedCode: null,
  });
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      purchaseService
        .getUserPurchases(currentUser?.id)
        .then((data) => setUserPurchases(data || []))
        .catch((err) => console.error("Error loading purchases:", err));
    }
  }, [currentUser?.id]);

  // AI Quiz Maker State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestionCount, setQuizQuestionCount] = useState(50);
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [tempApiKey, setTempApiKey] = useState((typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem("gemini_api_key") : null) || "");
  const [quizError, setQuizError] = useState("");
  const [quizLanguage, setQuizLanguage] = useState("English");
  const [quizCoverage, setQuizCoverage] = useState("All");
  const [quizContext, setQuizContext] = useState("");
  const [aiProvider, setAiProvider] = useState("CUSTOM_AI");

  const handleGenerateTopicQuiz = async () => {
    setQuizError("");
    if (aiProvider === 'GEMINI' && !tempApiKey && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setQuizError("Please enter your Gemini API Key to generate a custom quiz.");
      return;
    }
    setGeneratingQuiz(true);
    try {
      const userKey = tempApiKey;
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem("gemini_api_key", tempApiKey);
      const subtopicsToCover = quizCoverage === "All" ? (activeTopic.subtopics || []) : [quizCoverage];
      
      let jsonStr = '';
      if (aiProvider === 'GEMINI') {
        jsonStr = await geminiService.generateTopicQuiz(
          activeCourse.title,
          activeTopic.title,
          subtopicsToCover,
          activeCourse.class_level || "All",
          quizLanguage,
          quizQuestionCount,
          quizDifficulty,
          quizContext,
          userKey,
        );
      } else {
        jsonStr = await customAiService.generateTopicQuiz(
          activeCourse.title,
          activeTopic.title,
          subtopicsToCover,
          activeCourse.class_level || "All",
          quizLanguage,
          quizQuestionCount,
          quizDifficulty,
          quizContext,
          'meta-llama/Llama-3.1-8B-Instruct'
        );
      }
      
      let cleanJsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();
      const firstBracket = cleanJsonStr.indexOf('[');
      const lastBracket = cleanJsonStr.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanJsonStr = cleanJsonStr.substring(firstBracket, lastBracket + 1);
      }
      
      const parsed = JSON.parse(cleanJsonStr);
      setActiveQuiz(parsed);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (e) {
      setQuizError("Failed to generate AI Quiz: " + e.message + "\n\nIf you are using your own Gemini API Key, please ensure it is valid, active, and has sufficient quota. You can get a free key from Google AI Studio.");
      console.error(e);
    }
    setGeneratingQuiz(false);
  };

  const downloadQuizPDF = () => {
    if (!activeQuiz || !activeTopic) {
      alert("Please wait for the quiz to generate before downloading.");
      return;
    }
    try {
      const doc = new jsPDF();
      let y = 20;
      
      doc.setFontSize(18);
      doc.text(`Quiz: ${activeTopic.title}`, 20, y);
      y += 15;
      
      doc.setFontSize(12);
      activeQuiz.forEach((q, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const splitTitle = doc.splitTextToSize(`${idx + 1}. ${q.question}`, 170);
        doc.text(splitTitle, 20, y);
        y += (splitTitle.length * 7) + 5;
        
        if (q.options) {
          q.options.forEach((opt, oIdx) => {
            if (y > 270) { doc.addPage(); y = 20; }
            const letter = String.fromCharCode(65 + oIdx);
            const splitOpt = doc.splitTextToSize(`   ${letter}) ${opt}`, 170);
            doc.text(splitOpt, 20, y);
            y += (splitOpt.length * 7) + 2;
          });
        }
        y += 10;
      });
      
      doc.save(`${activeTopic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_quiz.pdf`);
    } catch (e) {
      alert("Failed to generate PDF: " + e.message);
      console.error(e);
    }
  };

  const handleShareQuiz = async () => {
    if (!activeQuiz || !activeTopic) {
      alert("Please wait for the quiz to generate before sharing.");
      return;
    }
    
    try {
      const textContent = `Check out this quiz on ${activeTopic.title}!\n\n` + 
        activeQuiz.map((q, i) => `${i+1}. ${q.question}`).join('\n') +
        `\n\nTake the full quiz on THAMIZHAN Aishlee Academy!`;
        
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${activeTopic.title} Quiz`,
            text: textContent,
            url: window.location.href,
          });
        } catch (err: any) {
          console.log('Error sharing:', err);
          alert("Failed to share: " + err.message);
        }
      } else {
        navigator.clipboard.writeText(textContent);
        alert("Quiz text copied to clipboard!");
      }
    } catch (e) {
      alert("An error occurred while sharing: " + e.message);
      console.error(e);
    }
  };

  const submitTopicQuiz = async () => {
    let score = 0;
    activeQuiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    const passed = score >= activeQuiz.length / 2;
    setQuizResult({ score, total: activeQuiz.length, passed });

    if (passed && currentUser) {
      const passTag = `${activeTopic.title}_QUIZ_PASSED`;
      if (!completedTopics.includes(passTag)) {
        const newCompleted = [...new Set([...completedTopics, passTag])];
        setCompletedTopics(newCompleted);

        let totalTopicsCount = 0;
        if (activeCourse.curriculum) {
          activeCourse.curriculum.forEach(
            (m) => (totalTopicsCount += m.topics ? m.topics.length : 0),
          );
        }
        const normalTopics = newCompleted.filter(
          (t) => !t.endsWith("_QUIZ_PASSED"),
        );
        const isCompleted =
          normalTopics.length >= totalTopicsCount && totalTopicsCount > 0;

        await lmsService.updateCourseProgress(
          currentUser?.id,
          activeCourse.id,
          newCompleted,
          isCompleted,
        );
      }
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (activeCourse && currentUser) {
        const prog = await lmsService.getCourseProgress(
          currentUser?.id,
          activeCourse.id,
        );
        if (prog) setCompletedTopics(prog.completed_topics || []);
        else setCompletedTopics([]);

        const certReq = await lmsService.getCertificateRequest(
          currentUser?.id,
          activeCourse.id,
        );
        if (certReq) setCertRequestStatus(certReq.status);
        else setCertRequestStatus(null);
      }
    };
    fetchProgress();
  }, [activeCourse, currentUser]);

  const handleMarkTopicComplete = async () => {
    if (!activeTopic || !currentUser) return;
    const newCompleted = [...new Set([...completedTopics, activeTopic.title])];
    setCompletedTopics(newCompleted);

    let totalTopicsCount = 0;
    if (activeCourse.curriculum) {
      activeCourse.curriculum.forEach(
        (m) => (totalTopicsCount += m.topics ? m.topics.length : 0),
      );
    }
    const normalTopics = newCompleted.filter(
      (t) => !t.endsWith("_QUIZ_PASSED"),
    );
    const isCompleted =
      normalTopics.length >= totalTopicsCount && totalTopicsCount > 0;

    await lmsService.updateCourseProgress(
      currentUser?.id,
      activeCourse.id,
      newCompleted,
      isCompleted,
    );
  };

  const handleRequestCertificate = async () => {
    if (!currentUser) return;
    try {
      await lmsService.requestCertificate(
        currentUser?.id,
        activeCourse.id,
        100,
      );
      setCertRequestStatus("pending");
      setShowFinalTest(false);
      alert("Certificate requested! Please wait for Admin approval.");
    } catch (e) {
      alert("Error requesting certificate: " + e.message);
    }
  };

  // Filters
  const [filterClass, setFilterClass] = useState("All");
  const [filterLang, setFilterLang] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await lmsService.getCourses({
        classLevel: filterClass,
        language: filterLang,
        type: filterType,
        currentUser: currentUser,
      });
      
      const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
      
      const processedCourses = data.map(course => {
         const isAdvanced = course.id.startsWith("db-");
         let isComplete = false;
         
         if (!isAdvanced) {
            isComplete = true; // Basic courses are considered complete.
         } else {
            if (course.curriculum && Array.isArray(course.curriculum)) {
               for (const mod of course.curriculum) {
                 if (mod.topics && Array.isArray(mod.topics)) {
                    for (const topic of mod.topics) {
                       if (topic.content || topic.ai_quiz || topic.saved_quiz || topic.video_url) {
                          isComplete = true;
                          break;
                       }
                    }
                 }
                 if (isComplete) break;
               }
            }
         }
         return { ...course, isComplete };
      });
      
      if (isAdmin) {
         setCourses(processedCourses);
      } else {
         setCourses(processedCourses.filter(c => c.isComplete));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [filterClass, filterLang, filterType]);

  // YouTube useEffect removed

  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to permanently delete this content? This cannot be undone.",
      )
    ) {
      try {
        await lmsService.deleteCourse(courseId, currentUser?.id);
        loadCourses();
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleEditCourse = (e, course) => {
    e.stopPropagation();
    navigate("/admin/course-builder", { state: { editCourse: course } });
  };

  const handleUnlockCourse = async (course) => {
    if (!accessCodeInput || accessCodeInput.trim() === "") {
      alert("Please enter an access code.");
      return;
    }

    try {
      const isValid = await lmsService.validateAndConsumeCode(
        accessCodeInput.trim().toUpperCase(),
      );
      if (isValid) {
        const updated = [...unlockedCourses, course.id];
        setUnlockedCourses(updated);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(
            `unlocked_courses_${currentUser?.id}`,
            JSON.stringify(updated),
          );
        }
        setUnlockingCourseId(null);
        setAccessCodeInput("");
        alert(
          "Success! Course Unlocked permanently. The Access Code has been consumed and cannot be reused.",
        );
      } else {
        alert(
          "Invalid or already consumed Access Code. Please contact the Admin on WhatsApp to get a new valid code.",
        );
      }
    } catch (err: any) {
      console.error("Failed to validate code:", err);
      alert("Error validating code. Please try again.");
    }
  };

  const handleShare = (course) => {
    if (!currentUser?.whatsapp) {
      alert(
        "Please update your profile with your WhatsApp number to earn referral points!",
      );
      navigate("/profile");
      return;
    }
    const url = `${window.location.origin}/lms?ref=${currentUser?.whatsapp}`;
    const text = `Check out this amazing course: ${course.title} on Thamizhan Platform! Buy using my referral link here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (activeCourse) {
    const isAdvanced =
      activeCourse.curriculum && activeCourse.curriculum.length > 0;

    const handleDownloadCertificate = async (type) => {
      setDownloadingCert(true);
      const element = document.getElementById("certificate-node");
      if (!element) return;
      try {
        const canvas = await html2canvas(element, { scale: 2 });
        if (type === "image") {
          const link = document.createElement("a");
          link.download = `Thamizhan_Certificate_${currentUser?.fullName}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        } else if (type === "pdf") {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("landscape", "px", [
            canvas.width,
            canvas.height,
          ]);
          pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
          pdf.save(`Thamizhan_Certificate_${currentUser?.fullName}.pdf`);
        }
      } catch (err: any) {
        console.error("Certificate download failed", err);
      } finally {
        setDownloadingCert(false);
      }
    };

    if (activeCourse.type === "Test Series") {
      return (
        <TestSeriesRunner
          course={activeCourse}
          onBack={() => {
            setActiveCourse(null);
            setActiveTopic(null);
            setShowCertificate(false);
            setShowQuizModal(false);
          }}
        />
      );
    }

    return (
      <div className="teacho-course-layout">
        {/* Hero Header */}
        <div className="teacho-hero">
          <div className="teacho-hero-left">
            <button
              onClick={() => {
                setActiveCourse(null);
                setActiveTopic(null);
                setShowCertificate(false);
                setShowAdminApprovals(false);
                setShowQuizModal(false);
              }}
              className="teacho-hero-back"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="teacho-hero-info">
              <h2>{activeCourse.title}</h2>
              <div className="teacho-hero-meta">
                <span className="teacho-hero-badge" style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--tech-cyan)' }}>{activeCourse.type}</span>
                <span className="teacho-hero-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cool-gray)' }}>{activeCourse.class_level}</span>
                <span className="teacho-hero-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--cool-gray)' }}>{activeCourse.language}</span>
                <span style={{ fontSize: '12px', color: 'var(--cool-gray)' }}>by {activeCourse.profiles?.full_name || 'Admin'}</span>
              </div>
            </div>
          </div>

          <div className="teacho-hero-right">
            {/* Progress indicator */}
            {isAdvanced && (() => {
              const flatTopics = [];
              if (activeCourse?.curriculum) {
                activeCourse.curriculum.forEach((mod) => {
                  (mod.topics || []).forEach((t) => flatTopics.push(t));
                });
              }
              const completedCount = flatTopics.filter((t) => completedTopics.includes(t.title)).length;
              const progressPercent = flatTopics.length > 0 ? Math.round((completedCount / flatTopics.length) * 100) : 0;
              return (
                <div className="teacho-hero-progress">
                  <div className="teacho-hero-progress-bar">
                    <div className="teacho-hero-progress-fill" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? '#10B981' : 'var(--tech-cyan)' }}></div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: progressPercent === 100 ? '#10B981' : 'var(--tech-cyan)' }}>{progressPercent}%</span>
                </div>
              );
            })()}

            {activeCourse.profiles?.whatsapp && (
              <>
                <button
                  onClick={() => {
                    const num = String(activeCourse.profiles.whatsapp || "").replace(/\D/g, "");
                    window.open(`https://wa.me/${num.length === 10 ? "91" + num : num}?text=Hi Sir/Madam, I have a doubt regarding your course: ${activeCourse.title}`, "_blank");
                  }}
                  className="teacho-action-btn green"
                >
                  Ask Doubt
                </button>
                <button
                  onClick={() => {
                    const num = String(activeCourse.profiles.whatsapp || "").replace(/\D/g, "");
                    window.open(`https://wa.me/${num.length === 10 ? "91" + num : num}?text=Hi Sir/Madam, I would like to order a hardcopy print of the materials for: ${activeCourse.title}`, "_blank");
                  }}
                  className="teacho-action-btn green"
                >
                  <Printer size={14} /> Hardcopy
                </button>
                <button
                  onClick={() => {
                    const num = String(activeCourse.profiles.whatsapp || "").replace(/\D/g, "");
                    window.open(`https://wa.me/${num.length === 10 ? "91" + num : num}?text=Hi Sir/Madam, I am interested in Direct Home Tuition for the subject: ${activeCourse.title}`, "_blank");
                  }}
                  className="teacho-action-btn green"
                >
                  <Home size={14} /> Tuition
                </button>
              </>
            )}
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/admin/course-builder", { state: { editCourse: activeCourse } }); }}
                className="teacho-action-btn primary"
              >
                <Edit size={14} /> Edit
              </button>
            )}
            {certRequestStatus === "approved" ? (
              <button onClick={() => setShowCertificate(true)} className="teacho-action-btn gold">
                <Award size={14} /> Certificate
              </button>
            ) : certRequestStatus === "pending" ? (
              <button disabled className="teacho-action-btn" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
                <Award size={14} /> Pending
              </button>
            ) : (
              <button
                onClick={() => {
                  let totalTopicsCount = 0;
                  if (activeCourse.curriculum) {
                    activeCourse.curriculum.forEach((m) => (totalTopicsCount += m.topics ? m.topics.length : 0));
                  }
                  const normalTopics = completedTopics.filter((t) => !t.endsWith("_QUIZ_PASSED"));
                  const quizTopics = completedTopics.filter((t) => t.endsWith("_QUIZ_PASSED"));
                  if (normalTopics.length >= totalTopicsCount && totalTopicsCount > 0) {
                    if (quizTopics.length >= totalTopicsCount) { setShowFinalTest(true); }
                    else { alert(`Please pass the AI Quiz for all ${totalTopicsCount} topics first!`); }
                  } else { alert(`Please mark all ${totalTopicsCount} topics as complete first!`); }
                }}
                className="teacho-action-btn gold"
              >
                <Award size={14} /> Certificate
              </button>
            )}
          </div>
        </div>

        {showCertificate ? (
          <div
            className="glass-panel"
            style={{
              padding: "40px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div
              id="certificate-node"
              style={{
                width: "800px",
                height: "560px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                border: "8px solid var(--tech-gold)",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                boxShadow: "0 0 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Corner Accents */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  width: "40px",
                  height: "40px",
                  borderTop: "4px solid var(--tech-cyan)",
                  borderLeft: "4px solid var(--tech-cyan)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  width: "40px",
                  height: "40px",
                  borderTop: "4px solid var(--tech-cyan)",
                  borderRight: "4px solid var(--tech-cyan)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  width: "40px",
                  height: "40px",
                  borderBottom: "4px solid var(--tech-cyan)",
                  borderLeft: "4px solid var(--tech-cyan)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                  width: "40px",
                  height: "40px",
                  borderBottom: "4px solid var(--tech-cyan)",
                  borderRight: "4px solid var(--tech-cyan)",
                }}
              ></div>

              <Award
                size={64}
                color="var(--tech-gold)"
                style={{ marginBottom: "16px" }}
              />

              <h1
                style={{
                  color: "white",
                  fontSize: "42px",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                }}
              >
                Certificate of Completion
              </h1>
              <p
                style={{
                  color: "var(--tech-teal)",
                  fontSize: "18px",
                  margin: "0 0 32px 0",
                  letterSpacing: "2px",
                }}
              >
                THAMIZHAN TECHNOLOGY LTD
              </p>

              <p
                style={{
                  color: "var(--cool-gray)",
                  fontSize: "16px",
                  margin: "0 0 16px 0",
                }}
              >
                This is to proudly certify that
              </p>
              <h2
                style={{
                  color: "white",
                  fontSize: "36px",
                  margin: "0 0 24px 0",
                  fontFamily: "serif",
                  borderBottom: "2px solid var(--tech-gold)",
                  paddingBottom: "8px",
                  minWidth: "400px",
                }}
              >
                {currentUser?.fullName}
              </h2>

              <p
                style={{
                  color: "var(--cool-gray)",
                  fontSize: "16px",
                  margin: "0 0 16px 0",
                }}
              >
                has successfully completed the course/test:
              </p>
              <h3
                style={{
                  color: "var(--tech-cyan)",
                  fontSize: "24px",
                  margin: "0 0 32px 0",
                  maxWidth: "600px",
                }}
              >
                {activeCourse.title}
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "auto",
                  padding: "0 40px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    borderTop: "1px solid var(--cool-gray)",
                    paddingTop: "8px",
                    width: "150px",
                  }}
                >
                  <p style={{ color: "white", margin: 0, fontSize: "14px" }}>
                    {new Date().toLocaleDateString()}
                  </p>
                  <p
                    style={{
                      color: "var(--cool-gray)",
                      margin: 0,
                      fontSize: "12px",
                    }}
                  >
                    Date Completed
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    borderTop: "1px solid var(--cool-gray)",
                    paddingTop: "8px",
                    width: "150px",
                  }}
                >
                  <p
                    style={{
                      color: "white",
                      margin: 0,
                      fontSize: "14px",
                      fontFamily: "cursive",
                    }}
                  >
                    Thamizhan Platform
                  </p>
                  <p
                    style={{
                      color: "var(--cool-gray)",
                      margin: 0,
                      fontSize: "12px",
                    }}
                  >
                    Authorized Issuer
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={() => handleDownloadCertificate("pdf")}
                disabled={downloadingCert}
                className="btn-primary"
              >
                {downloadingCert ? "Generating..." : "Download as PDF"}
              </button>
              <button
                onClick={() => handleDownloadCertificate("image")}
                disabled={downloadingCert}
                className="btn-outline"
              >
                {downloadingCert ? "Generating..." : "Download as Image"}
              </button>
            </div>
          </div>
        ) : isAdvanced ? (
          <div className="teacho-body">
            {/* Unacademy-Style Accordion Sidebar */}
            <div className="teacho-sidebar">
              <div className="teacho-sidebar-header">
                <h4>Course Curriculum</h4>
              </div>
              <div className="teacho-sidebar-scroll">
                {activeCourse.curriculum.map((mod, mIdx) => {
                  const isExpanded = !!expandedModules[mIdx];
                  return (
                    <div key={mIdx} className="teacho-module">
                      <div 
                        className="teacho-module-header"
                        onClick={() => setExpandedModules(prev => ({...prev, [mIdx]: !prev[mIdx]}))}
                      >
                        <div className="teacho-module-title">{mod.module_title}</div>
                        <span className="teacho-module-count">{mod.topics?.length || 0} Lessons</span>
                        <ChevronDown size={16} className={`teacho-module-chevron ${isExpanded ? 'open' : ''}`} />
                      </div>
                      
                      <div className={`teacho-topics ${isExpanded ? 'open' : ''}`}>
                        {(mod.topics || []).map((topic, tIdx) => {
                          const isActive = activeTopic === topic;
                          const isCompleted = completedTopics.includes(topic.title);
                          
                          return (
                            <div 
                              key={tIdx} 
                              className={`teacho-topic-row ${isActive ? 'active' : ''}`}
                              onClick={() => {
                                setActiveTopic(topic);
                                setQuizCoverage("All");
                                setQuizContext(`Focus exclusively on the specific syllabus topic: ${topic.title}`);
                                setActiveQuiz(null);
                                setQuizResult(null);
                                setQuizError("");
                              }}
                            >
                              <div className={`teacho-topic-icon ${isCompleted ? 'completed' : ''}`}>
                                {isCompleted ? <Check size={14} strokeWidth={3} /> : <PlayCircle size={14} />}
                              </div>
                              <div className="teacho-topic-name">{topic.title}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unacademy-Style Main Content Area */}
            <div className="teacho-main">
              {!activeTopic ? (
                <div className="teacho-welcome">
                  <div className="teacho-welcome-icon">
                    <BookOpen size={40} color="var(--tech-cyan)" />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '24px', margin: '0 0 12px 0' }}>Welcome to {activeCourse.title}</h2>
                    <p style={{ color: 'var(--cool-gray)', fontSize: '15px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                      Select a topic from the sidebar curriculum to start learning. Watch videos, read notes, and take AI quizzes to earn your certificate.
                    </p>
                  </div>
                  {activeCourse.curriculum?.[0]?.topics?.[0] && (
                    <button 
                      onClick={() => setActiveTopic(activeCourse.curriculum[0].topics[0])}
                      className="teacho-action-btn primary" 
                      style={{ padding: '12px 24px', fontSize: '15px', marginTop: '16px' }}
                    >
                      Start First Lesson
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="teacho-main-scroll">
                    {/* Topic Header & Video Player */}
                    <div className="teacho-topic-header">
                      <div>
                        <h2 style={{ fontSize: '24px', color: 'white', margin: '0 0 8px 0' }}>{activeTopic.title}</h2>
                        {completedTopics.includes(activeTopic.title) ? (
                          <span style={{ color: '#10B981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} /> Completed
                          </span>
                        ) : (
                          <span style={{ color: 'var(--tech-gold)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} /> In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {activeTopic.video_url && (() => {
                      const videoUrls = activeTopic.video_url.split(/[\n,]+/).filter((url) => url.trim().length > 0);
                      if (videoUrls.length === 0) return null;
                      
                      return (
                        <div style={{ marginBottom: '24px' }}>
                          <div className="teacho-video-wrap">
                            <iframe
                              src={videoUrls[selectedVideoIndex < videoUrls.length ? selectedVideoIndex : 0].trim().replace("watch?v=", "embed/")}
                              allowFullScreen
                              title="Course Video"
                            />
                          </div>
                          {videoUrls.length > 1 && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                              {videoUrls.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedVideoIndex(idx)}
                                  className={`teacho-action-btn ${selectedVideoIndex === idx ? 'primary' : ''}`}
                                  style={{ padding: '6px 16px', borderRadius: '20px' }}
                                >
                                  <PlayCircle size={14} /> Source {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Content Tabs (only if video is unlocked or no video) */}
                    {(activeTopic.video_url && !videoUnlocked) ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ color: 'white', margin: '0 0 12px 0' }}>Complete the video to unlock notes</h3>
                        <p style={{ color: 'var(--cool-gray)', margin: '0 0 24px 0', fontSize: '14px' }}>Please watch the video lesson above before proceeding to the study materials and quizzes.</p>
                        <button
                          onClick={() => setVideoUnlocked(true)}
                          className="teacho-action-btn primary"
                          style={{ padding: '12px 24px', fontSize: '15px' }}
                        >
                          I have watched the video
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Tab Bar */}
                        <div className="teacho-tabs" style={{ margin: '0 -32px 24px -32px' }}>
                          <button 
                            onClick={() => setActiveContentTab('notes')}
                            className={`teacho-tab ${activeContentTab === 'notes' ? 'active' : ''}`}
                          >
                            <FileText size={16} /> Study Notes
                          </button>
                          
                          <button 
                            onClick={() => setActiveContentTab('quiz')}
                            className={`teacho-tab ${activeContentTab === 'quiz' ? 'active' : ''}`}
                          >
                            <Brain size={16} /> AI Quiz
                          </button>

                          {activeTopic.pdf_url && (
                            <button 
                              onClick={() => setActiveContentTab('pdf')}
                              className={`teacho-tab ${activeContentTab === 'pdf' ? 'active' : ''}`}
                            >
                              <Download size={16} /> Attached PDF
                            </button>
                          )}

                          {activeTopic.test_link && (
                            <button 
                              onClick={() => setActiveContentTab('test')}
                              className={`teacho-tab ${activeContentTab === 'test' ? 'active' : ''}`}
                            >
                              <Award size={16} /> External Test
                            </button>
                          )}
                        </div>

                        {/* Tab Content */}
                        <div style={{ minHeight: '300px' }}>
                          {activeContentTab === 'notes' && (
                            <div className="lms-markdown-content" style={{ lineHeight: "1.7", fontSize: "15px", color: "rgba(255,255,255,0.9)" }}>
                              {activeTopic.content ? (
                                <ReactMarkdown>{activeTopic.content}</ReactMarkdown>
                              ) : (
                                <p style={{ color: 'var(--cool-gray)' }}>No study notes provided for this topic.</p>
                              )}
                            </div>
                          )}

                          {activeContentTab === 'pdf' && activeTopic.pdf_url && (
                            <iframe
                              src={activeTopic.pdf_url}
                              style={{ width: "100%", height: "600px", border: "1px solid var(--surface-border)", borderRadius: "8px", background: 'white' }}
                              title="PDF Document"
                            />
                          )}

                          {activeContentTab === 'test' && activeTopic.test_link && (
                            <div style={{ padding: "32px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)", textAlign: 'center' }}>
                              <h3 style={{ color: "#10B981", margin: "0 0 12px 0", display: "flex", alignItems: "center", justifyContent: 'center', gap: "8px" }}>
                                <Award size={24} /> Online Assessment Required
                              </h3>
                              <p style={{ color: "var(--cool-gray)", margin: "0 0 24px 0", fontSize: '15px' }}>
                                Please complete the external test to assess your understanding of this topic.
                              </p>
                              <a
                                href={activeTopic.test_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="teacho-action-btn green"
                                style={{ display: "inline-flex", padding: "12px 32px", fontSize: '16px' }}
                              >
                                Open External Test
                              </a>
                            </div>
                          )}

                          {activeContentTab === 'quiz' && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)', borderRadius: '16px', padding: '24px' }}>
                              {/* Integrated AI Quiz Flow */}
                              {!activeQuiz ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", padding: "20px 0" }}>
                                  {activeTopic?.saved_quiz && activeTopic.saved_quiz.length > 0 && (
                                    <div style={{ width: "100%", maxWidth: "500px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981", borderRadius: "12px", padding: "24px", textAlign: "center", marginBottom: "24px" }}>
                                      <h3 style={{ color: "#10B981", margin: "0 0 12px 0" }}>Free Saved Quiz Available</h3>
                                      <p style={{ color: "white", margin: "0 0 16px 0" }}>An admin has already generated a comprehensive quiz for this topic.</p>
                                      <button
                                        onClick={() => {
                                          setActiveQuiz(activeTopic.saved_quiz);
                                          setQuizAnswers({});
                                          setQuizResult(null);
                                        }}
                                        className="teacho-action-btn green"
                                        style={{ width: "100%", display: "flex", justifyContent: "center", padding: '12px' }}
                                      >
                                        <Brain size={18} /> Start Saved Quiz (Free)
                                      </button>
                                    </div>
                                  )}
                                  <p style={{ color: "var(--cool-gray)", textAlign: "center", maxWidth: "500px", lineHeight: "1.6" }}>
                                    Generate an AI-powered test specifically for this topic.
                                  </p>
                                  <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <label style={{ color: "white", fontSize: '13px' }}>Engine:</label>
                                      <select value={aiProvider} onChange={(e: any) => setAiProvider(e.target.value)} className="input-field" style={{ width: "150px", padding: "6px" }}>
                                        <option value="CUSTOM_AI">Custom AI</option>
                                        <option value="GEMINI">Google Gemini</option>
                                      </select>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <label style={{ color: "white", fontSize: '13px' }}>Questions:</label>
                                      <select value={quizQuestionCount} onChange={(e: any) => setQuizQuestionCount(Number(e.target.value))} className="input-field" style={{ width: "80px", padding: "6px" }}>
                                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                                      </select>
                                    </div>
                                  </div>
                                  
                                  {aiProvider === 'GEMINI' && (!tempApiKey || tempApiKey === "") && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "400px" }}>
                                      <input type="password" placeholder="Gemini API Key..." value={tempApiKey} onChange={(e: any) => { setTempApiKey(e.target.value); if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem("gemini_api_key", e.target.value); }} className="input-field" style={{ padding: "10px" }} />
                                    </div>
                                  )}
                                  
                                  {quizError && (
                                    <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #EF4444", borderRadius: "8px", padding: "12px", color: "#FCA5A5", fontSize: "13px", width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                                      {quizError}
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={handleGenerateTopicQuiz}
                                    disabled={generatingQuiz}
                                    className="teacho-action-btn primary"
                                    style={{ padding: "12px 32px", fontSize: "15px", display: "flex", gap: "8px", alignItems: "center" }}
                                  >
                                    <Brain size={18} /> {generatingQuiz ? "Generating..." : "Generate & Start Quiz"}
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                  {activeQuiz.map((q, idx) => (
                                    <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                      <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "white", lineHeight: "1.5" }}>{idx + 1}. {q.question}</h4>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {q.options && q.options.map((opt, oIdx) => {
                                          const isSelected = quizAnswers[idx] === opt;
                                          const isCorrect = quizResult && q.correctAnswer === opt;
                                          const isWrongSelection = quizResult && isSelected && !isCorrect;
                                          
                                          let bgColor = "rgba(0,0,0,0.3)";
                                          let borderColor = "rgba(255,255,255,0.05)";
                                          
                                          if (quizResult) {
                                            if (isCorrect) { bgColor = "rgba(16, 185, 129, 0.2)"; borderColor = "#10B981"; } 
                                            else if (isWrongSelection) { bgColor = "rgba(239, 68, 68, 0.2)"; borderColor = "#EF4444"; }
                                          } else if (isSelected) {
                                            borderColor = "var(--tech-cyan)"; bgColor = "rgba(0, 229, 255, 0.1)";
                                          }
                                          
                                          return (
                                            <label key={oIdx} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: quizResult ? "default" : "pointer", padding: "14px", background: bgColor, borderRadius: "8px", border: `1px solid ${borderColor}`, transition: "all 0.2s" }}>
                                              <input type="radio" name={`ai_topic_q_${idx}`} value={opt} checked={isSelected} onChange={() => !quizResult && setQuizAnswers((prev) => ({ ...prev, [idx]: opt }))} disabled={!!quizResult} style={{ accentColor: "var(--tech-cyan)", width: "16px", height: "16px" }} />
                                              <span style={{ fontSize: "14px", color: "white" }}>{opt}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                      {quizResult && (
                                        <div style={{ marginTop: "16px", fontSize: "14px", color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "14px", borderRadius: "8px" }}>
                                          <strong>Correct Answer:</strong> {q.correctAnswer} <br />
                                          <span style={{ color: "var(--cool-gray)", display: "block", marginTop: "6px", lineHeight: "1.5" }}>{q.explanation}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {!quizResult ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                                      <button onClick={submitTopicQuiz} disabled={Object.keys(quizAnswers).length !== activeQuiz.length} className="teacho-action-btn gold" style={{ padding: "14px", fontSize: "16px", justifyContent: 'center' }}>
                                        Submit Exam
                                      </button>
                                      {isAdmin && (
                                        <button onClick={async () => { try { const res = await lmsService.saveQuizToTopic(activeCourse.id, activeTopic.title, activeQuiz); if (res) alert("Saved to DB!"); } catch (e) { alert("Failed: " + e.message); } }} className="teacho-action-btn green" style={{ justifyContent: 'center' }}>
                                          💾 Save Quiz to Database for All Users
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ textAlign: "center", padding: "24px", background: quizResult.passed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", borderRadius: "12px", border: `1px solid ${quizResult.passed ? "#10B981" : "#EF4444"}` }}>
                                      <h3 style={{ color: quizResult.passed ? "#10B981" : "#EF4444", margin: "0 0 12px 0" }}>{quizResult.passed ? "🎉 Passed!" : "❌ Failed!"}</h3>
                                      <div style={{ fontSize: "20px", color: "white", fontWeight: "bold", marginBottom: "8px" }}>Score: {quizResult.score} / {quizResult.total}</div>
                                      <p style={{ color: "var(--cool-gray)", marginBottom: "20px", fontSize: '14px' }}>{quizResult.passed ? "Great job! You can proceed to the next topic." : "Please review the material and try again."}</p>
                                      <button onClick={() => { setActiveQuiz(null); setQuizAnswers({}); setQuizResult(null); }} className="teacho-action-btn primary" style={{ margin: "0 auto", padding: "10px 24px" }}>
                                        Retake Quiz
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Navigation & Mark Complete */}
                        <div className="teacho-bottom-nav">
                          {completedTopics.includes(activeTopic.title) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 'bold' }}>
                              <CheckCircle size={18} /> Completed
                            </div>
                          ) : (
                            <button
                              onClick={handleMarkTopicComplete}
                              className="teacho-action-btn primary"
                              style={{ padding: '10px 20px', fontSize: '14px' }}
                            >
                              <Check size={16} /> Mark as Complete
                            </button>
                          )}

                          {/* Find next topic button */}
                          {(() => {
                            let nextTopic = null;
                            let foundCurrent = false;
                            for (const mod of (activeCourse.curriculum || [])) {
                              for (const t of (mod.topics || [])) {
                                if (foundCurrent && !nextTopic) { nextTopic = t; break; }
                                if (t === activeTopic) { foundCurrent = true; }
                              }
                              if (nextTopic) break;
                            }
                            
                            return nextTopic ? (
                              <button 
                                onClick={() => setActiveTopic(nextTopic)}
                                className="teacho-action-btn"
                                style={{ padding: '10px 20px', color: 'white' }}
                              >
                                Next Topic <ChevronRight size={16} />
                              </button>
                            ) : (
                              <span style={{ color: 'var(--cool-gray)', fontSize: '13px' }}>End of Course</span>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{ padding: "24px", flex: 1, overflowY: "auto" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
                borderBottom: "1px solid var(--surface-border)",
                paddingBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      background: "var(--tech-cyan)",
                      color: "black",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {activeCourse.type}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    {activeCourse.class_level}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    {activeCourse.language}
                  </span>
                </div>
                <h1 style={{ fontSize: "24px", margin: 0, color: "white" }}>
                  {activeCourse.title}
                </h1>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "13px",
                    color: "var(--cool-gray)",
                  }}
                >
                  Published by {activeCourse.profiles?.full_name || "Admin"} •{" "}
                  {new Date(activeCourse.created_at).toLocaleDateString()}
                </p>
              </div>
              {activeCourse.type === "Quiz Creator" ? (
                <Brain size={32} color="var(--tech-gold)" />
              ) : (
                <BookOpen size={32} color="var(--tech-cyan)" />
              )}
            </div>

            <div style={{ padding: "0 16px", marginBottom: "24px" }}>
              {activeCourse.playlistId ? (
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/videoseries?list=${activeCourse.playlistId}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allowFullScreen
                    title="Course Playlist"
                  />
                </div>
              ) : activeCourse.videoId ? (
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${activeCourse.videoId}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allowFullScreen
                    title="Course Video"
                  />
                </div>
              ) : activeCourse.mediaUrl ? (
                <a
                  href={activeCourse.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ display: "inline-block", textDecoration: "none" }}
                >
                  Access Course Content
                </a>
              ) : null}
            </div>

            <div
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                fontSize: "16px",
                color: "rgba(255,255,255,0.9)",
                padding: "0 16px",
              }}
            >
              {(() => {
                if (
                  typeof activeCourse.content === "string" &&
                  activeCourse.content.trim().startsWith("[")
                ) {
                  try {
                    const data = JSON.parse(activeCourse.content);
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "24px",
                          paddingBottom: "32px",
                        }}
                      >
                        {data.map((q, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              padding: "20px",
                              borderRadius: "12px",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 16px 0",
                                fontSize: "16px",
                                color: "var(--tech-cyan)",
                              }}
                            >
                              {idx + 1}. {q.question}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              {q.options &&
                                q.options.map((opt, oIdx) => (
                                  <label
                                    key={oIdx}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      cursor: "pointer",
                                      padding: "12px",
                                      background: "rgba(0,0,0,0.3)",
                                      borderRadius: "8px",
                                      border:
                                        "1px solid rgba(255,255,255,0.05)",
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={`lms_q_${idx}`}
                                      value={opt}
                                      style={{
                                        accentColor: "var(--tech-cyan)",
                                      }}
                                    />
                                    <span style={{ fontSize: "15px" }}>
                                      {opt}
                                    </span>
                                  </label>
                                ))}
                            </div>
                            <div
                              style={{
                                marginTop: "16px",
                                fontSize: "14px",
                                color: "#10B981",
                                display: "none",
                                background: "rgba(16, 185, 129, 0.1)",
                                padding: "12px",
                                borderRadius: "8px",
                              }}
                              id={`lms_ans_${idx}`}
                            >
                              <strong>Correct Answer:</strong> {q.correctAnswer}{" "}
                              <br />
                              <span
                                style={{
                                  color: "var(--cool-gray)",
                                  display: "block",
                                  marginTop: "8px",
                                }}
                              >
                                {q.explanation}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const el = document.getElementById(
                                  `lms_ans_${idx}`,
                                );
                                el.style.display =
                                  el.style.display === "none"
                                    ? "block"
                                    : "none";
                              }}
                              style={{
                                marginTop: "16px",
                                background: "transparent",
                                border: "1px solid var(--tech-cyan)",
                                color: "var(--tech-cyan)",
                                padding: "6px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "bold",
                              }}
                            >
                              Toggle Answer
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  } catch {
                    return activeCourse.content;
                  }
                }
                return activeCourse.content;
              })()}
            </div>
          </div>
        )}

        {showFinalTest && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="glass-panel fade-in"
              style={{
                width: "500px",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <h2
                style={{
                  color: "var(--tech-gold)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Brain size={24} /> Final Assessment
              </h2>
              <p
                style={{
                  color: "var(--cool-gray)",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                Congratulations on completing all topics in{" "}
                <strong>{activeCourse.title}</strong>!
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 16px 0",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Sample Verification Question:
                </p>
                <p style={{ margin: "0 0 12px 0", color: "var(--cool-gray)" }}>
                  What is the main topic covered in this course?
                </p>
                <label
                  style={{
                    display: "flex",
                    gap: "8px",
                    color: "white",
                    cursor: "pointer",
                    marginBottom: "8px",
                  }}
                >
                  <input type="radio" name="test" /> The concepts discussed in
                  the syllabus
                </label>
                <label
                  style={{
                    display: "flex",
                    gap: "8px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <input type="radio" name="test" /> Something completely
                  unrelated
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "16px",
                }}
              >
                <button
                  onClick={() => setShowFinalTest(false)}
                  className="btn-outline"
                  style={{ color: "var(--cool-gray)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCertificate}
                  className="btn-primary"
                  style={{ background: "var(--tech-gold)", color: "black" }}
                >
                  Submit Test & Request Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showAdminApprovals) {
    return (
      <div
        className="fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setShowAdminApprovals(false)}
            className="btn-outline"
            style={{
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "none",
              padding: "0",
            }}
          >
            <ChevronLeft size={20} /> Back to Academy
          </button>
        </div>
        <CertificateApprovals />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}>
      
      {/* 2026 AI Netflix-Style Hero */}
      <div className="glass-panel hover-lift" style={{ 
        position: 'relative', overflow: 'hidden', padding: '60px 40px', borderRadius: '32px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 64, 175, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '12px', color: '#3B82F6' }}>
              <Brain size={24} />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>AI-Powered Learning</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 16px 0', lineHeight: 1.1, color: '#fff' }}>
            Master your future with<br/>
            <span className="gradient-text-blue">TeachO AI Academy.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: '0 0 32px 0', maxWidth: '600px', lineHeight: 1.6 }}>
            Personalized learning paths, interactive quizzes, and AI-driven insights to accelerate your career.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--cool-gray)' }}>
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="What do you want to learn today?" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '16px', backdropFilter: 'blur(10px)', outline: 'none' }}
              />
              <button 
                onClick={handleVoiceSearch}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '8px', background: isListening ? '#EF4444' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '100px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Mic size={16} className={isListening ? "animate-pulse" : ""} />
              </button>
            </div>
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin/course-builder')}
                style={{ background: '#3B82F6', color: '#fff', padding: '0 24px', borderRadius: '100px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                <PlusCircle size={20} /> Create Course
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Code Banner */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '16px', color: '#8B5CF6' }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#fff' }}>Have an Access Code?</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Unlock premium courses instantly.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flex: '1', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Enter Code (e.g. AISHLEE2026)" 
            value={accessCodeInput}
            onChange={e => setAccessCodeInput(e.target.value.toUpperCase())}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
          />
          <button 
            onClick={() => handleUnlockCourse(null)} // Generic unlock
            style={{ background: '#8B5CF6', color: '#fff', padding: '0 24px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            Unlock
          </button>
        </div>
      </div>

      {/* Filter Categories */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
          {["All", "Recorded Course", "Interactive Advanced", "Test Series", "Notes & Material"].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              style={{ 
                padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap',
                background: filterType === type ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                border: filterType === type ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAdminApprovals(true)}
            style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 20px', borderRadius: '100px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <ShieldCheck size={16} /> Approvals
          </button>
        )}
      </div>

      {/* Netflix-style Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cool-gray)' }}>
          <Brain size={40} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#3B82F6' }} />
          Loading curriculum...
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--cool-gray)', borderRadius: '24px' }}>
          <BookOpen size={60} opacity={0.3} style={{ margin: '0 auto 16px auto', display: 'block' }} />
          No courses found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {courses.filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(course => {
            const hasAccess = isAdmin || (course.price === 0) || unlockedCourses.includes(course.id) || userPurchases.some(p => p.item_id === course.id && p.status === 'approved');
            
            return (
              <div 
                key={course.id} 
                className="glass-panel hover-lift"
                style={{ 
                  borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                  border: hasAccess ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)'
                }}
                onClick={() => {
                  if (hasAccess) setActiveCourse(course);
                  else setPurchaseModal({ isOpen: true, course, paymentId: "", accessCodeInput: "", appliedDiscount: 0, appliedCode: null });
                }}
              >
                {/* Thumbnail */}
                <div style={{ height: '160px', background: course.image_url ? `url(${course.image_url}) center/cover` : 'linear-gradient(135deg, #1e3a8a, #0f172a)', position: 'relative' }}>
                  {!hasAccess && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'rgba(245, 158, 11, 0.9)', color: '#000', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={14} /> PREMIUM
                      </div>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {course.type}
                  </div>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-secondary)' }}>{course.class_level}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '100px', color: 'var(--text-secondary)' }}>{course.language}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff', lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || "Learn from the best educators with structured courses."}
                  </p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>
                        {course.profiles?.full_name?.charAt(0) || 'A'}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{course.profiles?.full_name || 'Admin'}</span>
                    </div>
                    {hasAccess ? (
                      <span style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PlayCircle size={16} /> Play
                      </span>
                    ) : (
                      <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '14px' }}>
                        ₹{course.price}
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => handleEditCourse(e, course)} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDeleteCourse(e, course.id)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Purchase Modal with UPI QR */}
      {purchaseModal.isOpen && purchaseModal.course && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', overflowY: 'auto', padding: '20px' }}>
          <div className="glass-panel animate-fade-in-up" style={{ position: 'relative', width: '100%', maxWidth: '500px', background: '#111', borderRadius: '32px', padding: '32px', margin: 'auto', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <button 
              onClick={() => setPurchaseModal({ isOpen: false, course: null, paymentId: "", accessCodeInput: "", appliedDiscount: 0, appliedCode: null })}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ color: '#3B82F6', margin: '0 0 8px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
              <ShieldCheck size={28} /> Unlock Course
            </h2>
            <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '24px', fontWeight: '600', opacity: 0.9 }}>{purchaseModal.course.title}</h3>

            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '12px', borderRadius: '16px', marginBottom: '24px', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                Premium Content Access
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: purchaseModal.appliedDiscount > 0 ? 'line-through' : 'none', margin: 0 }}>₹{purchaseModal.course.price}</p>
                {purchaseModal.appliedDiscount > 0 && (
                  <p style={{ color: 'white', fontWeight: '800', fontSize: '32px', margin: 0 }}>₹{Math.max(0, purchaseModal.course.price - purchaseModal.appliedDiscount)}</p>
                )}
              </div>
              
              <div style={{ background: '#fff', padding: '16px', borderRadius: '24px', display: 'inline-block', marginBottom: '24px', opacity: (purchaseModal.course.price - purchaseModal.appliedDiscount) <= 0 ? 0.3 : 1, pointerEvents: (purchaseModal.course.price - purchaseModal.appliedDiscount) <= 0 ? 'none' : 'auto' }}>
                <PaymentQR amount={Math.max(0, purchaseModal.course.price - purchaseModal.appliedDiscount)} />
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>Scan the QR code with any UPI app to pay, then enter your Transaction ID below. Or enter an Access Code.</p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Have an Access Code?" 
                  value={purchaseModal.accessCodeInput}
                  onChange={e => setPurchaseModal({...purchaseModal, accessCodeInput: e.target.value.toUpperCase()})}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
                />
                <button 
                  onClick={async () => {
                    if (!purchaseModal.accessCodeInput) return;
                    try {
                      const res = await lmsService.validateAccessCodeForDiscount(purchaseModal.accessCodeInput);
                      if (res.valid) {
                        setPurchaseModal({...purchaseModal, appliedDiscount: res.discountValue, appliedCode: res.code});
                        alert(`Success! Discount of ₹${res.discountValue} applied.`);
                      } else {
                        alert("Invalid code.");
                      }
                    } catch (e) { alert("Error: " + e.message); }
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0 24px', borderRadius: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Apply
                </button>
              </div>

              <input 
                type="text" 
                placeholder="Paste UPI Transaction ID here" 
                value={purchaseModal.paymentId}
                onChange={e => setPurchaseModal({...purchaseModal, paymentId: e.target.value})}
                disabled={(purchaseModal.course.price - purchaseModal.appliedDiscount) <= 0}
                style={{ textAlign: 'center', fontSize: '16px', marginBottom: '24px', width: '100%', padding: '16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
              />
              
              <button 
                onClick={async () => {
                  const finalPrice = Math.max(0, purchaseModal.course.price - (purchaseModal.appliedDiscount || 0));
                  if (finalPrice > 0 && !purchaseModal.paymentId.trim()) {
                    alert("Please enter UPI Transaction ID");
                    return;
                  }
                  setSubmittingPayment(true);
                  try {
                    await purchaseService.submitPurchase(
                      currentUser?.id,
                      purchaseModal.course.id,
                      'course',
                      finalPrice === 0 ? `FREE_CODE_${purchaseModal.appliedCode}` : purchaseModal.paymentId.trim(),
                      currentUser?.fullName || currentUser?.full_name || currentUser?.user_metadata?.full_name || 'User',
                      currentUser?.whatsapp || ''
                    );
                    
                    if (finalPrice === 0 && purchaseModal.appliedCode) {
                      await lmsService.consumeAccessCode(purchaseModal.appliedCode);
                    }
                    
                    alert(finalPrice === 0 ? "Course Unlocked Instantly!" : "Payment submitted for Admin Approval!");
                    setPurchaseModal({ isOpen: false, course: null, paymentId: "", accessCodeInput: "", appliedDiscount: 0, appliedCode: null });
                  } catch (e) {
                    alert("Failed to submit payment.");
                  }
                  setSubmittingPayment(false);
                }}
                disabled={submittingPayment}
                style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', background: '#3B82F6', color: '#fff', borderRadius: '100px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                {submittingPayment ? 'Processing...' : (purchaseModal.course.price - purchaseModal.appliedDiscount <= 0 ? 'Unlock for Free' : 'Submit Payment')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default TeachO;
