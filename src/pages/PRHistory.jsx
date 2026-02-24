import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '../context/ProcurementContext';
import './PRHistory.css';

export default function PRHistory() {
    const navigate = useNavigate();
    const { purchaseRequests, products, deletePurchaseRequest, updatePurchaseRequest } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPRs = purchaseRequests.filter(pr =>
        pr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = React.useMemo(() => {
        const allItems = purchaseRequests.flatMap(pr => pr.items);
        const uniqueProducts = new Set(allItems.map(i => i.name.toLowerCase().trim()));
        const inventoryNames = new Set(products.map(p => p.name.toLowerCase().trim()));

        const newItems = [...uniqueProducts].filter(name => !inventoryNames.has(name));

        return {
            totalPRs: purchaseRequests.length,
            totalValue: purchaseRequests
                .filter(pr => pr.status === 'Approved')
                .reduce((sum, pr) => sum + pr.total, 0),
            totalProducts: uniqueProducts.size,
            newItemsCount: newItems.length
        };
    }, [purchaseRequests, products]);

    const handleStatusChange = (id, newStatus) => {
        const pr = purchaseRequests.find(p => p.id === id);
        if (pr) {
            updatePurchaseRequest({ ...pr, status: newStatus });
        }
    };

    return (
        <div className="pr-history-container">
            <div className="prh-header">
                <div>
                    <h1 className="prh-title">PR History</h1>
                    <p className="prh-subtitle">Manage and track your purchase requisitions</p>
                </div>
                <button className="btn-prh-primary" onClick={() => navigate('/dashboard/create-pr')}>
                    + New PR
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="prh-stats-grid">
                <div className="prh-metric-card value">
                    <span className="pmc-label">Total Purchasing</span>
                    <div className="pmc-value">Rs. {stats.totalValue.toLocaleString()}</div>
                </div>
                <div className="prh-metric-card total">
                    <span className="pmc-label">Total Products</span>
                    <div className="pmc-value">{stats.totalProducts}</div>
                </div>
                <div className="prh-metric-card new-items">
                    <span className="pmc-label">New Inventory Products</span>
                    <div className="pmc-value">{stats.newItemsCount}</div>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Products not yet in inventory list</p>
                </div>
                <div className="prh-metric-card total">
                    <span className="pmc-label">Total PRs</span>
                    <div className="pmc-value">{stats.totalPRs}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="prh-controls">
                <div className="prh-search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                        type="text"
                        placeholder="Search by ID or Supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="prh-table-wrapper">
                <table className="prh-table">
                    <thead>
                        <tr>
                            <th>PR ID</th>
                            <th>Supplier</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPRs.map(pr => (
                            <tr key={pr.id}>
                                <td><span className="prh-id-pill">{pr.id}</span></td>
                                <td>
                                    <div className="prh-supplier-info">
                                        <div className="prh-supplier-avatar">{pr.supplier.charAt(0)}</div>
                                        <strong>{pr.supplier}</strong>
                                    </div>
                                </td>
                                <td>{pr.date}</td>
                                <td><strong>{pr.items.length}</strong> Items</td>
                                <td style={{ fontWeight: 800, color: '#0f172a' }}>Rs. {pr.total.toLocaleString()}</td>
                                <td>
                                    <select
                                        className={`prh-status-select ${pr.status === 'Approved' ? 'approved' : pr.status === 'Rejected' ? 'rejected' : 'pending'}`}
                                        value={pr.status}
                                        onChange={(e) => handleStatusChange(pr.id, e.target.value)}
                                    >
                                        <option value="Pending Approval">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="prh-actions">
                                        <button className="prh-btn-icon view" onClick={() => navigate(`/dashboard/pr-invoice/${pr.id}`)} title="View Requisition">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </button>
                                        <button className="prh-btn-icon delete" onClick={() => deletePurchaseRequest(pr.id)} title="Delete PR">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredPRs.length === 0 && (
                    <div className="prh-empty-state">
                        <p>No purchase requests found.</p>
                        <button className="btn-save-inline" onClick={() => navigate('/dashboard/create-pr')}>Create First PR</button>
                    </div>
                )}
            </div>
        </div>
    );
}
