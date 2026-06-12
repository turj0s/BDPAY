import { useState, useEffect } from 'react'
import { Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']

interface DailyVolume {
  date: string
  amount: number
  count: number
}

interface ProviderStats {
  provider: string
  count: number
  amount: number
}

const Analytics = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7') // days
  const [dailyData, setDailyData] = useState<DailyVolume[]>([])
  const [providerData, setProviderData] = useState<ProviderStats[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!merchant) return

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error
      setTransactions(data || [])
      
      processAnalyticsData(data || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (txns: Transaction[]) => {
    // Process daily volume
    const dailyMap = new Map<string, { amount: number; count: number }>()
    
    txns.forEach(txn => {
      const date = new Date(txn.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { amount: 0, count: 0 })
      }
      
      const current = dailyMap.get(date)!
      current.amount += Number(txn.amount)
      current.count += 1
    })

    const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    }))
    setDailyData(daily)

    // Process provider breakdown
    const providerMap = new Map<string, { count: number; amount: number }>()
    
    txns.forEach(txn => {
      if (!providerMap.has(txn.provider)) {
        providerMap.set(txn.provider, { count: 0, amount: 0 })
      }
      
      const current = providerMap.get(txn.provider)!
      current.count += 1
      current.amount += Number(txn.amount)
    })

    const providers = Array.from(providerMap.entries()).map(([provider, data]) => ({
      provider,
      count: data.count,
      amount: data.amount
    }))
    setProviderData(providers)
  }

  const exportCSV = () => {
    const headers = ['Date', 'TrxID', 'Provider', 'Amount', 'Status', 'Customer', 'Order ID']
    const rows = transactions.map(txn => [
      new Date(txn.created_at).toLocaleDateString(),
      txn.trx_id,
      txn.provider,
      txn.amount,
      txn.status,
      txn.customer_name || '',
      txn.order_id || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Calculate summary stats
  const totalVolume = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0)
  const approvedCount = transactions.filter(txn => txn.status === 'approved').length
  const rejectedCount = transactions.filter(txn => txn.status === 'rejected').length
  const approvalRate = transactions.length > 0 
    ? ((approvedCount / transactions.length) * 100).toFixed(1) 
    : '0'
  const avgTransaction = transactions.length > 0 
    ? (totalVolume / transactions.length).toFixed(2) 
    : '0'

  // Provider colors
  const PROVIDER_COLORS: Record<string, string> = {
    bkash: '#E2136E',
    nagad: '#F26522',
    rocket: '#8B008B',
    upay: '#00A651',
  }

  const getProviderColor = (provider: string) => PROVIDER_COLORS[provider] || '#533afd'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="display-lg mb-2">Analytics</h1>
          <p className="body-md text-ink-mute">Understand your payment patterns and performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-ink-mute" />
            <select
              className="input"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          
          <button
            onClick={exportCSV}
            className="button-secondary flex items-center gap-2"
            disabled={transactions.length === 0}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-md text-ink-mute">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-feature">
              <p className="caption text-ink-mute mb-2">TOTAL VOLUME</p>
              <p className="display-md tabular mb-1">
                ৳{totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp size={14} />
                <span>{transactions.length} transactions</span>
              </div>
            </div>

            <div className="card-feature">
              <p className="caption text-ink-mute mb-2">APPROVED</p>
              <p className="display-md tabular mb-1">{approvedCount}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <span>{approvalRate}% approval rate</span>
              </div>
            </div>

            <div className="card-feature">
              <p className="caption text-ink-mute mb-2">REJECTED</p>
              <p className="display-md tabular mb-1">{rejectedCount}</p>
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <TrendingDown size={14} />
                <span>{((rejectedCount / (transactions.length || 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="card-feature">
              <p className="caption text-ink-mute mb-2">AVG TRANSACTION</p>
              <p className="display-md tabular mb-1">৳{avgTransaction}</p>
              <p className="text-sm text-ink-mute">Per transaction</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="card-dashboard text-center py-12">
              <p className="heading-md mb-2">No data available</p>
              <p className="body-md text-ink-mute">
                Analytics will appear once you have transactions in the selected date range
              </p>
            </div>
          ) : (
            <>
              {/* Daily Volume Chart */}
              <div className="card-dashboard">
                <h2 className="heading-lg mb-6">Daily Transaction Volume</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 13, fill: '#64748d' }}
                      stroke="#e3e8ee"
                    />
                    <YAxis 
                      tick={{ fontSize: 13, fill: '#64748d' }}
                      stroke="#e3e8ee"
                      tickFormatter={(value) => `৳${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e3e8ee',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      formatter={(value: number) => [
                        `৳${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        'Amount'
                      ]}
                    />
                    <Bar dataKey="amount" fill="#533afd" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Approval Rate Trend */}
              <div className="card-dashboard">
                <h2 className="heading-lg mb-6">Approval Rate Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 13, fill: '#64748d' }}
                      stroke="#e3e8ee"
                    />
                    <YAxis 
                      tick={{ fontSize: 13, fill: '#64748d' }}
                      stroke="#e3e8ee"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e3e8ee',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#533afd" 
                      strokeWidth={2}
                      dot={{ fill: '#533afd', r: 4 }}
                      name="Transactions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Provider Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="card-dashboard">
                  <h2 className="heading-lg mb-6">Provider Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={providerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ provider, percent }) => 
                          `${provider}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {providerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getProviderColor(entry.provider)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e3e8ee',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Provider Stats Table */}
                <div className="card-dashboard">
                  <h2 className="heading-lg mb-6">Provider Performance</h2>
                  <div className="space-y-4">
                    {providerData.map((provider) => (
                      <div key={provider.provider} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getProviderColor(provider.provider) }}
                          />
                          <div>
                            <p className="body-md capitalize">{provider.provider}</p>
                            <p className="caption text-ink-mute">{provider.count} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="body-tabular">
                            ৳{provider.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="caption text-ink-mute">
                            {((provider.count / transactions.length) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Analytics
