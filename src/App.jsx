import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import InvoiceUpload from './pages/InvoiceUpload'
import InvoiceHistory from './pages/InvoiceHistory'
import InvoiceEditor from './pages/InvoiceEditor'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div className="page-wrapper">
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
            <Route path="upload" element={<InvoiceUpload />} />
            <Route path="extract/:groupId" element={<InvoiceUpload />} />
            <Route path="history" element={<InvoiceHistory />} />
            <Route path="edit/:id" element={<InvoiceEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
