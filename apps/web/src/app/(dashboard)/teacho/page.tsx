'use client';

export const dynamic = 'force-dynamic';

import React from 'react';

export default function TeachOPage() {
  return (
    <iframe 
      src="https://thamizhan.vercel.app/teacho?embed=true" 
      className="w-full h-[calc(100vh-3.5rem)] border-none"
      allow="camera; microphone; fullscreen; display-capture"
    />
  );
}
