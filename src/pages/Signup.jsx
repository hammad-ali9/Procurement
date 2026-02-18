import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProcurement } from '../context/ProcurementContext.js'
import './LoginSignup.css'

export default function Signup() {
    const [form, setForm] = useState({ fullName: '', businessName: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { signup, loginWithGoogle, updateUserProfile, logout } = useAuth()
    const { setTraderProfile, addNotification } = useProcurement()

    // Simplified signup logic matching the cleaner UI
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setError('')
            setLoading(true)
            await signup(form.email, form.password)
            await updateUserProfile(form.fullName)

            // Set defaults for business info if not gathered
            setTraderProfile(prev => ({
                ...prev,
                name: form.fullName,
                businessName: form.businessName || `${form.fullName}'s Business`,
                email: form.email
            }))

            addNotification('Account created successfully! Please login.', 'success')
            await logout()
            navigate('/login')
        } catch (err) {
            addNotification('Failed to create an account: ' + err.message, 'error')
        }
        setLoading(false)
    }

    const handleGoogle = async () => {
        try {
            setError('')
            setLoading(true)
            await loginWithGoogle()
            navigate('/dashboard')
        } catch (err) {
            setError('Failed to sign in with Google: ' + err.message)
        }
        setLoading(false)
    }

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* --- LEFT SIDE: FORM --- */}
                <div className="auth-left">
                    <div className="auth-brand-new">
                        <img src="/logo/logo.png" alt="Karobar Logo" style={{ height: '32px', width: 'auto' }} />
                        <span style={{ fontWeight: '700', fontSize: '1.25rem', marginLeft: '8px', color: '#1F2937' }}>Karobar.</span>
                    </div>

                    <div className="auth-content-left">
                        <h1 className="auth-title-large">Create an account</h1>
                        <p className="auth-subtitle-new">Sign up and get 30 day free trial</p>

                        <form className="auth-form-new" onSubmit={handleSubmit}>
                            <div className="input-group-new">
                                <label>Full name</label>
                                <input
                                    type="text"
                                    placeholder="Amélie Laurent"
                                    value={form.fullName}
                                    onChange={update('fullName')}
                                    required
                                />
                            </div>

                            {/* Kept Business Name for functional reasons but styled identically */}
                            <div className="input-group-new">
                                <label>Business Name</label>
                                <input
                                    type="text"
                                    placeholder="Laurent Designs"
                                    value={form.businessName}
                                    onChange={update('businessName')}
                                    required
                                />
                            </div>

                            <div className="input-group-new">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="amelielaurent@example.com"
                                    value={form.email}
                                    onChange={update('email')}
                                    required
                                />
                            </div>

                            <div className="input-group-new">
                                <label>Password</label>
                                <div className="pass-wrap">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="•••••••••••••"
                                        value={form.password}
                                        onChange={update('password')}
                                        required
                                    />
                                    <span className="pass-eye" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button type="submit" className="btn-main-auth" disabled={loading}>
                                {loading ? 'Creating...' : 'Submit'}
                            </button>
                        </form>

                        <div className="social-buttons-container">
                            <button className="social-btn-pill">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.03 3.96-.74 1.76.01 3.05.67 4.09 2.05-3.66 1.83-3.02 6.46.23 7.72-.66 1.64-1.57 3.55-3.36 3.2zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                                Apple
                            </button>
                            <button className="social-btn-pill" onClick={handleGoogle} disabled={loading}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </button>
                        </div>

                        <div className="auth-footer-links">
                            <Link to="/login">Have any account? <span className="footer-link highlight">Sign in</span></Link>
                            <span className="footer-link highlight">Terms & Conditions</span>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: VISUAL MOCKUP --- */}
                <div className="auth-right">
                    <div className="auth-image-container-modern">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                            alt="Team Collaboration"
                            className="auth-bg-img-modern"
                        />

                        {/* Overlay Glass Elements */}
                        <div className="glass-overlay-container">
                            {/* Task Card */}
                            <div className="glass-card-task">
                                <h4>Task Review With Team</h4>
                                <span>09:30am - 10:00am</span>
                                <div className="task-dot"></div>
                            </div>

                            {/* Calendar - Mock UI */}
                            <div className="glass-card-calendar">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>Schedule</span>
                                    <span>...</span>
                                </div>
                                <div className="calendar-row">
                                    <div className="cal-day"><span>Sun</span><span>22</span></div>
                                    <div className="cal-day"><span>Mon</span><span>23</span></div>
                                    <div className="cal-day active"><span>Tue</span><span>24</span></div>
                                    <div className="cal-day"><span>Wed</span><span>25</span></div>
                                    <div className="cal-day"><span>Thu</span><span>26</span></div>
                                </div>
                            </div>

                            {/* Meeting Card */}
                            <div className="glass-card-meeting">
                                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#1F2937' }}>Daily Meeting</h4>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>12:00pm - 01:00pm</span>
                                <div className="meeting-avatars">
                                    <img src="https://i.pravatar.cc/100?img=1" className="meeting-avatar" alt="u1" />
                                    <img src="https://i.pravatar.cc/100?img=5" className="meeting-avatar" alt="u2" />
                                    <img src="https://i.pravatar.cc/100?img=8" className="meeting-avatar" alt="u3" />
                                    <img src="https://i.pravatar.cc/100?img=12" className="meeting-avatar" alt="u4" />
                                </div>
                                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', background: '#FCD34D', borderRadius: '50%' }}></div>
                            </div>

                            {/* Floating Avatars */}
                            <div className="floating-avatars-cluster">
                                <img src="https://i.pravatar.cc/100?img=32" className="cluster-avatar" alt="u5" />
                                <img src="https://i.pravatar.cc/100?img=44" className="cluster-avatar" alt="u6" />
                                <img src="https://i.pravatar.cc/100?img=20" className="cluster-avatar" alt="u7" />
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="btn-close-circle">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
