import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Pill, ShoppingCart, Search, Plus, Trash2, Check, X, Menu, Clock, MapPin, Phone, Pencil, AlertCircle, Eye, CheckCircle, XCircle, LogOut, Bell, Truck, Ticket, UserCheck, Filter, IndianRupee } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

// Simple beep sound
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'; // Short placeholder, will replace with better if needed or use browser default logic

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { doctors, deleteDoctor, addDoctor, updateDoctor, products, deleteProduct, addProduct, updateProduct, orders, updateOrderStatus, appointments, addAppointment, updateAppointment, deleteAppointment, updateAppointmentStatus, newOrderNotification, deliverySettings, updateDeliverySettings, coupons, addCoupon, updateCoupon, deleteCoupon, managers, addManager, updateManager, deleteManager, categories, addCategory, deleteCategory } = useData();
    const { logout, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [medicinesPage, setMedicinesPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [appointmentsPage, setAppointmentsPage] = useState(1);
    const [categoriesPage, setCategoriesPage] = useState(1);
    const [doctorsPage, setDoctorsPage] = useState(1);
    const adminItemsPerPage = 10;

    // Notification Sound Effect
    useEffect(() => {
        if (newOrderNotification) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"); // Using a reliable hosted sound for "ding"
            audio.play().catch(e => console.log("Audio play failed interaction required:", e));
        }
    }, [newOrderNotification]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingId, setEditingId] = useState(null);

    // Order Detail Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    let notificationIdCounter = 0;

    const showNotify = (message, type = 'success') => {
        const id = ++notificationIdCounter;
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '', morning: '10:00 AM - 1:00 PM', evening: '5:00 PM - 9:00 PM', available: true });
    const [productForm, setProductForm] = useState({ name: '', category: categories?.[0] || 'OTC', price: '', image: '', discount: '0', requiresPrescription: false, stock: true });
    const [orderForm, setOrderForm] = useState({ customerId: '', customerName: '', phone: '', address: '', total: '', paymentMethod: 'cash' });
    const [appointmentForm, setAppointmentForm] = useState({ patientName: '', phone: '', doctorName: '', message: '', status: 'Confirmed' });
    const [slotForm, setSlotForm] = useState({ start: '09:00', end: '11:00', active: true });
    const [couponForm, setCouponForm] = useState({ code: '', discount: 2, isActive: true, expiryDate: '' });
    const [managerForm, setManagerForm] = useState({ name: '', email: '', password: '', permissions: [] });
    const [categoryName, setCategoryName] = useState('');

    // Permissions logic
    const hasPermission = (perm) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return user.permissions?.includes(perm);
    };



    const formatTimeTo12h = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutes} ${ampm}`;
    };

    const parseTimeFrom12h = (time12) => {
        if (!time12) return '09:00';
        const [time, ampm] = time12.split(' ');
        let [h, m] = time.split(':');
        h = parseInt(h);
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${m}`;
    };

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null, name: '' });

    const handleDoctorSubmit = (e) => {
        e.preventDefault();
        const mode = modalMode;

        setShowModal(false);

        if (mode === 'add') {
            addDoctor(doctorForm);
            showNotify('Doctor added');
        } else {
            updateDoctor(editingId, doctorForm);
            showNotify('Doctor updated');
        }

        setDoctorForm({ name: '', specialty: '', morning: '10:00 AM - 1:00 PM', evening: '5:00 PM - 9:00 PM', available: true });
    };

    const startEditDoctor = (doc) => {
        setModalMode('edit');
        setEditingId(doc.id);
        setDoctorForm({ name: doc.name, specialty: doc.specialty, morning: doc.morning, evening: doc.evening, available: doc.available });
        setShowModal(true);
    };

    const handleProductSubmit = (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price || !productForm.image) {
            showNotify('Missing fields', 'error');
            return;
        }

        const data = {
            ...productForm,
            price: parseFloat(productForm.price),
            discount: parseFloat(productForm.discount || 0),
            requiresPrescription: productForm.category === 'Prescription'
        };

        if (modalMode === 'add') {
            addProduct(data);
            showNotify(`${data.name} added! You can add another.`, 'success');
            // Keep modal open, reset only entry fields but keep category
            setProductForm({
                ...productForm,
                name: '',
                price: '',
                image: '',
                discount: '0'
            });
        } else {
            updateProduct(editingId, data);
            showNotify('Medicine updated');
            setShowModal(false);
            setEditingId(null);
            setProductForm({ name: '', category: categories?.[0] || 'OTC', price: '', image: '', discount: '0', requiresPrescription: false, stock: true });
        }
    };

    const handleOrderSubmit = (e) => {
        e.preventDefault();
        if (!orderForm.customerName || !orderForm.total || !orderForm.phone) {
            showNotify('Missing fields', 'error');
            return;
        }

        const data = {
            customerId: orderForm.customerId || `CUST-${Date.now()}`,
            customerName: orderForm.customerName,
            phone: orderForm.phone,
            address: orderForm.address || 'In-Store Pickup',
            items: [{ name: 'Store Purchase', quantity: 1, price: parseFloat(orderForm.total) }],
            total: parseFloat(orderForm.total).toFixed(2),
            discount: '0.00',
            couponCode: 'N/A',
            customerEmail: 'walkin@store.com',
            paymentMethod: orderForm.paymentMethod,
            paymentId: 'STORE-' + Date.now(),
            deliverySlot: 'N/A'
        };

        addOrder(data);
        showNotify('Order recorded successfully');
        setShowModal(false);
        setOrderForm({ customerId: '', customerName: '', phone: '', address: '', total: '', paymentMethod: 'cash' });
    };

    const handleAppointmentSubmit = (e) => {
        e.preventDefault();
        if (!appointmentForm.patientName || !appointmentForm.phone || !appointmentForm.doctorName) {
            showNotify('Missing fields', 'error');
            return;
        }

        if (modalMode === 'add') {
            addAppointment(appointmentForm);
            showNotify('Appointment added');
        } else {
            updateAppointment(editingId, appointmentForm);
            showNotify('Appointment updated');
        }
        setShowModal(false);
        setAppointmentForm({ patientName: '', phone: '', doctorName: '', message: '', status: 'Confirmed' });
        setEditingId(null);
    };

    let slotIdCounter = 1000;

    const handleSlotSubmit = (e) => {
        e.preventDefault();
        const formattedTime = `${formatTimeTo12h(slotForm.start)} - ${formatTimeTo12h(slotForm.end)}`;
        const slotData = { time: formattedTime, active: slotForm.active, id: editingId || ++slotIdCounter };

        if (modalMode === 'add') {
            updateDeliverySettings({
                ...deliverySettings,
                slots: [...deliverySettings.slots, slotData]
            });
            showNotify('Slot added');
        } else {
            updateDeliverySettings({
                ...deliverySettings,
                slots: deliverySettings.slots.map(s => s.id === editingId ? slotData : s)
            });
            showNotify('Slot updated');
        }
        setShowModal(false);
        setSlotForm({ start: '09:00', end: '11:00', active: true });
        setEditingId(null);
    };

    const handleCouponSubmit = (e) => {
        e.preventDefault();
        if (couponForm.discount < 2 || couponForm.discount > 6) {
            showNotify('Discount: 2% - 6% only', 'error');
            return;
        }

        if (modalMode === 'add') {
            addCoupon(couponForm);
            showNotify('Coupon created');
        } else {
            updateCoupon(editingId, couponForm);
            showNotify('Coupon updated');
        }
        setShowModal(false);
        setCouponForm({ code: '', discount: 2, isActive: true, expiryDate: '' });
        setEditingId(null);
    };

    const handleManagerSubmit = (e) => {
        e.preventDefault();
        if (!managerForm.name || !managerForm.email || !managerForm.password) {
            showNotify('Missing fields', 'error');
            return;
        }

        if (modalMode === 'add') {
            addManager(managerForm);
            showNotify('Staff added');
        } else {
            updateManager(editingId, managerForm);
            showNotify('Staff updated');
        }
        setShowModal(false);
        setManagerForm({ name: '', email: '', password: '', permissions: [] });
        setEditingId(null);
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;
        addCategory(categoryName.trim());
        showNotify(`Category "${categoryName}" added!`);
        setCategoryName('');
        // Modal stays open for adding more categories
    };

    const togglePermission = (perm) => {
        setManagerForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const startEditCoupon = (coupon) => {
        setModalMode('edit');
        setEditingId(coupon.id);
        setCouponForm({ ...coupon });
        setShowModal(true);
    };

    const deleteSlot = (id) => {
        updateDeliverySettings({
            ...deliverySettings,
            slots: deliverySettings.slots.filter(s => s.id !== id)
        });
        showNotify('Slot removed', 'error');
    };

    const toggleDeliveryEnabled = () => {
        updateDeliverySettings({
            ...deliverySettings,
            isEnabled: !deliverySettings.isEnabled
        });
        showNotify(`Delivery ${!deliverySettings.isEnabled ? 'On' : 'Off'}`);
    };

    const startEditProduct = (prod) => {
        setModalMode('edit');
        setEditingId(prod.id);
        setProductForm({ ...prod });
        setShowModal(true);
    };

    const requestDelete = (type, id, name) => {
        setDeleteConfirm({ show: true, type, id, name });
    };

    const confirmDelete = () => {
        if (deleteConfirm.type === 'doctor') {
            deleteDoctor(deleteConfirm.id);
            showNotify('Doctor deleted');
        } else if (deleteConfirm.type === 'medicine') {
            deleteProduct(deleteConfirm.id);
            showNotify('Medicine deleted');
        } else if (deleteConfirm.type === 'appointment') {
            deleteAppointment(deleteConfirm.id);
            showNotify('Appointment deleted');
        } else if (deleteConfirm.type === 'coupon') {
            deleteCoupon(deleteConfirm.id);
            showNotify('Coupon deleted');
        } else if (deleteConfirm.type === 'manager') {
            deleteManager(deleteConfirm.id);
            showNotify('Staff deleted');
        } else {
            deleteSlot(deleteConfirm.id);
            showNotify('Slot deleted');
        }
        setDeleteConfirm({ show: false, type: '', id: null, name: '' });
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, permission: 'dashboard' },
        { id: 'doctors', label: 'Manage Doctors', icon: <Users size={20} />, permission: 'doctors' },
        { id: 'medicines', label: 'Manage Medicines', icon: <Pill size={20} />, permission: 'medicines' },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, permission: 'orders' },
        { id: 'appointments', label: 'Appointments', icon: <Clock size={20} />, permission: 'appointments' },
        { id: 'delivery', label: 'Delivery Settings', icon: <Truck size={20} />, permission: 'delivery' },
        { id: 'coupons', label: 'Coupons & Marquee', icon: <Ticket size={20} />, permission: 'coupons' },
        { id: 'staff', label: 'Manage Staff', icon: <UserCheck size={20} />, permission: 'staff' },
        { id: 'categories', label: 'Medicine Categories', icon: <Filter size={20} />, permission: 'medicines' },
    ];

    const availableMenuItems = menuItems.filter(item => hasPermission(item.permission));

    useEffect(() => {
        if (availableMenuItems.length > 0 && !availableMenuItems.find(m => m.id === activeTab)) {
            setActiveTab(availableMenuItems[0].id);
        }
    }, [user, availableMenuItems, activeTab]);


    const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="admin-layout animate-fade">
            {/* Notifications */}
            <div className="admin-notifications">
                {notifications.map(n => (
                    <div key={n.id} className={`notify-toast ${n.type}`}>
                        {n.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{n.message}</span>
                    </div>
                ))}
            </div>

            {/* Sidebar Overlay for Mobile */}
            <div className={`sidebar-overlay ${isMobileSidebarOpen ? 'show' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}></div>

            {/* Modern Admin Sidebar */}
            <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>New Balan</h3>
                            <p>{user?.role === 'manager' ? 'MANAGER DASHBOARD' : 'ADMIN PORTAL'}</p>
                        </div>
                        <button className="mobile-close-btn" style={{ display: 'none' }} onClick={() => setIsMobileSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {availableMenuItems.map(item => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileSidebarOpen(false);
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div className="sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <div className="nav-item logout-btn" onClick={() => { logout(); window.location.href = '/login'; }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="mobile-hamburger" onClick={() => setIsMobileSidebarOpen(true)} style={{ display: 'none' }}>
                            <Menu size={24} />
                        </button>
                        <h2>{availableMenuItems.find(m => m.id === activeTab)?.label}</h2>
                    </div>
                    <div className="admin-user">
                        <div className="admin-user-info" style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem' }}>{user?.role === 'admin' ? 'Administrator' : 'Manager'}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>{user?.name || 'Logged In'}</span>
                        </div>
                        <div className="avatar">{user?.name ? user.name[0].toUpperCase() : 'A'}</div>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-view animate-slide-up">
                            <div className="stats-grid">
                                {hasPermission('orders') && (
                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div className="stat-icon purple" style={{ background: '#f3e8ff', color: '#7c3aed' }}><IndianRupee size={24} /></div>
                                            <div>
                                                <h4>Total Revenue</h4>
                                                <p>₹{orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasPermission('orders') && (
                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div className="stat-icon blue"><ShoppingCart size={24} /></div>
                                            <div>
                                                <h4>Total Orders</h4>
                                                <p>{orders.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasPermission('doctors') && (
                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div className="stat-icon green"><Users size={24} /></div>
                                            <div>
                                                <h4>Specialists</h4>
                                                <p>{doctors.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {hasPermission('medicines') && (
                                    <div className="stat-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div className="stat-icon orange"><Pill size={24} /></div>
                                            <div>
                                                <h4>Inventory</h4>
                                                <p>{products.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="dashboard-grid-activity" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                                {hasPermission('appointments') && (
                                    <div className="recent-activity">
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}><Clock size={20} /> Recent Appointments</h3>
                                        <div className="table-container">
                                            <div className="table-wrapper">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Patient</th>
                                                            <th>Doctor</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {appointments.slice(0, 5).map(app => (
                                                            <tr key={app.id}>
                                                                <td data-label="Patient">{app.patientName}</td>
                                                                <td data-label="Doctor">{app.doctorName}</td>
                                                                <td data-label="Status">
                                                                    <span className={`status-tag ${app.status.toLowerCase()}`}>{app.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {appointments.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No recent appointments.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hasPermission('orders') && (
                                    <div className="recent-activity">
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}><ShoppingCart size={20} /> Recent Orders</h3>
                                        <div className="table-container">
                                            <div className="table-wrapper">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Customer</th>
                                                            <th>Total</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.slice(0, 5).map(order => (
                                                            <tr key={order.id}>
                                                                <td data-label="Customer">{order.customerName}</td>
                                                                <td data-label="Total">₹{order.total}</td>
                                                                <td data-label="Status">
                                                                    <span className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {orders.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No recent orders.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Doctors Tab */}
                    {activeTab === 'doctors' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search doctors..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setDoctorsPage(1); }} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setDoctorForm({ name: '', specialty: '', morning: '10:00 AM - 1:00 PM', evening: '5:00 PM - 9:00 PM', available: true }); setShowModal(true); }}><Plus size={18} /> Add Doctor</button>
                            </div>
                            <div className="scrollable-section-wrapper">
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Doctor Name</th><th>Specialty</th><th>Morning</th><th>Evening</th><th>Actions</th></tr></thead>
                                        <tbody>{filteredDoctors
                                            .slice((doctorsPage - 1) * adminItemsPerPage, doctorsPage * adminItemsPerPage)
                                            .map(doc => (
                                                <tr key={doc.id}>
                                                    <td data-label="Doctor Name">{doc.name}</td>
                                                    <td data-label="Specialty">{doc.specialty}</td>
                                                    <td data-label="Morning">{doc.morning}</td>
                                                    <td data-label="Evening">{doc.evening}</td>
                                                    <td data-label="Actions" className="actions">
                                                        <button className="action-btn" onClick={() => startEditDoctor(doc)}><Pencil size={16} /></button>
                                                        <button className="action-btn delete" onClick={() => requestDelete('doctor', doc.id, doc.name)}><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}</tbody>
                                    </table>
                                </div>
                            </div>
                            {Math.ceil(filteredDoctors.length / adminItemsPerPage) > 1 && (
                                <div className="pagination-bar">
                                    <button
                                        onClick={() => setDoctorsPage(p => Math.max(1, p - 1))}
                                        disabled={doctorsPage === 1}
                                        className="page-nav-btn"
                                    >
                                        <ArrowLeft size={18} /> Prev
                                    </button>
                                    <div className="page-numbers">
                                        Page <span>{doctorsPage}</span> of {Math.ceil(filteredDoctors.length / adminItemsPerPage)}
                                    </div>
                                    <button
                                        onClick={() => setDoctorsPage(p => Math.min(Math.ceil(filteredDoctors.length / adminItemsPerPage), p + 1))}
                                        disabled={doctorsPage === Math.ceil(filteredDoctors.length / adminItemsPerPage)}
                                        className="page-nav-btn"
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Medicines Tab */}
                    {activeTab === 'medicines' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search medicines..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setMedicinesPage(1); }} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setProductForm({ name: '', category: categories?.[0] || 'OTC', price: '', image: '', discount: '0', requiresPrescription: false, stock: true }); setShowModal(true); }}><Plus size={18} /> Add Product</button>
                            </div>
                            <div className="scrollable-section-wrapper">
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                                        <tbody>{filteredProducts
                                            .slice((medicinesPage - 1) * adminItemsPerPage, medicinesPage * adminItemsPerPage)
                                            .map(prod => (
                                                <tr key={prod.id}>
                                                    <td data-label="Name">{prod.name}</td>
                                                    <td data-label="Category">{prod.category}</td>
                                                    <td data-label="Price">₹{prod.price}</td>
                                                    <td data-label="Stock">
                                                        <span className={`status-tag ${prod.stock ? 'active' : 'inactive'}`}>
                                                            {prod.stock ? 'In Stock' : 'Out of Stock'}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions" className="actions">
                                                        <button className="action-btn" onClick={() => startEditProduct(prod)}><Pencil size={16} /></button>
                                                        <button className="action-btn delete" onClick={() => requestDelete('medicine', prod.id, prod.name)}><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}</tbody>
                                    </table>
                                </div>
                            </div>
                            {Math.ceil(filteredProducts.length / adminItemsPerPage) > 1 && (
                                <div className="pagination-bar">
                                    <button
                                        onClick={() => setMedicinesPage(p => Math.max(1, p - 1))}
                                        disabled={medicinesPage === 1}
                                        className="page-nav-btn"
                                    >
                                        <ArrowLeft size={18} /> Prev
                                    </button>
                                    <div className="page-numbers">
                                        Page <span>{medicinesPage}</span> of {Math.ceil(filteredProducts.length / adminItemsPerPage)}
                                    </div>
                                    <button
                                        onClick={() => setMedicinesPage(p => Math.min(Math.ceil(filteredProducts.length / adminItemsPerPage), p + 1))}
                                        disabled={medicinesPage === Math.ceil(filteredProducts.length / adminItemsPerPage)}
                                        className="page-nav-btn"
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setOrdersPage(1); }} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setOrderForm({ customerId: '', customerName: '', phone: '', address: '', total: '', paymentMethod: 'cash' }); setShowModal(true); }}><Plus size={18} /> Add Order</button>
                            </div>
                            <div className="scrollable-section-wrapper">
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Order ID</th><th>Customer ID</th><th>Customer</th><th>Prescription ID</th><th>Product IDs</th><th>Date</th><th>Total</th><th>Status</th><th>Processed By</th><th>Actions</th></tr></thead>
                                        <tbody>{orders
                                            .slice((ordersPage - 1) * adminItemsPerPage, ordersPage * adminItemsPerPage)
                                            .map(order => (
                                                <tr key={order.id}>
                                                    <td data-label="Order ID">{order.id}</td>
                                                    <td data-label="Customer ID"><code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{order.customerId || 'N/A'}</code></td>
                                                    <td data-label="Customer">{order.customerName}</td>
                                                    <td data-label="Prescription ID"><code style={{ fontSize: '0.75rem', background: order.prescriptionId !== 'N/A' ? '#fef3c7' : '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', color: order.prescriptionId !== 'N/A' ? '#92400e' : 'inherit' }}>{order.prescriptionId || 'N/A'}</code></td>
                                                    <td data-label="Product IDs"><code style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', maxWidth: '150px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.productIds}>{order.productIds || 'N/A'}</code></td>
                                                    <td data-label="Date">{order.date || new Date(order.timestamp || Date.now()).toLocaleDateString()}</td>
                                                    <td data-label="Total">₹{order.total}</td>
                                                    <td data-label="Status">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => {
                                                                const handlerInfo = `${user?.name || 'User'} (${user?.role === 'admin' ? 'Admin' : 'Manager'})`;
                                                                updateOrderStatus(order.id, e.target.value, handlerInfo);
                                                                showNotify(`${e.target.value}`);
                                                            }}
                                                            className={`admin-status-select ${order.status.toLowerCase()}`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Processing">Processing</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td data-label="Processed By">
                                                        {order.handledBy ? (
                                                            <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block', whiteSpace: 'nowrap' }}>
                                                                {order.handledBy}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td data-label="Actions" className="actions">
                                                        <button className="action-btn" onClick={() => setSelectedOrder(order)} title="View Details"><Eye size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && <tr><td colSpan="10" style={{ textAlign: 'center', padding: '3rem' }}>No orders placed yet.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {Math.ceil(orders.length / adminItemsPerPage) > 1 && (
                                <div className="pagination-bar">
                                    <button
                                        onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                        disabled={ordersPage === 1}
                                        className="page-nav-btn"
                                    >
                                        <ArrowLeft size={18} /> Prev
                                    </button>
                                    <div className="page-numbers">
                                        Page <span>{ordersPage}</span> of {Math.ceil(orders.length / adminItemsPerPage)}
                                    </div>
                                    <button
                                        onClick={() => setOrdersPage(p => Math.min(Math.ceil(orders.length / adminItemsPerPage), p + 1))}
                                        disabled={ordersPage === Math.ceil(orders.length / adminItemsPerPage)}
                                        className="page-nav-btn"
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search appointments..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setAppointmentsPage(1); }} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setAppointmentForm({ patientName: '', phone: '', doctorName: '', message: '', status: 'Confirmed' }); setShowModal(true); }}><Plus size={18} /> Add Appointment</button>
                            </div>
                            <div className="scrollable-section-wrapper">
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Patient</th><th>Phone</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>{appointments
                                            .filter(app => app.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .slice((appointmentsPage - 1) * adminItemsPerPage, appointmentsPage * adminItemsPerPage)
                                            .map(app => (
                                                <tr key={app.id}>
                                                    <td data-label="Patient">{app.patientName}</td>
                                                    <td data-label="Phone">{app.phone}</td>
                                                    <td data-label="Doctor">{app.doctorName}</td>
                                                    <td data-label="Status">
                                                        <span className={`status-tag ${app.status.toLowerCase()}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions" className="actions">
                                                        <button className="action-btn" onClick={() => {
                                                            setModalMode('edit');
                                                            setEditingId(app.id);
                                                            setAppointmentForm({
                                                                patientName: app.patientName,
                                                                phone: app.phone,
                                                                doctorName: app.doctorName,
                                                                message: app.message || '',
                                                                status: app.status
                                                            });
                                                            setShowModal(true);
                                                        }} title="Edit"><Pencil size={16} /></button>
                                                        <button className="action-btn delete" onClick={() => requestDelete('appointment', app.id, app.patientName)} title="Delete"><Trash2 size={16} /></button>
                                                        {app.status === 'Pending' && (
                                                            <>
                                                                <button className="action-btn" onClick={() => { updateAppointmentStatus(app.id, 'Confirmed'); showNotify('Confirmed'); }} title="Confirm"><CheckCircle size={16} /></button>
                                                                <button className="action-btn delete" onClick={() => { updateAppointmentStatus(app.id, 'Cancelled'); showNotify('Cancelled', 'error'); }} title="Cancel"><XCircle size={16} /></button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}</tbody>
                                    </table>
                                </div>
                            </div>
                            {Math.ceil(appointments.filter(app => app.patientName.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage) > 1 && (
                                <div className="pagination-bar">
                                    <button
                                        onClick={() => setAppointmentsPage(p => Math.max(1, p - 1))}
                                        disabled={appointmentsPage === 1}
                                        className="page-nav-btn"
                                    >
                                        <ArrowLeft size={18} /> Prev
                                    </button>
                                    <div className="page-numbers">
                                        Page <span>{appointmentsPage}</span> of {Math.ceil(appointments.filter(app => app.patientName.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage)}
                                    </div>
                                    <button
                                        onClick={() => setAppointmentsPage(p => Math.min(Math.ceil(appointments.filter(app => app.patientName.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage), p + 1))}
                                        disabled={appointmentsPage === Math.ceil(appointments.filter(app => app.patientName.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage)}
                                        className="page-nav-btn"
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delivery Tab */}
                    {activeTab === 'delivery' && (
                        <div className="animate-slide-up">
                            <div className="section-card">
                                <div className="marquee-header-flex">
                                    <div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>Delivery Status</h3>
                                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Control pharmacy home delivery availability.</p>
                                    </div>
                                    <div className="status-toggle-group">
                                        <button
                                            onClick={() => !deliverySettings.isEnabled && toggleDeliveryEnabled()}
                                            className={`toggle-btn on ${deliverySettings.isEnabled ? 'active' : ''}`}
                                        >
                                            ON
                                        </button>
                                        <button
                                            onClick={() => deliverySettings.isEnabled && toggleDeliveryEnabled()}
                                            className={`toggle-btn off ${!deliverySettings.isEnabled ? 'active' : ''}`}
                                        >
                                            OFF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="table-container">
                                <div className="table-actions">
                                    <h3 style={{ fontWeight: 800 }}>Time Windows</h3>
                                    <button className="btn-add" onClick={() => { setModalMode('add'); setSlotForm({ start: '09:00', end: '11:00', active: true }); setShowModal(true); }}>
                                        <Plus size={18} /> Add Slot
                                    </button>
                                </div>
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Time Slot</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deliverySettings.slots.map(slot => (
                                                <tr key={slot.id}>
                                                    <td data-label="Time Slot">{slot.time}</td>
                                                    <td data-label="Status">
                                                        <span className={`status-tag ${slot.active ? 'active' : 'inactive'}`}>
                                                            {slot.active ? 'Active' : 'Hidden'}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions" className="actions">
                                                        <button className="action-btn" onClick={() => {
                                                            setModalMode('edit');
                                                            setEditingId(slot.id);
                                                            const [start12, end12] = slot.time.split(' - ');
                                                            setSlotForm({
                                                                start: parseTimeFrom12h(start12),
                                                                end: parseTimeFrom12h(end12),
                                                                active: slot.active
                                                            });
                                                            setShowModal(true);
                                                        }}><Pencil size={16} /></button>
                                                        <button className="action-btn delete" onClick={() => deleteSlot(slot.id)}><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coupons Tab */}
                    {activeTab === 'coupons' && (
                        <div className="animate-slide-up">
                            <div className="section-card">
                                <div className="marquee-header-flex">
                                    <div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>Coupon Marquee Display</h3>
                                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Enable or disable the scrolling coupon bar on the website.</p>
                                    </div>
                                    <div className="status-toggle-group">
                                        <button
                                            onClick={() => {
                                                if (deliverySettings.showMarquee !== true) {
                                                    updateDeliverySettings({ ...deliverySettings, showMarquee: true });
                                                    showNotify('Marquee On');
                                                }
                                            }}
                                            className={`toggle-btn on ${deliverySettings.showMarquee !== false ? 'active' : ''}`}
                                        >
                                            VISIBLE
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (deliverySettings.showMarquee !== false) {
                                                    updateDeliverySettings({ ...deliverySettings, showMarquee: false });
                                                    showNotify('Marquee Off');
                                                }
                                            }}
                                            className={`toggle-btn off ${deliverySettings.showMarquee === false ? 'active' : ''}`}
                                        >
                                            HIDDEN
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="table-container">
                                <div className="table-actions">
                                    <div className="table-search"><Search size={18} /><input type="text" placeholder="Search coupons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                                    <button className="btn-add" onClick={() => { setModalMode('add'); setCouponForm({ code: '', discount: 2, isActive: true, expiryDate: '' }); setShowModal(true); }}><Plus size={18} /> Create Coupon</button>
                                </div>
                                <div className="table-wrapper">
                                    <table className="admin-table">
                                        <thead><tr><th>Code</th><th>Discount (%)</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase())).map(coupon => (
                                                <tr key={coupon.id}>
                                                    <td data-label="Code"><strong style={{ color: 'var(--primary)' }}>{coupon.code}</strong></td>
                                                    <td data-label="Discount (%)">{coupon.discount}%</td>
                                                    <td data-label="Expiry">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Limit'}</td>
                                                    <td data-label="Status">
                                                        <span className={`status-tag ${coupon.isActive ? 'active' : 'inactive'}`} style={{ cursor: 'pointer' }} onClick={() => updateCoupon(coupon.id, { isActive: !coupon.isActive })}>
                                                            {coupon.isActive ? 'Active' : 'Disabled'}
                                                        </span>
                                                    </td>
                                                    <td data-label="Actions" className="actions">
                                                        <button className="action-btn" onClick={() => startEditCoupon(coupon)} title="Edit"><Pencil size={16} /></button>
                                                        <button className="action-btn delete" onClick={() => requestDelete('coupon', coupon.id, coupon.code)} title="Delete"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {coupons.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No coupons created yet.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Staff Tab */}
                    {activeTab === 'staff' && (
                        <div className="table-container staff-table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setManagerForm({ name: '', email: '', password: '', permissions: [] }); setShowModal(true); }}><Plus size={18} /> Add Manager</button>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Name</th><th>Email</th><th>Password</th><th>Rights</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {managers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(manager => (
                                            <tr key={manager.id}>
                                                <td data-label="Name"><strong>{manager.name}</strong></td>
                                                <td data-label="Email">{manager.email}</td>
                                                <td data-label="Password"><code style={{ background: '#f8fafc', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>{manager.password}</code></td>
                                                <td data-label="Rights">
                                                    <div className="staff-rights-list">
                                                        {manager.permissions.map(p => (
                                                            <span key={p} className="status-tag active" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{p}</span>
                                                        ))}
                                                        {manager.permissions.length === 0 && <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>No Rights</span>}
                                                    </div>
                                                </td>
                                                <td data-label="Actions" className="actions">
                                                    <button className="action-btn" onClick={() => {
                                                        setModalMode('edit');
                                                        setEditingId(manager.id);
                                                        setManagerForm({ ...manager });
                                                        setShowModal(true);
                                                    }} title="Edit"><Pencil size={16} /></button>
                                                    <button className="action-btn delete" onClick={() => requestDelete('manager', manager.id, manager.name)} title="Delete"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {managers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No managers added yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="animate-slide-up">
                            <div className="section-card">
                                <div className="card-header">
                                    <h3>Medicine Categories</h3>
                                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Manage categories available in the online pharmacy shop.</p>
                                </div>

                                <div className="table-actions">
                                    <div className="table-search">
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCategoriesPage(1); }}
                                        />
                                    </div>
                                    <button
                                        className="btn-add"
                                        onClick={() => {
                                            setModalMode('add');
                                            setCategoryName('');
                                            setShowModal(true);
                                        }}
                                    >
                                        <Plus size={18} /> Add Category
                                    </button>
                                </div>

                                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                                    <div className="scrollable-section-wrapper">
                                        <div className="table-wrapper">
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Category Name</th>
                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories
                                                        .filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
                                                        .slice((categoriesPage - 1) * adminItemsPerPage, categoriesPage * adminItemsPerPage)
                                                        .map(cat => (
                                                            <tr key={cat}>
                                                                <td data-label="Category Name"><strong>{cat}</strong></td>
                                                                <td data-label="Actions" className="actions" style={{ justifyContent: 'flex-end' }}>
                                                                    <button
                                                                        className="action-btn delete"
                                                                        onClick={() => {
                                                                            if (confirm(`Are you sure you want to delete "${cat}" category?`)) {
                                                                                deleteCategory(cat);
                                                                                showNotify('Category removed', 'error');
                                                                            }
                                                                        }}
                                                                        title="Delete Category"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    {categories.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>No categories found.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {Math.ceil(categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage) > 1 && (
                                        <div className="pagination-bar" style={{ borderRadius: '24px', border: '1px solid var(--admin-border)', marginTop: '1rem' }}>
                                            <button
                                                onClick={() => setCategoriesPage(p => Math.max(1, p - 1))}
                                                disabled={categoriesPage === 1}
                                                className="page-nav-btn"
                                            >
                                                <ArrowLeft size={18} /> Prev
                                            </button>
                                            <div className="page-numbers">
                                                Page <span>{categoriesPage}</span> of {Math.ceil(categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage)}
                                            </div>
                                            <button
                                                onClick={() => setCategoriesPage(p => Math.min(Math.ceil(categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage), p + 1))}
                                                disabled={categoriesPage === Math.ceil(categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).length / adminItemsPerPage)}
                                                className="page-nav-btn"
                                            >
                                                Next <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Shared Modal Backdrop/Overlay */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className={`admin-modal ${activeTab !== 'dashboard' ? 'compact-modal' : ''}`}>
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'New' : 'Update'} {activeTab === 'staff' ? 'Staff' : activeTab === 'categories' ? 'Category' : activeTab.slice(0, -1)}</h3>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--admin-text-muted)' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={
                            activeTab === 'doctors' ? handleDoctorSubmit :
                                activeTab === 'medicines' ? handleProductSubmit :
                                    activeTab === 'orders' ? handleOrderSubmit :
                                        activeTab === 'appointments' ? handleAppointmentSubmit :
                                            activeTab === 'coupons' ? handleCouponSubmit :
                                                activeTab === 'staff' ? handleManagerSubmit :
                                                    activeTab === 'categories' ? handleCategorySubmit :
                                                        handleSlotSubmit
                        } className="modal-form">
                            {activeTab === 'doctors' && (
                                <>
                                    <div className="form-group"><label>Doctor Name</label><input type="text" required value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} /></div>
                                    <div className="form-group"><label>Specialization</label><input type="text" required value={doctorForm.specialty} onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })} /></div>
                                    <div className="form-group"><label>Morning Slot</label><input type="text" required value={doctorForm.morning} onChange={e => setDoctorForm({ ...doctorForm, morning: e.target.value })} /></div>
                                    <div className="form-group"><label>Evening Slot</label><input type="text" required value={doctorForm.evening} onChange={e => setDoctorForm({ ...doctorForm, evening: e.target.value })} /></div>
                                </>
                            )}
                            {activeTab === 'medicines' && (
                                <>
                                    {modalMode === 'add' && (
                                        <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, border: '1px solid #dbeafe' }}>
                                            💡 You can keep adding medicines. Close the modal when done.
                                        </div>
                                    )}
                                    <div className="form-group"><label>Name*</label><input type="text" required value={productForm.name} placeholder="e.g. Paracetamol" onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></div>
                                    <div className="form-group">
                                        <label>Category*</label>
                                        <select
                                            value={productForm.category}
                                            onChange={e => {
                                                const newCat = e.target.value;
                                                setProductForm({ ...productForm, category: newCat });
                                            }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Price (₹)*</label><input type="number" required value={productForm.price} placeholder="0.00" onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></div>
                                    <div className="form-group"><label>Discount (%)</label><input type="number" value={productForm.discount} placeholder="0" onChange={e => setProductForm({ ...productForm, discount: e.target.value })} /></div>
                                    <div className="form-group"><label>Image URL*</label><input type="text" required value={productForm.image} placeholder="https://example.com/image.jpg" onChange={e => setProductForm({ ...productForm, image: e.target.value })} /></div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                        <label style={{ marginBottom: 0 }}>Stock Status:</label>
                                        <button
                                            type="button"
                                            className={`status-tag ${productForm.stock ? 'active' : 'inactive'}`}
                                            style={{ cursor: 'pointer', border: '1px solid currentColor', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                            onClick={() => setProductForm({ ...productForm, stock: !productForm.stock })}
                                        >
                                            {productForm.stock ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </>
                            )}
                            {activeTab === 'orders' && (
                                <>
                                    <div style={{ backgroundColor: '#fdf2f8', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#db2777', fontWeight: 600, border: '1px solid #fce7f3' }}>
                                        🛍️ Record a store/offline order for walk-in customers.
                                    </div>
                                    <div className="form-group"><label>Customer ID (Optional)</label><input type="text" value={orderForm.customerId} placeholder="Auto-generated if empty" onChange={e => setOrderForm({ ...orderForm, customerId: e.target.value })} /></div>
                                    <div className="form-group"><label>Customer Name*</label><input type="text" required value={orderForm.customerName} placeholder="Full Name" onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })} /></div>
                                    <div className="form-group"><label>Phone Number*</label><input type="tel" required value={orderForm.phone} placeholder="+91..." onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} /></div>
                                    <div className="form-group"><label>Full Address (Optional)</label><textarea value={orderForm.address} placeholder="Shipping or contact address" onChange={e => setOrderForm({ ...orderForm, address: e.target.value })}></textarea></div>
                                    <div className="form-group"><label>Total Bill Amount (₹)*</label><input type="number" required value={orderForm.total} placeholder="0.00" onChange={e => setOrderForm({ ...orderForm, total: e.target.value })} /></div>
                                    <div className="form-group">
                                        <label>Payment Method</label>
                                        <select value={orderForm.paymentMethod} onChange={e => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}>
                                            <option value="cash">Cash on Delivery / In-Store</option>
                                            <option value="online">Online Payment</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {activeTab === 'appointments' && (
                                <>
                                    <div className="form-group"><label>Patient Name</label><input type="text" required value={appointmentForm.patientName} onChange={e => setAppointmentForm({ ...appointmentForm, patientName: e.target.value })} /></div>
                                    <div className="form-group"><label>Contact</label><input type="tel" required value={appointmentForm.phone} onChange={e => setAppointmentForm({ ...appointmentForm, phone: e.target.value })} /></div>
                                    <div className="form-group">
                                        <label>Doctor</label>
                                        <select value={appointmentForm.doctorName} onChange={e => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}>
                                            <option value="">Select Doctor</option>
                                            {doctors.map(d => <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Internal Note</label><textarea value={appointmentForm.message} onChange={e => setAppointmentForm({ ...appointmentForm, message: e.target.value })}></textarea></div>
                                </>
                            )}
                            {activeTab === 'delivery' && (
                                <>
                                    <div className="form-group">
                                        <label>Start (e.g., 09:00)</label>
                                        <input type="time" required value={slotForm.start} onChange={e => setSlotForm({ ...slotForm, start: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>End (e.g., 11:00)</label>
                                        <input type="time" required value={slotForm.end} onChange={e => setSlotForm({ ...slotForm, end: e.target.value })} />
                                    </div>
                                </>
                            )}
                            {activeTab === 'coupons' && (
                                <>
                                    <div className="form-group">
                                        <label>Coupon Code (e.g. SAVE5)</label>
                                        <input type="text" required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="ALPHANUMERIC" />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount Percentage (2% - 6%)</label>
                                        <input type="number" required min="2" max="6" value={couponForm.discount} onChange={e => setCouponForm({ ...couponForm, discount: parseInt(e.target.value) })} />
                                        <small style={{ color: 'var(--admin-text-muted)', marginTop: '0.25rem', display: 'block' }}>Strictly between 2% and 6%</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date (Optional)</label>
                                        <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                        <label style={{ marginBottom: 0 }}>Enable Coupon:</label>
                                        <button
                                            type="button"
                                            className={`status-tag ${couponForm.isActive ? 'active' : 'inactive'}`}
                                            style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                                            onClick={() => setCouponForm({ ...couponForm, isActive: !couponForm.isActive })}
                                        >
                                            {couponForm.isActive ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                </>
                            )}
                            {activeTab === 'categories' && (
                                <>
                                    <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, border: '1px solid #dbeafe' }}>
                                        💡 Add multiple categories. Close the modal when done.
                                    </div>
                                    <div className="form-group">
                                        <label>Category Name*</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Wellness"
                                            value={categoryName}
                                            onChange={e => setCategoryName(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            {activeTab === 'staff' && (
                                <>
                                    <div className="form-group"><label>Full Name*</label><input type="text" required value={managerForm.name} onChange={e => setManagerForm({ ...managerForm, name: e.target.value })} /></div>
                                    <div className="form-group"><label>Email Address*</label><input type="email" required value={managerForm.email} onChange={e => setManagerForm({ ...managerForm, email: e.target.value })} /></div>
                                    <div className="form-group"><label>Password*</label><input type="password" required value={managerForm.password} onChange={e => setManagerForm({ ...managerForm, password: e.target.value })} /></div>
                                    <div className="form-group">
                                        <label style={{ marginBottom: '1rem', display: 'block' }}>Assign Rights (Permissions):*</label>
                                        <div className="permissions-grid">
                                            {[
                                                { id: 'dashboard', label: 'Dashboard' },
                                                { id: 'doctors', label: 'Doctors' },
                                                { id: 'medicines', label: 'Medicines' },
                                                { id: 'orders', label: 'Orders' },
                                                { id: 'appointments', label: 'Appointments' },
                                                { id: 'delivery', label: 'Delivery' },
                                                { id: 'coupons', label: 'Coupons' }
                                            ].map(perm => (
                                                <label key={perm.id} className="permission-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={managerForm.permissions.includes(perm.id)}
                                                        onChange={() => togglePermission(perm.id)}
                                                    />
                                                    <span>{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="btn-add" style={{ width: '100%', marginTop: '1rem' }}>
                                {modalMode === 'add' ? 'Confirm Addition' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Details Overlay */}
            {selectedOrder && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal order-details">
                        <div className="modal-header">
                            <h3>Order #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                        </div>
                        <div className="order-meta">
                            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                            <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                            <p><strong>Address:</strong> {selectedOrder.address}</p>
                            <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
                        </div>
                        <div className="order-items-list">
                            <h4>Items Ordered</h4>
                            <table>
                                <thead><tr><th>Medicine</th><th>Qty</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx}><td>{item.name}</td><td>{item.quantity}</td><td>₹{item.price * item.quantity}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="order-total-footer">
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Total Amount: ₹{selectedOrder.total}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Overlay */}
            {deleteConfirm.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <div style={{ color: '#dc2626', marginBottom: '1rem' }}><Trash2 size={48} /></div>
                        <h3>Are you sure?</h3>
                        <p style={{ margin: '1rem 0 2rem', color: 'var(--admin-text-muted)' }}>You are about to delete <strong>{deleteConfirm.name}</strong>. This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-add btn-cancel" style={{ flex: 1 }} onClick={() => setDeleteConfirm({ show: false, type: '', id: null, name: '' })}>No, Cancel</button>
                            <button className="btn-add btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
