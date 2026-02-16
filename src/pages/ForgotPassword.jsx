import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './LoginSignup.css'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        alert('Reset link sent to ' + email)
        navigate('/login')
    }

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
                        <h1 className="auth-title-large">Reset your password.</h1>
                        <p className="auth-subtitle-new">Enter your email address and we'll send you a link to reset your password.</p>

                        <form className="auth-form-new" onSubmit={handleSubmit}>
                            <div className="input-group-new">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-main-auth">Send Reset Link</button>
                        </form>

                        <p className="auth-footer-new">
                            Remembered your password? <Link to="/login" title="Return to login" className="switch-link">Back to login</Link>
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
                            <h2 className="branding-title">Security First</h2>
                            <p className="branding-sub">We take your account security seriously. Follow the link in your email to safely reset your password.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
