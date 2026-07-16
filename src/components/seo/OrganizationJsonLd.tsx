export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Ash-Shajrah Learning Hub",
    alternateName: ["ALH", "Ash-Shajrah", "Ash-Shajrah Learning Hub (ALH)", "الشجرہ لرننگ ہب"],
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ashshajrah.com",
    description:
      "Ash-Shajrah Learning Hub (ALH) is an online early childhood learning hub for Play Group, Prep-I and Prep-II, focused on parent partnership, Islamic values, creativity, character, confidence, and home-based learning support.",
    areaServed: [
      "Pakistan",
      "Overseas Pakistani families",
      "United Arab Emirates",
      "Saudi Arabia",
      "United Kingdom",
      "United States",
      "Canada",
    ],
    educationalCredentialAwarded: "Early Years Learning Support",
    knowsAbout: [
      "Early Childhood Education",
      "Online Learning",
      "Parent Partnership",
      "Islamic Values",
      "Fehm-e-Deen",
      "Language",
      "Numeracy",
      "Creativity",
      "Critical Thinking",
      "Character Development",
      "Personal Development",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-336-5409798",
      contactType: "Admissions",
      email: "admissions@ashshajrah.com",
      availableLanguage: ["English", "Urdu"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "304, Altura Arcade, Block F Markaz, B-17",
      addressLocality: "Islamabad",
      addressCountry: "PK",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
