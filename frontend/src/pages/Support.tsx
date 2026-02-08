// @ts-ignore
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, LifeBuoy, FileText, HelpCircle } from 'lucide-react';
import { FaqItem, FaqCategory } from '../types';

const Support: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    
    const categories: FaqCategory[] = [
        { id: 'all', title: 'Toate întrebările', icon: HelpCircle },
        { id: 'general', title: 'Informații Generale', icon: FileText },
        { id: 'exam', title: 'Examen și Certificare', icon: FileText },
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
            // @ts-ignore
            // @ts-ignore
            // @ts-ignore
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);
    
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold text-slate-900">Pagina de Suport</h1>
                <p className="mt-4 text-slate-500">Logica de filtrare este activă ({filteredFaqs.length} rezultate găsite).</p>
                <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-lg inline-block font-mono text-sm">
                    Pasul 5 finalizat
                </div>
            </div>
        </div>
    );
};

export default Support;