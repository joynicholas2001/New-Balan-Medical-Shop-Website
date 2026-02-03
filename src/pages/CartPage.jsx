import React from 'react';
import CartContent from '../components/common/CartContent';

const CartPage = () => {
    return (
        <div className="cart-page animate-fade" style={{
            paddingTop: 'var(--nav-height)',
            minHeight: 'calc(100vh - var(--nav-height))',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div className="container" style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '2rem 1rem',
                flex: 1,
                width: '100%'
            }}>
                <CartContent />
            </div>
        </div>
    );
};

export default CartPage;
