import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Pill, ShoppingCart, Search, Plus, Trash2, Check, X, Menu, Clock, MapPin, Phone, Pencil, AlertCircle, Eye, CheckCircle, XCircle, LogOut, Bell, Truck, Ticket, UserCheck, Filter, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Bike } from 'lucide-react';
import './Admin.css';

// Simple beep sound
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'; // Short placeholder, will replace with better if needed or use browser default logic

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { doctors, deleteDoctor, addDoctor, updateDoctor, products, deleteProduct, addProduct, updateProduct, orders, addOrder, updateOrderStatus, appointments, addAppointment, updateAppointment, deleteAppointment, updateAppointmentStatus, newOrderNotification, deliverySettings, updateDeliverySettings, coupons, addCoupon, updateCoupon, deleteCoupon, managers, addManager, updateManager, deleteManager, categories, addCategory, deleteCategory, prescriptions, addPrescription, updatePrescriptionStatus, deliveryPersons, addDeliveryPerson, updateDeliveryPerson, deleteDeliveryPerson, assignOrderToDelivery, logs, addLog } = useData();
    const { logout, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

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
    const [appointmentForm, setAppointmentForm] = useState({ patientName: '', phone: '', doctorName: '', message: '', status: 'Confirmed' });
    const [slotForm, setSlotForm] = useState({ start: '09:00', end: '11:00', active: true });
    const [couponForm, setCouponForm] = useState({ code: '', discount: 2, isActive: true, expiryDate: '' });
    const [managerForm, setManagerForm] = useState({ name: '', email: '', password: '', permissions: [] });
    const [categoryName, setCategoryName] = useState('');
    const [deliveryPersonForm, setDeliveryPersonForm] = useState({ name: '', phone: '', vehicle: '', status: 'Available' });
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [orderToAssign, setOrderToAssign] = useState(null);

    // Prescription Conversion State
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [convertCart, setConvertCart] = useState([]);
    const [convertSearchTerm, setConvertSearchTerm] = useState('');

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

        const mode = modalMode;
        setShowModal(false);

        if (mode === 'add') {
            addProduct(data);
            setTimeout(() => showNotify('Medicine added'), 100);
        } else {
            updateProduct(editingId, data);
            setTimeout(() => showNotify('Medicine updated'), 100);
        }

        setProductForm({ name: '', category: categories?.[0] || 'OTC', price: '', image: '', discount: '0', requiresPrescription: false, stock: true });
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
        showNotify('Category added');
        setCategoryName('');
        setShowModal(false);
    };

    const handleDeliveryPersonSubmit = (e) => {
        e.preventDefault();
        if (!deliveryPersonForm.name || !deliveryPersonForm.phone) {
            showNotify('Missing fields', 'error');
            return;
        }

        if (modalMode === 'add') {
            addDeliveryPerson(deliveryPersonForm);
            showNotify('Delivery staff added');
        } else {
            updateDeliveryPerson(editingId, deliveryPersonForm);
            showNotify('Delivery staff updated');
        }
        setShowModal(false);
        setDeliveryPersonForm({ name: '', phone: '', vehicle: '', status: 'Available' });
        setEditingId(null);
    };

    const handleAssignOrder = (deliveryPersonId) => {
        if (orderToAssign && deliveryPersonId) {
            assignOrderToDelivery(orderToAssign.id, deliveryPersonId);
            showNotify('Order assigned successfully');
            setAssignModalOpen(false);
            setOrderToAssign(null);
        }
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
        } else if (deleteConfirm.type === 'deliveryPerson') {
            deleteDeliveryPerson(deleteConfirm.id);
            showNotify('Delivery Staff deleted');
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
        { id: 'delivery-staff', label: 'Delivery Staff', icon: <Bike size={20} />, permission: 'delivery' },
        { id: 'coupons', label: 'Coupons & Marquee', icon: <Ticket size={20} />, permission: 'coupons' },
        { id: 'prescriptions', label: 'Prescriptions', icon: <FileText size={20} />, permission: 'orders' },
        { id: 'staff', label: 'Manage Staff', icon: <UserCheck size={20} />, permission: 'staff' },
        { id: 'categories', label: 'Medicine Categories', icon: <Filter size={20} />, permission: 'medicines' },
        { id: 'logs', label: 'Activity Logs', icon: <FileText size={20} />, permission: 'dashboard' },
    ];

    const availableMenuItems = menuItems.filter(item => hasPermission(item.permission));

    useEffect(() => {
        if (availableMenuItems.length > 0 && !availableMenuItems.find(m => m.id === activeTab)) {
            setActiveTab(availableMenuItems[0].id);
        }
    }, [user, availableMenuItems, activeTab]);


    const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Prescription Conversion Logic
    const openConvertModal = (presc) => {
        setSelectedPrescription(presc);
        setConvertCart([]);
        setConvertSearchTerm('');
        setConvertModalOpen(true);
    };

    const addToConvertCart = (product) => {
        setConvertCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showNotify(`${product.name} added`);
    };

    const removeFromConvertCart = (id) => {
        setConvertCart(prev => prev.filter(item => item.id !== id));
    };

    const handleConvertSubmit = () => {
        if (!selectedPrescription || convertCart.length === 0) {
            showNotify('Cart is empty', 'error');
            return;
        }

        const totalAmount = convertCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            userId: selectedPrescription.userId, // Assuming prescription has userId
            customerName: selectedPrescription.userName,
            customerPhone: selectedPrescription.userPhone,
            items: convertCart,
            total: totalAmount,
            prescriptionId: selectedPrescription.id,
            status: 'Pending',
            paymentMethod: 'Pay on Delivery', // Default
            address: 'Address from User Profile' // simplified
        };

        // We need 'addOrder' from useData.
        addOrder(newOrder);

        // Also update prescription
        updatePrescriptionStatus(selectedPrescription.id, 'Converted');

        // Add log
        addLog('Order Created', 'Order', `Created order from prescription #${selectedPrescription.id} for ${selectedPrescription.userName}`);

        // We don't have addOrder exposed correctly? 
        // Admin destructuring has 'assignOrderToDelivery'. 
        // Wait, 'addOrder' WAS in the destructuring in Step 38?
        // Yes: `orders, updateOrderStatus`... wait.
        // Step 12 outline: `addOrder` is in DataContext but `Admin` destructuring list is long.
        // Let's check step 38 replacement content.
        // `orders, updateOrderStatus` - I don't see `addOrder` in the list!
        // DataContext *exports* `addOrder` (line 271 of DataContext).
        // I need to add `addOrder` to Admin destructuring.

        setConvertModalOpen(false);
        showNotify('Prescription converted to Order');
    };

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
                            <p>ADMIN PORTAL</p>
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
                                <div className="stat-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div className="stat-icon blue"><ShoppingCart size={24} /></div>
                                        <div>
                                            <h4>Total Orders</h4>
                                            <p>{orders.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div className="stat-icon green"><Users size={24} /></div>
                                        <div>
                                            <h4>Specialists</h4>
                                            <p>{doctors.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div className="stat-icon orange"><Pill size={24} /></div>
                                        <div>
                                            <h4>Inventory</h4>
                                            <p>{products.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="recent-activity" style={{ marginTop: '3rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}><Clock size={20} /> Recent Appointments</h3>
                                <div className="table-container">
                                    <div className="table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Patient</th>
                                                    <th>Doctor</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appointments.slice(0, 5).map(app => (
                                                    <tr key={app.id}>
                                                        <td data-label="Patient">{app.patientName}</td>
                                                        <td data-label="Doctor">{app.doctorName}</td>
                                                        <td data-label="Date">{new Date(app.date).toLocaleDateString()}</td>
                                                        <td data-label="Status">
                                                            <span className={`status-tag ${app.status.toLowerCase()}`}>{app.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {appointments.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No recent appointments.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctors Tab */}
                    {activeTab === 'doctors' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search doctors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setDoctorForm({ name: '', specialty: '', morning: '10:00 AM - 1:00 PM', evening: '5:00 PM - 9:00 PM', available: true }); setShowModal(true); }}><Plus size={18} /> Add Doctor</button>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Doctor Name</th><th>Specialty</th><th>Morning</th><th>Evening</th><th>Actions</th></tr></thead>
                                    <tbody>{filteredDoctors.map(doc => (
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
                    )}

                    {/* Medicines Tab */}
                    {activeTab === 'medicines' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setProductForm({ name: '', category: categories?.[0] || 'OTC', price: '', image: '', discount: '0', requiresPrescription: false, stock: true }); setShowModal(true); }}><Plus size={18} /> Add Product</button>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                                    <tbody>{filteredProducts.map(prod => (
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
                    )}

                    {/* Prescriptions Tab */}
                    {activeTab === 'prescriptions' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search prescriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Date</th><th>User</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {prescriptions.map(presc => (
                                            <tr key={presc.id}>
                                                <td data-label="Date">{new Date(presc.date).toLocaleDateString()}</td>
                                                <td data-label="User">
                                                    <div>{presc.userName}</div>
                                                    <small style={{ color: 'var(--text-muted)' }}>{presc.userPhone}</small>
                                                </td>
                                                <td data-label="Notes" style={{ maxWidth: '200px' }}>{presc.userNotes || 'No notes'}</td>
                                                <td data-label="Status">
                                                    <span className={`status-tag ${presc.status.toLowerCase()}`}>{presc.status}</span>
                                                </td>
                                                <td data-label="Actions" className="actions">
                                                    <button className="action-btn" onClick={() => window.open(presc.imageUrl, '_blank')} title="View Image"><Eye size={16} /></button>
                                                    {presc.status !== 'Converted' && presc.status !== 'Rejected' && (
                                                        <button className="action-btn" onClick={() => openConvertModal(presc)} title="Convert to Order" style={{ color: 'var(--primary)' }}>
                                                            <ShoppingCart size={16} />
                                                        </button>
                                                    )}
                                                    {presc.status === 'Pending' && (
                                                        <>
                                                            <button className="action-btn" onClick={() => { updatePrescriptionStatus(presc.id, 'Approved'); showNotify('Approved'); }} title="Approve"><CheckCircle size={16} /></button>
                                                            <button className="action-btn delete" onClick={() => { updatePrescriptionStatus(presc.id, 'Rejected'); showNotify('Rejected'); }} title="Reject"><XCircle size={16} /></button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {prescriptions.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No prescriptions uploaded.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search orders..." /></div>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>{orders.map(order => (
                                        <tr key={order.id}>
                                            <td data-label="Order ID">{order.id}</td>
                                            <td data-label="Customer">{order.customerName}</td>
                                            <td data-label="Total">₹{order.total}</td>
                                            <td data-label="Status">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        if (newStatus === 'Out for Delivery') {
                                                            setOrderToAssign(order);
                                                            setAssignModalOpen(true);
                                                        } else {
                                                            updateOrderStatus(order.id, newStatus);
                                                            showNotify(`${newStatus}`);
                                                        }
                                                    }}
                                                    className={`admin-status-select ${order.status.toLowerCase().replace(/ /g, '-')}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                {order.deliveryPersonId && <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--primary)' }}>Assigned</div>}
                                            </td>
                                            <td data-label="Actions" className="actions">
                                                <button className="action-btn" onClick={() => setSelectedOrder(order)} title="View Details"><Eye size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                        {orders.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No orders placed yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search appointments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setAppointmentForm({ patientName: '', phone: '', doctorName: '', message: '', status: 'Confirmed' }); setShowModal(true); }}><Plus size={18} /> Add Appointment</button>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Patient</th><th>Phone</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>{appointments.map(app => (
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

                    {/* Delivery Staff Tab */}
                    {activeTab === 'delivery-staff' && (
                        <div className="table-container animate-slide-up">
                            <div className="table-actions">
                                <div className="table-search"><Search size={18} /><input type="text" placeholder="Search delivery staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                                <button className="btn-add" onClick={() => { setModalMode('add'); setDeliveryPersonForm({ name: '', phone: '', vehicle: '', status: 'Available' }); setShowModal(true); }}><Plus size={18} /> Add Staff</button>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Name</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {deliveryPersons.map(person => (
                                            <tr key={person.id}>
                                                <td data-label="Name">{person.name}</td>
                                                <td data-label="Phone">{person.phone}</td>
                                                <td data-label="Vehicle">{person.vehicle}</td>
                                                <td data-label="Status">
                                                    <span className={`status-tag ${person.status.toLowerCase()}`}>{person.status}</span>
                                                </td>
                                                <td data-label="Actions" className="actions">
                                                    <button className="action-btn" onClick={() => {
                                                        setModalMode('edit');
                                                        setEditingId(person.id);
                                                        setDeliveryPersonForm(person);
                                                        setShowModal(true);
                                                    }}><Pencil size={16} /></button>
                                                    <button className="action-btn delete" onClick={() => requestDelete('deliveryPerson', person.id, person.name)}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {deliveryPersons.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No delivery staff added.</td></tr>}
                                    </tbody>
                                </table>
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
                                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <div className="table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Category Name</th>
                                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).map(cat => (
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
                            </div>
                        </div>
                    )}

                    {/* Logs Tab */}
                    {activeTab === 'logs' && (
                        <div className="animate-slide-up">
                            <div className="section-card">
                                <div className="card-header">
                                    <h3>System Activity Logs</h3>
                                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Audit and Inventory logs tracking system usage.</p>
                                </div>

                                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                                    <div className="table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Timestamp</th>
                                                    <th>User</th>
                                                    <th>Action</th>
                                                    <th>Entity</th>
                                                    <th>Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.map(log => (
                                                    <tr key={log.id}>
                                                        <td data-label="Timestamp" style={{ fontSize: '0.85rem' }}>
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </td>
                                                        <td data-label="User">{log.user}</td>
                                                        <td data-label="Action">
                                                            <span className="status-tag active" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td data-label="Entity">{log.entity}</td>
                                                        <td data-label="Details" style={{ fontSize: '0.85rem', color: '#666' }}>{log.details}</td>
                                                    </tr>
                                                ))}
                                                {logs.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No logs recorded yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* General Modal */}
            {showModal && (
                <div className="admin-modal-overlay animate-fade">
                    <div className="admin-modal compact-modal">
                        <div className="modal-header">
                            <h3>
                                {modalMode === 'add' ? 'New' : 'Edit'}
                                {activeTab === 'doctors' ? ' Doctor' :
                                    activeTab === 'medicines' ? ' Medicine' :
                                        activeTab === 'delivery-staff' ? ' Delivery Staff' :
                                            activeTab === 'staff' ? ' Manager' :
                                                activeTab === 'categories' ? ' Category' :
                                                    activeTab === 'coupons' ? ' Coupon' :
                                                        activeTab === 'delivery' ? ' Time Slot' :
                                                            activeTab === 'appointments' ? ' Appointment' : ' Item'}
                            </h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form className="modal-form" onSubmit={
                            activeTab === 'doctors' ? handleDoctorSubmit :
                                activeTab === 'medicines' ? handleProductSubmit :
                                    activeTab === 'appointments' ? handleAppointmentSubmit :
                                        activeTab === 'delivery' ? handleSlotSubmit :
                                            activeTab === 'coupons' ? handleCouponSubmit :
                                                activeTab === 'staff' ? handleManagerSubmit :
                                                    activeTab === 'delivery-staff' ? handleDeliveryPersonSubmit :
                                                        activeTab === 'categories' ? handleCategorySubmit : null
                        }>
                            {/* ... Dynamic Forms ... */}
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
                                    <div className="form-group"><label>Name*</label><input type="text" required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></div>
                                    <div className="form-group">
                                        <label>Category*</label>
                                        <select
                                            value={productForm.category}
                                            onChange={e => {
                                                const newCat = e.target.value;
                                                setProductForm({ ...productForm, category: newCat });
                                                showNotify(`${newCat}`);
                                            }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Price (₹)*</label><input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></div>
                                    <div className="form-group"><label>Discount (%)</label><input type="number" value={productForm.discount} onChange={e => setProductForm({ ...productForm, discount: e.target.value })} /></div>
                                    <div className="form-group"><label>Image URL*</label><input type="text" required value={productForm.image} placeholder="https://example.com/image.jpg" onChange={e => setProductForm({ ...productForm, image: e.target.value })} /></div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                        <label style={{ marginBottom: 0 }}>Stock Status:</label>
                                        <button
                                            type="button"
                                            className={`status-tag ${productForm.stock ? 'active' : 'inactive'}`}
                                            style={{ cursor: 'pointer', border: '1px solid currentColor' }}
                                            onClick={() => setProductForm({ ...productForm, stock: !productForm.stock })}
                                        >
                                            {productForm.stock ? 'In Stock' : 'Out of Stock'}
                                        </button>
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
                            {activeTab === 'delivery-staff' && (
                                <>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" value={deliveryPersonForm.name} onChange={e => setDeliveryPersonForm({ ...deliveryPersonForm, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="text" value={deliveryPersonForm.phone} onChange={e => setDeliveryPersonForm({ ...deliveryPersonForm, phone: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Vehicle Number</label>
                                        <input type="text" value={deliveryPersonForm.vehicle} onChange={e => setDeliveryPersonForm({ ...deliveryPersonForm, vehicle: e.target.value })} placeholder="KA-01-AB-1234" />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={deliveryPersonForm.status} onChange={e => setDeliveryPersonForm({ ...deliveryPersonForm, status: e.target.value })}>
                                            <option value="Available">Available</option>
                                            <option value="Busy">Busy</option>
                                            <option value="Offline">Offline</option>
                                        </select>
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

            {/* Convert Prescription Modal */}
            {convertModalOpen && selectedPrescription && (
                <div className="admin-modal-overlay animate-fade">
                    <div className="admin-modal large-modal" style={{ maxWidth: '900px', width: '90%' }}>
                        <div className="modal-header">
                            <h3>Convert Prescription to Order</h3>
                            <button className="close-btn" onClick={() => setConvertModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', height: '600px', overflow: 'hidden' }}>
                            {/* Left: Validated Prescription */}
                            <div className="presc-view" style={{ overflowY: 'auto' }}>
                                <h4>Prescription Reference</h4>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <p><strong>Customer:</strong> {selectedPrescription.userName}</p>
                                    <p><strong>Notes:</strong> {selectedPrescription.userNotes || 'None'}</p>
                                </div>
                                <img src={selectedPrescription.imageUrl} alt="Prescription" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>

                            {/* Right: Cart Builder */}
                            <div className="order-builder" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <h4>Build Order</h4>

                                <div className="product-search" style={{ marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Search medicines..."
                                        value={convertSearchTerm}
                                        onChange={(e) => setConvertSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                    {convertSearchTerm && (
                                        <div className="search-results" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', marginTop: '0.5rem', borderRadius: '6px', background: 'white', zIndex: 10 }}>
                                            {products
                                                .filter(p => p.name.toLowerCase().includes(convertSearchTerm.toLowerCase()))
                                                .map(p => (
                                                    <div key={p.id} onClick={() => addToConvertCart(p)} style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{p.name} <small style={{ color: 'gray' }}>({p.stock ? 'In Stock' : 'No Stock'})</small></span>
                                                        <span style={{ fontWeight: 'bold' }}>₹{p.price}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                <div className="cart-items" style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                                    {convertCart.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>No items added yet.</p> : (
                                        convertCart.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.quantity} x ₹{item.price}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ fontWeight: 600 }}>₹{item.quantity * item.price}</div>
                                                    <button onClick={() => removeFromConvertCart(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="cart-footer">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                        <span>Total:</span>
                                        <span>₹{convertCart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
                                    </div>
                                    <button className="btn-add" style={{ width: '100%' }} onClick={handleConvertSubmit}>Create Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* View Order Details Modal */}
            {selectedOrder && (
                <div className="admin-modal-overlay animate-fade">
                    <div className="admin-modal" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header">
                            <h3>Order #{selectedOrder.id} Details</h3>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Date</p>
                                    <p style={{ fontWeight: 600 }}>{selectedOrder.date}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Status</p>
                                    <span className={`status-tag ${selectedOrder.status.toLowerCase().replace(/ /g, '-')}`}>{selectedOrder.status}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Amount</p>
                                    <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{selectedOrder.total}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Items Count</p>
                                    <p style={{ fontWeight: 600 }}>{selectedOrder.items?.length || 0} Items</p>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Order Items</h4>
                            <div className="order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #f1f5f9', borderRadius: '8px', background: 'white' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                                        </div>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Delivery Modal-Specific */}
            {assignModalOpen && (
                <div className="admin-modal-overlay animate-fade">
                    <div className="admin-modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Assign Delivery For Order #{orderToAssign?.id}</h3>
                            <button className="close-btn" onClick={() => setAssignModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <p style={{ marginBottom: '1rem' }}>Select a delivery person:</p>
                            <div className="delivery-list">
                                {deliveryPersons.filter(d => d.status === 'Available').length === 0 && <p style={{ color: 'red' }}>No delivery staff available.</p>}
                                {deliveryPersons.map(person => (
                                    <div
                                        key={person.id}
                                        className={`delivery-person-card ${person.status !== 'Available' ? 'disabled' : ''}`}
                                        onClick={() => person.status === 'Available' && handleAssignOrder(person.id)}
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            marginBottom: '10px',
                                            cursor: person.status === 'Available' ? 'pointer' : 'not-allowed',
                                            opacity: person.status === 'Available' ? 1 : 0.6,
                                            background: person.status === 'Available' ? '#f8fafc' : '#f1f5f9'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{person.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{person.status} • {person.vehicle || 'No Vehicle'}</div>
                                    </div>
                                ))}
                            </div>
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
