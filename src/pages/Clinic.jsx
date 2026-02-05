import React from 'react';
import { useData } from '../context/DataContext';
import LocationSection from '../components/common/LocationSection';
import { Clock, Search, MapPin, CheckCircle2, Baby, Activity, Droplets } from 'lucide-react';
import './Clinic.css';

const Clinic = () => {
    const { doctors } = useData();

    return (
        <div className="clinic-page animate-fade">
            <header className="page-header clinic-header">
                <div className="container">
                    <h1 style={{ color: '#fff' }}>Specialist Consultations</h1>
                    <p>Schedule your appointment with our expert doctors.</p>
                </div>
            </header>

            <section className="section doctors-section">
                <div className="container doctors-container-centered">
                    <div className="doctors-list">
                        <h2 className="sub-heading" style={{ textAlign: 'center' }}>Available Specialists</h2>
                        {doctors.map(doc => (
                            <div key={doc.id} className="professional-doc-card">
                                <div className="doc-profile-side">
                                    <div className="doc-avatar">
                                        <div className="avatar-circle">
                                            {doc.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className={`online-dot ${doc.available ? 'active' : 'inactive'}`}></div>
                                    </div>
                                    <div className={`status-pill ${doc.available ? 'online' : 'offline'}`}>
                                        {doc.available ? 'Available' : 'Currently Away'}
                                    </div>
                                </div>

                                <div className="doc-content-side">
                                    <div className="doc-header-info">
                                        <h3>{doc.name}</h3>
                                        <div className="specialty-badge">{doc.specialty}</div>
                                    </div>

                                    <p className="doc-sub-text">{doc.subSpecialty || 'General Medical Consultant'}</p>

                                    <div className="doc-meta">
                                        <span className="meta-item"><CheckCircle2 size={14} /> {doc.qualification}</span>
                                    </div>

                                    <div className="timing-grid">
                                        <div className="timing-slot">
                                            <span className="slot-label">Morning</span>
                                            <span className="slot-time">{doc.morning}</span>
                                        </div>
                                        <div className="timing-slot">
                                            <span className="slot-label">Evening</span>
                                            <span className="slot-time">{doc.evening}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section services-highlight-section" style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                <div className="container">
                    <h2 className="sub-heading" style={{ textAlign: 'center' }}>Our Specialized Services & Facilities</h2>
                    <div className="clinic-services-grid">
                        <div className="service-highlight-card">
                            <div className="service-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                <Baby size={32} />
                            </div>
                            <h3>Children's Care</h3>
                            <p>Specialized paediatric treatments and wellness checkups for infants and children.</p>
                        </div>
                        <div className="service-highlight-card">
                            <div className="service-icon-box" style={{ background: '#fff1f2', color: '#e11d48' }}>
                                <Activity size={32} />
                            </div>
                            <h3>Diabetes Management</h3>
                            <p>Comprehensive care, monitoring, and lifestyle guidance for diabetic patients.</p>
                        </div>
                        <div className="service-highlight-card">
                            <div className="service-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                                <Droplets size={32} />
                            </div>
                            <h3>IV Proofing</h3>
                            <p>Advanced in-house IV fluids and proofing facilities available for immediate care.</p>
                        </div>
                    </div>
                </div>
            </section>

            <LocationSection />
        </div>
    );
};

export default Clinic;
