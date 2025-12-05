
import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { Users, MapPin, Code, DollarSign, Search, BrainCircuit, Star, CalendarClock, Globe, X, Linkedin, MousePointerClick, BellRing, Building2, BadgeCheck, Camera, BarChart3, Target, Zap, Bookmark, Shapes, TrendingUp, Quote, LogOut, Menu, Sparkles, ChevronRight, ChevronLeft, Sliders, Mail, Lock, Plane, PenTool, Loader2, FileText, CheckCircle, AlertCircle, ArrowRight, Copy, Check } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPE DEFINITIONS ---
interface TalentProfile {
  id: number;
  name: string;
  title: string;
  location: string;
  experience: number;
  skills: string[];
  imageUrl: string;
  salaryExpectation: number; // Monthly in MAD
}

interface JobPosting {
  id: number;
  title: string;
  company: string;
  location:string;
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  companyLogoUrl: string;
  applicants: number;
  isFeatured?: boolean;
  status: 'published' | 'pending_review';
  description?: string;
  postedAt?: string;
  employmentType?: string;
  // New fields for Arbeitnow integration
  externalUrl?: string;
  isFourDayWorkWeek?: boolean;
  hasVisaSponsorship?: boolean;
  isNoWhiteboard?: boolean;
}

interface Flashcard {
  id: string; 
  question: string;
  answer: string;
  category: string;
}

interface Testimonial {
    id: number;
    name: string;
    newRole: string;
    quote: string;
    imageUrl: string;
    rating: number;
}

type View = 'TALENT' | 'JOBS' | 'SAVED' | 'SKILLS' | 'TOOLS';
type Language = 'FR' | 'EN' | 'AR';
type UserType = 'guest' | 'seeker' | 'company';


const TRENDING_THRESHOLD = 50;

// --- TRANSLATIONS ---
const translations = {
  FR: {
    appName: 'ITGenz',
    home: 'Accueil',
    trendingJobs: 'Emplois Tendances',
    findTalent: 'Candidats',
    findJobs: 'Emplois',
    savedJobs: 'Offres Enregistrées',
    skillsTest: 'Test de Compétences',
    careerTools: 'Outils Carrière',
    joinNow: 'Rejoindre',
    heroTagline: "Connecter les Meilleurs Talents IT du Maroc avec",
    heroDynamicTexts: ["les Leaders de l'Industrie.", "des Startups Innovantes.", "votre Équipe de Rêve."],
    searchPlaceholderKeyword: "Mot-clé, titre, compétence...",
    searchPlaceholderLocation: "Lieu (ex: Casablanca)",
    searchButton: "Rechercher",
    ctaFindJob: "Trouver un Emploi",
    ctaFindTalent: "Trouver des Talents",
    noResults: 'Aucun résultat trouvé pour',
    adjustSearch: 'Essayez d\'ajuster vos critères de recherche.',
    noSavedJobs: 'Vous n\'avez aucune offre enregistrée pour le moment.',
    browseJobs: 'Parcourir les offres',
    talentCard: {
      experience: 'ans d\'expérience',
      topSkills: 'Compétences clés',
      viewProfile: 'Voir le Profil',
      registerToView: "S'inscrire pour voir le profil",
      salaryExpectation: "Prétention Salariale",
    },
    jobCard: {
      requiredSkills: 'Compétences requises',
      applyNow: 'Postuler Maintenant',
      applyExternal: 'Postuler sur le site',
      saveJob: 'Enregistrer l\'offre',
      unsaveJob: 'Retirer l\'offre',
      featured: 'En Vedette',
      registerToApply: "S'inscrire pour postuler",
      viewDetails: "Voir Détails",
      badges: {
          visa: "Visa Sponsorisé",
          fourDay: "Semaine de 4 jours",
          noWhiteboard: "Pas de Whiteboard"
      }
    },
    filters: {
        title: "Filtres",
        skills: "Compétences (Sélectionner)",
        location: "Lieu",
        experience: "Expérience (Années Min)",
        salary: "Salaire Max (MAD)",
        clear: "Effacer tout",
        quick: {
            all: "Tout",
            remote: "Télétravail",
            senior: "Senior",
            junior: "Junior",
            fourDay: "4 Jours/Sem",
            visa: "Visa Sponsor",
            noWhiteboard: "No Whiteboard"
        }
    },
    jobDetails: {
        description: "Description du poste",
        posted: "Publié le",
        type: "Type de contrat",
        apply: "Postuler",
        applyExternal: "Postuler sur le site de l'entreprise"
    },
    whyUs: {
        title: "Pourquoi Choisir ITGenz ?",
        focusTitle: "Focus Exclusif sur l'IT Marocain",
        focusDesc: "Fatigué de parcourir des annonces non pertinentes ? ITGenz est conçu exclusivement pour le secteur IT dynamique du Maroc. Chaque connexion est pertinente, que vous soyez un développeur à Casablanca ou une entreprise fintech à Rabat.",
        qualityTitle: "Hub de Talents Qualifiés",
        qualityDesc: "Nous sommes plus qu'un simple site d'emploi. Chaque profil et chaque offre est examiné pour répondre à nos normes élevées. Dites adieu au spam et bonjour aux opportunités de qualité.",
        speedTitle: "Vitesse et Expertise Locale",
        speedDesc: "Notre expertise du marché marocain accélère le processus de recrutement de plusieurs semaines à quelques jours. Nous assurons une adéquation parfaite entre compétences, ambition et culture d'entreprise.",
    },
    featureSection: {
        title: "Pour les Chercheurs d'Emploi",
        subtitle: "Débloquez votre potentiel de carrière avec nos outils conçus pour vous.",
        easyApplyTitle: "Postulez Facilement",
        easyApplyDesc: "Processus de candidature simplifié en un clic pour ne manquer aucune opportunité.",
        smartAlertsTitle: "Alertes Intelligentes",
        smartAlertsDesc: "Recevez des notifications d'emploi personnalisées basées sur votre stack technique et votre lieu.",
        companyCultureTitle: "Culture d'Entreprise",
        companyCultureDesc: "Accédez à des profils d'employeurs détaillés et transparents pour trouver le bon environnement."
    },
    featureSectionCompanies: {
        title: "Pour les Entreprises",
        subtitle: "Constituez votre équipe de rêve avec nos puissants outils de recrutement.",
        verifiedTalentTitle: "Talents Vérifiés",
        verifiedTalentDesc: "Accédez à notre base de données de professionnels IT marocains présélectionnés et prêts pour leur prochain défi.",
        employerBrandingTitle: "Marque Employeur",
        employerBrandingDesc: "Mettez en valeur votre culture d'entreprise avec des profils riches, incluant vidéos et photos, pour attirer les bons talents.",
        performanceAnalyticsTitle: "Analyses de Performance",
        performanceAnalyticsDesc: "Suivez les vues des offres d'emploi et la qualité des candidatures avec un tableau de bord analytique simple et intuitif."
    },
    skillsTestTitle: 'Affûtez Vos Connaissances Tech',
    skillsTestSubtitle: 'Sélectionnez un sujet ou générez de nouvelles questions avec l\'IA.',
    nextCard: 'Suivant',
    prevCard: 'Précédent',
    flipCard: 'Cliquez pour retourner',
    generateAI: 'Générer avec IA',
    backToJobs: 'Retour aux Emplois',
    hotJobs: {
      title: 'Dernières Opportunités'
    },
    testimonials: {
        title: "Ils ont trouvé leur job de rêve",
        subtitle: "Découvrez les histoires de nos talents qui ont décroché des postes incroyables grâce à ITGenz."
    },
    footer: {
      copyright: "Tous Droits Réservés.",
      tagline: "Connecter la Nouvelle Génération IT du Maroc.",
    },
    modal: {
      joinTitle: "Rejoindre ITGenz",
      joinSubtitle: "Créez votre compte gratuit aujourd'hui",
      iAmJobSeeker: "Je suis Candidat",
      iAmCompany: "Je suis Recruteur",
      email: "Adresse Email",
      password: "Mot de passe",
      or: "Ou",
      continueWithLinkedin: "Continuer avec LinkedIn",
      createAccount: "Créer un compte",
      alreadyMember: "Déjà membre ?",
      login: "Se connecter",
      seekerStep1: "Créez votre profil de talent",
      seekerStep1Sub: "Rejoignez-nous via les réseaux sociaux pour commencer.",
      signupGoogle: "S'inscrire avec Google",
      signupLinkedin: "S'inscrire avec LinkedIn",
      seekerStep2: "Complétez votre profil",
      seekerStep2Sub: "Générez votre avatar unique et dites-nous qui vous êtes.",
      fullName: "Nom Complet",
      jobTitle: "Titre du Poste (ex: Développeur Frontend)",
      generateAvatar: "Générer votre Avatar",
      createProfile: "Créer le Profil",
      companyTitle: "Enregistrez votre Entreprise",
      companySub: "Commencez à recruter les meilleurs talents.",
      companyName: "Nom de l'entreprise",
      companyEmail: "Email de l'entreprise",
      registerCompany: "Enregistrer l'Entreprise",
      companyReviewTitle: "Inscription Réussie !",
      companyReviewSub: "Merci ! Pour garantir la qualité, toutes les offres d'emploi que vous publiez seront examinées par notre équipe avant d'être mises en ligne. Cela ne prend généralement que quelques heures.",
      gotIt: "D'accord, j'ai compris !",
    },
    header: {
        logout: "Déconnexion",
        companyView: "Vue Entreprise",
        seekerView: "Vue Talent",
        menu: "Menu",
        forEmployers: "Recruter"
    },
    tools: {
      title: "Boîte à Outils Carrière",
      subtitle: "Optimisez votre profil et découvrez votre valeur sur le marché.",
      resumeMatcher: "Analyseur de CV (IA)",
      resumeDesc: "Collez votre CV et une offre d'emploi pour voir si vous correspondez.",
      salaryInsights: "Tendances Salariales",
      salaryDesc: "Découvrez les moyennes salariales pour les postes tech au Maroc.",
      coverLetter: "Générateur de Lettre de Motivation",
      coverLetterDesc: "Créez une lettre de motivation personnalisée en quelques secondes.",
      pasteResume: "Collez votre CV ici",
      pasteJob: "Collez la description du poste ici",
      analyze: "Analyser la correspondance",
      analyzing: "Analyse en cours...",
      score: "Score de correspondance",
      missingKeywords: "Mots-clés manquants",
      tips: "Conseils d'amélioration",
      jobRole: "Poste",
      junior: "Junior (0-2 ans)",
      mid: "Intermédiaire (2-5 ans)",
      senior: "Senior (5+ ans)",
      generateLetter: "Générer la Lettre",
      generating: "Rédaction en cours...",
      yourName: "Votre Nom",
      targetCompany: "Entreprise Ciblée",
      keySkills: "Vos Compétences Clés",
      copyText: "Copier le texte",
      copied: "Copié !"
    }
  },
  EN: {
    appName: 'ITGenz',
    home: 'Home',
    trendingJobs: 'Trending Jobs',
    findTalent: 'Candidates',
    findJobs: 'Jobs',
    savedJobs: 'Saved Jobs',
    skillsTest: 'Skills Test',
    careerTools: 'Career Tools',
    joinNow: 'Join Now',
    heroTagline: "Connecting Morocco's Top IT Talent with",
    heroDynamicTexts: ["Industry Leaders.", "Innovative Startups.", "Your Dream Team."],
    searchPlaceholderKeyword: "Keyword, title, skill...",
    searchPlaceholderLocation: "Location (e.g., Casablanca)",
    searchButton: "Search",
    ctaFindJob: "Find a Job",
    ctaFindTalent: "Find Talent",
    noResults: 'No results found for',
    adjustSearch: 'Try adjusting your search criteria.',
    noSavedJobs: 'You have no saved jobs yet.',
    browseJobs: 'Browse Jobs',
    talentCard: {
      experience: 'years of experience',
      topSkills: 'Top Skills',
      viewProfile: 'View Profile',
      registerToView: "Register to View Profile",
      salaryExpectation: "Salary Expectation",
    },
    jobCard: {
      requiredSkills: 'Required Skills',
      applyNow: 'Apply Now',
      applyExternal: 'Apply on Site',
      saveJob: 'Save Job',
      unsaveJob: 'Unsave Job',
      featured: 'Featured',
      registerToApply: 'Register to Apply',
      viewDetails: "View Details",
      badges: {
          visa: "Visa Sponsorship",
          fourDay: "4-Day Week",
          noWhiteboard: "No Whiteboard"
      }
    },
    filters: {
        title: "Filters",
        skills: "Skills (Select)",
        location: "Location",
        experience: "Experience (Min Years)",
        salary: "Max Salary (MAD)",
        clear: "Clear All",
        quick: {
            all: "All",
            remote: "Remote",
            senior: "Senior",
            junior: "Junior",
            fourDay: "4 Day Week",
            visa: "Visa Sponsor",
            noWhiteboard: "No Whiteboard"
        }
    },
    jobDetails: {
        description: "Job Description",
        posted: "Posted on",
        type: "Employment Type",
        apply: "Apply for this Job",
        applyExternal: "Apply on Company Site"
    },
     whyUs: {
        title: "Why Choose ITGenz?",
        focusTitle: "Exclusive Moroccan IT Focus",
        focusDesc: "Tired of sifting through irrelevant listings? ITGenz is built exclusively for Morocco's vibrant IT sector. Every connection is relevant, whether you're a developer in Casablanca or a fintech company in Rabat.",
        qualityTitle: "Curated Talent Hub",
        qualityDesc: "We're more than a job board; we're a curated hub. Every profile and posting is reviewed to meet our high standards. Say goodbye to spam and hello to quality opportunities.",
        speedTitle: "Speed & Local Expertise",
        speedDesc: "Our deep local expertise accelerates the hiring process from weeks to days. We understand the nuances of the Moroccan market, ensuring a perfect match of skills, ambition, and company culture.",
    },
    featureSection: {
        title: "For Job Seekers",
        subtitle: "Unlock your career potential with our powerful tools.",
        easyApplyTitle: "Easy Apply",
        easyApplyDesc: "Streamlined one-click application process so you never miss an opportunity.",
        smartAlertsTitle: "Smart Alerts",
        smartAlertsDesc: "Personalized job notifications based on your Tech Stack and Location.",
        companyCultureTitle: "Company Culture",
        companyCultureDesc: "Get access to detailed, transparent employer profiles to find the right fit."
    },
    featureSectionCompanies: {
        title: "For Companies",
        subtitle: "Build your dream team with our powerful recruiting tools.",
        verifiedTalentTitle: "Verified Talent",
        verifiedTalentDesc: "Access our curated database of pre-vetted Moroccan IT professionals ready for their next challenge.",
        employerBrandingTitle: "Employer Branding",
        employerBrandingDesc: "Showcase your company culture with rich profiles, including videos and photos, to attract the right talent.",
        performanceAnalyticsTitle: "Performance Analytics",
        performanceAnalyticsDesc: "Track job post views and applicant quality with a simple, intuitive analytics dashboard."
    },
    skillsTestTitle: 'Sharpen Your Tech Knowledge',
    skillsTestSubtitle: 'Select a topic or generate new questions with AI.',
    nextCard: 'Next',
    prevCard: 'Prev',
    flipCard: 'Click to flip',
    generateAI: 'Generate with AI',
    backToJobs: 'Back to Jobs',
    hotJobs: {
      title: 'Latest Opportunities'
    },
    testimonials: {
        title: "They Found Their Dream Job",
        subtitle: "Discover the stories of our talents who have landed incredible roles through ITGenz."
    },
    footer: {
      copyright: "All Rights Reserved.",
      tagline: "Connecting Morocco's New IT Generation.",
    },
     modal: {
      joinTitle: "Join ITGenz",
      joinSubtitle: "Create your free account today",
      iAmJobSeeker: "I am a Job Seeker",
      iAmCompany: "I am a Recruiter",
      email: "Email Address",
      password: "Password",
      or: "Or",
      continueWithLinkedin: "Continue with LinkedIn",
      createAccount: "Create Account",
      alreadyMember: "Already a member?",
      login: "Log In",
      seekerStep1: "Create your talent profile",
      seekerStep1Sub: "Join via social networks to get started.",
      signupGoogle: "Sign up with Google",
      signupLinkedin: "Sign up with LinkedIn",
      seekerStep2: "Complete your profile",
      seekerStep2Sub: "Generate your unique avatar and tell us who you are.",
      fullName: "Full Name",
      jobTitle: "Job Title (e.g., Frontend Developer)",
      generateAvatar: "Generate Your Avatar",
      createProfile: "Create Profile",
      companyTitle: "Register your Company",
      companySub: "Start recruiting top-tier talent.",
      companyName: "Company Name",
      companyEmail: "Company Email",
      registerCompany: "Register Company",
      companyReviewTitle: "Registration Successful!",
      companyReviewSub: "Thank you! To ensure quality, any job you post will be reviewed by our team before going live. This usually takes just a few hours.",
      gotIt: "Okay, got it!",
    },
    header: {
        logout: "Logout",
        companyView: "Company View",
        seekerView: "Talent View",
        menu: "Menu",
        forEmployers: "For Employers"
    },
    tools: {
      title: "Career Toolkit",
      subtitle: "Optimize your profile and understand your market value.",
      resumeMatcher: "AI Resume Scanner",
      resumeDesc: "Paste your resume and a job description to see if you're a match.",
      salaryInsights: "Salary Trends",
      salaryDesc: "Explore average salaries for tech roles in Morocco.",
      coverLetter: "Cover Letter Generator",
      coverLetterDesc: "Create a tailored cover letter in seconds.",
      pasteResume: "Paste your resume here",
      pasteJob: "Paste the job description here",
      analyze: "Analyze Match",
      analyzing: "Analyzing...",
      score: "Match Score",
      missingKeywords: "Missing Keywords",
      tips: "Improvement Tips",
      jobRole: "Job Role",
      junior: "Junior (0-2y)",
      mid: "Mid (2-5y)",
      senior: "Senior (5+y)",
      generateLetter: "Generate Letter",
      generating: "Writing...",
      yourName: "Your Name",
      targetCompany: "Target Company",
      keySkills: "Your Key Skills/Experience",
      copyText: "Copy Text",
      copied: "Copied!"
    }
  },
  AR: {
    appName: 'ITGenz',
    home: 'الرئيسية',
    trendingJobs: 'الوظائف الشائعة',
    findTalent: 'المرشحون',
    findJobs: 'الوظائف',
    savedJobs: 'الوظائف المحفوظة',
    skillsTest: 'اختبار المهارات',
    careerTools: 'أدوات المهنة',
    joinNow: 'انضم الآن',
    heroTagline: "ربط أفضل مواهب تكنولوجيا المعلومات في المغرب مع",
    heroDynamicTexts: ["رواد الصناعة.", "الشركات الناشئة المبتكرة.", "فريق أحلامك."],
    searchPlaceholderKeyword: "كلمة مفتاحية، منصب، مهارة...",
    searchPlaceholderLocation: "الموقع (مثال: الدار البيضاء)",
    searchButton: "بحث",
    ctaFindJob: "البحث عن وظيفة",
    ctaFindTalent: "البحث عن مواهب",
    noResults: 'لم يتم العثور على نتائج لـ',
    adjustSearch: 'حاول تعديل معايير البحث.',
    noSavedJobs: 'ليس لديك أي وظائف محفوظة حتى الآن.',
    browseJobs: 'تصفح الوظائف',
    talentCard: {
      experience: 'سنوات من الخبرة',
      topSkills: 'أبرز المهارات',
      viewProfile: 'عرض الملف الشخصي',
      registerToView: "سجل لعرض الملف الشخصي",
      salaryExpectation: "توقعات الراتب",
    },
    jobCard: {
      requiredSkills: 'المهارات المطلوبة',
      applyNow: 'قدم الآن',
      applyExternal: 'قدم على الموقع',
      saveJob: 'حفظ الوظيف',
      unsaveJob: 'إلغاء حفظ الوظيفة',
      featured: 'مميزة',
      registerToApply: "سجل للتقديم",
      viewDetails: "عرض التفاصيل",
      badges: {
          visa: "رعاية التأشيرة",
          fourDay: "أسبوع 4 أيام",
          noWhiteboard: "بدون سبورة بيضاء"
      }
    },
    filters: {
        title: "عوامل التصفية",
        skills: "المهارات (تحديد)",
        location: "الموقع",
        experience: "الخبرة (سنوات كحد أدنى)",
        salary: "الراتب الأقصى (درهم)",
        clear: "مسح الكل",
        quick: {
            all: "الكل",
            remote: "عن بعد",
            senior: "خبير",
            junior: "مبتدئ",
            fourDay: "4 أيام عمل",
            visa: "رعاية الفيزا",
            noWhiteboard: "بدون سبورة"
        }
    },
    jobDetails: {
        description: "وصف الوظيفة",
        posted: "نشر في",
        type: "نوع الوظيفة",
        apply: "قدم لهذه الوظيفة",
        applyExternal: "التقديم على موقع الشركة"
    },
    whyUs: {
        title: "لماذا تختار ITGenz؟",
        focusTitle: "تركيز حصري على تكنولوجيا المعلومات في المغرب",
        focusDesc: "هل سئمت من تصفح القوائم غير ذات الصلة؟ ITGenz مصمم حصريًا لقطاع تكنولوجيا المعلومات النابض بالحياة في المغرب. كل تواصل له أهميته، سواء كنت مطورًا في الدار البيضاء أو شركة تكنولوجيا مالية في الرباط.",
        qualityTitle: "مركز للمواهب المنسقة",
        qualityDesc: "نحن أكثر من مجرد موقع توظيف، بل مركز منسق بعناية. تتم مراجعة كل ملف شخصي وإعلان وظيفة لتلبية معاييرنا العالية. قل وداعًا للرسائل المزعجة ومرحبًا بالفرص النوعية.",
        speedTitle: "السرعة والخبرة المحلية",
        speedDesc: "خبرتنا المحلية العميقة تسرّع عملية التوظيف من أسابيع إلى أيام. نحن نتفهم تفاصيل السوق المغربي، مما يضمن تطابقًا مثاليًا للمهارات والطموح وثقافة الشركة.",
    },
    featureSection: {
        title: "للباحثين عن عمل",
        subtitle: "أطلق العنان لإمكانياتك المهنية بأدواتنا المصممة خصيصًا لك.",
        easyApplyTitle: "تقديم سهل",
        easyApplyDesc: "عملية تقديم مبسطة بنقرة واحدة حتى لا تفوت أي فرصة.",
        smartAlertsTitle: "تنبيهات ذكية",
        smartAlertsDesc: "احصل على إشعارات وظائف مخصصة بناءً على مجموعتك التقنية وموقعك.",
        companyCultureTitle: "ثقافة الشركة",
        companyCultureDesc: "اطلع على ملفات تعريفية مفصلة وشفافة لأصحاب العمل للعثور على ما يناسبك."
    },
    featureSectionCompanies: {
        title: "للشركات",
        subtitle: "ابنِ فريق أحلامك بأدوات التوظيف القوية التي نوفرها.",
        verifiedTalentTitle: "مواهب موثوقة",
        verifiedTalentDesc: "تمتع بالوصول إلى قاعدة بياناتنا المنسقة من محترفي تكنولوجيا المعلومات المغاربة الذين تم فحصهم مسبقًا والمستعدين لتحديهم التالي.",
        employerBrandingTitle: "العلامة التجارية لصاحب العمل",
        employerBrandingDesc: "اعرض ثقافة شركتك بملفات تعريفية غنية، بما في ذلك مقاطع الفيديو والصور، لجذب المواهب المناسبة.",
        performanceAnalyticsTitle: "تحليلات الأداء",
        performanceAnalyticsDesc: "تتبع مشاهدات منشورات الوظائف وجودة المتقدمين باستخدام لوحة تحكم تحليلية بسيطة وبديهية."
    },
    skillsTestTitle: 'اصقل معرفتك التقنية',
    skillsTestSubtitle: 'حدد موضوعًا أو قم بتوليد أسئلة جديدة باستخدام الذكاء الاصطناعي.',
    nextCard: 'التالي',
    prevCard: 'سابق',
    flipCard: 'انقر للقلب',
    generateAI: 'توليد بالذكاء الاصطناعي',
    backToJobs: 'العودة إلى الوظائف',
    hotJobs: {
      title: 'أحدث الفرص'
    },
    testimonials: {
        title: "لقد وجدوا وظيفة أحلامهم",
        subtitle: "اكتشف قصص مواهبنا الذين حصلوا على أدوار رائعة من خلال ITGenz."
    },
    footer: {
      copyright: "كل الحقوق محفوظة.",
      tagline: "نصل الجيل الجديد من تكنولوجيا المعلومات في المغرب.",
    },
    modal: {
      joinTitle: "انضم إلى ITGenz",
      joinSubtitle: "أنشئ حسابك المجاني اليوم",
      iAmJobSeeker: "أنا باحث عن عمل",
      iAmCompany: "أنا موظِّف",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      or: "أو",
      continueWithLinkedin: "الاستمرار باستخدام LinkedIn",
      createAccount: "إنشاء حساب",
      alreadyMember: "عضو بالفعل؟",
      login: "تسجيل الدخول",
      seekerStep1: "أنشئ ملفك الشخصي",
      seekerStep1Sub: "انضم عبر الشبكات الاجتماعية للبدء.",
      signupGoogle: "التسجيل عبر جوجل",
      signupLinkedin: "التسجيل عبر لينكدإن",
      seekerStep2: "أكمل ملفك الشخصي",
      seekerStep2Sub: "أنشئ صورتك الرمزية الفريدة وأخبرنا من أنت.",
      fullName: "الاسم الكامل",
      jobTitle: "المسمى الوظيفي (مثال: مطور واجهة أمامية)",
      generateAvatar: "أنشئ صورتك الرمزية",
      createProfile: "إنشاء الملف الشخصي",
      companyTitle: "سجل شركتك",
      companySub: "ابدأ في توظيف أفضل المواهب.",
      companyName: "اسم الشركة",
      companyEmail: "البريد الإلكتروني للشركة",
      registerCompany: "تسجيل الشركة",
      companyReviewTitle: "تم التسجيل بنجاح!",
      companyReviewSub: "شكرا لك! لضمان الجودة، ستتم مراجعة أي وظيفة تنشرها من قبل فريقنا قبل نشرها. يستغرق هذا عادة بضع ساعات فقط.",
      gotIt: "حسنًا، فهمت!",
    },
    header: {
        logout: "تسجيل الخروج",
        companyView: "عرض الشركة",
        seekerView: "عرض المواهب",
        menu: "القائمة",
        forEmployers: "لأصحاب العمل"
    },
    tools: {
      title: "أدوات المهنة",
      subtitle: "حسّن ملفك الشخصي وافهم قيمتك السوقية.",
      resumeMatcher: "فحص السيرة الذاتية (ذكاء اصطناعي)",
      resumeDesc: "الصق سيرتك الذاتية والوصف الوظيفي لمعرفة مدى التوافق.",
      salaryInsights: "اتجاهات الرواتب",
      salaryDesc: "اكتشف متوسط الرواتب للأدوار التقنية في المغرب.",
      coverLetter: "مولد خطاب التغطية",
      coverLetterDesc: "أنشئ خطاب تغطية مخصصًا في ثوانٍ.",
      pasteResume: "الصق سيرتك الذاتية هنا",
      pasteJob: "الصق الوصف الوظيفي هنا",
      analyze: "تحليل المطابقة",
      analyzing: "جارٍ التحليل...",
      score: "درجة المطابقة",
      missingKeywords: "كلمات مفتاحية مفقودة",
      tips: "نصائح للتحسين",
      jobRole: "المسمى الوظيفي",
      junior: "مبتدئ (0-2 سنوات)",
      mid: "متوسط (2-5 سنوات)",
      senior: "خبير (5+ سنوات)",
      generateLetter: "توليد الخطاب",
      generating: "جارٍ الكتابة...",
      yourName: "اسمك",
      targetCompany: "الشركة المستهدفة",
      keySkills: "مهاراتك الرئيسية",
      copyText: "نسخ النص",
      copied: "تم النسخ!"
    }
  }
};


// --- FLASHCARD DATA ---
const INITIAL_FLASHCARDS: Flashcard[] = [
  // React
  { id: '1', category: 'React', question: 'What is the Virtual DOM?', answer: 'The Virtual DOM is a lightweight copy of the real DOM. React updates the Virtual DOM first, compares it with the previous version (diffing), and only updates the real DOM where necessary (reconciliation), ensuring high performance.' },
  { id: '2', category: 'React', question: 'What are React Hooks?', answer: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components. Examples include useState, useEffect, and useContext.' },
  { id: '3', category: 'React', question: 'Explain Prop Drilling.', answer: 'Prop drilling is the process of passing data from a parent component down to deep child components through intermediate components that do not need the data themselves. Context API or Redux can solve this.' },
  { id: 'react-4', category: 'React', question: 'What is the useMemo hook used for?', answer: 'useMemo is used to memoize expensive calculations so that they are not re-computed on every render unless the dependencies change. It helps optimize performance.' },
  { id: 'react-5', category: 'React', question: 'What is the difference between state and props?', answer: 'Props are inputs passed to components and are immutable (read-only), while State is managed within the component and can change over time.' },
  { id: 'react-6', category: 'React', question: 'What is the useEffect dependency array?', answer: 'The dependency array controls when the useEffect hook runs. If empty [], it runs once on mount. If [prop], it runs when "prop" changes. If omitted, it runs on every render.' },

  // Node.js
  { id: '4', category: 'Node.js', question: 'What is the Event Loop?', answer: 'The Event Loop is a mechanism that allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible, handling callbacks when operations complete.' },
  { id: '5', category: 'Node.js', question: 'Difference between process.nextTick() and setImmediate()?', answer: 'process.nextTick() fires immediately on the same phase of the event loop, before any I/O events. setImmediate() fires on the following iteration or "tick" of the event loop.' },
  { id: 'node-6', category: 'Node.js', question: 'What is middleware in Express.js?', answer: 'Middleware functions have access to the request (req) and response (res) objects. They can execute code, modify requests, and end the request-response cycle or call the next middleware.' },
  { id: 'node-7', category: 'Node.js', question: 'Explain the difference between require() and import.', answer: 'require() is CommonJS (synchronous, used in older Node), while import is ES Modules (asynchronous, standard in modern JS/Node).' },
  { id: 'node-8', category: 'Node.js', question: 'What are Streams in Node.js?', answer: 'Streams are objects that let you read data from a source or write data to a destination in continuous chunks, which is efficient for handling large files.' },

  // Python
  { id: '6', category: 'Python', question: 'What is a decorator in Python?', answer: 'A decorator is a design pattern in Python that allows a user to add new functionality to an existing object without modifying its structure. It is usually called before the definition of a function you want to decorate.' },
  { id: '7', category: 'Python', question: 'Explain list comprehension.', answer: 'List comprehension offers a shorter syntax when you want to create a new list based on the values of an existing list. Example: [x for x in fruits if "a" in x]' },
  { id: 'py-8', category: 'Python', question: 'What is the difference between deep copy and shallow copy?', answer: 'A shallow copy constructs a new compound object and inserts references into it. A deep copy constructs a new compound object and recursively inserts copies of the objects found in the original.' },
  { id: 'py-9', category: 'Python', question: 'What is the Global Interpreter Lock (GIL)?', answer: 'The GIL is a mutex that allows only one thread to hold the control of the Python interpreter, effectively making single-threaded execution for CPU-bound tasks.' },
  { id: 'py-10', category: 'Python', question: 'What are Python generators?', answer: 'Generators are functions that return an iterator using the Yield keyword. They allow you to declare a function that behaves like an iterator, providing a faster way to create iterators.' },

  // AWS
  { id: '8', category: 'AWS', question: 'What is an S3 bucket?', answer: 'Amazon S3 (Simple Storage Service) is an object storage service. A bucket is a container for objects (files) stored in S3.' },
  { id: '9', category: 'AWS', question: 'Explain the difference between EC2 and Lambda.', answer: 'EC2 provides resizable computing capacity (virtual servers) where you manage the OS and environment. Lambda is serverless computing where you run code in response to events without managing servers.' },
  { id: 'aws-10', category: 'AWS', question: 'What is IAM?', answer: 'Identity and Access Management (IAM) is a web service that helps you securely control access to AWS resources using Users, Groups, Roles, and Policies.' },
  { id: 'aws-11', category: 'AWS', question: 'What is VPC peering?', answer: 'VPC peering is a networking connection between two VPCs that enables you to route traffic between them using private IPv4 addresses or IPv6 addresses.' },

  // DevOps
  { id: '10', category: 'DevOps', question: 'What is CI/CD?', answer: 'CI/CD stands for Continuous Integration and Continuous Delivery/Deployment. It bridges the gap between development and operation activities by enforcing automation in building, testing, and deploying applications.' },
  { id: 'dev-11', category: 'DevOps', question: 'What is a Docker container?', answer: 'A Docker container is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings.' },
  { id: 'dev-12', category: 'DevOps', question: 'What is Infrastructure as Code (IaC)?', answer: 'IaC is the managing and provisioning of computer data centers through machine-readable definition files (like Terraform or CloudFormation), rather than physical hardware configuration.' },
  
  // SQL
  { id: 'sql-1', category: 'SQL', question: 'What is the difference between WHERE and HAVING?', answer: 'WHERE clause is used to filter records before any groupings are made. HAVING clause is used to filter values from a group (used with GROUP BY).' },
  { id: 'sql-2', category: 'SQL', question: 'What are the types of JOINs?', answer: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN are the main types used to combine rows from two or more tables.' },
  { id: 'sql-3', category: 'SQL', question: 'What is an Index?', answer: 'An index is a performance-tuning method of allowing faster retrieval of records. An index creates an entry for each value and it will be faster to retrieve data.' },

  // JavaScript
  { id: 'js-1', category: 'JavaScript', question: 'What is a closure?', answer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you access to an outer function’s scope from an inner function.' },
  { id: 'js-2', category: 'JavaScript', question: 'Explain "this" keyword.', answer: 'The "this" keyword refers to the object it belongs to. In a method, it refers to the owner object. Alone, it refers to the global object. In a function, it refers to the global object (or undefined in strict mode).' },
];

const TESTIMONIALS_DATA: Testimonial[] = [
    { id: 1, name: 'Youssef El Amrani', newRole: 'Cloud Engineer @ AWS Maroc', quote: 'ITGenz connected me with an opportunity that perfectly matched my skills. The process was incredibly fast and transparent!', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Youssef', rating: 5 },
    { id: 2, name: 'Fatima Zahra', newRole: 'Lead Product Designer @ Creative Minds', quote: 'I found a company with a fantastic culture that values design. I couldn\'t have asked for a better fit. Thank you, ITGenz!', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fatima', rating: 5 },
    { id: 3, name: 'Amine Cherkaoui', newRole: 'Data Analyst @ Insight Corp', quote: 'The platform is focused, easy to use, and directly led to my dream job in data analytics. Highly recommended for any IT professional in Morocco.', imageUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amine', rating: 5 },
];


// --- REUSABLE UI COMPONENTS ---

const SkillBadge: FC<{ skill: string }> = ({ skill }) => (
  <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
    {skill}
  </span>
);

const IconText: FC<{ icon: React.ElementType, text: string | number, className?: string }> = ({ icon: Icon, text, className = '' }) => (
  <div className={`flex items-center text-sm text-gray-500 ${className}`}>
    <Icon className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
    <span>{text}</span>
  </div>
);

// --- Animated Logo Component ---
const AnimatedLogo: FC = () => (
  <div className="relative w-8 h-8" aria-label="ITGenz animated logo">
    <Shapes className="absolute w-full h-full text-gray-800 animate-spin-slow" />
    <Shapes className="absolute w-full h-full text-amber-500 animate-spin-slow-reverse" />
  </div>
);

// --- CAREER TOOLS COMPONENTS ---

const ResumeMatcherComponent: FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang].tools;
    const [resume, setResume] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!resume.trim() || !jobDesc.trim()) return;
        setIsAnalyzing(true);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `
                Act as an ATS (Applicant Tracking System) expert. Compare the following Resume and Job Description.
                Resume: "${resume.substring(0, 3000)}"
                Job Description: "${jobDesc.substring(0, 3000)}"
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            missingKeywords: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING }
                            },
                            tips: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });

            const text = response.text || "{}";
            setResult(JSON.parse(text));

        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t.resumeMatcher}</h3>
                </div>
                <p className="text-gray-500">{t.resumeDesc}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Inputs */}
                <div className="p-8 space-y-6 border-r border-gray-100">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t.pasteResume}</label>
                        <textarea 
                            className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-sm"
                            placeholder="Experience: Senior Developer..."
                            value={resume}
                            onChange={(e) => setResume(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t.pasteJob}</label>
                        <textarea 
                            className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-sm"
                            placeholder="Responsibilities: Manage team..."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !resume || !jobDesc}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isAnalyzing ? t.analyzing : t.analyze}
                    </button>
                </div>

                {/* Results */}
                <div className="p-8 bg-gray-50/50 flex flex-col justify-center">
                    {result ? (
                        <div className="space-y-8 animate-fadeInUp">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-gray-200 relative">
                                     <span className={`text-4xl font-black ${result.score >= 70 ? 'text-green-500' : result.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                         {result.score}%
                                     </span>
                                     <svg className="absolute top-0 left-0 w-full h-full -rotate-90" style={{ pointerEvents: 'none' }}>
                                         <circle 
                                            cx="60" cy="60" r="56" 
                                            fill="none" stroke="currentColor" strokeWidth="8" 
                                            className={`${result.score >= 70 ? 'text-green-500' : result.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}
                                            strokeDasharray="351"
                                            strokeDashoffset={351 - (351 * result.score) / 100}
                                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                         />
                                     </svg>
                                </div>
                                <p className="mt-2 text-sm font-bold text-gray-400 uppercase tracking-wide">{t.score}</p>
                            </div>

                            {result.missingKeywords?.length > 0 && (
                                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                                    <h4 className="flex items-center gap-2 text-red-600 font-bold mb-3">
                                        <AlertCircle className="w-4 h-4" /> {t.missingKeywords}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords.map((k: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md border border-red-100">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {result.tips?.length > 0 && (
                                <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                                    <h4 className="flex items-center gap-2 text-amber-600 font-bold mb-3">
                                        <Target className="w-4 h-4" /> {t.tips}
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.tips.map((tip: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-sm font-medium">Ready to optimize. Paste details on the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CoverLetterGeneratorComponent: FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang].tools;
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [skills, setSkills] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!name || !role || !company) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Write a professional, compelling cover letter for ${name} applying for the position of ${role} at ${company}. Key skills and experience to highlight: ${skills}. Keep it concise, energetic, and professional.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setGeneratedLetter(response.text || '');
        } catch (error) {
            console.error("Failed to generate letter", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <PenTool className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t.coverLetter}</h3>
                </div>
                <p className="text-gray-500">{t.coverLetterDesc}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 space-y-4 border-r border-gray-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.yourName}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.jobRole}</label>
                        <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.targetCompany}</label>
                        <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t.keySkills}</label>
                        <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={3} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !name || !role || !company}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isGenerating ? t.generating : t.generateLetter}
                    </button>
                </div>
                <div className="p-8 bg-gray-50/50 flex flex-col relative">
                    {generatedLetter ? (
                        <>
                            <textarea 
                                readOnly 
                                value={generatedLetter} 
                                className="w-full h-full min-h-[300px] p-6 bg-white border border-gray-200 rounded-xl text-sm leading-relaxed text-gray-700 resize-none outline-none shadow-sm"
                            />
                            <button 
                                onClick={handleCopy} 
                                className="absolute top-12 right-12 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors flex items-center gap-2 text-xs font-bold"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? t.copied : t.copyText}
                            </button>
                        </>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[300px]">
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Your letter will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SalaryInsightsComponent: FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang].tools;
    
    const salaryData = [
        { role: "Frontend Dev", jr: 8000, mid: 15000, sr: 25000 },
        { role: "Backend Dev", jr: 9000, mid: 16000, sr: 28000 },
        { role: "DevOps", jr: 10000, mid: 18000, sr: 30000 },
        { role: "Data Scientist", jr: 11000, mid: 19000, sr: 32000 },
        { role: "UI/UX Designer", jr: 7000, mid: 13000, sr: 22000 },
    ];

    const maxSalary = 35000;

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mt-8">
             <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t.salaryInsights}</h3>
                    </div>
                    <p className="text-gray-500">{t.salaryDesc}</p>
                </div>
                <div className="flex gap-4 text-xs font-bold text-gray-500">
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> {t.junior}</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-300 rounded-sm"></div> {t.mid}</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-900 rounded-sm"></div> {t.senior}</div>
                </div>
            </div>

            <div className="p-8 overflow-x-auto">
                <div className="min-w-[600px] space-y-6">
                    {salaryData.map((item, idx) => (
                        <div key={idx} className="relative">
                            <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                                <span>{item.role}</span>
                                <span className="text-gray-400">MAD / Month</span>
                            </div>
                            <div className="h-8 bg-gray-50 rounded-full overflow-hidden flex relative">
                                {/* Junior */}
                                <div 
                                    className="h-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700 transition-all duration-1000 ease-out"
                                    style={{ width: `${(item.jr / maxSalary) * 100}%` }}
                                >
                                    {item.jr / 1000}k
                                </div>
                                {/* Mid */}
                                <div 
                                    className="h-full bg-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-900 transition-all duration-1000 ease-out delay-100"
                                    style={{ width: `${((item.mid - item.jr) / maxSalary) * 100}%` }}
                                >
                                    {item.mid / 1000}k
                                </div>
                                {/* Senior */}
                                <div 
                                    className="h-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000 ease-out delay-200"
                                    style={{ width: `${((item.sr - item.mid) / maxSalary) * 100}%` }}
                                >
                                    {item.sr / 1000}k
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const CareerToolsSection: FC<{ lang: Language }> = ({ lang }) => {
    return (
        <div className="max-w-5xl mx-auto animate-fadeInUp">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{translations[lang].tools.title}</h2>
                <p className="text-lg text-gray-600">{translations[lang].tools.subtitle}</p>
            </div>
            
            <CoverLetterGeneratorComponent lang={lang} />
            <ResumeMatcherComponent lang={lang} />
            <SalaryInsightsComponent lang={lang} />
        </div>
    );
}


// --- JOB DETAIL MODAL (With Google JobPosting Schema) ---
const JobDetailModal: FC<{ job: JobPosting | null; onClose: () => void; lang: Language; onApply: () => void }> = ({ job, onClose, lang, onApply }) => {
    const t = translations[lang];

    useEffect(() => {
        if (!job) return;

        // Generate JSON-LD Schema
        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description || `Join ${job.company} as a ${job.title}.`,
            "identifier": {
                "@type": "PropertyValue",
                "name": job.company,
                "value": job.id.toString()
            },
            "datePosted": job.postedAt || new Date().toISOString().split('T')[0],
            "validThrough": "2024-12-31",
            "employmentType": job.employmentType || "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": job.company,
                "sameAs": job.externalUrl || "https://www.example.com", 
                "logo": job.companyLogoUrl
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": job.location,
                    "addressCountry": "MA"
                }
            },
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "MAD",
                "value": {
                    "@type": "QuantitativeValue",
                    "minValue": job.salaryMin || 0,
                    "maxValue": job.salaryMax || 0,
                    "unitText": "MONTH"
                }
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schemaData);
        script.id = 'job-schema-script';
        document.head.appendChild(script);

        return () => {
            // Cleanup script on unmount/close
            const existingScript = document.getElementById('job-schema-script');
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [job]);

    if (!job) return null;

    const handleApply = () => {
        if (job.externalUrl) {
            window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
        } else {
            onApply();
        }
    };

    // Helper to safely display HTML content if present (for Arbeitnow API jobs)
    const renderDescription = () => {
        if (job.description && job.description.includes('<')) {
            return <div className="text-gray-600 leading-relaxed prose prose-amber max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />;
        }
        return <p className="text-gray-600 leading-relaxed">{job.description}</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeInUp" onClick={onClose} style={{animationDuration: '0.2s'}}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col relative" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white z-10 p-8 border-b border-gray-100 shadow-sm">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-6">
                        <img src={job.companyLogoUrl} alt={job.company} className="w-20 h-20 rounded-xl object-contain bg-gray-50 p-2" />
                        <div className="flex-1">
                             <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">{job.title}</h3>
                             <p className="text-lg text-amber-600 font-semibold">{job.company}</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {job.hasVisaSponsorship && (
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                         <Plane className="w-3 h-3 mr-1" /> {t.jobCard.badges.visa}
                                     </span>
                                )}
                                {job.isFourDayWorkWeek && (
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                         <CalendarClock className="w-3 h-3 mr-1" /> {t.jobCard.badges.fourDay}
                                     </span>
                                )}
                                {job.isNoWhiteboard && (
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                         <PenTool className="w-3 h-3 mr-1" /> {t.jobCard.badges.noWhiteboard}
                                     </span>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 space-y-8">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">{t.filters.location}</p>
                            <div className="flex items-center font-semibold">
                                <MapPin className="w-4 h-4 mr-2 text-amber-500" /> {job.location}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">{t.filters.salary}</p>
                             <div className="flex items-center font-semibold">
                                <DollarSign className="w-4 h-4 mr-2 text-amber-500" /> {job.salary}
                            </div>
                        </div>
                     </div>

                     <div>
                         <h4 className="text-lg font-bold text-gray-900 mb-3">{t.jobDetails.description}</h4>
                         {renderDescription()}
                     </div>

                     <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{t.jobCard.requiredSkills}</h4>
                        <div className="flex flex-wrap gap-2">
                             {job.skills?.map(skill => (
                                 <span key={skill} className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                                     {skill}
                                 </span>
                             ))}
                        </div>
                     </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 mt-auto rounded-b-2xl">
                     <button onClick={handleApply} className="w-full py-4 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-50 shadow-lg transform transition hover:-translate-y-1">
                         {job.externalUrl ? t.jobDetails.applyExternal : t.jobDetails.apply}
                     </button>
                </div>
            </div>
        </div>
    );
};


// --- FLASHCARD COMPONENTS ---
const FlashcardComponent: FC<{ card: Flashcard; lang: Language }> = ({ card, lang }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const t = translations[lang];

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div className="flashcard-container w-full h-80 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
        {/* Front of the card */}
        <div className="flashcard-front bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col justify-between transition-shadow hover:shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {card.category}
              </span>
              <span className="text-gray-300">
                <BrainCircuit className="w-5 h-5" />
              </span>
            </div>
            <p className="mt-4 text-xl sm:text-2xl font-bold text-gray-800 leading-tight animate-fadeInUp">
              {card.question}
            </p>
          </div>
          <p className="text-center text-sm text-gray-400 font-medium flex items-center justify-center gap-2 group-hover:text-amber-500 transition-colors">
             <MousePointerClick className="w-4 h-4" /> {t.flipCard}
          </p>
        </div>
        
        {/* Back of the card */}
        <div className="flashcard-back bg-amber-50 rounded-2xl shadow-lg border border-amber-200 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-bl-full -mr-16 -mt-16 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-300 rounded-tr-full -ml-12 -mb-12 opacity-20"></div>
          
          <h4 className="text-amber-800/50 font-bold uppercase text-xs tracking-widest mb-4">Answer</h4>
          <p className="text-lg text-gray-800 font-medium leading-relaxed relative z-10">
            {card.answer}
          </p>
        </div>
      </div>
    </div>
  );
};


const SkillsTestSection: FC<{ lang: Language; setView: (view: View) => void }> = ({ lang, setView }) => {
  const [selectedCategory, setSelectedCategory] = useState('React');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const t = translations[lang];

  const categories = ['React', 'Node.js', 'Python', 'AWS', 'DevOps', 'SQL', 'JavaScript'];

  // Filter cards based on selected category
  const activeCards = useMemo(() => {
    return flashcards.filter(card => card.category === selectedCategory);
  }, [flashcards, selectedCategory]);

  useEffect(() => {
      // When category changes, reset index
      setCurrentCardIndex(0);
  }, [selectedCategory]);

  const handleNextCard = () => {
    if (activeCards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % activeCards.length);
    }
  };

  const handlePrevCard = () => {
      if (activeCards.length > 0) {
          setCurrentCardIndex((prevIndex) => (prevIndex - 1 + activeCards.length) % activeCards.length);
      }
  };

  const handleGenerateAI = async () => {
    setIsLoadingAI(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-2.5-flash';
        
        // Generate new questions using Gemini
        const response = await ai.models.generateContent({
            model,
            contents: `Generate 3 unique and challenging interview flashcards for ${selectedCategory} development. Focus on modern practices.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        // SAFETY FIX: Clean any Markdown code fences from the response
        const cleanText = response.text ? response.text.replace(/```json|```/g, '').trim() : '[]';
        const newCardsData = JSON.parse(cleanText);
        
        if (Array.isArray(newCardsData) && newCardsData.length > 0) {
            const newFlashcards: Flashcard[] = newCardsData.map((c: any, i: number) => ({
                id: `ai-${Date.now()}-${i}`,
                category: selectedCategory,
                question: c.question,
                answer: c.answer
            }));
            
            setFlashcards(prev => [...prev, ...newFlashcards]);
            
            // Auto navigate to the first new card
            const currentCount = flashcards.filter(c => c.category === selectedCategory).length;
            setCurrentCardIndex(currentCount); 
        }

    } catch (error) {
        console.error("Error generating flashcards:", error);
        alert("Failed to generate new questions. Please try again.");
    } finally {
        setIsLoadingAI(false);
    }
  };

  return (
    <section className="bg-gray-100 py-16 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 max-w-4xl flex-grow flex flex-col">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
             <BrainCircuit className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.skillsTestTitle}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.skillsTestSubtitle}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 justify-start sm:justify-center no-scrollbar animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                        selectedCategory === cat 
                        ? 'bg-gray-900 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-600 border border-gray-200'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Card Area */}
        <div className="flex-grow flex flex-col items-center justify-center animate-fadeInUp relative" style={{ animationDelay: '200ms' }}>
            {activeCards.length > 0 ? (
                 <div className="w-full max-w-xl relative">
                    <FlashcardComponent card={activeCards[currentCardIndex]} lang={lang} />
                    
                    {/* Progress Indicator */}
                    <div className="mt-6 flex justify-center items-center gap-2">
                        <span className="text-sm font-bold text-gray-400">
                             {currentCardIndex + 1} / {activeCards.length}
                        </span>
                    </div>
                 </div>
            ) : (
                <div className="w-full max-w-xl h-80 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8">
                     <Sparkles className="w-12 h-12 text-amber-400 mb-4 animate-pulse" />
                     <p className="text-gray-500 font-medium">No cards yet for {selectedCategory}.</p>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
           <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                    onClick={handlePrevCard}
                    disabled={activeCards.length === 0}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> {t.prevCard}
                </button>
                <button
                    onClick={handleNextCard}
                    disabled={activeCards.length === 0}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                    {t.nextCard} <ChevronRight className="w-4 h-4" />
                </button>
           </div>
           
           {/* AI Generator Button */}
           <button
                onClick={handleGenerateAI}
                disabled={isLoadingAI}
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 text-gray-900 font-bold rounded-xl shadow-lg hover:bg-amber-300 hover:scale-105 transition-all flex items-center justify-center gap-2"
           >
               {isLoadingAI ? (
                   <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                   </>
               ) : (
                   <>
                    <Sparkles className="w-4 h-4" /> {t.generateAI}
                   </>
               )}
           </button>
        </div>
        
         <div className="text-center mt-6">
             <button onClick={() => setView('JOBS')} className="text-gray-500 hover:text-gray-900 text-sm font-semibold underline decoration-dotted">
                 {t.backToJobs}
             </button>
         </div>

      </div>
    </section>
  );
};


// --- CARD COMPONENTS ---

const TalentCard: FC<{ profile: TalentProfile; lang: Language; index: number; isNew?: boolean; userType: UserType; onJoinClick: () => void; }> = ({ profile, lang, index, isNew = false, userType, onJoinClick }) => {
    const t = translations[lang];

    if (userType === 'guest') {
        const firstName = profile.name.split(' ')[0];
        const lastNameInitial = profile.name.split(' ').length > 1 ? profile.name.split(' ')[1].charAt(0) + '.' : '';
        const anonymizedName = `${firstName} ${lastNameInitial}`;

        return (
            <div
                className={`bg-white rounded-3xl shadow-md overflow-hidden transition-all duration-300 ease-in-out border border-gray-200 animate-fadeInUp`}
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className="p-8">
                    <div className="flex items-center space-x-5">
                        <img className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200 filter blur-sm" src={profile.imageUrl} alt={anonymizedName} />
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{anonymizedName}</h3>
                            <p className="text-amber-500 font-semibold">{profile.title}</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <IconText icon={MapPin} text={profile.location} />
                        <IconText icon={Star} text={`${profile.experience} ${t.talentCard.experience}`} />
                    </div>
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-500 mb-3">{t.talentCard.topSkills}</h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => <SkillBadge key={skill} skill={skill} />)}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                    <button onClick={onJoinClick} className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors duration-200">
                        {t.talentCard.registerToView} &rarr;
                    </button>
                </div>
            </div>
        );
    }

    return (
      <div 
        className={`bg-white rounded-3xl shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200 ${isNew ? '' : 'animate-fadeInUp'}`}
        style={{ animation: isNew ? 'fadeInUp 0.5s ease-out forwards' : 'none', animationDelay: isNew ? '0ms' : `${index * 100}ms` }}
      >
        <div className="p-8">
          <div className="flex items-center space-x-5">
            <img className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200" src={profile.imageUrl} alt={profile.name} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
              <p className="text-amber-500 font-semibold">{profile.title}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <IconText icon={MapPin} text={profile.location} />
            <IconText icon={Star} text={`${profile.experience} ${t.talentCard.experience}`} />
            <IconText icon={DollarSign} text={`${profile.salaryExpectation} MAD/Month`} />
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">{t.talentCard.topSkills}</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => <SkillBadge key={skill} skill={skill} />)}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <a href="#root" className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors duration-200">
            {t.talentCard.viewProfile} &rarr;
          </a>
        </div>
      </div>
    );
};


const JobCard: FC<{ job: JobPosting; lang: Language; index: number; isSaved: boolean; onToggleSave: (id: number) => void; userType: UserType; onJoinClick: () => void; onViewDetails: () => void }> = ({ job, lang, index, isSaved, onToggleSave, userType, onJoinClick, onViewDetails }) => {
  const t = translations[lang];
  const isTrending = job.applicants > TRENDING_THRESHOLD;

  return (
    <div
      className="bg-white rounded-3xl shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col border border-gray-200 animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-8 flex-grow relative cursor-pointer" onClick={onViewDetails}>
        {userType !== 'guest' && (
             <button
                onClick={(e) => { e.stopPropagation(); onToggleSave(job.id); }}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-amber-500 hover:bg-gray-100 transition-all duration-200"
                aria-label={isSaved ? t.jobCard.unsaveJob : t.jobCard.saveJob}
              >
                <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-4 flex-wrap">
                <p className="text-amber-500 font-semibold text-sm">{job.company}</p>
                <div className="flex items-center gap-3">
                    {isTrending && (
                      <div className="flex items-center gap-1 text-amber-500" title="Trending">
                        <TrendingUp className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                    {job.isFeatured && (
                         <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full" title="Featured">
                           <Star className="w-3.5 h-3.5" />
                           <span>{t.jobCard.featured}</span>
                        </div>
                    )}
                </div>
            </div>
            {/* New Special Badges */}
            <div className="flex gap-2 mt-2 flex-wrap">
                {job.hasVisaSponsorship && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100" title={t.jobCard.badges.visa}>
                        <Plane className="w-3 h-3 mr-1" /> Visa
                    </span>
                )}
                {job.isFourDayWorkWeek && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100" title={t.jobCard.badges.fourDay}>
                        <CalendarClock className="w-3 h-3 mr-1" /> 4-Day
                    </span>
                )}
                 {job.isNoWhiteboard && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100" title={t.jobCard.badges.noWhiteboard}>
                        <PenTool className="w-3 h-3 mr-1" /> No Whiteboard
                    </span>
                )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">{job.title}</h3>
          </div>
          <img className="h-14 w-14 rounded-xl object-contain bg-gray-50 p-1 flex-shrink-0" src={job.companyLogoUrl} alt={`${job.company} logo`} />
        </div>
        <div className="mt-6 space-y-3">
          <IconText icon={MapPin} text={job.location} />
          <IconText icon={DollarSign} text={job.salary} />
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">{t.jobCard.requiredSkills}</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills?.slice(0, 4).map(skill => <SkillBadge key={skill} skill={skill} />)}
            {job.skills?.length > 4 && <span className="text-xs text-gray-400 mt-1">+{job.skills.length - 4} more</span>}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-8 py-4 mt-auto border-t border-gray-200 flex justify-between items-center">
         <button onClick={onViewDetails} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            {t.jobCard.viewDetails}
         </button>
         {userType === 'guest' && !job.externalUrl ? (
             <button onClick={onJoinClick} className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors duration-200">
                {t.jobCard.registerToApply} &rarr;
             </button>
         ) : (
            <button onClick={(e) => {
                if (job.externalUrl) {
                    window.open(job.externalUrl, '_blank');
                } else {
                    // Internal Apply Logic
                }
            }} className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors duration-200">
              {job.externalUrl ? t.jobCard.applyExternal : t.jobCard.applyNow} &rarr;
            </button>
         )}
      </div>
    </div>
  );
};

// --- WHY US SECTION ---
const WhyUsSection: FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].whyUs;

  const reasons = [
    {
      icon: Target,
      title: t.focusTitle,
      description: t.focusDesc,
    },
    {
      icon: BadgeCheck,
      title: t.qualityTitle,
      description: t.qualityDesc,
    },
    {
      icon: Zap,
      title: t.speedTitle,
      description: t.speedDesc,    },
  ];

  return (
    <section className="bg-gray-100 py-20 my-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl border border-gray-200 animate-fadeInUp"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100`}>
                <reason.icon className={`h-8 w-8 text-amber-500`} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-800 text-center">{reason.title}</h3>
              <p className="mt-2 text-base text-gray-600 text-center">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- FEATURE SECTIONS ---
const FeatureSection: FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].featureSection;

  const features = [
    {
      icon: MousePointerClick,
      title: t.easyApplyTitle,
      description: t.easyApplyDesc,
    },
    {
      icon: BellRing,
      title: t.smartAlertsTitle,
      description: t.smartAlertsDesc,
    },
    {
      icon: Building2,
      title: t.companyCultureTitle,
      description: t.companyCultureDesc,
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200 text-center transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInUp" 
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <feature.icon className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureSectionCompanies: FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].featureSectionCompanies;

  const features = [
    {
      icon: BadgeCheck,
      title: t.verifiedTalentTitle,
      description: t.verifiedTalentDesc,
    },
    {
      icon: Camera,
      title: t.employerBrandingTitle,
      description: t.employerBrandingDesc,
    },
    {
      icon: BarChart3,
      title: t.performanceAnalyticsTitle,
      description: t.performanceAnalyticsDesc,
    },
  ];

  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center transform hover:-translate-y-2 transition-transform duration-300 animate-fadeInUp" 
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <feature.icon className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- HOT JOBS SECTION ---
const HotJobsSection: FC<{
  lang: Language;
  jobs: JobPosting[];
  savedJobIds: Set<number>;
  onToggleSave: (id: number) => void;
  userType: UserType;
  onJoinClick: () => void;
  onViewDetails: (job: JobPosting) => void;
  isLoading: boolean;
}> = ({ lang, jobs, savedJobIds, onToggleSave, userType, onJoinClick, onViewDetails, isLoading }) => {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { id: 'All', label: t.filters.quick.all },
    { id: 'Remote', label: t.filters.quick.remote },
    { id: 'FourDay', label: t.filters.quick.fourDay },
    { id: 'Visa', label: t.filters.quick.visa },
    { id: 'NoWhiteboard', label: t.filters.quick.noWhiteboard },
    { id: 'Senior', label: t.filters.quick.senior },
    { id: 'Junior', label: t.filters.quick.junior },
  ];

  const filteredJobs = useMemo(() => {
    // Only consider published and featured jobs for "Hot Jobs"
    // For API jobs, we might treat them as featured if they match special criteria or we can just show them
    const baseJobs = jobs.filter(j => j.status === 'published' && (j.isFeatured || j.externalUrl));

    if (activeFilter === 'All') return baseJobs;

    return baseJobs.filter(job => {
        switch (activeFilter) {
            case 'Remote':
                return job.location?.toLowerCase().includes('remote') || job.employmentType?.toLowerCase().includes('remote');
            case 'Senior':
                return job.title?.toLowerCase().includes('senior') || job.description?.toLowerCase().includes('senior');
            case 'Junior':
                return job.title?.toLowerCase().includes('junior') || job.description?.toLowerCase().includes('junior');
            case 'FourDay':
                return job.isFourDayWorkWeek;
            case 'Visa':
                return job.hasVisaSponsorship;
            case 'NoWhiteboard':
                return job.isNoWhiteboard;
            default:
                return true;
        }
    });
  }, [jobs, activeFilter]);


  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.hotJobs.title}</h2>
        
        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 animate-fadeInUp" style={{animationDelay: '100ms'}}>
            {filters.map(filter => (
                <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                        activeFilter === filter.id
                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
      </div>
      
      {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Fetching latest opportunities...</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 min-h-[300px]">
            {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                <JobCard
                    key={job.id}
                    job={job}
                    lang={lang}
                    index={index}
                    isSaved={savedJobIds.has(job.id)}
                    onToggleSave={onToggleSave}
                    userType={userType}
                    onJoinClick={onJoinClick}
                    onViewDetails={() => onViewDetails(job)}
                />
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center animate-fadeInUp">
                    <Search className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-lg">
                        {lang === 'FR' ? "Aucune offre trouvée." : lang === 'AR' ? "لم يتم العثور على وظائف." : "No jobs found for this filter."}
                    </p>
                    <button 
                        onClick={() => setActiveFilter('All')} 
                        className="mt-4 text-amber-500 font-bold hover:text-amber-600 underline decoration-2 underline-offset-4"
                    >
                        {lang === 'FR' ? "Voir tout" : lang === 'AR' ? "عرض الكل" : "View All"}
                    </button>
                </div>
            )}
        </div>
      )}
      <hr className="my-16 border-gray-200" />
    </section>
  );
};

// --- TESTIMONIALS SECTION ---
const StarRating: FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" />
        ))}
    </div>
);


const TestimonialsSection: FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang].testimonials;
    return (
        <section className="bg-gray-100 py-20 my-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t.title}</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">{t.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS_DATA.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center text-center animate-fadeInUp"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <Quote className="w-10 h-10 text-amber-100 mb-4" fill="currentColor" />
                            <p className="text-gray-600 flex-grow">"{testimonial.quote}"</p>
                            <div className="mt-6 flex flex-col items-center">
                                 <StarRating rating={testimonial.rating} />
                                <img className="h-16 w-16 rounded-full object-cover ring-4 ring-gray-200 mt-4" src={testimonial.imageUrl} alt={testimonial.name} />
                                <h4 className="mt-4 text-lg font-bold text-gray-900">{testimonial.name}</h4>
                                <p className="text-sm text-amber-500 font-semibold">{testimonial.newRole}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


// --- LAYOUT COMPONENTS ---

const Header: FC<{
  currentView: View;
  setView: (view: View) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onJoinClick: (path?: 'seeker' | 'company') => void;
  savedJobsCount: number;
  userType: UserType;
  onLogout: () => void;
}> = ({ currentView, setView, language, setLanguage, onJoinClick, savedJobsCount, userType, onLogout }) => {
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { // Cleanup on component unmount
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  const navLinkBaseClass = "px-1 py-2 text-sm font-bold transition-all duration-300 relative flex items-center";
  const getNavLinkClass = (view: View) => 
    `${navLinkBaseClass} ${currentView === view ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`;

  // Indicator for active tab
  const activeIndicator = (
      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-500 rounded-full animate-fadeInUp" />
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => setView('JOBS')}>
            <AnimatedLogo />
            <span className="ml-3 text-2xl font-black tracking-tighter text-gray-900 group-hover:text-gray-700 transition-colors">
              {t.appName}<span className="text-amber-500">.</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setView('JOBS')} className={getNavLinkClass('JOBS')}>
               {t.findJobs}
               {currentView === 'JOBS' && activeIndicator}
            </button>
            <button onClick={() => setView('TALENT')} className={getNavLinkClass('TALENT')}>
               {t.findTalent}
               {currentView === 'TALENT' && activeIndicator}
            </button>
            <button onClick={() => setView('SKILLS')} className={getNavLinkClass('SKILLS')}>
               {t.skillsTest}
               {currentView === 'SKILLS' && activeIndicator}
            </button>
            <button onClick={() => setView('TOOLS')} className={getNavLinkClass('TOOLS')}>
               {t.careerTools}
               {currentView === 'TOOLS' && activeIndicator}
            </button>
             {userType !== 'guest' && (
                <button onClick={() => setView('SAVED')} className={getNavLinkClass('SAVED')}>
                  {t.savedJobs}
                   {savedJobsCount > 0 && (
                      <span className="ml-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {savedJobsCount}
                      </span>
                   )}
                   {currentView === 'SAVED' && activeIndicator}
                </button>
             )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
             {/* Language Selector */}
             <div className="flex bg-gray-100 p-1 rounded-full">
                {(['FR', 'EN', 'AR'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                            language === lang 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                         <img 
                            src={lang === 'FR' ? 'https://flagcdn.com/w40/fr.png' : lang === 'EN' ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/ma.png'}
                            alt={lang}
                            className="w-4 h-3 rounded-[1px] object-cover shadow-sm"
                        />
                        {lang}
                    </button>
                ))}
             </div>

             {userType === 'guest' ? (
                 <>
                    <button 
                        onClick={() => onJoinClick('company')}
                        className="text-gray-600 hover:text-gray-900 font-bold text-sm px-4 py-2"
                    >
                        {t.header.forEmployers}
                    </button>
                    <button 
                        onClick={() => onJoinClick('seeker')} 
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        {t.joinNow}
                    </button>
                 </>
             ) : (
                <div className="flex items-center gap-3">
                   <div className="text-right hidden lg:block">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{userType === 'company' ? t.header.companyView : t.header.seekerView}</p>
                   </div>
                   <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                       <LogOut className="w-5 h-5" />
                   </button>
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                       {userType === 'company' ? 'C' : 'U'}
                   </div>
                </div>
             )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-2">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-24 px-6 overflow-y-auto animate-fadeInUp" style={{animationDuration: '0.2s'}}>
            <div className="flex flex-col space-y-6">
                <button onClick={() => { setView('JOBS'); setIsMobileMenuOpen(false); }} className="text-xl font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-4">
                    {t.findJobs} <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => { setView('TALENT'); setIsMobileMenuOpen(false); }} className="text-xl font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-4">
                     {t.findTalent} <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => { setView('SKILLS'); setIsMobileMenuOpen(false); }} className="text-xl font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-4">
                     {t.skillsTest} <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => { setView('TOOLS'); setIsMobileMenuOpen(false); }} className="text-xl font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-4">
                     {t.careerTools} <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                 {userType !== 'guest' && (
                    <button onClick={() => { setView('SAVED'); setIsMobileMenuOpen(false); }} className="text-xl font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-4">
                        {t.savedJobs} <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                )}

                <div className="pt-4 space-y-4">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Language</p>
                    <div className="flex gap-2">
                         {(['FR', 'EN', 'AR'] as Language[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all ${language === lang ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                 <img 
                                    src={lang === 'FR' ? 'https://flagcdn.com/w40/fr.png' : lang === 'EN' ? 'https://flagcdn.com/w40/gb.png' : 'https://flagcdn.com/w40/ma.png'}
                                    alt={lang}
                                    className="w-5 h-auto rounded-sm shadow-sm"
                                />
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6">
                    {userType === 'guest' ? (
                        <div className="flex flex-col gap-3">
                             <button onClick={() => { onJoinClick('seeker'); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-amber-400 text-black font-bold rounded-xl text-lg shadow-sm">
                                {t.joinNow}
                             </button>
                             <button onClick={() => { onJoinClick('company'); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-xl text-lg">
                                {t.header.forEmployers}
                             </button>
                        </div>
                    ) : (
                         <button onClick={onLogout} className="w-full py-4 bg-gray-100 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2">
                            <LogOut className="w-5 h-5" /> {t.header.logout}
                         </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </nav>
  );
};


// --- HERO SECTION ---
const HeroSection: FC<{ lang: Language; onSearch: () => void }> = ({ lang, onSearch }) => {
  const t = translations[lang];
  const [dynamicText, setDynamicText] = useState(t.heroDynamicTexts[0]);

  // Rotate dynamic text
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % t.heroDynamicTexts.length;
      setDynamicText(t.heroDynamicTexts[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, [lang, t.heroDynamicTexts]);

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gray-50 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-8 animate-fadeInUp">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            #1 Tech Community in Morocco
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-6 animate-fadeInUp" style={{animationDelay: '100ms'}}>
          {t.heroTagline} <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 animate-text-shimmer">
             {dynamicText}
          </span>
        </h1>
        
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fadeInUp" style={{animationDelay: '200ms'}}>
            Join thousands of developers, designers, and tech leaders shaping the future of Morocco's digital landscape.
        </p>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2 animate-fadeInUp" style={{animationDelay: '300ms'}}>
            <div className="flex-grow flex items-center px-4 bg-gray-50 rounded-xl">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholderKeyword} 
                    className="w-full py-4 bg-transparent outline-none text-gray-900 placeholder-gray-400 font-medium"
                />
            </div>
            <div className="flex-grow flex items-center px-4 bg-gray-50 rounded-xl border-l-0 md:border-l border-white md:border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholderLocation} 
                    className="w-full py-4 bg-transparent outline-none text-gray-900 placeholder-gray-400 font-medium"
                />
            </div>
            <button 
                onClick={onSearch}
                className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
                {t.searchButton}
            </button>
        </div>
        
        {/* Trusted By */}
        <div className="mt-16 pt-8 border-t border-gray-100 animate-fadeInUp" style={{animationDelay: '500ms'}}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by leading companies</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {['google', 'microsoft', 'amazon', 'spotify', 'stripe'].map((brand) => (
                    <img key={brand} src={`https://logo.clearbit.com/${brand}.com`} alt={brand} className="h-8 object-contain" />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};


// --- MODAL COMPONENT (UPDATED) ---
const JoinModal: FC<{ isOpen: boolean; onClose: () => void; lang: Language; initialPath?: 'seeker' | 'company'; onLogin: (type: UserType) => void }> = ({ isOpen, onClose, lang, initialPath = 'seeker', onLogin }) => {
  const t = translations[lang].modal;
  const [userPath, setUserPath] = useState<'seeker' | 'company'>(initialPath);

  useEffect(() => {
    setUserPath(initialPath);
  }, [initialPath]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeInUp" onClick={onClose} style={{animationDuration: '0.2s'}}>
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-8">
            <div className="text-center mb-8">
                <AnimatedLogo />
                <h2 className="mt-4 text-2xl font-black text-gray-900">{t.joinTitle}</h2>
                <p className="text-gray-500">{t.joinSubtitle}</p>
            </div>

            {/* Path Toggle */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 relative">
                {/* Sliding Background */}
                <div 
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${userPath === 'company' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
                />
                <button 
                    onClick={() => setUserPath('seeker')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg relative z-10 transition-colors ${userPath === 'seeker' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.iAmJobSeeker}
                </button>
                <button 
                    onClick={() => setUserPath('company')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg relative z-10 transition-colors ${userPath === 'company' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.iAmCompany}
                </button>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(userPath); }}>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">{t.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-medium" placeholder="hello@example.com" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">{t.password}</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-medium" placeholder="••••••••" />
                    </div>
                </div>
                
                <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5 mt-2">
                    {t.createAccount}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 font-medium">{t.or}</span>
                </div>
            </div>

            <button type="button" onClick={() => onLogin(userPath)} className="w-full bg-[#0077b5] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#006097] transition-colors shadow-md">
                <Linkedin className="w-5 h-5" />
                {t.continueWithLinkedin}
            </button>

            <p className="mt-8 text-center text-sm text-gray-500">
                {t.alreadyMember} <button onClick={() => onLogin(userPath)} className="font-bold text-amber-600 hover:text-amber-700 underline">{t.login}</button>
            </p>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
const App: FC = () => {
  const [currentView, setCurrentView] = useState<View>('JOBS');
  const [language, setLanguage] = useState<Language>('FR');
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [userType, setUserType] = useState<UserType>('guest');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinModalPath, setJoinModalPath] = useState<'seeker' | 'company'>('seeker');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  
  const dataFetchedRef = useRef(false);

  // Fetch Jobs & Talent (Authentic Data)
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const fetchJobs = async () => {
        setIsJobsLoading(true);
        try {
            // Using Arbeitnow API for real job data
            const response = await fetch('https://arbeitnow.com/api/job-board-api');
            const data = await response.json();
            
            const apiJobs: JobPosting[] = data.data.map((item: any, index: number) => ({
                id: 1000 + index, 
                title: item.title,
                company: item.company_name,
                location: item.location,
                salary: "Competitive", 
                salaryMin: 0,
                salaryMax: 0,
                skills: item.tags || [],
                companyLogoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company_name || 'C')}&background=f59e0b&color=fff&size=128`, 
                applicants: Math.floor(Math.random() * 50) + 5,
                isFeatured: item.remote || false, 
                status: 'published',
                postedAt: new Date(item.created_at * 1000).toISOString().split('T')[0],
                employmentType: item.job_types?.[0] || 'Full Time',
                description: item.description, 
                externalUrl: item.url,
                isFourDayWorkWeek: item.tags?.includes('4 day work week') || false,
                hasVisaSponsorship: item.tags?.includes('Visa sponsorship') || false,
                isNoWhiteboard: item.tags?.some((t: string) => t.toLowerCase().includes('whiteboard')) || false
            }));

            // Filter mainly for remote jobs or tech jobs to simulate "IT" relevance since we can't filter API server-side
            const relevantJobs = apiJobs.filter(j => 
                j.isFeatured || 
                j.title.toLowerCase().includes('developer') || 
                j.title.toLowerCase().includes('engineer') ||
                j.title.toLowerCase().includes('data')
            );
            
            setJobs(relevantJobs);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setIsJobsLoading(false);
        }
    };

    const fetchTalent = async () => {
        try {
            // Use RandomUser to generate authentic-looking candidate profiles
            const res = await fetch('https://randomuser.me/api/?results=12&nat=fr,us');
            const data = await res.json();
            const newTalents = data.results.map((u: any, i: number) => {
                const titles = ['Senior Frontend Dev', 'Fullstack Engineer', 'DevOps Specialist', 'Product Manager', 'UX/UI Designer', 'Data Scientist'];
                const skillsPool = ['React', 'Node.js', 'AWS', 'Python', 'Figma', 'Docker', 'Kubernetes', 'Go', 'Rust', 'TypeScript'];
                const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Remote'];
                
                // Shuffle skills
                const shuffledSkills = skillsPool.sort(() => 0.5 - Math.random());

                return {
                    id: i,
                    name: `${u.name.first} ${u.name.last}`,
                    title: titles[i % titles.length],
                    location: cities[i % cities.length],
                    experience: Math.floor(Math.random() * 10) + 2,
                    skills: shuffledSkills.slice(0, 3),
                    imageUrl: u.picture.large,
                    salaryExpectation: 12000 + Math.floor(Math.random() * 25000)
                };
            });
            setTalents(newTalents);
        } catch (e) {
            console.error("Failed to fetch talent", e);
        }
    }

    fetchJobs();
    fetchTalent();
  }, []);


  const t = translations[language];

  const toggleSaveJob = (id: number) => {
    setSavedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleJoinClick = (path: 'seeker' | 'company' = 'seeker') => {
      setJoinModalPath(path);
      setIsJoinModalOpen(true);
  };

  const handleLogout = () => {
      setUserType('guest');
      setCurrentView('JOBS');
      window.scrollTo(0, 0);
  };
  
  // Dummy login for demo purposes when completing the modal flow
  const handleLoginDemo = (type: UserType) => {
      setUserType(type);
      setIsJoinModalOpen(false);
      // If logging in as company, switch to talent view
      if (type === 'company') setCurrentView('TALENT');
  };
  
  const savedJobs = jobs.filter(job => savedJobIds.has(job.id));

  // Recruiter Dashboard Filters (Functional)
  const [recruiterFilters, setRecruiterFilters] = useState({
      location: '',
      minExperience: 0,
      maxSalary: 50000,
      selectedSkills: [] as string[]
  });

  const filteredTalent = useMemo(() => {
    return talents.filter(profile => {
        const matchesLocation = profile.location.toLowerCase().includes(recruiterFilters.location.toLowerCase());
        const matchesExp = profile.experience >= recruiterFilters.minExperience;
        const matchesSalary = profile.salaryExpectation <= recruiterFilters.maxSalary;
        const matchesSkills = recruiterFilters.selectedSkills.length === 0 || 
                              recruiterFilters.selectedSkills.every(skill => profile.skills.includes(skill));
        return matchesLocation && matchesExp && matchesSalary && matchesSkills;
    });
  }, [talents, recruiterFilters]);

  const handleSkillToggle = (skill: string) => {
      setRecruiterFilters(prev => {
          const newSkills = prev.selectedSkills.includes(skill) 
            ? prev.selectedSkills.filter(s => s !== skill)
            : [...prev.selectedSkills, skill];
          return { ...prev, selectedSkills: newSkills };
      });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      <Header 
        currentView={currentView} 
        setView={setCurrentView} 
        language={language} 
        setLanguage={setLanguage}
        onJoinClick={handleJoinClick}
        savedJobsCount={savedJobIds.size}
        userType={userType}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="animate-fadeInUp">
        
        {/* HERO is only shown on JOBS view when guest, or always at top? Let's keep it for Home/JOBS view */}
        {currentView === 'JOBS' && (
            <HeroSection lang={language} onSearch={() => {}} />
        )}

        {/* Dynamic View Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {/* JOBS VIEW */}
            {currentView === 'JOBS' && (
                <>
                    <HotJobsSection 
                        lang={language} 
                        jobs={jobs} 
                        savedJobIds={savedJobIds} 
                        onToggleSave={toggleSaveJob} 
                        userType={userType}
                        onJoinClick={() => handleJoinClick('seeker')}
                        onViewDetails={(job) => setSelectedJob(job)}
                        isLoading={isJobsLoading}
                    />
                    
                    {userType === 'guest' ? <FeatureSection lang={language} /> : null}
                    {userType === 'guest' ? <WhyUsSection lang={language} /> : null}
                    <TestimonialsSection lang={language} />
                </>
            )}

            {/* SAVED JOBS VIEW */}
            {currentView === 'SAVED' && (
                 <div className="max-w-5xl mx-auto min-h-[60vh]">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <Bookmark className="w-8 h-8 text-amber-500" />
                        {t.savedJobs}
                    </h2>
                    {savedJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {savedJobs.map((job, index) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    lang={language}
                                    index={index}
                                    isSaved={true}
                                    onToggleSave={toggleSaveJob}
                                    userType={userType}
                                    onJoinClick={() => handleJoinClick('seeker')}
                                    onViewDetails={() => setSelectedJob(job)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                             <Bookmark className="w-12 h-12 text-gray-300 mb-4" />
                             <p className="text-gray-500 font-medium">{t.noSavedJobs}</p>
                             <button onClick={() => setCurrentView('JOBS')} className="mt-4 text-amber-500 font-bold hover:underline">
                                 {t.browseJobs}
                             </button>
                        </div>
                    )}
                </div>
            )}

             {/* TALENT VIEW (Recruiter Dashboard) */}
             {currentView === 'TALENT' && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Filters Sidebar */}
                        <aside className="w-full lg:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
                            <div className="flex items-center gap-2 mb-6">
                                <Sliders className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-gray-900 text-lg">{t.filters.title}</h3>
                            </div>

                            {/* Skills Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t.filters.skills}</label>
                                <div className="space-y-2">
                                    {['React', 'Node.js', 'Python', 'AWS', 'Java'].map(skill => (
                                        <label key={skill} className="flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" 
                                                checked={recruiterFilters.selectedSkills.includes(skill)}
                                                onChange={() => handleSkillToggle(skill)}
                                            />
                                            <span className="ml-2 text-sm text-gray-600">{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Location Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t.filters.location}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
                                        placeholder="Casablanca..." 
                                        value={recruiterFilters.location}
                                        onChange={(e) => setRecruiterFilters({...recruiterFilters, location: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Experience Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t.filters.experience}: {recruiterFilters.minExperience}+ yrs</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="15" 
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                                    value={recruiterFilters.minExperience}
                                    onChange={(e) => setRecruiterFilters({...recruiterFilters, minExperience: parseInt(e.target.value)})}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0 yr</span>
                                    <span>15+ yrs</span>
                                </div>
                            </div>

                             {/* Salary Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t.filters.salary}: {recruiterFilters.maxSalary} MAD</label>
                                <input 
                                    type="range" 
                                    min="5000" 
                                    max="50000" 
                                    step="1000" 
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                                    value={recruiterFilters.maxSalary}
                                    onChange={(e) => setRecruiterFilters({...recruiterFilters, maxSalary: parseInt(e.target.value)})}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>5k</span>
                                    <span>50k+</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setRecruiterFilters({ location: '', minExperience: 0, maxSalary: 50000, selectedSkills: [] })}
                                className="w-full py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 text-sm"
                            >
                                {t.filters.clear}
                            </button>
                        </aside>

                        {/* Talent Grid */}
                        <div className="flex-1">
                             <div className="mb-6 flex justify-between items-center">
                                 <h2 className="text-2xl font-bold text-gray-900">{t.findTalent}</h2>
                                 <span className="text-gray-500 text-sm font-medium">{filteredTalent.length} results</span>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {filteredTalent.map((profile, index) => (
                                     <TalentCard 
                                        key={profile.id} 
                                        profile={profile} 
                                        lang={language} 
                                        index={index} 
                                        userType={userType} 
                                        onJoinClick={() => handleJoinClick('company')}
                                     />
                                 ))}
                                 {filteredTalent.length === 0 && (
                                     <div className="col-span-full py-12 text-center text-gray-500">
                                         {talents.length === 0 ? "Loading candidates..." : "No candidates match your criteria."}
                                     </div>
                                 )}
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* SKILLS TEST VIEW */}
            {currentView === 'SKILLS' && (
                <SkillsTestSection lang={language} setView={setCurrentView} />
            )}

            {/* CAREER TOOLS VIEW (NEW) */}
            {currentView === 'TOOLS' && (
                <CareerToolsSection lang={language} />
            )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
           <div className="flex justify-center mb-6">
               <div className="flex items-center">
                    <AnimatedLogo />
                    <span className="ml-3 text-2xl font-black tracking-tighter text-white">
                    {t.appName}<span className="text-amber-500">.</span>
                    </span>
               </div>
           </div>
           <p className="text-gray-400 mb-8 max-w-lg mx-auto">{t.footer.tagline}</p>
           
           <div className="flex justify-center gap-6 mb-8">
               <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>
               <a href="#" className="text-gray-400 hover:text-white transition-colors"><Globe className="w-6 h-6" /></a>
           </div>

           <p className="text-sm text-gray-600">
             &copy; {new Date().getFullYear()} {t.appName}. {t.footer.copyright}
           </p>
        </div>
      </footer>

      {/* MODALS */}
      <JoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        lang={language} 
        initialPath={joinModalPath}
        onLogin={handleLoginDemo}
      />

      <JobDetailModal 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)} 
        lang={language}
        onApply={() => {
            // Internal apply logic
            alert("Applied!");
        }}
      />
      
    </div>
  );
};

export default App;
