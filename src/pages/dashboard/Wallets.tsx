import { useState, useEffect } from 'react'
import { Plus, Trash2, QrCode, X, Copy, CheckCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'

type Wallet = Database['public']['Tables']['wallets']['Row']

const Wallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null)
  const [merchantId, setMerchantId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    provider: 'bkash' as 'bkash' | 'nagad' | 'rocket' | 'upay',
    wallet_number: '',
    account_type: 'personal' as 'personal' | 'merchant' | 'agent',
    display_name: '',
  })

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
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
        .from('wallets')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWallets(data || [])
    } catch (error) {
      console.error('Error fetching wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!merchantId) return

    try {
      const { error } = await supabase.from('wallets').insert({
        merchant_id: merchantId,
        provider: formData.provider,
        wallet_number: formData.wallet_number,
        account_type: formData.account_type,
        display_name: formData.display_name || null,
      })

      if (error) throw error

      setShowAddModal(false)
      setFormData({
        provider: 'bkash',
        wallet_number: '',
        account_type: 'personal',
        display_name: '',
      })
      fetchWallets()
    } catch (error: any) {
      alert(error.message || 'Error adding wallet')
    }
  }

  const handleToggleActive = async (walletId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('wallets')
        .update({ is_active: !currentStatus })
        .eq('id', walletId)

      if (error) throw error
      fetchWallets()
    } catch (error) {
      console.error('Error toggling wallet status:', error)
    }
  }

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return

    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletId)

      if (error) throw error
      fetchWallets()
    } catch (error) {
      console.error('Error deleting wallet:', error)
    }
  }

  const copyToClipboard = (text: string, walletId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedWallet(walletId)
    setTimeout(() => setCopiedWallet(null), 2000)
  }

  const openQRModal = (wallet: Wallet) => {
    setSelectedWallet(wallet)
    setShowQRModal(true)
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      bkash: 'bg-[#E2136E]',
      nagad: 'bg-[#F26522]',
      rocket: 'bg-[#8B008B]',
      upay: 'bg-[#00A651]',
    }
    return colors[provider] || 'bg-primary'
  }

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      upay: 'Upay',
    }
    return names[provider] || provider
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg mb-2">Wallets</h1>
          <p className="body-md text-ink-mute">Manage your payment wallet numbers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="button-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Wallet
        </button>
      </div>

      {/* Wallets Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-md text-ink-mute">Loading wallets...</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="card-dashboard text-center py-12">
          <div className="text-primary-bg-subdued mb-4 flex justify-center">
            <QrCode size={48} />
          </div>
          <h3 className="heading-md mb-2">Add your first wallet</h3>
          <p className="body-md text-ink-mute mb-6">
            Add a bKash, Nagad, Rocket, or Upay number to start accepting payments.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="button-primary mx-auto"
          >
            <Plus size={20} />
            Add Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`card-feature relative ${!wallet.is_active ? 'opacity-60' : ''}`}
            >
              {/* Provider Badge */}
              <div className={`absolute top-4 right-4 ${getProviderColor(wallet.provider)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                {getProviderName(wallet.provider)}
              </div>

              <div className="pt-8">
                {/* Display Name */}
                {wallet.display_name && (
                  <h3 className="heading-md mb-2">{wallet.display_name}</h3>
                )}

                {/* Wallet Number */}
                <div className="mb-4">
                  <p className="caption text-ink-mute mb-1">WALLET NUMBER</p>
                  <div className="flex items-center gap-2">
                    <p className="body-tabular text-lg">{wallet.wallet_number}</p>
                    <button
                      onClick={() => copyToClipboard(wallet.wallet_number, wallet.id)}
                      className="text-primary hover:text-primary-deep transition-colors"
                      title="Copy wallet number"
                    >
                      {copiedWallet === wallet.id ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Type */}
                <div className="mb-6">
                  <span className="pill-tag-soft">
                    {wallet.account_type}
                  </span>
                </div>

                {/* QR Code Preview */}
                <div className="bg-canvas-soft p-4 rounded-lg mb-4 flex justify-center">
                  <QRCodeSVG value={wallet.wallet_number} size={120} />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openQRModal(wallet)}
                    className="button-secondary flex-1 justify-center text-sm"
                  >
                    <QrCode size={16} />
                    View QR
                  </button>
                  <button
                    onClick={() => handleToggleActive(wallet.id, wallet.is_active)}
                    className={`button-secondary flex-1 justify-center text-sm ${
                      wallet.is_active ? '' : 'bg-yellow-50 border-yellow-300'
                    }`}
                  >
                    {wallet.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDeleteWallet(wallet.id)}
                    className="button-secondary px-3 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-canvas rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-hairline">
                <div className="flex items-center justify-between">
                  <h2 className="heading-lg">Add Wallet</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-ink-mute hover:text-ink transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddWallet} className="p-6 space-y-4">
                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Provider</label>
                  <select
                    className="input"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                    required
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="upay">Upay</option>
                  </select>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    Wallet Number
                  </label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="01712345678"
                    value={formData.wallet_number}
                    onChange={(e) => setFormData({ ...formData, wallet_number: e.target.value })}
                    pattern="01[3-9][0-9]{8}"
                    title="Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)"
                    required
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Format: 01XXXXXXXXX
                  </p>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Account Type</label>
                  <select
                    className="input"
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                    required
                  >
                    <option value="personal">Personal</option>
                    <option value="merchant">Merchant</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Main bKash Account"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="button-secondary flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button-primary flex-1 justify-center"
                  >
                    Add Wallet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedWallet && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowQRModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-canvas rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b border-hairline">
                <div className="flex items-center justify-between">
                  <h2 className="heading-lg">QR Code</h2>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-ink-mute hover:text-ink transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 text-center">
                <div className={`inline-block ${getProviderColor(selectedWallet.provider)} text-white px-4 py-2 rounded-full text-sm font-medium mb-4`}>
                  {getProviderName(selectedWallet.provider)}
                </div>

                {selectedWallet.display_name && (
                  <h3 className="heading-md mb-2">{selectedWallet.display_name}</h3>
                )}

                <p className="body-tabular text-xl mb-6">{selectedWallet.wallet_number}</p>

                <div className="bg-canvas-soft p-8 rounded-lg inline-block mb-6">
                  <QRCodeSVG value={selectedWallet.wallet_number} size={256} />
                </div>

                <p className="body-md text-ink-mute mb-6">
                  Customers can scan this QR code to get your wallet number
                </p>

                <button
                  onClick={() => copyToClipboard(selectedWallet.wallet_number, selectedWallet.id)}
                  className="button-primary mx-auto"
                >
                  {copiedWallet === selectedWallet.id ? (
                    <>
                      <CheckCircle size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Wallet Number
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Wallets
