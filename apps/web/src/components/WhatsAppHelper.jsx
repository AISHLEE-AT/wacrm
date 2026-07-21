'use client';
import React from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export const WhatsAppHelper = ({ initialMessage = 'Hello, I need some help with the Aishlee app.' }) => {
  const phoneNumber = '916381029380';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(initialMessage)}`;

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" 
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
      <MessageCircle size={24} />
    </Link>
  );
};
