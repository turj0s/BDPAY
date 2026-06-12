import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Link as LinkIcon, 
  Key, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const DashboardLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }
  
  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
    { path: '/dashboard/wallets', label: 'Wallets', icon: Wallet },
    { path: '/dashboard/checkout', label: 'Checkout Links', icon: LinkIcon },
    { path: '/dashboard/api', label: 'API Keys', icon: Key },
    { path: '/dashboard/team', label: 'Team', icon: Users },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]
  
  return (
    <div className="flex min-h-screen bg-canvas-soft">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex-shrink-0 fixed h-full">
        <div className="p-6">
          <Link to="/" className="text-2xl font-light block mb-12">BDPay</Link>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    active 
                      ? 'bg-primary text-white border-l-4 border-primary-soft' 
                      : 'text-ink-mute hover:bg-brand-dark/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="body-md">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-64 p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="body-md truncate">Your Business</p>
              <p className="caption text-ink-mute truncate">{user?.email}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-ink-mute hover:text-white transition-colors ml-2"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
