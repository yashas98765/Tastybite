import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const whatsappNumber = '917619290168';
  const message = 'Hello TastyBite Support, I need help with my order.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-30 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 group border border-emerald-400/40"
      title="Chat on WhatsApp"
    >
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
        <MessageCircle className="w-4 h-4 fill-white" />
      </div>
      <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">
        WhatsApp Care
      </span>
      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping absolute top-1 right-1" />
    </a>
  );
};

export default WhatsAppButton;
