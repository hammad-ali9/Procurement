import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProcurement } from '../context/ProcurementContext';
import html2pdf from 'html2pdf.js';
import InvoiceModern from '../components/InvoiceModern';
import './PRInvoiceViewer.css';

export default function PRInvoiceViewer() {
    const { prId } = useParams();
    const navigate = useNavigate();
    const { purchaseRequests, traderProfile, bankDetails, companyLogo, preferences } = useProcurement();

    const pr = useMemo(() => purchaseRequests.find(p => p.id === prId), [purchaseRequests, prId]);

    const handleGoBack = () => {
        navigate('/dashboard/pr-history');
    };

    const handleDownload = () => {
        const element = document.querySelector('.modern-invoice');
        if (!element) return;
        const opt = {
            margin: 0,
            filename: `Purchase Requisition - ${pr.supplier}.pdf`,
            image: { type: 'png' },
            html2canvas: { scale: 3, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (!pr) {
        return (
            <div className="pr-viewer-container">
                <div className="pr-doc-card" style={{ textAlign: 'center' }}>
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                        <h2 style={{ marginTop: '1.5rem', color: '#1e293b' }}>Requisition Not Found</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>The PR "{prId}" could not be located in our records.</p>
                        <button className="btn-prh-primary" onClick={handleGoBack}>
                            Return to History
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pr-viewer-container">
            <div className="extract-header" style={{ maxWidth: '850px', margin: '0 auto 2rem', padding: '0 1rem' }}>
                <div className="extract-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn-back-upload-pill" onClick={handleGoBack}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        <span>Back to history</span>
                    </button>
                    <button className="btn-hero-action" onClick={handleDownload} style={{ background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download PR
                    </button>
                </div>
            </div>

            <div id="pr-download-content" className="pr-doc-card animate-fadeIn" style={{ padding: 0 }}>
                <InvoiceModern
                    invoice={{
                        ...pr,
                        customer: pr.supplier,
                        billingAddress: `${pr.supplierDetails?.email || ''}\n${pr.supplierDetails?.phone || ''}\nCategory: ${pr.supplierDetails?.category || ''}`,
                        type: 'Purchase Requisition',
                        notes: 'This is a computer-generated requisition. No signature is required for digital verification.'
                    }}
                    traderProfile={traderProfile}
                    bankDetails={bankDetails}
                    companyLogo={companyLogo}
                    preferences={preferences}
                />
            </div>
        </div>
    );
}
