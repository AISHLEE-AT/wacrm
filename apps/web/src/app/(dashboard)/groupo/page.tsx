'use client';

import React, { useState } from 'react';
import {
  Users,
  Wallet,
  BookOpen,
  Video,
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Building,
  ShoppingBag,
  FileText,
  Printer,
  Copy,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  RotateCcw,
  PenTool,
} from 'lucide-react';

const COURSE_GUIDE_WHATSAPP = '919486335870';
const TELEGRAM_COMMUNITY_URL = 'https://t.me/supro_education';

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  paid: boolean;
  amount: number;
  loanBalance?: number;
}

export default function GroupOWebPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'meetings' | 'videos' | 'ai_docs' | 'schemes' | 'admin'>('overview');
  const [userRoleMode, setUserRoleMode] = useState<'leader' | 'member' | 'admin'>('leader');

  const [leaderInfo, setLeaderInfo] = useState({
    name: 'K. Meenakshi (மீனாட்சி)',
    phone: '9842111223',
  });

  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'K. Meenakshi (மீனாட்சி)', role: 'President (தலைவர்)', phone: '9842111223', paid: true, amount: 500, loanBalance: 0 },
    { id: '2', name: 'M. Anandhi (ஆனந்தி)', role: 'Secretary (செயலாளர்)', phone: '9842222334', paid: true, amount: 500, loanBalance: 0 },
    { id: '3', name: 'S. Lakshmi (லட்சுமி)', role: 'Treasurer (பொருளாளர்)', phone: '9842333445', paid: true, amount: 500, loanBalance: 16500 },
    { id: '4', name: 'P. Kavitha (கவிதா)', role: 'Member', phone: '9842444556', paid: true, amount: 500, loanBalance: 0 },
    { id: '5', name: 'R. Revathi (ரேவதி)', role: 'Member', phone: '9842555667', paid: false, amount: 500, loanBalance: 0 },
    { id: '6', name: 'T. Saranya (சரண்யா)', role: 'Member', phone: '9842666778', paid: true, amount: 500, loanBalance: 0 },
    { id: '7', name: 'V. Bhuvaneswari (புவனேஸ்வரி)', role: 'Member', phone: '9842777889', paid: false, amount: 500, loanBalance: 0 },
  ]);

  // Current Logged-in member simulation
  const currentMember = members[3] ?? members[0] ?? { id: 'fallback', name: 'Member', role: 'Member' as const, phone: '', savingsPaid: false, savingsAmount: 0 };

  // New member inputs
  const [newMemName, setNewMemName] = useState('');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemRole, setNewMemRole] = useState('Member');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Admin Emergency Leader Change State
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState('');
  const [customLeaderName, setCustomLeaderName] = useState('');
  const [customLeaderPhone, setCustomLeaderPhone] = useState('');

  // Admin Financial Calibration
  const [adminSavingsPool, setAdminSavingsPool] = useState('145000');
  const [adminLoanPool, setAdminLoanPool] = useState('40000');

  const [gdriveLink, setGdriveLink] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  // AI Document Generator State
  const [aiDocType, setAiDocType] = useState<
    'resolution' | 'bank_letter' | 'govt_petition' | 'project_plan' | 'meeting_notice' | 'savings_statement' | 'custom_doc'
  >('resolution');
  const [aiLanguage, setAiLanguage] = useState<'Tamil' | 'English'>('Tamil');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const toggleMemberPaid = (id: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, paid: !m.paid } : m));
  };

  const handleAddMember = () => {
    if (!newMemName.trim() || !newMemPhone.trim()) {
      alert('Please enter member name and phone number.');
      return;
    }
    const newM: Member = {
      id: `m-${Date.now()}`,
      name: newMemName.trim(),
      phone: newMemPhone.trim().replace(/\D/g, '').slice(-10),
      role: newMemRole,
      paid: false,
      amount: 500,
    };
    setMembers([...members, newM]);
    setNewMemName('');
    setNewMemPhone('');
    setIsAddingMember(false);
    alert(`🎉 Member ${newM.name} added! Their phone (${newM.phone}) is now automatically linked to this group.`);
  };

  // Admin Execute Leader Transfer
  const handleAdminTransferLeader = () => {
    let targetName = customLeaderName.trim();
    let targetPhone = customLeaderPhone.trim();

    if (selectedNewLeaderId) {
      const selected = members.find(m => m.id === selectedNewLeaderId);
      if (selected) {
        targetName = selected.name;
        targetPhone = selected.phone;
      }
    }

    if (!targetName || !targetPhone) {
      alert('Please select a member or enter new leader phone and name.');
      return;
    }

    if (confirm(`⚠️ Confirm Emergency Leader Transfer to:\n\n👤 ${targetName} (${targetPhone})?`)) {
      setLeaderInfo({ name: targetName, phone: targetPhone });
      const isExisting = members.some(m => m.phone === targetPhone);
      if (isExisting) {
        setMembers(members.map(m => {
          if (m.phone === targetPhone) {
            return { ...m, role: 'President (தலைவர்)' };
          }
          if (m.role.includes('President')) {
            return { ...m, role: 'Member' };
          }
          return m;
        }));
      } else {
        setMembers(prev => [...prev.map(m => m.role.includes('President') ? {...m, role: 'Member'} : m), {
          id: `m-${Date.now()}`,
          name: targetName,
          role: 'President (தலைவர்)',
          phone: targetPhone,
          paid: false,
          amount: 500
        }]);
      }
      alert(`✅ Leadership Transferred! ${targetName} (${targetPhone}) is now the primary Group Leader.`);
    }
  };

  const handleAdminUpdateRole = (memberId: string, role: string) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, role } : m));
  };

  const handleAdminDeleteMember = (memberId: string) => {
    if (confirm('Remove member from group roster?')) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const totalCollected = members.filter(m => m.paid).reduce((acc, m) => acc + m.amount, 0);

  const handleGenerateAiDoc = async () => {
    setIsAiLoading(true);
    try {
      const groupName = 'தாமரை மகளிர் சுய உதவிக் குழு (Thamarai Women SHG)';
      const regCode = 'TNCDW-MDU-2024-8842';
      const location = 'அலங்காநல்லூர், மதுரை';

      let template = '';
      if (aiDocType === 'resolution') {
        template =
          `# ${groupName}\n` +
          `**பதிவு எண்:** ${regCode} • **இடம்:** ${location}\n` +
          `**தீர்மான எண்:** RES-2026-${Date.now().toString().slice(-4)}\n` +
          `**தேதி:** ${new Date().toLocaleDateString('en-IN')}\n\n` +
          `## தீர்மானத்தின் தலைப்பு: ${aiPrompt || 'உள் கடன் மற்றும் மாதாந்திர சேமிப்பு ஒப்புதல்'}\n\n` +
          `### 1. பின்னணி & தேவை:\n` +
          `நமது குழுவின் 15 உறுப்பினர்களின் முழு சம்மதத்துடன், சுயதொழில் மேம்பாடு மற்றும் குடும்ப வாழ்வாதாரத்தை உயர்த்தும் பொருட்டு இந்த தீர்மானம் நிறைவேற்றப்படுகிறது.\n\n` +
          `### 2. நிறைவேற்றப்பட்ட முடிவு:\n` +
          `• உறுப்பினரின் விண்ணப்பம் பரிசீலிக்கப்பட்டு, ரூ. 25,000 உள் கடன் 1.5% மாதாந்திர வட்டியில் வழங்க ஒப்புதல் அளிக்கப்பட்டது.\n` +
          `• தவணைத் தொகை மாதாந்திர கூட்டத்தில் தவறாமல் செலுத்தப்பட வேண்டும்.\n\n` +
          `**வாக்குப்பதிவு:** 15/15 ஆதரவு (100% Quorum Passed)\n\n` +
          `தலைவர்: ${leaderInfo.name} ___________________\n` +
          `செயலாளர்: M. Anandhi ___________________\n` +
          `பொருளாளர்: S. Lakshmi ___________________`;
      } else if (aiDocType === 'bank_letter') {
        template =
          `அனுப்புநர்:\n` +
          `தலைவர் & நிர்வாகிகள்,\n` +
          `${groupName},\n` +
          `${location}.\n\n` +
          `பெறுநர்:\n` +
          `உயர்திரு கிளை மேலாளர் அவர்கள்,\n` +
          `கனரா வங்கி, அலங்காநல்லூர் கிளை, மதுரை.\n\n` +
          `பொருள்: தமிழ்நாடு மகளிர் திட்டம் நேரடி வங்கி கடன் (Direct Bank Linkage Loan) கோருதல் சார்பாக.\n\n` +
          `மதிப்பிற்குரிய ஐயா / அம்மா,\n\n` +
          `வணக்கம். எங்களது "${groupName}" கடந்த 3 ஆண்டுகளாக முறையாக செயல்பட்டு வருகிறது. எங்களது சேமிப்பு நிதி ரூ. 1,45,000 ஆக உள்ளது.\n\n` +
          `எங்களது உறுப்பினர்கள் தையல் மற்றும் சிறுதானிய மதிப்புக்கூட்டல் தொழிலை விரிவாக்கம் செய்ய ரூ. 5,00,000 மானிய கடன் வழங்குமாறு பணிவுடன் கேட்டுக்கொள்கிறோம்.\n\n` +
          `நன்றி,\n` +
          `இப்படிக்கு,\n` +
          `தலைவர் (${leaderInfo.name}), செயலாளர் (M. Anandhi), பொருளாளர் (S. Lakshmi)`;
      } else if (aiDocType === 'meeting_notice') {
        template =
          `👥 *${groupName} — மாதாந்திர கூட்ட அறிவிப்பு & அழைப்பிதழ்* 📢\n\n` +
          `வணக்கம் உறுப்பினர்களே! நமது குழுவின் 25-வது மாதாந்திர கலந்தாய்வு கூட்டம் கீழ்கண்டவாறு நடைபெறும்:\n\n` +
          `📅 *நாள்:* 05-செப்டம்பர்-2026 (ஞாயிற்றுக்கிழமை)\n` +
          `⏰ *நேரம்:* காலை 10:30 மணி\n` +
          `📍 *இடம்:* அலங்காநல்லூர் ஊராட்சி சமுதாயக் கூடம்\n\n` +
          `📌 *நிகழ்ச்சி நிரல் (Agenda):*\n` +
          `1. ஆகஸ்ட் மாத சேமிப்பு மற்றும் தவணை வசூல் தணிக்கை.\n` +
          `2. புதிய உறுப்பினர்களுக்கான தையல் இயந்திர உள் கடன் ஒதுக்கீடு.\n` +
          `3. கனரா வங்கி மானிய கடன் மனு கையொப்பமிடுதல்.\n\n` +
          `அனைத்து உறுப்பினர்களும் தவறாமல் வருகை தந்து தங்களது மாதாந்திர சேமிப்புத் தொகையினை செலுத்த அன்புடன் அழைக்கிறோம்.\n\n` +
          `இப்படிக்கு,\n` +
          `தலைவர் (${leaderInfo.name}) & செயலாளர் (M. Anandhi)`;
      } else if (aiDocType === 'savings_statement') {
        template =
          `# ${groupName} — மாதாந்திர சேமிப்பு & நிதி தணிக்கை அறிக்கை\n` +
          `**பதிவு எண்:** ${regCode} • **மாதம்:** ஆகஸ்ட் 2026\n\n` +
          `### 1. நிதி நிலை சுருக்கம்:\n` +
          `• மொத்த குழு சேமிப்பு நிதி: ரூ. 1,45,000\n` +
          `• சுழல் நிதி உள் கடன் இருப்பு: ரூ. 40,000 (1.5% வட்டி)\n` +
          `• கனரா வங்கி கணக்கு இருப்பு: ரூ. 1,05,000\n` +
          `• நடப்பு மாத வசூல்: ரூ. 7,500 (15 உறுப்பினர்கள்)\n\n` +
          `அனைத்து வரவு-செலவுகளும் முறையாக தணிக்கை செய்யப்பட்டு வங்கி பாஸ்புக்கில் பதிவு செய்யப்பட்டுள்ளது.\n\n` +
          `பொருளாளர்: S. Lakshmi ___________________`;
      } else if (aiDocType === 'project_plan') {
        template =
          `# சிறுதொழில் திட்ட அறிக்கை (Micro-Enterprise Project Proposal)\n` +
          `**குழு பெயர்:** ${groupName}\n` +
          `**தொழில் பிரிவு:** ${aiPrompt || 'ஆடை தயாரிப்பு & தையல் பயிலகம்'}\n` +
          `**மதிப்பீட்டு முதலீடு:** ₹2,50,000\n\n` +
          `### 1. திட்ட நோக்கம்:\n` +
          `15 மகளிர் உறுப்பினர்களுக்கு நேரடி சுய வேலைவாய்ப்பு மற்றும் மாதாந்திர நிலையான வருமானம் வழங்குதல்.\n\n` +
          `### 2. முதலீட்டு வரவு-செலவு விவரம்:\n` +
          `• 5 நவீன தையல் இயந்திரங்கள்: ரூ. 1,25,000\n` +
          `• துணி மற்றும் மூலப்பொருட்கள்: ரூ. 75,000\n` +
          `• நடைமுறை மூலதனம் & சந்தைப்படுத்துதல்: ரூ. 50,000\n\n` +
          `### 3. உற்பத்தி & லாப மதிப்பீடு:\n` +
          `• மாதாந்திர எதிர்பார்க்கப்படும் உற்பத்தி: 600 ஆடைகள்\n` +
          `• மாதாந்திர நிகர லாப மதிப்பீடு: ரூ. 45,000\n` +
          `• SuprO DealO நேரடி சந்தை இணைப்பு வழியாக விற்பனை செய்யப்படும்.`;
      } else {
        template =
          `பெருமதிப்பிற்குரிய வட்டார வளர்ச்சி அலுவலர் (BDO) / கிராம ஊராட்சி மன்ற தலைவர் அவர்களுக்கு சமர்ப்பிக்கப்படும் மனு:\n\n` +
          `கோரிக்கை: ${aiPrompt || 'கிராம சுய உதவிக் குழு கூட்ட அரங்கம் மற்றும் தெருவிளக்கு வசதி அமைத்து தருதல்'}\n\n` +
          `எங்களது கிராமத்தில் மகளிர் சுய உதவிக் குழு கூட்டங்கள் நடத்த சமுதாயக் கூடம் மற்றும் அடிப்படை வசதிகள் செய்து தருமாறு அன்புடன் கேட்டுக்கொள்கிறோம்.\n\n` +
          `இப்படிக்கு,\n` +
          `${groupName} நிர்வாகிகள் & உறுப்பினர்கள்`;
      }

      setAiResult(template);
    } catch (e: any) {
      alert('Error generating document: ' + e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShareToWhatsAppWeb = () => {
    if (!aiResult) return;
    const msg = `👥 *${leaderInfo.name} — Group Document*\n\n${aiResult}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareToCourseGuideWhatsAppWeb = () => {
    if (!aiResult) return;
    const msg = `👥 *SuprO GroupO — Official Document Submission*\n\n${aiResult}`;
    window.open(`https://wa.me/${COURSE_GUIDE_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareToTelegramWeb = () => {
    if (!aiResult) return;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(TELEGRAM_COMMUNITY_URL)}&text=${encodeURIComponent(aiResult)}`, '_blank');
  };

  const handleCopyTextWeb = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    alert('📋 Document copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-black rounded-full flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> GroupO • சங்கம் & குழுக்கள்
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-full">
              TNCDW-MDU-2024-8842
            </span>
            <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-400 text-xs font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Linking Active
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            தாமரை மகளிர் சுய உதவிக் குழு (Thamarai Women SHG)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            📍 அலங்காநல்லூர், மதுரை • Leader: {leaderInfo.name} ({leaderInfo.phone}) • மாதாந்திர சேமிப்பு ₹500
          </p>
        </div>

        {/* Dynamic Role Switcher (Simulate Leader vs Member vs Admin Login) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#131f37] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => { setUserRoleMode('leader'); setActiveTab('overview'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                userRoleMode === 'leader' ? 'bg-pink-600 text-white' : 'text-slate-400'
              }`}
            >
              👑 Leader
            </button>
            <button
              onClick={() => { setUserRoleMode('member'); setActiveTab('overview'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                userRoleMode === 'member' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              👤 Member
            </button>
            <button
              onClick={() => { setUserRoleMode('admin'); setActiveTab('admin'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                userRoleMode === 'admin' ? 'bg-rose-600 text-white' : 'text-rose-400'
              }`}
            >
              <ShieldAlert className="w-3 h-3" /> Admin
            </button>
          </div>

          <button
            onClick={() => setActiveTab('ai_docs')}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Letters & Share</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'overview' ? 'bg-pink-600 text-white' : 'bg-[#0e172a] text-slate-400 hover:text-white'
          }`}
        >
          👥 கண்ணோட்டம் (Overview)
        </button>
        <button
          onClick={() => setActiveTab('ai_docs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'ai_docs' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-[#0e172a] text-pink-400 hover:text-pink-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> ✨ ஆவண உருவாக்கம் & பகிர்வு (Create & Share)
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'savings' ? 'bg-pink-600 text-white' : 'bg-[#0e172a] text-slate-400 hover:text-white'
          }`}
        >
          💰 சேமிப்பு & வரவு-செலவு (Savings & Ledger)
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'meetings' ? 'bg-pink-600 text-white' : 'bg-[#0e172a] text-slate-400 hover:text-white'
          }`}
        >
          📝 கூட்ட குறிப்புகள் & தீர்மானங்கள்
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'videos' ? 'bg-pink-600 text-white' : 'bg-[#0e172a] text-slate-400 hover:text-white'
          }`}
        >
          📹 வீடியோ & டிரைவ்
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'schemes' ? 'bg-pink-600 text-white' : 'bg-[#0e172a] text-slate-400 hover:text-white'
          }`}
        >
          🏛️ அரசு திட்டங்கள் & சந்தை
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'admin' ? 'bg-rose-600 text-white' : 'bg-[#0e172a] text-rose-400 hover:text-rose-300'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> 🛡️ நிர்வாகி மையம் (Admin Console)
        </button>
      </div>

      {/* ──── TAB: UNIVERSAL AI DOCUMENT & MULTI-CHANNEL DISPATCH ──── */}
      {activeTab === 'ai_docs' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Document Configuration */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-pink-400" /> ஆவண வகை தேர்வு (Select Document Type)
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'resolution', label: 'தீர்மானம்', sub: 'Resolution' },
                  { id: 'bank_letter', label: 'வங்கி கடன்', sub: 'Bank Letter' },
                  { id: 'meeting_notice', label: 'கூட்ட அறிவிப்பு', sub: 'Meeting Notice' },
                  { id: 'savings_statement', label: 'சேமிப்பு அறிக்கை', sub: 'Passbook Summary' },
                  { id: 'govt_petition', label: 'அரசு / BDO மனு', sub: 'Govt Petition' },
                  { id: 'project_plan', label: 'தொழில் திட்டம்', sub: 'Business Plan' },
                  { id: 'custom_doc', label: 'தனிப்பயன் கடிதம்', sub: 'Custom Letter' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAiDocType(item.id as any)}
                    className={`p-3 rounded-xl text-left border transition ${
                      aiDocType === item.id
                        ? 'bg-pink-600/20 border-pink-500 text-white'
                        : 'bg-[#131f37] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.sub}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">விவரங்கள் / குறிப்புகள் (Key Requirements / Prompt):</label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="எ.கா: மாதாந்திர கூட்டம், தையல் இயந்திர கடன் ஒப்புதல்..."
                  className="w-full mt-1.5 bg-[#131f37] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition"
                />
              </div>

              <button
                onClick={handleGenerateAiDoc}
                disabled={isAiLoading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAiLoading ? 'Generating...' : 'AI சட்டபூர்வ ஆவணமாக உருவாக்கு 📄'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Document Editor & Multi-Channel Dispatch */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" /> ஆவண முன்னோட்டம் & பகிர்வு (Preview & Multi-Channel Dispatch)
                </h3>
                <button
                  onClick={handleCopyTextWeb}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              <textarea
                rows={12}
                value={aiResult}
                onChange={(e) => setAiResult(e.target.value)}
                placeholder="தயாரான ஆவணம் இங்கு தோன்றும் (Generated document appears here)..."
                className="w-full bg-[#131f37] border border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />

              {/* ─── MULTI-CHANNEL SHARING BUTTONS ─── */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  பகிர்வு வழிகள் (Multi-Channel Sharing Matrix):
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={handleShareToWhatsAppWeb}
                    className="py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp 📲</span>
                  </button>

                  <button
                    onClick={handleShareToTelegramWeb}
                    className="py-2.5 bg-[#229ED9] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram ✈️</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="py-2.5 bg-[#EC4899] hover:bg-pink-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Export PDF 📄</span>
                  </button>

                  <button
                    onClick={handleShareToCourseGuideWhatsAppWeb}
                    className="py-2.5 bg-[#075E54] hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>BDO Hotline</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB: ADMIN EMERGENCY CONSOLE ──── */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="bg-rose-950/20 border border-rose-600/40 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
              <ShieldAlert className="w-5 h-5" /> SUPRO APP ADMIN EMERGENCY CONTROL CONSOLE
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Use this console for emergency group governance: Leader Reassignments, Accounting & Dispute Overrides, Member Roster Corrections, and Official State Audit Reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Emergency Leader Transfer */}
            <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-rose-400" /> 👑 அவசர தலைவர் மாற்றம் (Emergency Leader Transfer)
              </h3>
              <div className="p-3 bg-[#131f37] rounded-xl text-xs space-y-1">
                <div className="text-slate-400">Current Group Leader:</div>
                <div className="text-white font-bold">{leaderInfo.name} ({leaderInfo.phone})</div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300">Select Existing Member to Promote:</label>
                <select
                  value={selectedNewLeaderId}
                  onChange={(e) => setSelectedNewLeaderId(e.target.value)}
                  className="w-full bg-[#131f37] border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">-- Choose Member from Roster --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.phone}) - {m.role}</option>
                  ))}
                </select>

                <div className="text-xs text-center text-slate-500 font-bold">-- OR Enter External Leader Details --</div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="New Leader Name"
                    value={customLeaderName}
                    onChange={(e) => setCustomLeaderName(e.target.value)}
                    className="bg-[#131f37] border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="10-digit Phone"
                    value={customLeaderPhone}
                    onChange={(e) => setCustomLeaderPhone(e.target.value)}
                    className="bg-[#131f37] border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleAdminTransferLeader}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Execute Emergency Leader Transfer 👑</span>
                </button>
              </div>
            </div>

            {/* 2. Accounting & Dispute Calibrator */}
            <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> 💰 கணக்கு திருத்தம் & சர்ச்சை தீர்வு (Financial Calibration)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Total Savings Pool ₹:</label>
                  <input
                    type="number"
                    value={adminSavingsPool}
                    onChange={(e) => setAdminSavingsPool(e.target.value)}
                    className="w-full mt-1 bg-[#131f37] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Active Loan Pool ₹:</label>
                  <input
                    type="number"
                    value={adminLoanPool}
                    onChange={(e) => setAdminLoanPool(e.target.value)}
                    className="w-full mt-1 bg-[#131f37] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold text-amber-400"
                  />
                </div>
              </div>

              <button
                onClick={() => alert('✅ Financial balances successfully saved.')}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl"
              >
                Save Group Financial Balances
              </button>

              {/* Official PDF Export */}
              <div className="pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Export Official Admin Audit Report PDF 📄</span>
                </button>
              </div>
            </div>
          </div>

          {/* Member Roster & Role Override */}
          <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" /> உறுப்பினர் தணிக்கை & பொறுப்பு திருத்தம் (Member Roster Override)
            </h3>

            <div className="divide-y divide-slate-800">
              {members.map(m => (
                <div key={m.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{m.name}</span>
                      <span className="text-xs text-slate-400">({m.phone})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={m.role}
                      onChange={(e) => handleAdminUpdateRole(m.id, e.target.value)}
                      className="bg-[#131f37] border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                    >
                      <option value="President (தலைவர்)">President</option>
                      <option value="Secretary (செயலாளர்)">Secretary</option>
                      <option value="Treasurer (பொருளாளர்)">Treasurer</option>
                      <option value="Animator">Animator</option>
                      <option value="Member">Member</option>
                    </select>

                    <button
                      onClick={() => toggleMemberPaid(m.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                        m.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {m.paid ? '✅ Paid (₹500)' : '⚡ Mark Paid'}
                    </button>

                    <button
                      onClick={() => handleAdminDeleteMember(m.id)}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 1: OVERVIEW (LEADER VS MEMBER DYNAMIC VIEW) ──── */}
      {activeTab === 'overview' && (
        <div>
          {userRoleMode === 'member' ? (
            /* ─── DEDICATED MEMBER PASSBOOK & LINKED VIEW ─── */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[#0e172a] border border-emerald-500/30 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> You are Linked to: தாமரை மகளிர் குழு
                    </span>
                    <span className="text-xs text-slate-400">Role: Member</span>
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    வணக்கம், {currentMember?.name}!
                  </h2>
                  <p className="text-xs text-slate-400">
                    Your phone number ({currentMember?.phone}) was linked by Leader {leaderInfo.name}. Here is your live personal savings passbook.
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#131f37] p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400">August 2026 Monthly Due</div>
                      <div className="text-2xl font-black text-white mt-1">₹500</div>
                      <div className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Verified by Treasurer
                      </div>
                    </div>
                    <div className="bg-[#131f37] p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400">Your Accumulated Savings</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">₹18,000</div>
                      <div className="text-[11px] text-slate-400 mt-1">Safe in Group Canara Bank Account</div>
                    </div>
                  </div>
                </div>

                {/* Meeting & Resolution Feed */}
                <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-400" /> Upcoming Meeting & Resolutions
                  </h3>
                  <div className="p-4 bg-[#131f37] rounded-2xl space-y-2 text-xs">
                    <div className="text-white font-bold">Meeting #24 (Regular Monthly Assembly)</div>
                    <div className="text-slate-400">📅 Every Month 5th & 20th • 📍 Alanganallur Panchayat Hall</div>
                    <div className="text-sky-400 font-bold">Approved Resolution: Internal Tailoring Machine Loan for S. Lakshmi (₹25,000)</div>
                  </div>
                </div>
              </div>

              {/* Leader Contact Card */}
              <div className="space-y-6">
                <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-400" /> குழு நிர்வாகிகள் (Officers)
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-[#131f37] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{leaderInfo.name}</div>
                        <div className="text-slate-400">President • {leaderInfo.phone}</div>
                      </div>
                      <button
                        onClick={() => window.open(`https://wa.me/91${leaderInfo.phone}`, '_blank')}
                        className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                    </div>

                    <div className="p-3 bg-[#131f37] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">S. Lakshmi</div>
                        <div className="text-slate-400">Treasurer • 9842333445</div>
                      </div>
                      <button
                        onClick={() => window.open(`https://wa.me/919842333445`, '_blank')}
                        className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── LEADER ROSTER & MEMBER MANAGEMENT VIEW ─── */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-pink-400" /> குழு உறுப்பினர்கள் (Member Roster & Auto-Link)
                    </h3>
                    <button
                      onClick={() => setIsAddingMember(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Member</span>
                    </button>
                  </div>

                  {/* Add Member Form Sheet */}
                  {isAddingMember && (
                    <div className="p-4 bg-[#131f37] rounded-2xl border border-emerald-500/30 space-y-3">
                      <div className="text-xs font-bold text-emerald-400">Add New Group Member (புதிய உறுப்பினர்)</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Member Name"
                          value={newMemName}
                          onChange={(e) => setNewMemName(e.target.value)}
                          className="bg-[#0e172a] border border-slate-700 rounded-xl p-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="10-digit Phone Number"
                          value={newMemPhone}
                          onChange={(e) => setNewMemPhone(e.target.value)}
                          className="bg-[#0e172a] border border-slate-700 rounded-xl p-2 text-xs text-white"
                        />
                        <select
                          value={newMemRole}
                          onChange={(e) => setNewMemRole(e.target.value)}
                          className="bg-[#0e172a] border border-slate-700 rounded-xl p-2 text-xs text-white"
                        >
                          <option value="Secretary">Secretary</option>
                          <option value="Treasurer">Treasurer</option>
                          <option value="Member">Member</option>
                          <option value="Animator">Animator</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsAddingMember(false)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddMember}
                          className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                        >
                          Save & Auto-Link Phone
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="divide-y divide-slate-800">
                    {members.map(m => (
                      <div key={m.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-pink-400 rounded-md">
                              {m.role}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{m.phone} • Auto-Linked</div>
                        </div>
                        <button
                          onClick={() => toggleMemberPaid(m.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
                            m.paid
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {m.paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>{m.paid ? 'Paid ₹500' : 'Pending'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-sky-400" /> வங்கி விவரங்கள் (Bank Linkage)
                  </h3>
                  <div className="bg-[#131f37] p-4 rounded-2xl space-y-2 text-xs">
                    <div className="text-white font-bold">Canara Bank (அலங்காநல்லூர்)</div>
                    <div className="text-slate-400">A/C: *******8920 • IFSC: CNRB0001234</div>
                    <div className="text-emerald-400 font-bold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Subsidized Credit Linkage Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──── TAB 2: SAVINGS & ACCOUNTING ──── */}
      {activeTab === 'savings' && (
        <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#131f37] p-5 rounded-2xl border border-emerald-500/30">
              <div className="text-xs text-slate-400">Total Savings Pool</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">₹1,45,000</div>
              <div className="text-[11px] text-emerald-300 mt-1">August: ₹{totalCollected} collected</div>
            </div>
            <div className="bg-[#131f37] p-5 rounded-2xl border border-amber-500/30">
              <div className="text-xs text-slate-400">Active Internal Loans</div>
              <div className="text-2xl font-black text-amber-400 mt-1">₹40,000</div>
              <div className="text-[11px] text-amber-300 mt-1">1.5% monthly interest revolving fund</div>
            </div>
            <div className="bg-[#131f37] p-5 rounded-2xl border border-sky-500/30">
              <div className="text-xs text-slate-400">Bank Pool Balance</div>
              <div className="text-2xl font-black text-sky-400 mt-1">₹1,05,000</div>
              <div className="text-[11px] text-sky-300 mt-1">Verified Canara Bank Balance</div>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 3: RESOLUTIONS ──── */}
      {activeTab === 'meetings' && (
        <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" /> தீர்மான புத்தகம் (Resolution Register)
            </h3>
            <button
              onClick={() => setActiveTab('ai_docs')}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Resolution Drafter</span>
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-[#131f37] rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400">Resolution #1: Internal Tailoring Machine Loan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Passed (15/15)</span>
              </div>
              <p className="text-xs text-slate-300">
                Approved internal micro-loan of ₹25,000 at 1.5% monthly interest for purchase of tailoring machine for S. Lakshmi.
              </p>
            </div>
            <div className="p-4 bg-[#131f37] rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400">Resolution #2: TNCDW Bank Direct Linkage Loan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Passed (14/15)</span>
              </div>
              <p className="text-xs text-slate-300">
                Authorized President and Secretary to submit application for ₹5,00,000 subsidized bank loan under TNCDW Mahalir Thittam.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──── TAB 4: VIDEOS & DRIVE ──── */}
      {activeTab === 'videos' && (
        <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-pink-400" /> கூட்ட வீடியோ பதிவு & கூகுள் டிரைவ் (Meeting Video Records)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Directly upload meeting video recordings to Google Drive and verify with your Course Guide (+91 9486335870)
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#071f15] border border-emerald-500/40 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className="text-xs font-bold text-[#25D366]">BDO / Course Guide WhatsApp CRM Verification</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#25D366]/20 text-[#25D366] rounded">
                +91 9486335870
              </span>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-emerald-400">Google Drive Video Link:</label>
              <input
                type="text"
                value={gdriveLink}
                onChange={(e) => setGdriveLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full mt-1 bg-[#0e172a] border border-emerald-600/40 rounded-xl p-2.5 text-xs text-white placeholder-emerald-800 focus:outline-none focus:border-[#25D366] transition font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-emerald-400">Meeting Notes / Summary:</label>
              <textarea
                rows={2}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Meeting highlights, member quorum..."
                className="w-full mt-1 bg-[#0e172a] border border-emerald-600/40 rounded-xl p-2.5 text-xs text-white placeholder-emerald-800 focus:outline-none focus:border-[#25D366] transition"
              />
            </div>

            <button
              onClick={() => {
                const link = gdriveLink.trim() || 'https://drive.google.com';
                const msg = `👥 *SuprO GroupO — Meeting Video Record*\n\nDrive Link: ${link}${meetingNotes ? '\n\nNotes: ' + meetingNotes : ''}`;
                window.open(`https://wa.me/${COURSE_GUIDE_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>📲 Send Meeting Video Record to Course Guide / BDO on WhatsApp (9486335870)</span>
            </button>
          </div>
        </div>
      )}

      {/* ──── TAB: SCHEMES & MARKETPLACE ──── */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0e172a] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" /> தமிழ்நாடு அரசு சிறப்பு திட்டங்கள் (Government Schemes)
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-[#131f37] rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>மகளிர் திட்டம் - நேரடி கடன் (Mathi Linkage)</span>
                  <span className="text-emerald-400">₹5 - ₹20 Lakhs</span>
                </div>
                <p className="text-xs text-slate-400">
                  Subsidized low-interest bank loan linkage for women SHGs through TNCDW.
                </p>
              </div>
              <div className="p-4 bg-[#131f37] rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>வாழ்ந்து காட்டுவோம் திட்டம் (Vazhndhu Kattuvom)</span>
                  <span className="text-emerald-400">35% மானியம்</span>
                </div>
                <p className="text-xs text-slate-400">
                  Matching grants for collective processing, organic farming and value addition units.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a0c18] border border-pink-500/30 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-pink-400 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-400" /> SuprO DealO Market Linkage (சந்தை வாய்ப்பு)
              </h3>
              <p className="text-xs text-pink-200/80 mt-2 leading-relaxed">
                Directly sell your SHG / FPO manufactured products (Pickles, Masala, Millets, Handloom Sarees, Terracotta Pottery) to thousands of local consumers without middlemen!
              </p>
            </div>
            <button
              onClick={() => window.open('/dealo', '_blank')}
              className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>List Products on SuprO DealO Marketplace 🛍️</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
