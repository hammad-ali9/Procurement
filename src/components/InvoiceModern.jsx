import React from 'react';
import './InvoiceModern.css';
import { toWords } from '../utils/formatUtils';

export default function InvoiceModern({
    invoice,
    traderProfile = {},
    bankDetails = {},
    companyLogo,
    preferences = {}
}) {
    if (!invoice) return null;

    // Support both old and new schema fields
    const items = invoice.items?.map(item => ({
        name: item.name || item.itemName || 'Nill',
        spec: item.itemSpecification || '',
        desc: item.itemDescription || item.desc || '',
        qty: parseFloat(item.itemQuantity || item.quantity || item.qty || 0),
        rate: parseFloat(item.itemRate || item.rate || 0),
        uom: item.unitOfMeasure || item.uom || 'Unit',
        pkg: item.packageSize || 'N/A'
    })) || [];

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;

    const isTax = invoice.type?.toLowerCase().includes('tax');
    const isDelivery = invoice.type?.toLowerCase().includes('delivery');
    const isPurchase = !isDelivery && !isTax;

    let total = 0;
    if (isTax) {
        total = taxAmount;
    } else if (isPurchase) {
        total = subtotal + (invoice.delivery || 0);
    } else {
        total = subtotal + taxAmount + (invoice.delivery || 0);
    }

    const totalQty = items.reduce((acc, item) => acc + item.qty, 0);

    const getDocLabel = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('delivery')) return 'Delivery';
        if (t.includes('tax')) return 'Invoice';
        if (t.includes('purchase')) return 'Purchase';
        return type || 'Document';
    };

    return (
        <div className="modern-invoice animate-fadeIn">
            <div className="invoice-preview-card">

                {/* --- Header --- */}
                <header className="mi-header-new">
                    <div className="mi-header-left">
                        <div className="mi-logo-wrapper">
                            {companyLogo ? (
                                <img src={companyLogo} alt="Logo" className="mi-logo-new" />
                            ) : (
                                <div className="mi-logo-placeholder-new">
                                    {traderProfile.businessName?.charAt(0) || 'B'}
                                </div>
                            )}
                        </div>
                        <div className="mi-company-text">
                            <h1 className="mi-biz-name">{traderProfile.businessName || 'Nill'}</h1>
                        </div>
                    </div>
                    <div className="mi-header-right">
                        <div className="mi-doc-type-bg">INVOICE</div>
                        <div className="mi-doc-id-text">#{invoice.id || 'Nill'}</div>
                    </div>
                </header>

                <div className="mi-body">

                    {/* --- Metadata --- */}
                    <div className="mi-section-2">
                        <div className="mi-billing-info">
                            <label>Billed To</label>
                            <h2 className="name">{invoice.customer || 'Nill'}</h2>
                        </div>
                        <div className="mi-doc-meta">
                            <div className="mi-meta-item">
                                <label>Date</label>
                                <span>{invoice.date || 'Nill'}</span>
                            </div>
                            <div className="mi-meta-item">
                                <label>PO Ref</label>
                                <span>{invoice.poNumber || 'Nill'}</span>
                            </div>
                            <div className="mi-meta-item">
                                <label>Vendor No.</label>
                                <span>{traderProfile.vendorNumber || 'Nill'}</span>
                            </div>
                            <div className="mi-meta-item">
                                <label>NTN No.</label>
                                <span>{traderProfile.ntnNumber || 'Nill'}</span>
                            </div>
                            <div className="mi-meta-item">
                                <label>GST No.</label>
                                <span>{traderProfile.gstNumber || 'Nill'}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- Table --- */}
                    <div className="mi-section-3">
                        <div className="mi-flex-table">
                            <div className="mi-flex-header">
                                <div className="mi-flex-col" style={{ flex: '1.2' }}>Product</div>
                                <div className="mi-flex-col" style={{ flex: '1.5' }}>Description</div>
                                <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px' }}>UoM</div>
                                <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px' }}>Pkg</div>

                                {isPurchase && <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px' }}>Qty</div>}
                                {isPurchase && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 90px' }}>Rate</div>}
                                {isPurchase && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 110px' }}>Amount</div>}

                                {isDelivery && <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 90px' }}>Quantity</div>}
                                {isDelivery && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 120px' }}>Status</div>}

                                {isTax && <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px' }}>Qty</div>}
                                {isTax && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 90px' }}>Tax %</div>}
                                {isTax && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 110px' }}>Tax Amount</div>}
                            </div>
                            <div className="mi-flex-body">
                                {items.map((item, idx) => {
                                    const itemTax = (item.qty * item.rate * (invoice.taxRate || 0)) / 100;
                                    return (
                                        <div className="mi-flex-row" key={idx}>
                                            <div className="mi-flex-col" style={{ flex: '1.2' }}>
                                                <strong className="mi-item-name">{item.name}</strong>
                                                {item.spec && <span className="mi-item-spec">{item.spec}</span>}
                                            </div>

                                            <div className="mi-flex-col" style={{ flex: '1.5', fontSize: '0.75rem', color: '#475569' }}>
                                                {item.desc || 'Nill'}
                                            </div>

                                            <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px', fontSize: '0.75rem' }}>
                                                {item.uom || 'Nill'}
                                            </div>

                                            <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px', fontSize: '0.75rem' }}>
                                                {item.pkg || 'Nill'}
                                            </div>

                                            {isPurchase && <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px', fontWeight: 600 }}>{item.qty}</div>}
                                            {isPurchase && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 90px' }}>{preferences.currency || 'Rs.'} {item.rate.toLocaleString()}</div>}
                                            {isPurchase && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 110px', fontWeight: 700 }}>{preferences.currency || 'Rs.'} {(item.qty * item.rate).toLocaleString()}</div>}

                                            {isDelivery && <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 90px', fontWeight: 600 }}>{item.qty}</div>}
                                            {isDelivery && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 120px', fontSize: '0.7rem', color: '#64748b' }}>Pending</div>}

                                            {isTax && <div className="mi-flex-col mi-text-center" style={{ flex: '0 0 60px', fontWeight: 600 }}>{item.qty}</div>}
                                            {isTax && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 90px' }}>{invoice.taxRate}%</div>}
                                            {isTax && <div className="mi-flex-col mi-text-right" style={{ flex: '0 0 110px', fontWeight: 700 }}>{preferences.currency || 'Rs.'} {itemTax.toLocaleString()}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* --- Totals & Notes --- */}
                    <div className="mi-section-4">
                        <div className="mi-notes-box">
                            <label>Notes & Observations</label>
                            <p className="mi-notes-p">{invoice.notes || 'No additional notes listed for this document.'}</p>

                            {!isDelivery && total > 0 && (
                                <div className="mi-amount-words">
                                    <label>Amount in Words</label>
                                    <p className="words-text">{toWords(total)} Only</p>
                                </div>
                            )}

                            {isDelivery && (
                                <div className="mi-delivery-receipt" style={{ marginTop: '20px', border: '1px dashed #e2e8f0', padding: '15px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Consignee Signature</span>
                                        <div style={{ width: '180px', borderBottom: '1px solid #e2e8f0', height: '20px' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mi-totals-box">
                            {!isDelivery && (
                                <>
                                    <div className="mi-total-row">
                                        <span>Subtotal</span>
                                        <span>{preferences.currency || 'Rs.'} {subtotal.toLocaleString()}</span>
                                    </div>
                                    {!isPurchase && (
                                        <div className="mi-total-row">
                                            <span>Tax Group ({invoice.taxRate || 0}%)</span>
                                            <span>{preferences.currency || 'Rs.'} {taxAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {invoice.delivery > 0 && (
                                        <div className="mi-total-row">
                                            <span>Shipping & Handling</span>
                                            <span>{preferences.currency || 'Rs.'} {invoice.delivery.toLocaleString()}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="mi-total-row grand">
                                <span>{isDelivery ? 'Total Quantity' : 'Total Amount'}</span>
                                <span>{isDelivery ? totalQty : `${preferences.currency || 'Rs.'} ${total.toLocaleString()}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* --- Trust Elements --- */}
                    <div className="mi-section-5">
                        <div className="mi-bank-details">
                            <label>Payment Information</label>
                            <div className="mi-bank-info">
                                <div className="mi-bank-row"><span>Bank:</span> <strong>{bankDetails.bankName || 'Nill'}</strong></div>
                                <div className="mi-bank-row"><span>Account:</span> <strong>{bankDetails.accountTitle || 'Nill'}</strong></div>
                                <div className="mi-bank-row"><span>A/C No:</span> <strong>{bankDetails.accountNumber || 'Nill'}</strong></div>
                                <div className="mi-bank-row"><span>IBAN:</span> <strong>{bankDetails.iban || 'Nill'}</strong></div>
                            </div>
                        </div>
                        <div className="mi-stamp-box">
                            <label>Authorized Stamp</label>
                            {traderProfile.stampSignature ? (
                                <img src={traderProfile.stampSignature} alt="Stamp" className="mi-stamp-img" />
                            ) : (
                                <div style={{ height: '80px', width: '80px', border: '2px dashed #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.65rem', padding: '10px' }}>
                                    Stamp
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="mi-footer">
                    <div className="mi-footer-left">{traderProfile.phone || 'Nill'}</div>
                    <div className="mi-footer-mid">{traderProfile.officeAddress || 'Nill'}</div>
                    <div className="mi-footer-right">Page 1 of 1</div>
                </footer>
            </div>

            {invoice.status === 'Paid' && <div className="paid-stamp">PAID</div>}
        </div>
    );
}

