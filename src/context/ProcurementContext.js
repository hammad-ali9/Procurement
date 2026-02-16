import { createContext, useContext } from 'react';

export const ProcurementContext = createContext();

export const useProcurement = () => {
    const context = useContext(ProcurementContext);
    if (!context) {
        throw new Error('useProcurement must be used within a ProcurementProvider');
    }
    return context;
};
