import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '../context/ProcurementContext';
import './ProfileCompletionModal.css';

export default function ProfileCompletionModal() {
    const navigate = useNavigate();
    const { isProfileComplete } = useProcurement();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Don't show modal if already on settings page
        if (window.location.pathname.includes('/settings')) {
            setIsVisible(false);
            return;
        }

        // Check if profile is incomplete
        if (!isProfileComplete()) {
            // Check if explicitly dismissed
            const isDismissed = localStorage.getItem('profile_modal_dismissed_v1');
            if (!isDismissed) {
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 1500);
                return () => clearTimeout(timer);
            }
        } else {
            // Profile is now complete, hide if visible
            setIsVisible(false);
        }
    }, [isProfileComplete]);

    const handleComplete = () => {
        setIsVisible(false);
        navigate('/dashboard/settings');
    };

    const handleLater = () => {
        setIsVisible(false);
        localStorage.setItem('profile_modal_dismissed_v1', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="pcm-overlay">
            <div className="pcm-card animate-fadeIn">
                <div className="pcm-icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M19 8v6M16 11h6" />
                    </svg>
                </div>
                <h2>Complete Your Profile</h2>
                <p>To generate professional invoices and manage procurements, please provide your business identifiers, bank details, and official stamp.</p>
                <div className="pcm-actions">
                    <button className="btn-complete-profile" onClick={handleComplete}>
                        Update Profile Now
                    </button>
                    <button className="btn-remind-later" onClick={handleLater}>
                        Remind Me Later
                    </button>
                </div>
            </div>
        </div>
    );
}
