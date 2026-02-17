import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProcurement } from '../context/ProcurementContext.js'
import './LoginSignup.css'

export default function Signup() {
    const [form, setForm] = useState({ fullName: '', businessName: '', officeAddress: '', email: '', password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [logo, setLogo] = useState(null)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const { signup, loginWithGoogle, updateUserProfile, logout } = useAuth()
    const { setCompanyLogo, setTraderProfile, addNotification } = useProcurement()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match')
        }

        try {
            setError('')
            setLoading(true)
            await signup(form.email, form.password)
            // Update profile with name
            await updateUserProfile(form.fullName)

            // Sync business info to ProcurementContext
            if (logo) setCompanyLogo(logo)
            setTraderProfile(prev => ({
                ...prev,
                name: form.fullName,
                businessName: form.businessName,
                officeAddress: form.officeAddress,
                email: form.email
            }))

            addNotification('Account created successfully! Please login.', 'success')
            await logout() // Sign out so they can log in manually
            navigate('/login')
        } catch (err) {
            addNotification('Failed to create an account: ' + err.message, 'error')
        }
        setLoading(false)
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogo(reader.result)
            }
            reader.readAsDataURL(file)
        }
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
                {/* Left Side: Form */}
                <div className="auth-left">
                    <div className="auth-brand-new">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <span className="brand-name">Karobar.</span>
                    </div>

                    <div className="auth-content-left">
                        <h1 className="auth-title-large">Create your account.</h1>
                        <p className="auth-subtitle-new">Join Thousands of Businesses managing their procurement on Karobar.</p>

                        <button type="button" className="btn-google-auth" onClick={handleGoogle} disabled={loading}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                            Sign up with Google
                        </button>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

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
                                <label>Office Address</label>
                                <textarea
                                    placeholder="123 Business St, City, Country"
                                    value={form.officeAddress}
                                    onChange={update('officeAddress')}
                                    required
                                    rows="2"
                                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', padding: '0.2rem 0', resize: 'none' }}
                                />
                            </div>
                            <div className="input-group-new">
                                <label>Email</label>
                                <input type="email" placeholder="john@acme.com" value={form.email} onChange={update('email')} required />
                            </div>

                            <div className="input-row-new">
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

                                <div className="input-group-new">
                                    <label>Confirm Password</label>
                                    <div className="pass-wrap">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="•••••••••••••"
                                            value={form.confirmPassword}
                                            onChange={update('confirmPassword')}
                                            required
                                        />
                                        <span className="pass-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group-new">
                                <label>Company Logo</label>
                                <div className="signup-logo-uploader">
                                    <div className="signup-logo-preview" onClick={() => fileInputRef.current.click()}>
                                        {logo ? (
                                            <img src={logo} alt="Logo" />
                                        ) : (
                                            <div className="logo-placeholder">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span>Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                        accept="image/*"
                                        hidden
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-main-auth" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
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
                            <span className="brand-name white">Karobar.</span>
                        </div>

                        <div className="auth-center-branding">
                            <h2 className="branding-title">Join the Family</h2>
                            <p className="branding-sub">Start your journey today and experience the best procurement management system.</p>
                        </div>

                        <div className="auth-chips-row">
                            <span className="auth-chip"><span className="chip-icon orange">#</span> Grow_Fast</span>
                            <span className="auth-chip"><span className="chip-icon green">#</span> Karobar.</span>
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
