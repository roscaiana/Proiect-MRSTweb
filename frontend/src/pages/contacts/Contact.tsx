import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, User, AtSign, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormValues } from '../../schemas/contactSchema';
import Sidebar from "../../components/SideBar/SideBar";
import './Contact.css';

const Contact = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
        reValidateMode: 'onChange',
    });

    const onSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            reset();
        }, 1500);
    };

    useEffect(() => {
        const body = globalThis["document"]?.body;
        body?.classList.toggle("no-scroll", sidebarOpen);
        return () => {
            body?.classList.remove("no-scroll");
        };
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <>
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />
            <main>
                <div className="contact-container">
                    <div className="contact-hero">
                        <div className="hero-overlay-1"></div>
                        <div className="hero-overlay-2"></div>

                        <div className="hero-content">
                            <div className="page-hero-badge">
                                <span className="page-hero-badge-icon" aria-hidden="true">
                                    <MessageSquare />
                                </span>
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
                            <div className="contact-sidebar">
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

                                                <form onSubmit={handleSubmit(onSubmit)} className="form-grid-wrapper">
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label className="form-label">Nume Complet</label>
                                                            <div className="input-wrapper">
                                                                <User className="input-icon" />
                                                                <input
                                                                    type="text"
                                                                    {...register('name')}
                                                                    className="form-input"
                                                                    placeholder="Ex: Ion Popescu"
                                                                />
                                                            </div>
                                                            {errors.name && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.name.message}</p>}
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">Email</label>
                                                            <div className="input-wrapper">
                                                                <AtSign className="input-icon" />
                                                                <input
                                                                    type="email"
                                                                    {...register('email')}
                                                                    className="form-input"
                                                                    placeholder="ex@exemplu.md"
                                                                />
                                                            </div>
                                                            {errors.email && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.email.message}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="form-group" style={{ marginTop: '2rem' }}>
                                                        <label className="form-label">Subiect</label>
                                                        <input
                                                            type="text"
                                                            {...register('subject')}
                                                            className="form-input"
                                                            placeholder="Cum vă putem ajuta?"
                                                        />
                                                        {errors.subject && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.subject.message}</p>}
                                                    </div>

                                                    <div className="form-group" style={{ marginTop: '2rem' }}>
                                                        <label className="form-label">Mesaj</label>
                                                        <textarea
                                                            {...register('message')}
                                                            rows={6}
                                                            className="form-textarea"
                                                            placeholder="Scrieți mesajul detaliat aici..."
                                                        />
                                                        {errors.message && <p className="form-error"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {errors.message.message}</p>}
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
        </>
    );
};

export default Contact;
