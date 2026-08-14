"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Search,
  ExternalLink,
  Award,
  Plus,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PendingTopicSummary {
  nodeId: string;
  title: string;
  category: string;
  requestCount: number;
  uniqueUsers: number;
  lastRequestedAt: string;
  phoneList: string[];
}

export default function AdminDemandsPage() {
  const supabase = createClient();

  const [topics, setTopics] = useState<PendingTopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastingNodeId, setBroadcastingNodeId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Flow Node Creator Modal State
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeType, setNewNodeType] = useState<"BRANCH" | "LEAF_PURCHASE" | "LEAF_COMING_SOON">("LEAF_PURCHASE");
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeQuestion, setNewNodeQuestion] = useState("");
  const [newNodeDescription, setNewNodeDescription] = useState("");
  const [newNodePurchaseUrl, setNewNodePurchaseUrl] = useState("");
  const [newNodeCategory, setNewNodeCategory] = useState("tnpsc");
  const [savingNode, setSavingNode] = useState(false);

  const loadDemandsData = async () => {
    setLoading(true);
    setSuccessMessage(null);

    try {
      // 1. Fetch pending requests
      const { data: requests, error: reqError } = await supabase
        .from("pending_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // 2. Fetch flow nodes for titles
      const { data: nodes } = await supabase.from("flow_nodes").select("id, title, category_tag, type");

      const nodeMap: Record<string, { title: string; category: string }> = {};
      (nodes || []).forEach((n) => {
        nodeMap[n.id] = {
          title: n.title || n.id.replace(/_/g, " ").toUpperCase(),
          category: n.category_tag || "General",
        };
      });

      // Aggregate requests by node_id
      const grouped: Record<string, { phones: Set<string>; lastAt: string }> = {};
      (requests || []).forEach((r) => {
        if (!grouped[r.node_id]) {
          grouped[r.node_id] = { phones: new Set(), lastAt: r.created_at };
        }
        if (r.phone) grouped[r.node_id].phones.add(r.phone);
      });

      const summaryList: PendingTopicSummary[] = Object.keys(grouped).map((nodeId) => ({
        nodeId,
        title: nodeMap[nodeId]?.title || nodeId,
        category: nodeMap[nodeId]?.category || "Competitive Exams",
        requestCount: grouped[nodeId].phones.size,
        uniqueUsers: grouped[nodeId].phones.size,
        lastRequestedAt: grouped[nodeId].lastAt,
        phoneList: Array.from(grouped[nodeId].phones),
      }));

      // Sort by highest demand first
      summaryList.sort((a, b) => b.requestCount - a.requestCount);

      setTopics(summaryList);
    } catch (err) {
      console.error("Error loading demands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemandsData();
  }, []);

  // Handle 1-Click WhatsApp Broadcast & Notification
  const handleBroadcastRelease = async (topic: PendingTopicSummary) => {
    if (!confirm(`Are you ready to notify ${topic.requestCount} student(s) on WhatsApp for "${topic.title}"?`)) {
      return;
    }

    setBroadcastingNodeId(topic.nodeId);

    try {
      const response = await fetch("/api/admin/flow-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: topic.nodeId,
          topicTitle: topic.title,
          phones: topic.phoneList,
          testUrl: `https://watscrm.vercel.app/testo/flow`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`Successfully notified ${result.sentCount} student(s) via WhatsApp!`);
        // Refresh demands list
        loadDemandsData();
      } else {
        alert(result.error || "Broadcast failed. Please check WhatsApp configuration.");
      }
    } catch (e: any) {
      alert("Error triggering WhatsApp broadcast: " + e.message);
    } finally {
      setBroadcastingNodeId(null);
    }
  };

  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId.trim() || !newNodeTitle.trim()) {
      alert("Please provide both Node ID and Title.");
      return;
    }

    setSavingNode(true);
    try {
      const payload: Record<string, any> = {
        id: newNodeId.trim(),
        type: newNodeType,
        title: newNodeTitle.trim(),
        category_tag: newNodeCategory.trim() || "general",
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (newNodeType === "BRANCH") {
        payload.question = newNodeQuestion.trim();
        payload.options = [];
      } else if (newNodeType === "LEAF_PURCHASE") {
        payload.description = newNodeDescription.trim();
        payload.purchase_url = newNodePurchaseUrl.trim();
      } else if (newNodeType === "LEAF_COMING_SOON") {
        payload.message = newNodeDescription.trim();
      }

      const { error } = await supabase.from("flow_nodes").upsert(payload);
      if (error) throw error;

      setSuccessMessage(`Flow Node "${newNodeId}" created and published live!`);
      setShowNodeModal(false);
      setNewNodeId("");
      setNewNodeTitle("");
      setNewNodeDescription("");
      setNewNodePurchaseUrl("");
      setNewNodeQuestion("");
      loadDemandsData();
    } catch (err: any) {
      alert("Failed to save flow node: " + err.message);
    } finally {
      setSavingNode(false);
    }
  };

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWaitingStudents = topics.reduce((acc, curr) => acc + curr.requestCount, 0);

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Demand Intelligence & Content Prioritization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Student Exam Demands
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live requests collected from students navigating the Guided Assessment Funnel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNodeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Topic</span>
          </button>

          <button
            onClick={loadDemandsData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold transition-all w-fit"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#111827] border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-bold uppercase">
              Total Waiting Students
            </CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-400 flex items-center justify-between">
              <span>{totalWaitingStudents}</span>
              <Users className="w-6 h-6 text-emerald-500/40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Students awaiting new test releases</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-bold uppercase">
              Requested Topics
            </CardDescription>
            <CardTitle className="text-3xl font-black text-amber-400 flex items-center justify-between">
              <span>{topics.length}</span>
              <Clock className="w-6 h-6 text-amber-500/40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Unique syllabus modules in demand</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-bold uppercase">
              Guided Flow Conversion
            </CardDescription>
            <CardTitle className="text-3xl font-black text-blue-400 flex items-center justify-between">
              <span>100% Zero-Drop</span>
              <Award className="w-6 h-6 text-blue-500/40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Unbuilt branches capture instant leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Topic Rankings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search requested exam topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f172a] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Analyzing student search traffic...</span>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="p-12 text-center bg-[#111827] rounded-2xl border border-white/5">
            <p className="text-slate-400 text-sm">No pending requests found for the current filter.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTopics.map((topic, idx) => (
              <div
                key={topic.nodeId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#131d33] border border-white/10 hover:border-emerald-500/30 transition-all gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0 mt-0.5">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase">
                        {topic.category}
                      </span>
                      <span className="text-xs text-slate-500">Node: {topic.nodeId}</span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">{topic.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <strong className="text-emerald-400">{topic.requestCount}</strong> student(s) requested this module
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:self-center">
                  <button
                    onClick={() => handleBroadcastRelease(topic)}
                    disabled={broadcastingNodeId === topic.nodeId}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {broadcastingNodeId === topic.nodeId
                        ? "Sending WhatsApp..."
                        : `Launch & Notify (${topic.requestCount})`}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Flow Node Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Publish New Flow Node</h3>
              </div>
              <button
                onClick={() => setShowNodeModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNode} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Node Identifier (Unique Key)
                </label>
                <input
                  type="text"
                  placeholder="e.g. tnpsc_g1_geography_topic"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Node Type
                  </label>
                  <select
                    value={newNodeType}
                    onChange={(e: any) => setNewNodeType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LEAF_PURCHASE">LEAF_PURCHASE (Live Test)</option>
                    <option value="LEAF_COMING_SOON">LEAF_COMING_SOON (Waitlist)</option>
                    <option value="BRANCH">BRANCH (Question Node)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. tnpsc, banking"
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Display Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. TNPSC Group 1 Geography Master Test"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {newNodeType === "BRANCH" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Branch Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Which topic do you want to practice?"
                    value={newNodeQuestion}
                    onChange={(e) => setNewNodeQuestion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      {newNodeType === "LEAF_PURCHASE" ? "Test Description" : "Coming Soon Message"}
                    </label>
                    <textarea
                      placeholder={newNodeType === "LEAF_PURCHASE" ? "500+ curated questions, timer interface..." : "Questions are under review by educators..."}
                      value={newNodeDescription}
                      onChange={(e) => setNewNodeDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {newNodeType === "LEAF_PURCHASE" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Purchase / Test URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://watscrm.vercel.app/testo/my-test"
                        value={newNodePurchaseUrl}
                        onChange={(e) => setNewNodePurchaseUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNode}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  {savingNode ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{savingNode ? "Publishing..." : "Publish Live to App"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
