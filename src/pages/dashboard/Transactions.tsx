import { useState, useEffect } from 'react'
import { Search, Filter, Download, X, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [statusFilter, providerFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Get current merchant
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!merchant) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (providerFilter !== 'all') {
        query = query.eq('provider', providerFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (transactionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', transactionId)

      if (error) throw error
      
      fetchTransactions()
      if (selectedTransaction?.id === transactionId) {
        setDetailDrawerOpen(false)
      }
    } catch (error) {
      console.error('Error approving transaction:', error)
    }
  }

  const handleReject = async (transactionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', transactionId)

      if (error) throw error
      
      fetchTransactions()
      if (selectedTransaction?.id === transactionId) {
        setDetailDrawerOpen(false)
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error)
    }
  }

  const handleBulkApprove = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .in('id', selectedTransactions)

      if (error) throw error
      
      setSelectedTransactions([])
      fetchTransactions()
    } catch (error) {
      console.error('Error bulk approving:', error)
    }
  }

  const handleBulkReject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .in('id', selectedTransactions)

      if (error) throw error
      
      setSelectedTransactions([])
      fetchTransactions()
    } catch (error) {
      console.error('Error bulk rejecting:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['TrxID', 'Provider', 'Amount', 'Currency', 'Customer Name', 'Customer Phone', 'Order ID', 'Status', 'Date']
    const rows = filteredTransactions.map(txn => [
      txn.trx_id,
      txn.provider,
      txn.amount,
      txn.currency,
      txn.customer_name || '',
      txn.customer_phone || '',
      txn.order_id || '',
      txn.status,
      new Date(txn.created_at).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const openDetailDrawer = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailDrawerOpen(true)
  }

  const toggleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(txnId => txnId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map(txn => txn.id))
    }
  }

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.trx_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.order_id?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const getProviderClass = (provider: string) => {
    const classes: Record<string, string> = {
      bkash: 'provider-bkash',
      nagad: 'provider-nagad',
      rocket: 'provider-rocket',
      upay: 'provider-upay',
    }
    return classes[provider] || ''
  }

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      refunded: 'status-refunded',
    }
    return classes[status] || ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="display-lg mb-2">Transactions</h1>
        <p className="body-md text-ink-mute">View and manage all your payment transactions</p>
      </div>

      {/* Filters and Search */}
      <div className="card-dashboard">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-mute" size={20} />
            <input
              type="text"
              placeholder="Search by TrxID, customer name, or order ID..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-ink-mute" />
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Provider Filter */}
          <select
            className="input"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="all">All Providers</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="upay">Upay</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="button-secondary flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="card-dashboard bg-primary/5 border-2 border-primary">
          <div className="flex items-center justify-between">
            <p className="body-md">
              {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBulkApprove}
                className="button-primary"
              >
                Approve All
              </button>
              <button
                onClick={handleBulkReject}
                className="button-secondary"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelectedTransactions([])}
                className="button-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card-dashboard">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="body-md text-ink-mute">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="text-primary-bg-subdued mx-auto mb-4" />
            <h3 className="heading-md mb-2">No transactions found</h3>
            <p className="body-md text-ink-mute">
              {searchQuery || statusFilter !== 'all' || providerFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Transactions will appear here once customers start making payments'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === filteredTransactions.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="caption text-left py-3 px-4">TRX ID</th>
                  <th className="caption text-left py-3 px-4">Provider</th>
                  <th className="caption text-right py-3 px-4">Amount</th>
                  <th className="caption text-left py-3 px-4">Customer</th>
                  <th className="caption text-left py-3 px-4">Order ID</th>
                  <th className="caption text-left py-3 px-4">Status</th>
                  <th className="caption text-left py-3 px-4">Date</th>
                  <th className="caption text-right py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-hairline hover:bg-canvas-soft transition-colors cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).type !== 'checkbox' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                        openDetailDrawer(txn)
                      }
                    }}
                  >
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(txn.id)}
                        onChange={() => toggleSelectTransaction(txn.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="body-tabular py-4 px-4">{txn.trx_id}</td>
                    <td className="py-4 px-4">
                      <span className={`pill-tag-soft ${getProviderClass(txn.provider)}`}>
                        {txn.provider}
                      </span>
                    </td>
                    <td className="body-tabular text-right py-4 px-4">
                      ৳{Number(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="body-md py-4 px-4">{txn.customer_name || '—'}</td>
                    <td className="body-md py-4 px-4">{txn.order_id || '—'}</td>
                    <td className="py-4 px-4">
                      <span className={`pill-tag-soft ${getStatusClass(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="body-md text-ink-mute py-4 px-4">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      {txn.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(txn.id)}
                            className="button-primary text-xs px-3 py-1.5"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(txn.id)}
                            className="button-secondary text-xs px-3 py-1.5"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Drawer */}
      {detailDrawerOpen && selectedTransaction && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDetailDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-canvas shadow-2xl z-50 overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="heading-lg mb-2">Transaction Details</h2>
                  <span className={`pill-tag-soft ${getStatusClass(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <button
                  onClick={() => setDetailDrawerOpen(false)}
                  className="text-ink-mute hover:text-ink transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <p className="caption text-ink-mute mb-1">TRANSACTION ID</p>
                  <div className="flex items-center gap-2">
                    <p className="body-tabular">{selectedTransaction.trx_id}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedTransaction.trx_id)}
                      className="text-primary hover:text-primary-deep text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <p className="caption text-ink-mute mb-1">PROVIDER</p>
                  <span className={`pill-tag-soft ${getProviderClass(selectedTransaction.provider)}`}>
                    {selectedTransaction.provider}
                  </span>
                </div>

                <div>
                  <p className="caption text-ink-mute mb-1">AMOUNT</p>
                  <p className="display-md tabular">
                    ৳{Number(selectedTransaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="body-md text-ink-mute">{selectedTransaction.currency}</p>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="heading-md mb-4">Customer Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="caption text-ink-mute mb-1">NAME</p>
                      <p className="body-md">{selectedTransaction.customer_name || '—'}</p>
                    </div>

                    <div>
                      <p className="caption text-ink-mute mb-1">PHONE</p>
                      <p className="body-md">{selectedTransaction.customer_phone || '—'}</p>
                    </div>

                    <div>
                      <p className="caption text-ink-mute mb-1">EMAIL</p>
                      <p className="body-md">{selectedTransaction.customer_email || '—'}</p>
                    </div>

                    <div>
                      <p className="caption text-ink-mute mb-1">ORDER ID</p>
                      <p className="body-md">{selectedTransaction.order_id || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-hairline pt-6">
                  <h3 className="heading-md mb-4">Timeline</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="caption text-ink-mute mb-1">SUBMITTED</p>
                      <p className="body-md">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                    </div>

                    {selectedTransaction.verified_at && (
                      <div>
                        <p className="caption text-ink-mute mb-1">VERIFIED</p>
                        <p className="body-md">{new Date(selectedTransaction.verified_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTransaction.notes && (
                  <div className="border-t border-hairline pt-6">
                    <h3 className="heading-md mb-4">Notes</h3>
                    <p className="body-md text-ink-mute">{selectedTransaction.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {selectedTransaction.status === 'pending' && (
                  <div className="border-t border-hairline pt-6 space-y-3">
                    <button
                      onClick={() => handleApprove(selectedTransaction.id)}
                      className="button-primary w-full justify-center"
                    >
                      <CheckCircle size={20} />
                      Approve Transaction
                    </button>
                    <button
                      onClick={() => handleReject(selectedTransaction.id)}
                      className="button-secondary w-full justify-center"
                    >
                      <XCircle size={20} />
                      Reject Transaction
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Transactions
