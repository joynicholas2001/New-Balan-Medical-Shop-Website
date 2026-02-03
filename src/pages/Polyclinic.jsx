import React from 'react';
import { Heart, Droplets, Plus } from 'lucide-react';
import LocationSection from '../components/common/LocationSection';
import './Polyclinic.css';

const Polyclinic = () => {
    const facilities = [
        { icon: <Droplets />, title: "IV Fluids", desc: "IV fluids available for quick hydration and electrolyte support under proper medical care." },
        { icon: <Heart />, title: "Emergency Medicine and Treatment", desc: "Essential emergency medicines and immediate treatment support for urgent health needs." },
        { icon: <Plus />, title: "First Aid", desc: "Basic first aid supplies and support for minor injuries and immediate care needs." }
    ];

    return (
        <div className="polyclinic-page animate-fade">
            <header className="page-header polyclinic-header">
                <div className="container"><h1 style={{ color: '#fff' }}>Polyclinic Services</h1><p>Multi-specialty healthcare under one roof.</p></div>
            </header>
            <section className="section services-grid-section">
                <div className="container">
                    <div className="grid grid-4">
                        {facilities.map((fact, idx) => (
                            <div key={idx} className="facility-card"><div className="fact-icon">{fact.icon}</div><h3>{fact.title}</h3><p>{fact.desc}</p></div>
                        ))}
                    </div>
                </div>
            </section>

            <LocationSection />
        </div>
    );
};

export default Polyclinic;
