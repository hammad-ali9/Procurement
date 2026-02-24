import React, { useState } from 'react'
import './Parties.css'

const demoClients = [
    { id: 1, name: 'Nexaura Technologies', contact: 'Ahmed Bilal', email: 'ahmed@nexaura.io', phone: '+971 55 888 1234', industry: 'Technology', status: 'Active', totalOrders: 28, totalRevenue: 385000, outstanding: 45000, since: '2023-01-10' },
    { id: 2, name: 'Horizon Real Estate', contact: 'Layla Noor', email: 'layla@horizonre.ae', phone: '+971 50 444 5678', industry: 'Real Estate', status: 'Active', totalOrders: 15, totalRevenue: 620000, outstanding: 0, since: '2023-04-18' },
    { id: 3, name: 'Al Barsha Contracting', contact: 'Tariq Al Falasi', email: 'tariq@albarsha.ae', phone: '+971 56 222 3344', industry: 'Construction', status: 'Active', totalOrders: 42, totalRevenue: 892000, outstanding: 125000, since: '2022-09-05' },
    { id: 4, name: 'Green Valley Foods', contact: 'Priya Sharma', email: 'priya@greenvalley.ae', phone: '+971 52 111 9900', industry: 'F&B', status: 'Inactive', totalOrders: 8, totalRevenue: 67500, outstanding: 12000, since: '2024-02-14' },
    { id: 5, name: 'Marina Hospitality Group', contact: 'James Wilson', email: 'james@marinahg.ae', phone: '+971 54 666 7788', industry: 'Hospitality', status: 'Active', totalOrders: 35, totalRevenue: 455000, outstanding: 78000, since: '2023-07-20' },
]

export default function Clients() {
    const [search, setSearch] = useState('')
    const [filterIndustry, setFilterIndustry] = useState('All')
    const [showModal, setShowModal] = useState(false)

    const industries = ['All', ...new Set(demoClients.map(c => c.industry))]
    const filtered = demoClients.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase())
        const matchIndustry = filterIndustry === 'All' || c.industry === filterIndustry
        return matchSearch && matchIndustry
    })

    const totalRevenue = demoClients.reduce((a, c) => a + c.totalRevenue, 0)
    const totalOutstanding = demoClients.reduce((a, c) => a + c.outstanding, 0)
    const activeCount = demoClients.filter(c => c.status === 'Active').length

    return (
        <div className="parties-page">
            {/* Header */}
            <div className="parties-header">
                <div>
                    <h1 className="parties-title">Clients</h1>
                    <p className="parties-subtitle">Manage customers and businesses that buy from you</p>
                </div>
                <button className="parties-add-btn" onClick={() => setShowModal(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Client
                </button>
            </div>

            {/* Stat Cards */}
            <div className="parties-stats">
                <div className="party-stat-card">
                    <div className="psc-icon clients">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">{demoClients.length}</span>
                        <span className="psc-label">Total Clients</span>
                    </div>
                </div>
                <div className="party-stat-card">
                    <div className="psc-icon active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">{activeCount}</span>
                        <span className="psc-label">Active Clients</span>
                    </div>
                </div>
                <div className="party-stat-card">
                    <div className="psc-icon revenue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">Rs. {totalRevenue.toLocaleString()}</span>
                        <span className="psc-label">Total Revenue</span>
                    </div>
                </div>
                <div className="party-stat-card">
                    <div className="psc-icon outstanding">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">Rs. {totalOutstanding.toLocaleString()}</span>
                        <span className="psc-label">Outstanding</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="parties-controls">
                <div className="parties-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="parties-filter-group">
                    {industries.map(ind => (
                        <button key={ind} className={`parties-filter-btn ${filterIndustry === ind ? 'active' : ''}`} onClick={() => setFilterIndustry(ind)}>
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="parties-table-wrapper">
                <table className="parties-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Contact Person</th>
                            <th>Industry</th>
                            <th>Orders</th>
                            <th>Revenue</th>
                            <th>Outstanding</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(client => (
                            <tr key={client.id}>
                                <td>
                                    <div className="party-name-cell">
                                        <div className="party-avatar client">{client.name.charAt(0)}</div>
                                        <div>
                                            <div className="party-name">{client.name}</div>
                                            <div className="party-email">{client.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="party-contact">{client.contact}</div>
                                    <div className="party-phone">{client.phone}</div>
                                </td>
                                <td><span className="party-category-badge client">{client.industry}</span></td>
                                <td className="party-orders">{client.totalOrders}</td>
                                <td className="party-value">Rs. {client.totalRevenue.toLocaleString()}</td>
                                <td>
                                    <span className={`party-outstanding ${client.outstanding > 0 ? 'has-due' : 'clear'}`}>
                                        {client.outstanding > 0 ? `Rs. ${client.outstanding.toLocaleString()}` : 'Cleared'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`party-status ${client.status.toLowerCase()}`}>{client.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Client Modal */}
            {showModal && (
                <div className="parties-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="parties-modal" onClick={e => e.stopPropagation()}>
                        <div className="parties-modal-header">
                            <h2>Add New Client</h2>
                            <button className="parties-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="parties-modal-body">
                            <div className="parties-form-grid">
                                <div className="parties-form-group">
                                    <label>Company Name</label>
                                    <input type="text" placeholder="e.g. Nexaura Technologies" />
                                </div>
                                <div className="parties-form-group">
                                    <label>Contact Person</label>
                                    <input type="text" placeholder="e.g. Ahmed Bilal" />
                                </div>
                                <div className="parties-form-group">
                                    <label>Email</label>
                                    <input type="email" placeholder="e.g. contact@company.ae" />
                                </div>
                                <div className="parties-form-group">
                                    <label>Phone</label>
                                    <input type="tel" placeholder="e.g. +971 55 888 1234" />
                                </div>
                                <div className="parties-form-group">
                                    <label>Industry</label>
                                    <select>
                                        <option>Technology</option>
                                        <option>Real Estate</option>
                                        <option>Construction</option>
                                        <option>F&B</option>
                                        <option>Hospitality</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="parties-form-group">
                                    <label>Status</label>
                                    <select>
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="parties-modal-footer">
                            <button className="parties-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="parties-btn-save" onClick={() => setShowModal(false)}>Save Client</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
