import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'

type CheckoutSession = Database['public']['Tables']['checkout_sessions']['Row']
type Wallet = Database['public']['Tables']['wallets']['Row']
type Merchant = Database['public']['Tables']['merchants']['Row']

const PublicCheckout = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [selectedProvider, setSelectedProvider] = useState<'bkash' | 'nagad' | 'rocket' | 'upay' | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    trx_id: '',
    amount: '',
    customer_name: '',
    customer_phone: '',
  })

  useEffect(() => {
    if (sessionId) {
      fetchCheckoutSession()
    }
  }, [sessionId])

  const fetchCheckoutSession = async () => {
    try {
      setLoading(true)

      // Fetch checkout session
      const { data: sessionData, error: sessionError } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError
      if (!sessionData) throw new Error('Checkout session not found')

      // Check if expired
      if (new Date(sessionData.expires_at) < new Date()) {
        setError('This checkout link has expired')
        setLoading(false)
        return
      }

      // Check if already paid
      if (sessionData.status === 'paid') {
        setSubmitted(true)
        setLoading(false)
        return
      }

      setSession(sessionData)

      // Pre-fill form data
      setFormData({
        trx_id: '',
        amount: sessionData.amount.toString(),
        customer_name: sessionData.customer_name || '',
        customer_phone: sessionData.customer_phone || '',
      })

      // Fetch merchant
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', sessionData.merchant_id)
        .single()

      if (merchantError) throw merchantError
      setMerchant(merchantData)

      // Fetch active wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*')
        .eq('merchant_id', sessionData.merchant_id)
        .eq('is_active', true)

      if (walletsError) throw walletsError
      setWallets(walletsData || [])

      // Auto-select first provider and wallet
      if (walletsData && walletsData.length > 0) {
        const firstProvider = walletsData[0].provider as 'bkash' | 'nagad' | 'rocket' | 'upay'
        setSelectedProvider(firstProvider)
        setSelectedWallet(walletsData[0])
      }

    } catch (error: any) {
      console.error('Error fetching checkout session:', error)
      setError(error.message || 'Failed to load checkout session')
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (provider: 'bkash' | 'nagad' | 'rocket' | 'upay') => {
    setSelectedProvider(provider)
    const wallet = wallets.find(w => w.provider === provider)
    setSelectedWallet(wallet || null)
  }

  const copyWalletNumber = () => {
    if (selectedWallet) {
      navigator.clipboard.writeText(selectedWallet.wallet_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      if (!session || !merchant || !selectedWallet) {
        throw new Error('Missing required data')
      }

      // Validate amount
      const enteredAmount = parseFloat(formData.amount)
      const sessionAmount = parseFloat(session.amount.toString())
      if (Math.abs(enteredAmount - sessionAmount) > 0.01) {
        throw new Error('Amount does not match')
      }

      // Check for duplicate TrxID
      const { data: existingTxn } = await supabase
        .from('transactions')
        .select('id')
        .eq('merchant_id', merchant.id)
        .eq('trx_id', formData.trx_id)
        .single()

      if (existingTxn) {
        throw new Error('This Transaction ID has already been submitted')
      }

      // Create transaction
      const { error: txnError } = await supabase
        .from('transactions')
        .insert({
          merchant_id: merchant.id,
          wallet_id: selectedWallet.id,
          trx_id: formData.trx_id,
          amount: enteredAmount,
          currency: 'BDT',
          customer_name: formData.customer_name || null,
          customer_phone: formData.customer_phone || null,
          order_id: session.order_id || null,
          provider: selectedProvider!,
          status: 'pending',
        })

      if (txnError) throw txnError

      // Update checkout session
      await supabase
        .from('checkout_sessions')
        .update({ status: 'submitted' })
        .eq('id', sessionId)

      setSubmitted(true)

    } catch (error: any) {
      console.error('Error submitting payment:', error)
      setError(error.message || 'Failed to submit payment')
    } finally {
      setSubmitting(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-md text-ink-mute">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error || !session || !merchant) {
    return (
      <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-6">
        <div className="card-feature max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="heading-lg mb-2">Checkout Not Available</h1>
          <p className="body-md text-ink-mute mb-6">
            {error || 'This checkout link is invalid or has expired'}
          </p>
          <Link to="/" className="button-primary mx-auto">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-6">
        <div className="card-feature max-w-md w-full text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h1 className="heading-lg mb-2">Payment Submitted!</h1>
          <p className="body-md text-ink-mute mb-4">
            Your TrxID <strong className="tabular">{formData.trx_id}</strong> has been received.
          </p>
          <p className="body-md text-ink-mute mb-6">
            The merchant will verify your payment shortly.
          </p>
          {session.redirect_url && (
            <a href={session.redirect_url} className="button-primary mx-auto">
              Continue
            </a>
          )}
        </div>
      </div>
    )
  }

  const availableProviders = Array.from(new Set(wallets.map(w => w.provider)))

  return (
    <div className="min-h-screen bg-canvas-soft py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Merchant Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-light text-primary inline-block mb-4">
            BDPay
          </Link>
          <h1 className="heading-lg mb-2">{merchant.business_name}</h1>
          <p className="body-md text-ink-mute">Secure Payment Checkout</p>
        </div>

        {/* Order Summary Card */}
        <div className="card-feature mb-6">
          <h2 className="heading-md mb-4">Order Summary</h2>
          <div className="space-y-3">
            {session.order_id && (
              <div className="flex justify-between items-center">
                <p className="body-md text-ink-mute">Order ID</p>
                <p className="body-md">{session.order_id}</p>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-hairline pt-3">
              <p className="heading-md">Total Amount</p>
              <p className="display-lg tabular">
                ৳{Number(session.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="card-feature mb-6">
          <h2 className="heading-md mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableProviders.map((provider) => (
              <button
                key={provider}
                onClick={() => handleProviderChange(provider as any)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedProvider === provider
                    ? 'border-primary bg-primary/5'
                    : 'border-hairline hover:border-primary/50'
                }`}
              >
                <div className={`${getProviderColor(provider)} text-white px-3 py-2 rounded-full text-sm font-medium`}>
                  {getProviderName(provider)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Instructions */}
        {selectedWallet && (
          <div className="card-feature mb-6">
            <h2 className="heading-md mb-6">Payment Instructions</h2>

            {/* QR Code */}
            <div className="bg-canvas-soft p-6 rounded-lg mb-6 flex flex-col items-center">
              <p className="body-md text-ink-mute mb-4">Scan to get wallet number</p>
              <QRCodeSVG value={selectedWallet.wallet_number} size={200} />
            </div>

            {/* Wallet Number */}
            <div className="mb-6">
              <p className="caption text-ink-mute mb-2">SEND MONEY TO</p>
              <div className="flex items-center gap-3 bg-canvas-soft p-4 rounded-lg">
                <p className="body-tabular text-xl flex-1">{selectedWallet.wallet_number}</p>
                <button
                  onClick={copyWalletNumber}
                  className="button-secondary"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 body-md">
                  1
                </div>
                <div>
                  <p className="body-md font-medium mb-1">Open your {getProviderName(selectedProvider!)} app</p>
                  <p className="body-md text-ink-mute text-sm">
                    Go to Send Money or আমার বাকি
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 body-md">
                  2
                </div>
                <div>
                  <p className="body-md font-medium mb-1">Send money to the wallet number above</p>
                  <p className="body-md text-ink-mute text-sm">
                    Amount: ৳{Number(session.amount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 body-md">
                  3
                </div>
                <div>
                  <p className="body-md font-medium mb-1">Enter your Transaction ID below</p>
                  <p className="body-md text-ink-mute text-sm">
                    You'll receive a TrxID after completing the payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="card-feature">
          <h2 className="heading-md mb-6">Submit Payment Details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 body-md flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="body-md block mb-2 text-ink-secondary">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter your TrxID (e.g., BK240101ABC)"
                value={formData.trx_id}
                onChange={(e) => setFormData({ ...formData, trx_id: e.target.value.toUpperCase() })}
                required
              />
              <p className="text-sm text-ink-mute mt-1">
                Find this in your {getProviderName(selectedProvider!)} transaction history
              </p>
            </div>

            <div>
              <label className="body-md block mb-2 text-ink-secondary">
                Confirm Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="Enter amount you sent"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="body-md block mb-2 text-ink-secondary">Your Name</label>
              <input
                type="text"
                className="input"
                placeholder="Your name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div>
              <label className="body-md block mb-2 text-ink-secondary">Your Phone</label>
              <input
                type="tel"
                className="input"
                placeholder="01712345678"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="button-primary w-full justify-center"
              disabled={submitting || !selectedProvider}
            >
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="body-md text-ink-mute">
            Powered by <Link to="/" className="link-on-light">BDPay</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicCheckout
