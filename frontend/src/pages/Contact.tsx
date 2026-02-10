import React, { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, MessageSquare, User, AtSign } from 'lucide-react';
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSubmitted(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
            }, 1500);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof ContactFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
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
            
            <div className="max-w-7xl mx-auto px-4 -mt-10 pb-20">
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Sidebar - Contact info + Map */}
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-[#003366] rounded-xl">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Email</h3>
                                    <p className="text-slate-500 text-sm">contact@e-electoral.md</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-[#003366] rounded-xl">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Telefon</h3>
                                    <p className="text-slate-500 text-sm">+373 22 232 506</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-[#003366] rounded-xl">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Adresă</h3>
                                    <p className="text-slate-500 text-sm">str. Vasile Alecsandri, 119</p>
                                </div>
                            </div>
                        </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-80 overflow-hidden relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2720.4705030221375!2d28.84131!3d47.01777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c369fc63bd5%3A0xf670868f0a0c4974!2sStrada%20Vasile%20Alecsandri%20119%2C%20Chi%C8%99in%C4%83u%2C%20Moldova!5e0!3m2!1sen!2smd!4v1710500000000!5m2!1sen!2smd"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Locație e-Electoral"
                            className="grayscale hover:grayscale-0 transition-all duration-700"
                        ></iframe>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-slate-100 h-full">
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-[#f1c40f]" />
                                    Trimite-ne un mesaj
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Nume Complet</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all outline-none`}
                                                    placeholder="Ex: Ion Popescu"
                                                />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                                            <div className="relative">
                                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl focus:outline-none focus:border-[#003366] focus:ring-4 focus:ring-[#003366]/5 transition-all outline-none`}
                                                    placeholder="ex@exemplu.md"
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                        </div>
                                    </div>
                                </form>
                            </>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Contact;