import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import { getPKTFullTimestamp } from '../components/Topbar'
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './InvoiceHistory.css'
import './QuotationHistory.css'

const INVOICE_TYPES = [
    { key: 'tax-invoice', label: 'Tax Invoice', icon: 'tax' },
    { key: 'purchase-invoice', label: 'Purchase Invoice', icon: 'tag' },
    { key: 'delivery-challan', label: 'Delivery Challan', icon: 'truck' },
]

export default function QuotationHistory() {
    const { quotations, deleteQuotation, updateQuotation, addMultipleInvoices, invoices } = useProcurement();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedRow, setExpandedRow] = useState(null)
    const [selectedInvoiceTypes, setSelectedInvoiceTypes] = useState({})
    const [generatingFor, setGeneratingFor] = useState(null)
    const [timeRange, setTimeRange] = useState('Day'); // 'Day', 'Month', 'Year'

    const filtered = quotations.filter(q =>
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Helper to group data by time
    const getAggregatedData = (quotes, range) => {
        const sorted = [...quotes].sort((a, b) => new Date(a.date) - new Date(b.date));
        const map = {};

        sorted.forEach(q => {
            let key;
            const dateObj = new Date(q.date);
            if (range === 'Day') key = q.date;
            else if (range === 'Month') key = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
            else key = dateObj.getFullYear().toString();

            if (!map[key]) map[key] = { name: key, value: 0, count: 0 };
            if (q.status === 'Approved') {
                map[key].value += (q.total || 0);
                map[key].count += 1;
            }
        });

        return Object.values(map);
    };

    const aggregatedData = React.useMemo(() => getAggregatedData(quotations, timeRange), [quotations, timeRange]);

    // Dashboard Calculations
    const approvedQuotes = quotations.filter(q => q.status === 'Approved');
    const approvedCount = approvedQuotes.length;
    const totalApprovedValue = approvedQuotes.reduce((sum, q) => sum + (q.total || 0), 0);

    const MetricCard = ({ title, value, type, color, trend }) => (
        <div className={`qh-metric-card ${color}`}>
            <div className="qh-card-top">
                <div className="qh-card-head-left">
                    <div className="qh-icon-circle">
                        {type === 'balance' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        ) : type === 'sales' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        )}
                    </div>
                    <span className="qh-card-label">{title}</span>
                </div>
                <div className="qh-card-trend">+{trend}%</div>
            </div>

            <div className="qh-card-value">
                {type === 'balance' ? `Rs. ${value.toLocaleString()}` : value}
            </div>
        </div>
    );

    const PurchaseOrdersChart = () => (
        <div className="qh-metric-card main-chart-card">
            <div className="chart-card-header">
                <h3 className="chart-card-title">Purchase Orders</h3>
                <div className="period-selector">
                    {['Day', 'Month', 'Year'].map(range => (
                        <button
                            key={range}
                            className={`period-btn ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}s
                        </button>
                    ))}
                </div>
            </div>

            <div className="main-chart-area">
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={aggregatedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#000"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    const handleStatusChange = (quot, newStatus) => {
        if (quot.status === newStatus) return;
        if (window.confirm(`Change status of ${quot.id} to ${newStatus}?`)) {
            updateQuotation({ ...quot, status: newStatus });
        }
    };

    const toggleRow = (quotId) => {
        if (expandedRow === quotId) {
            setExpandedRow(null);
        } else {
            setExpandedRow(quotId);
            if (!selectedInvoiceTypes[quotId]) {
                setSelectedInvoiceTypes(prev => ({
                    ...prev,
                    [quotId]: ['tax-invoice']
                }));
            }
        }
    };

    const toggleInvoiceType = (quotId, typeKey) => {
        setSelectedInvoiceTypes(prev => {
            const current = prev[quotId] || [];
            if (current.includes(typeKey)) {
                return { ...prev, [quotId]: current.filter(t => t !== typeKey) };
            } else {
                return { ...prev, [quotId]: [...current, typeKey] };
            }
        });
    };

    // Check if a quotation already has generated invoices
    const getGeneratedInvoices = (quotId) => {
        const groupId = `QGR-${quotId}`;
        return invoices.filter(inv => inv.groupId === groupId);
    };

    const handleGenerateInvoices = (quot) => {
        const selected = selectedInvoiceTypes[quot.id] || [];
        if (selected.length === 0) {
            alert('Please select at least one invoice type to generate.');
            return;
        }

        setGeneratingFor(quot.id);

        const timestamp = Date.now();
        const groupId = `QGR-${quot.id}`;

        const typeToDocType = {
            'tax-invoice': 'Tax Invoice',
            'purchase-invoice': 'Purchase Invoice',
            'delivery-challan': 'Delivery Challan',
        };

        const newInvoices = selected.map((typeKey, index) => ({
            id: `${groupId}-${typeKey.toUpperCase()}-${timestamp}-${index}`,
            groupId: groupId,
            type: typeToDocType[typeKey] || typeKey,
            customer: quot.clientName,
            date: quot.date,
            processedAt: getPKTFullTimestamp(),
            total: quot.total,
            status: 'In Review',
            items: quot.items.map(item => ({
                name: item.name || item.desc || 'Item',
                desc: item.desc || item.name || '',
                quantity: item.quantity || item.qty || 1,
                qty: item.quantity || item.qty || 1,
                rate: item.rate || item.price || 0,
                price: item.rate || item.price || 0,
                amount: (item.quantity || item.qty || 1) * (item.rate || item.price || 0),
                amount: (item.quantity || item.qty || 1) * (item.rate || item.price || 0)
            })),
            taxRate: quot.taxRate || 0,
            delivery: 0,
            sourceQuotation: quot.id,
            deliveredTo: quot.clientName
        }));

        setTimeout(() => {
            addMultipleInvoices(newInvoices);
            setGeneratingFor(null);
            // Stay expanded — state updates automatically since we read from invoices
        }, 800);
    };

    const handleViewInvoices = (quotId) => {
        navigate(`/dashboard/quotation-invoices/${quotId}`);
    };

    const invoiceTypeIcons = {
        tag: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
        ),
        tax: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        ),
        truck: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
        ),
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

            <div className="qh-stats-grid">
                <div className="qh-metrics-column">
                    <MetricCard
                        title="Approved Quotations"
                        value={approvedCount}
                        type="sales"
                        color="green"
                        trend="17"
                    />
                    <MetricCard
                        title="Total Value"
                        value={totalApprovedValue}
                        type="balance"
                        color="yellow"
                        trend="23"
                    />
                </div>
                <PurchaseOrdersChart />
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
                        {filtered.length > 0 ? filtered.map(quot => {
                            const isApproved = quot.status === 'Approved';
                            const isExpanded = expandedRow === quot.id;
                            const existingInvoices = getGeneratedInvoices(quot.id);
                            const hasInvoices = existingInvoices.length > 0;
                            const selected = selectedInvoiceTypes[quot.id] || [];

                            return (
                                <React.Fragment key={quot.id}>
                                    <tr className={`${isExpanded ? 'row-expanded' : ''} ${isApproved ? 'row-approved' : ''}`}>
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
                                        <td className="font-bold">Rs. {(quot.total || 0).toLocaleString()}</td>
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
                                            {isApproved && (
                                                <button
                                                    className="btn-invoice-toggle"
                                                    onClick={() => toggleRow(quot.id)}
                                                    title={hasInvoices ? 'View Generated Invoices' : 'Generate Invoices'}
                                                >
                                                    {hasInvoices ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><polyline points="16 13 12 17 8 13" /></svg>
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                                    )}
                                                </button>
                                            )}
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

                                    {/* Expandable Invoice Actions Row */}
                                    {isApproved && isExpanded && (
                                        <tr className="invoice-actions-row">
                                            <td colSpan="8">
                                                <div className="qh-invoice-panel">
                                                    {hasInvoices ? (
                                                        /* Already has invoices — show created state with view button */
                                                        <div className="qh-invoices-created">
                                                            <div className="qh-created-header">
                                                                <div className="qh-created-icon">
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                                </div>
                                                                <div>
                                                                    <div className="qh-created-title">{existingInvoices.length} Invoice{existingInvoices.length > 1 ? 's' : ''} Generated</div>
                                                                    <div className="qh-created-sub">From quotation {quot.id}</div>
                                                                </div>
                                                            </div>
                                                            <div className="qh-created-types">
                                                                {existingInvoices.map(inv => (
                                                                    <span key={inv.id} className="qh-created-badge">{inv.type}</span>
                                                                ))}
                                                            </div>
                                                            <button className="qh-view-invoices-btn" onClick={() => handleViewInvoices(quot.id)}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                                View & Edit Invoices
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* No invoices yet — show selection panel */
                                                        <div className="qh-invoice-selector">
                                                            <div className="qh-selector-header">
                                                                <div className="qh-selector-title">Select Invoices to Generate</div>
                                                                <div className="qh-selector-sub">Choose the document types to create from this approved quotation</div>
                                                            </div>

                                                            <div className="qh-type-pills">
                                                                {INVOICE_TYPES.map(type => (
                                                                    <button
                                                                        key={type.key}
                                                                        className={`qh-pill ${selected.includes(type.key) ? 'active' : ''}`}
                                                                        onClick={() => toggleInvoiceType(quot.id, type.key)}
                                                                    >
                                                                        <span className="qh-pill-icon">{invoiceTypeIcons[type.icon]}</span>
                                                                        <span className="qh-pill-label">{type.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <div className="qh-selector-actions">
                                                                <span className="qh-selected-count">{selected.length} type{selected.length !== 1 ? 's' : ''} selected</span>
                                                                <button
                                                                    className="qh-generate-btn"
                                                                    onClick={() => handleGenerateInvoices(quot)}
                                                                    disabled={selected.length === 0 || generatingFor === quot.id}
                                                                >
                                                                    {generatingFor === quot.id ? (
                                                                        <>
                                                                            <span className="qh-spinner"></span>
                                                                            Generating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                                                            Generate Invoices
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" className="no-results">No quotations found matching your search.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
