import React, { useState, useEffect } from 'react'
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

    const navigate = useNavigate()
    const { groupId } = useParams()
    const location = useLocation()
    const { addMultipleInvoices, createCustomInvoice, invoices, setOriginalFile, getOriginalFile } = useProcurement()

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
            if (savedFile && !fileUrl) {
                setFileUrl(savedFile.dataUrl);
                // Create a minimal file-like object for type checking
                setFile({ type: savedFile.fileType });
            }
        }
    }, [groupId, invoices]);

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

            // Enrich the raw AI results with System IDs and Grouping
            const timestamp = Date.now()
            const newGroupId = `GRP-${timestamp}`

            const enrichedDocuments = rawDocuments.map((doc, index) => ({
                ...doc,
                id: doc.id || `GEN-${timestamp}-${index}`, // Fallback ID if AI misses it
                groupId: newGroupId, // Bind all to this PO
                status: 'In Review',
                processedAt: getPKTFullTimestamp()
            }))

            clearInterval(interval)
            setProgress(100)

            // Transition to Results View
            setTimeout(() => {
                setIsUploading(false)
                setShowingResults(true)
                setStagedDocs(enrichedDocuments)

                // Save the original file as base64 for later preview
                const reader = new FileReader()
                reader.onloadend = () => {
                    setOriginalFile(newGroupId, reader.result, file.type)
                }
                reader.readAsDataURL(file)
            }, 500)

        } catch (error) {
            console.error("AI Extraction Error:", error)
            clearInterval(interval)
            setIsUploading(false)
            setProgress(0)
            alert("Failed to extract document. Is the backend server running?")
        }
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
        setStagedDocs([])
        navigate('/dashboard/upload')
    }

    const handleGoBackToHistory = () => {
        navigate('/dashboard/history')
    }

    const handleShare = (doc) => {
        alert(`Sharing document ${doc.id} via secure link...`)
    }

    const handleEditDoc = (docId) => {
        // Auto-commit staged docs to global state before opening editor
        if (stagedDocs && stagedDocs.length > 0) {
            addMultipleInvoices(stagedDocs)
            setStagedDocs([])
        }
        navigate(`/dashboard/edit/${docId}`)
    }

    if (showingResults) {
        const displayDocs = groupId ? extractedDocs : stagedDocs;

        return (
            <div className="extraction-dashboard-modern animate-fadeIn">
                <div className="extract-header">
                    <div className="extract-header-top">
                        {isFromHistory ? (
                            <button className="btn-back-upload-pill" onClick={handleGoBackToHistory}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                <span>Go Back to Documents</span>
                            </button>
                        ) : (
                            <button className="btn-back-upload-pill" onClick={handleBackToUpload}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                <span>Back to Upload</span>
                            </button>
                        )}

                        {!isFromHistory && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-reupload-secondary" onClick={handleReupload}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16" /></svg>
                                    Reupload
                                </button>
                                <button className="btn-save-review" onClick={handleSaveAndReview}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                    Save and Review
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="extract-title-group">
                        <h1>Document Extracted Successfully</h1>
                        <p>We found {displayDocs.length} matching invoices for this Purchase Order.</p>
                    </div>
                </div>

                <div className="extract-split-view">
                    {/* Left: PO Preview */}
                    <div className="po-preview-side">
                        <div className="po-preview-header">Original Document</div>
                        <div className="po-doc-container">
                            {file?.type.includes('image') ? (
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
                        <div className="cards-header">Select Document to Edit</div>
                        <div className="results-grid">
                            {displayDocs.map(doc => (
                                <div key={doc.id} className="extract-card">
                                    <div className="card-top">
                                        <div className={`card-type-icon ${doc.type.toLowerCase().split(' ')[0]}`}>
                                            {doc.type[0]}
                                        </div>
                                        <div className="card-meta">
                                            <span className="card-type">{doc.type}</span>
                                            <span className="card-id">{doc.id}</span>
                                        </div>
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
            </div>
        )
    }

    return (
        <div className="upload-page-modern">
            <div className="upload-content">
                <div className="upload-header">
                    <h1>Process Purchase Order</h1>
                    <p>Upload your document to generate instant invoices and tax breakdowns.</p>
                </div>

                {!isUploading ? (
                    <div className="upload-box-main animate-fadeIn">
                        <div className="dropzone">
                            <div className="dz-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <h3>{file ? file.name : 'Select or drop PO document'}</h3>
                            <p>PDF, PNG, JPG (Max 10MB)</p>
                            <input
                                type="file"
                                id="po-file"
                                hidden
                                onChange={handleFileChange}
                            />
                            <label htmlFor="po-file" className="btn-secondary">Browse Files</label>
                        </div>
                        <button
                            className={`btn-primary-upload ${!file ? 'disabled' : ''}`}
                            onClick={handleUpload}
                            disabled={!file}
                        >
                            Start Extraction
                        </button>
                    </div>
                ) : (
                    <div className="processing-state animate-fadeIn">
                        <div className="loader-container">
                            <div className="loader-ring"></div>
                            <div className="loader-percentage">{progress}%</div>
                        </div>
                        <h3>Extracting document data...</h3>
                        <p>Our AI is identifying items, taxes, and delivery details.</p>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
