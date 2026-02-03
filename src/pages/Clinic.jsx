import React from 'react';
import { useData } from '../context/DataContext';
import LocationSection from '../components/common/LocationSection';
import { Phone, Clock, Search, MapPin, CheckCircle2 } from 'lucide-react';
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
                            <div key={doc.id} className="doctor-card">
                                <div className="doc-image">
                                    <div className="placeholder-doc"><CheckCircle2 size={40} /></div>
                                    <div className={`status-indicator ${doc.available ? 'online' : 'offline'}`}>
                                        {doc.available ? 'Available' : 'Unavailable'}
                                    </div>
                                </div>
                                <div className="doc-info">
                                    <h3>{doc.name}</h3>
                                    <p className="doc-spec" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>{doc.specialty}</p>
                                    {doc.subSpecialty && <p className="doc-sub-spec" style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>{doc.subSpecialty}</p>}
                                    <p className="doc-qual" style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{doc.qualification}</p>
                                    <div className="doc-timings">
                                        <div className="timing-row"><Clock size={16} /> <span>Morning: {doc.morning}</span></div>
                                        <div className="timing-row"><Clock size={16} /> <span>Evening: {doc.evening}</span></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <LocationSection />
        </div>
    );
};

export default Clinic;
