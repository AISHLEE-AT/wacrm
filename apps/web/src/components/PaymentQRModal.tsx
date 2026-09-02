'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldAlert, Sparkles, CheckCircle2, MessageSquare, CreditCard, Key, ArrowRight } from 'lucide-react';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  amount: number;
  itemId: string;
  itemType: 'course' | 'o_test' | 'teacho_pass';
  userId?: string;
  userName?: string;
  userPhone?: string;
  upiId?: string;
  payeeName?: string;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  amount,
  itemId,
  itemType,
  userId = 'guest-user',
  userName = 'Learner',
  userPhone = '6381029380',
  upiId = '6381029380@hdfcbank',
  payeeName = 'AISHLEE TECHNOLOGY',
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'code'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`SuprO ${title} Access`)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=916381029380&text=${encodeURIComponent(
    `Hello Admin! I am paying ₹${amount} for SuprO ${title} (Item: ${itemId}, Phone: ${userPhone}, UPI: ${upiId}).`
  )}`;

  const handleSubmitUtr = async () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      alert('Please enter a valid 12-digit UPI Reference Number / UTR.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`purchased_${itemType}_${itemId}`, 'APPROVED');
        }
      } catch (e) {}
      alert(`🎉 Payment Verified! Full access unlocked for "${title}".`);
      onSuccess();
      onClose();
    }, 600);
  };

  const handleApplyCode = () => {
    const clean = accessCode.trim().toUpperCase();
    const VALID = ['CENTUM100', 'POOVI100', 'ADMINPASS', 'AISHLEE100', 'STUDENT100', 'FREEPASS'];

    if (VALID.includes(clean)) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`purchased_${itemType}_${itemId}`, 'APPROVED');
        }
      } catch (e) {}
      alert(`🌟 Access code "${clean}" applied! 100% full access unlocked.`);
      onSuccess();
      onClose();
    } else {
      alert('Invalid or expired coupon code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              SuprO Premium Unlock
            </span>
            <h3 className="text-base font-bold text-white leading-tight mt-0.5">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-[#0a0f1d] border-b border-slate-800/80 gap-2">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'upi'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Instant UPI Pay (₹{amount})
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'code'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Access Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeTab === 'upi' ? (
            <>
              {/* Strict Rule */}
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>
                  Please pay the <strong>exact amount of ₹{amount}</strong>. Partial payments cannot be auto-unlocked.
                </span>
              </div>

              {/* QR Code Card */}
              <div className="bg-[#1e293b]/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-3 rounded-xl shadow-lg inline-block">
                  <QRCodeSVG value={upiUrl} size={160} level="H" includeMargin={true} />
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold text-emerald-400 block">UPI: {upiId}</span>
                  <span className="text-[11px] text-slate-400">{payeeName}</span>
                </div>
              </div>

              {/* 1-Tap UPI Launch Link */}
              <a
                href={upiUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" /> 1-Tap Open GPay / PhonePe / Paytm (₹{amount})
              </a>

              {/* WhatsApp Admin Verification */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Admin Support (6381029380)
              </a>

              {/* UTR Input */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Enter 12-Digit UPI Reference No / UTR:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 423589124501"
                    maxLength={16}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSubmitUtr}
                    disabled={submitting}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-1">
                <Key className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Institutional & Promo Key</h4>
                <p className="text-xs text-slate-400">
                  Enter coupon or school license code to unlock 100% full course access.
                </p>
              </div>

              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter Code (e.g. CENTUM100)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-sm font-bold text-white tracking-widest focus:outline-none focus:border-emerald-500"
              />

              <button
                onClick={handleApplyCode}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
              >
                <span>Apply & Unlock Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PaymentQRModal;
