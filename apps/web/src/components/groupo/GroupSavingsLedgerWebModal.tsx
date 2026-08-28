import React, { useState } from 'react';
import {
  X,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Share2,
} from 'lucide-react';

export interface GroupMember {
  id: string;
  name: string;
  role: 'President' | 'Secretary' | 'Treasurer' | 'Captain' | 'Convener' | 'Animator' | 'Member' | string;
  phone: string;
  savingsPaid: boolean;
  savingsAmount: number;
  loanBalance?: number;
  monthlyEmi?: number;
}

export interface InternalLoanRecord {
  id: string;
  borrowerName: string;
  principalAmount: number;
  interestRateMonthly: number; // e.g. 1.5%
  disbursedDate: string;
  repaidAmount: number;
  status: 'Active' | 'Closed';
  purpose: string;
}

export interface GroupSavingsLedgerWebModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  groupType: string;
  members: GroupMember[];
  onUpdateMembers?: (updated: GroupMember[]) => void;
}

export const GroupSavingsLedgerWebModal: React.FC<GroupSavingsLedgerWebModalProps> = ({
  visible,
  onClose,
  groupName,
  groupType,
  members: initialMembers,
  onUpdateMembers,
}) => {
  const [activeTab, setActiveTab] = useState<'savings' | 'loans' | 'summary'>('savings');
  const [members, setMembers] = useState<GroupMember[]>(initialMembers);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500);

  // Internal Loans State
  const [loans, setLoans] = useState<InternalLoanRecord[]>([
    {
      id: 'loan-1',
      borrowerName: 'S. Lakshmi (செல்வி லட்சுமி)',
      principalAmount: 25000,
      interestRateMonthly: 1.5,
      disbursedDate: '2026-07-15',
      repaidAmount: 8500,
      status: 'Active',
      purpose: 'Tailoring machine purchase (தையல் இயந்திரம்)',
    },
    {
      id: 'loan-2',
      borrowerName: 'M. Anandhi (மு. ஆனந்தி)',
      principalAmount: 15000,
      interestRateMonthly: 1.5,
      disbursedDate: '2026-08-01',
      repaidAmount: 3200,
      status: 'Active',
      purpose: 'Cattle feed & Dairy setup (கால்நடை தீவனம்)',
    },
  ]);

  // New Loan Form Modal State
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [newBorrower, setNewBorrower] = useState('');
  const [newPrincipal, setNewPrincipal] = useState('20000');
  const [newPurpose, setNewPurpose] = useState('Micro-Enterprise business');

  // Toggle member paid status
  const handleTogglePayment = (memberId: string) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        return { ...m, savingsPaid: !m.savingsPaid };
      }
      return m;
    });
    setMembers(updated);
    onUpdateMembers?.(updated);
  };

  // Mark all paid
  const handleMarkAllPaid = () => {
    const updated = members.map((m) => ({ ...m, savingsPaid: true }));
    setMembers(updated);
    onUpdateMembers?.(updated);
    alert('✅ All Paid\n\nAll members marked as paid for this month!');
  };

  // Add new internal loan
  const handleCreateLoan = () => {
    if (!newBorrower.trim() || !newPrincipal.trim()) {
      alert('Incomplete Details\n\nPlease enter borrower name and principal amount.');
      return;
    }

    const principal = parseFloat(newPrincipal) || 10000;
    const newRecord: InternalLoanRecord = {
      id: `loan-${Date.now()}`,
      borrowerName: newBorrower.trim(),
      principalAmount: principal,
      interestRateMonthly: 1.5,
      disbursedDate: new Date().toISOString().split('T')[0],
      repaidAmount: 0,
      status: 'Active',
      purpose: newPurpose.trim() || 'Internal SHG Loan',
    };

    setLoans([newRecord, ...loans]);
    setIsAddingLoan(false);
    setNewBorrower('');
    alert(`🎉 Loan Disbursed\n\n₹${principal.toLocaleString('en-IN')} internal loan recorded for ${newRecord.borrowerName}.`);
  };

  // Calculate totals
  const totalCollected = members.filter((m) => m.savingsPaid).reduce((acc, m) => acc + (m.savingsAmount || monthlyTarget), 0);
  const totalExpected = members.length * monthlyTarget;
  const totalActiveLoans = loans.filter((l) => l.status === 'Active').reduce((acc, l) => acc + (l.principalAmount - l.repaidAmount), 0);
  const totalInterestEarned = loans.reduce((acc, l) => acc + (l.repaidAmount * (l.interestRateMonthly / 100)), 0);
  const bankPoolBalance = 145000 + totalCollected - 40000 + totalInterestEarned;

  const handleShareStatement = () => {
    const msg = `📊 *${groupName} — Monthly Financial Ledger* 💰\n\n` +
      `🗓️ *Month:* August 2026\n` +
      `👥 *Total Members:* ${members.length}\n` +
      `💵 *Monthly Savings Target:* ₹${monthlyTarget}/member\n` +
      `✅ *Collected:* ₹${totalCollected.toLocaleString('en-IN')} / ₹${totalExpected.toLocaleString('en-IN')}\n` +
      `🤝 *Active Internal Loans:* ₹${totalActiveLoans.toLocaleString('en-IN')}\n` +
      `🏦 *Current Bank Pool Balance:* ₹${bankPoolBalance.toLocaleString('en-IN')}\n\n` +
      `Verified by SuprO GroupO Digital Passbook Engine ✨`;

    if (navigator.share) {
      navigator.share({
        title: `${groupName} Ledger`,
        text: msg,
      }).catch(console.error);
    } else {
      alert(msg);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] min-h-[70vh] border border-slate-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-row items-start justify-between px-5 pt-4 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex-1 mr-3 min-w-0">
            <div className="flex flex-row mb-1">
              <div className="flex flex-row items-center gap-1 bg-pink-500/15 px-2 py-1 rounded-md w-fit">
                <Wallet size={12} className="text-pink-500" />
                <span className="text-pink-500 text-[10px] font-extrabold tracking-wide">FINANCIAL LEDGER & PASSBOOK</span>
              </div>
            </div>
            <h2 className="text-slate-50 text-[17px] font-extrabold truncate">{groupName}</h2>
            <p className="text-slate-400 text-xs mt-0.5">மாதாந்திர சேமிப்பு & உள் கடன் கணக்கு ஏடு</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors shrink-0"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-row px-5 py-2.5 gap-2 border-b border-slate-800 overflow-x-auto shrink-0 scrollbar-hide">
          <button
            className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'savings' ? 'bg-pink-500' : 'bg-slate-800 hover:bg-slate-700'}`}
            onClick={() => setActiveTab('savings')}
          >
            <span className={`text-[11px] font-bold ${activeTab === 'savings' ? 'text-white' : 'text-slate-400'}`}>
              💰 Savings ({members.filter((m) => m.savingsPaid).length}/{members.length})
            </span>
          </button>
          <button
            className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'loans' ? 'bg-pink-500' : 'bg-slate-800 hover:bg-slate-700'}`}
            onClick={() => setActiveTab('loans')}
          >
            <span className={`text-[11px] font-bold ${activeTab === 'loans' ? 'text-white' : 'text-slate-400'}`}>
              🤝 Internal Loans ({loans.length})
            </span>
          </button>
          <button
            className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'summary' ? 'bg-pink-500' : 'bg-slate-800 hover:bg-slate-700'}`}
            onClick={() => setActiveTab('summary')}
          >
            <span className={`text-[11px] font-bold ${activeTab === 'summary' ? 'text-white' : 'text-slate-400'}`}>
              📊 Summary
            </span>
          </button>
        </div>

        <div className="px-5 pt-3.5 pb-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* ─── TAB 1: SAVINGS COLLECTION ─── */}
          {activeTab === 'savings' && (
            <div className="flex flex-col gap-3">
              {/* Metric Summary Card */}
              <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700">
                <div className="flex flex-row justify-between mb-2.5">
                  <div>
                    <span className="text-slate-400 text-[11px] font-semibold block">August 2026 Collection</span>
                    <span className="text-emerald-400 text-lg font-extrabold mt-0.5 block">₹{totalCollected.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] font-semibold block">Expected (₹{monthlyTarget}/m)</span>
                    <span className="text-slate-400 text-lg font-extrabold mt-0.5 block">
                      ₹{totalExpected.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((totalCollected / (totalExpected || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex flex-row gap-2.5">
                <button 
                  className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-slate-800 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
                  onClick={handleMarkAllPaid}
                >
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-slate-50 text-[11px] font-bold">Mark All Paid</span>
                </button>
                <button 
                  className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-slate-800 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
                  onClick={handleShareStatement}
                >
                  <Share2 size={14} className="text-sky-400" />
                  <span className="text-slate-50 text-[11px] font-bold">Share Statement</span>
                </button>
              </div>

              {/* Member Roster List */}
              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wide mt-1.5">Member Monthly Contributions</h3>
              <div className="flex flex-col gap-3">
                {members.map((member) => (
                  <div key={member.id} className="flex flex-row items-center bg-slate-800 p-3 rounded-xl gap-2.5 border border-slate-700">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex justify-center items-center shrink-0">
                      <span className="text-slate-50 text-xs font-extrabold">{member.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-row items-center gap-1.5 flex-wrap">
                        <span className="text-slate-50 text-[13px] font-bold truncate">{member.name}</span>
                        {member.role !== 'Member' && (
                          <span className="text-pink-500 text-[10px] font-bold bg-pink-500/15 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {member.role}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px] mt-0.5 block truncate">
                        Due: ₹{member.savingsAmount || monthlyTarget} • {member.phone}
                      </span>
                    </div>
                    <button
                      className={`flex flex-row items-center gap-1 px-2 py-1.5 rounded-lg shrink-0 transition-colors ${
                        member.savingsPaid 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/20' 
                          : 'bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                      onClick={() => handleTogglePayment(member.id)}
                    >
                      {member.savingsPaid ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span className="text-emerald-400 text-[11px] font-bold">Paid ₹{member.savingsAmount || monthlyTarget}</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} className="text-amber-500" />
                          <span className="text-amber-500 text-[11px] font-bold">Pending</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 2: INTERNAL LOANS LEDGER ─── */}
          {activeTab === 'loans' && (
            <div className="flex flex-col gap-3">
              <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700">
                <span className="text-slate-400 text-[11px] font-semibold block">Total Active Loan Balance</span>
                <span className="text-amber-500 text-lg font-extrabold mt-0.5 block">
                  ₹{totalActiveLoans.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Interest Rate: 1.5% per month (₹1.50 per ₹100/mo) • Revolving Community Pool
                </span>
              </div>

              <button
                className="flex flex-row items-center justify-center gap-1.5 bg-slate-800 py-3 rounded-xl border border-pink-500 border-dashed hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsAddingLoan(true)}
              >
                <Plus size={16} className="text-pink-500" />
                <span className="text-pink-500 text-xs font-bold">+ Disburse New Internal Loan (புதிய உள் கடன்)</span>
              </button>

              <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-wide mt-1.5">Active Internal Loans</h3>
              <div className="flex flex-col gap-3">
                {loans.map((loan) => (
                  <div key={loan.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                    <div className="flex flex-row justify-between items-center mb-1">
                      <span className="text-slate-50 text-[13px] font-extrabold">{loan.borrowerName}</span>
                      <div className="bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        <span className="text-emerald-400 text-[10px] font-extrabold">{loan.status}</span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-[11px] block">{loan.purpose}</span>
                    <div className="h-px bg-slate-700 my-2.5" />
                    <div className="flex flex-row justify-between">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Principal</span>
                        <span className="text-slate-50 text-xs font-bold mt-0.5 block">₹{loan.principalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Repaid</span>
                        <span className="text-emerald-400 text-xs font-bold mt-0.5 block">₹{loan.repaidAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Balance</span>
                        <span className="text-red-500 text-xs font-bold mt-0.5 block">
                          ₹{(loan.principalAmount - loan.repaidAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 3: FINANCIAL STATEMENT SUMMARY ─── */}
          {activeTab === 'summary' && (
            <div className="flex flex-col gap-3">
              <div className="bg-[#071F15] rounded-xl p-3.5 border border-emerald-500">
                <span className="text-emerald-200 text-[11px] font-semibold block">Total Bank Account & Cash Pool</span>
                <span className="text-emerald-400 text-2xl font-extrabold mt-0.5 block">
                  ₹{bankPoolBalance.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-300 mt-1 block">
                  Bank: Canara Bank (A/C: *******8920) • IFSC: CNRB0001234
                </span>
              </div>

              <div className="bg-slate-800 rounded-xl p-3.5 border border-slate-700 flex flex-col gap-2.5">
                <h3 className="text-slate-50 text-[13px] font-bold mb-0.5">Financial Inflow & Outflow</h3>
                
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-1.5">
                    <ArrowDownLeft size={16} className="text-emerald-400" />
                    <span className="text-slate-400 text-xs">Monthly Savings Total</span>
                  </div>
                  <span className="text-emerald-400 text-[13px] font-extrabold">+₹{totalCollected.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-1.5">
                    <ArrowDownLeft size={16} className="text-emerald-400" />
                    <span className="text-slate-400 text-xs">Loan Interest Earned</span>
                  </div>
                  <span className="text-emerald-400 text-[13px] font-extrabold">+₹{totalInterestEarned.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-1.5">
                    <ArrowUpRight size={16} className="text-red-500" />
                    <span className="text-slate-400 text-xs">Active Internal Loans</span>
                  </div>
                  <span className="text-red-500 text-[13px] font-extrabold">-₹{totalActiveLoans.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                className="flex flex-row items-center justify-center gap-2 bg-emerald-400 py-3 rounded-xl mt-1 hover:bg-emerald-500 transition-colors"
                onClick={handleShareStatement}
              >
                <Share2 size={16} className="text-slate-900" />
                <span className="text-slate-900 text-[13px] font-extrabold">Share & Export Audit Statement</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal for adding internal loan */}
        {isAddingLoan && (
          <div className="absolute inset-0 bg-black/80 flex justify-center items-center p-5 z-50">
            <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3 border border-pink-500 shadow-xl">
              <h3 className="text-slate-50 text-[15px] font-extrabold mb-1">Disburse Internal Loan (உள் கடன்)</h3>
              <input
                className="bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 focus:outline-none focus:border-pink-500 placeholder-slate-500 w-full"
                placeholder="Borrower Member Name"
                value={newBorrower}
                onChange={(e) => setNewBorrower(e.target.value)}
              />
              <input
                className="bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 focus:outline-none focus:border-pink-500 placeholder-slate-500 w-full"
                placeholder="Principal Amount (₹)"
                type="number"
                value={newPrincipal}
                onChange={(e) => setNewPrincipal(e.target.value)}
              />
              <input
                className="bg-slate-900 rounded-lg p-2.5 text-slate-50 text-xs border border-slate-700 focus:outline-none focus:border-pink-500 placeholder-slate-500 w-full"
                placeholder="Purpose / தொழில் நோக்கம்"
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
              />
              <div className="flex flex-row gap-2.5 mt-2.5">
                <button 
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                  onClick={() => setIsAddingLoan(false)}
                >
                  <span className="text-slate-300 text-xs font-bold">Cancel</span>
                </button>
                <button 
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                  onClick={handleCreateLoan}
                >
                  <span className="text-white text-xs font-extrabold">Approve Loan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
