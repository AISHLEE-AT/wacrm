import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Plus,
  Share2,
  Sparkles,
  BookOpen,
  Calendar,
  MapPin,
  Vote,
  Printer,
} from 'lucide-react';
import { GroupAiService } from '@/lib/GroupAiService';
// Assuming GroupAiAssistantWebModal exists. If not, it should be created similarly.
import { GroupAiAssistantWebModal } from './GroupAiAssistantWebModal';

export interface MeetingResolution {
  id: string;
  resolutionNumber: number;
  title: string;
  description: string;
  proposer: string;
  passedVotes: number;
  totalVotes: number;
  status: 'Passed' | 'Proposed' | 'Under Review';
}

export interface GroupMember {
  id: string;
  name: string;
  role: string;
  savingsBalance: number;
  loanBalance: number;
  monthlyPledge: number;
  avatarUrl?: string;
  phone?: string;
}

interface GroupMeetingNotesWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  group?: any;
  meetingNumber?: number;
  members: GroupMember[];
  currentMember?: any;
}

export const GroupMeetingNotesWebModal: React.FC<GroupMeetingNotesWebModalProps> = ({
  isOpen,
  onClose,
  groupName,
  group,
  meetingNumber = 24,
  members: initialMembers,
  currentMember
}) => {
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingVenue, setMeetingVenue] = useState<string>('Panchayat Community Hall / கிராம பஞ்சாயத்து அரங்கம்');
  const [agenda, setAgenda] = useState<string>(
    '1. Monthly savings collection & audit\n2. Internal loan application review\n3. Bank linkage subsidy scheme\n4. Festival stall planning'
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const resolvedGroupName = groupName || group?.name || 'Group';

  // Attendance state: memberId -> 'Present' | 'Absent' | 'Leave'
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>(() => {
    const map: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    initialMembers.forEach((m) => {
      map[m.id] = 'Present';
    });
    return map;
  });

  // Resolutions state
  const [resolutions, setResolutions] = useState<MeetingResolution[]>([
    {
      id: 'res-1',
      resolutionNumber: 1,
      title: 'Internal Loan Sanction for S. Lakshmi (உள் கடன் ஒப்புதல்)',
      description: 'Approved internal micro-loan of ₹25,000 at 1.5% monthly interest for purchase of tailoring machine. Repayment over 10 equal installments.',
      proposer: 'K. Meenakshi (President)',
      passedVotes: initialMembers.length,
      totalVotes: initialMembers.length,
      status: 'Passed',
    },
    {
      id: 'res-2',
      resolutionNumber: 2,
      title: 'Canara Bank SHG Direct Linkage Loan (வங்கி நேரடி கடன் விண்ணப்பம்)',
      description: 'Authorized President and Secretary to submit application for ₹5,00,000 subsidized bank loan under TNCDW Mahalir Thittam.',
      proposer: 'M. Anandhi (Secretary)',
      passedVotes: initialMembers.length > 1 ? initialMembers.length - 1 : initialMembers.length,
      totalVotes: initialMembers.length,
      status: 'Passed',
    },
  ]);

  // New Resolution Form Modal
  const [isAddingRes, setIsAddingRes] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [newResProposer, setNewResProposer] = useState(initialMembers[0]?.name || 'Leader');

  const toggleAttendance = (memberId: string) => {
    setAttendance((prev) => {
      const curr = prev[memberId] || 'Present';
      const next = curr === 'Present' ? 'Absent' : curr === 'Absent' ? 'Leave' : 'Present';
      return { ...prev, [memberId]: next };
    });
  };

  const handleAddResolution = () => {
    if (!newResTitle.trim() || !newResDesc.trim()) {
      alert('Please fill in resolution title and description.');
      return;
    }

    const newRes: MeetingResolution = {
      id: `res-${Date.now()}`,
      resolutionNumber: resolutions.length + 1,
      title: newResTitle.trim(),
      description: newResDesc.trim(),
      proposer: newResProposer.trim(),
      passedVotes: initialMembers.length,
      totalVotes: initialMembers.length,
      status: 'Passed',
    };

    setResolutions([...resolutions, newRes]);
    setIsAddingRes(false);
    setNewResTitle('');
    setNewResDesc('');
    alert(`✅ Resolution Added\nResolution #${newRes.resolutionNumber} logged into Group Resolution Book.`);
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'Present').length;
  const quorumPercent = Math.round((presentCount / (initialMembers.length || 1)) * 100);

  const handleShareMinutes = () => {
    const resSummary = resolutions
      .map((r) => `📌 *Resolution #${r.resolutionNumber}:* ${r.title}\n_${r.description}_\n(Votes: ${r.passedVotes}/${r.totalVotes} - ${r.status})\n`)
      .join('\n');

    const msg = `📖 *${resolvedGroupName} — Meeting Minutes #${meetingNumber}* 📝\n\n` +
      `📅 *Date:* ${meetingDate}\n` +
      `📍 *Venue:* ${meetingVenue}\n` +
      `👥 *Attendance:* ${presentCount}/${initialMembers.length} Present (${quorumPercent}% Quorum)\n\n` +
      `📋 *Agenda:*\n${agenda}\n\n` +
      `📜 *Key Resolutions Passed (தீர்மானங்கள்):*\n${resSummary}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Recorded & Verified in SuprO GroupO Digital Resolution Register ✨`;

    // Web share fallback
    if (navigator.share) {
      navigator.share({
        title: 'Meeting Minutes',
        text: msg,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(msg);
      alert('Minutes copied to clipboard');
    }
  };

  const handleExportMinutesPdf = async () => {
    setIsExportingPdf(true);
    try {
      const resSummary = resolutions
        .map(
          (r) =>
            `### தீர்மானம் எண் ${r.resolutionNumber}: ${r.title}\n\n${r.description}\n\n**வாக்கு விவரம்:** ${r.passedVotes}/${r.totalVotes} ஆதரவு (${r.status}) • முன்மொழிந்தவர்: ${r.proposer}`
        )
        .join('\n\n');

      const fullContent = `
## கூட்ட நிகழ்வு விவரம் (Meeting Proceedings)
- **கூட்ட எண் (Meeting No):** #${meetingNumber}
- **நடைபெற்ற இடம் (Venue):** ${meetingVenue}
- **வருகை விவரம் (Attendance):** ${presentCount} / ${initialMembers.length} (${quorumPercent}% Quorum)

## கூட்ட நிகழ்ச்சி நிரல் (Meeting Agenda)
${agenda}

## நிறைவேற்றப்பட்ட தீர்மானங்கள் (Approved Resolutions)
${resSummary}
`;

      await GroupAiService.generateAndShareGroupPdf({
        title: `${resolvedGroupName} — Meeting #${meetingNumber} Minutes`,
        docType: 'MeetingMinutes',
        groupName: resolvedGroupName,
        date: meetingDate,
        content: fullContent,
        members: initialMembers.map((m) => m.name),
      });
      alert('PDF Exported Successfully');
    } catch (err: any) {
      alert(`PDF Export Error: ${err.message || 'Could not export minutes PDF.'}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 sm:justify-center sm:items-center p-0 sm:p-4">
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden shadow-xl">
        
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-800">
          <div className="flex-1 mr-3">
            <div className="flex mb-1">
              <div className="flex items-center gap-1 bg-sky-400/15 px-2 py-1 rounded-md">
                <BookOpen size={12} className="text-sky-400" />
                <span className="text-sky-400 text-[10px] font-extrabold tracking-wide uppercase">Meeting Minutes & Resolutions</span>
              </div>
            </div>
            <h2 className="text-slate-50 text-[17px] font-extrabold truncate">{resolvedGroupName}</h2>
            <p className="text-slate-400 text-xs mt-1">கூட்ட குறிப்புகள் & தீர்மான புத்தகம் (Meeting #{meetingNumber})</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-5 pt-4 overflow-y-auto pb-6 custom-scrollbar">
          
          {/* 1. Meeting Overview Card */}
          <div className="bg-slate-800 rounded-2xl p-3.5 border border-slate-700 mb-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-sky-400" />
                <span className="text-slate-50 text-xs font-semibold">{meetingDate}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 justify-end">
                <MapPin size={14} className="text-emerald-400 min-w-[14px]" />
                <span className="text-slate-50 text-xs font-semibold truncate" title={meetingVenue}>{meetingVenue}</span>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-2.5 flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px] font-semibold">Member Attendance Quorum</span>
                <span className="text-emerald-400 text-[11px] font-extrabold">
                  {presentCount} / {initialMembers.length} Present ({quorumPercent}%)
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${quorumPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Attendance Register */}
          <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wide mb-2 mt-4">
            Member Attendance Register (வருகைப் பதிவு)
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {initialMembers.map((m) => {
              const status = attendance[m.id] || 'Present';
              
              let borderColor = 'border-slate-700';
              let bgColor = 'bg-slate-800';
              let statusColor = 'text-slate-400';
              
              if (status === 'Present') {
                borderColor = 'border-emerald-400/40';
                bgColor = 'bg-emerald-400/10';
                statusColor = 'text-emerald-400';
              } else if (status === 'Absent') {
                borderColor = 'border-rose-500/40';
                bgColor = 'bg-rose-500/10';
                statusColor = 'text-rose-500';
              } else if (status === 'Leave') {
                borderColor = 'border-amber-500/40';
                bgColor = 'bg-amber-500/10';
                statusColor = 'text-amber-500';
              }

              return (
                <button
                  key={m.id}
                  className={`w-full p-2 rounded-xl border flex flex-col items-start transition-colors ${bgColor} ${borderColor}`}
                  onClick={() => toggleAttendance(m.id)}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {status === 'Present' && <CheckCircle2 size={12} className="text-emerald-400" />}
                    {status === 'Absent' && <XCircle size={12} className="text-rose-500" />}
                    {status === 'Leave' && <Clock size={12} className="text-amber-500" />}
                    <span className="text-slate-50 text-[11px] font-bold truncate">{m.name.split(' ')[0]}</span>
                  </div>
                  <span className={`text-[9px] font-extrabold ${statusColor}`}>
                    {status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Meeting Agenda */}
          <div className="bg-slate-800 rounded-2xl p-3.5 border border-slate-700 mb-3 flex flex-col gap-2.5">
            <h3 className="text-slate-50 text-[13px] font-bold">Meeting Agenda & Notes (நிகழ்ச்சி நிரல்)</h3>
            <textarea
              className="w-full bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 leading-relaxed resize-y min-h-[80px] focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Enter meeting agenda items..."
            />
          </div>

          {/* 4. Resolutions Book */}
          <div className="flex justify-between items-center mt-4 mb-2">
            <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">
              Official Resolutions (தீர்மானங்கள்)
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-pink-500/15 border border-pink-500 rounded-md hover:bg-pink-500/25 transition-colors"
              >
                <Sparkles size={13} className="text-pink-500" />
                <span className="text-pink-500 text-[11px] font-bold">AI Drafter</span>
              </button>
              <button
                onClick={() => setIsAddingRes(true)}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 border border-sky-400 rounded-md hover:bg-slate-700 transition-colors"
              >
                <Plus size={14} className="text-sky-400" />
                <span className="text-sky-400 text-[11px] font-bold">+ Add</span>
              </button>
            </div>
          </div>

          {resolutions.map((res) => (
            <div key={res.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700 mb-2.5 flex flex-col gap-1.5 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <div className="bg-sky-400/15 px-1.5 py-0.5 rounded text-sky-400 text-[10px] font-extrabold uppercase">
                  RESOLVED #{res.resolutionNumber}
                </div>
                <div className="flex items-center gap-1 bg-emerald-400/15 px-1.5 py-0.5 rounded">
                  <Vote size={11} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-extrabold">{res.passedVotes}/{res.totalVotes} Votes</span>
                </div>
              </div>
              <h4 className="text-slate-50 text-[13px] font-bold">{res.title}</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">{res.description}</p>
              <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-slate-700">
                <span className="text-slate-500 text-[10px]">Proposed by: {res.proposer}</span>
                <span className="text-emerald-400 text-[10px] font-extrabold">{res.status}</span>
              </div>
            </div>
          ))}

          {/* Action Bar */}
          <div className="flex gap-2 mt-4 mb-2">
            <button
              onClick={handleExportMinutesPdf}
              disabled={isExportingPdf}
              className="flex-1 flex items-center justify-center gap-2 bg-pink-500 py-3 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-70"
            >
              <Printer size={16} className="text-white" />
              <span className="text-white text-[13px] font-extrabold">Export PDF 📄</span>
            </button>
            
            <button
              onClick={handleShareMinutes}
              className="flex-[1.2] flex items-center justify-center gap-2 bg-emerald-400 py-3 rounded-xl hover:bg-emerald-500 transition-colors"
            >
              <Share2 size={16} className="text-slate-900" />
              <span className="text-slate-900 text-[13px] font-extrabold">WhatsApp Minutes 📲</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Resolution Modal Sheet */}
      {isAddingRes && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-5">
          <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 border border-sky-400 shadow-2xl">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-slate-50 text-[15px] font-extrabold">Log Group Resolution</h3>
              <button
                onClick={() => {
                  setIsAddingRes(false);
                  setIsAiModalOpen(true);
                }}
                className="flex items-center gap-1 px-1.5 py-1 bg-pink-500/15 border border-pink-500 rounded hover:bg-pink-500/25 transition-colors"
              >
                <Sparkles size={12} className="text-pink-500" />
                <span className="text-pink-500 text-[10px] font-bold">AI Voice Draft</span>
              </button>
            </div>
            
            <input
              className="w-full bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
              placeholder="Resolution Title / தீர்மான தலைப்பு"
              value={newResTitle}
              onChange={(e) => setNewResTitle(e.target.value)}
            />
            <textarea
              className="w-full bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 min-h-[70px] focus:outline-none focus:border-sky-500 placeholder:text-slate-500 resize-y"
              placeholder="Resolution Details / முழு விவரங்கள்"
              value={newResDesc}
              onChange={(e) => setNewResDesc(e.target.value)}
            />
            <input
              className="w-full bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
              placeholder="Proposed by Member Name"
              value={newResProposer}
              onChange={(e) => setNewResProposer(e.target.value)}
            />
            
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setIsAddingRes(false)}
                className="flex-1 py-2.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <span className="text-slate-300 text-xs font-bold">Cancel</span>
              </button>
              <button
                onClick={handleAddResolution}
                className="flex-1 py-2.5 bg-sky-400 rounded-lg hover:bg-sky-500 transition-colors"
              >
                <span className="text-slate-900 text-xs font-extrabold">Save Resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded AI Assistant Modal */}
      {isAiModalOpen && (
        <GroupAiAssistantWebModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          groupName={resolvedGroupName}
          onApplyResolution={(aiText: string) => {
            const lines = aiText.split('\n').filter(Boolean);
            const title = lines[0]?.replace(/^[#*]+\s*/, '').slice(0, 60) || 'AI Drafted Resolution';
            const newRes: MeetingResolution = {
              id: `res-ai-${Date.now()}`,
              resolutionNumber: resolutions.length + 1,
              title,
              description: aiText,
              proposer: 'AI Assistant & President',
              passedVotes: initialMembers.length,
              totalVotes: initialMembers.length,
              status: 'Passed',
            };
            setResolutions([...resolutions, newRes]);
          }}
        />
      )}
    </div>
  );
};
