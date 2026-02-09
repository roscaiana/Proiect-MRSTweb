import React, { useState, FormEvent } from 'react';
import { ContactFormData } from '@/types';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    
    const [errors, setErrors] = useState<Partial<ContactFormData>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const validate = (): boolean => {
        const newErrors: Partial<ContactFormData> = {};
        if (!formData.name.trim()) newErrors.name = 'Numele este obligatoriu';
        if (!formData.email.trim()) {
            newErrors.email = 'Email-ul este obligatoriu';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Adresa de email este invalidă';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subiectul este obligatoriu';
        if (!formData.message.trim()) {
            newErrors.message = 'Mesajul este obligatoriu';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Mesajul trebuie să de minim 10 caractere';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-[#003366] text-white py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Contactați-ne</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                        Suntem aici să vă răspundem la orice întrebare legată de platforma e-Electoral și procesul de certificare.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Contact;