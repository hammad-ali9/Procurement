import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import html2pdf from 'html2pdf.js'
import InvoiceModern from '../components/InvoiceModern'
import './InvoiceEditor.css'

export default function InvoiceEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getInvoiceById, updateInvoice, companyLogo, setCompanyLogo, traderProfile, preferences, bankDetails } = useProcurement()

    const [invoice, setInvoice] = useState(null)
    const [activeTab, setActiveTab] = useState('items') // 'details', 'items', 'payment'
    const previewRef = useRef(null)

    const scrollToPreview = () => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        const data = getInvoiceById(id)
        if (data) {
            // Add defaults for new fields if they don't exist
            setInvoice({
                ...data,
                taxRate: data.taxRate || 0,
                delivery: data.delivery || 0,
                dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                billingAddress: data.billingAddress || data.customerAddress || '',
                customerEmail: data.customerEmail || '',
                customerPhone: data.customerPhone || '',
                poNumber: data.poNumber || '',
                paymentTerms: data.paymentTerms || 'Net 15',
                notes: data.notes || 'Please include the invoice number on your payment reference. Thank you!',
                items: (data.items || []).map(it => ({
                    ...it,
                    name: it.name || it.itemName || '',
                    itemDescription: it.itemDescription || it.desc || '',
                    itemSpecification: it.itemSpecification || '',
                    itemQuantity: parseFloat(it.itemQuantity || it.quantity || it.qty || 0),
                    unitOfMeasure: it.unitOfMeasure || it.uom || 'Unit',
                    packageSize: it.packageSize || 'N/A',
                    itemRate: parseFloat(it.itemRate || it.rate || 0)
                }))
            })
        }
    }, [id, getInvoiceById])

    if (!invoice) return <div className="p-10">Loading invoice data...</div>

    const subtotal = (invoice.items || []).reduce((acc, item) => acc + ((item.itemQuantity || 0) * (item.itemRate || 0)), 0)
    const taxAmount = (subtotal * invoice.taxRate) / 100

    // Total calculation logic:
    const isTaxInvoice = (invoice.type || '').toLowerCase().includes('tax');
    const isDelivery = (invoice.type || '').toLowerCase().includes('delivery');
    const isPurchase = !isTaxInvoice && !isDelivery;

    let total = 0;
    if (isTaxInvoice) {
        total = taxAmount;
    } else if (isPurchase) {
        total = subtotal + (invoice.delivery || 0);
    } else {
        total = subtotal + taxAmount + (invoice.delivery || 0);
    }

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
            items: [...prev.items, { id: newId, name: 'New Item', itemDescription: '', itemSpecification: '', itemQuantity: 1, unitOfMeasure: 'Unit', packageSize: 'N/A', itemRate: 0 }]
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
        // Return to the previous page (Extraction Results or History)
        navigate(-1)
    }

    const handleDownload = () => {
        const element = document.querySelector('.modern-invoice');
        if (!element) return;

        const opt = {
            margin: 0,
            filename: `${invoice.type} - ${invoice.customer}.pdf`,
            image: { type: 'png' }, // Switched to PNG for crisp backgrounds
            html2canvas: { scale: 3, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
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

                            <h3 className="section-subtitle" style={{ marginTop: '1rem' }}>Organization Details (PO Source)</h3>
                            <div className="input-group-row">
                                <div className="input-field">
                                    <label>Organization Name</label>
                                    <input
                                        type="text"
                                        value={invoice.customer || ''}
                                        onChange={(e) => setInvoice({ ...invoice, customer: e.target.value })}
                                        placeholder="Company Name"
                                    />
                                </div>
                                <div className="input-field">
                                    <label>PO Number</label>
                                    <input
                                        type="text"
                                        value={invoice.poNumber || ''}
                                        onChange={(e) => setInvoice({ ...invoice, poNumber: e.target.value })}
                                        placeholder="Ref No."
                                    />
                                </div>
                            </div>

                            <div className="input-group-row">
                                <div className="input-field">
                                    <label>Organization Email</label>
                                    <input
                                        type="email"
                                        value={invoice.customerEmail || ''}
                                        onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Organization Phone</label>
                                    <input
                                        type="text"
                                        value={invoice.customerPhone || ''}
                                        onChange={(e) => setInvoice({ ...invoice, customerPhone: e.target.value })}
                                        placeholder="+92..."
                                    />
                                </div>
                            </div>
                            {(invoice.type || '').toLowerCase().includes('delivery') && (
                                <div className="input-field animate-slide-up">
                                    <label>Delivered To (Name/Organization)</label>
                                    <input
                                        type="text"
                                        placeholder="Name of receiver..."
                                        value={invoice.deliveredTo || ''}
                                        onChange={(e) => setInvoice({ ...invoice, deliveredTo: e.target.value })}
                                    />
                                </div>
                            )}
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
                                <label>Organization Address (Billed To)</label>
                                <textarea
                                    rows="3"
                                    value={invoice.billingAddress || ''}
                                    onChange={(e) => setInvoice({ ...invoice, billingAddress: e.target.value })}
                                    placeholder="Enter full address of the sender..."
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
                            <div className="input-field" style={{ marginTop: '1rem' }}>
                                <label>Invoice Type</label>
                                <select
                                    value={invoice.type || 'Purchase Invoice'}
                                    onChange={(e) => setInvoice({ ...invoice, type: e.target.value })}
                                    className="status-select"
                                >
                                    <option value="Purchase Invoice">Purchase Invoice</option>
                                    <option value="Delivery Invoice">Delivery Invoice</option>
                                    <option value="Tax Invoice">Tax Invoice</option>
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
                                {invoice.items.map((item, index) => (
                                    <div key={`item-${item.id}-${index}`} className="item-edit-card animate-slide-up">
                                        {/* Card Header: Primary Info */}
                                        <div className="item-card-main">
                                            <input
                                                className="i-name-large"
                                                placeholder="Product Name / Item Title..."
                                                type="text"
                                                value={item.name || ""}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            />

                                            <div className="card-inputs-group">
                                                <div className="card-input-set">
                                                    <label>Qty</label>
                                                    <input
                                                        className="i-qty"
                                                        type="number"
                                                        placeholder="0"
                                                        value={item.itemQuantity || 0}
                                                        onChange={(e) => updateItem(item.id, 'itemQuantity', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="card-input-set">
                                                    <label>Rate (Rs)</label>
                                                    <input
                                                        className="i-rate"
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={item.itemRate || 0}
                                                        onChange={(e) => updateItem(item.id, 'itemRate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <button className="btn-remove-card" title="Remove Item" onClick={() => removeItem(item.id)}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card Body: Secondary Details */}
                                        <div className="item-card-details">
                                            <div className="detail-field">
                                                <label>Unit of Measure</label>
                                                <input
                                                    placeholder="e.g. Kg, Pcs, Unit"
                                                    type="text"
                                                    value={item.unitOfMeasure || ""}
                                                    onChange={(e) => updateItem(item.id, 'unitOfMeasure', e.target.value)}
                                                />
                                            </div>
                                            <div className="detail-field">
                                                <label>Package Size</label>
                                                <input
                                                    placeholder="e.g. 50kg bag, Box of 10"
                                                    type="text"
                                                    value={item.packageSize || ""}
                                                    onChange={(e) => updateItem(item.id, 'packageSize', e.target.value)}
                                                />
                                            </div>
                                            <div className="detail-field">
                                                <label>Product Specification</label>
                                                <input
                                                    placeholder="Model, Brand, Color..."
                                                    type="text"
                                                    value={item.itemSpecification || ""}
                                                    onChange={(e) => updateItem(item.id, 'itemSpecification', e.target.value)}
                                                />
                                            </div>
                                            <div className="detail-field">
                                                <label>Additional Description</label>
                                                <input
                                                    placeholder="Verbatim description from PO..."
                                                    type="text"
                                                    value={item.itemDescription || ""}
                                                    onChange={(e) => updateItem(item.id, 'itemDescription', e.target.value)}
                                                />
                                            </div>
                                        </div>
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
                </div>

                {/* View Live Invoice indicator - Now outside constrained container if needed, but works here due to fixed pos */}
                <div className="view-live-indicator" onClick={scrollToPreview}>
                    <div className="live-status-badge">
                        <span className="live-dot"></span>
                        <span>Live Preview</span>
                    </div>
                    <div className="indicator-arrow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Panel - Premium Document Preview */}
            <div className="editor-preview-panel">
                <div className="invoice-container-sheet" ref={previewRef} style={{ padding: 0, width: 'fit-content' }}>
                    <InvoiceModern
                        invoice={invoice}
                        traderProfile={traderProfile}
                        bankDetails={bankDetails}
                        companyLogo={companyLogo}
                        preferences={preferences}
                    />
                </div>
            </div>
        </div>
    )
}
