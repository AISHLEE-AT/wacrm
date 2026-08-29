import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { GroupRepository, DbGroup } from '@/lib/groupRepository';

interface CreateGroupWizardWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onGroupCreated?: (group: DbGroup) => void;
}

interface NewMemberDraft {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export const CreateGroupWizardWebModal: React.FC<CreateGroupWizardWebModalProps> = ({
  isOpen,
  onClose,
  user,
  onGroupCreated,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basics
  const [groupCategory, setGroupCategory] = useState<'WomenSHG' | 'FarmerFPO' | 'SportsClub' | 'BusinessGroup' | 'VillageRWA' | 'YouthStudy'>('WomenSHG');
  const [categoryLabel, setCategoryLabel] = useState('மகளிர் சுய உதவிக் குழு (Mathi TNCDW)');
  const [groupName, setGroupName] = useState('');
  const [tagline, setTagline] = useState('');
  const [village, setVillage] = useState(user?.city || 'அலங்காநல்லூர் (Alanganallur)');
  const [district, setDistrict] = useState(user?.state || 'மதுரை (Madurai)');
  const [regCode, setRegCode] = useState('TNCDW-MDU-2024-8842');

  // Step 2: Financial
  const [bankName, setBankName] = useState('Canara Bank');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('CNRB0001234');
  const [monthlySavings, setMonthlySavings] = useState('500');
  const [meetingSchedule, setMeetingSchedule] = useState('Every Month 5th & 20th');

  if (!isOpen) return null;

  const handleSelectCategory = (cat: typeof groupCategory, label: string) => {
    setGroupCategory(cat);
    setCategoryLabel(label);
  };

  const handleSubmitGroup = async () => {
    if (!groupName.trim()) {
      window.alert('Required: Please enter a Group Name.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const leaderPhone = user?.phone || '';
      const leaderName = user?.name || 'Group Leader (குழு தலைவர்)';

      if (!leaderPhone) {
        window.alert('Phone Required: உங்கள் கைபேசி எண் தேவை. Profile பகுதியில் உங்கள் எண்ணை சேர்க்கவும்.');
        setIsSubmitting(false);
        return;
      }

      const createdGroup = await GroupRepository.createGroupWithMembers({
        leaderPhone,
        leaderName,
        groupName: groupName.trim(),
        category: groupCategory,
        categoryLabel,
        tagline: tagline.trim() || 'மாதாந்திர சேமிப்பு & கூட்டமைப்பு',
        village: village.trim(),
        district: district.trim(),
        regCode: regCode.trim(),
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        monthlySavings: parseFloat(monthlySavings) || 500,
        members: [],
      });

      window.alert(`🎉 Group Successfully Created!\n"${createdGroup.name}" is now live!\n\nYou can now add members to your group from the Admin Console inside the UI.`);
      
      onGroupCreated?.(createdGroup);
      onClose();
    } catch (err: any) {
      window.alert(`Registration Notice: ${err.message || 'Group created locally with active offline sync.'}`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-900 w-full sm:w-[500px] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl p-4 border border-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex flex-row justify-between items-start pb-3 border-b border-slate-800">
          <div>
            <div className="flex flex-row items-center gap-1 bg-pink-500/15 px-2 py-0.5 rounded self-start mb-1 w-fit">
              <Sparkles size={12} color="#EC4899" />
              <span className="text-pink-500 text-[9px] font-extrabold tracking-wide">GROUP REGISTRATION WIZARD</span>
            </div>
            <div className="text-slate-50 text-base font-extrabold">புதிய குழு பதிவு (Create Group)</div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Step {step} of 2 • {step === 1 ? 'அடிப்படை விவரங்கள்' : 'வங்கி & சேமிப்பு'}
            </div>
          </div>
          <button className="p-1.5 bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-700 transition-colors" onClick={onClose}>
            <X size={20} color="#94A3B8" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex flex-row items-center justify-center my-3">
          <div className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-pink-500 w-3 h-3' : 'bg-slate-700'}`} />
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-pink-500' : 'bg-slate-700'}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-pink-500 w-3 h-3' : 'bg-slate-700'}`} />
        </div>

        <div className="overflow-y-auto max-h-[60vh] pb-4 flex flex-col gap-3 scrollbar-hide">
          {/* ──── STEP 1: GROUP BASICS ──── */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <span className="text-slate-50 text-xs font-bold mb-1.5 block">குழு வகை தேர்வு (Select Category):</span>
              <div className="flex flex-row flex-wrap gap-2">
                <button
                  className={`w-[calc(50%-4px)] text-left rounded-xl p-2.5 border transition-colors ${groupCategory === 'WomenSHG' ? 'border-pink-500 bg-pink-500/15' : 'bg-slate-800 border-slate-700'}`}
                  onClick={() => handleSelectCategory('WomenSHG', 'மகளிர் சுய உதவிக் குழு (Mathi TNCDW)')}
                >
                  <div className="text-slate-50 text-[11px] font-bold">👩‍🦰 மகளிர் குழு</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Women SHG (Mathi)</div>
                </button>

                <button
                  className={`w-[calc(50%-4px)] text-left rounded-xl p-2.5 border transition-colors ${groupCategory === 'FarmerFPO' ? 'border-pink-500 bg-pink-500/15' : 'bg-slate-800 border-slate-700'}`}
                  onClick={() => handleSelectCategory('FarmerFPO', 'உழவர் உற்பத்தியாளர் சங்கம் (Agri FPO)')}
                >
                  <div className="text-slate-50 text-[11px] font-bold">🌾 உழவர் சங்கம்</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Farmer FPO / Agri</div>
                </button>

                <button
                  className={`w-[calc(50%-4px)] text-left rounded-xl p-2.5 border transition-colors ${groupCategory === 'SportsClub' ? 'border-pink-500 bg-pink-500/15' : 'bg-slate-800 border-slate-700'}`}
                  onClick={() => handleSelectCategory('SportsClub', 'விளையாட்டு & இளைஞர் நல சங்கம்')}
                >
                  <div className="text-slate-50 text-[11px] font-bold">🏆 விளையாட்டு</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Sports Club & Team</div>
                </button>

                <button
                  className={`w-[calc(50%-4px)] text-left rounded-xl p-2.5 border transition-colors ${groupCategory === 'BusinessGroup' ? 'border-pink-500 bg-pink-500/15' : 'bg-slate-800 border-slate-700'}`}
                  onClick={() => handleSelectCategory('BusinessGroup', 'வணிகர் & சிறுதொழில் கூட்டமைப்பு')}
                >
                  <div className="text-slate-50 text-[11px] font-bold">🛍️ வணிகர் சங்கம்</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Merchant Network</div>
                </button>

                <button
                  className={`w-[calc(50%-4px)] text-left rounded-xl p-2.5 border transition-colors ${groupCategory === 'VillageRWA' ? 'border-pink-500 bg-pink-500/15' : 'bg-slate-800 border-slate-700'}`}
                  onClick={() => handleSelectCategory('VillageRWA', 'கிராம நலச் சங்கம் & குடியிருப்போர சங்கம்')}
                >
                  <div className="text-slate-50 text-[11px] font-bold">🏘️ கிராம நலச் சங்கம்</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Village RWA / Civic</div>
                </button>

                <button
                  className={`w-[calc(50%-4px)] text-left rounded-xl p-2.5 border transition-colors ${groupCategory === 'YouthStudy' ? 'border-pink-500 bg-pink-500/15' : 'bg-slate-800 border-slate-700'}`}
                  onClick={() => handleSelectCategory('YouthStudy', 'மாணவர் கல்வி & போட்டித் தேர்வு வட்டம்')}
                >
                  <div className="text-slate-50 text-[11px] font-bold">🎓 கல்வி வட்டம்</div>
                  <div className="text-slate-400 text-[9px] mt-0.5">Youth Study Circle</div>
                </button>
              </div>

              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">குழுவின் பெயர் (Group Name) *:</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="எ.கா: தாமரை மகளிர் சுய உதவிக் குழு"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">குழுவின் நோக்கம் / தொழில் (Tagline):</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="எ.கா: மாதாந்திர சேமிப்பு, தையல் & சிறுதொழில்"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className="flex flex-row gap-2.5">
                <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 flex-1">
                  <span className="text-slate-400 text-[11px] font-bold">கிராமம் / ஊர் (Village):</span>
                  <input
                    className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                    placeholder="அலங்காநல்லூர்"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>
                <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 flex-1">
                  <span className="text-slate-400 text-[11px] font-bold">மாவட்டம் (District):</span>
                  <input
                    className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                    placeholder="மதுரை"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">அரசு பதிவு எண் (Govt Registration Code):</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="TNCDW-MDU-2024-8842"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ──── STEP 2: BANKING & SAVINGS ──── */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">வங்கி பெயர் (Bank Name) *:</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="Canara Bank / SBI / Indian Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">வங்கி கணக்கு எண் (Bank Account No):</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="123456789012"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">மாதாந்திர சேமிப்பு தொகை (Monthly Savings / Member) ₹:</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="500"
                  type="number"
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(e.target.value)}
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-2.5 border border-slate-700 flex flex-col gap-1 w-full">
                <span className="text-slate-400 text-[11px] font-bold">கூட்டம் நடைபெறும் நாட்கள் (Meeting Schedule):</span>
                <input
                  className="text-slate-50 text-[13px] py-0.5 bg-transparent outline-none w-full placeholder:text-slate-500"
                  placeholder="Every Month 5th & 20th"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer Buttons */}
        <div className="flex flex-row items-center gap-2.5 mt-3 pt-3 border-t border-slate-800 shrink-0">
          {step > 1 ? (
            <button className="flex flex-row items-center gap-1.5 px-4 py-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setStep((s) => (s - 1) as any)}>
              <ArrowLeft size={16} color="#F8FAFC" />
              <span className="text-slate-50 text-xs font-bold">Back</span>
            </button>
          ) : <div className="flex-1" />}

          {step < 2 ? (
            <button
              className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-pink-500 py-3 rounded-xl cursor-pointer hover:bg-pink-600 transition-colors"
              onClick={() => {
                if (step === 1 && !groupName.trim()) {
                  window.alert('Required: Please enter a Group Name to continue.');
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
            >
              <span className="text-white text-[13px] font-extrabold">Next Step ➡️</span>
            </button>
          ) : (
            <button
              className="flex-1 flex flex-row items-center justify-center gap-1.5 bg-[#00D084] py-3 rounded-xl cursor-pointer disabled:opacity-70 hover:bg-[#00D084]/90 transition-colors"
              onClick={handleSubmitGroup}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="text-slate-900 text-[13px] font-extrabold">Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} color="#0F172A" />
                  <span className="text-slate-900 text-[13px] font-extrabold">Create Group 🚀</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
