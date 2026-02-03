import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const { cart, subtotal, clearCart } = useCart();
    const { addOrder, deliverySettings, validateCoupon } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });

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

    const [isOrderSuccess, setIsOrderSuccess] = useState(false);

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

    const handlePlaceOrder = (e) => {
        e.preventDefault();

        const orderData = {
            customerName: formData.name,
            customerEmail: user?.email || formData.email || 'N/A',
            phone: formData.phone,
            address: `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}`,
            items: cart,
            total: finalTotal.toFixed(2),
            discount: discountAmount.toFixed(2),
            couponCode: appliedDiscount > 0 ? formData.coupon : 'N/A',
            paymentMethod: formData.paymentMethod,
            paymentId: formData.paymentMethod === 'online' ? 'PAY-' + Date.now() : 'N/A',
            deliverySlot: formData.deliverySlot || 'N/A'
        };

        addOrder(orderData);
        setIsOrderSuccess(true);
        setTimeout(() => {
            clearCart();
            navigate('/pharmacy');
        }, 3000);
    };

    if (isOrderSuccess) {
        return (
            <div className="checkout-success animate-fade">
                <div className="success-icon-container">
                    <CheckCircle size={80} />
                </div>
                <h1 className="success-title">Order Placed Successfully!</h1>
                <p className="success-message">Thank you for your order. We will deliver it soon.</p>
                <button className="btn-outline" onClick={() => navigate('/pharmacy')}>Continue Shopping</button>
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
                        <form onSubmit={handlePlaceOrder} className="checkout-form-container">
                            <h3 className="checkout-section-title">Contact Information</h3>
                            <div className="form-row-2">
                                <div className="checkout-input-group">
                                    <label className="checkout-label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="checkout-input"
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
                                        required
                                        className="checkout-input"
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
                                    required
                                    className="checkout-input"
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
                                        required
                                        className="checkout-input"
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
                                        required
                                        className="checkout-input"
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
                                        required
                                        className="checkout-input"
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

                            <h3 className="checkout-section-title checkout-section-divider">Payment Method</h3>
                            <div className="payment-options">
                                <div className="payment-method-box">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={true}
                                        readOnly
                                    />
                                    <span className="payment-method-text">Online Payment (UPI/Card)</span>
                                </div>
                            </div>

                            {deliverySettings.isEnabled && (
                                <div className="checkout-section-divider">
                                    <h3 className="checkout-section-title">Delivery Time Slot</h3>
                                    <div className="slots-grid">
                                        {deliverySettings.slots.filter(s => s.active).map(slot => (
                                            <label
                                                key={slot.id}
                                                className={`slot-option ${formData.deliverySlot === slot.time ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deliverySlot"
                                                    required
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
                                Place Order (₹{finalTotal.toFixed(2)})
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
        </div>
    );
};

export default Checkout;
