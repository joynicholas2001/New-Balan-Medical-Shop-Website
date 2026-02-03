/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doctors as initialDoctors } from '../data/doctors';
import { products as initialProducts } from '../data/products';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [doctors, setDoctors] = useState(() => {
        const saved = localStorage.getItem('nb_doctors');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Filter out legacy doctors AND update ID 1
            return parsed
                .filter(d => d.name !== "Dr. Shalini Raman" && d.name !== "Dr. Rajesh Mani")
                .map(d => {
                    if (d.id === 1) {
                        // Force update ID 1 to match the latest initialDoctors[0]
                        return initialDoctors[0];
                    }
                    return d;
                });
        }
        return initialDoctors;
    });

    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('nb_products');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('nb_orders')) || []);
    const [appointments, setAppointments] = useState(() => JSON.parse(localStorage.getItem('nb_appointments')) || []);

    const [deliverySettings, setDeliverySettings] = useState(() => {
        const saved = localStorage.getItem('nb_delivery_settings');
        return saved ? JSON.parse(saved) : {
            isEnabled: true,
            slots: [
                { id: 1, time: '10:00 AM - 12:00 PM', active: true },
                { id: 2, time: '12:00 PM - 02:00 PM', active: true },
                { id: 3, time: '02:00 PM - 04:00 PM', active: true },
                { id: 4, time: '04:00 PM - 06:00 PM', active: true },
                { id: 5, time: '06:00 PM - 08:00 PM', active: true }
            ],
            showMarquee: true
        };
    });

    const [coupons, setCoupons] = useState(() => {
        const saved = localStorage.getItem('nb_coupons');
        return saved ? JSON.parse(saved) : [];
    });

    const [managers, setManagers] = useState(() => {
        const saved = localStorage.getItem('nb_managers');
        return saved ? JSON.parse(saved) : [];
    });

    const [deliveryPersons, setDeliveryPersons] = useState(() => {
        const saved = localStorage.getItem('nb_delivery_persons');
        return saved ? JSON.parse(saved) : [];
    });

    const [savedAddresses, setSavedAddresses] = useState(() => {
        const saved = localStorage.getItem('nb_saved_addresses');
        return saved ? JSON.parse(saved) : [];
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('nb_categories');
        if (saved) return JSON.parse(saved);

        // Extract from initial products if none saved
        const initialCategories = [...new Set(initialProducts.map(p => p.category))];
        return initialCategories.length > 0 ? initialCategories : ['OTC', 'Prescription', 'Daily Care', 'Wellness'];
    });

    const [prescriptions, setPrescriptions] = useState(() => {
        const saved = localStorage.getItem('nb_prescriptions');
        return saved ? JSON.parse(saved) : [];
    });

    // Admin Notification State
    const [newOrderNotification, setNewOrderNotification] = useState(false);

    useEffect(() => {
        localStorage.setItem('nb_doctors', JSON.stringify(doctors));
    }, [doctors]);

    useEffect(() => {
        localStorage.setItem('nb_products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('nb_orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('nb_appointments', JSON.stringify(appointments));
    }, [appointments]);

    useEffect(() => {
        localStorage.setItem('nb_delivery_settings', JSON.stringify(deliverySettings));
    }, [deliverySettings]);

    useEffect(() => {
        localStorage.setItem('nb_coupons', JSON.stringify(coupons));
    }, [coupons]);

    useEffect(() => {
        localStorage.setItem('nb_managers', JSON.stringify(managers));
    }, [managers]);

    useEffect(() => {
        localStorage.setItem('nb_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('nb_delivery_persons', JSON.stringify(deliveryPersons));
    }, [deliveryPersons]);

    useEffect(() => {
        localStorage.setItem('nb_saved_addresses', JSON.stringify(savedAddresses));
    }, [savedAddresses]);

    useEffect(() => {
        localStorage.setItem('nb_prescriptions', JSON.stringify(prescriptions));
    }, [prescriptions]);

    // Doctor Operations
    const addDoctor = (doc) => setDoctors([...doctors, { ...doc, id: Date.now() }]);
    const updateDoctor = (id, updatedDoc) => setDoctors(doctors.map(d => d.id === id ? { ...d, ...updatedDoc } : d));
    const deleteDoctor = (id) => setDoctors(doctors.filter(d => d.id !== id));

    // Product Operations
    const addProduct = (prod) => setProducts([...products, { ...prod, id: Date.now() }]);
    const updateProduct = (id, updatedProd) => setProducts(products.map(p => p.id === id ? { ...p, ...updatedProd } : p));
    const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));

    // Category Operations
    const addCategory = (name) => {
        if (!categories.includes(name)) {
            setCategories([...categories, name]);
        }
    };
    const deleteCategory = (name) => {
        setCategories(categories.filter(c => c !== name));
    };

    // Order Operations
    const addOrder = (order) => {
        const newOrder = {
            ...order,
            id: Date.now(),
            status: 'Pending',
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        setOrders(prev => [newOrder, ...prev]);
        setNewOrderNotification(true); // Trigger notification
    };

    const clearNotification = () => setNewOrderNotification(false);

    const updateOrderStatus = (id, status) => setOrders(orders.map(o => o.id === id ? { ...o, status } : o));

    // Appointment Operations
    const addAppointment = (app) => setAppointments([{ ...app, id: Date.now(), status: 'Pending', date: new Date().toISOString() }, ...appointments]);
    const updateAppointment = (id, updatedApp) => setAppointments(appointments.map(a => a.id === id ? { ...a, ...updatedApp } : a));
    const deleteAppointment = (id) => setAppointments(appointments.filter(a => a.id !== id));
    const updateAppointmentStatus = (id, status) => setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));

    // Prescription Operations
    const addPrescription = (prescription) => {
        const newPrescription = {
            ...prescription,
            id: Date.now(),
            status: 'Pending', // Pending, Approved, Rejected, Converted
            date: new Date().toISOString(),
            notes: ''
        };
        setPrescriptions([newPrescription, ...prescriptions]);
    };

    const updatePrescriptionStatus = (id, status, notes = '') => {
        setPrescriptions(prescriptions.map(p =>
            p.id === id ? { ...p, status, notes: notes || p.notes } : p
        ));
    };

    const deletePrescription = (id) => {
        setPrescriptions(prescriptions.filter(p => p.id !== id));
    };

    // Delivery Settings Operations
    const updateDeliverySettings = (newSettings) => setDeliverySettings(newSettings);

    // Coupon Operations
    const addCoupon = (coupon) => {
        const newCoupon = {
            ...coupon,
            id: Date.now(),
            isActive: true
        };
        setCoupons([...coupons, newCoupon]);
    };

    const updateCoupon = (id, updatedCoupon) => {
        setCoupons(coupons.map(c => c.id === id ? { ...c, ...updatedCoupon } : c));
    };

    const deleteCoupon = (id) => {
        setCoupons(coupons.filter(c => c.id !== id));
    };

    // Manager Operations
    const addManager = (manager) => setManagers([...managers, { ...manager, id: Date.now(), role: 'manager' }]);
    const updateManager = (id, updatedManager) => setManagers(managers.map(m => m.id === id ? { ...m, ...updatedManager } : m));
    const deleteManager = (id) => setManagers(managers.filter(m => m.id !== id));

    // Delivery Person Operations
    const addDeliveryPerson = (person) => setDeliveryPersons([...deliveryPersons, { ...person, id: Date.now(), status: 'Available' }]);
    const updateDeliveryPerson = (id, data) => setDeliveryPersons(deliveryPersons.map(d => d.id === id ? { ...d, ...data } : d));
    const deleteDeliveryPerson = (id) => setDeliveryPersons(deliveryPersons.filter(d => d.id !== id));

    const assignOrderToDelivery = (orderId, deliveryPersonId) => {
        setOrders(orders.map(o =>
            o.id === orderId ? { ...o, deliveryPersonId, status: 'Out for Delivery' } : o
        ));
        setDeliveryPersons(deliveryPersons.map(d =>
            d.id === Number(deliveryPersonId) ? { ...d, status: 'Busy', currentOrderId: orderId } : d
        ));
    };

    // Address Operations
    const addAddress = (address) => setSavedAddresses([...savedAddresses, { ...address, id: Date.now() }]);
    const deleteAddress = (id) => setSavedAddresses(savedAddresses.filter(a => a.id !== id));

    // Log Operations
    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('nb_logs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('nb_logs', JSON.stringify(logs));
    }, [logs]);

    const addLog = (action, entity, details, user = 'System') => {
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action,
            entity,
            details,
            user
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const validateCoupon = (code) => {
        const cleanCode = code ? code.trim().toUpperCase() : '';
        const coupon = coupons.find(c => c.code.trim().toUpperCase() === cleanCode);
        if (!coupon) return { success: false, message: 'Invalid coupon code' };
        if (!coupon.isActive) return { success: false, message: 'Coupon is disabled' };

        if (coupon.expiryDate) {
            const expiry = new Date(coupon.expiryDate);
            if (expiry < new Date()) return { success: false, message: 'Coupon has expired' };
        }

        if (coupon.discount < 2 || coupon.discount > 6) {
            return { success: false, message: 'Coupon is out of valid range' };
        }

        return { success: true, discount: coupon.discount };
    };

    const getActiveCoupons = () => {
        return coupons.filter(c => {
            const isActive = c.isActive;
            const notExpired = c.expiryDate ? new Date(c.expiryDate) > new Date() : true;
            return isActive && notExpired;
        });
    };

    return (
        <DataContext.Provider value={{
            doctors, addDoctor, updateDoctor, deleteDoctor,
            products, addProduct, updateProduct, deleteProduct,
            categories, addCategory, deleteCategory,
            orders, addOrder, updateOrderStatus,
            appointments, addAppointment, updateAppointment, deleteAppointment, updateAppointmentStatus,
            newOrderNotification, clearNotification,
            deliverySettings, updateDeliverySettings,
            coupons, addCoupon, updateCoupon, deleteCoupon, validateCoupon, getActiveCoupons,
            managers, addManager, updateManager, deleteManager,
            prescriptions, addPrescription, updatePrescriptionStatus, deletePrescription,
            deliveryPersons, addDeliveryPerson, updateDeliveryPerson, deleteDeliveryPerson, assignOrderToDelivery,
            savedAddresses, addAddress, deleteAddress,
            logs, addLog
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
