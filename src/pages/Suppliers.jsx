import { useProcurement } from '../context/ProcurementContext'
import './Parties.css'

export default function Suppliers() {
    const { suppliers, addSupplier } = useProcurement()
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('All')
    const [showModal, setShowModal] = useState(false)
    const [newSupplierData, setNewSupplierData] = useState({ name: '', contact: '', email: '', phone: '', category: 'Raw Materials' })

    const categories = ['All', ...new Set(suppliers.map(s => s.category))]
    const filtered = suppliers.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.contact || '').toLowerCase().includes(search.toLowerCase())
        const matchCategory = filterCategory === 'All' || s.category === filterCategory
        return matchSearch && matchCategory
    })

    const totalValue = suppliers.reduce((a, s) => a + (s.totalValue || 0), 0)
    const activeCount = suppliers.filter(s => s.status === 'Active').length

    const handleSaveSupplier = () => {
        if (!newSupplierData.name || !newSupplierData.email) return;
        addSupplier(newSupplierData)
        setShowModal(false)
        setNewSupplierData({ name: '', contact: '', email: '', phone: '', category: 'Raw Materials' })
    }

    return (
        <div className="parties-page">
            {/* Header */}
            <div className="parties-header">
                <div>
                    <h1 className="parties-title">Suppliers</h1>
                    <p className="parties-subtitle">Manage vendors and suppliers you purchase from</p>
                </div>
                <button className="parties-add-btn" onClick={() => setShowModal(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Supplier
                </button>
            </div>

            {/* Stat Cards */}
            <div className="parties-stats">
                <div className="party-stat-card">
                    <div className="psc-icon suppliers">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">{suppliers.length}</span>
                        <span className="psc-label">Total Suppliers</span>
                    </div>
                </div>
                <div className="party-stat-card">
                    <div className="psc-icon active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">{activeCount}</span>
                        <span className="psc-label">Active</span>
                    </div>
                </div>
                <div className="party-stat-card">
                    <div className="psc-icon volume">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">Rs. {totalValue.toLocaleString()}</span>
                        <span className="psc-label">Total Purchases</span>
                    </div>
                </div>
                <div className="party-stat-card">
                    <div className="psc-icon rating">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    </div>
                    <div className="psc-info">
                        <span className="psc-value">
                            {suppliers.length > 0 ? (suppliers.reduce((a, s) => a + (s.rating || 0), 0) / suppliers.length).toFixed(1) : '0.0'}
                        </span>
                        <span className="psc-label">Avg Rating</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="parties-controls">
                <div className="parties-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="parties-filter-group">
                    {categories.map(cat => (
                        <button key={cat} className={`parties-filter-btn ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="parties-table-wrapper">
                <table className="parties-table">
                    <thead>
                        <tr>
                            <th>Supplier</th>
                            <th>Contact Person</th>
                            <th>Category</th>
                            <th>Orders</th>
                            <th>Total Value</th>
                            <th>Rating</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(supplier => (
                            <tr key={supplier.id}>
                                <td>
                                    <div className="party-name-cell">
                                        <div className="party-avatar">{supplier.name.charAt(0)}</div>
                                        <div>
                                            <div className="party-name">{supplier.name}</div>
                                            <div className="party-email">{supplier.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="party-contact">{supplier.contact}</div>
                                    <div className="party-phone">{supplier.phone}</div>
                                </td>
                                <td><span className="party-category-badge">{supplier.category}</span></td>
                                <td className="party-orders">{supplier.totalOrders || 0}</td>
                                <td className="party-value">Rs. {(supplier.totalValue || 0).toLocaleString()}</td>
                                <td>
                                    <div className="party-rating">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                        {supplier.rating || '5.0'}
                                    </div>
                                </td>
                                <td>
                                    <span className={`party-status ${supplier.status.toLowerCase()}`}>{supplier.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Supplier Modal */}
            {showModal && (
                <div className="parties-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="parties-modal" onClick={e => e.stopPropagation()}>
                        <div className="parties-modal-header">
                            <h2>Add New Supplier</h2>
                            <button className="parties-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="parties-modal-body">
                            <div className="parties-form-grid">
                                <div className="parties-form-group">
                                    <label>Company Name</label>
                                    <input type="text" placeholder="e.g. Al Raha Steel Trading" value={newSupplierData.name} onChange={e => setNewSupplierData({ ...newSupplierData, name: e.target.value })} />
                                </div>
                                <div className="parties-form-group">
                                    <label>Contact Person</label>
                                    <input type="text" placeholder="e.g. Khalid Al Mansouri" value={newSupplierData.contact} onChange={e => setNewSupplierData({ ...newSupplierData, contact: e.target.value })} />
                                </div>
                                <div className="parties-form-group">
                                    <label>Email</label>
                                    <input type="email" placeholder="e.g. contact@company.ae" value={newSupplierData.email} onChange={e => setNewSupplierData({ ...newSupplierData, email: e.target.value })} />
                                </div>
                                <div className="parties-form-group">
                                    <label>Phone</label>
                                    <input type="tel" placeholder="e.g. +971 55 123 4567" value={newSupplierData.phone} onChange={e => setNewSupplierData({ ...newSupplierData, phone: e.target.value })} />
                                </div>
                                <div className="parties-form-group">
                                    <label>Category</label>
                                    <select value={newSupplierData.category} onChange={e => setNewSupplierData({ ...newSupplierData, category: e.target.value })}>
                                        <option>Raw Materials</option>
                                        <option>Packaging</option>
                                        <option>Equipment</option>
                                        <option>Chemicals</option>
                                        <option>Logistics</option>
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
                            <button className="parties-btn-save" onClick={handleSaveSupplier}>Save Supplier</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
