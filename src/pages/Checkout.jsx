import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle, ArrowLeft, CreditCard, Smartphone, Building, QrCode, X, Loader2, FileText } from 'lucide-react';
import { downloadInvoice } from '../utils/invoiceGenerator';
import './Checkout.css';

const Checkout = () => {
    const { cart, subtotal, clearCart } = useCart();
    const { addOrder, deliverySettings, validateCoupon } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: user?.city || '',
        state: '',
        pincode: '',
        country: 'India',
        paymentMethod: 'online',
        email: user?.email || '',
        deliverySlot: '',
        coupon: ''
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false); // { provider: 'GPay', status: 'processing' }
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [lastOrder, setLastOrder] = useState(null);

    // If cart is empty and NOT a success state, show empty
    if (cart.length === 0 && !isOrderSuccess) {
        return (
            <div className="checkout-page container empty-cart-state" style={{ textAlign: 'center' }}>
                <ShoppingBag size={64} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
                <h2>Your cart is empty</h2>
                <button className="btn-primary" onClick={() => navigate('/pharmacy')} style={{ marginTop: '1rem' }}>
                    Browse Medicines
                </button>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: null }); // Clear error
        }
        if (e.target.name === 'coupon') {
            setCouponMsg({ text: '', type: '' });
            setAppliedDiscount(0);
        }
    };

    const handleApplyCoupon = () => {
        if (!formData.coupon) {
            setCouponMsg({ text: 'Please enter a coupon code', type: 'error' });
            return;
        }

        const result = validateCoupon(formData.coupon);
        if (result.success) {
            setAppliedDiscount(result.discount);
            setCouponMsg({ text: `Success! ${result.discount}% discount applied.`, type: 'success' });
        } else {
            setAppliedDiscount(0);
            setCouponMsg({ text: result.message, type: 'error' });
        }
    };

    const deliveryFee = deliverySettings.isEnabled ? 40 : 0;
    const discountAmount = (subtotal * appliedDiscount) / 100;
    const finalTotal = subtotal + deliveryFee - discountAmount;

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Required';
        if (!formData.phone) errors.phone = 'Required';
        if (!formData.street) errors.street = 'Required';
        if (!formData.city) errors.city = 'Required';
        if (!formData.state) errors.state = 'Required';
        if (!formData.pincode) errors.pincode = 'Required';
        if (deliverySettings.isEnabled && !formData.deliverySlot) errors.deliverySlot = 'Please select a slot';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInitiatePayment = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowPaymentModal(true);
        } else {
            // Scroll to top or show toast
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const processPayment = (provider) => {
        setProcessingPayment(provider);
        // Simulate payment gateway delay
        setTimeout(() => {
            handleFinalizeOrder(provider);
        }, 2000);
    };

    const handleFinalizeOrder = (provider) => {
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const orderData = {
            id: orderId, // Client-side ID generation for display
            customerId: user?.id || `CUST-${Date.now()}`,
            customerName: formData.name,
            customerEmail: user?.email || formData.email || 'N/A',
            phone: formData.phone,
            address: `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}`,
            items: [...cart], // Copy cart items
            total: finalTotal.toFixed(2),
            subtotal: subtotal.toFixed(2),
            deliveryFee: deliveryFee,
            discount: discountAmount.toFixed(2),
            couponCode: appliedDiscount > 0 ? formData.coupon : 'N/A',
            paymentMethod: 'online',
            paymentId: `${provider.toUpperCase()}-${Date.now()}`,
            deliverySlot: formData.deliverySlot || 'N/A',
            handledBy: null,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'Pending'
        };

        addOrder(orderData);
        setLastOrder(orderData); // Save for receipt
        setShowPaymentModal(false);
        setIsOrderSuccess(true);

        // Clear cart after a slight delay to ensure receipt renders with data if needed (though we copied it)
        setTimeout(() => {
            clearCart();
        }, 500);
    };

    if (isOrderSuccess && lastOrder) {
        return (
            <div className="checkout-success animate-fade">
                <div className="success-icon-container">
                    <CheckCircle size={80} />
                </div>
                <h1 className="success-title">Order Placed Successfully!</h1>
                <p className="success-message">Thank you, <span style={{ fontWeight: 700, color: '#333' }}>{lastOrder.customerName}</span>! Your order has been received.</p>

                <div className="receipt-card">
                    <div className="receipt-header">
                        <div className="receipt-row">
                            <span>Order ID</span>
                            <span className="mono">{lastOrder.id}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Date</span>
                            <span>{lastOrder.date}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Payment ID</span>
                            <span className="mono" style={{ fontSize: '0.85rem' }}>{lastOrder.paymentId}</span>
                        </div>
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-items">
                        <div className="receipt-items-label" style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>Items Ordered</div>
                        {lastOrder.items.map((item, idx) => (
                            <div key={idx} className="receipt-item">
                                <span className="item-qty">{item.quantity}x</span>
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-totals">
                        <div className="receipt-row">
                            <span>Subtotal</span>
                            <span>₹{lastOrder.subtotal}</span>
                        </div>
                        {lastOrder.deliveryFee > 0 && (
                            <div className="receipt-row">
                                <span>Delivery</span>
                                <span>₹{lastOrder.deliveryFee}</span>
                            </div>
                        )}
                        {parseFloat(lastOrder.discount) > 0 && (
                            <div className="receipt-row discount">
                                <span>Discount</span>
                                <span>-₹{lastOrder.discount}</span>
                            </div>
                        )}
                        <div className="receipt-total-row">
                            <span>Total Paid</span>
                            <span>₹{lastOrder.total}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={() => navigate('/pharmacy')}>Continue Shopping</button>
                    <button className="btn-outline" onClick={() => downloadInvoice(lastOrder)}>
                        <FileText size={18} style={{ marginRight: '6px' }} /> Download Invoice
                    </button>
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <button className="text-btn" onClick={() => navigate('/profile')} style={{ color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>View My Orders</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page animate-fade">
            <div className="container">
                <button className="back-link" onClick={() => navigate('/pharmacy')}>
                    <ArrowLeft size={20} /> Back to Pharmacy
                </button>

                <h1 className="checkout-main-title">Checkout & Delivery</h1>

                <div className="checkout-grid">
                    {/* Left: Form */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleInitiatePayment} className="checkout-form-container">
                            <h3 className="checkout-section-title">Contact Information</h3>
                            <div className="form-row-2">
                                <div className="checkout-input-group">
                                    <label className="checkout-label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`checkout-input ${formErrors.name ? 'error' : ''}`}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="checkout-input-group">
                                    <label className="checkout-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={`checkout-input ${formErrors.phone ? 'error' : ''}`}
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <h3 className="checkout-section-title checkout-section-divider">Shipping Address</h3>

                            <div className="checkout-input-group">
                                <label className="checkout-label">Street Address *</label>
                                <textarea
                                    name="street"
                                    className={`checkout-input ${formErrors.street ? 'error' : ''}`}
                                    placeholder="House/Flat no., Building name, Street name"
                                    value={formData.street}
                                    onChange={handleChange}
                                    rows="2"
                                    style={{ fontFamily: 'inherit', resize: 'none' }}
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="checkout-input-group">
                                    <label className="checkout-label">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={`checkout-input ${formErrors.city ? 'error' : ''}`}
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="checkout-input-group">
                                    <label className="checkout-label">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className={`checkout-input ${formErrors.state ? 'error' : ''}`}
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="checkout-input-group">
                                    <label className="checkout-label">PIN Code *</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className={`checkout-input ${formErrors.pincode ? 'error' : ''}`}
                                        placeholder="PIN Code"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="checkout-input-group">
                                    <label className="checkout-label">Country</label>
                                    <select
                                        name="country"
                                        className="checkout-select"
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        <option value="India">India</option>
                                    </select>
                                </div>
                            </div>

                            {deliverySettings.isEnabled && (
                                <div className="checkout-section-divider">
                                    <h3 className="checkout-section-title">Delivery Time Slot {formErrors.deliverySlot && <span className="error-text" style={{ color: 'red', fontSize: '0.8rem', marginLeft: '0.5rem' }}>* Required</span>}</h3>
                                    <div className="slots-grid">
                                        {deliverySettings.slots.filter(s => s.active).map(slot => (
                                            <label
                                                key={slot.id}
                                                className={`slot-option ${formData.deliverySlot === slot.time ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deliverySlot"
                                                    value={slot.time}
                                                    checked={formData.deliverySlot === slot.time}
                                                    onChange={handleChange}
                                                    style={{ display: 'none' }}
                                                />
                                                {slot.time}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-place-order">
                                Proceed to Pay ₹{finalTotal.toFixed(2)}
                            </button>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="order-summary-section">
                        <div className="summary-card">
                            <h3 className="summary-title">Order Summary</h3>

                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div>
                                            <p className="summary-item-name">{item.name}</p>
                                            <p className="summary-item-qty">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                        <p className="summary-item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="coupon-box">
                                <label className="checkout-label">Have a Coupon?</label>
                                <div className="coupon-input-group">
                                    <input
                                        type="text"
                                        name="coupon"
                                        placeholder="Enter code"
                                        className="checkout-input"
                                        value={formData.coupon}
                                        onChange={handleChange}
                                    />
                                    <button type="button" className="btn-apply-coupon" onClick={handleApplyCoupon}>Apply</button>
                                </div>
                                {couponMsg.text && (
                                    <p style={{
                                        fontSize: '0.8rem',
                                        marginTop: '0.5rem',
                                        fontWeight: 600,
                                        color: couponMsg.type === 'success' ? '#22c55e' : '#ef4444'
                                    }}>
                                        {couponMsg.text}
                                    </p>
                                )}
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span className="delivery-fee">{deliverySettings.isEnabled ? '₹40.00' : 'Free'}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="summary-row" style={{ color: '#22c55e' }}>
                                        <span>Discount ({appliedDiscount}%)</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="total-row">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Gateway Simulation Modal */}
            {showPaymentModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal">
                        <div className="payment-header">
                            <h3>Select Payment Method</h3>
                            <button onClick={() => !processingPayment && setShowPaymentModal(false)} disabled={!!processingPayment}><X size={24} /></button>
                        </div>

                        <div className="payment-amount">
                            Paying: <span>₹{finalTotal.toFixed(2)}</span>
                        </div>

                        {processingPayment ? (
                            <div className="payment-processing">
                                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                                <h4>Processing Payment...</h4>
                                <p>Please wait while we securely connect to {processingPayment}</p>
                            </div>
                        ) : (
                            <div className="payment-options-grid">
                                {(isMobile ?
                                    // Mobile Options: GPay, PhonePe, Card
                                    <>
                                        <button className="payment-btn gpay" onClick={() => processPayment('Google Pay')}>
                                            <span className="brand-logo">GPay</span>
                                            <span>Google Pay</span>
                                        </button>
                                        <button className="payment-btn phonepe" onClick={() => processPayment('PhonePe')}>
                                            <span className="brand-logo">Pe</span>
                                            <span>PhonePe</span>
                                        </button>
                                        <button className="payment-btn card" onClick={() => processPayment('Card')}>
                                            <CreditCard size={24} />
                                            <span>Card / Debit</span>
                                        </button>
                                    </>
                                    :
                                    // Laptop Options: PhonePe, Net Banking, UPI, Card
                                    <>
                                        <button className="payment-btn phonepe" onClick={() => processPayment('PhonePe')}>
                                            <span className="brand-logo">Pe</span>
                                            <span>PhonePe</span>
                                        </button>
                                        <button className="payment-btn upi" onClick={() => processPayment('UPI')}>
                                            <QrCode size={24} />
                                            <span>UPI / QR</span>
                                        </button>
                                        <button className="payment-btn netbanking" onClick={() => processPayment('Net Banking')}>
                                            <Building size={24} />
                                            <span>Net Banking</span>
                                        </button>
                                        <button className="payment-btn card" onClick={() => processPayment('Card')}>
                                            <CreditCard size={24} />
                                            <span>Credit / Debit Card</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="payment-footer">
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> 100% Secure Transaction</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
