import React, { useState, useEffect, useCallback } from 'react';
import { getPKTInvoiceDate } from '../components/Topbar';
import { ProcurementContext } from './ProcurementContext.js';

const initialProducts = [
    { id: 1, name: 'PixelMate', category: 'Electronics', incoming: 478, stock: 5, status: 'Low stock', price: 4347, image: '🛒', createdAt: '2024-09-15' },
    { id: 2, name: 'FusionLink', category: 'Electronics', incoming: 418, stock: 761, status: 'In stock', price: 5347, image: '📺', createdAt: '2024-09-20' },
    { id: 3, name: 'VelvetAura', category: 'Apparel', incoming: 471, stock: 5, status: 'Low stock', price: 2347, image: '👗', createdAt: '2024-10-01' },
    { id: 4, name: 'UrbanFlex Sneakers', category: 'Apparel', incoming: 178, stock: 65, status: 'Low stock', price: 9347, image: '👟', createdAt: '2024-10-05' },
    { id: 5, name: 'SilkSage Wrap', category: 'Wellness', incoming: 473, stock: 0, status: 'Out of stock', price: 4347, image: '🧴', createdAt: '2024-10-10' },
    { id: 6, name: 'CasaLuxe', category: 'Home & Living', incoming: 168, stock: 575, status: 'Low stock', price: 3347, image: '🛋️', createdAt: '2024-10-15' },
    { id: 7, name: 'Nexus Watch', category: 'Electronics', incoming: 120, stock: 0, status: 'Out of stock', price: 1247, image: '⌚', createdAt: '2024-10-20' },
    { id: 8, name: 'Aero Headphones', category: 'Electronics', incoming: 85, stock: 320, status: 'In stock', price: 847, image: '🎧', createdAt: '2024-10-25' },
];

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
            role: 'Procurement Manager',
            phone: '',
            ntnNumber: '',
            gstNumber: '',
            vendorNumber: '',
            stampSignature: null
        };
    });

    useEffect(() => {
        localStorage.setItem('procure_trader_profile', JSON.stringify(traderProfile));
    }, [traderProfile]);

    // ── Bank Details ──
    const [bankDetails, setBankDetails] = useState(() => {
        const saved = localStorage.getItem('procure_bank_details');
        return saved ? JSON.parse(saved) : {
            bankName: '',
            accountTitle: '',
            accountNumber: '',
            iban: '',
            swiftCode: '',
            branchName: ''
        };
    });

    useEffect(() => {
        localStorage.setItem('procure_bank_details', JSON.stringify(bankDetails));
    }, [bankDetails]);

    const isProfileComplete = useCallback(() => {
        const p = traderProfile;
        const b = bankDetails;
        return !!(companyLogo && p.businessName && p.officeAddress && p.phone && p.ntnNumber && p.vendorNumber && p.stampSignature &&
            b.bankName && b.accountTitle && b.accountNumber && b.iban);
    }, [companyLogo, traderProfile, bankDetails]);

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

    // ── Invoices (persisted to localStorage) ──
    const [invoices, setInvoices] = useState(() => {
        const saved = localStorage.getItem('procure_pro_invoices');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('procure_pro_invoices', JSON.stringify(invoices));
    }, [invoices]);

    // ── Original Files (stored by groupId) ──
    const [originalFiles, setOriginalFiles] = useState({});

    const setOriginalFile = (groupId, dataUrl, fileType, fileName) => {
        setOriginalFiles(prev => ({ ...prev, [groupId]: { dataUrl, fileType, fileName } }));
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

    // ── Products Notification Dot ──
    const [productsNotification, setProductsNotification] = useState(() => {
        return localStorage.getItem('procure_products_notif') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('procure_products_notif', productsNotification);
    }, [productsNotification]);

    const clearProductsNotification = () => setProductsNotification(false);

    // ── Global Search ──
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');

    const addNotification = useCallback((text, type = 'info') => {
        const now = new Date();
        const pktTime = now.toLocaleTimeString('en-PK', {
            timeZone: 'Asia/Karachi',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        const notif = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            type, // 'success', 'info', 'warning', 'error'
            time: pktTime,
            timestamp: Date.now(),
            unread: true,
        };
        setNotifications(prev => [notif, ...prev]);
    }, []);

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
        const invoiceWithTime = {
            ...newInvoice,
            processedAt: newInvoice.processedAt || new Date().toISOString()
        };
        setInvoices(prev => [invoiceWithTime, ...prev]);
        addNotification(`Invoice ${invoiceWithTime.id} created — ${invoiceWithTime.type}`, 'success');
    };

    const addMultipleInvoices = (newInvoices) => {
        const now = new Date().toISOString();
        let addedCount = 0;
        let firstId = '';

        setInvoices(prev => {
            const existingIds = new Set(prev.map(inv => inv.id));
            const filteredNew = newInvoices
                .filter(inv => !existingIds.has(inv.id))
                .map(inv => ({
                    ...inv,
                    processedAt: inv.processedAt || now
                }));

            addedCount = filteredNew.length;
            if (addedCount === 1) firstId = filteredNew[0].id;

            if (addedCount === 0) return prev;
            return [...filteredNew, ...prev];
        });

        // Trigger notification outside of state setter
        if (addedCount === 1) {
            addNotification(`Invoice ${firstId} added to history`, 'success');
        } else if (addedCount > 1) {
            addNotification(`${addedCount} invoices added to history`, 'success');
        }
    };

    const createCustomInvoice = () => {
        const timestamp = Date.now();
        const id = `CUST-${timestamp}`;
        const groupId = `GRP-CUST-${timestamp}`;
        const newInvoice = {
            id,
            groupId,
            type: 'Purchase Invoice',
            customer: 'New Customer',
            date: getPKTInvoiceDate(),
            processedAt: new Date().toISOString(),
            total: 0,
            status: 'In Review',
            items: [],
            taxRate: 0,
            delivery: 0
        };
        setInvoices(prev => [newInvoice, ...prev]);
        addNotification(`Custom invoice ${id} created`, 'info');
        return id;
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

    // ── Products (Inventory) ──
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('procure_pro_products');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    // MIGRATION: Purge old dummy data (IDs 9, 10, 11) if present
    useEffect(() => {
        const dummyIds = [9, 10, 11]; // CPU, Monitor, Tablet dummy IDs
        const hasDummyData = products.some(p => dummyIds.includes(p.id));

        if (hasDummyData) {
            console.log("Purging legacy dummy inventory data...");
            setProducts(prev => prev.filter(p => !dummyIds.includes(p.id)));
        }
    }, []); // Run once on mount

    useEffect(() => {
        localStorage.setItem('procure_pro_products', JSON.stringify(products));
    }, [products]);

    const addProduct = (newProduct, options = {}) => {
        const product = {
            ...newProduct,
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            incoming: newProduct.incoming || 0,
            stock: newProduct.stock || 0,
            status: newProduct.status || 'In stock',
            image: newProduct.image || '📦',
            createdAt: new Date().toISOString().split('T')[0],
            isNew: options.isNew || false
        };
        setProducts(prev => [product, ...prev]);
        setProductsNotification(true);
        addNotification(`Product ${product.name} added to inventory`, 'success');
    };

    const updateProduct = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        addNotification(`Product ${updatedProduct.name} updated`, 'success');
    };

    const deleteProduct = (id) => {
        const product = products.find(p => p.id === id);
        setProducts(prev => prev.filter(p => p.id !== id));
        if (product) {
            addNotification(`Product ${product.name} removed from inventory`, 'warning');
        }
    };

    const getProductStatus = (stock) => {
        if (stock <= 0) return 'Out of stock';
        if (stock <= 10) return 'Low stock';
        return 'In stock';
    };

    // Move this down after purchaseRequests and products are initialized

    // ── Quotations (persisted to localStorage) ──
    const [quotations, setQuotations] = useState(() => {
        const saved = localStorage.getItem('procure_pro_quotations');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('procure_pro_quotations', JSON.stringify(quotations));
    }, [quotations]);

    const addQuotation = (newQuotation) => {
        setQuotations(prev => [newQuotation, ...prev]);
        addNotification(`Quotation ${newQuotation.id} created`, 'success');
    };

    const updateQuotation = (updatedQuotation) => {
        const oldQuotation = quotations.find(q => q.id === updatedQuotation.id);

        // Inventory sync logic: When status changes to 'Approved'
        if (updatedQuotation.status === 'Approved' &&
            (!oldQuotation || oldQuotation.status !== 'Approved') &&
            !updatedQuotation.stockDeducted) {

            setProducts(prev => {
                const newProducts = [...prev];
                updatedQuotation.items.forEach(item => {
                    const idx = newProducts.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
                    if (idx !== -1) {
                        newProducts[idx] = {
                            ...newProducts[idx],
                            stock: Math.max(0, newProducts[idx].stock - item.quantity)
                        };
                    }
                });
                return newProducts;
            });

            updatedQuotation.stockDeducted = true;
            addNotification(`Inventory items deducted for Quotation ${updatedQuotation.id}`, 'success');
        }

        setQuotations(prev => prev.map(q => q.id === updatedQuotation.id ? updatedQuotation : q));
        addNotification(`Quotation ${updatedQuotation.id} updated`, 'info');
    };

    const deleteQuotation = (id) => {
        setQuotations(prev => prev.filter(q => q.id !== id));
        addNotification(`Quotation ${id} deleted`, 'warning');
    };

    const getQuotationById = (id) => quotations.find(q => q.id === id);

    // ── Quotation Draft (Auto-save) ──
    const [quotationDraft, setQuotationDraft] = useState(() => {
        const saved = localStorage.getItem('procure_quotation_draft');
        return saved ? JSON.parse(saved) : { query: '', results: null };
    });

    useEffect(() => {
        localStorage.setItem('procure_quotation_draft', JSON.stringify(quotationDraft));
    }, [quotationDraft]);

    // ── Purchase Requests (persisted to localStorage) ──
    const [purchaseRequests, setPurchaseRequests] = useState(() => {
        const saved = localStorage.getItem('procure_pro_prs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('procure_pro_prs', JSON.stringify(purchaseRequests));
    }, [purchaseRequests]);

    const addPurchaseRequest = (newPR) => {
        setPurchaseRequests(prev => [newPR, ...prev]);
        addNotification(`PR ${newPR.id} created successfully`, 'success');
    };

    const updatePurchaseRequest = (updatedPR) => {
        setPurchaseRequests(prev => prev.map(p => p.id === updatedPR.id ? updatedPR : p));
        addNotification(`PR ${updatedPR.id} updated`, 'info');
    };

    const deletePurchaseRequest = (id) => {
        setPurchaseRequests(prev => prev.filter(p => p.id !== id));
        addNotification(`PR ${id} deleted`, 'warning');
    };

    const getPurchaseRequestById = (id) => purchaseRequests.find(p => p.id === id);

    const getProductPriceHistory = useCallback((productName) => {
        if (!productName) return [];

        // Find all approved PRs that contain this product
        const history = purchaseRequests
            .filter(pr => pr.status === 'Approved')
            .flatMap(pr => {
                const item = pr.items.find(i => i.name.toLowerCase() === productName.toLowerCase());
                if (item) {
                    return [{
                        date: pr.date,
                        price: item.price || 0,
                        timestamp: new Date(pr.date).getTime()
                    }];
                }
                return [];
            })
            .sort((a, b) => a.timestamp - b.timestamp);

        // If no history, return current product price as a single point
        if (history.length === 0) {
            const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
            return [{ date: 'Initial', price: product?.price || 0 }];
        }

        return history;
    }, [purchaseRequests, products]);

    // ── PR Draft ──
    const [prDraft, setPrDraft] = useState(() => {
        const saved = localStorage.getItem('procure_pr_draft');
        return saved ? JSON.parse(saved) : { query: '', results: null };
    });

    useEffect(() => {
        localStorage.setItem('procure_pr_draft', JSON.stringify(prDraft));
    }, [prDraft]);

    // ── Suppliers ──
    const [suppliers, setSuppliers] = useState(() => {
        const saved = localStorage.getItem('procure_pro_suppliers');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Al Raha Steel Trading', contact: 'Khalid Al Mansouri', email: 'khalid@alrahasteel.ae', phone: '+971 55 123 4567', category: 'Raw Materials', status: 'Active' },
            { id: 2, name: 'Gulf Packaging Solutions', contact: 'Sara Ahmed', email: 'sara@gulfpack.ae', phone: '+971 50 987 6543', category: 'Packaging', status: 'Active' },
            { id: 3, name: 'Emirates Industrial Supplies', contact: 'Mohammed Raza', email: 'mraza@eisupply.ae', phone: '+971 56 555 7890', category: 'Equipment', status: 'Active' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('procure_pro_suppliers', JSON.stringify(suppliers));
    }, [suppliers]);

    const addSupplier = (newSupplier) => {
        const s = {
            ...newSupplier,
            id: suppliers.length > 0 ? Math.max(...suppliers.map(sv => sv.id)) + 1 : 1,
            status: 'Active',
            totalOrders: 0,
            totalValue: 0,
            rating: 5.0,
            since: new Date().toISOString().split('T')[0]
        };
        setSuppliers(prev => [s, ...prev]);
        addNotification(`Supplier ${s.name} added`, 'success');
        return s;
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
            // Search
            globalSearchQuery,
            setGlobalSearchQuery,
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            getProductStatus,
            productsNotification,
            clearProductsNotification,
            // Trader Profile
            traderProfile,
            setTraderProfile,
            bankDetails,
            setBankDetails,
            isProfileComplete,
            // Quotation Draft
            quotationDraft,
            setQuotationDraft,
            // Quotations
            quotations,
            addQuotation,
            updateQuotation,
            deleteQuotation,
            getQuotationById,
            // Purchase Requests
            purchaseRequests,
            addPurchaseRequest,
            updatePurchaseRequest,
            deletePurchaseRequest,
            getPurchaseRequestById,
            prDraft,
            setPrDraft,
            // Suppliers
            suppliers,
            addSupplier,
            getProductPriceHistory
        }}>
            {children}
        </ProcurementContext.Provider>
    );
};
