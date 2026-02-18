import React, { useState, useMemo } from 'react'
import { useProcurement } from '../context/ProcurementContext.js'
import './Products.css'


export default function Products() {
    const { products, addProduct, updateProduct, deleteProduct, getProductStatus } = useProcurement();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'Electronics',
        sku: '',
        price: '',
        stock: '',
        incoming: '',
        status: 'In stock',
        image: '📦'
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'All' || getProductStatus(p.stock) === statusFilter;

            let matchesPrice = true;
            if (priceFilter === 'Low') matchesPrice = p.price < 1000;
            else if (priceFilter === 'Mid') matchesPrice = p.price >= 1000 && p.price <= 5000;
            else if (priceFilter === 'High') matchesPrice = p.price > 5000;

            return matchesSearch && matchesStatus && matchesPrice;
        });
    }, [products, search, statusFilter, priceFilter]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, priceFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('All');
        setPriceFilter('All');
        setCurrentPage(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addProduct({
            ...newProduct,
            price: parseFloat(newProduct.price) || 0,
            stock: parseInt(newProduct.stock) || 0,
            incoming: parseInt(newProduct.incoming) || 0
        });
        setIsAddModalOpen(false);
        setNewProduct({
            name: '',
            category: 'Electronics',
            sku: '',
            price: '',
            stock: '',
            incoming: '',
            status: 'In stock',
            image: '📦'
        });
    };

    const handleToggleExpand = (product) => {
        if (expandedProductId === product.id) {
            setExpandedProductId(null);
            setEditingProduct(null);
        } else {
            setExpandedProductId(product.id);
            setEditingProduct({
                ...product,
                brand: product.brand || 'Unknown',
                productionYear: product.productionYear || '2020',
                madeIn: product.madeIn || 'Global',
                cost: product.cost || '10%',
                size: product.size || 'N/A',
                tags: product.tags || ['general']
            });
        }
    };

    const handleSaveEdit = () => {
        updateProduct(editingProduct);
        setExpandedProductId(null);
        setEditingProduct(null);
    };

    const handleDeleteProduct = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            deleteProduct(id);
            setExpandedProductId(null);
            setEditingProduct(null);
        }
    };

    const stats = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const outOfStock = products.filter(p => p.stock <= 0).length;
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
        const inStock = products.filter(p => p.stock > 10).length;
        const total = products.length;

        return {
            totalValue,
            inStock,
            lowStock,
            outOfStock,
            total,
            stockPct: (inStock / total) * 100,
            lowPct: (lowStock / total) * 100,
            outPct: (outOfStock / total) * 100
        };
    }, [products]);

    return (
        <div className="products-container">
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Product</h2>
                            <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter name"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="AFZM000"
                                        value={newProduct.sku}
                                        onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option>Electronics</option>
                                        <option>Apparel</option>
                                        <option>Wellness</option>
                                        <option>Home & Living</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Initial Stock</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        value={newProduct.stock}
                                        onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Icon / Emoji</label>
                                    <input
                                        type="text"
                                        placeholder="📦"
                                        value={newProduct.image}
                                        onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="products-header">
                <div className="header-title-row">
                    <h1>Inventory</h1>
                    <div className="header-actions">
                        <button className="btn-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5V14" /></svg>
                            Import
                        </button>
                        <button className="btn-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5" /></svg>
                            Export
                        </button>
                        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Product
                        </button>
                    </div>
                </div>

                <div className="inventory-stats-row">
                    <div className="stat-card asset-value">
                        <span className="stat-label">Total Asset Value</span>
                        <h2 className="stat-value">${stats.totalValue.toLocaleString()}</h2>
                    </div>
                    <div className="stat-card health-summary">
                        <div className="health-header">
                            <h2 className="health-total">{stats.total} <span>Products</span></h2>
                            <div className="health-bar">
                                <div className="bar-segment stock" style={{ width: `${stats.stockPct}%` }}></div>
                                <div className="bar-segment low" style={{ width: `${stats.lowPct}%` }}></div>
                                <div className="bar-segment out" style={{ width: `${stats.outPct}%` }}></div>
                            </div>
                        </div>
                        <div className="health-legend">
                            <div className="legend-item stock"><span></span> In stock: <strong>{stats.inStock}</strong></div>
                            <div className="legend-item low"><span></span> Low stock: <strong>{stats.lowStock}</strong></div>
                            <div className="legend-item out"><span></span> Out of stock: <strong>{stats.outOfStock}</strong></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="inventory-table-card">
                <div className="table-controls">
                    <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="Search product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <div className="control-pill">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Recent Entries
                        </div>
                        <select
                            className="control-select"
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                        >
                            <option value="All">Amount Status</option>
                            <option value="Low">Under $1,000</option>
                            <option value="Mid">$1,000 - $5,000</option>
                            <option value="High">Above $5,000</option>
                        </select>
                        <select
                            className="control-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="In stock">In stock</option>
                            <option value="Low stock">Low stock</option>
                            <option value="Out of stock">Out of stock</option>
                        </select>
                        <button className="btn-filter" onClick={resetFilters}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
                            Reset
                        </button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" /></th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>SKU</th>
                                <th>Incoming</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((p) => (
                                <React.Fragment key={p.id}>
                                    <tr
                                        className={`inventory-row ${expandedProductId === p.id ? 'expanded' : ''}`}
                                        onClick={() => handleToggleExpand(p)}
                                    >
                                        <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                                        <td>
                                            <div className="product-info">
                                                <div className="product-img-mini">{p.image}</div>
                                                <span className="product-name">{p.name}</span>
                                            </div>
                                        </td>
                                        <td>{p.category}</td>
                                        <td><span className="sku-tag">{p.sku}</span></td>
                                        <td>{p.incoming}</td>
                                        <td>{p.stock}</td>
                                        <td>
                                            <span className={`status-badge ${getProductStatus(p.stock).toLowerCase().replace(/\s+/g, '-')}`}>
                                                {getProductStatus(p.stock)}
                                            </span>
                                        </td>
                                        <td><strong>${p.price.toLocaleString()}</strong></td>
                                        <td>
                                            <button
                                                className="btn-icon-more"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleExpand(p);
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedProductId === p.id && (
                                        <tr className="expanded-detail-row">
                                            <td colSpan="9">
                                                <div className="expanded-detail-container animate-slideDown">
                                                    <div className="detail-layout">
                                                        <div className="detail-visual">
                                                            <div className="large-prod-img">{p.image}</div>
                                                        </div>
                                                        <div className="detail-form-grid">
                                                            <div className="detail-field">
                                                                <label>Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.name}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Price</label>
                                                                <input
                                                                    type="number"
                                                                    value={editingProduct.price}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Size</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.size}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, size: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>ID Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.sku}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Production Year</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.productionYear}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, productionYear: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Cost (%)</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.cost}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, cost: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Brand</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.brand}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Made In</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.madeIn}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, madeIn: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="detail-field">
                                                                <label>Stock</label>
                                                                <input
                                                                    type="number"
                                                                    value={editingProduct.stock}
                                                                    onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                                                />
                                                            </div>
                                                            <div className="detail-tags-field">
                                                                <label>Tags</label>
                                                                <div className="detail-tags-list">
                                                                    {editingProduct.tags.map((tag, i) => (
                                                                        <span key={i} className="detail-tag-pill">{tag}</span>
                                                                    ))}
                                                                    <button className="btn-add-tag">+</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="detail-actions">
                                                        <button
                                                            className="btn-danger"
                                                            onClick={() => handleDeleteProduct(p.id, p.name)}
                                                            style={{ marginRight: 'auto' }}
                                                        >
                                                            Delete Product
                                                        </button>
                                                        <button className="btn-secondary" onClick={() => setExpandedProductId(null)}>Cancel</button>
                                                        <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span className="result-info">
                        Result {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                        {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                    </span>
                    <div className="pagination">
                        <button
                            className={`btn-page nav ${currentPage === 1 ? 'disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ← Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Show first, last, current, and pages around current
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        className={`btn-page ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 ||
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} className="page-dots">...</span>;
                            }
                            return null;
                        })}

                        <button
                            className={`btn-page nav ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
