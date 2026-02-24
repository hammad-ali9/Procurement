import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import './InvoiceUpload.css'
import './QuotationInvoiceViewer.css'

export default function QuotationInvoiceViewer() {
    const { quotId } = useParams()
    const navigate = useNavigate()
    const { quotations, invoices, deleteInvoice } = useProcurement()

    const quotation = useMemo(() => quotations.find(q => q.id === quotId), [quotations, quotId])
    const groupId = `QGR-${quotId}`
    const generatedInvoices = useMemo(() => invoices.filter(inv => inv.groupId === groupId), [invoices, groupId])

    const getTypeIcon = (type) => {
        const t = (type || '').toLowerCase()
        if (t.includes('purchase')) return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
        )
        if (t.includes('tax')) return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        )
        if (t.includes('delivery')) return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
        )
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
        )
    }

    const handleEditDoc = (docId) => {
        navigate(`/dashboard/edit/${docId}`)
    }

    const handleDeleteDoc = (docId) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            if (deleteInvoice) deleteInvoice(docId);
        }
    }

    const handleShare = (doc) => {
        alert(`Sharing document ${doc.id} via secure link...`)
    }

    const handleGoBack = () => {
        navigate('/dashboard/quotation-history')
    }

    if (!quotation) {
        return (
            <div className="upload-page-modern scroll-refined">
                <div className="upload-content">
                    <div className="qiv-not-found">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        <h2>Quotation Not Found</h2>
                        <p>The quotation "{quotId}" could not be found.</p>
                        <button className="btn-back-upload-pill" onClick={handleGoBack}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            Back to Quotation History
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const items = quotation.items || []
    const total = quotation.total || 0

    return (
        <div className="upload-page-modern scroll-refined">
            <div className="upload-content">
                <div className="extraction-dashboard-modern stacked">
                    {/* Header */}
                    <div className="extract-header">
                        <div className="extract-header-top">
                            <button className="btn-back-upload-pill" onClick={handleGoBack}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                <span>Back to Quotation History</span>
                            </button>
                        </div>
                        <div className="extract-title-group">
                            <h1>Quotation Invoices</h1>
                            <p>Viewing {generatedInvoices.length} generated invoice{generatedInvoices.length !== 1 ? 's' : ''} for quotation <strong>{quotation.id}</strong> — {quotation.clientName}</p>
                        </div>
                    </div>

                    {/* Split View */}
                    <div className="extract-split-view">
                        {/* Left: Quotation Preview */}
                        <div className="po-preview-side">
                            <div className="po-preview-header">Original Quotation</div>
                            <div className="qiv-quotation-preview">
                                {/* Quotation Document Preview */}
                                <div className="qiv-doc-card">
                                    <div className="qiv-doc-badge">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        QUOTATION
                                    </div>
                                    <div className="qiv-doc-id">{quotation.id}</div>

                                    <div className="qiv-doc-meta">
                                        <div className="qiv-meta-row">
                                            <span className="qiv-meta-label">Client</span>
                                            <span className="qiv-meta-value">{quotation.clientName || 'N/A'}</span>
                                        </div>
                                        <div className="qiv-meta-row">
                                            <span className="qiv-meta-label">Contact</span>
                                            <span className="qiv-meta-value">{quotation.clientRole || 'N/A'}</span>
                                        </div>
                                        <div className="qiv-meta-row">
                                            <span className="qiv-meta-label">Date</span>
                                            <span className="qiv-meta-value">{quotation.date || 'N/A'}</span>
                                        </div>
                                        <div className="qiv-meta-row">
                                            <span className="qiv-meta-label">Tax Rate</span>
                                            <span className="qiv-meta-value">{quotation.taxRate || 0}%</span>
                                        </div>
                                        <div className="qiv-meta-row">
                                            <span className="qiv-meta-label">Status</span>
                                            <span className="qiv-meta-value">
                                                <span className={`qiv-status-pill ${(quotation.status || 'pending').toLowerCase()}`}>{quotation.status || 'Pending'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="qiv-doc-divider"></div>

                                    {/* Items Table */}
                                    <div className="qiv-items-header">Items ({items.length})</div>
                                    <div className="qiv-items-table-wrap">
                                        <table className="qiv-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Qty</th>
                                                    <th>Rate</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, i) => {
                                                    const qty = item.quantity || item.qty || 1
                                                    const rate = item.rate || item.price || 0
                                                    return (
                                                        <tr key={i}>
                                                            <td className="qiv-item-name">{item.name || item.desc || 'Item'}</td>
                                                            <td>{qty}</td>
                                                            <td>Rs. {rate.toLocaleString()}</td>
                                                            <td className="qiv-item-amount">Rs. {(qty * rate).toLocaleString()}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="qiv-doc-divider"></div>

                                    <div className="qiv-total-row">
                                        <span>Total</span>
                                        <span className="qiv-total-value">Rs. {total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Generated Invoice Cards */}
                        <div className="invoice-cards-side">
                            <div className="cards-header">Generated Documents</div>
                            <div className="generated-docs-list">
                                {generatedInvoices.map(doc => {
                                    const docTotal = doc.total || 0
                                    const docType = doc.type || 'Invoice'
                                    return (
                                        <div key={doc.id} className="extract-card">
                                            <div className="card-top">
                                                <div className={`card-type-icon ${docType.toLowerCase().split(' ')[0]}`}>
                                                    {getTypeIcon(docType)}
                                                </div>
                                                <div className="card-meta">
                                                    <span className="card-type">{docType}</span>
                                                    <span className="card-id">{doc.id}</span>
                                                </div>
                                                <button className="btn-card-share" title="Delete Invoice" onClick={() => handleDeleteDoc(doc.id)} style={{ color: '#ef4444' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                                <button className="btn-card-share" title="Share Invoice" onClick={() => handleShare(doc)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                                </button>
                                            </div>
                                            <div className="card-body">
                                                <div className="card-stat">
                                                    <label>Total Value</label>
                                                    <div className="card-amount">Rs. {docTotal.toLocaleString()}</div>
                                                </div>
                                                <div className="card-stat">
                                                    <label>Status</label>
                                                    <div className="card-status">{doc.status || 'In Review'}</div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-card-edit"
                                                onClick={() => handleEditDoc(doc.id)}
                                            >
                                                Review & Complete Details
                                            </button>
                                        </div>
                                    )
                                })}

                                {generatedInvoices.length === 0 && (
                                    <div className="qiv-empty-state">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        <p>No invoices have been generated for this quotation yet.</p>
                                        <button className="btn-back-upload-pill" onClick={handleGoBack}>Back to Quotation History</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
