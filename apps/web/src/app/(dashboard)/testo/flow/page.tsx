"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Bell,
  CheckCircle,
  ExternalLink,
  Compass,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface FlowOption {
  label: string;
  nextId: string;
}

interface FlowNode {
  id: string;
  type: "BRANCH" | "LEAF_PURCHASE" | "LEAF_COMING_SOON";
  question?: string;
  options?: FlowOption[];
  title?: string;
  description?: string;
  purchaseUrl?: string;
  message?: string;
}

interface FlowBreadcrumb {
  nodeId: string;
  label: string;
}

const localTree: Record<string, FlowNode> = {
  root: {
    id: "root",
    type: "BRANCH",
    question: "Which competitive exam or learning path are you preparing for?",
    options: [
      { label: "🏛️ TNPSC (Tamil Nadu Public Service Commission)", nextId: "tnpsc_group_select" },
      { label: "🏦 Banking & Insurance Exams (IBPS, SBI, RBI)", nextId: "banking_coming_soon" },
      { label: "🚆 Railway Recruitment Board (RRB NTPC & Group D)", nextId: "rrb_coming_soon" },
      { label: "👮 TNUSRB Police & Sub-Inspector Exams", nextId: "police_coming_soon" },
    ],
  },
  banking_coming_soon: {
    id: "banking_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "Banking & Insurance Test Series",
    message: "IBPS PO/Clerk, SBI PO, and RBI Assistant mock test series with Tamil & English bilingual explanations are currently being crafted by our expert educators.",
  },
  rrb_coming_soon: {
    id: "rrb_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "Railway Recruitment (RRB) Test Series",
    message: "Comprehensive CBT 1 & 2 mock test packs for RRB NTPC, Group D, and ALP are coming in the next release.",
  },
  police_coming_soon: {
    id: "police_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "TNUSRB Police Constable & SI Test Series",
    message: "Full-length physical test guidance & theoretical mock exams for TNUSRB are in development.",
  },
  tnpsc_group_select: {
    id: "tnpsc_group_select",
    type: "BRANCH",
    question: "Select your specific TNPSC Examination Target:",
    options: [
      { label: "🎯 TNPSC Group 1 (Prelims & Mains)", nextId: "tnpsc_g1_subject_select" },
      { label: "📑 TNPSC Group 2 & 2A (Services)", nextId: "tnpsc_g2_coming_soon" },
      { label: "💼 TNPSC Group 4 & VAO (Village Admin Officer)", nextId: "tnpsc_g4_coming_soon" },
    ],
  },
  tnpsc_g2_coming_soon: {
    id: "tnpsc_g2_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "TNPSC Group 2 & 2A Mock Tests",
    message: "Group 2 & 2A full syllabus preliminary test papers and evaluation keys are arriving shortly.",
  },
  tnpsc_g4_coming_soon: {
    id: "tnpsc_g4_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "TNPSC Group 4 & VAO Master Pack",
    message: "The 100-test VAO master bundle is currently in final verification by subject matter experts.",
  },
  tnpsc_g1_subject_select: {
    id: "tnpsc_g1_subject_select",
    type: "BRANCH",
    question: "Choose the Subject for TNPSC Group 1 Preparation:",
    options: [
      { label: "📖 General Tamil & Literature (பொதுத் தமிழ்)", nextId: "tnpsc_g1_tamil_topic_select" },
      { label: "📜 Indian History & Culture of Tamil Nadu", nextId: "tnpsc_g1_history_coming_soon" },
      { label: "⚖️ Indian Polity & Governance", nextId: "tnpsc_g1_polity_coming_soon" },
      { label: "📐 Aptitude & Mental Ability", nextId: "tnpsc_g1_aptitude_coming_soon" },
    ],
  },
  tnpsc_g1_history_coming_soon: {
    id: "tnpsc_g1_history_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "TNPSC G1 History & Tamil Culture Pack",
    message: "Ancient to Modern Indian History & Sangam Age deep-dive questions are being finalized.",
  },
  tnpsc_g1_polity_coming_soon: {
    id: "tnpsc_g1_polity_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "Indian Polity & Constitution Pack",
    message: "Articles, Amendments, and Landmark Supreme Court judgments test suite is coming soon.",
  },
  tnpsc_g1_aptitude_coming_soon: {
    id: "tnpsc_g1_aptitude_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "Aptitude & Mental Ability Fast-Track",
    message: "Speed math, logical reasoning, and data interpretation tests are releasing soon.",
  },
  tnpsc_g1_tamil_topic_select: {
    id: "tnpsc_g1_tamil_topic_select",
    type: "BRANCH",
    question: "Select the Tamil Section you want to master:",
    options: [
      { label: "✍️ Tamil Grammar & Usage (இலக்கணம்)", nextId: "tnpsc_g1_tamil_grammar_subtopic" },
      { label: "📜 Sangam Literature & Epics (இலக்கியம்)", nextId: "tnpsc_g1_tamil_literature_coming_soon" },
      { label: "🏛️ Tamil Scholars & Service (தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்)", nextId: "tnpsc_g1_tamil_scholars_coming_soon" },
    ],
  },
  tnpsc_g1_tamil_literature_coming_soon: {
    id: "tnpsc_g1_tamil_literature_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "TNPSC Tamil Literature Master Module",
    message: "Ettuthogai, Pathupattu, Thirukkural, and Silappathikaram chapter-wise quizzes are under preparation.",
  },
  tnpsc_g1_tamil_scholars_coming_soon: {
    id: "tnpsc_g1_tamil_scholars_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "Tamil Scholars & Renaissance",
    message: "Bharathiyar, Bharathidasan, and contemporary Tamil literary scholars test set is coming soon.",
  },
  tnpsc_g1_tamil_grammar_subtopic: {
    id: "tnpsc_g1_tamil_grammar_subtopic",
    type: "BRANCH",
    question: "Select your specific Grammar (இலக்கணம்) Focus Area:",
    options: [
      { label: "🔍 சொல்லிலக்கணம் & பெயரெச்சம்/வினையெச்சம் Master Test", nextId: "test_purchase_tamil_grammar_pro" },
      { label: "📝 வேற்றுமை உருபுகள் & புணர்ச்சி விதிகள்", nextId: "tamil_punarchi_coming_soon" },
    ],
  },
  tamil_punarchi_coming_soon: {
    id: "tamil_punarchi_coming_soon",
    type: "LEAF_COMING_SOON",
    title: "புணர்ச்சி விதிகள் & சந்திப் பிழை திருத்தம் Test Series",
    message: "Rule-based grammar exercises and error identification tests are in production.",
  },
  test_purchase_tamil_grammar_pro: {
    id: "test_purchase_tamil_grammar_pro",
    type: "LEAF_PURCHASE",
    title: "TNPSC Group 1: சொல்லிலக்கணம் & இலக்கணக் குறிப்பு Premium Test Pack",
    description: "500+ Curated high-yield multiple-choice questions with detailed Tamil explanations, Samacheer Kalvi aligned syllabus, timer-based mock exam interface, and instant percentile ranking.",
    purchaseUrl: "https://watscrm.vercel.app/testo/tnpsc-g1-tamil-grammar",
  },
};

export default function WebGuidedFlowPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [currentNode, setCurrentNode] = useState<FlowNode>(localTree["root"]);
  const [historyStack, setHistoryStack] = useState<string[]>(["root"]);
  const [breadcrumbs, setBreadcrumbs] = useState<FlowBreadcrumb[]>([{ nodeId: "root", label: "Home" }]);
  const [isNotified, setIsNotified] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const selectOption = (nextId: string, optionLabel: string) => {
    const nextNode = localTree[nextId] || {
      id: nextId,
      type: "LEAF_COMING_SOON",
      title: "Module In Development",
      message: "This test module is coming soon.",
    };

    // Log analytics
    supabase
      .from("flow_analytics")
      .insert({
        event_type: "flow_option_selected",
        node_id: currentNode.id,
        option_label: optionLabel,
        user_id: user?.id || null,
        metadata: { nextId },
      })
      .then(() => {}, () => {});

    setCurrentNode(nextNode);
    setHistoryStack((prev) => [...prev, nextId]);
    setBreadcrumbs((prev) => [...prev, { nodeId: nextId, label: optionLabel.slice(0, 18) }]);
    setIsNotified(false);
  };

  const goBack = () => {
    if (historyStack.length <= 1) return;
    const newStack = [...historyStack];
    newStack.pop();
    const prevNodeId = newStack[newStack.length - 1];
    setCurrentNode(localTree[prevNodeId]);
    setHistoryStack(newStack);
    setBreadcrumbs((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
    setIsNotified(false);
  };

  const resetToRoot = () => {
    setCurrentNode(localTree["root"]);
    setHistoryStack(["root"]);
    setBreadcrumbs([{ nodeId: "root", label: "Home" }]);
    setIsNotified(false);
  };

  const jumpToBreadcrumb = (index: number) => {
    if (index >= breadcrumbs.length - 1) return;
    const target = breadcrumbs[index];
    const targetIndex = historyStack.indexOf(target.nodeId);
    if (targetIndex !== -1) {
      setHistoryStack(historyStack.slice(0, targetIndex + 1));
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      setCurrentNode(localTree[target.nodeId]);
      setIsNotified(false);
    }
  };

  const submitNotifyMe = async () => {
    if (isNotified || isNotifying) return;
    setIsNotifying(true);

    try {
      await supabase.from("pending_requests").insert({
        node_id: currentNode.id,
        user_id: user?.id || null,
        phone: profile?.email?.split("@")[0] || null,
        user_name: profile?.full_name || null,
        status: "pending",
      });

      setIsNotified(true);
    } catch (e) {
      setIsNotified(true);
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {historyStack.length > 1 ? (
              <button
                onClick={goBack}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/testo"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                title="Back to TestO Hub"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}

            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                ✦ AI Guided Learning Path ✦
              </span>
              <h1 className="text-xl font-bold text-white leading-tight">Curated Test Series Finder</h1>
            </div>
          </div>

          <button
            onClick={resetToRoot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.nodeId + idx}>
                <button
                  onClick={() => jumpToBreadcrumb(idx)}
                  disabled={isLast}
                  className={`px-3 py-1 rounded-lg transition-all truncate max-w-[160px] ${
                    isLast
                      ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {crumb.label}
                </button>
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Dynamic Node View */}
      {currentNode.type === "BRANCH" && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-white leading-snug mb-2">{currentNode.question}</h2>
            <p className="text-sm text-slate-400">Select an option below to narrow down your test syllabus.</p>
          </div>

          <div className="grid gap-3">
            {currentNode.options?.map((opt, idx) => (
              <button
                key={opt.nextId + idx}
                onClick={() => selectOption(opt.nextId, opt.label)}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#131d33] border border-white/10 hover:border-emerald-500/50 hover:bg-[#1a2744] text-left transition-all group shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-base font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {opt.label}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {currentNode.type === "LEAF_PURCHASE" && (
        <div className="bg-[#111c30] border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              TEST READY • HIGH YIELD
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{currentNode.title}</h2>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{currentNode.description}</p>

          <div className="bg-black/30 rounded-2xl p-4 sm:p-5 space-y-2.5 text-sm font-medium text-slate-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real Exam Timer & Automated Percentile Scoring</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Detailed Bilingual Tamil & English Explanations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Samacheer Kalvi & Latest Syllabus Aligned</span>
            </div>
          </div>

          <a
            href={currentNode.purchaseUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base shadow-lg shadow-emerald-500/30 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Take Test / Purchase Now</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      )}

      {currentNode.type === "LEAF_COMING_SOON" && (
        <div className="bg-[#111827] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Clock className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-wider">
            IN DEVELOPMENT
          </div>

          <h2 className="text-2xl font-bold text-white">{currentNode.title}</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">{currentNode.message}</p>

          {isNotified ? (
            <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500 text-emerald-300 text-sm font-semibold max-w-md mx-auto">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>We&apos;ll notify you on WhatsApp as soon as this test launches!</span>
            </div>
          ) : (
            <button
              onClick={submitNotifyMe}
              disabled={isNotifying}
              className="flex items-center justify-center gap-2 w-full max-w-md mx-auto py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>{isNotifying ? "Registering interest..." : "Notify Me When Ready"}</span>
            </button>
          )}

          <div>
            <button
              onClick={resetToRoot}
              className="text-xs text-slate-500 hover:text-slate-300 underline font-medium"
            >
              Explore Available Tests
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
