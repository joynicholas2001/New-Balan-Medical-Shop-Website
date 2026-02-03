import React from 'react';
import { useCart } from '../../context/CartContext';
import { useData } from '../../context/DataContext';
import { ShoppingCart, X, Plus, Minus, Trash2, FileUp, Check, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css'; // Reusing styles

const CartContent = ({ closeCart, isDrawer = false }) => {
    const { cart, removeFromCart, updateQuantity, subtotal, clearCart, requiresPrescription, setIsCartOpen } = useCart();
    const { deliverySettings } = useData();
    const navigate = useNavigate();

    // Use admin settings for delivery availability
    const isOrderAllowed = () => {
        return deliverySettings.isEnabled;
    };

    const startShopping = () => {
        if (closeCart) closeCart();
        setIsCartOpen(false);
        navigate('/pharmacy');
    };

    return (
        <div className={`cart-content-wrapper ${isDrawer ? '' : 'page-mode'}`}>
            <div className="cart-header">
                <h3>Shopping Cart ({cart.length})</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {cart.length > 0 && <button className="btn-text" onClick={clearCart} style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Clear All</button>}
                    {isDrawer && <button className="close-cart" onClick={closeCart}><X size={24} /></button>}
                </div>
            </div>

            <div className="cart-items">
                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <ShoppingCart size={48} />
                        <p>Your cart is empty.</p>
                        <button className="btn btn-outline" onClick={startShopping}>Start Shopping</button>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="ci-image"><ShoppingBag size={30} /></div>
                            <div className="ci-details">
                                <h4>{item.name}</h4>
                                <p>₹{item.price}</p>
                                <div className="ci-actions">
                                    <div className="qty-selector">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div className="cart-footer">
                    {requiresPrescription && (
                        <div className="prescription-upload">
                            <p><FileUp size={16} /> Prescription Required</p>
                            <div className="upload-box">
                                <input type="file" />
                                <span>Click to upload prescription</span>
                            </div>
                        </div>
                    )}
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <button className="checkout-btn" disabled={!isOrderAllowed()} onClick={() => {
                        if (closeCart) closeCart();
                        setIsCartOpen(false);
                        navigate('/checkout');
                    }}>
                        {isOrderAllowed() ? 'Proceed to Checkout' : 'Orders Closed'}
                    </button>
                    <p className="time-note">Home delivery within 5km radius only.</p>
                </div>
            )}
        </div>
    );
};

export default CartContent;
