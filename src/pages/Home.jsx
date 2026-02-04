import React from 'react';
import Hero from '../components/home/Hero';
import LocationSection from '../components/common/LocationSection';
import { Stethoscope, Baby, Eye, Activity, Pill, Truck, FileText, Shield } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />

            {/* Clinic Specialties Section */}
            <section className="section clinic-specialties">
                <div className="container">
                    <div className="section-header">
                        <span className="badge badge-blue">Our Clinic</span>
                        <h2>Expert Consultations</h2>
                        <p>Quality diagnostic and treatment services by experienced specialists.</p>
                    </div>

                    <div className="specialty-grid">
                        <div className="specialty-card">
                            <div className="card-icon"><Baby size={32} /></div>
                            <h3>Paediatrics</h3>
                            <p>Specialized healthcare for infants, children, and adolescents.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="card-icon"><Eye size={32} /></div>
                            <h3>Ophthalmology</h3>
                            <p>Complete eye care services and vision correction consultations.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="card-icon"><Activity size={32} /></div>
                            <h3>Diabetology</h3>
                            <p>Expert management and screening for diabetes and related conditions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pharmacy Highlights */}
            <section className="section pharmacy-highlights bg-light">
                <div className="container grid grid-2 items-center">
                    <div className="highlights-content">
                        <span className="badge badge-green">24/7 Support</span>
                        <h2>Your Trusted Pharmacy Partner Since 1997</h2>
                        <p>
                            We provide a wide range of genuine medicines with professional guidance.
                            Our pharmacy is equipped to handle both OTC and Narcotic prescriptions with strict adherence to safety standards.
                        </p>

                        <div className="highlight-list">
                            <div className="h-item">
                                <Truck className="h-icon" />
                                <div>
                                    <h4>Fast Delivery</h4>
                                    <p>Get your medicines delivered to your doorstep within hours.</p>
                                </div>
                            </div>
                            <div className="h-item">
                                <FileText className="h-icon" />
                                <div>
                                    <h4>Prescription Care</h4>
                                    <p>Easy upload for narcotic medicines and expert validation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="highlights-image">
                        {/* Removed decorative pill icon */}
                    </div>
                </div>
            </section>

            {/* Star Health Quick Info */}
            <section className="section star-health-quick">
                <div className="container star-card">
                    <div className="star-content">
                        <Shield size={48} className="star-logo-icon" />
                        <div className="star-text">
                            <h3 style={{ color: '#fff' }}>Star Health Insurance Partner</h3>
                            <p>Secure your family's future with Mani - Zonal Manager Club Achiever. Plan consultations available daily.</p>
                        </div>
                    </div>
                    <button className="btn btn-outline">Check Plans</button>
                </div>
            </section>

            {/* Location Section */}
            <LocationSection />
        </div>
    );
};

export default Home;
