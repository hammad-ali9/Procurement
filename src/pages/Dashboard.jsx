import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useProcurement } from '../context/ProcurementContext.js'
import './Dashboard.css'

export default function Dashboard() {
    const { invoices, getStats } = useProcurement();
    const stats = getStats();
    const [timeframe, setTimeframe] = useState('months'); // 'days', 'months', 'years'

    const chartData = useMemo(() => {
        if (timeframe === 'days') {
            return [
                { name: 'Mon', volume: 4200, pos: 12 },
                { name: 'Tue', volume: 3800, pos: 8 },
                { name: 'Wed', volume: 5100, pos: 15 },
                { name: 'Thu', volume: 4600, pos: 11 },
                { name: 'Fri', volume: 6200, pos: 18 },
                { name: 'Sat', volume: 2100, pos: 4 },
                { name: 'Sun', volume: 1500, pos: 3 },
            ];
        } else if (timeframe === 'years') {
            return [
                { name: '2022', volume: 450000, pos: 1200 },
                { name: '2023', volume: 680000, pos: 1850 },
                { name: '2024', volume: 820000, pos: 2240 },
            ];
        }
        // Default: months
        return [
            { name: 'Jan', volume: 45000, pos: 145 },
            { name: 'Feb', volume: 52000, pos: 168 },
            { name: 'Mar', volume: 48000, pos: 152 },
            { name: 'Apr', volume: 61000, pos: 198 },
            { name: 'May', volume: 55000, pos: 174 },
            { name: 'Jun', volume: 67000, pos: 212 },
        ];
    }, [timeframe]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value">
                        {payload[0].name === 'volume' ? `$${payload[0].value.toLocaleString()}` : `${payload[0].value} POs`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dash-page-modern">
            {/* Analytics Header */}
            <div className="dash-analytics-header">
                <div className="analytics-main">
                    <span className="analytics-label">Procurement Performance</span>
                    <h1 className="analytics-title">Analytics Overview</h1>
                </div>
                <Link to="/dashboard/upload" className="btn-dash-primary">
                    <span className="icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </span> New Upload
                </Link>
            </div>

            {/* Metric Grid */}
            <div className="analytics-grid">
                <div className="stat-card">
                    <div className="stat-label">POs Uploaded</div>
                    <div className="stat-value">{stats.totalPOs}</div>
                    <div className="stat-trend positive">
                        <span className="trend-arrow">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </span>
                        <span className="trend-pct">12.5%</span>
                        <span className="trend-desc">vs last month</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Volume</div>
                    <div className="stat-value">${stats.totalAmount}</div>
                    <div className="stat-trend positive">
                        <span className="trend-arrow">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </span>
                        <span className="trend-pct">8.2%</span>
                        <span className="trend-desc">Active Throughput</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Hours Saved</div>
                    <div className="stat-value">{stats.hoursSaved}h</div>
                    <div className="stat-trend positive">
                        <span className="trend-arrow">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </span>
                        <span className="trend-pct">14h</span>
                        <span className="trend-desc">Estimated ROI</span>
                    </div>
                </div>
                <div className="stat-card dark">
                    <div className="stat-label">AI Accuracy</div>
                    <div className="stat-value">{stats.avgAccuracy}%</div>
                    <div className="stat-trend">
                        <span className="trend-badge">High Confidence</span>
                    </div>
                </div>
            </div>

            {/* Analysis Section */}
            <div className="dash-charts-row">
                <div className="stats-chart-placeholder">
                    <div className="chart-header-main">
                        <h3 className="section-title">Volume Trends</h3>
                        <div className="timeframe-switcher">
                            {['days', 'months', 'years'].map((tf) => (
                                <button
                                    key={tf}
                                    className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                                    onClick={() => setTimeframe(tf)}
                                >
                                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={timeframe === 'years' ? 40 : 25}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === chartData.length - 1 ? '#000' : '#e5e7eb'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="stats-chart-placeholder">
                    <div className="chart-header-main">
                        <h3 className="section-title">Purchase Orders</h3>
                        <div className="timeframe-switcher">
                            {['days', 'months', 'years'].map((tf) => (
                                <button
                                    key={tf}
                                    className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                                    onClick={() => setTimeframe(tf)}
                                >
                                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#999', fontWeight: 600 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="pos"
                                    stroke="#000"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#000', strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Analysis: Lists */}
            <div className="dash-content-scaled optimized">
                <div className="activity-feed scaled-up recent-docs">
                    <div className="section-header-row">
                        <h3 className="section-title">Recent Documents</h3>
                        <Link to="/dashboard/history" className="see-all-link">See All</Link>
                    </div>
                    <div className="activity-list">
                        {invoices.slice(0, 4).map(inv => (
                            <div key={inv.id} className="activity-item">
                                <div className="activity-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                </div>
                                <div className="activity-info">
                                    <div className="activity-name">{inv.customer} <span className="activity-type-label">({inv.type})</span></div>
                                    <div className="activity-meta">{inv.id} • {inv.date} • ${inv.total.toLocaleString()}</div>
                                </div>
                                <Link to={`/dashboard/extract/${inv.groupId}`} className={`activity-status ${inv.status.toLowerCase() === 'processed' ? 'success' : ''}`}>
                                    {inv.status}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="top-partners-box scaled-up business-partners">
                    <div className="section-header-row">
                        <div className="title-with-icon">
                            <span className="header-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                            </span>
                            <h3 className="section-title">Top Business Partners</h3>
                        </div>
                        <Link to="/dashboard/partners" className="see-all-link">See All</Link>
                    </div>

                    <div className="partners-table">
                        <div className="partners-table-header">
                            <div className="table-col">PARTNER</div>
                            <div className="table-col">CATEGORY</div>
                            <div className="table-col">RATE</div>
                            <div className="table-col text-right">VOLUME</div>
                        </div>
                        <div className="partners-list-table">
                            {stats.topSuppliers.map((sup, idx) => (
                                <div key={idx} className="partner-table-row">
                                    <div className="table-col partner-info">
                                        <div className="partner-avatar-mini">{sup.name.charAt(0)}</div>
                                        <span className="partner-name-bold">{sup.name}</span>
                                    </div>
                                    <div className="table-col partner-category">Supplier</div>
                                    <div className="table-col partner-rate-col">
                                        <div className="partner-volume-bar">
                                            <div
                                                className="volume-fill"
                                                style={{ width: `${(sup.volume / parseFloat(stats.totalAmount.replace(/,/g, '')) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="rate-pct">{Math.round((sup.volume / parseFloat(stats.totalAmount.replace(/,/g, '')) * 100))}%</span>
                                    </div>
                                    <div className="table-col partner-total text-right">${sup.volume.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
