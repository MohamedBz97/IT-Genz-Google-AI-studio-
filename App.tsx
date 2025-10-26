
import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { Users, Briefcase, MapPin, Code, DollarSign, Search, BrainCircuit, Star, Clock, Sun, Moon, Globe } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface TalentProfile {
  id: number;
  name: string;
  title: string;
  location: string;
  experience: number;
  skills: string[];
  imageUrl: string;
}

interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  companyLogoUrl: string;
}

type View = 'TALENT' | 'ENTERPRISE';
type Language = 'FR' | 'EN' | 'AR';

// --- TRANSLATIONS ---
const translations = {
  FR: {
    appName: 'ITGenz',
    findTalent: 'Candidats',
    findJobs: 'Emplois',
    heroTitleTalent: "Découvrez la Nouvelle Génération d'Experts IT au Maroc",
    heroSubtitleTalent: "Accédez à un réseau d'élite de développeurs, d'ingénieurs et de designers pour construire votre future équipe.",
    heroTitleEnterprise: "Votre Prochaine Opportunité Tech vous Attend",
    heroSubtitleEnterprise: "Explorez des rôles exclusifs dans les entreprises leaders au Maroc. Le tremplin de votre carrière commence ici.",
    getStarted: 'Commencer',
    searchPlaceholderTalent: 'Rechercher par nom, compétence, rôle...',
    searchPlaceholderEnterprise: 'Rechercher par titre, entreprise, compétence...',
    noResults: 'Aucun résultat trouvé pour',
    adjustSearch: 'Essayez d\'ajuster vos critères de recherche.',
    talentCard: {
      experience: 'ans d\'expérience',
      topSkills: 'Compétences clés',
      viewProfile: 'Voir le Profil',
    },
    jobCard: {
      requiredSkills: 'Compétences requises',
      applyNow: 'Postuler Maintenant',
    },
    footer: {
      copyright: "Tous Droits Réservés.",
      tagline: "Connecter la Nouvelle Génération IT du Maroc.",
    }
  },
  EN: {
    appName: 'ITGenz',
    findTalent: 'Candidates',
    findJobs: 'Jobs',
    heroTitleTalent: "Discover The New Generation of IT Experts in Morocco",
    heroSubtitleTalent: "Access an elite network of developers, engineers, and designers to build your future team.",
    heroTitleEnterprise: "Your Next Tech Opportunity Awaits",
    heroSubtitleEnterprise: "Explore exclusive roles at leading companies in Morocco. Your career launchpad starts here.",
    getStarted: 'Get Started',
    searchPlaceholderTalent: 'Search by name, skill, role...',
    searchPlaceholderEnterprise: 'Search by title, company, skill...',
    noResults: 'No results found for',
    adjustSearch: 'Try adjusting your search criteria.',
    talentCard: {
      experience: 'years of experience',
      topSkills: 'Top Skills',
      viewProfile: 'View Profile',
    },
    jobCard: {
      requiredSkills: 'Required Skills',
      applyNow: 'Apply Now',
    },
    footer: {
      copyright: "All Rights Reserved.",
      tagline: "Connecting Morocco's New IT Generation.",
    }
  },
  AR: {
    appName: 'ITGenz',
    findTalent: 'المرشحون',
    findJobs: 'الوظائف',
    heroTitleTalent: 'اكتشف الجيل الجديد من خبراء تكنولوجيا المعلومات في المغرب',
    heroSubtitleTalent: 'انضم إلى شبكة النخبة من المطورين والمهندسين والمصممين لبناء فريق أحلامك.',
    heroTitleEnterprise: 'فرصتك التقنية التالية في انتظارك',
    heroSubtitleEnterprise: 'استكشف وظائف حصرية في الشركات الرائدة بالمغرب. انطلاقة مسيرتك المهنية تبدأ هنا.',
    getStarted: 'ابدأ الآن',
    searchPlaceholderTalent: 'ابحث بالاسم، المهارة، الدور...',
    searchPlaceholderEnterprise: 'ابحث بالمنصب، الشركة، المهارة...',
    noResults: 'لم يتم العثور على نتائج لـ',
    adjustSearch: 'حاول تعديل معايير البحث.',
    talentCard: {
      experience: 'سنوات من الخبرة',
      topSkills: 'أبرز المهارات',
      viewProfile: 'عرض الملف الشخصي',
    },
    jobCard: {
      requiredSkills: 'المهارات المطلوبة',
      applyNow: 'قدم الآن',
    },
    footer: {
      copyright: "كل الحقوق محفوظة.",
      tagline: "نصل الجيل الجديد من تكنولوجيا المعلومات في المغرب.",
    }
  }
};


// --- MOCK DATA ---
const TALENT_DATA: TalentProfile[] = [
    { id: 1, name: 'Lina Berrada', title: 'Senior MERN Stack Developer', location: 'Casablanca', experience: 7, skills: ['React', 'Node.js', 'TypeScript'], imageUrl: 'https://picsum.photos/seed/lina/200' },
    { id: 2, name: 'Adam Alami', title: 'Cloud & DevOps Engineer', location: 'Rabat', experience: 5, skills: ['AWS', 'Kubernetes', 'CI/CD'], imageUrl: 'https://picsum.photos/seed/adam/200' },
    { id: 3, name: 'Sara Alaoui', title: 'AI/ML Specialist', location: 'Marrakech', experience: 6, skills: ['Python', 'TensorFlow', 'NLP'], imageUrl: 'https://picsum.photos/seed/sara/200' },
    { id: 4, name: 'Mehdi Fassi', title: 'Lead Mobile Developer', location: 'Casablanca', experience: 8, skills: ['Swift', 'Kotlin', 'React Native'], imageUrl: 'https://picsum.photos/seed/mehdi/200' },
    { id: 5, name: 'Kenza Ziani', title: 'Lead UI/UX Designer', location: 'Rabat', experience: 9, skills: ['Figma', 'User Research', 'Prototyping'], imageUrl: 'https://picsum.photos/seed/kenza/200' },
];

const JOB_DATA: JobPosting[] = [
    { id: 1, title: 'Senior Frontend Engineer', company: 'Maroc Innovate', location: 'Casablanca', salary: '45-60k MAD', skills: ['React', 'Next.js', 'TailwindCSS'], companyLogoUrl: 'https://picsum.photos/seed/minnovate/100' },
    { id: 2, title: 'Backend Team Lead (Java)', company: 'Atlas Solutions', location: 'Rabat', salary: '55-75k MAD', skills: ['Java', 'Spring Boot', 'Microservices'], companyLogoUrl: 'https://picsum.photos/seed/atlas/100' },
    { id: 3, title: 'Data Scientist', company: 'Sahara Insights', location: 'Remote', salary: '50-65k MAD', skills: ['Python', 'SQL', 'Machine Learning'], companyLogoUrl: 'https://picsum.photos/seed/sahara/100' },
    { id: 4, title: 'Cloud Security Architect', company: 'CyberNet Maroc', location: 'Casablanca', salary: '65-85k MAD', skills: ['Azure', 'Security', 'Compliance'], companyLogoUrl: 'https://picsum.photos/seed/cybernet/100' },
    { id: 5, title: 'Digital Product Manager', company: 'FutureTech MA', location: 'Rabat', salary: '60-80k MAD', skills: ['Agile', 'Roadmapping', 'JIRA'], companyLogoUrl: 'https://picsum.photos/seed/futuretech/100' },
];

// --- REUSABLE UI COMPONENTS ---

const SkillBadge: FC<{ skill: string }> = ({ skill }) => (
  <span className="inline-block bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-sky-900 dark:text-sky-200">
    {skill}
  </span>
);

const IconText: FC<{ icon: React.ElementType, text: string | number, className?: string }> = ({ icon: Icon, text, className = '' }) => (
  <div className={`flex items-center text-sm text-gray-600 dark:text-gray-400 ${className}`}>
    <Icon className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
    <span>{text}</span>
  </div>
);

// --- Animated Logo Component ---
const AnimatedLogo: FC = () => (
  <div className="relative w-8 h-8" aria-label="ITGenz animated logo">
    {/* Stationary Square (Enterprise) */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-600 rounded-sm transition-colors"></div>
    
    {/* Orbiting Container */}
    <div className="absolute w-full h-full animate-orbit">
       {/* Glowing Circle (Genz Talent) */}
       <div 
         className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-sky-400 rounded-full shadow-[0_0_8px_1px_#0ea5e9]"
       ></div>
    </div>
  </div>
);


// --- CARD COMPONENTS ---

const TalentCard: FC<{ profile: TalentProfile; lang: Language }> = ({ profile, lang }) => (
  <div className="bg-white dark:bg-gray-800/50 rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-200/50 dark:border-gray-700/50">
    <div className="p-8">
      <div className="flex items-center space-x-5">
        <img className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700" src={profile.imageUrl} alt={profile.name} />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h3>
          <p className="text-sky-600 dark:text-sky-400 font-semibold">{profile.title}</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <IconText icon={MapPin} text={profile.location} />
        <IconText icon={Star} text={`${profile.experience} ${translations[lang].talentCard.experience}`} />
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{translations[lang].talentCard.topSkills}</h4>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map(skill => <SkillBadge key={skill} skill={skill} />)}
        </div>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800 px-8 py-4">
      <a href="#root" className="text-sm font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors duration-200">
        {translations[lang].talentCard.viewProfile} &rarr;
      </a>
    </div>
  </div>
);

const JobCard: FC<{ job: JobPosting; lang: Language }> = ({ job, lang }) => (
  <div className="bg-white dark:bg-gray-800/50 rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col border border-gray-200/50 dark:border-gray-700/50">
    <div className="p-8 flex-grow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm">{job.company}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{job.title}</h3>
        </div>
        <img className="h-14 w-14 rounded-xl object-cover" src={job.companyLogoUrl} alt={`${job.company} logo`} />
      </div>
      <div className="mt-6 space-y-3">
        <IconText icon={MapPin} text={job.location} />
        <IconText icon={DollarSign} text={job.salary} />
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{translations[lang].jobCard.requiredSkills}</h4>
        <div className="flex flex-wrap gap-2">
          {job.skills.map(skill => <SkillBadge key={skill} skill={skill} />)}
        </div>
      </div>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800 px-8 py-4 mt-auto">
       <a href="#root" className="text-sm font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 transition-colors duration-200">
        {translations[lang].jobCard.applyNow} &rarr;
      </a>
    </div>
  </div>
);


// --- LAYOUT COMPONENTS ---

const Header: FC<{
  currentView: View;
  setView: (view: View) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}> = ({ currentView, setView, language, setLanguage, darkMode, setDarkMode }) => {
  const t = translations[language];
  const baseButtonClass = "px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900";
  const activeButtonClass = "bg-sky-500 text-white shadow-md";
  const inactiveButtonClass = "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
  
  const langButtonBaseClass = "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900";
  const activeLangButtonClass = "bg-sky-500 text-white";
  const inactiveLangButtonClass = "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";
  
  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <AnimatedLogo />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{t.appName}</span>
          </div>
          
          <div className="hidden md:flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl space-x-1">
            <button onClick={() => setView('TALENT')} className={`${baseButtonClass} ${currentView === 'TALENT' ? activeButtonClass : inactiveButtonClass}`}>
              <Users className="w-4 h-4 inline-block mr-2" /> {t.findTalent}
            </button>
            <button onClick={() => setView('ENTERPRISE')} className={`${baseButtonClass} ${currentView === 'ENTERPRISE' ? activeButtonClass : inactiveButtonClass}`}>
              <Briefcase className="w-4 h-4 inline-block mr-2" /> {t.findJobs}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg space-x-1">
              {(['FR', 'EN', 'AR'] as Language[]).map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`${langButtonBaseClass} ${language === lang ? activeLangButtonClass : inactiveLangButtonClass}`}>
                  {lang}
                </button>
              ))}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500">
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Hero: FC<{ currentView: View; lang: Language; onGetStartedClick: () => void;}> = ({ currentView, lang, onGetStartedClick }) => {
  const t = translations[lang];
  const title = currentView === 'TALENT' ? t.heroTitleTalent : t.heroTitleEnterprise;
  const subtitle = currentView === 'TALENT' ? t.heroSubtitleTalent : t.heroSubtitleEnterprise;
  
  return (
    <section className="py-24 sm:py-32 text-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          {subtitle}
        </p>
        <button onClick={onGetStartedClick} className="mt-10 px-8 py-4 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900">
          {t.getStarted}
        </button>
      </div>
    </section>
  );
};

const SearchBar: FC<{ query: string; setQuery: (q: string) => void; view: View; lang: Language; }> = ({ query, setQuery, view, lang }) => {
  const t = translations[lang];
  const placeholder = view === 'TALENT' ? t.searchPlaceholderTalent : t.searchPlaceholderEnterprise;
  
  return (
    <div className="relative max-w-2xl mx-auto -mt-10 mb-12 px-4 z-10">
      <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-500 border border-transparent dark:border-gray-700/50 transition-all duration-300"
      />
    </div>
  );
};

const Footer: FC<{lang: Language}> = ({lang}) => {
  const t = translations[lang].footer;
  const currentYear = new Date().getFullYear();
  return(
    <footer className="bg-gray-100 dark:bg-gray-800/50 mt-24 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">&copy; {currentYear} ITGenz. {t.copyright}</p>
        <p className="text-sm mt-1 font-semibold text-sky-700 dark:text-sky-400">{t.tagline}</p>
      </div>
    </footer>
  );
}

// --- MAIN APP COMPONENT ---

const App: FC = () => {
  const [view, setView] = useState<View>('TALENT');
  const [language, setLanguage] = useState<Language>('FR');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.remove('bg-gray-50');
      document.body.classList.add('bg-gray-900');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
      document.body.classList.add('bg-gray-50');
    }
  }, [darkMode]);
  
  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
    document.documentElement.dir = language === 'AR' ? 'rtl' : 'ltr';
  }, [language]);


  const handleGetStartedClick = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const filteredData = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    if (!lowercasedQuery) {
      return view === 'TALENT' ? TALENT_DATA : JOB_DATA;
    }

    if (view === 'TALENT') {
      return TALENT_DATA.filter(p =>
        p.name.toLowerCase().includes(lowercasedQuery) ||
        p.title.toLowerCase().includes(lowercasedQuery) ||
        p.skills.some(s => s.toLowerCase().includes(lowercasedQuery))
      );
    } else {
      return JOB_DATA.filter(j =>
        j.title.toLowerCase().includes(lowercasedQuery) ||
        j.company.toLowerCase().includes(lowercasedQuery) ||
        j.skills.some(s => s.toLowerCase().includes(lowercasedQuery))
      );
    }
  }, [searchQuery, view]);
  
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        currentView={view} 
        setView={setView}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <main>
        <Hero currentView={view} lang={language} onGetStartedClick={handleGetStartedClick} />
        <SearchBar query={searchQuery} setQuery={setSearchQuery} view={view} lang={language} />

        <div ref={contentRef} className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredData.map(item => (
                view === 'TALENT' 
                  ? <TalentCard key={(item as TalentProfile).id} profile={item as TalentProfile} lang={language} />
                  : <JobCard key={(item as JobPosting).id} job={item as JobPosting} lang={language} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {t.noResults} "{searchQuery}"
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t.adjustSearch}</p>
            </div>
          )}
        </div>
      </main>
      <Footer lang={language}/>
    </div>
  );
};

export default App;
