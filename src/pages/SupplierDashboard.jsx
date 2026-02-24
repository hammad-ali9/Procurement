import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '../context/ProcurementContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import './SupplierDashboard.css';

export default function SupplierDashboard() {
    const navigate = useNavigate();
    const { suppliers, purchaseRequests, addSupplier } = useProcurement();
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [newSupplierData, setNewSupplierData] = useState({
        name: '',
        contact: '',
        email: '',
        phone: '',
        category: 'Raw Materials',
        status: 'Active'
    });

    // 1. Analytics & Metrics Logic
    const analytics = useMemo(() => {
        // Spend per supplier (from approved PRs)
        const spendMap = {};
        purchaseRequests.filter(pr => pr.status === 'Approved').forEach(pr => {
            const name = pr.supplier;
            spendMap[name] = (spendMap[name] || 0) + pr.total;
        });

        const spendData = Object.entries(spendMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        // Category distribution
        const catMap = {};
        suppliers.forEach(s => {
            catMap[s.category] = (catMap[s.category] || 0) + 1;
        });
        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        const totalSpend = Object.values(spendMap).reduce((a, b) => a + b, 0);
        const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;
        const avgRating = suppliers.length > 0
            ? (suppliers.reduce((a, s) => a + (s.rating || 5), 0) / suppliers.length).toFixed(1)
            : '5.0';

        return { spendData, categoryData, totalSpend, activeSuppliers, avgRating };
    }, [suppliers, purchaseRequests]);

    // 2. Directory Logic
    const categories = ['All', ...new Set(suppliers.map(s => s.category))];
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.email.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [suppliers, search, filterCategory]);

    const handleSaveSupplier = () => {
        if (!newSupplierData.name || !newSupplierData.email) return alert('Name and Email are required');
        addSupplier(newSupplierData);
        setShowModal(false);
        setNewSupplierData({ name: '', contact: '', email: '', phone: '', category: 'Raw Materials', status: 'Active' });
    };

    const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b'];

    return (
        <div className="supplier-dashboard">
            <header className="sd-header">
                <div className="sd-header-left">
                    <h1>Supplier Dashboard</h1>
                    <p>Track vendor performance and procurement analytics</p>
                </div>
                <div className="sd-header-actions">
                    <button className="btn-sd-primary" onClick={() => setShowModal(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add New Vendor
                    </button>
                </div>
            </header>

            {/* Metrics Row */}
            <div className="sd-metrics-grid">
                <div className="sd-metric-card">
                    <div className="sd-metric-icon spend">💰</div>
                    <div className="sd-metric-info">
                        <span className="label">Total Approved Spend</span>
                        <div className="value">Rs. {analytics.totalSpend.toLocaleString()}</div>
                    </div>
                </div>
                <div className="sd-metric-card">
                    <div className="sd-metric-icon count">👥</div>
                    <div className="sd-metric-info">
                        <span className="label">Active Suppliers</span>
                        <div className="value">{analytics.activeSuppliers} / {suppliers.length}</div>
                    </div>
                </div>
                <div className="sd-metric-card">
                    <div className="sd-metric-icon rating">⭐</div>
                    <div className="sd-metric-info">
                        <span className="label">Average Rating</span>
                        <div className="value">{analytics.avgRating}</div>
                    </div>
                </div>
            </div>

            {/* Analytics Row */}
            <div className="sd-analytics-row">
                <div className="sd-chart-card">
                    <h3>Top 5 Vendors by Spend</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.spendData} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    formatter={(value) => `Rs. ${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {analytics.spendData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sd-chart-card compact">
                    <h3>Category Distribution</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.categoryData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        {analytics.categoryData.map((entry, index) => (
                            <div key={entry.name} className="legend-item">
                                <span className="dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                                <span className="name">{entry.name}</span>
                                <span className="count">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Directory Section */}
            <div className="sd-directory-section">
                <div className="directory-header">
                    <h2>Supplier Directory</h2>
                    <div className="directory-controls">
                        <div className="sd-search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="sd-filter">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`sd-filter-pill ${filterCategory === cat ? 'active' : ''}`}
                                    onClick={() => setFilterCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sd-table-wrapper">
                    <table className="sd-table">
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Total Spend</th>
                                <th>Rating</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(s => {
                                const supplierSpend = purchaseRequests
                                    .filter(pr => pr.supplier === s.name && pr.status === 'Approved')
                                    .reduce((sum, pr) => sum + pr.total, 0);

                                return (
                                    <tr key={s.id} onClick={() => setSelectedSupplier(s)}>
                                        <td>
                                            <div className="sd-vendor-info">
                                                <div className="sd-avatar">{s.name.charAt(0)}</div>
                                                <div>
                                                    <strong>{s.name}</strong>
                                                    <span>{s.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="sd-cat-tag">{s.category}</span></td>
                                        <td>
                                            <span className={`sd-status-pill ${s.status.toLowerCase()}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="sd-spend">Rs. {supplierSpend.toLocaleString()}</td>
                                        <td>
                                            <div className="sd-rating">
                                                ⭐ {(s.rating || 5.0).toFixed(1)}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="sd-btn-view">View Details</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals (Register / Details) would go here */}
            {showModal && (
                <div className="sd-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="sd-modal" onClick={e => e.stopPropagation()}>
                        <div className="sd-modal-header">
                            <h2>Register New Vendor</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="sd-modal-body">
                            <div className="sd-form-grid">
                                <div className="sd-field">
                                    <label>Company Name</label>
                                    <input type="text" placeholder="e.g. Acme Corp" value={newSupplierData.name} onChange={e => setNewSupplierData({ ...newSupplierData, name: e.target.value })} />
                                </div>
                                <div className="sd-field">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="vendor@example.com" value={newSupplierData.email} onChange={e => setNewSupplierData({ ...newSupplierData, email: e.target.value })} />
                                </div>
                                <div className="sd-field">
                                    <label>Contact Person</label>
                                    <input type="text" placeholder="Full Name" value={newSupplierData.contact} onChange={e => setNewSupplierData({ ...newSupplierData, contact: e.target.value })} />
                                </div>
                                <div className="sd-field">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+971 ..." value={newSupplierData.phone} onChange={e => setNewSupplierData({ ...newSupplierData, phone: e.target.value })} />
                                </div>
                                <div className="sd-field full">
                                    <label>Vendor Category</label>
                                    <select value={newSupplierData.category} onChange={e => setNewSupplierData({ ...newSupplierData, category: e.target.value })}>
                                        <option>Raw Materials</option>
                                        <option>Packaging</option>
                                        <option>Equipment</option>
                                        <option>Logistics</option>
                                        <option>Services</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="sd-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Discard</button>
                            <button className="btn-save" onClick={handleSaveSupplier}>Confirm Registration</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
