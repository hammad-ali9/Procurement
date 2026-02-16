import React, { useState, useEffect } from 'react';
import { ProcurementContext } from './ProcurementContext.js';

export const ProcurementProvider = ({ children }) => {
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

    const [invoices, setInvoices] = useState([
        {
            id: 'INV-2024-001', groupId: 'GRP-2024-001', type: 'Sales Invoice', customer: 'Global Tech Solutions', date: 'Feb 16, 2024', total: 4295, status: 'Processed', items: [
                { id: 1, desc: 'Enterprise Server Rack', qty: 1, rate: 2400 },
                { id: 2, desc: 'Managed Switch 48-Port', qty: 2, rate: 850 },
            ], taxRate: 15, delivery: 45
        },
        {
            id: 'INV-2024-002', groupId: 'GRP-2024-002', type: 'Purchase Invoice', customer: 'Almansoori Medical', date: 'Feb 15, 2024', total: 1850.20, status: 'In Review', items: [
                { id: 1, desc: 'Medical Grade Monitor', qty: 1, rate: 1200 },
                { id: 2, desc: 'Ergonomic Stand', qty: 1, rate: 450 },
            ], taxRate: 10, delivery: 25
        },
        {
            id: 'INV-2024-003', groupId: 'GRP-2024-003', type: 'Delivery Invoice', customer: 'Nexaura Products', date: 'Feb 14, 2024', total: 12400, status: 'Sent', items: [
                { id: 1, desc: 'Development Licenses', qty: 10, rate: 1000 },
                { id: 2, desc: 'Cloud Support Pack', qty: 1, rate: 2400 },
            ], taxRate: 0, delivery: 0
        },
    ]);

    const addInvoice = (newInvoice) => {
        setInvoices(prev => [newInvoice, ...prev]);
    };

    const addMultipleInvoices = (newInvoices) => {
        setInvoices(prev => [...newInvoices, ...prev]);
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
            date: new Date().toLocaleDateString(),
            total: 0,
            status: 'In Review',
            items: [],
            taxRate: 0,
            delivery: 0
        };
        addInvoice(newInvoice);
        return groupId;
    };

    const updateInvoice = (updatedInvoice) => {
        setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    };

    const getInvoiceById = (id) => {
        return invoices.find(inv => inv.id === id);
    };

    const getStats = () => {
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const uniqueGroups = new Set(invoices.map(inv => inv.groupId));
        const totalPOs = uniqueGroups.size;

        // Mock ROI and Accuracy metrics based on invoice count
        const hoursSaved = (invoices.length * 0.45).toFixed(1); // 45 mins saved per doc
        const avgAccuracy = 98.4;

        // Calculate Top Customers (Suppliers)
        const customerVolume = invoices.reduce((acc, inv) => {
            acc[inv.customer] = (acc[inv.customer] || 0) + inv.total;
            return acc;
        }, {});

        const topSuppliers = Object.entries(customerVolume)
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

    const deleteInvoice = (id) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
    };

    const deleteGroup = (groupId) => {
        setInvoices(prev => prev.filter(inv => inv.groupId !== groupId));
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
            setCompanyLogo
        }}>
            {children}
        </ProcurementContext.Provider>
    );
};
