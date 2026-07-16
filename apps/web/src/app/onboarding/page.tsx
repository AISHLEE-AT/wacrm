'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleRequestPermissions = async () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setError('Please enter your phone number to continue.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Request Microphone & Camera
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (e) {
        console.warn('Camera/Mic permission denied or not available', e);
        // We continue even if denied, to match standard web behavior (we can't force it)
      }

      // 2. Request Location
      if ('geolocation' in navigator) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => {
              console.warn('Location permission denied or not available', err);
              resolve(null);
            },
            { enableHighAccuracy: true }
          );
        });
      }

      // 3. Device Fingerprinting
      const userAgent = navigator.userAgent;
      const language = navigator.language;
      const resolution = `${window.screen.width}x${window.screen.height}`;
      
      // Store fingerprinting data (In a real app, this would be sent to the backend)
      const deviceData = {
        userAgent,
        language,
        resolution,
        phoneNumber,
        platform: 'web',
      };
      
      localStorage.setItem('fago_device_data', JSON.stringify(deviceData));

      // 4. Set cookie to mark onboarding as complete
      document.cookie = "web_onboarding_complete=true; path=/; max-age=31536000";

      // 5. Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('An error occurred during setup. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full space-y-8 flex flex-col items-center text-center">
        <ShieldCheck className="w-24 h-24 text-green-500" />
        
        <h1 className="text-3xl font-bold tracking-tight">Welcome to FAGO</h1>
        
        <p className="text-neutral-400 text-lg">
          To provide you with the best experience, including real-time maps, voice notes, and seamless login, we need access to a few permissions and your phone number.
        </p>

        <div className="w-full space-y-4 pt-4">
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="phone" className="text-sm font-medium text-neutral-300">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <button
            onClick={handleRequestPermissions}
            disabled={isLoading}
            className="w-full rounded-md bg-green-500 px-4 py-3 text-lg font-semibold text-black hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'OK, Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
