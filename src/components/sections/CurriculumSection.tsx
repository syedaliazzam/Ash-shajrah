"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap";
import { scrollReveal } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";
import { CurriculumEventsSlider } from "@/components/sections/CurriculumEventsSlider";
import type { CurriculumEvent } from "@/lib/curriculum-events";
import type { EducationalDocument } from "@/lib/educational-documents";

function DocumentFileIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ArrowExternalIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

const normalizeCurriculumTitle = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type TableRowItem = {
  id: string;
  area: string;
  description: string;
  documents: EducationalDocument[];
  isCustom?: boolean;
};

export function CurriculumSection({
  initialCurriculumEvents = [],
  initialEducationalDocuments = [],
}: {
  initialCurriculumEvents?: CurriculumEvent[];
  initialEducationalDocuments?: EducationalDocument[];
} = {}) {
  const { t, language } = useLanguage();
  const isUrdu = language === "ur";
  const sectionRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<EducationalDocument[]>(
    () => initialEducationalDocuments || []
  );

  useEffect(() => {
    if (initialEducationalDocuments && initialEducationalDocuments.length > 0) {
      setDocuments(initialEducationalDocuments);
      return;
    }

    let cancelled = false;

    const loadDocuments = async () => {
      try {
        const response = await fetch("/api/educational-documents", {
          method: "GET",
        });

        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        const rows = Array.isArray((payload as { data?: unknown })?.data)
          ? ((payload as { data?: EducationalDocument[] }).data ?? [])
          : [];

        if (!cancelled) {
          setDocuments(rows.filter((row) => row?.fileUrl && row?.title));
        }
      } catch {
        if (!cancelled) {
          setDocuments([]);
        }
      }
    };

    void loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [initialEducationalDocuments]);

  const tableRows = useMemo(() => {
    // 1. Initial core rows from translations with explicit Yearly Planning and Material List
    const baseRows = [...t.curriculumTable.rows];

    // Ensure Yearly Planning row exists in base rows if not already defined
    const hasYearlyPlanRow = baseRows.some((r) =>
      normalizeCurriculumTitle(r.area).includes("yearly") ||
      r.area.includes("سالانہ")
    );
    if (!hasYearlyPlanRow) {
      baseRows.splice(1, 0, {
        area: isUrdu ? "سالانہ منصوبہ بندی (Yearly Planning)" : "Yearly Planning",
        description: isUrdu
          ? "جامع تعلیمی خاکہ، نصابی پیش رفت، اصطلاحی سنگ میل اور ترقیاتی اہداف کا سالانہ فریم ورک۔"
          : "Comprehensive yearly plan, syllabus progression, term milestones, and developmental roadmap.",
      });
    }

    // Ensure Material List row exists in base rows if not already defined
    const hasMaterialListRow = baseRows.some((r) =>
      normalizeCurriculumTitle(r.area).includes("material") ||
      r.area.includes("سامان")
    );
    if (!hasMaterialListRow) {
      baseRows.splice(2, 0, {
        area: isUrdu ? "تعلیمی سامان اور وسائل (Material List)" : "Material List & Resources",
        description: isUrdu
          ? "کلاس کی سرگرمیوں، گھریلو مطالعہ اور عملی سیکھنے کے لیے درکار ضروری سامان اور وسائل کی فہرست۔"
          : "Recommended learning resources, activity materials, and home study supplies for each class level.",
      });
    }

    const staticRows: TableRowItem[] = baseRows.map((row, index) => ({
      id: `static-${index}`,
      area: row.area,
      description: row.description,
      documents: [],
    }));

    // Exclude parent_guide documents per requirement
    const isParentGuideDoc = (doc: EducationalDocument) => {
      const normType = (doc.documentType || "").toLowerCase().trim();
      const normTitle = (doc.title || "").toLowerCase().trim();
      return (
        normType === "parent_guide" ||
        normType === "parent-guide" ||
        normType === "parentguide" ||
        normType.includes("parent") ||
        normTitle.includes("parent guide") ||
        normTitle.includes("parent_guide") ||
        normTitle.includes("رہنمائی برائے والدین") ||
        normTitle.includes("والدین")
      );
    };

    const eligibleDocs = documents.filter((doc) => !isParentGuideDoc(doc));
    const claimedDocIds = new Set<string>();

    // 2. Attach matching documents to rows
    staticRows.forEach((row) => {
      const normArea = normalizeCurriculumTitle(row.area);

      eligibleDocs.forEach((doc) => {
        const normTitle = normalizeCurriculumTitle(doc.title);
        const normType = doc.documentType.toLowerCase().trim();
        const normClass = (doc.classLevel || "").toLowerCase().trim();

        let isMatch = false;

        // Yearly Planning match
        if (
          (normArea.includes("yearly") || row.area.includes("سالانہ")) &&
          (normType === "yearly_plan" || normTitle.includes("yearly") || doc.title.includes("سالانہ"))
        ) {
          isMatch = true;
        }
        // Material List match
        else if (
          (normArea.includes("material") || row.area.includes("سامان")) &&
          (normType === "material_list" || normTitle.includes("material") || doc.title.includes("سامان"))
        ) {
          isMatch = true;
        }
        // Curriculum Plan general match
        else if (
          (normArea === "curriculum" || normArea === "نصاب") &&
          (normType === "curriculum" || normTitle.includes("curriculum") || doc.title.includes("نصاب"))
        ) {
          isMatch = true;
        }
        // Direct title match or title containing area name
        else if (
          normTitle &&
          (normTitle === normArea ||
            normArea.includes(normTitle) ||
            normTitle.includes(normArea))
        ) {
          isMatch = true;
        }
        // Seerat un Nabi
        else if (
          normArea.includes("seerat") &&
          (normTitle.includes("seerat") || normType.includes("seerat"))
        ) {
          isMatch = true;
        }
        // Early Years Planning Prep
        else if (
          (normArea.includes("prep") || normArea.includes("پری")) &&
          (normArea.includes("planning") || normArea.includes("پلاسنگ")) &&
          (normTitle.includes("prep") ||
            normClass.includes("prep") ||
            normTitle.includes("planning"))
        ) {
          isMatch = true;
        }
        // Early Years Planning Play Group
        else if (
          (normArea.includes("play") || normArea.includes("پلے")) &&
          (normArea.includes("planning") || normArea.includes("پلاسنگ")) &&
          (normTitle.includes("play") ||
            normClass.includes("play") ||
            normTitle.includes("planning"))
        ) {
          isMatch = true;
        }
        // Fehm-e-Deen
        else if (
          normArea.includes("fehm") &&
          (normTitle.includes("fehm") ||
            normTitle.includes("deen") ||
            normType.includes("fehm"))
        ) {
          isMatch = true;
        }
        // Islamic Values
        else if (
          normArea.includes("islamic") &&
          (normTitle.includes("islamic") || normTitle.includes("akhlaq"))
        ) {
          isMatch = true;
        }

        if (isMatch) {
          row.documents.push(doc);
          claimedDocIds.add(doc.id);
        }
      });
    });

    // 3. For any remaining document types without an existing row:
    // Create new rows where Area = doc.title, and "What Students Will Learn" = document pills
    const unclaimedDocs = eligibleDocs.filter((doc) => !claimedDocIds.has(doc.id));
    const customGroups = new Map<
      string,
      { area: string; description: string; docs: EducationalDocument[] }
    >();

    unclaimedDocs.forEach((doc) => {
      const groupKey = normalizeCurriculumTitle(doc.title) || doc.id;
      const areaTitle = doc.title.trim();
      const areaDescription = isUrdu
        ? "طلبہ کی تدریس، رہنمائی اور تعلیمی مقاصد کے لیے فراہم کردہ دستاویزی مواد اور نصابی وسائل۔"
        : "Verified educational learning resources, syllabus materials, and supporting documentation.";

      if (!customGroups.has(groupKey)) {
        customGroups.set(groupKey, {
          area: areaTitle,
          description: areaDescription,
          docs: [],
        });
      }

      customGroups.get(groupKey)!.docs.push(doc);
    });

    const additionalRows: TableRowItem[] = Array.from(customGroups.entries()).map(
      ([key, group]) => ({
        id: `custom-${key}`,
        area: group.area,
        description: group.description,
        documents: group.docs,
        isCustom: true,
      })
    );

    return [...staticRows, ...additionalRows];
  }, [t.curriculumTable.rows, documents, isUrdu]);

  useGSAP(
    () => {
      if (!sectionRef.current || !tableRef.current) return;

      scrollReveal("[data-curriculum-row]", {
        trigger: sectionRef.current,
        start: "top 75%",
        stagger: 0.08,
        y: 20,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="relative overflow-hidden bg-gradient-to-b from-white via-cream/30 to-emerald/[0.02] px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        <div className={`mb-12 sm:mb-16 text-center ${isUrdu ? "font-urdu" : ""}`}>
          <span
            className={`mb-5 inline-block rounded-full border border-emerald/20 bg-emerald/10 px-5 py-2 font-semibold uppercase text-emerald ${
              isUrdu ? "font-urdu text-sm tracking-widest" : "text-sm tracking-[0.2em]"
            }`}
          >
            {t.nav.curriculum}
          </span>

          <div className="mx-auto max-w-3xl text-center">
            <h2
              className={`${
                isUrdu ? "leading-[1.7]" : "font-display leading-tight"
              } text-3xl font-bold sm:text-4xl lg:text-[2.6rem] text-emerald-deep`}
            >
              {t.curriculumTable.title}
            </h2>
            <p
              className={`mt-4 text-emerald/70 ${
                isUrdu
                  ? "leading-[2] sm:text-lg sm:leading-[2.1]"
                  : "text-base leading-relaxed sm:text-lg"
              }`}
            >
              {t.curriculumTable.subtitle}
            </p>
          </div>
        </div>

        <div
          ref={tableRef}
          className="overflow-hidden rounded-2xl border border-emerald/15 bg-white/70 shadow-lg shadow-emerald-deep/5 backdrop-blur-md"
        >
          {/* Desktop / tablet table header */}
          <div
            className={`hidden border-b border-emerald/15 bg-emerald/5 px-6 py-4 md:grid md:grid-cols-[1fr_2fr] sm:px-8 ${
              isUrdu ? "text-right font-urdu" : "text-left font-display"
            }`}
          >
            <div className="text-lg font-semibold text-emerald-deep">
              {t.curriculumTable.headers.area}
            </div>
            <div className="text-lg font-semibold text-emerald-deep">
              {t.curriculumTable.headers.description}
            </div>
          </div>

          <div className="divide-y divide-emerald/10">
            {tableRows.map((row) => {
              return (
                <article
                  key={row.id}
                  data-curriculum-row
                  className={`px-5 py-5 transition-colors hover:bg-emerald/5 sm:px-8 md:grid md:grid-cols-[1fr_2fr] md:gap-6 ${
                    isUrdu ? "text-right font-urdu" : "text-left"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div
                      className={`font-semibold text-emerald-deep ${
                        isUrdu ? "text-lg leading-[1.8]" : "text-base"
                      }`}
                    >
                      {row.area}
                    </div>
                  </div>

                  <div className="mt-2 md:mt-0">
                    <p
                      className={`mb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald/50 md:hidden ${
                        isUrdu ? "font-urdu normal-case tracking-normal" : ""
                      }`}
                    >
                      {t.curriculumTable.headers.description}
                    </p>
                    <div
                      className={`text-emerald-deep/80 ${
                        isUrdu ? "text-base leading-[2.1]" : "text-sm leading-relaxed sm:text-base"
                      }`}
                    >
                      {row.description}
                    </div>

                    {/* Attached Documents List */}
                    {row.documents && row.documents.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-2.5">
                        {row.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/doc inline-flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald/5 px-3 py-1.5 text-xs font-semibold text-emerald-deep shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/15 hover:text-emerald-deep hover:shadow-sm"
                            title={doc.title}
                          >
                            <DocumentFileIcon className="h-4 w-4 shrink-0 text-emerald transition-colors group-hover/doc:text-gold" />
                            <span className="truncate max-w-[260px] sm:max-w-[340px]">
                              {doc.title}
                            </span>
                            <ArrowExternalIcon className="h-3 w-3 shrink-0 opacity-60 transition-transform group-hover/doc:translate-x-0.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <CurriculumEventsSlider
          language={language}
          initialEvents={initialCurriculumEvents}
        />
      </div>
    </section>
  );
}
