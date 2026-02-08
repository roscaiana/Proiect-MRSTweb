// @ts-ignore
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, LifeBuoy, FileText, HelpCircle } from 'lucide-react';
import { FaqItem, FaqCategory } from '../types';

const Support: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold text-slate-900">Pagina de Suport</h1>
                <p className="mt-4 text-slate-500">Se incarca configuratia de baza...</p>
            </div>
        </div>
    );
};

export default Support;