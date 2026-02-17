import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
    { label: 'Analytics', path: '/dashboard', icon: 'grid', color: 'pink' },
    { label: 'Document Upload', path: '/dashboard/upload', icon: 'upload', color: 'emerald' },
    { label: 'Document History', path: '/dashboard/history', icon: 'clock', color: 'blue' },
]

const icons = {
    grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5V14" /></svg>,
    clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Slim Icon Bar - ONLY VISIBLE WHEN COLLAPSED */}
            {isCollapsed && <div className="sidebar-icons-bar">
                <div className="sb-logo-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>

                <div className="sb-icon-group">
                    <div className="sb-nav-divider"></div>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            className={({ isActive }) => `sb-icon-btn nav-icon-link ${isActive ? 'active' : ''} ${item.color}`}
                            title={item.label}
                            data-tooltip={item.label}
                        >
                            {icons[item.icon]}
                        </NavLink>
                    ))}
                </div>

                <div className="sb-bottom-icons">
                    <NavLink
                        to="/dashboard/settings"
                        className={({ isActive }) => `sb-icon-btn nav-icon-link ${isActive ? 'active' : ''}`}
                        title="Settings"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                    </NavLink>
                    <div className="sb-icon-btn toggle-btn prominent" onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? "Expand" : "Collapse"}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 17l-5-5 5-5m7 10l-5-5 5-5" />
                        </svg>
                    </div>
                </div>
            </div>}

            {/* Main Nav Bar */}
            <div className="sidebar-main-nav">
                <div className="nav-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <div className="brand-name">Karobar.</div>
                </div>

                <div className="nav-body">
                    <div className="nav-section">
                        <div className="section-label">Main Workflow</div>
                        <div className="nav-items-list">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''} ${item.color}`}
                                >
                                    <div className="active-indicator"></div>
                                    <span className="nav-icon">{icons[item.icon]}</span>
                                    <span className="nav-label">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="nav-footer">
                    <NavLink
                        to="/dashboard/settings"
                        className={({ isActive }) => `nav-pill-item footer-pill ${isActive ? 'active' : ''}`}
                    >
                        <div className="active-indicator"></div>
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                        </span>
                        <span className="nav-label">System Settings</span>
                    </NavLink>

                    <div className="nav-pill-item footer-pill hover" onClick={() => setIsCollapsed(true)}>
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 17l-5-5 5-5m7 10l-5-5 5-5" />
                            </svg>
                        </span>
                        <span className="nav-label">Collapse Menu</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
