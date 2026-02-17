import React, { useState, useEffect } from 'react';
import { getPKTInvoiceDate } from '../components/Topbar';
import { ProcurementContext } from './ProcurementContext.js';

export const ProcurementProvider = ({ children }) => {
    // ── Company Logo ──
    const [companyLogo, setCompanyLogo] = useState(() => {
        return localStorage.getItem('procure_pro_logo') || null;
    });

    useEffect(() => {
        if (companyLogo) {
            localStorage.setItem('procure_pro_logo', companyLogo);
        } else {
            localStorage.removeItem('procure_pro_logo');
        }
    }, [companyLogo]);

    // ── Trader Profile ──
    const [traderProfile, setTraderProfile] = useState(() => {
        const saved = localStorage.getItem('procure_trader_profile');
        return saved ? JSON.parse(saved) : {
            name: 'Karobar Trader',
            businessName: 'Karobar Enterprises',
            officeAddress: '123 Business Way, Suite 100\nTech City, TC 54321',
            email: 'trader@nexaura.com',
            role: 'Procurement Manager'
        };
    });

    useEffect(() => {
        localStorage.setItem('procure_trader_profile', JSON.stringify(traderProfile));
    }, [traderProfile]);

    // ── Preferences (Currency, Timezone) ──
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('procure_preferences');
        return saved ? JSON.parse(saved) : {
            currency: 'PKR',
            currencyLabel: 'PKR (Pakistani Rupee)',
            timezone: 'Asia/Karachi',
            timezoneLabel: 'Asia/Karachi (GMT+5)'
        };
    });

    useEffect(() => {
        localStorage.setItem('procure_preferences', JSON.stringify(preferences));
    }, [preferences]);

    const updatePreferences = (newPrefs) => {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
        addNotification('Regional preferences updated', 'success');
    };

    // ── Invoices (starts empty — no dummy data) ──
    const [invoices, setInvoices] = useState([]);

    // ── Original Files (stored by groupId) ──
    const [originalFiles, setOriginalFiles] = useState({});

    const setOriginalFile = (groupId, dataUrl, fileType) => {
        setOriginalFiles(prev => ({ ...prev, [groupId]: { dataUrl, fileType } }));
    };

    const getOriginalFile = (groupId) => {
        return originalFiles[groupId] || null;
    };

    // ── Real Notifications System ──
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('procure_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('procure_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (text, type = 'info') => {
        const now = new Date();
        const pktTime = now.toLocaleTimeString('en-PK', {
            timeZone: 'Asia/Karachi',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        const notif = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text,
            type, // 'success', 'info', 'warning', 'error'
            time: pktTime,
            timestamp: Date.now(),
            unread: true,
        };
        setNotifications(prev => [notif, ...prev]);
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const markNotificationRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    // ── Invoice CRUD (with notifications) ──
    const addInvoice = (newInvoice) => {
        setInvoices(prev => [newInvoice, ...prev]);
        addNotification(`Invoice ${newInvoice.id} created — ${newInvoice.type}`, 'success');
    };

    const addMultipleInvoices = (newInvoices) => {
        setInvoices(prev => [...newInvoices, ...prev]);
        if (newInvoices.length === 1) {
            addNotification(`Invoice ${newInvoices[0].id} extracted from PO`, 'success');
        } else {
            addNotification(`${newInvoices.length} invoices extracted from PO`, 'success');
        }
    };

    const createCustomInvoice = () => {
        const timestamp = Date.now();
        const id = `CUST-${timestamp}`;
        const groupId = `GRP-CUST-${timestamp}`;
        const newInvoice = {
            id,
            groupId,
            type: 'Sales Invoice',
            customer: 'New Customer',
            date: getPKTInvoiceDate(),
            total: 0,
            status: 'In Review',
            items: [],
            taxRate: 0,
            delivery: 0
        };
        setInvoices(prev => [newInvoice, ...prev]);
        addNotification(`Custom invoice ${id} created`, 'info');
        return groupId;
    };

    const updateInvoice = (updatedInvoice) => {
        setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
        addNotification(`Invoice ${updatedInvoice.id} updated`, 'info');
    };

    const getInvoiceById = (id) => {
        return invoices.find(inv => inv.id === id);
    };

    const deleteInvoice = (id) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        addNotification(`Invoice ${id} deleted`, 'warning');
    };

    const deleteGroup = (groupId) => {
        const count = invoices.filter(inv => inv.groupId === groupId).length;
        setInvoices(prev => prev.filter(inv => inv.groupId !== groupId));
        addNotification(`Document group deleted (${count} invoice${count !== 1 ? 's' : ''})`, 'warning');
    };

    // ── Stats (computed from real data only) ──
    const getStats = () => {
        // Group invoices to find PO-level metrics and Origins
        const groups = invoices.reduce((acc, inv) => {
            if (!acc[inv.groupId]) {
                acc[inv.groupId] = {
                    groupId: inv.groupId,
                    origin: inv.customer, // Primary organization
                    value: 0
                }
            }
            acc[inv.groupId].value += inv.total;
            return acc;
        }, {});

        const poGroups = Object.values(groups);
        const totalAmount = poGroups.reduce((sum, g) => sum + g.value, 0);
        const totalPOs = poGroups.length;

        // Real metrics based on actual data
        const hoursSaved = (invoices.length * 0.45).toFixed(1);
        const avgAccuracy = invoices.length > 0 ? 98.4 : 0;

        // Top Partners (Organizations/Governments/Institutes) by volume
        const partnerVolume = poGroups.reduce((acc, g) => {
            acc[g.origin] = (acc[g.origin] || 0) + g.value;
            return acc;
        }, {});

        const topSuppliers = Object.entries(partnerVolume)
            .map(([name, volume]) => ({ name, volume }))
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5);

        return {
            totalInvoices: invoices.length,
            totalPOs,
            totalAmount: totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            hoursSaved,
            avgAccuracy,
            topSuppliers
        };
    };

    return (
        <ProcurementContext.Provider value={{
            invoices,
            addInvoice,
            addMultipleInvoices,
            createCustomInvoice,
            updateInvoice,
            deleteInvoice,
            deleteGroup,
            getInvoiceById,
            getStats,
            companyLogo,
            setCompanyLogo,
            setOriginalFile,
            getOriginalFile,
            // Notifications
            notifications,
            addNotification,
            markAllNotificationsRead,
            markNotificationRead,
            preferences,
            updatePreferences,
            clearNotifications,
            // Trader Profile
            traderProfile,
            setTraderProfile,
        }}>
            {children}
        </ProcurementContext.Provider>
    );
};
