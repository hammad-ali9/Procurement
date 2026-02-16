import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './LoginSignup.css'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        navigate('/dashboard')
    }

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side: Form */}
                <div className="auth-left">
                    <div className="auth-brand-new">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <span className="brand-name">Trippel.</span>
                    </div>

                    <div className="auth-content-left">
                        <h1 className="auth-title-large">Welcome back to Trippel.</h1>
                        <p className="auth-subtitle-new">Login to manage your procurement and supplier relationships seamlessly.</p>

                        <div className="social-auth-row">
                            <button className="social-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg></button>
                            <button className="social-btn google"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg></button>
                            <button className="social-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.857L10.286 17.57v-3h-3.43V1.714h13.715v9.429z" /></svg></button>
                        </div>

                        <div className="auth-divider">
                            <span>Or</span>
                        </div>

                        <form className="auth-form-new" onSubmit={handleSubmit}>
                            <div className="input-group-new">
                                <label>Email</label>
                                <input type="email" placeholder="email@example.com" value={form.email} onChange={update('email')} required />
                            </div>
                            <div className="input-group-new">
                                <label>Password</label>
                                <div className="pass-wrap">
                                    <input type="password" placeholder="•••••••••••••" value={form.password} onChange={update('password')} required />
                                    <span className="pass-eye">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    </span>
                                </div>
                            </div>

                            <div className="form-options">
                                <Link to="/forgot-password" title="Recover your account" className="forgot-link">Forgot Password?</Link>
                            </div>

                            <button type="submit" className="btn-main-auth">Login</button>
                        </form>

                        <p className="auth-footer-new">
                            Don't have an account? <Link to="/signup" title="Create a new account" className="switch-link">Sign up now!</Link>
                        </p>
                    </div>
                </div>

                {/* Right Side: Visual Image */}
                <div className="auth-right">
                    <div className="auth-image-wrapper">
                        <img src="/login-signup/login.jpg" alt="Background" className="auth-bg-img" />

                        <div className="auth-right-top-brand">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            <span className="brand-name white">Trippel.</span>
                        </div>

                        <div className="auth-center-branding">
                            <h2 className="branding-title">We are a Family</h2>
                            <p className="branding-sub">In camp we have a lot people with different life story that help you feel more better in trip</p>
                        </div>

                        <div className="auth-chips-row">
                            <span className="auth-chip"><span className="chip-icon orange">#</span> Trippel._Trip</span>
                            <span className="auth-chip"><span className="chip-icon green">#</span> Trippel.</span>
                            <span className="auth-chip"><span className="chip-icon blue">#</span> Be_happy</span>
                            <span className="auth-chip"><span className="chip-icon pink">#</span> Be_happy</span>
                        </div>
                    </div>

                    <div className="auth-stats-card">
                        <h2 className="stats-val">+89%</h2>
                        <p className="stats-desc">Positive respond from people</p>
                        <button className="stats-btn">Start Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
