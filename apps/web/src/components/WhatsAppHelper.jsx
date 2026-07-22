'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export const WhatsAppHelper = ({ initialMessage = 'Hi Fago Support, I need help!' }) => {
  const pathname = usePathname();
  const phoneNumber = '916381029380';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(initialMessage)}`;

  // Do not render floating help button on the Inbox page to avoid covering the message input box or send button
  if (pathname?.startsWith('/inbox')) {
    return null;
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Support"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 sm:px-5 rounded-full font-bold shadow-xl hover:bg-[#20bd5a] hover:scale-105 transition-all duration-200"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden sm:inline text-sm">Help</span>
    </Link>
  );
};
