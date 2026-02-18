import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import html2pdf from 'html2pdf.js'
import './QuotationEditor.css'

export default function QuotationEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getQuotationById, updateQuotation, addQuotation, traderProfile, companyLogo, setCompanyLogo } = useProcurement()

    const [quotation, setQuotation] = useState(null)
    const [activeTab, setActiveTab] = useState('items') // 'details', 'items'
    const previewRef = useRef(null)

    useEffect(() => {
        // If id is 'new', we initialize from local storage draft if available or session state
        if (id === 'new') {
            const draft = JSON.parse(localStorage.getItem('procure_quotation_transfer_data'))
            if (draft) {
                setQuotation({
                    id: `QT-${Date.now().toString().slice(-6)}`,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
                    clientName: 'Michael Jhonson',
                    clientRole: 'Director',
                    clientAddress: '5674 West Street, Address, Al 5684',
                    clientEmail: 'info@yourmail.com',
                    clientWeb: 'www.yourwebsite.com',
                    clientPhone: '+123 1234 3456',
                    status: 'Pending',
                    stockDeducted: false,
                    items: draft.items.map(p => ({
                        id: p.id || Math.random(),
                        name: p.name,
                        description: p.category || 'Product Description',
                        quantity: p.requestedQty || p.quantity || 1,
                        time: '30 DAYS',
                        rate: p.price || 0
                    })),
                    taxRate: 15,
                    paymentMethod: 'Paypal : paypalprojectyourdesign.com\nCard Payment We Accept : Visa, Mastercard, Payoner',
                    footerPhone: '+12 1234 1234\n+12 1234 1234',
                    footerFax: '+12 1234 1234\n+12 1234 1234',
                    footerWeb: 'www.designer.com\nwww.designer.com'
                })
            }
        } else {
            const data = getQuotationById(id)
            if (data) setQuotation(data)
        }
    }, [id, getQuotationById])

    if (!quotation) return <div className="p-10">Loading quotation data...</div>

    const subtotal = quotation.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0)
    const taxAmount = (subtotal * quotation.taxRate) / 100
    const total = subtotal + taxAmount

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCompanyLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const updateItem = (itemId, field, value) => {
        setQuotation(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        }))
    }

    const addItem = () => {
        const newId = Math.random()
        setQuotation(prev => ({
            ...prev,
            items: [...prev.items, { id: newId, name: 'New Item', description: 'Description', quantity: 1, time: '30 DAYS', rate: 0 }]
        }))
    }

    const removeItem = (itemId) => {
        setQuotation(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }))
    }

    const handleSave = () => {
        if (id === 'new') {
            addQuotation({ ...quotation, total })
            localStorage.removeItem('procure_quotation_transfer_data')
        } else {
            updateQuotation({ ...quotation, total })
        }
        navigate('/dashboard/quotation-history')
    }

    const handleDownload = () => {
        const element = previewRef.current;
        if (!element) return;
        const opt = {
            margin: 0,
            filename: `Quotation_${quotation.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }

    return (
        <div className="quotation-editor-root">
            <div className="editor-sidebar-controls">
                <div className="sidebar-header">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                    <h2>Quotation Editor</h2>
                    <p>Document ID: {quotation.id}</p>
                </div>

                <div className="sidebar-tabs">
                    <button className={`tab-link ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Recipient Info</button>
                    <button className={`tab-link ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Items & Pricing</button>
                </div>

                <div className="tab-pane">
                    {activeTab === 'details' && (
                        <div className="pane-content">
                            <div className="form-group">
                                <label>Quotation Status</label>
                                <select
                                    value={quotation.status || 'Pending'}
                                    onChange={e => setQuotation({ ...quotation, status: e.target.value })}
                                    className="status-select"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                {quotation.status === 'Approved' && quotation.stockDeducted && (
                                    <p className="status-note success">✓ Inventory stock already deducted</p>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Client Name</label>
                                <input type="text" value={quotation.clientName} onChange={e => setQuotation({ ...quotation, clientName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Role/Title</label>
                                <input type="text" value={quotation.clientRole} onChange={e => setQuotation({ ...quotation, clientRole: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Client Address</label>
                                <textarea value={quotation.clientAddress} onChange={e => setQuotation({ ...quotation, clientAddress: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="text" value={quotation.clientEmail} onChange={e => setQuotation({ ...quotation, clientEmail: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="pane-content">
                            <div className="items-edit-list">
                                {quotation.items.map(item => (
                                    <div key={item.id} className="item-edit-box">
                                        <input className="edit-name" type="text" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} placeholder="Item name" />
                                        <div className="edit-row-qty">
                                            <div className="field-half">
                                                <label>Qty</label>
                                                <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div className="field-half">
                                                <label>Price</label>
                                                <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                        <div className="edit-row-time">
                                            <label>Time/Lead</label>
                                            <input type="text" value={item.time} onChange={e => updateItem(item.id, 'time', e.target.value)} />
                                        </div>
                                        <button className="btn-remove-line" onClick={() => removeItem(item.id)}>Remove</button>
                                    </div>
                                ))}
                                <button className="btn-add-line" onClick={addItem}>+ Add Item</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="editor-actions-fixed">
                    <button className="btn-action-save" onClick={handleSave}>Save Quotation</button>
                    <button className="btn-action-download" onClick={handleDownload}>Download PDF</button>
                </div>
            </div>

            <div className="editor-preview-container">
                <div className="preview-sheet" ref={previewRef}>
                    <div className="sheet-header-dark">
                        <div className="header-left">
                            <h1>INVOICE</h1>
                            <span className="doc-num"># {quotation.id.replace('QT-', '')}</span>

                            <div className="recipient-info">
                                <p className="to-label">To</p>
                                <h3 className="recip-name">{quotation.clientName}</h3>
                                <p className="recip-role">{quotation.clientRole}</p>
                                <div className="recip-details">
                                    <p>A  {quotation.clientAddress}</p>
                                    <p>W  {quotation.clientEmail} | {quotation.clientWeb}</p>
                                    <p>P  {quotation.clientPhone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="header-right">
                            <div className="date-box">
                                <p>DATE - {quotation.date.toUpperCase()}</p>
                                <p>ACC MD - 023-456789</p>
                            </div>

                            <div className="total-due-box">
                                <span className="total-val">Rs. {total.toLocaleString()}</span>
                                <span className="total-label">TOTAL DUE</span>
                            </div>

                            <div className="logo-symbol">
                                {companyLogo ? (
                                    <img src={companyLogo} alt="Logo" />
                                ) : (
                                    <svg viewBox="0 0 100 100" width="60" height="60">
                                        <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" fill="white" />
                                        <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" fill="#2d3436" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sheet-body">
                        <table className="quot-table">
                            <thead>
                                <tr>
                                    <th>QTY</th>
                                    <th>DESCRIPTIONS</th>
                                    <th>TIME</th>
                                    <th className="text-right">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="col-qty">{item.quantity.toString().padStart(2, '0')}</td>
                                        <td className="col-desc">
                                            <div className="item-name-bold">{item.name.toUpperCase()}</div>
                                            <div className="item-desc-text">{item.description}</div>
                                        </td>
                                        <td className="col-time">{item.time.toUpperCase()}</td>
                                        <td className="col-amount text-right">Rs. {(item.quantity * item.rate).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="sheet-summary-line">
                            <div className="summary-left">
                                <p className="total-incl-tax">TOTAL - INCL TAX {quotation.taxRate}%</p>
                            </div>
                            <div className="summary-right">
                                <p className="summary-total-val">Rs. {total.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="sheet-extra">
                            <p className="extra-label">Payment Method :</p>
                            <pre className="extra-content">{quotation.paymentMethod}</pre>
                        </div>
                    </div>

                    <div className="sheet-footer">
                        <div className="footer-col">
                            <label>PHONE</label>
                            <pre>{quotation.footerPhone}</pre>
                        </div>
                        <div className="footer-col">
                            <label>FAX</label>
                            <pre>{quotation.footerFax}</pre>
                        </div>
                        <div className="footer-col">
                            <label>WEB</label>
                            <pre>{quotation.footerWeb}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
