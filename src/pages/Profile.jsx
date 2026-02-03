import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import {
    User, MapPin, Phone, Mail, Calendar, Clock,
    LayoutDashboard, ShoppingBag, Users, Pill,
    Truck, LogOut, Menu, X, ChevronRight,
    Search, Bell, Edit, CheckCircle, Package, ArrowLeft, FileText, Eye,
    Home, Briefcase, Plus, Trash2 // Added icons
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const { doctors, products, orders, deliverySettings, prescriptions, appointments, savedAddresses, addAddress, deleteAddress } = useData();
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
    const [selectedOrder, setSelectedOrder] = useState(null); // New state for order modal

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

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        type: 'Home',
        street: '',
        city: '',
        zip: '',
        state: ''
    });

    const handleAddAddress = (e) => {
        e.preventDefault();
        addAddress({ ...newAddress, userId: user.id });
        setShowAddressForm(false);
        setNewAddress({ type: 'Home', street: '', city: '', zip: '', state: '' });
        alert('Address added successfully!');
    };

    // Derived Data for User
    const userOrders = orders.filter(o => o.phone === user?.phone || o.customerEmail === user?.email);

    const stats = [
        { label: 'Total Orders', value: userOrders.length, icon: <Package size={24} />, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Available Doctors', value: doctors.length, icon: <Users size={24} />, color: '#f59e0b', bg: '#fffbeb' },
    ];

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'prescriptions', label: 'My Prescriptions', icon: <FileText size={20} /> },
        { id: 'appointments', label: 'My Appointments', icon: <Calendar size={20} /> }, // New
        { id: 'addresses', label: 'Saved Addresses', icon: <MapPin size={20} /> }, // New
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

                        <div className="dashboard-grid">
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



            case 'prescriptions':
                const myPrescriptions = prescriptions.filter(p => p.userId === user.id || p.userPhone === user.phone);
                return (
                    <div className="section-card animate-slide-up">
                        <h2 className="section-title"><FileText size={24} /> My Prescriptions</h2>
                        <div className="table-container" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myPrescriptions.map(p => (
                                            <tr key={p.id}>
                                                <td data-label="Date">{new Date(p.date).toLocaleDateString()}</td>
                                                <td data-label="Status">
                                                    <span className={`status-tag ${p.status.toLowerCase()}`}>{p.status}</span>
                                                </td>
                                                <td data-label="Notes">{p.userNotes || '-'}</td>
                                                <td data-label="Actions">
                                                    <button className="icon-btn" onClick={() => window.open(p.imageUrl, '_blank')} title="View Prescription">
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {myPrescriptions.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                                                    No prescriptions uploaded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'medicines':
                return (
                    <div className="animate-fade">
                        <h2 className="section-title"><Pill size={24} /> Pharmacy Inventory</h2>
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
                                        {products.map(prod => (
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
                );

            case 'appointments':
                // Filter appointments for the current user (using phone or name as fallback link)
                const myAppointments = appointments.filter(a => a.phone === user.phone || a.patientName === user.name);
                return (
                    <div className="section-card animate-slide-up">
                        <h2 className="section-title"><Calendar size={24} /> My Appointments</h2>
                        <div className="table-container" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Doctor</th>
                                            <th>Expertise</th>
                                            <th>Date/Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myAppointments.map(app => (
                                            <tr key={app.id}>
                                                <td data-label="Doctor"><strong>{app.doctorName}</strong></td>
                                                <td data-label="Expertise">{doctors.find(d => d.name === app.doctorName)?.specialty || 'General'}</td>
                                                <td data-label="Date/Time">{new Date(app.date).toLocaleDateString()}</td>
                                                <td data-label="Status">
                                                    <span className={`status-tag ${app.status?.toLowerCase() || 'pending'}`}>{app.status || 'Pending'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {myAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                                                    No appointments booked yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'addresses':
                const myAddresses = savedAddresses.filter(a => a.userId === user.id);
                return (
                    <div className="section-card animate-slide-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}><MapPin size={24} /> Saved Addresses</h2>
                            <button className="text-btn" onClick={() => setShowAddressForm(!showAddressForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                <Plus size={18} /> Add New
                            </button>
                        </div>

                        {showAddressForm && (
                            <form className="address-form animate-fade" onSubmit={handleAddAddress} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="form-group">
                                        <label>Address Type</label>
                                        <select value={newAddress.type} onChange={e => setNewAddress({ ...newAddress, type: e.target.value })}>
                                            <option value="Home">Home</option>
                                            <option value="Work">Work</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Street / Building</label>
                                        <input type="text" required value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="123 Main St" />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="City" />
                                    </div>
                                    <div className="form-group">
                                        <label>ZIP Code</label>
                                        <input type="text" required value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} placeholder="123456" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="save-btn" style={{ padding: '0.6rem 1.5rem' }}>Save Address</button>
                                    <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: '0.6rem 1.5rem', background: '#e2e8f0', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="addresses-grid">
                            {myAddresses.map(addr => (
                                <div key={addr.id} className="address-card">
                                    <div className="address-header">
                                        {addr.type === 'Home' && <Home size={18} />}
                                        {addr.type === 'Work' && <Briefcase size={18} />}
                                        {addr.type === 'Other' && <MapPin size={18} />}
                                        {addr.type}
                                    </div>
                                    <p className="address-text">{addr.street}</p>
                                    <p className="address-text">{addr.city}, {addr.zip}</p>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Delete this address?')) deleteAddress(addr.id);
                                        }}
                                        className="address-delete-btn"
                                        title="Delete Address"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {myAddresses.length === 0 && !showAddressForm && (
                                <div className="no-address-state">
                                    <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>No saved addresses found. Add one to speed up checkout!</p>
                                </div>
                            )}
                        </div>
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
                            Object.entries(groupedOrders)
                                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                                .map(([date, dateOrders]) => {
                                    // Format Date to DD/MM/YYYY
                                    const dateObj = new Date(date);
                                    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

                                    // Sort orders by ID (ascending) to sequence them 1, 2, 3...
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
                                                            <th>Actions</th>
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
                                                                <td data-label="Actions">
                                                                    <button className="icon-btn" onClick={() => setSelectedOrder(order)} title="View Items"><Eye size={18} /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })
                        )}

                        {/* Order Details Modal */}
                        {selectedOrder && (
                            <div className="modal-overlay animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                                <div className="section-card" style={{ maxWidth: '600px', width: '90%', padding: '2rem', borderRadius: '16px', background: 'white', position: 'relative' }}>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={24} />
                                    </button>

                                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>Order Details #{selectedOrder.id}</h3>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <p><strong>Date:</strong> {selectedOrder.date}</p>
                                        <p><strong>Status:</strong> <span className={`status-tag ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>
                                    </div>

                                    <h4 style={{ marginBottom: '1rem' }}>Items</h4>
                                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                        {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx !== selectedOrder.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Qty: {item.quantity} x ₹{item.price}</div>
                                                </div>
                                                <div style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        <span>Total Amount</span>
                                        <span style={{ color: 'var(--primary)' }}>₹{selectedOrder.total}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );




            default:
                return <div>Section coming soon...</div>;
        }
    }

    return (
        <div className="dashboard-layout animate-fade">
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon"><Pill size={24} /></div>
                    <div className="brand-name">New Balan<br /><small>Medical & Clinic</small></div>
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
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-left">
                        <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="header-search">
                            <Search size={18} />
                            <input type="text" placeholder="Search for medicines, doctors..." />
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="icon-btn"><Bell size={20} /></button>
                        <div className="user-profile" onClick={() => setActiveTab('profile')}>
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.membership || 'Premium Member'}</span>
                            </div>
                            <div className="avatar">{user.name.charAt(0)}</div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {renderSection()}
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Mobile Bottom Nav (Optional Enhancement - kept for quick access) */}
            <div className="mobile-bottom-bar">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.icon}
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Profile;
