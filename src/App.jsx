import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import InvoiceUpload from './pages/InvoiceUpload'
import InvoiceHistory from './pages/InvoiceHistory'
import InvoiceEditor from './pages/InvoiceEditor'
import Products from './pages/Products'
import QuotationCreator from './pages/QuotationCreator'
import QuotationEditor from './pages/QuotationEditor'
import QuotationHistory from './pages/QuotationHistory'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { AuthProvider } from './context/AuthContext'
import { ProcurementProvider } from './context/ProcurementProvider'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div className="page-wrapper page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Procurement Workflow Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="create-quotation" element={<QuotationCreator />} />
            <Route path="upload" element={<InvoiceUpload />} />
            <Route path="extract/:groupId" element={<InvoiceUpload />} />
            <Route path="history" element={<InvoiceHistory />} />
            <Route path="quotation-history" element={<QuotationHistory />} />
            <Route path="edit/:id" element={<InvoiceEditor />} />
            <Route path="edit-quotation/:id" element={<QuotationEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
