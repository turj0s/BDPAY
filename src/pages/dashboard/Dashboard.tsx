import { TrendingUp, Clock, CheckCircle, Activity } from 'lucide-react'

const Dashboard = () => {
  // Mock data
  const stats = [
    { label: "Today's Volume", value: '৳45,230.00', icon: TrendingUp, color: 'text-primary' },
    { label: 'Pending Verifications', value: '3', icon: Clock, color: 'text-yellow-600', badge: true },
    { label: 'Approval Rate', value: '94.2%', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Transactions', value: '1,247', icon: Activity, color: 'text-blue-600' },
  ]
  
  const pendingTransactions = [
    { id: 1, trxId: 'BK240101ABC', provider: 'bkash', amount: 1500, customer: 'Karim Rahman', submitted: '2 min ago' },
    { id: 2, trxId: 'NG240102XYZ', provider: 'nagad', amount: 2300, customer: 'Fatima Begum', submitted: '5 min ago' },
    { id: 3, trxId: 'RK240103DEF', provider: 'rocket', amount: 850, customer: 'Ahmed Ali', submitted: '12 min ago' },
  ]
  
  const recentTransactions = [
    { id: 4, trxId: 'UP240104GHI', provider: 'upay', amount: 3200, customer: 'Nusrat Jahan', status: 'approved', time: '1 hour ago' },
    { id: 5, trxId: 'BK240105JKL', provider: 'bkash', amount: 950, customer: 'Rafiq Ahmed', status: 'approved', time: '2 hours ago' },
  ]
  
  const getProviderClass = (provider: string) => {
    const classes: Record<string, string> = {
      bkash: 'provider-bkash',
      nagad: 'provider-nagad',
      rocket: 'provider-rocket',
      upay: 'provider-upay',
    }
    return classes[provider] || ''
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg mb-2">Overview</h1>
        <p className="body-md text-ink-mute">Your payment dashboard at a glance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card-feature">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color}`}>
                  <Icon size={24} />
                </div>
                {stat.badge && (
                  <span className="pill-tag-soft status-pending">!</span>
                )}
              </div>
              <p className="caption text-ink-mute mb-1">{stat.label}</p>
              <p className="display-md tabular">{stat.value}</p>
            </div>
          )
        })}
      </div>
      
      {/* Pending Approvals */}
      <div className="card-dashboard">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading-lg mb-1">Pending Approvals</h2>
            <p className="body-md text-ink-mute">Payments waiting for your verification</p>
          </div>
          {pendingTransactions.length > 0 && (
            <span className="pill-tag-soft status-pending">{pendingTransactions.length} pending</span>
          )}
        </div>
        
        {pendingTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="caption text-left py-3 px-4">TRX ID</th>
                  <th className="caption text-left py-3 px-4">Provider</th>
                  <th className="caption text-right py-3 px-4">Amount</th>
                  <th className="caption text-left py-3 px-4">Customer</th>
                  <th className="caption text-left py-3 px-4">Submitted</th>
                  <th className="caption text-right py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-hairline hover:bg-canvas-soft transition-colors">
                    <td className="body-tabular py-4 px-4">{txn.trxId}</td>
                    <td className="py-4 px-4">
                      <span className={`pill-tag-soft ${getProviderClass(txn.provider)}`}>
                        {txn.provider}
                      </span>
                    </td>
                    <td className="body-tabular text-right py-4 px-4">৳{txn.amount.toLocaleString()}.00</td>
                    <td className="body-md py-4 px-4">{txn.customer}</td>
                    <td className="body-md text-ink-mute py-4 px-4">{txn.submitted}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <button className="button-primary text-sm px-4 py-2">
                          ✓ Approve
                        </button>
                        <button className="button-secondary text-sm px-4 py-2">
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-primary-bg-subdued mb-4 flex justify-center">
              <CheckCircle size={48} />
            </div>
            <h3 className="heading-md mb-2">No pending verifications</h3>
            <p className="body-md text-ink-mute">You're all caught up!</p>
          </div>
        )}
      </div>
      
      {/* Recent Transactions */}
      <div className="card-dashboard">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-lg">Recent Transactions</h2>
          <a href="/dashboard/transactions" className="link-on-light body-md">
            View all →
          </a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="caption text-left py-3 px-4">TRX ID</th>
                <th className="caption text-left py-3 px-4">Provider</th>
                <th className="caption text-right py-3 px-4">Amount</th>
                <th className="caption text-left py-3 px-4">Customer</th>
                <th className="caption text-left py-3 px-4">Status</th>
                <th className="caption text-left py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-hairline hover:bg-canvas-soft transition-colors">
                  <td className="body-tabular py-4 px-4">{txn.trxId}</td>
                  <td className="py-4 px-4">
                    <span className={`pill-tag-soft ${getProviderClass(txn.provider)}`}>
                      {txn.provider}
                    </span>
                  </td>
                  <td className="body-tabular text-right py-4 px-4">৳{txn.amount.toLocaleString()}.00</td>
                  <td className="body-md py-4 px-4">{txn.customer}</td>
                  <td className="py-4 px-4">
                    <span className="pill-tag-soft status-approved">approved</span>
                  </td>
                  <td className="body-md text-ink-mute py-4 px-4">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Volume Chart Placeholder */}
      <div className="card-dashboard">
        <h2 className="heading-lg mb-6">14-Day Volume</h2>
        <div className="h-64 flex items-center justify-center bg-canvas-soft rounded-md">
          <p className="body-md text-ink-mute">Chart will be implemented with Recharts</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
