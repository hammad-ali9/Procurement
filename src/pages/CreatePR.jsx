import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '../context/ProcurementContext';
import './CreatePR.css';

export default function CreatePR() {
    const navigate = useNavigate();
    const { products, suppliers, addPurchaseRequest, addSupplier, getProductStatus } = useProcurement();

    // Requisition items
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');

    // Modals
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    // Inventory Selector Filters
    const [invSearch, setInvSearch] = useState('');
    const [invCategory, setInvCategory] = useState('All');
    const [invStockFilter, setInvStockFilter] = useState('All'); // All, Low, Out

    // New Supplier State
    const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', phone: '', category: 'Raw Materials' });

    const handleAnalyze = async () => {
        if (!query.trim()) return;
        setIsAnalyzing(true);

        try {
            const inventoryContext = products.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                category: p.category
            }));

            const response = await fetch('/api/parse-quotation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, inventory: inventoryContext })
            });

            if (!response.ok) throw new Error("AI Parsing Failed");
            const data = await response.json();

            const newItems = [];

            // Add identified items
            data.available.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product && product.name.toLowerCase() === (item.name || '').toLowerCase()) {
                    newItems.push({
                        id: product.id,
                        name: product.name,
                        name: product.name,
                        quantity: item.quantity,
                        price: product.price || 0,
                        amount: item.quantity * (product.price || 0),
                        stock: product.stock,
                        type: 'inventory'
                    });
                } else {
                    // Ambiguous match -> manual
                    newItems.push({
                        id: `manual-${Date.now()}-${Math.random()}`,
                        name: item.name || 'Unknown Item',
                        name: item.name || 'Unknown Item',
                        quantity: item.quantity,
                        price: 0,
                        amount: 0,
                        stock: 0,
                        type: 'manual'
                    });
                }
            });

            // Add missing items
            (data.missing || []).forEach(item => {
                newItems.push({
                    id: `manual-${Date.now()}-${Math.random()}`,
                    name: item.name,
                    name: item.name,
                    quantity: item.quantity,
                    price: 0,
                    amount: 0,
                    stock: 0,
                    type: 'manual'
                });
            });

            setItems(prev => [...prev, ...newItems]);
            setQuery(''); // Clear input after successful analysis

        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Failed to analyze request. Is the backend running?");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddFromInventory = (product) => {
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            setItems(items.map(i =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1, amount: (i.quantity + 1) * i.price } : i
            ));
        } else {
            setItems([...items, {
                id: product.id,
                name: product.name,
                name: product.name,
                quantity: 1,
                price: product.price || 0,
                amount: product.price || 0,
                stock: product.stock,
                type: 'inventory'
            }]);
        }
    };

    const handleUpdateItem = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    updated.amount = updated.quantity * updated.price;
                }
                return updated;
            }
            return item;
        }));
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    // Calculate stock counts for filter labels
    const stockStats = useMemo(() => ({
        low: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        out: products.filter(p => p.stock <= 0).length
    }), [products]);

    const handleAddSupplier = () => {
        if (!newSupplier.name || !newSupplier.email) return;
        const s = addSupplier(newSupplier);
        setSelectedSupplierId(s.id);
        setShowSupplierModal(false);
        setNewSupplier({ name: '', contact: '', email: '', phone: '', category: 'Raw Materials' });
    };

    const handleCreatePR = () => {
        if (!selectedSupplierId) return alert('Please select a supplier');
        if (items.length === 0) return alert('Requisition list is empty');

        const supplier = suppliers.find(s => s.id === parseInt(selectedSupplierId));
        const newPR = {
            id: `PR-${Date.now().toString().slice(-6)}`,
            supplier: supplier.name,
            supplierDetails: supplier,
            date: new Date().toISOString().split('T')[0],
            items: items,
            total: items.reduce((sum, i) => sum + i.amount, 0),
            status: 'Pending Approval'
        };

        addPurchaseRequest(newPR);
        navigate(`/dashboard/pr-invoice/${newPR.id}`);
    };

    // Filtered Inventory for Modal
    const filteredInventory = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(invSearch.toLowerCase());
            const matchesCategory = invCategory === 'All' || p.category === invCategory;
            let matchesStock = true;
            if (invStockFilter === 'Low') matchesStock = p.stock > 0 && p.stock <= 10;
            else if (invStockFilter === 'Out') matchesStock = p.stock <= 0;
            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [products, invSearch, invCategory, invStockFilter]);

    const categories = ['All', ...new Set(products.map(p => p.category))];

    return (
        <div className="quotation-creator-container">
            <div className="hero-section">
                <h1 className="hero-title">Create Purchase Request</h1>
                <p className="hero-subtitle">Identify items via AI or browse your inventory to build a requisition.</p>

                <div className="input-group-lg">
                    <input
                        type="text"
                        className="hero-input"
                        placeholder="Describe your needs (e.g. 10 Laptops, 5 Mice)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
                        disabled={isAnalyzing}
                    />
                    <button className="btn-hero-action" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : 'Identify Items'}
                    </button>
                    <button className="btn-hero-action secondary" onClick={() => setShowInventoryModal(true)} style={{ background: '#f8f9fa', color: '#000', border: '1px solid #ddd' }}>
                        Browse Inventory
                    </button>
                    <button className="btn-hero-action secondary" onClick={() => navigate('/dashboard/pr-history')} style={{ background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0' }}>
                        PR History
                    </button>
                </div>
            </div>

            <div className="results-section animate-fadeIn">
                <div className="qc-result-card requisition-main">
                    <div className="qc-card-header">
                        <h2>Requisition Items</h2>
                        <span className="badge-count">{items.length}</span>
                    </div>
                    <div className="qc-card-body">
                        {items.length > 0 ? (
                            <div className="qc-table-wrapper">
                                <table className="qc-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>#</th>
                                            <th>Description</th>
                                            <th style={{ width: '100px' }}>Qty</th>
                                            <th style={{ width: '120px' }}>Rate (Rs.)</th>
                                            <th>Amount</th>
                                            <th>Stock Status</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td style={{ color: '#94a3b8', fontWeight: 600 }}>{index + 1}</td>
                                                <td>
                                                    <div className="qc-product-info">
                                                        <div className="qc-product-img-mini">📦</div>
                                                        <span className="qc-product-name">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="inline-edit-input"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="inline-edit-input"
                                                        value={item.price}
                                                        onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                    />
                                                </td>
                                                <td className="qc-total-cell">Rs. {item.amount.toLocaleString()}</td>
                                                <td>
                                                    {item.type === 'inventory' ? (
                                                        <span className={`qc-status-badge ${getProductStatus(item.stock).toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {getProductStatus(item.stock)} ({item.stock})
                                                        </span>
                                                    ) : (
                                                        <span className="qc-status-badge manual">Manual Entry</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn-table-action remove" onClick={() => handleRemoveItem(item.id)}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '3rem' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                                <p>Your requisition is empty. Use AI or browse inventory to add items.</p>
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="requisition-footer" style={{ marginTop: '1.5rem', padding: '1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', fontSize: '1.2rem', fontWeight: 700 }}>
                                <span>Total Estimated Amount: Rs. {items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vendor & Proceed Section - Beautiful Integrated Section */}
                <div className="qc-vendor-section animate-fadeIn" style={{ marginTop: '3rem' }}>
                    <div className="section-header">
                        <div className="header-content">
                            <div className="header-icon">🏢</div>
                            <div>
                                <h3>Select Preferred Vendor</h3>
                                <p>Choose a supplier to fulfill this purchase requisition or add a new one.</p>
                            </div>
                        </div>
                    </div>

                    <div className="vendor-selection-grid">
                        <div className="vendor-dropdown-wrapper">
                            <label>Registered Supplier</label>
                            <div className="select-container">
                                <select
                                    className="premium-select"
                                    value={selectedSupplierId}
                                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                                >
                                    <option value="">Choose a vendor from your dashboard...</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} — {s.category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="vendor-divider">
                            <span>OR</span>
                        </div>

                        <div className="vendor-action-wrapper">
                            <label>Not in List?</label>
                            <button className={`btn-add-vendor-lg ${showSupplierModal ? 'active' : ''}`} onClick={() => setShowSupplierModal(!showSupplierModal)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    {showSupplierModal ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
                                </svg>
                                <span>{showSupplierModal ? 'Cancel Registration' : 'Register New Supplier'}</span>
                            </button>
                        </div>
                    </div>

                    {showSupplierModal && (
                        <div className="inline-registration-form animate-slideDown">
                            <div className="form-inner">
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Company Name</label>
                                        <input type="text" placeholder="e.g. Acme Corp" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Contact Person</label>
                                        <input type="text" placeholder="Full Name" value={newSupplier.contact} onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="input-field">
                                        <label>Email Address</label>
                                        <input type="email" placeholder="vendor@example.com" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Phone Number</label>
                                        <input type="tel" placeholder="+91 ..." value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
                                    </div>
                                    <div className="input-field">
                                        <label>Category</label>
                                        <select value={newSupplier.category} onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })}>
                                            <option>Raw Materials</option>
                                            <option>Packaging</option>
                                            <option>Equipment</option>
                                            <option>Services</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save-inline" onClick={handleAddSupplier}>
                                        Save & Select Vendor
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="qc-final-action">
                    <button
                        className="btn-proceed-lg"
                        disabled={items.length === 0 || !selectedSupplierId}
                        onClick={handleCreatePR}
                    >
                        <span>Submit Purchase Requisition</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                    <p className="action-hint">This will create an official PR and notify the procurement department.</p>
                </div>
            </div>

            {/* Inventory Browser Modal */}
            {showInventoryModal && (
                <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
                    <div className="modal-content inventory-modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Browse Inventory</h2>
                                <p style={{ fontSize: '0.9rem', color: '#717171' }}>Select products to add to your purchase requisition.</p>
                            </div>
                            <button className="btn-close" onClick={() => setShowInventoryModal(false)}>×</button>
                        </div>

                        <div className="modal-filters" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="modal-search-input"
                                value={invSearch}
                                onChange={e => setInvSearch(e.target.value)}
                            />
                            <select value={invCategory} onChange={e => setInvCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={invStockFilter} onChange={e => setInvStockFilter(e.target.value)}>
                                <option value="All">All Stock</option>
                                <option value="Low">Low Stock ({stockStats.low})</option>
                                <option value="Out">Out of Stock ({stockStats.out})</option>
                            </select>
                        </div>

                        <div className="modal-table-wrapper">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="product-info">
                                                    <span className="product-img-mini">{p.image}</span>
                                                    <strong>{p.name}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getProductStatus(p.stock).toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td>Rs. {p.price.toLocaleString()}</td>
                                            <td>
                                                {items.some(item => item.id === p.id) ? (
                                                    <button
                                                        className="btn-table-action remove"
                                                        onClick={() => handleRemoveItem(p.id)}
                                                        title="Remove from Requisition"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                    </button>
                                                ) : (
                                                    <button className="btn-table-action add" onClick={() => handleAddFromInventory(p)}>
                                                        Add
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInventory.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No matching products found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-footer" style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'right' }}>
                            <button className="btn-primary" onClick={() => setShowInventoryModal(false)}>Done Browsing</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
