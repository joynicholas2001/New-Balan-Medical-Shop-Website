import React from 'react';
import { useCart } from '../../context/CartContext';
import CartContent from './CartContent';
import './CartDrawer.css';

const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <CartContent closeCart={() => setIsCartOpen(false)} isDrawer={true} />
            </div>
        </>
    );
};

export default CartDrawer;
