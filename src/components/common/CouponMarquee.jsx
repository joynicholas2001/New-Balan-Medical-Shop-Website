import React from 'react';
import { useData } from '../../context/DataContext';
import './CouponMarquee.css';

const CouponMarquee = () => {
    const { getActiveCoupons, deliverySettings } = useData();
    const activeCoupons = getActiveCoupons();

    if (deliverySettings.showMarquee === false) return null;
    if (activeCoupons.length === 0) return null;

    // Duplicate coupons exactly 3 times for a seamless -33.33% translation loop
    const displayCoupons = [...activeCoupons, ...activeCoupons, ...activeCoupons];

    return (
        <div className="coupon-marquee-container">
            <div className="marquee-content">
                {displayCoupons.map((coupon, index) => (
                    <div key={`${coupon.id}-${index}`} className="marquee-item">
                        <span className="single-coupon-text">
                            <span className="highlight-code">{coupon.code}</span> — GET {coupon.discount}% OFF YOUR ORDER
                        </span>
                        <span className="coupon-separator">|</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CouponMarquee;
