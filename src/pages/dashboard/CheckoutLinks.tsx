import { useState, useEffect } from 'react'
import { Plus, Copy, ExternalLink, X, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'

type CheckoutSession = Database['public']['Tables']['checkout_sessions']['Row']

const CheckoutLinks = () => {
  const [sessions, setSessions] = useState<CheckoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [merchantId, setMerchantId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: '',
    order_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    redirect_url: '',
    expiry_duration: '30', // minutes
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
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
      setMerchantId(merchant.id)

      const { data, error } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!merchantId) return

    try {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return
      }

      const expiryMinutes = parseInt(formData.expiry_duration)
      let expiresAt: string | undefined

      if (expiryMinutes > 0) {
        const expiryDate = new Date()
        expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes)
        expiresAt = expiryDate.toISOString()
      }

      const { error } = await supabase.from('checkout_sessions').insert({
        merchant_id: merchantId,
        amount,
        order_id: formData.order_id || null,
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        customer_email: formData.customer_email || null,
        redirect_url: formData.redirect_url || null,
        expires_at: expiresAt,
      })

      if (error) throw error

      setShowCreateModal(false)
      setFormData({
        amount: '',
        order_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        redirect_url: '',
        expiry_duration: '30',
      })
      fetchSessions()
    } catch (error: any) {
      alert(error.message || 'Error creating checkout session')
    }
  }

  const copyLink = (sessionId: string) => {
    const link = `${window.location.origin}/checkout/${sessionId}`
    navigator.clipboard.writeText(link)
    setCopiedLink(sessionId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const openLink = (sessionId: string) => {
    const link = `${window.location.origin}/checkout/${sessionId}`
    window.open(link, '_blank')
  }

  const getStatusColor = (session: CheckoutSession) => {
    if (session.status === 'paid') return 'status-approved'
    if (new Date(session.expires_at) < new Date()) return 'status-rejected'
    return 'status-pending'
  }

  const getStatusText = (session: CheckoutSession) => {
    if (session.status === 'paid') return 'Paid'
    if (new Date(session.expires_at) < new Date()) return 'Expired'
    return 'Active'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg mb-2">Checkout Links</h1>
          <p className="body-md text-ink-mute">Create shareable payment links for your customers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="button-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Checkout Link
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-md text-ink-mute">Loading checkout links...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card-dashboard text-center py-12">
          <div className="text-primary-bg-subdued mb-4 flex justify-center">
            <ExternalLink size={48} />
          </div>
          <h3 className="heading-md mb-2">Create checkout link</h3>
          <p className="body-md text-ink-mute mb-6">
            Share a link and get paid. No website? No problem.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="button-primary mx-auto"
          >
            <Plus size={20} />
            Create Checkout Link
          </button>
        </div>
      ) : (
        <div className="card-dashboard">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="caption text-left py-3 px-4">Amount</th>
                  <th className="caption text-left py-3 px-4">Order ID</th>
                  <th className="caption text-left py-3 px-4">Customer</th>
                  <th className="caption text-left py-3 px-4">Status</th>
                  <th className="caption text-left py-3 px-4">Created</th>
                  <th className="caption text-left py-3 px-4">Expires</th>
                  <th className="caption text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-hairline hover:bg-canvas-soft transition-colors">
                    <td className="body-tabular py-4 px-4">
                      ৳{Number(session.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="body-md py-4 px-4">{session.order_id || '—'}</td>
                    <td className="body-md py-4 px-4">
                      {session.customer_name || session.customer_email || session.customer_phone || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`pill-tag-soft ${getStatusColor(session)}`}>
                        {getStatusText(session)}
                      </span>
                    </td>
                    <td className="body-md text-ink-mute py-4 px-4">
                      {new Date(session.created_at).toLocaleDateString()}
                    </td>
                    <td className="body-md text-ink-mute py-4 px-4">
                      {new Date(session.expires_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => copyLink(session.id)}
                          className="button-secondary text-xs px-3 py-1.5"
                          title="Copy link"
                        >
                          {copiedLink === session.id ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => openLink(session.id)}
                          className="button-secondary text-xs px-3 py-1.5"
                          title="Open in new tab"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-canvas rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-hairline sticky top-0 bg-canvas">
                <div className="flex items-center justify-between">
                  <h2 className="heading-lg">Create Checkout Link</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-ink-mute hover:text-ink transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateSession} className="p-6 space-y-4">
                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    Amount (BDT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    placeholder="1500.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Order ID (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="ORDER-12345"
                    value={formData.order_id}
                    onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  />
                </div>

                <div className="border-t border-hairline pt-4">
                  <h3 className="heading-md mb-3">Customer Information (Optional)</h3>
                  <p className="body-md text-ink-mute text-sm mb-4">
                    Pre-fill customer details to make checkout faster
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="body-md block mb-2 text-ink-secondary">Customer Name</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Customer name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="body-md block mb-2 text-ink-secondary">Customer Phone</label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="01712345678"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="body-md block mb-2 text-ink-secondary">Customer Email</label>
                      <input
                        type="email"
                        className="input"
                        placeholder="customer@example.com"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-hairline pt-4">
                  <label className="body-md block mb-2 text-ink-secondary">
                    Redirect URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://yoursite.com/thank-you"
                    value={formData.redirect_url}
                    onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Where to send customers after payment
                  </p>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Expiry Duration</label>
                  <select
                    className="input"
                    value={formData.expiry_duration}
                    onChange={(e) => setFormData({ ...formData, expiry_duration: e.target.value })}
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="1440">24 hours</option>
                    <option value="10080">7 days</option>
                    <option value="0">Never expires</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="button-secondary flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button-primary flex-1 justify-center"
                  >
                    Create Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CheckoutLinks
