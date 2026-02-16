import './Topbar.css'

export default function Topbar() {
    return (
        <div className="topbar">
            {/* Left Header - if any, image shows breadcrumbs or space */}
            <div className="topbar-left">
                <div className="topbar-crumb">New report</div>
            </div>

            {/* Centered Search */}
            <div className="topbar-search">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><line x1="12" y1="12" x2="18" y2="18" /></svg>
                <input type="text" placeholder="Try searching 'insights'" className="topbar-search-input" />
            </div>

            {/* Right Actions */}
            <div className="topbar-right">
                <div className="topbar-timeframe">
                    <span className="tf-label">Timeframe</span>
                    <button className="tf-btn">Sep 1 - Nov 30, 2023 <span className="arrow">∨</span></button>
                </div>
                <div className="topbar-user-group">
                    <button className="tb-action-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></button>
                    <div className="tb-avatar">
                        <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" />
                    </div>
                </div>
                <button className="tb-plus-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
            </div>
        </div>
    )
}
