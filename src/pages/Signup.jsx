import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './LoginSignup.css'

export default function Signup() {
    const [form, setForm] = useState({ fullName: '', businessName: '', email: '', password: '', confirmPassword: '' })
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        // Mock signup logic
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
                        <h1 className="auth-title-large">Create your account.</h1>
                        <p className="auth-subtitle-new">Join Thousands of Businesses managing their procurement on Trippel.</p>

                        <form className="auth-form-new" onSubmit={handleSubmit}>
                            <div className="input-group-new">
                                <label>Full Name</label>
                                <input type="text" placeholder="John Doe" value={form.fullName} onChange={update('fullName')} required />
                            </div>
                            <div className="input-group-new">
                                <label>Business Name</label>
                                <input type="text" placeholder="Acme Corp" value={form.businessName} onChange={update('businessName')} required />
                            </div>
                            <div className="input-group-new">
                                <label>Email</label>
                                <input type="email" placeholder="john@acme.com" value={form.email} onChange={update('email')} required />
                            </div>
                            <div className="input-group-new">
                                <label>Password</label>
                                <input type="password" placeholder="•••••••••••••" value={form.password} onChange={update('password')} required />
                            </div>

                            <button type="submit" className="btn-main-auth">Create Account</button>
                        </form>

                        <p className="auth-footer-new">
                            Already have an account? <Link to="/login" title="Login to your account" className="switch-link">Login now!</Link>
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
                            <h2 className="branding-title">Join the Family</h2>
                            <p className="branding-sub">Start your journey today and experience the best procurement management system.</p>
                        </div>

                        <div className="auth-chips-row">
                            <span className="auth-chip"><span className="chip-icon orange">#</span> Grow_Fast</span>
                            <span className="auth-chip"><span className="chip-icon green">#</span> Trippel.</span>
                            <span className="auth-chip"><span className="chip-icon blue">#</span> Secure</span>
                            <span className="auth-chip"><span className="chip-icon pink">#</span> Family</span>
                        </div>
                    </div>

                    <div className="auth-stats-card">
                        <h2 className="stats-val">10k+</h2>
                        <p className="stats-desc">Businesses already joined the platform</p>
                        <button className="stats-btn">Join Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
