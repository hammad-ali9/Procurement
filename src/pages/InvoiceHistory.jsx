import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import './InvoiceHistory.css'

export default function InvoiceHistory() {
    const { invoices, deleteGroup } = useProcurement();
    const [searchTerm, setSearchTerm] = useState('')

    // Group invoices by Purchase Order (groupId)
    const groupedPOs = invoices.reduce((acc, inv) => {
        if (!acc[inv.groupId]) {
            acc[inv.groupId] = {
                groupId: inv.groupId,
                customer: inv.customer, // Primary organization/Origin
                date: inv.processedAt || inv.date, // Use AI processing time
                status: inv.status,
                docCount: 0,
                totalValue: 0
            }
        }
        acc[inv.groupId].docCount += 1
        acc[inv.groupId].totalValue += inv.total
        // If any invoice is "In Review", the whole PO is considered "In Review"
        if (inv.status === 'In Review') acc[inv.groupId].status = 'In Review'
        return acc
    }, {})

    const poList = Object.values(groupedPOs)

    const filtered = poList.filter(po =>
        po.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.groupId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="history-page-modern">
            <div className="history-header-area">
                <div className="h-header-left">
                    <h1>Document History</h1>
                    <p>Access and manage your Purchase Order bundles and extractions.</p>
                </div>
                <div className="h-header-right">
                    <div className="search-box-h">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="Find by PO ID or Customer..."
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
                            <th>PO Group ID</th>
                            <th>Partner / Customer</th>
                            <th>Total Documents</th>
                            <th>Date Processed</th>
                            <th>Aggregate Value</th>
                            <th>Batch Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(po => (
                            <tr key={po.groupId}>
                                <td className="font-bold">{po.groupId}</td>
                                <td>{po.customer}</td>
                                <td>
                                    <span className="type-badge">{po.docCount} Documents</span>
                                </td>
                                <td>{po.date}</td>
                                <td className="font-bold">Rs. {po.totalValue.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${po.status.toLowerCase().replace(' ', '-')}`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="action-cell">
                                    <Link
                                        to={`/dashboard/extract/${po.groupId}`}
                                        state={{ fromHistory: true }}
                                        className="btn-edit-action"
                                        title="View extraction bundle"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="btn-delete-action"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this entire PO bundle? This will remove all associated invoices.')) {
                                                deleteGroup(po.groupId)
                                            }
                                        }}
                                        title="Delete PO Group"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="no-results">No PO bundles match your search criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
