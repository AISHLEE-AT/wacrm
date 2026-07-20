export const LOAN_PRODUCTS = [
  { id: 'gold', title: 'Gold Loan', icon: 'Coins', color: '#F59E0B', desc: 'Secure loans against 22K/24K Gold Ornaments.', maxAmount: '₹50,00,000' },
  { id: 'property', title: 'Property Loan', icon: 'Building', color: '#3B82F6', desc: 'Mortgage loans against commercial or residential property.', maxAmount: '₹5,00,00,000' },
  { id: 'vehicle', title: 'Vehicle Loan', icon: 'Car', color: '#10B981', desc: 'Refinance your car, tractor, or commercial vehicle.', maxAmount: '₹20,00,000' },
  { id: 'silver', title: 'Silver Loan', icon: 'Award', color: '#9CA3AF', desc: 'Instant cash against silver articles and bullion.', maxAmount: '₹5,00,000' },
  { id: 'agri', title: 'Agri Loan', icon: 'Tractor', color: '#84CC16', desc: 'Specialized funding for farmers and agricultural equipment.', maxAmount: '₹10,00,000' },
  { id: 'housing', title: 'Housing Loan', icon: 'Home', color: '#6366F1', desc: 'Home construction and renovation financing.', maxAmount: '₹1,00,00,000' }
];

export const TN_LEGAL_TERMS = `
TERMS & CONDITIONS (As per Tamil Nadu Moneylenders Act, 1957)

1. INTEREST RATE: The interest rate shall not exceed the maximum limit prescribed by the Government of Tamil Nadu for secured loans (typically 9% - 12% per annum simple interest).
2. NO COMPOUNDING: The lender shall not charge compound interest on the principal amount under any circumstances.
3. VALUATION & APPRAISAL: The final loan amount is subject to physical verification and professional appraisal of the pledged asset (Gold, Silver, Property, Vehicle). The lender reserves the right to reject the asset if it fails authentication.
4. PLEDGE OF SECURITY: The borrower agrees to pledge the described asset as collateral. Ownership remains with the borrower, but possession (for movable assets) or lien (for immovable assets) is transferred to the lender until full repayment.
5. DEFAULT & AUCTION: If the borrower defaults on interest or principal payments for a continuous period exceeding 90 days, the lender holds the right to auction or liquidate the pledged asset after issuing a standard 30-day legal notice to the borrower's registered address.
6. PRE-PAYMENT: The borrower may pre-pay the principal at any time without incurring any pre-closure penalty.
7. JURISDICTION: Any disputes arising from this agreement shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu.

By clicking "I ACCEPT", the borrower acknowledges having read, understood, and agreed to these terms.
`;

export const generatePromissoryNoteText = (borrowerName, amount, loanType, date) => {
  return `
                          ON DEMAND PROMISSORY NOTE
                          -------------------------

Date: ${date}
Place: Tamil Nadu, India

ON DEMAND, I, ${borrowerName}, promise to pay to the Lender (Aishlee Technology / Authorized Admin) or order, the sum of Rs. ${amount}/- (Rupees _______________ only) together with interest at the rate of _____% per annum from the date hereof until payment in full, for value received in cash/bank transfer for the purpose of a ${loanType} requirement.

I declare that this loan is secured against the pledge/mortgage of my asset, the details of which will be recorded in the physical appraisal receipt.

I acknowledge that this Promissory Note is governed by the provisions of the Negotiable Instruments Act, 1881 and the Tamil Nadu Moneylenders Act, 1957.


Signature / Thumb Impression of Borrower: ___________________________

Name: ${borrowerName}
Date: ${date}


--------------------------------------------------------------------------------
FOR OFFICE USE ONLY (LENDER)
Appraisal Value: Rs. _____________     Approved Amount: Rs. _____________
Lender Signature: ___________________________
`;
};

export const GOVT_BUSINESS_SCHEMES = [
  { id: 'mudra', title: 'PM MUDRA Yojana', icon: 'Coins', color: '#F97316', desc: 'Micro-enterprise loans for non-corporate, non-farm small businesses. Categories: Shishu, Kishore, Tarun.', maxAmount: '₹10,00,000' },
  { id: 'pmegp', title: 'PMEGP Scheme', icon: 'Building', color: '#14B8A6', desc: "Prime Minister's Employment Generation Programme. Provides credit-linked subsidies for new micro-enterprises.", maxAmount: '₹50,00,000' },
  { id: 'needs', title: 'NEEDS (Tamil Nadu)', icon: 'Award', color: '#8B5CF6', desc: 'New Entrepreneur cum Enterprise Development Scheme. Subsidy for first-generation entrepreneurs in manufacturing/services.', maxAmount: '₹5,00,00,000' },
  { id: 'uyegp', title: 'UYEGP (Tamil Nadu)', icon: 'Briefcase', color: '#EC4899', desc: 'Unemployed Youth Employment Generation Programme. For marginalized sections to start micro-enterprises.', maxAmount: '₹15,00,000' },
  { id: 'standup', title: 'Stand-Up India', icon: 'Users', color: '#06B6D4', desc: 'Bank loans for SC/ST and women entrepreneurs for greenfield enterprises in manufacturing, services, or trading.', maxAmount: '₹1,00,00,000' }
];

export const TN_SAVINGS_TERMS = `
TERMS & CONDITIONS (As per Tamil Nadu Nidhi / Chit Fund Guidelines)

1. REGULAR PAYMENTS: The Subscriber agrees to pay the fixed monthly EMI for exactly 11 continuous months without default.
2. PROVIDER BONUS: Upon successful completion of 11 consecutive EMI payments, the Provider shall contribute an amount equal to 1 month's EMI as a bonus to the Subscriber's account.
3. MATURITY & PAYOUT: The total accumulated sum (11 months Subscriber contribution + 1 month Provider bonus) shall be paid out to the Subscriber on the 13th month from the date of the first payment.
4. LATE PAYMENTS: A grace period of 5 days is allowed. Payments made after the grace period may attract a penalty of 2% per month on the due amount.
5. PRE-MATURE WITHDRAWAL: If the Subscriber wishes to withdraw before the 11-month period, no Provider Bonus will be awarded, and a flat 5% administrative deduction will be made on the deposited amount. The balance will be refunded within 30 days.
6. KYC MANDATE: The Subscriber must submit valid KYC documents (Aadhaar & PAN) before the 2nd EMI. Failure to do so will result in suspension of the scheme.
7. COMPLIANCE: This scheme is strictly designed under the permissible regulations of the Tamil Nadu Prize Chits and Money Circulation Schemes (Banning) Act and relevant Central Nidhi regulations.

By clicking "I ACCEPT", the Subscriber acknowledges having read, understood, and agreed to these terms.
`;

export const generateSavingsAgreementText = (subscriberName, emiAmount, schemeTitle, providerName, date) => {
  const totalUserContribution = emiAmount * 11;
  const bonus = emiAmount * 1;
  const maturityAmount = totalUserContribution + bonus;

  return `
                      MONTHLY SAVINGS SCHEME AGREEMENT
                      --------------------------------

Date: ${date}
Place: Tamil Nadu, India
Provider: ${providerName}
Scheme: ${schemeTitle}

This Agreement is made between the Provider (${providerName}) and the Subscriber, ${subscriberName}.

1. SCHEME DETAILS:
   - Monthly EMI Amount: Rs. ${emiAmount}/-
   - Duration of Subscriber Payments: 11 Months
   - Total Contribution by Subscriber: Rs. ${totalUserContribution}/-
   - Provider Bonus Contribution: Rs. ${bonus}/- (Equivalent to 1 Month EMI)
   - Final Maturity Amount: Rs. ${maturityAmount}/-
   - Maturity Payout Timeline: 13th Month from the date of first EMI payment.

2. DECLARATION:
I, ${subscriberName}, agree to abide by the 11-month payment schedule. I understand that the Provider will add a 1-month bonus upon successful completion of my 11 installments. I acknowledge that early withdrawal forfeits the bonus and incurs a 5% administrative fee.

3. GOVERNING LAW:
This Agreement is governed by the laws of India and adheres to the financial regulations applicable in the State of Tamil Nadu.


Signature / Thumb Impression of Subscriber: ___________________________

Name: ${subscriberName}
Date: ${date}


--------------------------------------------------------------------------------
FOR OFFICE USE ONLY (PROVIDER)
First EMI Received: [ YES / NO ]      KYC Status: [ VERIFIED / PENDING ]
Authorized Signatory: ___________________________
`;
};
