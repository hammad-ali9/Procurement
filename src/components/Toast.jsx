import React, { useState, useEffect } from 'react';
import { useProcurement } from '../context/ProcurementContext';
import './Toast.css';

export default function Toast() {
    const { notifications } = useProcurement();
    const [activeToasts, setActiveToasts] = useState([]);

    useEffect(() => {
        // Find the most recent unread notification
        const latestNotif = notifications[0];
        if (latestNotif && latestNotif.unread) {
            // Check if we already have this toast
            if (!activeToasts.find(t => t.id === latestNotif.id)) {
                setActiveToasts(prev => [...prev, latestNotif]);

                // Auto dismiss after 4 seconds
                setTimeout(() => {
                    removeToast(latestNotif.id);
                }, 4000);
            }
        }
    }, [notifications]);

    const removeToast = (id) => {
        setActiveToasts(prev => prev.filter(t => t.id !== id));
    };

    if (activeToasts.length === 0) return null;

    return (
        <div className="toast-container">
            {activeToasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'info' && 'i'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'warning' && '!'}
                    </div>
                    <div className="toast-content">
                        {toast.text}
                    </div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
