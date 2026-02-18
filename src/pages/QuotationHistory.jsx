import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import './InvoiceHistory.css' // Reuse the same premium layout

export default function QuotationHistory() {
    const { quotations, deleteQuotation, updateQuotation } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('')

    const filtered = quotations.filter(q =>
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleStatusChange = (quot, newStatus) => {
        if (quot.status === newStatus) return;
        if (window.confirm(`Change status of ${quot.id} to ${newStatus}?`)) {
            updateQuotation({ ...quot, status: newStatus });
        }
    };

    return (
        <div className="history-page-modern">
            <div className="history-header-area">
                <div className="h-header-left">
                    <h1>Quotation History</h1>
                    <p>Access and manage your generated quotations and lead times.</p>
                </div>
                <div className="h-header-right">
                    <div className="search-box-h">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="Find by Quotation ID or Client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Quotation ID</th>
                            <th>Client / Recipient</th>
                            <th>Items</th>
                            <th>Date Created</th>
                            <th>Total Value</th>
                            <th>Tax (%)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(quot => (
                            <tr key={quot.id}>
                                <td className="font-bold">{quot.id}</td>
                                <td>
                                    <div className="client-cell">
                                        <span className="client-name">{quot.clientName}</span>
                                        <span className="client-role">{quot.clientRole}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="type-badge">{quot.items.length} Items</span>
                                </td>
                                <td>{quot.date}</td>
                                <td className="font-bold">${quot.total.toLocaleString()}</td>
                                <td>{quot.taxRate}%</td>
                                <td>
                                    <select
                                        className={`status-select ${quot.status?.toLowerCase() || 'pending'}`}
                                        value={quot.status || 'Pending'}
                                        onChange={(e) => handleStatusChange(quot, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>
                                <td className="action-cell">
                                    <Link
                                        to={`/dashboard/edit-quotation/${quot.id}`}
                                        className="btn-edit-action"
                                        title="View/Edit Quotation"
                                    >
                                        View
                                    </Link>
                                    <button
                                        className="btn-delete-action"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
                                                deleteQuotation(quot.id)
                                            }
                                        }}
                                        title="Delete Quotation"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="no-results">No quotations found matching your search.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
