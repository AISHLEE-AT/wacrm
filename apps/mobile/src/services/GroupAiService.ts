// @ts-nocheck
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { geminiToolsService } from './geminiToolsService';

export interface GroupPdfMetadata {
  title: string;
  docType: 'Resolution' | 'BankLetter' | 'GovtPetition' | 'ProjectProposal' | 'MeetingMinutes';
  groupName: string;
  regCode?: string;
  village?: string;
  district?: string;
  date?: string;
  refNumber?: string;
  content: string;
  officers?: {
    president?: string;
    secretary?: string;
    treasurer?: string;
  };
  members?: string[];
}

export const GroupAiService = {
  /**
   * 1. AI Resolution Drafter (தீர்மான வரைவு)
   */
  async draftResolution(options: {
    rawNotes: string;
    groupName: string;
    category?: string;
    language?: 'Tamil' | 'English';
    apiKey?: string;
  }): Promise<string> {
    const { rawNotes, groupName, category = 'Women SHG', language = 'Tamil', apiKey } = options;

    const prompt = `
You are an expert advisor for Tamil Nadu Self-Help Groups (மகளிர் சுய உதவிக் குழுக்கள் - TNCDW / Mathi), Farmer Producer Organizations (FPOs), and Community Associations.
Draft an official, formal group meeting resolution (தீர்மான வரைவு) based on these rough notes or voice input:

Group Name: ${groupName}
Group Type: ${category}
Input Notes: "${rawNotes}"

Format the output cleanly with:
1. தலைப்பு / Title
2. தீர்மான எண் / Resolution Reference
3. தீர்மான விவரம் / Detailed Resolution Background & Need
4. நிறைவேற்றப்பட்ட முடிவு / Approved Terms (Loan amount, interest %, repayment terms, or authorized signatories)
5. நிறைவேற்றுதல் பொறுப்பு / Responsible Officers (தலைவர் / செயலாளர்)

Language requirement: ${language === 'Tamil' ? 'Tamil (தமிழ்) with formal legal/governance tone' : 'English with official formal tone'}.
`;

    const res = await geminiToolsService.executePrompt(prompt, apiKey, language);
    return res.text;
  },

  /**
   * 2. AI Bank & Government Petition Letter Crafter (அரசு & வங்கி கடிதங்கள்)
   */
  async generateOfficialLetter(options: {
    letterType: 'BankLoan' | 'GovtPetition' | 'PanchayatRequest' | 'ResolutionCopy' | 'SubsidyScheme';
    recipientTitle: string; // e.g. "Branch Manager, Canara Bank" or "Block Development Officer (BDO)"
    purpose: string;
    groupName: string;
    regCode?: string;
    village?: string;
    district?: string;
    language?: 'Tamil' | 'English';
    apiKey?: string;
  }): Promise<string> {
    const {
      letterType,
      recipientTitle,
      purpose,
      groupName,
      regCode = 'TNCDW-MDU-2024-8842',
      village = 'Alanganallur',
      district = 'Madurai',
      language = 'Tamil',
      apiKey,
    } = options;

    const prompt = `
Draft a highly professional, government/bank compliant official letter (அதிகாரப்பூர்வ விண்ணப்பக் கடிதம்) from a registered Tamil Nadu Community Group.

Group Name: ${groupName} (Reg: ${regCode})
Location: ${village}, ${district}
Recipient: ${recipientTitle}
Letter Category: ${letterType}
Purpose / Subject: "${purpose}"

Include:
- அனுப்புநர் (From: President, Secretary & Members)
- பெறுநர் (To: ${recipientTitle})
- பொருள் (Subject line)
- வணக்கத்துடன் தொடங்கும் முறையான உரை (Formal body with clear bullet points of request, group history, savings discipline, and required sanction)
- கையொப்பம் & முத்திரை பகுதி (Signatures of President, Secretary, Treasurer)

Tone: Highly respectful, formal, official, and authoritative.
Language: ${language === 'Tamil' ? 'Formal Tamil (தமிழ்)' : 'Formal English'}.
`;

    const res = await geminiToolsService.executePrompt(prompt, apiKey, language);
    return res.text;
  },

  /**
   * 3. AI Project Proposal & Micro-Enterprise Business Plan Maker (திட்ட அறிக்கை)
   */
  async generateProjectProposal(options: {
    businessIdea: string; // e.g. "Tailoring Center", "Millet Processing Unit", "Organic Oil Mill"
    investmentBudget: number; // e.g. 200000
    groupName: string;
    membersCount?: number;
    language?: 'Tamil' | 'English';
    apiKey?: string;
  }): Promise<string> {
    const {
      businessIdea,
      investmentBudget,
      groupName,
      membersCount = 15,
      language = 'Tamil',
      apiKey,
    } = options;

    const prompt = `
Create an official, structured Micro-Enterprise Project Proposal & Business Plan (சிறு தொழில் திட்ட அறிக்கை) for submission to Banks, TNCDW, NABARD, or District Industries Centre (DIC).

Group Name: ${groupName} (${membersCount} Members)
Business/Project Idea: ${businessIdea}
Estimated Total Investment: ₹${investmentBudget.toLocaleString('en-IN')}

Structure the report in 5 clear sections:
1. திட்ட சுருக்கம் & தொழில் நோக்கம் (Executive Summary & Business Objectives)
2. இயந்திரங்கள், உள்கட்டமைப்பு & மூலப்பொருள் முதலீடு (Capital Expenditure & Raw Material Cost Breakdown)
3. மாதாந்திர இயக்க செலவுகள் & ஊதியம் (Monthly Working Capital & Member Livelihood Wages)
4. உற்பத்தி திறன் & விற்பனை சந்தை வாய்ப்பு (Production Capacity, Pricing & SuprO Market Linkage)
5. எதிர்பார்க்கப்படும் நிகர லாபம் & வங்கி கடன் தவணை (Projected Monthly Net Profit & Loan Repayment Feasibility)

Language: ${language === 'Tamil' ? 'Tamil (தமிழ்) with financial numbers' : 'English with structured financial breakdown'}.
`;

    const res = await geminiToolsService.executePrompt(prompt, apiKey, language);
    return res.text;
  },

  /**
   * 4. AI Meeting Announcement & Notice Generator (கூட்ட அறிவிப்பு & அழைப்பிதழ்)
   */
  async generateMeetingNotice(options: {
    meetingDate: string;
    meetingTime: string;
    venue: string;
    agenda: string;
    groupName: string;
    regCode?: string;
    language?: 'Tamil' | 'English';
    apiKey?: string;
  }): Promise<string> {
    const { meetingDate, meetingTime, venue, agenda, groupName, regCode, language = 'Tamil', apiKey } = options;
    const prompt = `
Draft an engaging, formal Meeting Notice (கூட்ட அறிவிப்பு கடிதம் & வாட்ஸ்அப் தகவல்) to all group members.
Group Name: ${groupName} (Reg: ${regCode || 'TNCDW-2024'})
Meeting Date: ${meetingDate}
Meeting Time: ${meetingTime}
Venue / Location: ${venue}
Agenda / Topics: ${agenda}

Format with clear bullet points, mandatory attendance callout, savings deposit reminder, and polite sign-off from President/Secretary.
Language: ${language === 'Tamil' ? 'Tamil (தமிழ்)' : 'English'}.
`;
    const res = await geminiToolsService.executePrompt(prompt, apiKey, language);
    return res.text;
  },

  /**
   * 5. AI Monthly Savings & Audit Passbook Statement Generator (மாதாந்திர சேமிப்பு அறிக்கை)
   */
  async generateSavingsStatement(options: {
    month: string;
    totalSavingsPool: number;
    activeLoanPool: number;
    memberCount: number;
    monthlyTarget: number;
    groupName: string;
    regCode?: string;
    village?: string;
    district?: string;
    language?: 'Tamil' | 'English';
    apiKey?: string;
  }): Promise<string> {
    const { month, totalSavingsPool, activeLoanPool, memberCount, monthlyTarget, groupName, regCode, village, district, language = 'Tamil', apiKey } = options;
    const prompt = `
Generate a formal Monthly Financial Audit & Passbook Statement (மாதாந்திர சேமிப்பு & வரவு-செலவு அறிக்கை) for:
Group: ${groupName} (${village}, ${district} • Reg: ${regCode})
Month: ${month}
Total Group Savings Fund: ₹${totalSavingsPool}
Active Revolving Loans: ₹${activeLoanPool}
Total Members: ${memberCount}
Monthly Savings Per Member: ₹${monthlyTarget}

Structure with:
1. மாதாந்திர வரவு-செலவு சுருக்கம் (Financial Summary)
2. மொத்த சேமிப்பு & வங்கி இருப்பு (Total Pool & Bank Balance)
3. சுழல் நிதி & உள் கடன் விவரம் (Revolving Loan Status & Interest Recovery)
4. நிர்வாகிகளின் கையொப்ப பகுதி (Officer Attestation)

Language: ${language === 'Tamil' ? 'Tamil (தமிழ்)' : 'English'}.
`;
    const res = await geminiToolsService.executePrompt(prompt, apiKey, language);
    return res.text;
  },

  /**
   * 6. 1-Click Tamil <-> English Translation (மொழிபெயர்ப்பு)
   */
  async translateDocument(text: string, targetLanguage: 'Tamil' | 'English', apiKey?: string): Promise<string> {
    const prompt = `
Accurately translate the following official group document/resolution into ${targetLanguage}. Preserve formal government, banking, and legal terminology cleanly:

Text to translate:
"""
${text}
"""
`;

    const res = await geminiToolsService.executePrompt(prompt, apiKey, targetLanguage);
    return res.text;
  },

  /**
   * 5. Generate Professional PDF Document using expo-print and Share
   */
  async generateAndShareGroupPdf(meta: GroupPdfMetadata): Promise<string> {
    const today = meta.date || new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const formattedContent = (meta.content || '')
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '<div style="height: 10px;"></div>';
        if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
          return `<h3 style="color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 14px; margin-bottom: 8px;">${trimmed.replace(/^[#]+\s*/, '')}</h3>`;
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return `<p style="font-weight: bold; margin: 4px 0; color: #0f172a;">${trimmed.replace(/\*\*/g, '')}</p>`;
        }
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return `<li style="margin: 4px 0; line-height: 1.6;">${trimmed.replace(/^[-•]\s*/, '')}</li>`;
        }
        return `<p style="margin: 6px 0; line-height: 1.65; color: #334155;">${trimmed}</p>`;
      })
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${meta.title}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Latha', 'Mukta Malar', sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
      font-size: 13px;
      line-height: 1.6;
    }
    .header-box {
      text-align: center;
      border-bottom: 2px solid #ec4899;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .group-title {
      font-size: 20px;
      font-weight: 800;
      color: #831843;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .group-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .doc-badge {
      display: inline-block;
      background: #fdf2f8;
      color: #db2777;
      border: 1px solid #fbcfe8;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 12px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-size: 11px;
      color: #475569;
    }
    .content-body {
      min-height: 420px;
      margin-bottom: 30px;
    }
    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .sign-box {
      text-align: center;
      width: 30%;
    }
    .sign-line {
      height: 40px;
      border-bottom: 1px dotted #94a3b8;
      margin-bottom: 6px;
    }
    .sign-role {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }
    .sign-name {
      font-size: 10px;
      color: #64748b;
    }
    .footer-seal {
      margin-top: 30px;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="doc-badge">${meta.docType}</div>
    <h1 class="group-title">${meta.groupName}</h1>
    <div class="group-sub">
      பதிவு எண் (Reg Code): ${meta.regCode || 'TNCDW-MDU-2024-8842'} • ${meta.village || 'அலங்காநல்லூர்'}, ${meta.district || 'மதுரை'}
    </div>
  </div>

  <div class="meta-bar">
    <div><strong>ஆவண குறிப்பு (Ref):</strong> ${meta.refNumber || `SU-GRP-${Date.now().toString().slice(-6)}`}</div>
    <div><strong>நாள் (Date):</strong> ${today}</div>
  </div>

  <div class="content-body">
    ${formattedContent}
  </div>

  <div class="signature-grid">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-role">தலைவர் (President)</div>
      <div class="sign-name">${meta.officers?.president || 'K. Meenakshi'}</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-role">செயலாளர் (Secretary)</div>
      <div class="sign-name">${meta.officers?.secretary || 'M. Anandhi'}</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-role">பொருளாளர் (Treasurer)</div>
      <div class="sign-name">${meta.officers?.treasurer || 'S. Lakshmi'}</div>
    </div>
  </div>

  <div class="footer-seal">
    ✨ Generated digitally by SuprO GroupO AI Governance & Resolution Suite • Verified by Member Quorum
  </div>
</body>
</html>
`;

    // 1. Generate PDF file via expo-print
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // 2. Open native share sheet via expo-sharing
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${meta.title} — PDF`,
        UTI: 'com.adobe.pdf',
      });
    }

    return uri;
  },
};
