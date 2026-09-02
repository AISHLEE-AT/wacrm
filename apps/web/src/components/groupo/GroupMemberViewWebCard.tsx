import React, { useState } from 'react';
import {
  Wallet,
  BookOpen,
  Video,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { DbGroup, DbMember } from '@/lib/groupRepository';

interface GroupMemberViewWebCardProps {
  group: DbGroup;
  member: DbMember;
  onOpenMeetingVideos?: () => void;
  onOpenResolutions?: () => void;
}

export const GroupMemberViewWebCard: React.FC<GroupMemberViewWebCardProps> = ({
  group,
  member,
  onOpenMeetingVideos,
  onOpenResolutions,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'passbook' | 'loans' | 'meetings'>('passbook');

  // Contact Leader via WhatsApp
  const handleContactLeaderWhatsApp = () => {
    const leaderPhone = group.leader_phone || '6381029380';
    const cleanLeaderPhone = (leaderPhone || '').replace(/[^0-9]/g, '').replace(/^91(?=\d{10}$)/, '');
    const msg = `வணக்கம் தலைவர் (${group.leader_name}) அவர்களே! நான் ${member.name} (${group.name} உறுப்பினர்).\n\nஎனது மாதாந்திர சேமிப்பு / கூட்ட விபரம் தொடர்பாக பேச விரும்புகிறேன்.`;
    window.open(`https://wa.me/91${cleanLeaderPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Direct Call to Leader
  const handleCallLeader = () => {
    const leaderPhone = group.leader_phone || '6381029380';
    window.open(`tel:${leaderPhone}`, '_self');
  };

  return (
    <div className="flex flex-col gap-[14px]">
      {/* ─── 1. LINKED GROUP HERO BANNER ─── */}
      <div className="bg-slate-800 rounded-[18px] p-4 border border-slate-700 flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-[5px] bg-[#00D084]/15 px-2 py-[3px] rounded-md">
            <ShieldCheck size={13} color="#00D084" />
            <span className="text-[#00D084] text-[9px] font-extrabold uppercase">LINKED GROUP MEMBER • உறுப்பினர்</span>
          </div>
          <div className="bg-pink-500/20 px-2 py-[3px] rounded-md">
            <span className="text-pink-500 text-[10px] font-extrabold uppercase">{member.role || 'Member'}</span>
          </div>
        </div>

        <h2 className="text-slate-50 text-[17px] font-extrabold mt-0.5">{group.name}</h2>
        <span className="text-pink-500 text-[11px] font-bold">{group.category_label}</span>
        <span className="text-slate-400 text-[11px]">
          📍 {group.village}, {group.district} • Reg: {group.reg_code || 'TNCDW-2024'}
        </span>

        {/* Leader Contact Bar */}
        <div className="flex flex-row justify-between items-center bg-slate-900 rounded-xl p-3 mt-1.5">
          <div className="flex-1 flex flex-col">
            <span className="text-slate-500 text-[10px]">குழு தலைவர் (Group Leader):</span>
            <span className="text-slate-50 text-[13px] font-bold mt-[1px]">{group.leader_name || 'குழு தலைவர் (Leader)'}</span>
          </div>
          <div className="flex flex-row gap-2">
            <button
              onClick={handleCallLeader}
              className="flex flex-row items-center gap-1 bg-sky-400 px-2.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <PhoneCall size={14} color="#FFFFFF" />
              <span className="text-white text-[11px] font-bold">Call</span>
            </button>
            <button
              onClick={handleContactLeaderWhatsApp}
              className="flex flex-row items-center gap-1 bg-[#25D366] px-2.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={14} color="#FFFFFF" />
              <span className="text-white text-[11px] font-bold">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. SUB TABS ─── */}
      <div className="flex flex-row gap-2">
        <button
          className={`flex-1 flex flex-row items-center justify-center gap-[5px] py-2.5 rounded-xl border transition-colors ${
            activeSubTab === 'passbook'
              ? 'bg-pink-500 border-pink-500'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
          }`}
          onClick={() => setActiveSubTab('passbook')}
        >
          <Wallet size={14} color={activeSubTab === 'passbook' ? '#FFFFFF' : '#94A3B8'} />
          <span className={`text-[10px] font-bold ${activeSubTab === 'passbook' ? 'text-white' : 'text-slate-400'}`}>
            எனது சேமிப்பு ஏடு
          </span>
        </button>

        <button
          className={`flex-1 flex flex-row items-center justify-center gap-[5px] py-2.5 rounded-xl border transition-colors ${
            activeSubTab === 'loans'
              ? 'bg-pink-500 border-pink-500'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
          }`}
          onClick={() => setActiveSubTab('loans')}
        >
          <TrendingUp size={14} color={activeSubTab === 'loans' ? '#FFFFFF' : '#94A3B8'} />
          <span className={`text-[10px] font-bold ${activeSubTab === 'loans' ? 'text-white' : 'text-slate-400'}`}>
            உள் கடன் & தவணை
          </span>
        </button>

        <button
          className={`flex-1 flex flex-row items-center justify-center gap-[5px] py-2.5 rounded-xl border transition-colors ${
            activeSubTab === 'meetings'
              ? 'bg-pink-500 border-pink-500'
              : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
          }`}
          onClick={() => setActiveSubTab('meetings')}
        >
          <BookOpen size={14} color={activeSubTab === 'meetings' ? '#FFFFFF' : '#94A3B8'} />
          <span className={`text-[10px] font-bold ${activeSubTab === 'meetings' ? 'text-white' : 'text-slate-400'}`}>
            கூட்ட விவரம்
          </span>
        </button>
      </div>

      {/* ─── 3. TAB CONTENT ─── */}
      {activeSubTab === 'passbook' && (
        <div className="flex flex-col gap-3">
          {/* Monthly Status Card */}
          <div className="bg-slate-800 rounded-[14px] p-[14px] border border-slate-700 flex flex-col gap-3">
            <div className="flex flex-row items-center gap-2">
              <Wallet size={16} color="#EC4899" />
              <h3 className="text-slate-50 text-[13px] font-bold">Current Month Savings (நடப்பு மாத சேமிப்பு)</h3>
            </div>

            <div className="flex flex-row justify-between items-center bg-slate-900 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-slate-50 text-[22px] font-extrabold">₹{member.savings_amount ?? 500}</span>
                <span className="text-slate-500 text-[11px] mt-0.5">August 2026 Monthly Due</span>
              </div>
              <div
                className={`flex flex-row items-center gap-[5px] px-2.5 py-[5px] rounded-lg ${
                  member.current_month_paid ? 'bg-[#00D084]/15' : 'bg-amber-500/15'
                }`}
              >
                {member.current_month_paid ? (
                  <>
                    <CheckCircle2 size={14} color="#00D084" />
                    <span className="text-[#00D084] text-[11px] font-extrabold">Paid & Verified</span>
                  </>
                ) : (
                  <>
                    <Clock size={14} color="#F59E0B" />
                    <span className="text-[#F59E0B] text-[11px] font-extrabold">Payment Due</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-row justify-between bg-slate-900 rounded-[10px] p-2.5">
              <div className="flex-1 flex flex-col">
                <span className="text-slate-500 text-[10px]">Total Group Pool</span>
                <span className="text-slate-50 text-[14px] font-extrabold mt-0.5">
                  ₹{(group.total_savings_pool ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-slate-500 text-[10px]">Your Accumulated</span>
                <span className="text-[#00D084] text-[14px] font-extrabold mt-0.5">
                  ₹{(member.total_savings_accumulated ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'loans' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-800 rounded-[14px] p-[14px] border border-slate-700 flex flex-col gap-3">
            <div className="flex flex-row items-center gap-2">
              <TrendingUp size={16} color="#F59E0B" />
              <h3 className="text-slate-50 text-[13px] font-bold">Internal Loan Balance (உள் கடன் கணக்கு)</h3>
            </div>

            {member.active_loan_balance > 0 ? (
              <div className="flex flex-col gap-[10px]">
                <div className="bg-slate-900 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-slate-500 text-[11px]">Active Outstanding Loan:</span>
                  <span className="text-amber-500 text-[20px] font-extrabold">
                    ₹{member.active_loan_balance.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[#A3E635] text-[11px] mt-0.5">Interest Rate: 1.5% per month (குறைந்த வட்டி)</span>
                </div>

                <div className="flex flex-row justify-between items-center bg-slate-900 rounded-[10px] p-2.5">
                  <span className="text-slate-400 text-[11px]">Monthly EMI + Interest Due:</span>
                  <span className="text-slate-50 text-[13px] font-extrabold">
                    ₹{Math.round(member.active_loan_balance * 0.015 + 1000).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 gap-1.5">
                <CheckCircle2 size={24} color="#00D084" />
                <h4 className="text-[#00D084] text-[14px] font-extrabold">No Active Loans</h4>
                <p className="text-slate-400 text-[11px] text-center leading-4 px-3">
                  You have zero loan dues. You are eligible to apply for up to ₹25,000 internal loan in your next group meeting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'meetings' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-800 rounded-[14px] p-[14px] border border-slate-700 flex flex-col gap-3">
            <div className="flex flex-row items-center gap-2">
              <Calendar size={16} color="#38BDF8" />
              <h3 className="text-slate-50 text-[13px] font-bold">Group Meeting Schedule (கூட்ட அட்டவணை)</h3>
            </div>

            <div className="bg-slate-900 rounded-[10px] p-2.5">
              <div className="flex-1 flex flex-col">
                <span className="text-slate-50 text-[12px] font-bold">மாதாந்திர கலந்தாய்வு கூட்டம் (Regular Assembly)</span>
                <span className="text-pink-500 text-[11px] mt-0.5">
                  Schedule: {group.meeting_schedule || 'Every Month 5th & 20th'}
                </span>
                <span className="text-slate-400 text-[11px] mt-0.5">
                  📍 {group.village} Panchayat Community Hall
                </span>
              </div>
            </div>

            <button
              className="flex flex-row items-center justify-center gap-1.5 bg-pink-500/15 border border-pink-500 py-2.5 rounded-[10px] hover:bg-pink-500/25 transition-colors cursor-pointer"
              onClick={onOpenMeetingVideos}
            >
              <Video size={16} color="#EC4899" />
              <span className="text-pink-500 text-[11px] font-bold">Watch Meeting Video Records on Google Drive 📹</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
