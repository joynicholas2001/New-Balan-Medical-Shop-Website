import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Pill, ShieldCheck, ChevronRight } from 'lucide-react';
import './Hero.css';
import heroImg from '../../assets/images/hero-banner.png';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <img src={heroImg} alt="New Balan Healthcare" className="hero-bg" />

            <div className="container hero-container">
                <div className="hero-content">
                    <span className="hero-badge">Trusted Since 1997</span>
                    <h1>Comprehensive Healthcare Solutions for Your Family</h1>
                    <p>
                        Experience premium medical care at NEW BALAN. From multi-specialty clinic consultations
                        to doorstep pharmacy delivery and expert insurance guidance.
                    </p>

                    <div className="hero-ctas">
                        <Link to="/pharmacy" className="btn btn-secondary">
                            <Pill size={20} />
                            <span>Order Medicines</span>
                        </Link>
                    </div>

                    <div className="hero-features">
                        <div className="h-feature">
                            <ShieldCheck className="feature-icon" />
                            <span>Star Health Partner</span>
                        </div>
                        <div className="h-feature">
                            <ChevronRight className="feature-icon" />
                            <span>9 AM - 9 PM Pharmacy</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
