export type EventItem = {
  id: string;
  facebookUrl: string;
  /** Local verified thumbnail under public/images/events — never use raw FB OG URLs */
  thumbnail: string;
  fit?: "cover" | "contain";
  date?: string;
  category: {
    en: string;
    ur: string;
  };
  title: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
  alt: {
    en: string;
    ur: string;
  };
};

/** Shown when a local thumbnail file is missing or fails to load */
export const EVENT_THUMBNAIL_FALLBACK = "/images/events/facebook-event-fallback.jpg";

/**
 * Ash-Shajrah Learning Hub Facebook event/post cards.
 * Thumbnails must be local files in public/images/events/.
 * Do not rely on Facebook Open Graph previews (often wrong/blocked).
 *
 * If a thumbnail file is missing, the UI shows a clean Facebook fallback card.
 */
export const EVENT_ITEMS: EventItem[] = [
  {
    id: "event-parenting-challenges",
    facebookUrl: "https://www.facebook.com/share/p/1D4ffUsfpu/",
    thumbnail: "/images/events/facebook-event-01.jpg",
    fit: "cover",
    category: {
      en: "Parent Workshop",
      ur: "والدین ورکشاپ",
    },
    title: {
      en: "Parenting Challenges Workshop",
      ur: "والدین کے چیلنجز ورکشاپ",
    },
    description: {
      en: "A parent guidance session on modern parenting challenges, child development, and practical family learning methods — featuring Azeem Siddiqui.",
      ur: "جدید والدین کے چیلنجز، بچوں کی نشوونما اور خاندانی تربیت کے عملی طریقوں پر رہنمائی نشست — عظیم صدیقی صاحب۔",
    },
    alt: {
      en: "Parenting challenges workshop event thumbnail",
      ur: "والدین کے چیلنجز ورکشاپ کا تھمب نیل",
    },
  },
  {
    id: "event-youth-character-tadreeb-2024",
    facebookUrl: "https://www.facebook.com/share/p/186Cu8JK1L/",
    thumbnail: "/images/events/facebook-event-02.jpg",
    fit: "cover",
    date: "Aug 2024",
    category: {
      en: "Teacher Training",
      ur: "تدریب المعلمین",
    },
    title: {
      en: "Youth of Today & Character Building",
      ur: "دورِ حاضر کا نوجوان اور اس کی کردار سازی",
    },
    description: {
      en: "At Tadreeb-ul-Muallimeen 2024 (8–10 Aug) at Jamia Tul Imam Noman Bin Sabit, Azeem Siddiqui guided teachers on understanding youth minds, psychology, and character-building amid modern technology challenges.",
      ur: "جامعۃ الامام نعمان بن ثابتؒ میں تدریب المعلمین 2024 (۸–۱۰ اگست) میں عظیم صدیقی صاحب نے اساتذہ کو دورِ حاضر کے نوجوان کی نفسیات، ٹیکنالوجی کے چیلنجز اور کردار سازی پر تفصیلی رہنمائی دی۔",
    },
    alt: {
      en: "Teacher training session on youth character building by Azeem Siddiqui",
      ur: "نوجوانوں کی کردار سازی پر تدریب المعلمین سیشن کا تھمب نیل",
    },
  },
  {
    id: "event-uniform-curriculum-seminar",
    facebookUrl: "https://www.facebook.com/share/p/1JiPKMAtF9/",
    thumbnail: "/images/events/facebook-event-03.jpg",
    fit: "contain",
    date: "27 Nov 2021",
    category: {
      en: "Online Seminar",
      ur: "آن لائن سیمینار",
    },
    title: {
      en: "Uniform Curriculum of Education: A Review",
      ur: "یکساں نصاب تعلیم: ایک جائزہ",
    },
    description: {
      en: "Online seminar (27 Nov 2021, 11:00–12:45) by the Department of Education, Jamaat-e-Islami Sindh. Speaker: Muhammad Azeem Siddiqui. Chief Guest: Muhammad Hussain Mehenti.",
      ur: "شعبہ تعلیم جماعت اسلامی صوبہ سندھ کا آن لائن سیمینار (۲۷ نومبر ۲۰۲۱، ۱۱:۰۰ تا ۱۲:۴۵)۔ مقرر: محمد عظیم صدیقی۔ مہمان خصوصی: محمد حسین محنتی۔",
    },
    alt: {
      en: "Uniform curriculum of education online seminar flyer",
      ur: "یکساں نصاب تعلیم آن لائن سیمینار کا پوسٹر",
    },
  },
  {
    id: "event-family-stability-seminar",
    facebookUrl: "https://www.facebook.com/share/p/1DawJTNPeK/",
    thumbnail: "/images/events/facebook-event-04.jpg",
    fit: "cover",
    category: {
      en: "Family Seminar",
      ur: "خاندانی سیمینار",
    },
    title: {
      en: "Stability of the Family Seminar",
      ur: "استحکامِ خاندان سیمینار",
    },
    description: {
      en: "Respected Azeem Siddiqui addressing a one-day Stability of the Family seminar organized by Islamic Research Academy Karachi.",
      ur: "محترم عظیم صدیقی اسلامک ریسرچ اکیڈمی کراچی کے زیر اہتمام ایک روزہ استحکامِ خاندان سیمینار سے مخاطب ہیں۔",
    },
    alt: {
      en: "Azeem Siddiqui speaking at Islamic Research Academy Karachi family seminar",
      ur: "اسلامک ریسرچ اکیڈمی کراچی میں استحکامِ خاندان سیمینار کا تھمب نیل",
    },
  },
  {
    id: "event-mission-curriculum",
    facebookUrl: "https://www.facebook.com/share/p/18xMEZ7fQr/",
    thumbnail: "/images/events/facebook-event-05.jpg",
    fit: "contain",
    date: "2023",
    category: {
      en: "Teacher Training",
      ur: "تدریب المعلمات",
    },
    title: {
      en: "Mission & Curriculum Alignment Workshop",
      ur: "مشن اور نصاب میں ہم آہنگی ورکشاپ",
    },
    description: {
      en: "Workshop at the Teachers Training & Principal Convention 2023 on aligning mission and curriculum — conducted by Azeem Siddiqui, under Jamiat-ul-Muhsanat Pakistan.",
      ur: "تدریب المعلمات و پرنسپل کنونشن ۲۰۲۳ میں مشن اور نصاب میں ہم آہنگی پر ورکشاپ — کنڈکٹر عظیم صدیقی صاحب، زیر اہتمام جامعات المحصنات پاکستان۔",
    },
    alt: {
      en: "Mission and curriculum alignment workshop at Teachers Training Convention 2023",
      ur: "تدریب المعلمات کنونشن ۲۰۲۳ میں مشن اور نصاب ورکشاپ کا تھمب نیل",
    },
  },
  {
    id: "event-youth-tech-challenges-tadreeb",
    facebookUrl: "https://www.facebook.com/share/p/1JjySWVEPC/",
    thumbnail: "/images/events/facebook-event-06.jpg",
    fit: "cover",
    category: {
      en: "Teacher Training",
      ur: "تدریب المعلمین",
    },
    title: {
      en: "Youth Training & Technology Challenges",
      ur: "نوجوانوں کی تربیت اور ٹیکنالوجی کے چیلنجز",
    },
    description: {
      en: "Day two of Teacher’s Training at Jamia Tul Imam Noman Bin Sabit — education expert Muhammad Azeem Siddiqui addressing trainees on youth training and technology challenges.",
      ur: "جامعۃ الامام نعمان بن ثابتؒ میں تدریب المعلمین کے دوسرے روز ماہرِ تعلیم محمد عظیم صدیقی صاحب شرکاء کو نوجوانوں کی تربیت اور ٹیکنالوجی کے چیلنجز سے آگاہ کر رہے ہیں۔",
    },
    alt: {
      en: "Azeem Siddiqui speaking on youth training and technology challenges",
      ur: "نوجوانوں کی تربیت اور ٹیکنالوجی کے چیلنجز پر تدریبی سیشن کا تھمب نیل",
    },
  },
];
