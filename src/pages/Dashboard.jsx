import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useProcurement } from '../context/ProcurementContext.js'
import './Dashboard.css'

export default function Dashboard() {
    const { invoices, getStats } = useProcurement();
    const stats = getStats();
    const [timeframe, setTimeframe] = useState('months'); // 'days', 'months', 'years'

    // Build chart data dynamically from real invoices
    const chartData = useMemo(() => {
        if (invoices.length === 0) return [];

        if (timeframe === 'days') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayMap = {};
            dayNames.forEach(d => { dayMap[d] = { name: d, volume: 0, pos: 0 }; });
            invoices.forEach(inv => {
                const d = new Date(inv.date);
                if (!isNaN(d)) {
                    const day = dayNames[d.getDay()];
                    dayMap[day].volume += inv.total;
                    dayMap[day].pos += 1;
                }
            });
            return Object.values(dayMap);
        } else if (timeframe === 'years') {
            const yearMap = {};
            invoices.forEach(inv => {
                const d = new Date(inv.date);
                if (!isNaN(d)) {
                    const yr = d.getFullYear().toString();
                    if (!yearMap[yr]) yearMap[yr] = { name: yr, volume: 0, pos: 0 };
                    yearMap[yr].volume += inv.total;
                    yearMap[yr].pos += 1;
                }
            });
            return Object.values(yearMap).sort((a, b) => a.name.localeCompare(b.name));
        }
        // Default: months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthMap = {};
        invoices.forEach(inv => {
            const d = new Date(inv.date);
            if (!isNaN(d)) {
                const m = monthNames[d.getMonth()];
                if (!monthMap[m]) monthMap[m] = { name: m, volume: 0, pos: 0, idx: d.getMonth() };
                monthMap[m].volume += inv.total;
                monthMap[m].pos += 1;
            }
        });
        return Object.values(monthMap).sort((a, b) => a.idx - b.idx);
    }, [timeframe, invoices]);

    // Group invoices by Document History (Extraction Groups)
    const groupedHistory = useMemo(() => {
        const groups = invoices.reduce((acc, inv) => {
            if (!acc[inv.groupId]) {
                acc[inv.groupId] = {
                    groupId: inv.groupId,
                    customer: inv.customer, // Primary organization/Origin
                    date: inv.processedAt || inv.date, // Use AI processing time
                    status: inv.status,
                    docCount: 0,
                    totalValue: 0,
                    type: inv.type
                }
            }
            acc[inv.groupId].docCount += 1
            acc[inv.groupId].totalValue += inv.total
            if (inv.status === 'In Review') acc[inv.groupId].status = 'In Review'
            return acc
        }, {})
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4)
    }, [invoices])

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-chart-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-value">
                        {payload[0].name === 'volume' ? `Rs. ${payload[0].value.toLocaleString()}` : `${payload[0].value} POs`}
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
                    <div className="stat-value">Rs. {stats.totalAmount}</div>
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
                        {groupedHistory.map(group => (
                            <div key={group.groupId} className="activity-item">
                                <div className="activity-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                </div>
                                <div className="activity-info">
                                    <div className="activity-name">{group.customer} <span className="activity-type-label">({group.docCount} Documents)</span></div>
                                    <div className="activity-meta">{group.groupId} • {group.date} • Rs. {group.totalValue.toLocaleString()}</div>
                                </div>
                                <Link to={`/dashboard/extract/${group.groupId}`} className={`activity-status ${group.status.toLowerCase().replace(' ', '-')}`}>
                                    {group.status}
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
                                    <div className="table-col partner-total text-right">Rs. {sup.volume.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
