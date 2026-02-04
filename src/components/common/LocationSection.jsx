import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const LocationSection = () => {
    return (
        <section className="section location-section bg-light" style={{ padding: '4rem 0' }}>
            <div className="container">
                <div className="section-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <span className="badge badge-blue">Our Clinic</span>
                    <h2>Visit Us Today</h2>
                </div>

                <div className="location-card" style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary-light)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        marginBottom: '1rem'
                    }}>
                        <MapPin size={32} />
                    </div>

                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>New Balan medicals</h2>

                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--gray-600)',
                        marginBottom: '1.5rem',
                        maxWidth: '500px',
                        lineHeight: '1.6'
                    }}>
                        120/a Poobalarayapuram 2nd street,<br />
                        Thoothukudi, Tamil Nadu 628001
                    </p>

                    <a
                        href="https://maps.app.goo.gl/pvMjw454bA21VuQu9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        <Navigation size={18} />
                        Get Directions
                    </a>
                </div>
            </div>
        </section>
    );
};

export default LocationSection;
