import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProcurement } from '../context/ProcurementContext.js'
import './LoginSignup.css'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login, loginWithGoogle } = useAuth()
    const { addNotification } = useProcurement()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setError('')
            setLoading(true)
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            addNotification('Failed to login: ' + err.message, 'error')
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
            addNotification('Failed to sign in with Google: ' + err.message, 'error')
        }
        setLoading(false)
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
                        <span className="brand-name">Karobar.</span>
                    </div>

                    <div className="auth-content-left">
                        <h1 className="auth-title-large">Welcome back to Karobar.</h1>
                        <p className="auth-subtitle-new">Login to manage your procurement and supplier relationships seamlessly.</p>

                        <div className="social-auth-row">
                            <button className="btn-google-auth full-width" onClick={handleGoogle} disabled={loading}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                                Login with Google
                            </button>
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
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="•••••••••••••"
                                        value={form.password}
                                        onChange={update('password')}
                                        required
                                    />
                                    <span className="pass-eye" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="form-options">
                                <Link to="/forgot-password" title="Recover your account" className="forgot-link">Forgot Password?</Link>
                            </div>

                            <button type="submit" className="btn-main-auth" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
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
                            <span className="brand-name white">Karobar.</span>
                        </div>

                        <div className="auth-center-branding">
                            <h2 className="branding-title">We are a Family</h2>
                            <p className="branding-sub">In camp we have a lot people with different life story that help you feel more better in trip</p>
                        </div>

                        <div className="auth-chips-row">
                            <span className="auth-chip"><span className="chip-icon orange">#</span> Karobar._Trip</span>
                            <span className="auth-chip"><span className="chip-icon green">#</span> Karobar.</span>
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
