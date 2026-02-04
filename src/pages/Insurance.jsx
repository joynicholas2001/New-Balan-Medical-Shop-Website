import React from 'react';
import { ShieldPlus, CheckCircle, MessageSquare, Phone, HelpCircle, UserCheck, Activity, Users, Heart, AlertCircle, User } from 'lucide-react';
import './Insurance.css';

const Insurance = () => {
    const benefits = [
        "Cashless hospitalization in 14000+ network hospitals.",
        "No pre-acceptance medical screening up to 50 years.",
        "Coverage for pre-existing diseases after 48 months.",
        "Direct in-house claim settlement (No TPA).",
        "Lifetime renewal facility.",
        "Tax benefits under Section 80D."
    ];

    return (
        <div className="insurance-page animate-fade">
            <header className="page-header insurance-header">
                <div className="container">
                    <h1 style={{ color: '#fff' }}>Star Health & Allied Insurance</h1>
                    <p>Securing your family's future with India's first standalone health insurance provider.</p>
                </div>
            </header>
            <section className="section consultation-box">
                <div className="container">
                    <div className="timing-card grid grid-2">
                        <div className="timing-info">
                            <UserCheck className="timing-icon-main" size={48} />
                            <h2>Consult with Manikandan</h2>
                            <p>Zonal Manager Club Achiever - Star Health Insurance</p>
                            <div className="timings-list">
                                <div className="t-item"><strong>In-Person Consultation:</strong><span>1:00 PM – 2:00 PM (Daily)</span></div>
                                <div className="t-item"><strong>Phone / WhatsApp:</strong><span>Anytime</span></div>
                            </div>
                            <div className="action-btns flex gap-2">
                                <a href="https://wa.me/your-number" className="btn btn-secondary"><MessageSquare size={18} /><span>WhatsApp Mani</span></a>
                                <a href="tel:+919876543210" className="btn btn-primary"><Phone size={18} /><span>Call Now</span></a>
                            </div>
                        </div>
                        <div className="promo-image">
                            <div className="achievement-badge"><span className="year">2022</span><span className="title">Zonal Manager Club</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW SIMPLE INFORMATION SECTION */}
            <section className="section simple-info-section">
                <div className="container">
                    <div className="simple-header-box">
                        <h2>Star Health Insurance – Easy Medical Help</h2>
                    </div>

                    <div className="simple-grid">
                        {/* About Star Health */}
                        <div className="simple-card about-card">
                            <div className="card-icon"><ShieldPlus size={32} /></div>
                            <h3>About Star Health</h3>
                            <p>Star Health & Allied Insurance Co. Ltd. is a trusted health insurance company in India.</p>
                            <ul>
                                <li>Started in 2006.</li>
                                <li>Head office is in Chennai, Tamil Nadu.</li>
                                <li>Lakhs of people across India use this insurance.</li>
                            </ul>
                        </div>

                        {/* What This Insurance Does */}
                        <div className="simple-card what-card">
                            <div className="card-icon"><Activity size={32} /></div>
                            <h3>What This Insurance Does</h3>
                            <ul>
                                <li>Health insurance helps pay hospital bills.</li>
                                <li>It helps during sickness or accidents.</li>
                                <li>Insurance company helps pay treatment cost.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Benefits */}
                    <div className="benefits-simple-box">
                        <h3>Main Benefits</h3>
                        <div className="benefits-list-simple">
                            <div className="b-item-simple"><CheckCircle size={20} /> Cashless treatment in more than 14,000 hospitals in India</div>
                            <div className="b-item-simple"><CheckCircle size={20} /> No need to pay money first in many hospitals</div>
                            <div className="b-item-simple"><CheckCircle size={20} /> Helps individuals, families, and senior citizens</div>
                            <div className="b-item-simple"><CheckCircle size={20} /> Covers old illnesses after waiting period</div>
                            <div className="b-item-simple"><CheckCircle size={20} /> Free health check-up in some plans</div>
                            <div className="b-item-simple"><CheckCircle size={20} /> Easy support through mobile app and website</div>
                        </div>
                    </div>

                    {/* Types of Insurance Plans */}
                    <div className="plans-simple-section">
                        <h3>Types of Insurance Plans</h3>
                        <div className="plans-grid-simple">
                            <div className="plan-card-simple">
                                <User size={28} />
                                <h4>Individual Plan</h4>
                                <p>For one person</p>
                            </div>
                            <div className="plan-card-simple">
                                <Users size={28} />
                                <h4>Family Plan</h4>
                                <p>For whole family</p>
                            </div>
                            <div className="plan-card-simple">
                                <Heart size={28} />
                                <h4>Senior Citizen Plan</h4>
                                <p>For elders</p>
                            </div>
                            <div className="plan-card-simple">
                                <AlertCircle size={28} />
                                <h4>Critical Illness Plan</h4>
                                <p>For serious diseases</p>
                            </div>
                        </div>
                    </div>

                    {/* Why Choose & How We Help */}
                    <div className="simple-grid split-cols">
                        <div className="simple-card why-card">
                            <h3>Why Choose Star Health</h3>
                            <ul className="check-list">
                                <li>Large hospital network across India</li>
                                <li>Flexible plans based on age and need</li>
                                <li>Fast cashless claim support</li>
                                <li>Covers before and after hospital expenses</li>
                                <li>Medical test not needed for some people below 50 years</li>
                            </ul>
                        </div>

                        <div className="simple-card help-card">
                            <h3>How New Balan Medical Shop Helps</h3>
                            <p>We are here to guide you every step of the way:</p>
                            <ul className="check-list">
                                <li>Choose the right plan for your budget</li>
                                <li>Understand insurance terms simply</li>
                                <li>Get personal help during hospital treatment</li>
                            </ul>
                            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Visit Us for Help</button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section benefits-section bg-light">
                <div className="container">
                    <div className="section-header"><h2>Why Choose Star Health?</h2><p>Comprehensive coverage and hassle-free claim settlements.</p></div>
                    <div className="grid grid-3">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="benefit-card"><CheckCircle size={24} className="check-icon" /><p>{benefit}</p></div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="section faq-section">
                <div className="container">
                    <div className="section-header"><HelpCircle size={40} className="faq-icon-main" /><h2>Frequently Asked Questions</h2></div>
                    <div className="faq-grid">
                        <div className="faq-item"><h4>What is the waiting period for pre-existing diseases?</h4><p>Typically 48 months of continuous coverage is required for PED coverage in most plans.</p></div>
                        <div className="faq-item"><h4>How do I file a cashless claim?</h4><p>Present your Star Health ID card at any network hospital. Our team can assist with the paperwork.</p></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Insurance;
