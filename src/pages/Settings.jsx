import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext.js'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

export default function Settings() {
    const { currentUser, updateUserProfile, updateUserEmail, updateUserPassword, logout } = useAuth()
    const navigate = useNavigate()
    const {
        companyLogo,
        setCompanyLogo,
        traderProfile,
        setTraderProfile,
        bankDetails,
        setBankDetails,
        addNotification,
        preferences,
        updatePreferences
    } = useProcurement()

    const [activeTab, setActiveTab] = useState('profile')
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)

    // Local state for forms
    const [profileForm, setProfileForm] = useState(traderProfile)
    const [companyForm, setCompanyForm] = useState({
        name: traderProfile.businessName || '',
        email: traderProfile.email || '',
        officeAddress: traderProfile.officeAddress || '',
        phone: traderProfile.phone || '',
        taxId: traderProfile.ntnNumber || '',
        gstNumber: traderProfile.gstNumber || '',
        vendorNumber: traderProfile.vendorNumber || '',
        stampSignature: traderProfile.stampSignature || null
    })
    const [bankForm, setBankForm] = useState(bankDetails)
    const [prefForm, setPrefForm] = useState({
        currency: preferences?.currency || 'PKR',
        timezone: preferences?.timezone || 'Asia/Karachi'
    })

    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

    useEffect(() => {
        if (currentUser && activeTab === 'profile') {
            setProfileForm({
                name: currentUser.displayName || '',
                email: currentUser.email || ''
            })
        }
    }, [currentUser, activeTab])

    useEffect(() => {
        if (traderProfile && activeTab === 'company') {
            setCompanyForm({
                name: traderProfile.businessName || '',
                email: traderProfile.email || '',
                officeAddress: traderProfile.officeAddress || '',
                phone: traderProfile.phone || '',
                taxId: traderProfile.ntnNumber || '',
                gstNumber: traderProfile.gstNumber || '',
                vendorNumber: traderProfile.vendorNumber || '',
                stampSignature: traderProfile.stampSignature || null
            })
        }
    }, [traderProfile, activeTab])

    useEffect(() => {
        if (bankDetails && activeTab === 'bank') {
            setBankForm(bankDetails)
        }
    }, [bankDetails, activeTab])

    useEffect(() => {
        if (preferences && activeTab === 'preferences') {
            setPrefForm({
                currency: preferences.currency,
                timezone: preferences.timezone
            })
        }
    }, [preferences, activeTab])

    // Dirty Checks
    const isProfileDirty = profileForm.name !== (currentUser?.displayName || '') ||
        profileForm.email !== (currentUser?.email || '') ||
        profileForm.role !== (traderProfile.role || '')

    const isCompanyDirty = companyForm.name !== (traderProfile.businessName || '') ||
        companyForm.email !== (traderProfile.email || '') ||
        companyForm.officeAddress !== (traderProfile.officeAddress || '') ||
        companyForm.phone !== (traderProfile.phone || '') ||
        companyForm.taxId !== (traderProfile.ntnNumber || '') ||
        companyForm.gstNumber !== (traderProfile.gstNumber || '') ||
        companyForm.vendorNumber !== (traderProfile.vendorNumber || '') ||
        companyForm.stampSignature !== traderProfile.stampSignature

    const isBankDirty = JSON.stringify(bankForm) !== JSON.stringify(bankDetails)

    const isPrefDirty = prefForm.currency !== preferences?.currency ||
        prefForm.timezone !== preferences?.timezone

    // Preferences
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [systemNotifs, setSystemNotifs] = useState(true)

    const handlePreferencesSave = (e) => {
        e.preventDefault()
        const currencyLabels = {
            'PKR': 'PKR (Pakistani Rupee)',
            'USD': 'USD (US Dollar)',
            'EUR': 'EUR (Euro)',
            'AED': 'AED (UAE Dirham)'
        }
        const timezoneLabels = {
            'Asia/Karachi': 'Asia/Karachi (GMT+5)',
            'UTC': 'UTC (Universal Coordinated Time)',
            'America/New_York': 'America/New_York (EST)'
        }

        updatePreferences({
            currency: prefForm.currency,
            currencyLabel: currencyLabels[prefForm.currency],
            timezone: prefForm.timezone,
            timezoneLabel: timezoneLabels[prefForm.timezone]
        })
    }

    const logoutUser = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Failed to log out', error)
            addNotification('Failed to log out', 'error')
        }
    }

    const handleProfileSave = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            if (profileForm.name !== currentUser.displayName) {
                await updateUserProfile(profileForm.name, currentUser.photoURL)
            }
            if (profileForm.email !== currentUser.email) {
                await updateUserEmail(profileForm.email)
            }
            setTraderProfile(prev => ({ ...prev, ...profileForm }))
            addNotification('Changes Saved Successfully', 'success')
        } catch (error) {
            console.error(error)
            addNotification('Failed to update profile. ' + error.message, 'error')
        }
        setIsLoading(false)
    }

    const handleCompanySave = (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            setTraderProfile(prev => ({
                ...prev,
                businessName: companyForm.name,
                email: companyForm.email,
                officeAddress: companyForm.officeAddress,
                phone: companyForm.phone,
                ntnNumber: companyForm.taxId,
                gstNumber: companyForm.gstNumber,
                vendorNumber: companyForm.vendorNumber,
                stampSignature: companyForm.stampSignature
            }))
            addNotification('Changes Saved Successfully', 'success')
        } catch (error) {
            console.error(error)
            addNotification('Failed to update company details', 'error')
        }
        setIsLoading(false)
    }

    const handleBankSave = (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            setBankDetails(bankForm)
            addNotification('Changes Saved Successfully', 'success')
        } catch (error) {
            console.error(error)
            addNotification('Failed to save bank details', 'error')
        }
        setIsLoading(false)
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (passwordForm.new !== passwordForm.confirm) {
            addNotification('Passwords do not match', 'error')
            return
        }
        setIsLoading(true)
        try {
            await updateUserPassword(passwordForm.new)
            addNotification('Password changed successfully', 'success')
            setPasswordForm({ current: '', new: '', confirm: '' })
        } catch (error) {
            console.error(error)
            addNotification('Failed to update password. ' + error.message, 'error')
        }
        setIsLoading(false)
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCompanyLogo(reader.result)
                addNotification('Company logo updated', 'success')
            }
            reader.readAsDataURL(file)
        }
    }

    const handleStampUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCompanyForm(prev => ({ ...prev, stampSignature: reader.result }))
                addNotification('Official stamp uploaded', 'success')
            }
            reader.readAsDataURL(file)
        }
    }

    const triggerLogoUpload = () => {
        fileInputRef.current.click()
    }

    const removeLogo = () => {
        setCompanyLogo(null)
        addNotification('Company logo removed', 'info')
    }

    const removeStamp = () => {
        setCompanyForm(prev => ({ ...prev, stampSignature: null }))
        addNotification('Stamp removed', 'info')
    }

    return (
        <div className="settings-page animate-fadeIn">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account, company details, and preferences.</p>
            </div>

            <div className="settings-container">
                {/* Sidebar Navigation */}
                <div className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        My Profile
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'company' ? 'active' : ''}`}
                        onClick={() => setActiveTab('company')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="21" width="18" height="2" /><path d="M5 21V7l8-4 8 4v14" /><path d="M17 21v-8H7v8" /></svg>
                        Company Profile
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'bank' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bank')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                        Bank Details
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                        Preferences
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                        Security
                    </button>
                    <div className="settings-nav-divider" />
                    <button className="settings-nav-item text-red" onClick={logoutUser}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                    </button>
                </div>

                {/* Content Area */}
                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <div className="settings-panel animate-slideIn">
                            <h2>My Profile</h2>
                            <p className="settings-subtitle">Manage your personal information and role.</p>

                            <form onSubmit={handleProfileSave} className="settings-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input
                                        type="text"
                                        value={profileForm.role}
                                        onChange={e => setProfileForm({ ...profileForm, role: e.target.value })}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setProfileForm({ name: currentUser?.displayName || '', email: currentUser?.email || '' })}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={isLoading || !isProfileDirty}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'company' && (
                        <div className="settings-panel animate-slideIn">
                            <h2>Company Profile</h2>
                            <p className="settings-subtitle">Update your organization details and branding.</p>

                            <div className="logo-upload-section">
                                <label>Company Logo</label>
                                <div className="logo-uploader">
                                    <div className="current-logo">
                                        {companyLogo ? <img src={companyLogo} alt="Logo" /> : <span>No Logo</span>}
                                    </div>
                                    <div className="logo-actions">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            ref={fileInputRef}
                                            onChange={handleLogoUpload}
                                        />
                                        <button type="button" className="btn-outline" onClick={triggerLogoUpload}>Upload New</button>
                                        {companyLogo && <button type="button" className="btn-text-red" onClick={removeLogo}>Remove</button>}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleCompanySave} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            value={companyForm.name}
                                            onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                            placeholder="e.g. Karobar Enterprises"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tax ID / NTN</label>
                                        <input
                                            type="text"
                                            value={companyForm.taxId}
                                            onChange={e => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                                            placeholder="e.g. 7654321-0"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Company Email</label>
                                        <input
                                            type="email"
                                            value={companyForm.email}
                                            onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                                            placeholder="billing@company.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="text"
                                            value={companyForm.phone}
                                            onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                            placeholder="+92 XXX XXXXXXX"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>GST Number</label>
                                        <input
                                            type="text"
                                            value={companyForm.gstNumber}
                                            onChange={e => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                                            placeholder="e.g. 12-34-5678-901-23"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Vendor Number</label>
                                        <input
                                            type="text"
                                            value={companyForm.vendorNumber}
                                            onChange={(e) => setCompanyForm({ ...companyForm, vendorNumber: e.target.value })}
                                            placeholder="e.g. V-98765"
                                        />
                                        <p className="field-desc">Unique ID assigned by your clients.</p>
                                    </div>
                                    <div className="form-group">
                                        <label>Official Stamp / Signature</label>
                                        <div className="stamp-uploader">
                                            {companyForm.stampSignature ? (
                                                <div className="stamp-preview">
                                                    <img src={companyForm.stampSignature} alt="Stamp" />
                                                    <button type="button" className="btn-remove-stamp" onClick={removeStamp}>×</button>
                                                </div>
                                            ) : (
                                                <div className="stamp-dropzone">
                                                    <input type="file" accept="image/*" hidden id="stamp-upload" onChange={handleStampUpload} />
                                                    <label htmlFor="stamp-upload">Upload Stamp</label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label>Office Address</label>
                                        <textarea
                                            rows="3"
                                            value={companyForm.officeAddress}
                                            onChange={(e) => setCompanyForm({ ...companyForm, officeAddress: e.target.value })}
                                            placeholder="Full physical address..."
                                        />
                                        <p className="field-desc">This address will be automatically used as the sender address on your invoices.</p>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={isLoading || !isCompanyDirty}>
                                        {isLoading ? 'Saving...' : 'Save Organization Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'bank' && (
                        <div className="settings-panel animate-slideIn">
                            <h2>Bank Details</h2>
                            <p className="settings-subtitle">Capture your banking information for invoice payments.</p>

                            <form onSubmit={handleBankSave} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Bank Name</label>
                                        <input
                                            type="text"
                                            value={bankForm.bankName}
                                            onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                                            placeholder="e.g. Habib Bank Limited"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Title</label>
                                        <input
                                            type="text"
                                            value={bankForm.accountTitle}
                                            onChange={e => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                                            placeholder="e.g. Karobar Enterprises"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Account Number</label>
                                        <input
                                            type="text"
                                            value={bankForm.accountNumber}
                                            onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                            placeholder="000123456789"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>IBAN</label>
                                        <input
                                            type="text"
                                            value={bankForm.iban}
                                            onChange={e => setBankForm({ ...bankForm, iban: e.target.value })}
                                            placeholder="PK00HABB000123456789"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>SWIFT / BIC Code</label>
                                        <input
                                            type="text"
                                            value={bankForm.swiftCode}
                                            onChange={e => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                                            placeholder="HABBPKKA"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Branch Name / Code</label>
                                        <input
                                            type="text"
                                            value={bankForm.branchName}
                                            onChange={e => setBankForm({ ...bankForm, branchName: e.target.value })}
                                            placeholder="Main Boulevard Branch (0123)"
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={isLoading || !isBankDirty}>
                                        {isLoading ? 'Saving...' : 'Save Bank Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="settings-panel animate-slideIn">
                            <h2>System Preferences</h2>
                            <p className="settings-subtitle">Customize your regional and notification settings.</p>

                            <form onSubmit={handlePreferencesSave} className="preferences-section">
                                <h3>Regional Settings</h3>
                                <div className="pref-grid">
                                    <div className="pref-item">
                                        <label>Currency</label>
                                        <select
                                            value={prefForm.currency}
                                            onChange={(e) => setPrefForm({ ...prefForm, currency: e.target.value })}
                                        >
                                            <option value="PKR">PKR (Pakistani Rupee)</option>
                                            <option value="USD">USD (US Dollar)</option>
                                            <option value="EUR">EUR (Euro)</option>
                                            <option value="AED">AED (UAE Dirham)</option>
                                        </select>
                                        <span className="pref-note">Changes will reflect on new invoices</span>
                                    </div>
                                    <div className="pref-item">
                                        <label>Timezone</label>
                                        <select
                                            value={prefForm.timezone}
                                            onChange={(e) => setPrefForm({ ...prefForm, timezone: e.target.value })}
                                        >
                                            <option value="Asia/Karachi">Asia/Karachi (GMT+5)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="UTC">UTC (Universal Coordinated Time)</option>
                                        </select>
                                        <span className="pref-note">Affects document timestamps</span>
                                    </div>
                                </div>
                                <div className="form-actions" style={{ border: 'none', paddingTop: '1rem' }}>
                                    <button type="submit" className="btn-primary" disabled={!isPrefDirty}>Save Preferences</button>
                                </div>
                            </form>

                            <div className="preferences-section">
                                <h3>Notifications</h3>
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">Email Notifications</span>
                                        <span className="toggle-desc">Receive extracted invoice summaries via email</span>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-label">System Notifications</span>
                                        <span className="toggle-desc">Show in-app popups and badge alerts</span>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={systemNotifs} onChange={() => setSystemNotifs(!systemNotifs)} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-panel animate-slideIn">
                            <h2>Security</h2>
                            <p className="settings-subtitle">Update your password and secure your account.</p>

                            <form onSubmit={handlePasswordChange} className="settings-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.current}
                                        onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.new}
                                            onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirm}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="security-alert">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><g><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></g></svg>
                                    <div>
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Secure your account with 2FA.</p>
                                    </div>
                                    <button type="button" className="btn-outline-sm">Enable</button>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
