// @ts-ignore
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, LifeBuoy, FileText, HelpCircle } from 'lucide-react';
import { FaqItem, FaqCategory } from '../types';

const Support: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold text-slate-900">Pagina de Suport</h1>
                <p className="mt-4 text-slate-500">Starile au fost initializate (Search: "{searchQuery}", Categorie: {activeCategory}).</p>
                <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-lg inline-block font-mono text-sm">
                    Pasul 2 finalizat
                </div>
            </div>
        </div>
    );
};

export default Support;