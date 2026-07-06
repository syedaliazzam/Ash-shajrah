"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface IntroductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntroductionModal({ isOpen, onClose }: IntroductionModalProps) {
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
      <div className={`relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl ${language === 'ur' ? 'text-right font-urdu' : 'text-left font-display'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald/10 bg-white/50 px-6 py-4 sm:px-8 sm:py-6">
          <h2 className={`text-2xl font-bold text-emerald-deep sm:text-3xl ${language === 'ur' ? 'leading-[1.7]' : ''}`}>
            {t.aboutModal.title}
          </h2>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep transition-colors hover:bg-emerald/20 focus:outline-none"
            aria-label={t.aboutModal.modalClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Opening Paragraphs */}
            <div className="space-y-6">
              {t.aboutModal.paragraphs.map((para, idx) => (
                <p key={idx} className={`text-emerald-deep/90 ${language === 'ur' ? 'text-lg leading-[2.1]' : 'text-lg leading-relaxed'}`}>
                  {para}
                </p>
              ))}
            </div>

            {/* List Section */}
            <div className="rounded-2xl bg-emerald/5 p-6 sm:p-8 border border-emerald/10">
              <h3 className={`mb-4 text-xl font-bold text-emerald-deep sm:text-2xl ${language === 'ur' ? 'leading-[1.7]' : ''}`}>
                {t.aboutModal.listTitle}
              </h3>
              <ul className={`space-y-3 ${language === 'ur' ? 'pr-4' : 'pl-4'} list-none`}>
                {t.aboutModal.listItems.map((item, idx) => (
                  <li key={idx} className="relative text-emerald-deep/80 text-base sm:text-lg">
                    <span className={`absolute ${language === 'ur' ? '-right-4' : '-left-4'} top-[0.6rem] h-1.5 w-1.5 rounded-full bg-gold`} />
                    <span className={`${language === 'ur' ? 'leading-[2.1]' : 'leading-relaxed'}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Closing Paragraphs */}
            <div className="space-y-6">
              {t.aboutModal.closingParagraphs.map((para, idx) => (
                <p key={idx} className={`text-emerald-deep/90 ${language === 'ur' ? 'text-lg leading-[2.1]' : 'text-lg leading-relaxed'}`}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-emerald/10 bg-white/50 px-6 py-4 sm:px-8">
          <button 
            onClick={onClose}
            className="w-full rounded-full bg-emerald px-6 py-3 text-center text-sm font-semibold text-cream shadow-sm transition-all hover:bg-emerald-light sm:w-auto"
          >
            {t.aboutModal.modalClose}
          </button>
        </div>
      </div>
    </div>
  );
}
