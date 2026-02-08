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
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold text-slate-900">Pagina de Suport</h1>
                <p className="mt-4 text-slate-500">Categoriile au fost încărcate ({categories.length} categorii).</p>
                <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-lg inline-block font-mono text-sm">
                    Pasul 3 finalizat
                </div>
            </div>
        </div>
    );
};

export default Support;