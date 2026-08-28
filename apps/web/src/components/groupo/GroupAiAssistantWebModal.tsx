import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  FileText,
  Send,
  Languages,
  Share2,
  Copy,
  CheckCircle2,
  X,
  Building,
  Briefcase,
  Layers,
  Printer,
  FileCheck,
  Calendar,
  Wallet,
  MessageCircle,
  PenTool,
} from 'lucide-react';
import { GroupAiService } from '@/lib/GroupAiService';
// If GroupPdfMetadata is available in GroupAiService, import it here
// import { GroupPdfMetadata } from '@/lib/GroupAiService';

const COURSE_GUIDE_WHATSAPP = '919486335870';
const TELEGRAM_COMMUNITY_URL = 'https://t.me/supro_education';

interface GroupAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupType?: string;
  regCode?: string;
  village?: string;
  district?: string;
  totalSavingsPool?: number;
  activeLoanPool?: number;
  memberCount?: number;
  monthlySavings?: number;
  leaderName?: string;
  onApplyResolution?: (resolutionText: string) => void;
}

type AiToolMode =
  | 'resolution'
  | 'bank_letter'
  | 'govt_petition'
  | 'project_plan'
  | 'meeting_notice'
  | 'savings_statement'
  | 'custom_doc'
  | 'translate';

export const GroupAiAssistantWebModal: React.FC<GroupAiAssistantModalProps> = ({
  isOpen,
  onClose,
  groupName,
  groupType = 'Women SHG (மகளிர் சுய உதவிக் குழு)',
  regCode = 'TNCDW-MDU-2024-8842',
  village = 'அலங்காநல்லூர் (Alanganallur)',
  district = 'மதுரை (Madurai)',
  totalSavingsPool = 0,
  activeLoanPool = 0,
  memberCount = 0,
  monthlySavings = 500,
  leaderName,
  onApplyResolution,
}) => {
  const geminiApiKey = ''; // Provide your API key mechanism here

  const [activeTool, setActiveTool] = useState<AiToolMode>('resolution');
  const [selectedLanguage, setSelectedLanguage] = useState<'Tamil' | 'English'>('Tamil');
  const [inputText, setInputText] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Voice Typing State
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Specific Form Inputs
  const [recipient, setRecipient] = useState('கிளை மேலாளர், கனரா வங்கி (Branch Manager, Canara Bank)');
  const [investmentAmount, setInvestmentAmount] = useState('200000');
  const [meetingDate, setMeetingDate] = useState('05-Sep-2026');
  const [meetingTime, setMeetingTime] = useState('10:30 AM');
  const [venue, setVenue] = useState('Panchayat Community Hall / கிராம அரங்கம்');

  const handleToggleVoiceTyping = () => {
    // Basic Web Speech Recognition Mock or implementation could go here
    if (isListening) {
      setIsListening(false);
      if (liveTranscript) {
        setInputText((prev) => (prev ? `${prev} ${liveTranscript}` : liveTranscript));
        setLiveTranscript('');
      }
    } else {
      setIsListening(true);
      setLiveTranscript('');
      window.alert('Web Speech Recognition not implemented in this mock.');
      setIsListening(false);
    }
  };

  const handleGenerateAi = async () => {
    const promptInput = inputText.trim() || liveTranscript.trim();
    if (!promptInput && activeTool !== 'savings_statement' && activeTool !== 'meeting_notice') {
      window.alert('உள்ளீடு தேவை (Input Required)\n\nதயவுசெய்து குறிப்புகளை தட்டச்சு செய்யவும்.');
      return;
    }

    setIsGenerating(true);
    try {
      let result = '';
      if (activeTool === 'resolution') {
        result = await GroupAiService.draftResolution({
          rawNotes: promptInput,
          groupName,
          category: groupType,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'bank_letter') {
        result = await GroupAiService.generateOfficialLetter({
          letterType: 'BankLoan',
          recipientTitle: recipient,
          purpose: promptInput,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'govt_petition') {
        result = await GroupAiService.generateOfficialLetter({
          letterType: 'GovtPetition',
          recipientTitle: 'வட்டார வளர்ச்சி அலுவலர் (Block Development Officer - BDO) / ஊராட்சி தலைவர்',
          purpose: promptInput,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'project_plan') {
        result = await GroupAiService.generateProjectProposal({
          businessIdea: promptInput || 'ஆடை தயாரிப்பு & தையல் பயிலகம்',
          groupName,
          investmentBudget: parseFloat(investmentAmount) || 200000,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'meeting_notice') {
        result = await GroupAiService.generateMeetingNotice({
          meetingDate,
          meetingTime,
          venue,
          agenda: promptInput || '1. மாதாந்திர சேமிப்பு தணிக்கை\n2. புதிய உள் கடன் விண்ணப்பம்',
          groupName,
          regCode,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'savings_statement') {
        result = await GroupAiService.generateSavingsStatement({
          month: 'August 2026',
          totalSavingsPool,
          activeLoanPool,
          memberCount,
          monthlyTarget: monthlySavings,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'custom_doc') {
        result = await GroupAiService.generateOfficialLetter({
          letterType: 'SubsidyScheme',
          recipientTitle: recipient,
          purpose: promptInput,
          groupName,
          regCode,
          village,
          district,
          language: selectedLanguage,
          apiKey: geminiApiKey,
        });
      } else if (activeTool === 'translate') {
        result = await GroupAiService.translateDocument(
          promptInput,
          selectedLanguage,
          geminiApiKey
        );
      }

      setGeneratedResult(result);
    } catch (err: any) {
      window.alert(err.message || 'Failed to generate document.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslateResult = async () => {
    if (!generatedResult) return;
    setIsGenerating(true);
    try {
      const target = selectedLanguage === 'Tamil' ? 'English' : 'Tamil';
      const translated = await GroupAiService.translateDocument(generatedResult, target, geminiApiKey);
      setGeneratedResult(translated);
      setSelectedLanguage(target);
    } catch (err: any) {
      window.alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!generatedResult) {
      window.alert('Please generate or enter document text first.');
      return;
    }

    setIsExportingPdf(true);
    try {
      let docTitle = 'Official Group Resolution & Minutes';
      let docType: any = 'Resolution';

      if (activeTool === 'bank_letter') {
        docTitle = 'Bank Credit Linkage Representation';
        docType = 'BankLetter';
      } else if (activeTool === 'govt_petition') {
        docTitle = 'Government Representation Petition';
        docType = 'GovtPetition';
      } else if (activeTool === 'project_plan') {
        docTitle = 'Micro-Enterprise Business Project Plan';
        docType = 'ProjectProposal';
      } else if (activeTool === 'meeting_notice') {
        docTitle = 'Official Group Meeting Announcement Notice';
        docType = 'Resolution';
      } else if (activeTool === 'savings_statement') {
        docTitle = 'Monthly Savings & Audit Statement';
        docType = 'ProjectProposal';
      }

      await GroupAiService.generateAndShareGroupPdf({
        title: docTitle,
        docType,
        groupName,
        regCode,
        village,
        district,
        content: generatedResult,
        officers: leaderName ? { president: leaderName } : undefined,
      });
    } catch (err: any) {
      window.alert(err.message || 'Failed to generate PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const buildFormattedTextMessage = () => {
    return (
      `👥 *${groupName} — Official Communication* 📄\n` +
      `📍 *Location:* ${village}, ${district}\n` +
      `🔖 *Reg Code:* ${regCode}\n` +
      `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${generatedResult}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `✨ *SuprO GroupO Digital Administration*`
    );
  };

  const handleShareToWhatsApp = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareToCourseGuideWhatsApp = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    window.open(`https://wa.me/${COURSE_GUIDE_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareToTelegram = () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(TELEGRAM_COMMUNITY_URL)}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareToSocialMedia = async () => {
    if (!generatedResult) return;
    const msg = buildFormattedTextMessage();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groupName} Document`,
          text: msg,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      window.alert('Web Share API not supported on this browser.');
    }
  };

  const handleCopyClipboard = async () => {
    if (!generatedResult) return;
    try {
      await navigator.clipboard.writeText(generatedResult);
      window.alert('Document copied to clipboard.');
    } catch (err) {
      window.alert('Failed to copy text.');
    }
  };

  const handleApplyToResolution = () => {
    if (onApplyResolution && generatedResult) {
      onApplyResolution(generatedResult);
      window.alert('AI generated resolution transferred to your Meeting Book.');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4">
      <div className="w-full max-w-3xl bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-800">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 bg-pink-500/15 px-2 py-0.5 rounded-md w-fit mb-1">
              <Sparkles size={13} className="text-pink-500" />
              <span className="text-pink-500 text-[10px] font-extrabold tracking-wide uppercase">
                GROUPO UNIVERSAL DOCUMENT & DISPATCH SUITE
              </span>
            </div>
            <h2 className="text-slate-50 text-base font-extrabold">
              ஆவண உருவாக்கம் & பகிர்வு (Document & Share)
            </h2>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {groupName} • {regCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tool Modes Selector */}
        <div className="border-b border-slate-800 overflow-x-auto p-3">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'resolution', icon: FileText, label: 'தீர்மானம் (Resolution)' },
              { id: 'bank_letter', icon: Building, label: 'வங்கி கடன் கடிதம்' },
              { id: 'meeting_notice', icon: Calendar, label: 'கூட்ட அறிவிப்பு (Notice)' },
              { id: 'savings_statement', icon: Wallet, label: 'சேமிப்பு அறிக்கை' },
              { id: 'govt_petition', icon: Briefcase, label: 'அரசு மனு (Petition)' },
              { id: 'project_plan', icon: Layers, label: 'தொழில் திட்டம் (Business Plan)' },
              { id: 'custom_doc', icon: PenTool, label: 'தனிப்பயன் கடிதம்' },
              { id: 'translate', icon: Languages, label: 'மொழிபெயர்ப்பு' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as AiToolMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  activeTool === tool.id
                    ? 'bg-pink-500 border-pink-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <tool.icon size={14} />
                <span className="text-[11px] font-bold">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Input Section */}
          <div className="bg-slate-800 rounded-2xl p-3.5 border border-slate-700 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-50 text-[11px] font-extrabold flex-1 mr-2">
                {activeTool === 'resolution' && '1. தீர்மான குறிப்புகள் (Resolution Notes / Voice):'}
                {activeTool === 'bank_letter' && '1. வங்கி கடித நோக்கம் (Bank Letter Purpose):'}
                {activeTool === 'meeting_notice' && '1. கூட்ட நாள் & நிகழ்ச்சி நிரல் (Meeting Agenda):'}
                {activeTool === 'savings_statement' && '1. மாதாந்திர வரவு-செலவு அறிக்கை குறிப்புகள்:'}
                {activeTool === 'govt_petition' && '1. மனு விவரம் (Petition Grievance):'}
                {activeTool === 'project_plan' && '1. தொழில் & திட்ட விவரம் (Project Scope):'}
                {activeTool === 'custom_doc' && '1. ஆவண விவரங்கள் (Document Content):'}
                {activeTool === 'translate' && '1. ஆவண விவரங்கள் (Document Content):'}
              </span>

              {/* Language Switcher */}
              <div className="flex bg-slate-900 rounded-lg p-0.5">
                <button
                  onClick={() => setSelectedLanguage('Tamil')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    selectedLanguage === 'Tamil' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  onClick={() => setSelectedLanguage('English')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    selectedLanguage === 'English' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Specific Field Configuration */}
            {activeTool === 'bank_letter' && (
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                <label className="block text-slate-400 text-[10px] font-bold mb-0.5">
                  பெறுநர் (Recipient Bank & Branch):
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="கிளை மேலாளர், கனரா வங்கி"
                  className="w-full bg-transparent text-slate-50 text-xs focus:outline-none placeholder:text-slate-500"
                />
              </div>
            )}

            {activeTool === 'meeting_notice' && (
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-slate-900 rounded-lg p-2 border border-slate-700">
                  <label className="block text-slate-400 text-[10px] font-bold mb-0.5">கூட்ட தேதி (Date):</label>
                  <input
                    type="text"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-transparent text-slate-50 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex-1 bg-slate-900 rounded-lg p-2 border border-slate-700">
                  <label className="block text-slate-400 text-[10px] font-bold mb-0.5">நேரம் (Time):</label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-transparent text-slate-50 text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTool === 'project_plan' && (
              <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                <label className="block text-slate-400 text-[10px] font-bold mb-0.5">
                  மதிப்பீட்டு முதலீடு ₹ (Estimated Project Capex):
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="200000"
                  className="w-full bg-transparent text-slate-50 text-xs focus:outline-none placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Main Prompt Box */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-2.5 relative min-h-[90px]">
              <textarea
                className="w-full bg-transparent text-slate-50 text-xs resize-none focus:outline-none pb-8 placeholder:text-slate-500 leading-relaxed"
                rows={4}
                placeholder={
                  activeTool === 'resolution'
                    ? 'எ.கா: உறுப்பினர் லட்சுமி அவர்களுக்கு தையல் இயந்திரம் வாங்க ரூ.25,000 உள் கடன் 1.5% வட்டியில் வழங்க...'
                    : activeTool === 'bank_letter'
                    ? 'எ.கா: மகளிர் திட்ட நேரடி கடன் ரூ. 5 லட்சம் கோரி கனரா வங்கி மேலாளருக்கு மனு...'
                    : activeTool === 'meeting_notice'
                    ? 'எ.கா: வரும் ஞாயிற்றுக்கிழமை காலை 10 மணிக்கு கிராம சமுதாய கூடத்தில் மாதாந்திர கூட்டத்திற்கு அனைவரும் வரவும்...'
                    : 'இங்கு தட்டச்சு செய்யவும் அல்லது மைக்கை அழுத்தி தமிழில் பேசவும்...'
                }
                value={isListening ? liveTranscript || 'குரல் பதிவு செய்யப்படுகிறது (Listening)...' : inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              {/* Voice Typing Button */}
              <button
                onClick={handleToggleVoiceTyping}
                className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                  isListening
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-pink-500/15 border-pink-500 text-pink-500 hover:bg-pink-500/25'
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span className="text-[10px] font-extrabold">{isListening ? 'Stop' : 'குரல் வழி'}</span>
              </button>
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={handleGenerateAi}
              disabled={isGenerating}
              className="flex items-center justify-center gap-1.5 bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-70 font-extrabold text-xs"
            >
              {isGenerating ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Sparkles size={16} />
                  AI சட்டபூர்வ ஆவணமாக உருவாக்கு (Generate Document)
                </>
              )}
            </button>
          </div>

          {/* Generated Document Section */}
          {generatedResult && (
            <div className="bg-slate-800 rounded-2xl p-3.5 border border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <FileCheck size={16} />
                  <span className="text-slate-50 text-xs font-extrabold">தயாரான ஆவணம் (Generated Document)</span>
                </div>
                <button
                  onClick={handleTranslateResult}
                  className="flex items-center gap-1 bg-sky-400/15 text-sky-400 px-2 py-1 rounded-lg hover:bg-sky-400/25 transition-colors"
                >
                  <Languages size={13} />
                  <span className="text-[10px] font-bold">Translate (மொழிபெயர்)</span>
                </button>
              </div>

              <textarea
                className="w-full bg-slate-900 rounded-xl border border-slate-700 p-3 text-slate-50 text-xs min-h-[180px] leading-relaxed resize-y focus:outline-none focus:border-slate-500"
                value={generatedResult}
                onChange={(e) => setGeneratedResult(e.target.value)}
              />

              <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wide mt-1">
                பகிர்வு & ஆவண வழிகள் (Export & Share Channels):
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl transition-colors disabled:opacity-70 text-xs font-extrabold"
                >
                  {isExportingPdf ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Printer size={16} />
                      Export Official PDF 📄
                    </>
                  )}
                </button>
                <button
                  onClick={handleShareToWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20b858] text-white py-3 rounded-xl transition-colors text-xs font-extrabold"
                >
                  <MessageCircle size={16} />
                  Share on WhatsApp 📲
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={handleShareToTelegram}
                  className="flex items-center justify-center gap-1.5 bg-[#229ED9] hover:bg-[#1d89bc] text-white py-2.5 rounded-xl transition-colors text-[11px] font-bold"
                >
                  <Send size={14} />
                  Telegram ✈️
                </button>
                <button
                  onClick={handleShareToCourseGuideWhatsApp}
                  className="flex items-center justify-center gap-1.5 bg-[#075E54] hover:bg-[#064c44] text-white py-2.5 rounded-xl transition-colors text-[11px] font-bold"
                >
                  <MessageCircle size={14} />
                  BDO CRM Hotline
                </button>
                <button
                  onClick={handleShareToSocialMedia}
                  className="flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl transition-colors text-[11px] font-bold"
                >
                  <Share2 size={14} />
                  Social Media 🌐
                </button>
                <button
                  onClick={handleCopyClipboard}
                  className="flex items-center justify-center gap-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-50 py-2.5 rounded-xl transition-colors text-[11px] font-bold"
                >
                  <Copy size={14} />
                  Copy Text
                </button>
              </div>

              {onApplyResolution && activeTool === 'resolution' && (
                <button
                  onClick={handleApplyToResolution}
                  className="flex items-center justify-center gap-1.5 bg-emerald-400 hover:bg-emerald-500 text-slate-900 py-3 rounded-xl transition-colors text-xs font-extrabold mt-1"
                >
                  <CheckCircle2 size={16} />
                  Apply directly to Meeting Resolution Book ✅
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
