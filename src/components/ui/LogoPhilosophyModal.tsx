"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LogoPhilosophyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoPhilosophyModal({ isOpen, onClose }: LogoPhilosophyModalProps) {
  const { t, language } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className={`relative flex max-h-[min(85vh,100dvh)] w-[92vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl sm:w-full ${language === 'ur' ? 'text-right font-urdu' : 'text-left font-display'}`}>
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-emerald/10 bg-white/50 px-4 py-4 sm:px-8 sm:py-6">
          <h2 className={`min-w-0 flex-1 text-xl font-bold text-emerald-deep sm:text-2xl lg:text-3xl ${language === 'ur' ? 'leading-[1.7]' : ''}`}>
            {t.logoPhilosophy.title}
          </h2>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20 focus:outline-none"
            aria-label={t.logoPhilosophy.modalClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-3xl space-y-10">
            {t.logoPhilosophy.sections.map((section, idx) => (
              <div key={idx} className="relative">
                <h3 className={`mb-4 text-xl font-bold text-emerald sm:text-2xl ${language === 'ur' ? 'leading-[1.7]' : ''}`}>
                  {section.title}
                </h3>
                <ul className={`space-y-3 ${language === 'ur' ? 'pr-4' : 'pl-4'} list-none`}>
                  {section.points.map((point, pIdx) => (
                    <li key={pIdx} className="relative text-emerald-deep/80 text-base sm:text-lg">
                      <span className={`absolute ${language === 'ur' ? '-right-4' : '-left-4'} top-[0.4rem] h-1.5 w-1.5 rounded-full bg-gold`} />
                      <span className={`${language === 'ur' ? 'leading-[2.1]' : 'leading-relaxed'}`}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-emerald/10 bg-white/50 px-6 py-4 sm:px-8">
          <button 
            onClick={onClose}
            className="w-full rounded-full bg-emerald px-6 py-3 text-center text-sm font-semibold text-cream shadow-sm transition-all hover:bg-emerald-light sm:w-auto"
          >
            {t.logoPhilosophy.modalClose}
          </button>
        </div>
      </div>
    </div>
  );
}
