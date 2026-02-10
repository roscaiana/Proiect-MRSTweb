// Updated: Uses Contact.css
import React, { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, User, AtSign, CheckCircle2 } from 'lucide-react';
import { ContactFormData } from '../types';
import TopBar from "../HomePage/TopBar/TopBar";
import Header from "../HomePage/Header/Header";
import Sidebar from "../HomePage/SideBar/SideBar";
import Footer from "../HomePage/Footer/Footer";
import './Contact.css';

const Contact: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

    const openSidebar = () => {
        setSidebarOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        document.body.style.overflow = "";
    };

    return (
        <>
            <TopBar />
            <Header onOpenSidebar={openSidebar} />
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />
            <main>
                <div className="contact-container">
            {/* Hero Section */}
            <div className="contact-hero">
                <div className="hero-overlay-1"></div>
                <div className="hero-overlay-2"></div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <MessageSquare className="w-4 h-4 text-blue-200" />
                        <span className="uppercase">Disponibili 24/7</span>
                    </div>

                    <h1 className="hero-title">
                        Contactați-<span className="hero-title-highlight">ne</span>
                    </h1>

                    <p className="hero-subtitle">
                        Suntem aici să vă răspundem la orice întrebare legată de platforma e-Electoral și procesul de certificare.
                    </p>
                </div>
            </div>

            <div className="main-content">
                <div className="contact-grid">
                    {/* Sidebar Section */}
                    <div className="contact-sidebar">
                        {/* Contact Cards */}
                        <div className="info-card">
                            <div className="info-card-content">
                                <div className="info-icon-wrapper">
                                    <Mail className="info-icon" />
                                </div>
                                <div className="info-details">
                                    <h3 className="info-label">Email</h3>
                                    <p className="info-value">contact@e-electoral.md</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-content">
                                <div className="info-icon-wrapper">
                                    <Phone className="info-icon" />
                                </div>
                                <div className="info-details">
                                    <h3 className="info-label">Telefon</h3>
                                    <p className="info-value">+373 22 232 506</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-content">
                                <div className="info-icon-wrapper">
                                    <MapPin className="info-icon" />
                                </div>
                                <div className="info-details">
                                    <h3 className="info-label">Adresă</h3>
                                    <p className="info-value">str. Vasile Alecsandri, 119</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div className="map-container">
                            <div className="map-wrapper">
                                <div className="map-overlay"></div>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2720.4705030221375!2d28.84131!3d47.01777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97c369fc63bd5%3A0xf670868f0a0c4974!2sStrada%20Vasile%20Alecsandri%20119%2C%20Chi%C8%99in%C4%83u%2C%20Moldova!5e0!3m2!1sen!2smd!4v1710500000000!5m2!1sen!2smd"
                                    className="map-iframe"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Locație e-Electoral"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="form-section">
                        <div className="form-card">
                            <div className="form-blob-1"></div>
                            <div className="form-blob-2"></div>

                            <div className="form-card-inner">
                                {isSubmitted ? (
                                    <div className="success-state">
                                        <div className="success-icon-wrapper">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <h2 className="success-title">Mesaj Trimis cu Succes!</h2>
                                        <p className="success-message">
                                            Vă mulțumim pentru interes. Echipa noastră va analiza solicitarea și vă va contacta în cel mai scurt timp posibil.
                                        </p>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="success-reset-btn"
                                        >
                                            <Send className="w-4 h-4" />
                                            Trimite un alt mesaj
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-header">
                                            <h2 className="form-title">
                                                Trimite-ne un mesaj
                                            </h2>
                                            <p className="form-subtitle">Completați formularul de mai jos și vă vom răspunde rapid.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="form-grid-wrapper">
                                            <div className="form-grid">
                                                <div className="form-group">
                                                    <label className="form-label">Nume Complet</label>
                                                    <div className="input-wrapper">
                                                        <User className="input-icon" />
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                            placeholder="Ex: Ion Popescu"
                                                        />
                                                    </div>
                                                    {errors.name && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.name}</p>}
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Email</label>
                                                    <div className="input-wrapper">
                                                        <AtSign className="input-icon" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="form-input"
                                                            placeholder="ex@exemplu.md"
                                                        />
                                                    </div>
                                                    {errors.email && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.email}</p>}
                                                </div>
                                            </div>

                                            <div className="form-group" style={{ marginTop: '2rem' }}>
                                                <label className="form-label">Subiect</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="Cum vă putem ajuta?"
                                                />
                                                {errors.subject && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.subject}</p>}
                                            </div>

                                            <div className="form-group" style={{ marginTop: '2rem' }}>
                                                <label className="form-label">Mesaj</label>
                                                <textarea
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    rows={6}
                                                    className="form-textarea"
                                                    placeholder="Scrieți mesajul detaliat aici..."
                                                />
                                                {errors.message && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.message}</p>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="submit-btn"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="spinner" />
                                                        Se trimite...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        TRIMITE MESAJUL
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            </main>
            <Footer />
        </>
    );
};

export default Contact;