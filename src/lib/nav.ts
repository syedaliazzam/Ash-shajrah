export const NAV_ITEMS = [
  { key: "about", href: "/#about" },
  { key: "programs", href: "/#programs" },
  { key: "values", href: "/#values" },
  { key: "learningApproach", href: "/#learning-approach" },
  { key: "curriculum", href: "/#curriculum" },
  { key: "howItWorks", href: "/#how-it-works" },
  { key: "leadership", href: "/#leadership" },
  { key: "works", href: "/#works" },
  { key: "events", href: "/#events" },
  { key: "contact", href: "/#contact" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];
