import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import Login from './pages/Login'
import PublicCheckout from './pages/PublicCheckout'
import Dashboard from './pages/dashboard/Dashboard'
import Transactions from './pages/dashboard/Transactions'
import Wallets from './pages/dashboard/Wallets'
import CheckoutLinks from './pages/dashboard/CheckoutLinks'
import APIKeys from './pages/dashboard/APIKeys'
import DashboardLayout from './components/DashboardLayout'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/checkout/:sessionId" element={<PublicCheckout />} />
      
      {/* Dashboard Routes - Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="checkout" element={<CheckoutLinks />} />
        <Route path="api" element={<APIKeys />} />
      </Route>
    </Routes>
  )
}

export default App
