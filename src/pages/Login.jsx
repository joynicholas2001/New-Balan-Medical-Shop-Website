import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import './Admin.css'; // Using existing styles

const Login = () => {
    const navigate = useNavigate();
    const { login, register, isLoading } = useAuth();

    // Mode: 'login' or 'register'
    const [mode, setMode] = useState('login');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'login') {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                if (result.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/profile');
                }
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } else {
            // Register
            if (!formData.name || !formData.phone) {
                setError('Please fill all fields');
                return;
            }
            const result = await register(formData);
            if (result.success) {
                navigate('/profile');
            } else {
                setError(result.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="login-page animate-fade" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 'var(--nav-height)',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)'
        }}>
            <div className="login-card" style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                width: '100%',
                maxWidth: '450px'
            }}>
                <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="login-icon" style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        {mode === 'login' ? <Lock size={28} /> : <User size={28} />}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        {mode === 'login' ? 'Welcome Back!!' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--gray-500)' }}>
                        {mode === 'login' ? 'Login to access your dashboard' : 'Join us for a healthy lifestyle'}
                    </p>
                </div>

                {error && (
                    <div className="error-alert" style={{
                        background: '#fff1f0',
                        border: '1px solid #ffa39e',
                        color: '#f5222d',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="input-label">Full Name</label>
                                <div className="input-with-icon">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter Your Name"
                                        className="styled-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="input-label">Phone Number</label>
                                <div className="input-with-icon">
                                    <Phone size={18} className="input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 XXXXXXXXXX"
                                        className="styled-input"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="input-label">Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="styled-input"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="input-label">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="styled-input"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gray-400)',
                                    cursor: 'pointer',
                                    padding: '0'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="login-btn" style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'opacity 0.2s',
                        opacity: isLoading ? 0.7 : 1
                    }}>
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                            >
                                {mode === 'login' ? 'Create one' : 'Login here'}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
            <style>{`
                .input-label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; color: var(--gray-700); }
                .input-with-icon { position: relative; }
                .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
                .styled-input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 3.5rem !important; border-radius: 8px; border: 1px solid var(--gray-300); outline: none; transition: border-color 0.2s; }
                .styled-input:focus { border-color: var(--primary); }
            `}</style>
        </div >
    );
};

export default Login;
