import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { ShoppingCart, Search, Filter, AlertCircle, ShoppingBag, Trash2, Plus, Minus, FileUp, X, Clock, Check, ChevronDown } from 'lucide-react';
import './Pharmacy.css';

const Pharmacy = () => {
    const { products, deliverySettings, categories: dynamicCategories } = useData();
    const { cart, addToCart, setIsCartOpen, subtotal } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const categories = ['All', ...dynamicCategories];
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Use admin settings for delivery availability
    const isOrderAllowed = () => {
        return deliverySettings.isEnabled;
    };

    // Reset pagination on search or category change
    const handleFilterChange = (type, value) => {
        setCurrentPage(1);
        if (type === 'search') setSearchTerm(value);
        if (type === 'category') {
            setActiveCategory(value);
            setIsDropdownOpen(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p && p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="pharmacy-page animate-fade">
            <header className="page-header pharmacy-header">
                <div className="container">
                    <div className="pharmacy-header-content">
                        <div className="header-text">
                            <h1 style={{ color: '#fff' }}>Online Pharmacy</h1>
                            <p>Genuine medicines delivered with care.</p>
                        </div>
                        <button className="cart-trigger" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCart size={24} />
                            <span className="cart-count">{cart.length}</span>
                            <div className="cart-total">₹{subtotal.toFixed(2)}</div>
                        </button>
                    </div>
                </div>
            </header>

            <section className="section shop-section">
                <div className="container">
                    <div className="shop-controls flex items-center justify-between">
                        <div className="search-bar">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by medicine name..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>
                        <div className="custom-dropdown" ref={dropdownRef}>
                            <button
                                className={`dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <Filter size={18} className="filter-icon" />
                                <span>{activeCategory === 'All' ? 'All Categories' : activeCategory}</span>
                                <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'rotate' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu animate-slide-down">
                                    {categories.map(cat => (
                                        <div
                                            key={cat}
                                            className={`dropdown-item ${activeCategory === cat ? 'selected' : ''}`}
                                            onClick={() => handleFilterChange('category', cat)}
                                        >
                                            {cat === 'All' ? 'All Categories' : cat}
                                            {activeCategory === cat && <Check size={14} className="check-icon" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isOrderAllowed() && (
                        <div className="time-alert">
                            <Clock size={20} />
                            <span>Notice: Home delivery is currently unavailable. You can still browse our inventory.</span>
                        </div>
                    )}

                    <div className="product-grid">
                        {paginatedProducts.map(prod => (
                            <div key={prod.id} className="product-card">
                                <div className="product-image">
                                    {prod.image ? (
                                        <img src={prod.image} alt={prod.name} className="product-img-render" />
                                    ) : (
                                        <ShoppingBag size={48} className="placeholder-icon" />
                                    )}
                                    {prod.requiresPrescription && <span className="prescription-badge">RX Required</span>}
                                    {!prod.stock && <div className="out-of-stock">Out of Stock</div>}
                                </div>
                                <div className="product-info">
                                    <span className="p-cat">{prod.category}</span>
                                    <h3>{prod.name}</h3>
                                    <div className="p-price">
                                        <span className="current">₹{prod.price}</span>
                                        {prod.discount > 0 && <span className="old">₹{(prod.price / (1 - prod.discount / 100)).toFixed(0)}</span>}
                                    </div>
                                    <button
                                        className="add-btn"
                                        disabled={!prod.stock || !isOrderAllowed()}
                                        onClick={() => addToCart(prod)}
                                    >
                                        {prod.stock ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                                Previous
                            </button>

                            <div className="page-numbers">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        className={`page-num ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Pharmacy;
