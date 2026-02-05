import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import {
    User, MapPin, Phone, Mail, Calendar, Clock,
    LayoutDashboard, ShoppingBag, Users, Pill,
    Truck, LogOut, Menu, X, ChevronRight,
    Search, Bell, Edit, CheckCircle, Package, ArrowLeft,
    HeartPulse, Plus, Home as HomeIcon, ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const { doctors, products, orders, deliverySettings } = useData();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileUpdates, setProfileUpdates] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: user?.city || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Pagination State
    const [medicinesPage, setMedicinesPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const itemsPerPage = 6;

    const [showRecentOrders, setShowRecentOrders] = useState(true);

    // Sync state with user data when user changes
    React.useEffect(() => {
        if (user) {
            setProfileUpdates({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                city: user.city || ''
            });
        }
    }, [user]);

    // Derived Data for User
    const userOrders = orders.filter(o => o.phone === user?.phone || o.customerEmail === user?.email);

    const stats = [
        { label: 'Total Orders', value: userOrders.length, icon: <Package size={24} />, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Available Doctors', value: doctors.length, icon: <Users size={24} />, color: '#f59e0b', bg: '#fffbeb' },
    ];

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'medicines', label: 'Medicines', icon: <Pill size={20} /> },
        { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={20} /> },
    ];


    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const result = await updateUser(profileUpdates);
        if (result.success) {
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile: ' + result.message);
        }
        setIsSaving(false);
    };

    if (!user) return <div className="loading-screen">Loading...</div>;

    const renderSection = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="section-content animate-fade">
                        <div className="welcome-banner">
                            <h1>Welcome back, {user.name}! 👋</h1>
                            <p>Here's what's happening with your health profile today.</p>
                        </div>

                        <div className="stats-grid">
                            {stats.map((stat, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stat.value}</h3>
                                        <p>{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                            {showRecentOrders && (
                                <div className="recent-orders section-card">
                                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                        <h3>Recent Orders</h3>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <button onClick={() => setActiveTab('orders')} className="text-btn">View All</button>
                                            <button onClick={() => setShowRecentOrders(false)} className="close-recent-orders"><X size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="mini-list">
                                        {userOrders.slice(0, 5).map(order => (
                                            <div key={order.id} className="mini-item">
                                                <div className="item-icon"><Package size={18} /></div>
                                                <div className="item-details">
                                                    <p className="item-title">Order #{order.id.toString().slice(-6)}</p>
                                                    <p className="item-sub">{order.date}</p>
                                                </div>
                                                <span className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</span>
                                            </div>
                                        ))}
                                        {userOrders.length === 0 && <p className="empty-msg">No recent orders found.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="section-card animate-slide-up">
                        <h2 className="section-title"><User size={24} /> My Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={profileUpdates.name} onChange={e => setProfileUpdates({ ...profileUpdates, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={profileUpdates.email} onChange={e => setProfileUpdates({ ...profileUpdates, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" value={profileUpdates.phone} onChange={e => setProfileUpdates({ ...profileUpdates, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" value={profileUpdates.city} onChange={e => setProfileUpdates({ ...profileUpdates, city: e.target.value })} placeholder="Bangalore" />
                            </div>
                            <button type="submit" className="save-btn" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                );

            case 'medicines':
                const medicineCount = products.length;
                const medicineTotalPages = Math.ceil(medicineCount / itemsPerPage);
                const currentMedicines = products.slice(
                    (medicinesPage - 1) * itemsPerPage,
                    medicinesPage * itemsPerPage
                );

                return (
                    <div className="animate-fade">
                        <h2 className="section-title"><Pill size={24} /> Pharmacy Inventory</h2>
                        <div className="scrollable-section-wrapper">
                            <div className="table-container">
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentMedicines.map(prod => (
                                                <tr key={prod.id}>
                                                    <td data-label="Name">{prod.name}</td>
                                                    <td data-label="Category">{prod.category}</td>
                                                    <td data-label="Price">₹{prod.price}</td>
                                                    <td data-label="Stock">
                                                        <span className={`status-tag ${prod.stock ? 'completed' : 'cancelled'}`}>
                                                            {prod.stock ? 'In Stock' : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions" className="actions">
                                                        <button
                                                            className="buy-btn"
                                                            disabled={!prod.stock}
                                                            onClick={() => {
                                                                addToCart(prod);
                                                                alert(`${prod.name} added to cart!`);
                                                            }}
                                                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                        >
                                                            Order Now
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        {medicineTotalPages > 1 && (
                            <div className="pagination-bar">
                                <button
                                    onClick={() => setMedicinesPage(p => Math.max(1, p - 1))}
                                    disabled={medicinesPage === 1}
                                    className="page-nav-btn"
                                >
                                    <ArrowLeft size={18} /> Prev
                                </button>
                                <div className="page-numbers">
                                    Page <span>{medicinesPage}</span> of {medicineTotalPages}
                                </div>
                                <button
                                    onClick={() => setMedicinesPage(p => Math.min(medicineTotalPages, p + 1))}
                                    disabled={medicinesPage === medicineTotalPages}
                                    className="page-nav-btn"
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'orders':
                // Group orders by date
                const groupedOrders = userOrders.reduce((acc, order) => {
                    if (!acc[order.date]) {
                        acc[order.date] = [];
                    }
                    acc[order.date].push(order);
                    return acc;
                }, {});

                return (
                    <div className="animate-fade">
                        <div className="back-btn-container">
                            <button onClick={() => setActiveTab('dashboard')} className="back-btn">
                                <ArrowLeft size={18} /> Back to Dashboard
                            </button>
                        </div>
                        <h2 className="section-title"><ShoppingBag size={24} /> My Order History</h2>

                        {Object.keys(groupedOrders).length === 0 ? (
                            <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <p>No orders placed yet.</p>
                            </div>
                        ) : (
                            <div className="scrollable-section-wrapper">
                                {Object.entries(groupedOrders)
                                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                                    .slice((ordersPage - 1) * 3, ordersPage * 3) // Paginate by date groups (3 groups per page)
                                    .map(([date, dateOrders]) => {
                                        const dateObj = new Date(date);
                                        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
                                        const sortedDateOrders = [...dateOrders].sort((a, b) => a.id - b.id);

                                        return (
                                            <div key={date} className="section-card" style={{ marginBottom: '2rem' }}>
                                                <h3 style={{
                                                    padding: '0 0 1rem 0',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    marginBottom: '1rem',
                                                    color: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <Calendar size={20} />
                                                    {formattedDate}
                                                </h3>
                                                <div className="dashboard-table-container" style={{ boxShadow: 'none', border: 'none' }}>
                                                    <table className="dashboard-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Order No</th>
                                                                <th>Order ID (PK)</th>
                                                                <th>Customer ID (FK)</th>
                                                                <th>Prescription ID (FK)</th>
                                                                <th>Address ID (FK)</th>
                                                                <th>Total</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sortedDateOrders.map((order, index) => (
                                                                <tr key={order.id}>
                                                                    <td data-label="Order No" style={{ fontWeight: 'bold' }}>Order {index + 1}</td>
                                                                    <td data-label="Order ID">#{order.id.toString().slice(-6)}</td>
                                                                    <td data-label="Customer ID">{user.id || 'CUST-001'}</td>
                                                                    <td data-label="Prescription ID">PRE-{order.id.toString().slice(-4)}</td>
                                                                    <td data-label="Address ID">ADDR-{order.id.toString().slice(-4)}</td>
                                                                    <td data-label="Total">₹{order.total}</td>
                                                                    <td data-label="Status">
                                                                        <span className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}

                        {Math.ceil(Object.keys(groupedOrders).length / 3) > 1 && (
                            <div className="pagination-bar" style={{ marginTop: '1.5rem' }}>
                                <button
                                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                    disabled={ordersPage === 1}
                                    className="page-nav-btn"
                                >
                                    <ArrowLeft size={18} /> Prev
                                </button>
                                <div className="page-numbers">
                                    Page <span>{ordersPage}</span> of {Math.ceil(Object.keys(groupedOrders).length / 3)}
                                </div>
                                <button
                                    onClick={() => setOrdersPage(p => Math.min(Math.ceil(Object.keys(groupedOrders).length / 3), p + 1))}
                                    disabled={ordersPage === Math.ceil(Object.keys(groupedOrders).length / 3)}
                                    className="page-nav-btn"
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                );




            default:
                return <div>Section coming soon...</div>;
        }
    }

    return (
        <div className="dashboard-page-wrapper">
            <div className="dashboard-layout">
                {/* Sidebar */}
                <aside className={`dashboard-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <div className="sidebar-brand">
                        <div className="brand-icon"><Pill size={24} /></div>
                        <div className="brand-name">
                            <span className="logo-main">NEW BALAN</span>
                            <span className="logo-sub">Medical & Clinic</span>
                        </div>
                        <button className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                    </div>

                    <nav className="sidebar-menu">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <button className="menu-item logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="customer-main">
                    <header className="customer-header">
                        <div className="header-left">
                            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu size={24} />
                            </button>

                        </div>

                        <div className="header-actions">
                            <button className="icon-btn"><Bell size={20} /></button>
                            <div className="user-profile" onClick={() => setActiveTab('profile')}>
                                <div className="user-info">
                                    <span className="user-name">{user?.name || 'User'}</span>
                                    <span className="user-role">{user?.membership || 'Premium Member'}</span>
                                </div>
                                <div className="avatar">{(user?.name || 'User').charAt(0)}</div>
                            </div>
                        </div>
                    </header>

                    <div className="customer-content">
                        {renderSection()}
                    </div>

                    <div className="mobile-logout-container">
                        <button className="mobile-action-logout" onClick={() => { logout(); navigate('/login'); }}>
                            <LogOut size={20} />
                            <span>Logout of Account</span>
                        </button>
                    </div>
                </main>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}
            </div>

            <Footer />

        </div>
    );
};

export default Profile;
