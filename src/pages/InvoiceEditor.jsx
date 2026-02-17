import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import './InvoiceEditor.css'

export default function InvoiceEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getInvoiceById, updateInvoice, companyLogo, setCompanyLogo, traderProfile, preferences } = useProcurement()

    const [invoice, setInvoice] = useState(null)
    const [activeTab, setActiveTab] = useState('items') // 'details', 'items', 'payment'

    useEffect(() => {
        const data = getInvoiceById(id)
        if (data) {
            // Add defaults for new fields if they don't exist
            setInvoice({
                ...data,
                dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                billingAddress: data.billingAddress || traderProfile?.officeAddress || '123 Business Way, Suite 100\nTech City, TC 54321',
                paymentTerms: data.paymentTerms || 'Net 15',
                notes: data.notes || 'Please include the invoice number on your payment reference. Thank you!'
            })
        }
    }, [id, getInvoiceById])

    if (!invoice) return <div className="p-10">Loading invoice data...</div>

    const subtotal = invoice.items.reduce((acc, item) => acc + (item.qty * item.rate), 0)
    const taxAmount = (subtotal * invoice.taxRate) / 100
    const total = subtotal + taxAmount + invoice.delivery

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateItem = (itemId, field, value) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        }))
    }

    const addItem = () => {
        const newId = invoice.items.length > 0 ? Math.max(...invoice.items.map(i => i.id)) + 1 : 1
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { id: newId, desc: 'New Item', qty: 1, rate: 0 }]
        }))
    }

    const removeItem = (itemId) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }))
    }

    const handleFinalize = () => {
        updateInvoice({ ...invoice, total })
        navigate('/dashboard/history')
    }

    const handleDownload = () => {
        alert('Standard PDF generation initiated. Your document will be ready in a few moments.')
    }

    return (
        <div className="editor-page-modern">
            {/* Left Panel - Professional Controls */}
            <div className="editor-controls-panel">
                <div className="editor-top-nav">
                    <button className="btn-go-back-pill" onClick={() => navigate(-1)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        <span>Go Back</span>
                    </button>
                </div>

                <div className="panel-header">
                    <div className="header-badge">Document ID: {invoice.id}</div>
                    <h2>Invoice Designer</h2>
                    <p>Customize extraction results and payment terms.</p>
                </div>

                {/* Tabbed Navigation */}
                <div className="editor-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        General Info
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        Line Items
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        Terms & Notes
                    </button>
                </div>

                <div className="tab-content-area">
                    {activeTab === 'details' && (
                        <div className="editor-section animate-slide-up">
                            <h3 className="section-subtitle">Branding & Identity</h3>
                            <div className="input-field">
                                <label>Company Logo</label>
                                <div className="logo-upload-container">
                                    <div className="logo-preview-box">
                                        {companyLogo ? (
                                            <img src={companyLogo} alt="Company Logo" className="logo-img-small" />
                                        ) : (
                                            <div className="logo-placeholder">?</div>
                                        )}
                                    </div>
                                    <div className="logo-upload-actions">
                                        <input type="file" id="logo-upload" hidden accept="image/*" onChange={handleLogoChange} />
                                        <label htmlFor="logo-upload" className="btn-upload-logo">Choose Image</label>
                                        <button className="btn-remove-logo" onClick={() => setCompanyLogo(null)}>Remove</button>
                                    </div>
                                </div>
                            </div>

                            <h3 className="section-subtitle" style={{ marginTop: '1rem' }}>Basic Details</h3>
                            <div className="input-field">
                                <label>Customer / Business Name</label>
                                <input
                                    type="text"
                                    value={invoice.customer}
                                    onChange={(e) => setInvoice({ ...invoice, customer: e.target.value })}
                                />
                            </div>
                            <div className="input-group-row">
                                <div className="input-field">
                                    <label>Issue Date</label>
                                    <input type="text" value={invoice.date} readOnly />
                                </div>
                                <div className="input-field">
                                    <label>Due Date</label>
                                    <input
                                        type="text"
                                        value={invoice.dueDate}
                                        onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="input-field">
                                <label>Billing Address</label>
                                <textarea
                                    rows="3"
                                    value={invoice.billingAddress}
                                    onChange={(e) => setInvoice({ ...invoice, billingAddress: e.target.value })}
                                />
                            </div>
                            <div className="input-field">
                                <label>Processing Status</label>
                                <select
                                    value={invoice.status}
                                    onChange={(e) => setInvoice({ ...invoice, status: e.target.value })}
                                    className="status-select"
                                >
                                    <option value="In Review">In Review</option>
                                    <option value="Processed">Processed</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="editor-section animate-slide-up">
                            <h3 className="section-subtitle">Itemized Breakdown</h3>
                            <div className="items-table-header">
                                <span className="h-desc">Description</span>
                                <span className="h-qty">Qty</span>
                                <span className="h-rate">Rate</span>
                                <span className="h-action"></span>
                            </div>
                            <div className="items-editor-list">
                                {invoice.items.map(item => (
                                    <div key={item.id} className="item-edit-row">
                                        <input
                                            className="i-desc"
                                            placeholder="Item description..."
                                            type="text"
                                            value={item.desc}
                                            onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                                        />
                                        <input
                                            className="i-qty"
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                        />
                                        <input
                                            className="i-rate"
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => updateItem(item.id, 'rate', parseInt(e.target.value) || 0)}
                                        />
                                        <button className="btn-remove-item" onClick={() => removeItem(item.id)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-add-item" onClick={addItem}>
                                <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </span>
                                Add New Line Item
                            </button>

                            <div className="financials-compact">
                                <div className="input-group-row">
                                    <div className="input-field">
                                        <label>Tax (%)</label>
                                        <input
                                            type="number"
                                            value={invoice.taxRate}
                                            onChange={(e) => setInvoice({ ...invoice, taxRate: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Delivery</label>
                                        <input
                                            type="number"
                                            value={invoice.delivery}
                                            onChange={(e) => setInvoice({ ...invoice, delivery: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="editor-section animate-slide-up">
                            <h3 className="section-subtitle">Payment Terms & Notes</h3>
                            <div className="input-field">
                                <label>Payment Terms (e.g. Net 30)</label>
                                <input
                                    type="text"
                                    value={invoice.paymentTerms}
                                    onChange={(e) => setInvoice({ ...invoice, paymentTerms: e.target.value })}
                                />
                            </div>
                            <div className="input-field">
                                <label>Merchant Notes</label>
                                <textarea
                                    rows="5"
                                    placeholder="Thank you for your business..."
                                    value={invoice.notes}
                                    onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                                />
                            </div>
                            <div className="tips-box">
                                <p>
                                    <span style={{ marginRight: '8px', opacity: 0.8 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                    </span>
                                    <strong>Tip:</strong> Clear payment terms reduce late collections by up to 15%.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="editor-footer-actions">
                    <button className="btn-save" onClick={handleFinalize}>Finalize & Save</button>
                    <button className="btn-download" onClick={handleDownload}>
                        Download PDF
                    </button>
                    <button className="btn-cancel" onClick={() => navigate(-1)}>Discard Changes</button>
                </div>
            </div>

            {/* Right Panel - Premium Document Preview */}
            <div className="editor-preview-panel">
                <div className="invoice-container-sheet">
                    {/* Invoice Header */}
                    <div className="inv-header">
                        <div className="inv-brand">
                            <div className="inv-logo">
                                {companyLogo ? (
                                    <img src={companyLogo} alt="Logo" className="logo-preview-img" />
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h2>{traderProfile.businessName || 'Procurement Pro'}</h2>
                                <p>Financial Operations</p>
                            </div>
                        </div>
                        <div className="inv-title-box">
                            <h1>{invoice.type?.toUpperCase() || 'INVOICE'}</h1>
                            <div className="inv-id-tag">#{invoice.id}</div>
                        </div>
                    </div>

                    <div className="inv-meta-grid">
                        <div className="inv-meta-col">
                            <label>Billed To</label>
                            <h3>{invoice.customer}</h3>
                            <p className="address-text">{invoice.billingAddress}</p>
                        </div>
                        <div className="inv-meta-col text-right">
                            <div className="meta-item">
                                <label>Date Issued</label>
                                <p>{invoice.date}</p>
                            </div>
                            <div className="meta-item">
                                <label>Due Date</label>
                                <p className="text-bold">{invoice.dueDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th className="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.length > 0 ? invoice.items.map(item => (
                                <tr key={item.id}>
                                    <td className="w-50">{item.desc}</td>
                                    <td>{item.qty}</td>
                                    <td>{preferences?.currency || 'Rs.'} {item.rate.toLocaleString()}</td>
                                    <td className="text-right text-bold">
                                        {preferences?.currency || 'Rs.'} {(item.qty * item.rate).toLocaleString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="empty-row">No items added yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Financial Summary */}
                    <div className="inv-summary-area">
                        <div className="notes-block">
                            <label>Terms & Notes</label>
                            <p>{invoice.notes}</p>
                            <p className="payment-method">Payment Terms: <strong>{invoice.paymentTerms}</strong></p>
                        </div>
                        <div className="calc-block">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{preferences?.currency || 'Rs.'} {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax ({invoice.taxRate}%)</span>
                                <span>{preferences?.currency || 'Rs.'} {taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery</span>
                                <span>{preferences?.currency || 'Rs.'} {invoice.delivery.toLocaleString()}</span>
                            </div>
                            <div className="summary-row grand-total">
                                <span>Total Amount Due</span>
                                <span>{preferences?.currency || 'Rs.'} {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="inv-footer-bottom">
                        <p>This is a computer generated document. Registration #29384-PN</p>
                        <p>© 2024 Procurement Pro Systems. All rights reserved.</p>
                    </div>

                    {invoice.status === 'Paid' && (
                        <div className="paid-stamp">PAID</div>
                    )}
                </div>
            </div>
        </div>
    )
}
