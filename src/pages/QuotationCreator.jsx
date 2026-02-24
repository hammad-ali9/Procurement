import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '../context/ProcurementContext';
import './QuotationCreator.css';

export default function QuotationCreator() {
    const navigate = useNavigate();
    const { products, quotationDraft, setQuotationDraft, addProduct, getProductStatus } = useProcurement();
    const query = quotationDraft.query;
    const results = quotationDraft.results;

    const handleProceed = () => {
        if (!results || results.available.length === 0) return;

        // Stock Validation Logic
        const insufficientItems = results.available.filter(item => {
            const currentProduct = products.find(p => p.id === item.id);
            return currentProduct && (currentProduct.stock < item.requestedQty);
        });

        if (insufficientItems.length > 0) {
            const itemDetails = insufficientItems.map(item => {
                const currentProduct = products.find(p => p.id === item.id);
                return `${item.name} (Requested: ${item.requestedQty}, In Stock: ${currentProduct.stock})`;
            }).join('\n- ');

            alert(
                `🛑 INSUFFICIENT STOCK ERROR\n\n` +
                `You cannot proceed with this quotation because the following items are out of stock or have less quantity than needed:\n\n` +
                `- ${itemDetails}\n\n` +
                `PROMPT: Please purchase inventory for these products or update the stock levels before proceeding.`
            );
            return;
        }

        // Save to temporary storage for the editor
        localStorage.setItem('procure_quotation_transfer_data', JSON.stringify({
            items: results.available
        }));

        navigate('/dashboard/edit-quotation/new');
    };

    const setQuery = (newQuery) => {
        setQuotationDraft(prev => ({ ...prev, query: newQuery }));
    };

    const setResults = (newResults) => {
        setQuotationDraft(prev => ({ ...prev, results: newResults }));
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!query.trim()) return;
        setIsAnalyzing(true);

        try {
            // Simplify inventory for the AI context
            const inventoryContext = products.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                category: p.category
            }));

            const response = await fetch('/api/parse-quotation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    inventory: inventoryContext
                })
            });

            if (!response.ok) throw new Error("AI Parsing Failed");

            const data = await response.json();

            // Hydrate the 'available' items with full product details
            // STRICT MATCHING: Only allow exact name matches (case-insensitive)
            const hydratedAvailable = data.available.map(item => {
                const product = products.find(p => p.id === item.id);
                // Check if name effectively matches to prevent category-only matching
                if (product && product.name.toLowerCase() === (item.name || '').toLowerCase()) {
                    return { ...product, requestedQty: item.quantity };
                }
                return null;
            }).filter(Boolean);

            // Move items that were filtered out of 'available' back into 'missing'
            const recoveredMissing = data.available.filter(item => {
                const isHydrated = hydratedAvailable.some(h => h.id === item.id);
                return !isHydrated;
            });

            setResults({
                available: hydratedAvailable,
                missing: [...(data.missing || []), ...recoveredMissing]
            });

        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Failed to analyze request. Is the backend running?");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddToInventory = (item) => {
        const newProduct = {
            name: item.name,
            category: 'Electronics', // Default category
            category: 'Electronics', // Default category
            price: 0,
            stock: item.quantity, // Sync requested quantity to initial stock
            incoming: 0,
            status: 'In stock',
            image: '📦',
            isNew: true // Mark for the "New" badge
        };

        // Add to global inventory with the isNew option
        addProduct(newProduct, { isNew: true });

        // Move from Missing to Available in the local UI results
        setResults({
            available: [
                ...results.available,
                { ...newProduct, id: Date.now(), requestedQty: item.quantity }
            ],
            missing: results.missing.filter(m => m.name !== item.name)
        });
    };

    const handleRemoveAvailable = (id) => {
        setResults({
            ...results,
            available: results.available.filter(p => (p.id !== id))
        });
    };

    const renderProductTable = (items, isAvailable = true) => (
        <div className="qc-table-wrapper">
            <table className="qc-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={isAvailable ? item.id : idx}>
                            <td>
                                <div className="qc-product-info">
                                    <div className="qc-product-img-mini">{isAvailable ? item.image : '📦'}</div>
                                    <span className="qc-product-name">{isAvailable ? item.name : item.name}</span>
                                </div>
                            </td>
                            <td>{isAvailable ? item.category : 'New Item'}</td>
                            <td>
                                <span className="req-qty-cell">{isAvailable ? item.requestedQty : item.quantity}</span>
                            </td>
                            <td>
                                <span className={`qc-status-badge ${isAvailable ? getProductStatus(item.stock).toLowerCase().replace(/\s+/g, '-') : 'incoming'}`}>
                                    {isAvailable ? getProductStatus(item.stock) : 'Missing'}
                                </span>
                            </td>
                            <td><strong>{isAvailable ? `Rs. ${item.price.toLocaleString()}` : '-'}</strong></td>
                            <td>
                                {isAvailable ? (
                                    <button
                                        className="btn-table-action remove"
                                        onClick={() => handleRemoveAvailable(item.id)}
                                        title="Remove from Quotation"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                ) : (
                                    <button
                                        className="btn-table-action add"
                                        onClick={() => handleAddToInventory(item)}
                                        title="Add to Inventory"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                        <span>Add</span>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="quotation-creator-container">
            <div className="hero-section">
                <h1 className="hero-title">What's on the agenda today?</h1>
                <p className="hero-subtitle">Describe your requirements and we'll check the inventory.</p>

                <div className="input-group-lg">
                    <input
                        type="text"
                        className="hero-input"
                        placeholder="e.g. I need 5 laptops and 10 office chairs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
                        disabled={isAnalyzing}
                    />
                    {query && (
                        <button
                            className="btn-clear-search"
                            onClick={() => { setQuery(''); setResults(null); }}
                            title="Clear Search"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    )}
                    <button className="btn-hero-action" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : 'Check Availability'}
                    </button>
                </div>
            </div>

            {results && (
                <div className="results-section animate-fadeIn">
                    <div className="results-grid">
                        <div className="qc-result-card available">
                            <div className="qc-card-header">
                                <h2>Available Products</h2>
                                <span className="badge-count">{results.available.length}</span>
                            </div>
                            <div className="qc-card-body">
                                {results.available.length > 0 ? (
                                    renderProductTable(results.available, true)
                                ) : (
                                    <div className="empty-state">No matching products found in inventory.</div>
                                )}
                            </div>
                        </div>

                        <div className="qc-result-card missing">
                            <div className="qc-card-header">
                                <h2>Missing / Unidentified</h2>
                                <span className={`badge-count ${results.missing.length > 0 ? 'warning' : ''}`}>
                                    {results.missing.length}
                                </span>
                            </div>
                            <div className="qc-card-body">
                                {results.missing.length > 0 ? (
                                    renderProductTable(results.missing, false)
                                ) : (
                                    <div className="empty-state">
                                        <p>All items identified in inventory.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="action-bar">
                        <button
                            className="btn-proceed"
                            disabled={!results || results.available.length === 0}
                            onClick={handleProceed}
                        >
                            Proceed to Quotation
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
