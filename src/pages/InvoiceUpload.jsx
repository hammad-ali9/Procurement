import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import { getPKTFullTimestamp } from '../components/Topbar'
import './InvoiceUpload.css'

export default function InvoiceUpload() {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState(null)
    const [fileUrl, setFileUrl] = useState(null)
    const [showingResults, setShowingResults] = useState(false)
    const [extractedDocs, setExtractedDocs] = useState([])
    const [stagedDocs, setStagedDocs] = useState([])
    const [rawExtractionData, setRawExtractionData] = useState(null)
    const [selectedTypes, setSelectedTypes] = useState(['Purchase Invoice', 'Tax Invoice', 'Delivery Challan'])
    const [selectionPhase, setSelectionPhase] = useState(false)

    const navigate = useNavigate()
    const { groupId } = useParams()
    const location = useLocation()
    const {
        addMultipleInvoices,
        createCustomInvoice,
        invoices,
        setOriginalFile,
        getOriginalFile,
        products,
        deleteInvoice
    } = useProcurement()

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Purchase Invoice':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                );
            case 'Tax Invoice':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        <path d="M10 21h4"></path>
                    </svg>
                );
            case 'Delivery Challan':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                );
            default:
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                );
        }
    }

    // ── Inventory Reconciliation Logic ──
    const reconciliation = useMemo(() => {
        const displayDocs = groupId ? extractedDocs : stagedDocs;

        // If we are in selection phase OR we have no generated docs yet, reconcile against the raw data from server
        let itemsToReconcile = [];
        if ((selectionPhase || stagedDocs.length === 0) && rawExtractionData) {
            itemsToReconcile = rawExtractionData[0]?.items || []; // Assume first doc has all items
        } else if (displayDocs.length > 0) {
            // Flatten all items from all generated documents
            itemsToReconcile = displayDocs.reduce((acc, doc) => {
                if (doc.items) {
                    doc.items.forEach(item => {
                        const existing = acc.find(i => {
                            const iName = (i.name || i.desc || "").toLowerCase();
                            const itemName = (item.name || item.desc || "").toLowerCase();
                            return (iName === itemName && iName !== "") || (item.sku && i.sku === item.sku);
                        });
                        if (existing) {
                            existing.qty += (item.quantity || item.qty || 0);
                        } else {
                            acc.push({ ...item, name: item.name || item.desc || "N/A", qty: item.quantity || item.qty || 0, sku: item.sku || 'N/A' });
                        }
                    });
                }
                return acc;
            }, []);
        }

        if (itemsToReconcile.length === 0) return null;

        const allItemsFlat = selectionPhase ? itemsToReconcile.map(i => ({
            name: i.name || i.desc || 'N/A',
            qty: i.quantity || i.qty || 0,
            sku: i.sku || 'N/A',
            rate: i.rate || 0,
            originalItem: i
        })) : itemsToReconcile;

        const available = [];
        const required = [];

        allItemsFlat.forEach(poItem => {
            if (!poItem) return;
            const match = products.find(p => {
                const pName = p.name?.toLowerCase() || '';
                const poName = poItem.name?.toLowerCase() || '';
                return (pName && poName && pName.includes(poName)) ||
                    (poItem.sku !== 'N/A' && p.sku === poItem.sku);
            });

            if (match) {
                available.push({
                    ...poItem,
                    inventoryItem: match,
                    isShortage: match.stock < (poItem.qty || 0)
                });
            } else {
                required.push(poItem);
            }
        });

        return { available, required };
    }, [stagedDocs, extractedDocs, groupId, products, selectionPhase, rawExtractionData]);

    // Detect if we came from history
    const isFromHistory = location.state?.fromHistory

    // Reset states when navigating back to the base upload route
    useEffect(() => {
        if (!groupId) {
            setIsUploading(false)
            setProgress(0)
            setShowingResults(false)
            setFile(null)
            setStagedDocs([])
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl)
                setFileUrl(null)
            }
        }
    }, [groupId]);

    // Handle deep-linking to a specific group result
    useEffect(() => {
        if (groupId) {
            const groupDocs = invoices.filter(inv => inv.groupId === groupId);
            if (groupDocs.length > 0) {
                setExtractedDocs(groupDocs);
                setShowingResults(true);
            }
            // Restore original file preview from context
            const savedFile = getOriginalFile(groupId);
            if (savedFile) {
                if (!fileUrl) setFileUrl(savedFile.dataUrl);
                // RE-INSTATE FILE OBJECT for name display logic
                // We create a mock File object so the UI can read 'file.name' and 'file.type'
                if (!file) {
                    setFile({
                        name: savedFile.fileName || "Recovered Document",
                        type: savedFile.fileType || "application/pdf" // default fallback
                    });
                }
            }
        }
    }, [groupId, invoices, getOriginalFile]); // Added getOriginalFile dependency

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setFileUrl(URL.createObjectURL(selectedFile))
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setIsUploading(true)
        setProgress(10) // Initial progress

        const formData = new FormData()
        formData.append('document', file)

        // Progress simulation interval (to show activity while waiting for AI)
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 90))
        }, 500)

        try {
            // Real API call to our local Node.js + Gemini service
            const response = await fetch('http://localhost:5000/api/extract', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Extraction failed')
            }

            const rawDocuments = await response.json()

            clearInterval(interval)
            setProgress(100)
            setRawExtractionData(rawDocuments)

            // Transition to Selection Phase
            setTimeout(() => {
                setIsUploading(false)
                setSelectionPhase(true)
            }, 500)

        } catch (error) {
            console.error("AI Extraction Error:", error)
            clearInterval(interval)
            setIsUploading(false)
            setProgress(0)
            alert("Failed to extract document. Is the backend server running?")
        }
    }

    const handleGetInvoices = () => {
        if (!rawExtractionData || selectedTypes.length === 0) return;

        const timestamp = Date.now()
        const newGroupId = `GRP-${timestamp}`

        const normalizedData = rawExtractionData.map(doc => {
            let normalizedType = doc.type;
            if (doc.type === 'Sales Invoice') normalizedType = 'Tax Invoice';
            if (doc.type === 'Delivery Invoice') normalizedType = 'Delivery Challan';
            return { ...doc, type: normalizedType };
        });

        const formattedDocs = normalizedData
            .filter(doc => selectedTypes.includes(doc.type))
            .map((doc, index) => ({
                ...doc,
                id: doc.id || `GEN-${timestamp}-${index}`,
                groupId: newGroupId,
                status: 'In Review',
                processedAt: getPKTFullTimestamp()
            }))

        // We don't set stagedDocs or navigate immediately here.
        // Instead, we commit to the global state and navigate to the persistent result page.
        addMultipleInvoices(formattedDocs)

        // Save original file now that we have groupId
        const reader = new FileReader()
        reader.onloadend = () => {
            setOriginalFile(newGroupId, reader.result, file.type, file.name)
        }
        reader.readAsDataURL(file)

        // Move to the persistent results page
        navigate(`/dashboard/extract/${newGroupId}`)
    }

    const toggleTypeSelection = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    const handleCustomCreate = () => {
        const id = createCustomInvoice()
        navigate(`/dashboard/edit/${id}`)
    }

    const handleSaveAndReview = () => {
        // Commit staged documents to global context only on Save
        if (stagedDocs && stagedDocs.length > 0) {
            addMultipleInvoices(stagedDocs)
        }
        navigate('/dashboard/history')
    }

    const handleBackToUpload = () => {
        setStagedDocs([])
        navigate('/dashboard/upload')
    }

    const handleReupload = () => {
        setStagedDocs([]);
    }

    const handleBackToSelection = () => {
        setShowingResults(false);
        setSelectionPhase(true);
    }

    const handleGoBackToHistory = () => {
        navigate('/dashboard/history')
    }

    const handleShare = (doc) => {
        alert(`Sharing document ${doc.id} via secure link...`)
    }

    const handleEditDoc = (docId) => {
        // Since we are now using persistent routing, documents are already in global state.
        // We just navigate to the editor.
        navigate(`/dashboard/edit/${docId}`)
    }

    const handleDeleteDoc = (docId) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            if (groupId) {
                // Saved mode: Delete from global state via context
                deleteInvoice(docId);
            } else {
                // Staged mode: Delete from local state
                setStagedDocs(prev => prev.filter(d => d.id !== docId));
            }
        }
    };

    return (
        <div className="upload-page-modern scroll-refined">
            <div className="upload-content">
                {/* 1. Upload Section (Always visible, but might be compact) */}
                <div className={`upload-section-wrapper ${showingResults || selectionPhase ? 'compact' : ''}`}>
                    <div className="upload-header">
                        <h1>{showingResults || selectionPhase ? "Processed Purchase Order" : "Process Purchase Order"}</h1>
                        <p>{showingResults || selectionPhase ? "Extracting insights and reconciling with your inventory." : "Upload your document to generate instant invoices and tax breakdowns."}</p>
                    </div>

                    {!isUploading && !selectionPhase && (
                        <div className="upload-box-main animate-fadeIn">
                            <div className="dropzone">
                                <div className="dz-icon">
                                    {(showingResults || selectionPhase) && fileUrl ? (
                                        file?.type?.includes('image') ? (
                                            <div className="dz-preview-thumb">
                                                <img src={fileUrl} alt="Thumbnail" />
                                            </div>
                                        ) : (
                                            <div className="dz-pdf-thumb">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15h3a2 2 0 0 1 0 4h-3V13h3a2 2 0 0 1 0 4"></path></svg>
                                                <span>PDF</span>
                                            </div>
                                        )
                                    ) : (
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                    )}
                                </div>
                                <div className="dz-text-group">
                                    <h3>{file ? file.name : 'Select or drop PO document'}</h3>
                                    {(showingResults || selectionPhase) && <p className="dz-status-small">Analysis active for this document</p>}
                                </div>
                                {!showingResults && !selectionPhase && (
                                    <>
                                        <p>PDF, PNG, JPG (Max 10MB)</p>
                                        <input
                                            type="file"
                                            id="po-file"
                                            hidden
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="po-file" className="btn-secondary">Browse Files</label>
                                    </>
                                )}
                            </div>
                            <div className="upload-actions-row">
                                {!showingResults && !selectionPhase ? (
                                    <button
                                        className={`btn-primary-upload ${!file ? 'disabled' : ''}`}
                                        onClick={handleUpload}
                                        disabled={!file}
                                    >
                                        Start Extraction
                                    </button>
                                ) : (
                                    <button className="btn-new-upload" onClick={() => {
                                        if (groupId) {
                                            // If we are deep-linked, navigating away is the cleanest reset
                                            navigate('/dashboard/upload');
                                        } else {
                                            // Local reset
                                            setFile(null);
                                            setFileUrl(null);
                                            setShowingResults(false);
                                            setSelectionPhase(false);
                                            setStagedDocs([]);
                                            setRawExtractionData(null);
                                            setIsUploading(false);
                                            setProgress(0);
                                            if (fileUrl && fileUrl.startsWith('blob:')) {
                                                URL.revokeObjectURL(fileUrl);
                                            }
                                        }
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        Clear Result
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {isUploading && !selectionPhase && (
                        <div className="processing-state animate-fadeIn">
                            <div className="loader-container">
                                <div className="loader-ring"></div>
                                <div className="loader-percentage">{progress}%</div>
                            </div>
                            <h3>{progress === 100 ? 'Analysis Complete' : 'Extracting document data...'}</h3>
                            <p>Our AI is identifying items, taxes, and delivery details.</p>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Selection Phase (Verification + Doc Type Chooser) */}
                {selectionPhase && (
                    <div className="selection-phase stacked animate-slideUp">
                        <div className="selection-header">
                            <div className="header-badge-modern">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                <span>Verification Phase</span>
                            </div>
                            <h1>Verify Products & Select Invoices</h1>
                            <p>Our AI extracted these items. Review them before finalizing your document generation.</p>
                        </div>

                        {reconciliation && (
                            <div className="selection-reco-container">
                                <div className="reco-grid-mini">
                                    <div className="reco-card available">
                                        <div className="reco-card-header">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                            <h3>Extracted Products</h3>
                                        </div>
                                        <div className="reco-table-wrapper">
                                            <table className="reco-table">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Qty</th>
                                                        <th>Stock</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reconciliation.available.concat(reconciliation.required).map((item, id) => (
                                                        <tr key={id}>
                                                            <td>
                                                                <div className="reco-text">
                                                                    <strong>{item.name}</strong>
                                                                    <span>{item.sku}</span>
                                                                </div>
                                                            </td>
                                                            <td>{item.qty}</td>
                                                            <td>{item.inventoryItem ? item.inventoryItem.stock : '-'}</td>
                                                            <td>
                                                                <span className={`status-badge-mini ${item.inventoryItem ? (item.isShortage ? 'warning' : 'success') : 'danger'}`}>
                                                                    {item.inventoryItem ? (item.isShortage ? 'Low Stock' : 'Ready') : 'New SKU'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="doc-selector-container">
                            <div className="selector-title">
                                <h3>Generate Documents</h3>
                                <p>Select which types of invoices you want to create from this PO.</p>
                            </div>
                            <div className="selector-grid-modern">
                                {['Purchase Invoice', 'Tax Invoice', 'Delivery Challan'].map(type => {
                                    return (
                                        <div
                                            key={type}
                                            className={`selector-card-modern ${selectedTypes.includes(type) ? 'active' : ''}`}
                                            onClick={() => toggleTypeSelection(type)}
                                        >
                                            <div className="card-selection-check">
                                                {selectedTypes.includes(type) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                            </div>
                                            <div className="card-icon-modern">
                                                {getTypeIcon(type)}
                                            </div>
                                            <div className="card-label-modern">
                                                <span>{type}</span>
                                                <p>{type === 'Tax Invoice' ? 'Official Bill' : type === 'Delivery Challan' ? 'Logistic Doc' : 'Internal Record'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="selection-actions-modern">
                            <button className="btn-secondary-modern" onClick={() => setSelectionPhase(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                Back to Upload
                            </button>
                            <button
                                className={`btn-primary-generate ${selectedTypes.length === 0 ? 'disabled' : ''}`}
                                onClick={handleGetInvoices}
                                disabled={selectedTypes.length === 0}
                            >
                                <span>Generate Documents</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. Results Section (Invoices + Preview) */}
                {showingResults && (
                    <div className="extraction-dashboard-modern stacked animate-slideUp">
                        <div className="extract-header">
                            <div className="extract-header-top">
                                {isFromHistory ? (
                                    <button className="btn-back-upload-pill" onClick={handleGoBackToHistory}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                        <span>Go Back to Documents</span>
                                    </button>
                                ) : (
                                    <div className="step-badge">Step 3: Review & Save</div>
                                )}

                                {!isFromHistory && (
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn-back-upload-pill" onClick={handleBackToSelection} style={{ margin: 0, padding: '0.65rem 1.5rem' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                            Previous
                                        </button>
                                        <button className="btn-save-review" onClick={handleSaveAndReview}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                            Finalize & Save
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="extract-title-group">
                                <h1>Extraction Results</h1>
                                <p>We found {(groupId ? extractedDocs : stagedDocs).length} matching invoices for this Purchase Order.</p>
                            </div>
                        </div>

                        <div className="extract-split-view">
                            {/* Left: PO Preview */}
                            <div className="po-preview-side">
                                <div className="po-preview-header">Original Document</div>
                                <div className="po-doc-container">
                                    {file?.type?.includes('image') ? (
                                        <img src={fileUrl} alt="PO Preview" className="po-preview-img" />
                                    ) : (
                                        <object
                                            data={fileUrl}
                                            type="application/pdf"
                                            className="po-preview-pdf"
                                            width="100%"
                                            height="100%"
                                        >
                                            <div className="pdf-placeholder">
                                                <p>PDF Preview Not Available</p>
                                                <a href={fileUrl} target="_blank" rel="noreferrer" className="btn-download">Download File</a>
                                            </div>
                                        </object>
                                    )}
                                </div>
                            </div>

                            {/* Right: Invoice Cards */}
                            <div className="invoice-cards-side">
                                <div className="cards-header">Generated Documents</div>
                                <div className="generated-docs-list">
                                    {(groupId ? extractedDocs : stagedDocs).map(doc => (
                                        <div key={doc.id} className="extract-card">
                                            <div className="card-top">
                                                <div className={`card-type-icon ${doc.type.toLowerCase().split(' ')[0]}`}>
                                                    {getTypeIcon(doc.type)}
                                                </div>
                                                <div className="card-meta">
                                                    <span className="card-type">{doc.type}</span>
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
                                                    <div className="card-amount">Rs. {doc.total.toLocaleString()}</div>
                                                </div>
                                                <div className="card-stat">
                                                    <label>Status</label>
                                                    <div className="card-status">{doc.status}</div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-card-edit"
                                                onClick={() => handleEditDoc(doc.id)}
                                            >
                                                Review & Complete Details
                                            </button>
                                        </div>
                                    ))}
                                    <div className="extract-card custom-add" onClick={handleCustomCreate}>
                                        <div className="custom-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </div>
                                        <span>Create Custom Invoice</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Reconciliation Section */}
                        {reconciliation && (
                            <div className="reconciliation-section animate-fadeIn" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                                <div className="reconciliation-header">
                                    <div className="reco-title">
                                        <h2>Stock Reconciliation Details</h2>
                                        <p>Comprehensive check of extracted items against warehouse inventory.</p>
                                    </div>
                                    <div className="reco-stats">
                                        <div className="reco-stat-pill available">
                                            <span className="dot"></span>
                                            {reconciliation.available.length} Matched
                                        </div>
                                        <div className="reco-stat-pill required">
                                            <span className="dot"></span>
                                            {reconciliation.required.length} To Purchase
                                        </div>
                                    </div>
                                </div>

                                <div className="reconciliation-grid">
                                    {/* Available in Inventory */}
                                    <div className="reco-card available">
                                        <div className="reco-card-header">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                            <h3>Available in Inventory</h3>
                                        </div>
                                        <div className="reco-table-wrapper">
                                            <table className="reco-table">
                                                <thead>
                                                    <tr>
                                                        <th>Product Name</th>
                                                        <th>PO Qty</th>
                                                        <th>In Stock</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reconciliation.available.length > 0 ? reconciliation.available.map((item, id) => (
                                                        <tr key={id}>
                                                            <td>
                                                                <div className="reco-item-name">
                                                                    <span className="reco-icon">{item.inventoryItem.image}</span>
                                                                    <div className="reco-text">
                                                                        <strong>{item.name}</strong>
                                                                        <span>{item.sku}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{item.qty}</td>
                                                            <td className={item.isShortage ? 'text-danger' : 'text-success'}>
                                                                {item.inventoryItem.stock}
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge-mini ${item.isShortage ? 'warning' : 'success'}`}>
                                                                    {item.isShortage ? 'Low Stock' : 'Available'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="4" className="empty-row">No direct matches found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Procurement Required */}
                                    <div className="reco-card required">
                                        <div className="reco-card-header">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            <h3>Missing Items / Purchase Required</h3>
                                        </div>
                                        <div className="reco-table-wrapper">
                                            <table className="reco-table">
                                                <thead>
                                                    <tr>
                                                        <th>Product Name</th>
                                                        <th>Requested Qty</th>
                                                        <th>Est. Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reconciliation.required.length > 0 ? reconciliation.required.map((item, id) => (
                                                        <tr key={id}>
                                                            <td>
                                                                <strong>{item.name}</strong>
                                                                <span className="subtext">{item.sku !== 'N/A' ? item.sku : 'SKU Unknown'}</span>
                                                            </td>
                                                            <td>{item.qty}</td>
                                                            <td>Rs. {(item.qty * (item.rate || 0)).toLocaleString()}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="3" className="empty-row">All items are available in inventory</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
