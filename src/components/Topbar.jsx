import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import { useAuth } from '../context/AuthContext'
import './Topbar.css'

// Format time for PKT timezone (Asia/Karachi, UTC+5)
function getPKTTime() {
    const now = new Date()
    return now.toLocaleTimeString('en-PK', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    })
}

function getPKTDate() {
    const now = new Date()
    return now.toLocaleDateString('en-PK', {
        timeZone: 'Asia/Karachi',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

// Reusable: format date and time for processing logs in PKT
export function getPKTFullTimestamp() {
    const now = new Date()
    return now.toLocaleString('en-PK', {
        timeZone: 'Asia/Karachi',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

// Reusable: format date for invoices in PKT
export function getPKTInvoiceDate() {
    const now = new Date()
    return now.toLocaleDateString('en-PK', {
        timeZone: 'Asia/Karachi',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

// Helper to show relative time from timestamp
function getRelativeTime(timestamp) {
    const diff = Date.now() - timestamp
    const secs = Math.floor(diff / 1000)
    if (secs < 60) return 'Just now'
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function Topbar() {
    const [time, setTime] = useState(getPKTTime())
    const [date] = useState(getPKTDate())
    const [showNotifs, setShowNotifs] = useState(false)
    const [showProfile, setShowProfile] = useState(false)

    const {
        companyLogo,
        notifications,
        markAllNotificationsRead,
        clearNotifications,
        invoices,
        globalSearchQuery,
        setGlobalSearchQuery,
        traderProfile, // Keep as fallback
        products,
    } = useProcurement()

    const { currentUser, logout } = useAuth()

    const notifRef = useRef(null)
    const profileRef = useRef(null)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error("Failed to log out", error)
        }
    }

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setTime(getPKTTime()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const unreadCount = notifications.filter(n => n.unread).length

    // ── Global Search Logic ──
    const searchRef = useRef(null)
    const [showSearchResults, setShowSearchResults] = useState(false)

    // Close search on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const searchResults = useMemo(() => {
        if (!globalSearchQuery || globalSearchQuery.length < 2) return null

        const query = globalSearchQuery.toLowerCase()

        const matchedProducts = products.filter(p =>
            p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
        ).slice(0, 5)

        const matchedInvoices = invoices.filter(inv =>
            inv.id.toLowerCase().includes(query) || inv.customer.toLowerCase().includes(query)
        ).slice(0, 5)

        // Find unique PO groups
        const matchedPOs = Array.from(new Set(invoices.map(inv => inv.groupId)))
            .filter(gid => gid.toLowerCase().includes(query))
            .map(gid => invoices.find(inv => inv.groupId === gid))
            .slice(0, 3)

        if (matchedProducts.length === 0 && matchedInvoices.length === 0 && matchedPOs.length === 0) return []

        return {
            products: matchedProducts,
            invoices: matchedInvoices,
            pos: matchedPOs
        }
    }, [globalSearchQuery, products, invoices])

    // Notification type icons
    const notifIcon = (type) => {
        switch (type) {
            case 'success':
                return <span className="notif-type-icon success">✓</span>
            case 'warning':
                return <span className="notif-type-icon warning">!</span>
            case 'error':
                return <span className="notif-type-icon error">✕</span>
            default:
                return <span className="notif-type-icon info">i</span>
        }
    }

    return (
        <div className="topbar">
            {/* Left - Trader Name */}
            <div className="topbar-left">
                <div className="topbar-greeting">
                    <span className="greeting-label">Welcome back,</span>
                    <span className="greeting-name">{currentUser?.displayName || traderProfile.name}</span>
                </div>
            </div>

            {/* Center - Search */}
            <div className="global-search-wrapper" ref={searchRef}>
                <div className="topbar-search">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><line x1="12" y1="12" x2="18" y2="18" /></svg>
                    <input
                        type="text"
                        placeholder="Search invoices, suppliers..."
                        className="topbar-search-input"
                        value={globalSearchQuery}
                        onChange={(e) => {
                            setGlobalSearchQuery(e.target.value)
                            setShowSearchResults(true)
                        }}
                        onFocus={() => setShowSearchResults(true)}
                    />
                </div>

                {showSearchResults && globalSearchQuery.length >= 2 && (
                    <div className="search-results-dropdown">
                        {!searchResults ? (
                            <div className="search-no-results">Looking for "{globalSearchQuery}"...</div>
                        ) : Array.isArray(searchResults) && searchResults.length === 0 ? (
                            <div className="search-no-results">
                                <p>No results found locally</p>
                                <button className="sr-google-btn sr-fallback">
                                    <span className="sr-icon">G</span>
                                    <span>Search <strong>{globalSearchQuery}</strong> on Google</span>
                                </button>
                            </div>
                        ) : (
                            <div className="search-results-list">
                                {searchResults.pos?.length > 0 && (
                                    <>
                                        <div className="search-category">Purchase Orders</div>
                                        {searchResults.pos.map(po => (
                                            <div
                                                key={po.groupId}
                                                className="search-result-item"
                                                onClick={() => { navigate(`/dashboard/extract/${po.groupId}`); setShowSearchResults(false) }}
                                            >
                                                <div className="sr-icon">📦</div>
                                                <div className="sr-info">
                                                    <span className="sr-name">{po.groupId}</span>
                                                    <span className="sr-meta">{po.customer}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {searchResults.invoices?.length > 0 && (
                                    <>
                                        <div className="search-category">Invoices</div>
                                        {searchResults.invoices.map(inv => (
                                            <div
                                                key={inv.id}
                                                className="search-result-item"
                                                onClick={() => { navigate(`/dashboard/edit/${inv.id}`); setShowSearchResults(false) }}
                                            >
                                                <div className="sr-icon">📄</div>
                                                <div className="sr-info">
                                                    <span className="sr-name">{inv.id}</span>
                                                    <span className="sr-meta">{inv.customer} • ${inv.total.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {searchResults.products?.length > 0 && (
                                    <>
                                        <div className="search-category">Inventory</div>
                                        {searchResults.products.map(p => (
                                            <div
                                                key={p.id}
                                                className="search-result-item"
                                                onClick={() => { navigate(`/dashboard/products`); setShowSearchResults(false) }}
                                            >
                                                <div className="sr-icon">{p.image}</div>
                                                <div className="sr-info">
                                                    <span className="sr-name">{p.name}</span>
                                                    <span className="sr-meta">{p.sku} • {p.stock} in stock</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                <div className="sr-fallback">
                                    <button className="sr-google-btn">
                                        <span className="sr-icon">G</span>
                                        <span>Search <strong>{globalSearchQuery}</strong> - Google Search</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right - Actions */}
            <div className="topbar-right">
                {/* Live Clock */}
                <div className="topbar-clock">
                    <div className="clock-time">{time}</div>
                    <div className="clock-date">{date}</div>
                </div>

                <div className="topbar-divider" />

                {/* Notifications — real data from context */}
                <div className="topbar-notif-wrapper" ref={notifRef}>
                    <button
                        className="tb-icon-btn"
                        onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
                        title="Notifications"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>

                    {showNotifs && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <h4>Notifications</h4>
                                <div className="notif-actions">
                                    {unreadCount > 0 && (
                                        <button className="notif-mark-read" onClick={markAllNotificationsRead}>Mark all read</button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button className="notif-clear" onClick={clearNotifications}>Clear</button>
                                    )}
                                </div>
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        <p>No notifications yet</p>
                                        <span>Activity will appear here as you work</span>
                                    </div>
                                ) : (
                                    notifications.slice(0, 20).map(n => (
                                        <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''} `}>
                                            <div className="notif-icon-col">
                                                {notifIcon(n.type)}
                                            </div>
                                            <div className="notif-content">
                                                <p>{n.text}</p>
                                                <span className="notif-time">{getRelativeTime(n.timestamp)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Photo — real trader profile from context */}
                <div className="topbar-profile-wrapper" ref={profileRef}>
                    <button
                        className="tb-profile-btn"
                        onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
                    >
                        <div className="tb-avatar-ring">
                            {currentUser?.photoURL || companyLogo ? (
                                <img src={currentUser?.photoURL || companyLogo} alt="Profile" />
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || traderProfile.name)}&background=1a1a2e&color=fff&bold=true&size=40`} alt="Profile" />
                            )}
                        </div >
                        <span className="tb-online-dot" />
                    </button >

                    {showProfile && (
                        <div className="profile-dropdown">
                            <div className="profile-dropdown-header">
                                <div className="profile-avatar-lg">
                                    {currentUser?.photoURL || companyLogo ? (
                                        <img src={currentUser?.photoURL || companyLogo} alt="Profile" />
                                    ) : (
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || traderProfile.name)}&background=1a1a2e&color=fff&bold=true&size=80`} alt="Profile" />
                                    )}
                                </div>
                                <div>
                                    <h4>{currentUser?.displayName || traderProfile.name}</h4>
                                    <p className="profile-email">{currentUser?.email || traderProfile.email}</p>
                                    <p className="profile-role">{traderProfile.role}</p>
                                </div>
                            </div>
                            <div className="profile-menu">
                                <button className="profile-menu-item" onClick={() => { navigate('/dashboard/settings'); setShowProfile(false) }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    My Profile
                                </button>
                                <button className="profile-menu-item" onClick={() => { navigate('/dashboard/settings'); setShowProfile(false) }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                                    Settings
                                </button>
                                <div className="profile-divider" />
                                <button className="profile-menu-item logout" onClick={handleLogout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div >
            </div >
        </div >
    )
}
