'use client';

import { useState } from 'react';
import { KeyRound, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { SettingsPanelHead } from './settings-panel-head';
import { SessionsCard } from './sessions-card';
import { useAuth } from '@/hooks/use-auth';

function PinChangeCard() {
  const { user, profile } = useAuth();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone =
    (profile as any)?.phone ||
    (profile as any)?.whatsapp ||
    user?.phone?.replace(/^\+91/, '') ||
    user?.email?.replace('user_', '').replace('@wacrm.local', '') ||
    '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }
    if (newPin !== confirmPin) { setError('PINs do not match. Please re-enter.'); return; }
    if (!phone) { setError('Could not detect your phone number. Please re-login.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/pin/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin: newPin, confirmPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update PIN');
      setSuccess(true);
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <KeyRound className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Change Login PIN</h3>
          <p className="text-xs text-muted-foreground">Update your 4-digit quick login PIN</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">New 4-Digit PIN</label>
          <div className="relative flex items-center">
            <KeyRound className="absolute left-4 h-4 w-4 text-amber-400" />
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              maxLength={4}
              className="w-full bg-background border border-border rounded-xl text-foreground pl-12 pr-12 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition text-lg font-bold tracking-[0.5rem] placeholder:text-muted-foreground placeholder:tracking-normal"
            />
            <button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-4 text-muted-foreground hover:text-foreground transition">
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confirm New PIN</label>
          <div className="relative flex items-center">
            <KeyRound className="absolute left-4 h-4 w-4 text-amber-400" />
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              maxLength={4}
              className={`w-full bg-background border rounded-xl text-foreground pl-12 pr-4 py-3 focus:outline-none transition text-lg font-bold tracking-[0.5rem] placeholder:text-muted-foreground placeholder:tracking-normal ${
                confirmPin.length === 4
                  ? confirmPin === newPin
                    ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
                    : 'border-red-500 focus:ring-1 focus:ring-red-500/40'
                  : 'border-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40'
              }`}
            />
          </div>
          {confirmPin.length === 4 && confirmPin !== newPin && (
            <p className="text-red-400 text-xs mt-1">⚠ PINs don't match</p>
          )}
          {confirmPin.length === 4 && confirmPin === newPin && (
            <p className="text-emerald-400 text-xs mt-1">✓ PINs match</p>
          )}
        </div>

        {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <ShieldCheck className="w-4 h-4" /> PIN updated successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || newPin.length !== 4 || newPin !== confirmPin}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-lg shadow-amber-500/20"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Update PIN
        </button>
      </form>
    </div>
  );
}

/**
 * "Login & security" section — PIN management and active sessions.
 * Password form removed: SuprO uses WhatsApp OTP + PIN only.
 */
export function SecurityPanel() {
  return (
    <section className="max-w-2xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Login & security"
        description="Manage your PIN for quick offline login. Use WhatsApp OTP to reset access anytime."
      />
      <div className="space-y-4">
        <PinChangeCard />
        <SessionsCard />
      </div>
    </section>
  );
}
