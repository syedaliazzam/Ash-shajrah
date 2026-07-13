export type WorkFit = "cover" | "contain";

export type WorkItem = {
  id: string;
  image: string;
  fit: WorkFit;
  category: { en: string; ur: string };
  title: { en: string; ur: string };
  description: { en: string; ur: string };
  details: { en: string; ur: string };
  alt: { en: string; ur: string };
};

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "student-guidance-character-session",
    image: "/images/works/student-guidance-character-session.jpg",
    fit: "contain",
    category: { en: "Student Guidance", ur: "طلبہ کی رہنمائی" },
    title: {
      en: "Student Guidance & Character Session",
      ur: "طلبہ کی رہنمائی اور کردار سازی کا سیشن",
    },
    description: {
      en: "A training workshop on the role of mental attitudes in performance for educators.",
      ur: "اساتذہ کے لیے کارکردگی میں ذہنی رویوں کے کردار پر تربیتی ورکشاپ۔",
    },
    details: {
      en: "This session explored how mindset, attitude, and character habits shape learning outcomes and professional performance in educational settings.",
      ur: "اس نشست میں زیر بحث آیا کہ ذہنی رویے، رویے اور کردار کی عادات تعلیمی ماحول میں سیکھنے کے نتائج اور پیشہ ورانہ کارکردگی کو کیسے متاثر کرتے ہیں۔",
    },
    alt: {
      en: "Student guidance and character development training workshop poster",
      ur: "طلبہ کی رہنمائی اور کردار سازی کے تربیتی ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "screen-addiction-family-training",
    image: "/images/works/screen-addiction-family-training.jpg",
    fit: "contain",
    category: { en: "Parent Guidance", ur: "والدین کی رہنمائی" },
    title: {
      en: "Overcoming Screen Addiction",
      ur: "اسکرین ایڈکشن سے بچاؤ",
    },
    description: {
      en: "A parent and child awareness session on healthy digital habits and balanced technology use.",
      ur: "صحت مند ڈیجیٹل عادات اور متوازن ٹیکنالوجی استعمال پر والدین اور بچوں کے لیے آگاہی نشست۔",
    },
    details: {
      en: "This session focused on screen addiction, early warning signs, family routines, and practical strategies for healthier digital habits.",
      ur: "اس نشست میں اسکرین ایڈکشن، ابتدائی علامات، خاندانی معمولات اور صحت مند ڈیجیٹل عادات کے عملی طریقوں پر توجہ دی گئی۔",
    },
    alt: {
      en: "Overcoming screen addiction family training session poster",
      ur: "اسکرین ایڈکشن سے بچاؤ کے خاندانی تربیتی سیشن کا پوسٹر",
    },
  },
  {
    id: "taleemi-soch-article",
    image: "/images/works/taleemi-soch-article.jpg",
    fit: "contain",
    category: { en: "Educational Insight", ur: "تعلیمی بصیرت" },
    title: {
      en: "Educational Mindset Article",
      ur: "تعلیمی سوچ اور ذہنی رویوں پر تحریر",
    },
    description: {
      en: "A reflective article on educational attitudes, integrity, and the mindset needed for meaningful learning.",
      ur: "تعلیمی رویوں، دیانت اور بامعنی سیکھنے کے لیے درکار ذہنیت پر ایک تفکر انگیز تحریر۔",
    },
    details: {
      en: "This piece highlights how educational culture, honesty, and thoughtful attitudes shape the quality of learning and student development.",
      ur: "اس تحریر میں اجاگر کیا گیا کہ تعلیمی ثقافت، دیانت اور سوچ سمجھ بوجھ والا رویہ سیکھنے کے معیار اور طلبہ کی نشوونما کو کیسے متاثر کرتا ہے۔",
    },
    alt: {
      en: "Educational mindset article graphic by Muhammad Azeem Siddiqui",
      ur: "محمد عظیم صدیقی کی تعلیمی سوچ پر تحریر کا گرافک",
    },
  },
  {
    id: "students-summer-camp-2023",
    image: "/images/works/students-summer-camp-2023.jpg",
    fit: "contain",
    category: { en: "Student Programs", ur: "طلبہ کے پروگرامز" },
    title: {
      en: "Students Summer Camp 2023",
      ur: "طلبہ سمر کیمپ 2023",
    },
    description: {
      en: "A summer camp combining personality grooming, study skills, and martial arts training for students.",
      ur: "طلبہ کے لیے شخصیت کی تشکیل، مطالعہ کی مہارتیں اور مارشل آرٹس تربیت کا مشترکہ سمر کیمپ۔",
    },
    details: {
      en: "The camp included sessions on time management, emotional growth, physical fitness, nutrition, and practical self-defense training.",
      ur: "کیمپ میں وقت کا انتظام، جذباتی نشوونما، جسمانی تندرستی، غذائیت اور عملی سیلف ڈیفنس تربیت کے سیشنز شامل تھے۔",
    },
    alt: {
      en: "Students summer camp 2023 promotional poster",
      ur: "طلبہ سمر کیمپ 2023 کا تشہیری پوسٹر",
    },
  },
  {
    id: "early-childhood-education-session",
    image: "/images/works/early-childhood-education-session.jpg",
    fit: "contain",
    category: { en: "Early Years", ur: "ابتدائی بچپن" },
    title: {
      en: "Early Childhood Education Session",
      ur: "ابتدائی بچپن کی تعلیم کا سیشن",
    },
    description: {
      en: "A professional development session on the importance and foundations of early childhood education.",
      ur: "ابتدائی بچپن کی تعلیم کی اہمیت اور بنیادی تقاضوں پر پیشہ ورانہ نشست۔",
    },
    details: {
      en: "This session addressed early years learning needs, school leadership, pre-primary teaching, and child-centered educational foundations.",
      ur: "اس نشست میں ابتدائی سالوں کی تعلیمی ضروریات، اسکول قیادت، پری پرائمری تدریس اور بچے مرکزی تعلیمی بنیادوں پر گفتگو ہوئی۔",
    },
    alt: {
      en: "Early childhood education training session poster",
      ur: "ابتدائی بچپن کی تعلیم کے تربیتی سیشن کا پوسٹر",
    },
  },
  {
    id: "mindfulness-workshop",
    image: "/images/works/mindfulness-workshop.jpg",
    fit: "contain",
    category: { en: "Personal Development", ur: "ذاتی نشوونما" },
    title: {
      en: "Mindfulness Workshop",
      ur: "مائنڈ فلنیس ورکشاپ",
    },
    description: {
      en: "A workshop on mindfulness, focus, emotional balance, and healthier daily living.",
      ur: "مائنڈ فلنیس، توجہ، جذباتی توازن اور صحت مند روزمرہ زندگی پر ورکشاپ۔",
    },
    details: {
      en: "Participants explored practical mindfulness tools to improve focus, reduce stress, and strengthen emotional resilience.",
      ur: "شرکاء نے توجہ بہتر بنانے، تناؤ کم کرنے اور جذباتی لچک مضبوط کرنے کے لیے عملی مائنڈ فلنیس ٹولز سیکھے۔",
    },
    alt: {
      en: "Mindfulness workshop promotional poster",
      ur: "مائنڈ فلنیس ورکشاپ کا تشہیری پوسٹر",
    },
  },
  {
    id: "emotional-health-workshop",
    image: "/images/works/emotional-health-workshop.jpg",
    fit: "contain",
    category: { en: "Youth Guidance", ur: "نوجوانوں کی رہنمائی" },
    title: {
      en: "Importance of Emotional Health",
      ur: "جذباتی صحت کی اہمیت",
    },
    description: {
      en: "A free training session for youth on emotional wellbeing and healthy self-expression.",
      ur: "نوجوانوں کے لیے جذباتی بہبود اور صحت مند اظہار پر مفت تربیتی نشست۔",
    },
    details: {
      en: "This youth-focused session highlighted emotional awareness, confidence, and positive coping habits for young learners.",
      ur: "اس نوجوانوں پر مبنی نشست میں جذباتی آگاہی، اعتماد اور مثبت نمٹنے کی عادات پر زور دیا گیا۔",
    },
    alt: {
      en: "Importance of emotional health youth workshop poster",
      ur: "جذباتی صحت کی اہمیت پر نوجوانوں کی ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "modern-parenting-challenges",
    image: "/images/works/modern-parenting-challenges.jpg",
    fit: "contain",
    category: { en: "Parent Guidance", ur: "والدین کی رہنمائی" },
    title: {
      en: "Challenges of Modern Parenting",
      ur: "جدید والدین کے چیلنجز",
    },
    description: {
      en: "Practical guidance for raising balanced, confident children in today's world.",
      ur: "آج کی دنیا میں متوازن اور پراعتماد بچوں کی تربیت کے لیے عملی رہنمائی۔",
    },
    details: {
      en: "The seminar addressed modern parenting pressures, effective upbringing, and building confident children with strong values.",
      ur: "سیمینار میں جدید والدین کے دباؤ، مؤثر تربیت اور مضبوط اقدار کے ساتھ پراعتماد بچوں کی پرورش پر گفتگو ہوئی۔",
    },
    alt: {
      en: "Challenges of modern parenting seminar poster",
      ur: "جدید والدین کے چیلنجز پر سیمینار کا پوسٹر",
    },
  },
  {
    id: "screen-addiction-workshop",
    image: "/images/works/screen-addiction-workshop.jpg",
    fit: "contain",
    category: { en: "Family Workshop", ur: "خاندانی ورکشاپ" },
    title: {
      en: "Screen Addiction Family Workshop",
      ur: "اسکرین ایڈکشن فیملی ورکشاپ",
    },
    description: {
      en: "A family-focused workshop on overcoming screen addiction and restoring healthy routines.",
      ur: "اسکرین ایڈکشن پر قابو پانے اور صحت مند معمولات بحال کرنے پر خاندانی ورکشاپ۔",
    },
    details: {
      en: "Parents learned to identify behavioral warning signs, introduce alternative activities, and rebuild natural family routines.",
      ur: "والدین نے رویے کی ابتدائی علامات پہچاننے، متبادل سرگرمیاں متعارف کرانے اور قدرتی خاندانی معمولات بحال کرنے کے طریقے سیکھے۔",
    },
    alt: {
      en: "Screen addiction family workshop poster",
      ur: "اسکرین ایڈکشن فیملی ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "educating-children-current-challenges",
    image: "/images/works/educating-children-current-challenges.jpg",
    fit: "contain",
    category: { en: "Parent Guidance", ur: "والدین کی رہنمائی" },
    title: {
      en: "Educating Children & Current Challenges",
      ur: "بچوں کی تربیت اور موجودہ چیلنجز",
    },
    description: {
      en: "An important seminar for parents on raising children amid today's social and digital challenges.",
      ur: "آج کے سماجی اور ڈیجیٹل چیلنجز کے دور میں بچوں کی تربیت پر والدین کے لیے اہم سیمینار۔",
    },
    details: {
      en: "This parent seminar explored current upbringing challenges, digital influences, and practical strategies for effective child education.",
      ur: "اس والدین سیمینار میں موجودہ تربیتی چیلنجز، ڈیجیٹل اثرات اور بچوں کی مؤثر تعلیم کے عملی طریقے زیر بحث آئے۔",
    },
    alt: {
      en: "Educating children and current challenges seminar poster",
      ur: "بچوں کی تربیت اور موجودہ چیلنجز پر سیمینار کا پوسٹر",
    },
  },
  {
    id: "effective-counseling-skills",
    image: "/images/works/effective-counseling-skills.jpg",
    fit: "contain",
    category: { en: "Professional Development", ur: "پیشہ ورانہ ترقی" },
    title: {
      en: "Effective Counseling Skills",
      ur: "مؤثر کونسلنگ کی مہارتیں",
    },
    description: {
      en: "A workshop for teachers, parents, and individuals to strengthen counseling and support skills.",
      ur: "اساتذہ، والدین اور افراد کے لیے کونسلنگ اور معاونت کی مہارتیں مضبوط کرنے کی ورکشاپ۔",
    },
    details: {
      en: "Participants learned empathy, communication techniques, behavior support strategies, and confidence-building approaches.",
      ur: "شرکاء نے ہمدردی، مواصلاتی تکنیکیں، رویے کی معاونت کے طریقے اور اعتماد بڑھانے کے نقطہ نظر سیکھے۔",
    },
    alt: {
      en: "Effective counseling skills workshop poster",
      ur: "مؤثر کونسلنگ کی مہارتوں پر ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "tameer-e-khandan-session",
    image: "/images/works/tameer-e-khandan-session.jpg",
    fit: "contain",
    category: { en: "Family Development", ur: "خاندانی نشوونما" },
    title: {
      en: "Tameer-e-Khandan Seminar",
      ur: "تعمیرِ خاندان سیمینار",
    },
    description: {
      en: "A seminar on building stronger family systems and healthier relationships at home.",
      ur: "گھر میں مضبوط خاندانی نظام اور صحت مند تعلقات کی تعمیر پر سیمینار۔",
    },
    details: {
      en: "This session guided families from broken routines toward stronger bonds, responsibility, and purposeful family life.",
      ur: "اس نشست میں خاندانوں کو بکھرتے معمولات سے مضبوط تعلقات، ذمہ داری اور بامقصد خاندانی زندگی کی طرف رہنمائی فراہم کی گئی۔",
    },
    alt: {
      en: "Tameer-e-Khandan family building seminar poster",
      ur: "تعمیرِ خاندان سیمینار کا پوسٹر",
    },
  },
  {
    id: "manage-your-studies-workshop",
    image: "/images/works/manage-your-studies-workshop.jpg",
    fit: "contain",
    category: { en: "Student Skills", ur: "طلبہ کی مہارتیں" },
    title: {
      en: "Manage Your Studies Effectively",
      ur: "اپنی پڑھائی مؤثر طریقے سے منظم کریں",
    },
    description: {
      en: "An interactive workshop for secondary students on study planning, focus, and exam confidence.",
      ur: "ثانوی طلبہ کے لیے مطالعہ کی منصوبہ بندی، توجہ اور امتحانی اعتماد پر تعاملی ورکشاپ۔",
    },
    details: {
      en: "Students learned time management, exam stress reduction, self-monitoring tools, and effective study strategies.",
      ur: "طلبہ نے وقت کا انتظام، امتحانی دباؤ میں کمی، خود نگرانی کے ٹولز اور مؤثر مطالعہ کی حکمت عملیاں سیکھیں۔",
    },
    alt: {
      en: "Manage your studies effectively workshop poster",
      ur: "مطالعہ مؤثر طریقے سے منظم کرنے کی ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "resilient-family-digital-age",
    image: "/images/works/resilient-family-digital-age.jpg",
    fit: "contain",
    category: { en: "Family Development", ur: "خاندانی نشوونما" },
    title: {
      en: "The Resilient Family",
      ur: "مضبوط خاندان",
    },
    description: {
      en: "A session on building strong families and healthy relationships in the digital age.",
      ur: "ڈیجیٹل دور میں مضبوط خاندان اور صحت مند تعلقات کی تعمیر پر نشست۔",
    },
    details: {
      en: "Families explored digital-age challenges, emotional bonding, resilience, and practical ways to stay connected with purpose.",
      ur: "خاندانوں نے ڈیجیٹل دور کے چیلنجز، جذباتی تعلق، لچک اور بامقصد جڑے رہنے کے عملی طریقے سیکھے۔",
    },
    alt: {
      en: "The resilient family in a digital age seminar poster",
      ur: "ڈیجیٹل دور میں مضبوط خاندان سیمینار کا پوسٹر",
    },
  },
  {
    id: "self-defense-fitness-training",
    image: "/images/works/self-defense-fitness-training.jpg",
    fit: "contain",
    category: { en: "Physical Training", ur: "جسمانی تربیت" },
    title: {
      en: "Self-Defense & Fitness Training",
      ur: "سیلف ڈیفنس اور فٹنس ٹریننگ",
    },
    description: {
      en: "A practical workshop on self-defense, fitness, and physical confidence for students.",
      ur: "طلبہ کے لیے سیلف ڈیفنس، فٹنس اور جسمانی اعتماد پر عملی ورکشاپ۔",
    },
    details: {
      en: "This interactive training covered warm-ups, martial arts basics, fitness routines, and practical self-defense skills.",
      ur: "اس تعاملی تربیت میں وارم اپ، مارشل آرٹس کی بنیادیں، فٹنس روٹینز اور عملی سیلف ڈیفنس مہارتیں شامل تھیں۔",
    },
    alt: {
      en: "Self-defense and fitness training seminar poster",
      ur: "سیلف ڈیفنس اور فٹنس تربیت کے سیمینار کا پوسٹر",
    },
  },
  {
    id: "hifz-quran-parent-workshop",
    image: "/images/works/hifz-quran-parent-workshop.jpg",
    fit: "contain",
    category: {
      en: "Parent Workshop",
      ur: "والدین ورکشاپ",
    },
    title: {
      en: "Hifz-e-Quran Opening & Parent Workshop",
      ur: "تقریب حفظِ قرآن اور والدین ورکشاپ",
    },
    description: {
      en: "A parent-focused workshop connected with Hifz-e-Quran learning, guidance, and children’s educational development.",
      ur: "حفظِ قرآن، والدین کی رہنمائی اور بچوں کی تعلیمی نشوونما سے متعلق ایک تربیتی ورکشاپ۔",
    },
    details: {
      en: "This work reflects guidance for parents on supporting children through Quranic learning, discipline, positive habits, and meaningful educational development.",
      ur: "یہ کام والدین کو بچوں کی قرآنی تعلیم، نظم و ضبط، مثبت عادات اور بامقصد تعلیمی نشوونما میں معاونت فراہم کرنے کی عکاسی کرتا ہے۔",
    },
    alt: {
      en: "Hifz-e-Quran opening and parent workshop poster",
      ur: "تقریب حفظِ قرآن اور والدین ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "educating-children-current-challenges-2021",
    image: "/images/works/educating-children-current-challenges-2021.jpg",
    fit: "contain",
    category: {
      en: "Parent Guidance",
      ur: "والدین کی رہنمائی",
    },
    title: {
      en: "Educating Children and Current Challenges",
      ur: "موجودہ چیلنجز کے ساتھ بچوں کی تربیت",
    },
    description: {
      en: "A training session for parents on raising and educating children in the face of modern challenges.",
      ur: "موجودہ دور کے چیلنجز میں بچوں کی تربیت اور تعلیم کے حوالے سے والدین کے لیے تربیتی نشست۔",
    },
    details: {
      en: "This session focused on parenting awareness, child education, family responsibility, and practical guidance for supporting children in a changing world.",
      ur: "اس نشست میں والدین کی آگاہی، بچوں کی تعلیم، خاندانی ذمہ داری اور بدلتے ہوئے دور میں بچوں کی معاونت کے عملی طریقوں پر توجہ دی گئی۔",
    },
    alt: {
      en: "Educating children and current challenges parent training poster",
      ur: "موجودہ چیلنجز کے ساتھ بچوں کی تربیت کا پوسٹر",
    },
  },
  {
    id: "stress-management-session",
    image: "/images/works/stress-management-session.jpg",
    fit: "contain",
    category: {
      en: "Personal Development",
      ur: "شخصی نشوونما",
    },
    title: {
      en: "Stress Management Session",
      ur: "اسٹریس مینجمنٹ سیشن",
    },
    description: {
      en: "An interactive session focused on managing stress, improving emotional balance, and building healthier routines.",
      ur: "ذہنی دباؤ کو کم کرنے، جذباتی توازن بہتر بنانے اور صحت مند معمولات اپنانے سے متعلق انٹرایکٹو نشست۔",
    },
    details: {
      en: "This session addressed stress awareness, emotional control, practical coping strategies, and guidance for improving personal wellbeing.",
      ur: "اس نشست میں ذہنی دباؤ کی آگاہی، جذباتی کنٹرول، عملی حکمت عملیوں اور ذاتی بہتری کی رہنمائی پر بات کی گئی۔",
    },
    alt: {
      en: "Stress management interactive session poster",
      ur: "اسٹریس مینجمنٹ انٹرایکٹو سیشن کا پوسٹر",
    },
  },
  {
    id: "sehat-mand-bachay-workshop",
    image: "/images/works/sehat-mand-bachay-workshop.jpg",
    fit: "contain",
    category: {
      en: "Parent Workshop",
      ur: "والدین ورکشاپ",
    },
    title: {
      en: "Sehat Mand Bachay aur Sehat Mand Gharana",
      ur: "صحت مند بچے اور صحت مند گھرانہ",
    },
    description: {
      en: "A parent workshop on children’s health, family wellbeing, and building positive home routines.",
      ur: "بچوں کی صحت، خاندانی بہتری اور مثبت گھریلو معمولات پر والدین کے لیے ورکشاپ۔",
    },
    details: {
      en: "This workshop focused on helping parents understand healthy child development, family habits, wellbeing, and the role of parents in creating a supportive home environment.",
      ur: "اس ورکشاپ میں بچوں کی صحت مند نشوونما، خاندانی عادات، فلاح و بہبود اور معاون گھریلو ماحول بنانے میں والدین کے کردار پر رہنمائی دی گئی۔",
    },
    alt: {
      en: "Sehat Mand Bachay aur Sehat Mand Gharana workshop poster",
      ur: "صحت مند بچے اور صحت مند گھرانہ ورکشاپ کا پوسٹر",
    },
  },
  {
    id: "parents-training-session-current-challenges",
    image: "/images/works/parents-training-session-current-challenges.jpg",
    fit: "contain",
    category: {
      en: "Parent Training",
      ur: "والدین کی تربیت",
    },
    title: {
      en: "Training Session for Parents",
      ur: "والدین کے لیے تربیتی سیشن",
    },
    description: {
      en: "A parent training session on educating children and responding to current challenges with awareness and responsibility.",
      ur: "بچوں کی تربیت اور موجودہ چیلنجز کا شعور و ذمہ داری کے ساتھ جواب دینے کے لیے والدین کی تربیتی نشست۔",
    },
    details: {
      en: "This work highlights structured parent guidance around child education, modern challenges, family responsibility, and practical parenting strategies.",
      ur: "یہ کام بچوں کی تعلیم، جدید چیلنجز، خاندانی ذمہ داری اور عملی والدین رہنمائی سے متعلق منظم تربیت کو ظاہر کرتا ہے۔",
    },
    alt: {
      en: "Training session for parents poster",
      ur: "والدین کے لیے تربیتی سیشن کا پوسٹر",
    },
  },
  {
    id: "green-flag-parent-workshop",
    image: "/images/works/green-flag-parent-workshop.jpg",
    fit: "contain",
    category: {
      en: "Parent Workshop",
      ur: "والدین ورکشاپ",
    },
    title: {
      en: "Green Flag Schools Parent Workshop",
      ur: "گرین فلیگ اسکولز والدین ورکشاپ",
    },
    description: {
      en: "A workshop for parents on healthy children, healthy families, values, and purposeful child development.",
      ur: "صحت مند بچوں، صحت مند خاندان، اقدار اور بامقصد نشوونما کے حوالے سے والدین کے لیے ورکشاپ۔",
    },
    details: {
      en: "This workshop reflects parent-focused educational training around children’s wellbeing, values, family role, and the importance of active parental involvement.",
      ur: "یہ ورکشاپ بچوں کی فلاح، اقدار، خاندان کے کردار اور والدین کی فعال شمولیت کی اہمیت پر مبنی تربیتی کام کو ظاہر کرتی ہے۔",
    },
    alt: {
      en: "Green Flag Schools parent workshop poster",
      ur: "گرین فلیگ اسکولز والدین ورکشاپ کا پوسٹر",
    },
  },
];
