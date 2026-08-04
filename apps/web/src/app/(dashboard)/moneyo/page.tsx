'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { DollarSign, Shield, Percent, Calculator, Phone } from 'lucide-react';

export default function MoneyoPage() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [months, setMonths] = useState(12);

  const interestRate = 0.01; // 1% per month
  const totalInterest = loanAmount * interestRate * months;
  const emi = Math.round((loanAmount + totalInterest) / months);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <span className="text-2xl p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">💰</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            MoneyO <span className="text-xs bg-emerald-500/20 text-emerald-300 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30">நிதி சேவைகள்</span>
          </h1>
          <p className="text-sm text-slate-400">Micro-Finance, Gold Loan EMI Estimator & Daily Savings Assistance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EMI Calculator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" /> Micro-Loan EMI Estimator
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Loan Amount</span>
                <span className="text-emerald-400 font-bold">₹{loanAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Duration</span>
                <span className="text-emerald-400 font-bold">{months} Months</span>
              </div>
              <input
                type="range"
                min="3"
                max="36"
                step="3"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-center">
              <p className="text-xs text-slate-400">Estimated Monthly EMI</p>
              <p className="text-2xl font-bold text-emerald-400">₹{emi.toLocaleString()} / mo</p>
            </div>

            <button onClick={() => alert(`Applying for ₹${loanAmount} loan`)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20">
              Apply for Micro-Loan
            </button>
          </div>
        </div>

        {/* Financial Services */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-white text-sm">🥇 Gold Loan Doorstep Service</h4>
            <p className="text-xs text-slate-400">Get lowest 0.79% monthly interest rate with doorstep gold evaluation & instant disbursal.</p>
            <button onClick={() => alert('Requesting Gold Loan agent...')} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-4 py-2 rounded-xl text-xs border border-emerald-500/30">
              Request Doorstep Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
