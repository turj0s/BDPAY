import { useState, useEffect } from 'react'
import { Eye, EyeOff, Copy, RefreshCw, CheckCircle, Code, ShoppingCart, Webhook } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const APIKeys = () => {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [savingWebhook, setSavingWebhook] = useState(false)
  const [activeTab, setActiveTab] = useState<'rest' | 'woocommerce' | 'shopify' | 'webhook'>('rest')

  useEffect(() => {
    fetchMerchantData()
  }, [])

  const fetchMerchantData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id, api_key, webhook_url')
        .eq('user_id', user.id)
        .single()

      if (merchant) {
        setMerchantId(merchant.id)
        setApiKey(merchant.api_key)
        setWebhookUrl(merchant.webhook_url || '')
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate your current API key and break existing integrations.')) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('regenerate_api_key', {
        merchant_uuid: merchantId
      })

      if (error) throw error
      setApiKey(data)
      alert('API key regenerated successfully!')
    } catch (error: any) {
      alert(error.message || 'Error regenerating API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveWebhookUrl = async () => {
    try {
      setSavingWebhook(true)

      // Validate webhook URL
      if (webhookUrl && !webhookUrl.startsWith('https://')) {
        alert('Webhook URL must start with https://')
        return
      }

      const { error } = await supabase
        .from('merchants')
        .update({ webhook_url: webhookUrl || null })
        .eq('id', merchantId)

      if (error) throw error
      alert('Webhook URL saved successfully!')
    } catch (error: any) {
      alert(error.message || 'Error saving webhook URL')
    } finally {
      setSavingWebhook(false)
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 8) + '•'.repeat(key.length - 8)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="body-md text-ink-mute">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="display-lg mb-2">API Keys & Integration</h1>
        <p className="body-md text-ink-mute">Integrate BDPay into your application</p>
      </div>

      {/* API Key Card */}
      <div className="card-dashboard">
        <h2 className="heading-lg mb-4">Your API Key</h2>
        
        <div className="bg-canvas-soft p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <code className="body-tabular text-lg flex-1 font-mono">
              {showKey && apiKey ? apiKey : maskApiKey(apiKey || '')}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              className="button-secondary px-3 py-2"
              title={showKey ? 'Hide' : 'Show'}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={() => apiKey && copyToClipboard(apiKey)}
              className="button-secondary px-3 py-2"
              title="Copy"
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="body-md text-yellow-800">
            <strong>Keep your API key secure!</strong> Never share it publicly or commit it to version control.
          </p>
        </div>

        <button
          onClick={regenerateApiKey}
          className="button-secondary flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Regenerate API Key
        </button>
      </div>

      {/* Integration Tabs */}
      <div className="card-dashboard">
        <div className="border-b border-hairline mb-6">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('rest')}
              className={`pb-3 body-md flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'rest'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              <Code size={18} />
              REST API
            </button>
            <button
              onClick={() => setActiveTab('woocommerce')}
              className={`pb-3 body-md flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'woocommerce'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              <ShoppingCart size={18} />
              WooCommerce
            </button>
            <button
              onClick={() => setActiveTab('shopify')}
              className={`pb-3 body-md flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'shopify'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              <ShoppingCart size={18} />
              Shopify
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`pb-3 body-md flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'webhook'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              <Webhook size={18} />
              Webhooks
            </button>
          </div>
        </div>

        {/* REST API Tab */}
        {activeTab === 'rest' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">API Endpoint</h3>
              <div className="bg-brand-dark text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="mb-4">
                  <span className="text-green-400">POST</span> https://api.bdpay.app/v1/verify
                </div>
                <div className="text-ink-mute mb-2">Headers:</div>
                <div className="ml-4 mb-4">
                  <div>Authorization: Bearer YOUR_API_KEY</div>
                  <div>Content-Type: application/json</div>
                </div>
                <div className="text-ink-mute mb-2">Request Body:</div>
                <pre className="ml-4 text-sm">
{`{
  "trx_id": "BK240101ABC",
  "amount": 1500.00,
  "provider": "bkash",
  "order_id": "ORDER-12345",
  "customer_name": "Customer Name",
  "customer_phone": "01712345678"
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="heading-md mb-4">Response</h3>
              <div className="bg-brand-dark text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-green-400 mb-2">Success (200 OK):</div>
                <pre className="ml-4 mb-4 text-sm">
{`{
  "success": true,
  "transaction_id": "uuid",
  "status": "pending",
  "message": "Transaction submitted for verification"
}`}
                </pre>
                <div className="text-red-400 mb-2">Error (400 Bad Request):</div>
                <pre className="ml-4 text-sm">
{`{
  "success": false,
  "error": "Duplicate TrxID",
  "message": "This transaction ID has already been submitted"
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="heading-md mb-4">Example Code</h3>
              <div className="space-y-4">
                <div>
                  <p className="body-md font-medium mb-2">cURL</p>
                  <div className="bg-brand-dark text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
{`curl -X POST https://api.bdpay.app/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trx_id": "BK240101ABC",
    "amount": 1500.00,
    "provider": "bkash",
    "order_id": "ORDER-12345"
  }'`}
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="body-md font-medium mb-2">JavaScript</p>
                  <div className="bg-brand-dark text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
{`const response = await fetch('https://api.bdpay.app/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trx_id: 'BK240101ABC',
    amount: 1500.00,
    provider: 'bkash',
    order_id: 'ORDER-12345'
  })
});

const data = await response.json();
console.log(data);`}
                    </pre>
                  </div>
                </div>

                <div>
                  <p className="body-md font-medium mb-2">PHP</p>
                  <div className="bg-brand-dark text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>
{`$data = [
  'trx_id' => 'BK240101ABC',
  'amount' => 1500.00,
  'provider' => 'bkash',
  'order_id' => 'ORDER-12345'
];

$ch = curl_init('https://api.bdpay.app/v1/verify');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer YOUR_API_KEY',
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WooCommerce Tab */}
        {activeTab === 'woocommerce' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">WooCommerce Plugin Installation</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="body-md font-medium mb-2">Download the Plugin</p>
                    <button className="button-primary">
                      Download BDPay WooCommerce Plugin
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Upload to WordPress</p>
                    <p className="body-md text-ink-mute">
                      Go to WordPress Admin → Plugins → Add New → Upload Plugin
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Activate the Plugin</p>
                    <p className="body-md text-ink-mute">
                      After installation, click "Activate" on the plugins page
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Configure Settings</p>
                    <p className="body-md text-ink-mute mb-3">
                      Go to WooCommerce → Settings → Payments → BDPay
                    </p>
                    <div className="bg-canvas-soft p-4 rounded-lg">
                      <div className="mb-3">
                        <label className="body-md block mb-1">API Key</label>
                        <input
                          type="text"
                          className="input"
                          value={apiKey || ''}
                          readOnly
                        />
                      </div>
                      <button
                        onClick={() => apiKey && copyToClipboard(apiKey)}
                        className="button-secondary"
                      >
                        {copied ? 'Copied!' : 'Copy API Key'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    5
                  </div>
                  <div>
                    <p className="body-md font-medium mb-2">Test the Integration</p>
                    <p className="body-md text-ink-mute">
                      Place a test order and verify payment processing works correctly
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-canvas-soft p-4 rounded-lg">
              <h4 className="body-md font-medium mb-2">Need Help?</h4>
              <p className="body-md text-ink-mute">
                Check our{' '}
                <a href="#" className="link-on-light">documentation</a>
                {' '}or{' '}
                <a href="#" className="link-on-light">contact support</a>
              </p>
            </div>
          </div>
        )}

        {/* Shopify Tab */}
        {activeTab === 'shopify' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">Shopify Manual Payment Method Setup</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Enable Manual Payments</p>
                    <p className="body-md text-ink-mute">
                      Go to Shopify Admin → Settings → Payments → Manual payment methods
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Add Custom Payment Method</p>
                    <p className="body-md text-ink-mute mb-3">
                      Create a new manual payment method called "Mobile Banking (bKash/Nagad/Rocket/Upay)"
                    </p>
                    <div className="bg-canvas-soft p-4 rounded-lg space-y-3">
                      <div>
                        <label className="body-md block mb-1">Payment Instructions</label>
                        <textarea
                          className="input min-h-[120px]"
                          readOnly
                          value={`Please send money via bKash, Nagad, Rocket, or Upay and enter your Transaction ID in the order notes.

We will verify your payment and process your order within 24 hours.`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Set Up Order Notifications</p>
                    <p className="body-md text-ink-mute mb-3">
                      Configure your webhook to receive order notifications:
                    </p>
                    <div className="bg-canvas-soft p-4 rounded-lg">
                      <div className="mb-2">
                        <label className="body-md block mb-1">Webhook Topic</label>
                        <code className="body-tabular">orders/create</code>
                      </div>
                      <div>
                        <label className="body-md block mb-1">Webhook URL</label>
                        <code className="body-tabular text-sm break-all">
                          https://api.bdpay.app/v1/shopify/webhook
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="body-md font-medium mb-2">Process Orders Manually</p>
                    <p className="body-md text-ink-mute">
                      When customers place orders, they'll provide their TrxID. Verify payments in your BDPay dashboard and mark Shopify orders as fulfilled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Webhook Tab */}
        {activeTab === 'webhook' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">Webhook Configuration</h3>
              <p className="body-md text-ink-mute mb-4">
                Receive real-time notifications when payment status changes
              </p>

              <div className="space-y-4">
                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Webhook URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://yoursite.com/webhook/bdpay"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Must be HTTPS. We'll POST events to this URL.
                  </p>
                </div>

                <button
                  onClick={saveWebhookUrl}
                  className="button-primary"
                  disabled={savingWebhook}
                >
                  {savingWebhook ? 'Saving...' : 'Save Webhook URL'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="heading-md mb-4">Events</h3>
              <div className="space-y-3">
                <div className="card-feature">
                  <code className="body-tabular text-primary">payment.pending</code>
                  <p className="body-md text-ink-mute mt-2">
                    Triggered when a new payment is submitted for verification
                  </p>
                </div>
                <div className="card-feature">
                  <code className="body-tabular text-primary">payment.approved</code>
                  <p className="body-md text-ink-mute mt-2">
                    Triggered when you approve a payment
                  </p>
                </div>
                <div className="card-feature">
                  <code className="body-tabular text-primary">payment.rejected</code>
                  <p className="body-md text-ink-mute mt-2">
                    Triggered when you reject a payment
                  </p>
                </div>
                <div className="card-feature">
                  <code className="body-tabular text-primary">payment.refunded</code>
                  <p className="body-md text-ink-mute mt-2">
                    Triggered when a payment is marked as refunded
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="heading-md mb-4">Payload Example</h3>
              <div className="bg-brand-dark text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>
{`{
  "event": "payment.approved",
  "transaction_id": "uuid",
  "order_id": "ORDER-12345",
  "trx_id": "BK240101ABC",
  "amount": 1500.00,
  "currency": "BDT",
  "provider": "bkash",
  "customer_name": "Customer Name",
  "customer_phone": "01712345678",
  "timestamp": "2025-01-15T10:30:00Z"
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="heading-md mb-4">Security</h3>
              <p className="body-md text-ink-mute mb-3">
                All webhook requests include a signature header for verification:
              </p>
              <div className="bg-canvas-soft p-4 rounded-lg">
                <code className="body-tabular">X-BDPay-Signature: sha256_hash</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default APIKeys
