import React from 'react';
import { Users, History, Award } from 'lucide-react';
import LocationSection from '../components/common/LocationSection';
import maniImage from '../assets/images/mani-profile.jpg';
import './About.css';

const About = () => {
    const milestones = [
        {
            year: "1997",
            title: "Medical Shop Established",
            desc: "Inception of NEW BALAN Medical with a vision to serve the community with genuine pharmaceutical care."
        },
        {
            year: "2022",
            title: "Introduced Star Health",
            desc: "Expanded services into health insurance, partnering with Star Health to provide financial security to families."
        },
        {
            year: "2023",
            title: "Zonal Manager Club",
            desc: "Achieved the prestigious Zonal Manager Club status within the very first year of operations."
        },
        {
            year: "2024",
            title: "Branch Manager - Zonal Manager Club",
            desc: "Achieved a key milestone by becoming a Branch Manager and earning recognition in the Zonal Manager Club for outstanding performance and leadership."
        }
    ];

    return (
        <div className="about-page animate-fade">
            <header className="page-header about-header">
                <div className="container"><h1 style={{ color: '#fff' }}>Founder's Journey</h1><p>The story behind NEW BALAN's legacy of trust and care.</p></div>
            </header>
            <section className="section founder-profile">
                <div className="container grid grid-2 items-center">
                    <div className="founder-image">
                        <div className="profile-frame">
                            <img src={maniImage} alt="Mani - Founder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                    <div className="founder-text">
                        <span className="badge badge-blue">The Visionary</span>
                        <h2>MANIKANDAN - Founder & Director</h2>
                        <p>With over 29 years of experience in the pharmaceutical industry, Mani founded NEW BALAN with a single mission: to make healthcare accessible and reliable.</p>
                        <div className="stats-grid">
                            <div className="stat-item"><History className="stat-icon" /><div><strong>25 + Years</strong><p>In Healthcare</p></div></div>
                            <div className="stat-item"><Award className="stat-icon" /><div><strong>Zonal Club</strong><p>Star Health Award</p></div></div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section timeline-section bg-light">
                <div className="container">
                    <div className="section-header"><h2>Our Historical Timeline</h2><p>Growth milestones from a local shop to a healthcare hub.</p></div>
                    <div className="timeline-container">
                        {milestones.map((m, idx) => (
                            <div
                                key={idx}
                                className={`timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}
                            >
                                <div className="timeline-content">
                                    <span className="t-year">{m.year}</span>
                                    <h3>{m.title}</h3>
                                    <p>{m.desc}</p>
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

export default About;
