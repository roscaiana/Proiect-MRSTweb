// @ts-ignore
import React, { useState, useMemo } from 'react';
import {Search, ChevronDown, ChevronUp, LifeBuoy, FileText, HelpCircle, Calculator} from 'lucide-react';
import { FaqItem, FaqCategory } from '../types';

const Support: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    
    const categories: FaqCategory[] = [
        { id: 'all', title: 'Toate întrebările', icon: HelpCircle },
        { id: 'general', title: 'Informații Generale', icon: FileText },
        { id: 'exam', title: 'Examen și Certificare', icon: Calculator },
        { id: 'technical', title: 'Suport Tehnic', icon: LifeBuoy },
    ];
    
    const faqs: (FaqItem & { category: string })[] = [
        {
            category: 'general',
            question: 'Cine se poate înscrie la cursurile e-Electoral?',
            answer: 'La cursurile de pe platforma e-Electoral se pot înscrie toți candidații care doresc să obțină certificarea în domeniul electoral, inclusiv viitori funcționari, observatori sau reprezentanți politici.'
        },
        {
            category: 'exam',
            question: 'Cum pot accesa simulările de examen?',
            answer: 'Simulările de examen pot fi accesate din secțiunea Resources Studiu după autentificare. Acestea imită formatul oficial al examenului de certificare.'
        },
        {
            category: 'general',
            question: 'Se oferă sprijin post-certificare?',
            answer: 'Da, e-Electoral oferă resurse de actualizare a cunoștințelor și după promovarea examenului, pentru a fi la curent cu ultimele modificări legislative.'
        },
        {
            category: 'exam',
            question: 'Cât timp este valabil certificatul obținut?',
            answer: 'Certificatul de calificare electorală este valabil pentru o perioadă de 4 ani, după care este necesară o nouă evaluare pentru reconfirmarea competențelor.'
        },
        {
            category: 'exam',
            question: 'Ce se întâmplă dacă nu promovez examenul?',
            answer: 'În cazul în care nu obțineți punctajul minim, aveți dreptul la o reevaluare după o perioadă de studiu suplimentar. Platforma e-Electoral vă va recomanda modulele pe care trebuie să le revizuiți.'
        },
        {
            category: 'technical',
            question: 'Cum îmi pot recupera parola?',
            answer: 'Dacă ați uitat parola, utilizați funcția de recuperare de pe pagina de login. Veți primi un e-mail cu instrucțiuni pentru setarea unei parole noi.'
        },
        {
            category: 'technical',
            question: 'Pot accesa cursurile de pe dispozitive mobile?',
            answer: 'Da, platforma e-Electoral este complet responsivă și poate fi accesată de pe smartphone sau tabletă, oferind o experiență de învățare optimizată pentru orice ecran.'
        },
        {
            category: 'general',
            question: 'Care este durata medie a unui curs de pregătire?',
            answer: 'Durata variază în funcție de complexitatea modulului, dar în medie, un curs complet de pregătire pentru certificare durează între 20 și 40 de ore de studiu individual.'
        },
        {
            category: 'technical',
            question: 'Ce fac dacă întâmpin probleme tehnice în timpul simulării?',
            answer: 'Dacă întâmpinați erori tehnice, vă rugăm să contactați echipa de suport prin formularul de contact sau să utilizați chat-ul de asistență disponibil în colțul din dreapta jos al ecranului.'
        }
    ];

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);
    
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="bg-[#003366] py-20 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                        <LifeBuoy className="w-4 h-4" />
                        Centrul de Ajutor e-Electoral
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                        Cum vă putem ajuta astăzi?
                    </h1>
                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#003366] transition-colors" />
                        <input
                            type="text"
                            placeholder="Căutați întrebări, cursuri sau ghiduri..."
                            className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-white/10 text-slate-800 text-lg transition-all border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-4 gap-8 items-start">
                    {/* Sidebar Categories */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-2">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Categorii</h2>
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                                            ? 'bg-[#003366] text-white shadow-lg shadow-blue-900/20'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#003366]'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        {cat.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Suport Direct*/}
                    <div className="bg-gradient-to-br from-[#f1c40f]/10 to-[#f1c40f]/5 p-8 rounded-3xl border border-[#f1c40f]/20 shadow-sm">
                        <h3 className="font-bold text-[#b7950b] mb-2 uppercase text-[10px] tracking-widest">Suport Direct</h3>
                        <p className="text-slate-600 text-sm mb-6 leading-relaxed">Nu ați găsit răspunsul? Echipa noastră este gata să vă ajute.</p>
                        <a href="/contact" className="inline-flex items-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-xl transition-all active:scale-95">
                            Contactați-ne
                        </a>
                    </div>
           
                    <main className="lg:w-3/4">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Întrebări frecvente</h2>
                            <p className="text-slate-500">
                                Aici vor apărea cele **{filteredFaqs.length}** rezultate găsite.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Support;