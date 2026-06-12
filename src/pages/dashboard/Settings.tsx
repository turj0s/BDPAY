import { useState, useEffect } from 'react'
import { Upload, AlertTriangle, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'

type Merchant = Database['public']['Tables']['merchants']['Row']

const Settings = () => {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'notifications' | 'fraud' | 'danger'>('profile')

  const [profileData, setProfileData] = useState({
    business_name: '',
    email: '',
    phone: '',
    logo_url: '',
  })

  const [languageData, setLanguageData] = useState({
    language: 'en' as 'en' | 'bn',
  })

  const [notificationData, setNotificationData] = useState({
    email_on_new_payment: true,
    email_on_approval_needed: true,
  })

  const [fraudData, setFraudData] = useState({
    min_amount: '',
    max_amount: '',
    trx_id_pattern: '',
  })

  useEffect(() => {
    fetchMerchantSettings()
  }, [])

  const fetchMerchantSettings = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      if (data) {
        setMerchant(data)
        setProfileData({
          business_name: data.business_name,
          email: data.email,
          phone: data.phone || '',
          logo_url: data.logo_url || '',
        })
        setLanguageData({
          language: data.language as 'en' | 'bn',
        })
      }
    } catch (error) {
      console.error('Error fetching merchant settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!merchant) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('merchants')
        .update({
          business_name: profileData.business_name,
          phone: profileData.phone || null,
          logo_url: profileData.logo_url || null,
        })
        .eq('id', merchant.id)

      if (error) throw error
      
      alert('Profile updated successfully!')
      fetchMerchantSettings()
    } catch (error: any) {
      alert(error.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLanguage = async () => {
    if (!merchant) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('merchants')
        .update({
          language: languageData.language,
        })
        .eq('id', merchant.id)

      if (error) throw error
      
      alert('Language preference saved! The UI will update on next page load.')
      fetchMerchantSettings()
    } catch (error: any) {
      alert(error.message || 'Error updating language')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!merchant) return

    const confirmation = prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    )

    if (confirmation !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    try {
      // In a real implementation, this would:
      // 1. Delete all associated data (transactions, wallets, staff, etc.)
      // 2. Delete the merchant record
      // 3. Delete the auth user account
      
      alert('Account deletion would be processed here. (Not implemented in demo)')
      
      // For demo purposes:
      // await supabase.auth.signOut()
      // window.location.href = '/'
    } catch (error: any) {
      alert(error.message || 'Error deleting account')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="body-md text-ink-mute">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="display-lg mb-2">Settings</h1>
        <p className="body-md text-ink-mute">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="card-dashboard">
        <div className="border-b border-hairline mb-6">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 body-md border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`pb-3 body-md border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'language'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              Language
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 body-md border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('fraud')}
              className={`pb-3 body-md border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'fraud'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              Fraud Settings
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`pb-3 body-md border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'danger'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-mute hover:text-ink'
              }`}
            >
              Danger Zone
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Business Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileData.business_name}
                    onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={profileData.email}
                    disabled
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+880 1712345678"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Logo URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://example.com/logo.png"
                    value={profileData.logo_url}
                    onChange={(e) => setProfileData({ ...profileData, logo_url: e.target.value })}
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Your logo will be displayed on hosted checkout pages
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="button-primary"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">Language Preference</h3>
              <p className="body-md text-ink-mute mb-6">
                Choose your preferred language for the dashboard interface
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-hairline rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={languageData.language === 'en'}
                    onChange={(e) => setLanguageData({ language: e.target.value as 'en' })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="body-md font-medium">English</p>
                    <p className="caption text-ink-mute">Display the interface in English</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-hairline rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="language"
                    value="bn"
                    checked={languageData.language === 'bn'}
                    onChange={(e) => setLanguageData({ language: e.target.value as 'bn' })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="body-md font-medium">বাংলা (Bangla)</p>
                    <p className="caption text-ink-mute">ইন্টারফেস বাংলায় প্রদর্শন করুন</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleSaveLanguage}
                className="button-primary mt-6"
                disabled={saving}
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Language Preference'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">Email Notifications</h3>
              <p className="body-md text-ink-mute mb-6">
                Choose which email notifications you want to receive
              </p>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border border-hairline rounded-lg">
                  <input
                    type="checkbox"
                    checked={notificationData.email_on_new_payment}
                    onChange={(e) => setNotificationData({ 
                      ...notificationData, 
                      email_on_new_payment: e.target.checked 
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="body-md font-medium">New Payment Submitted</p>
                    <p className="caption text-ink-mute">
                      Get notified when a customer submits a new payment for verification
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-hairline rounded-lg">
                  <input
                    type="checkbox"
                    checked={notificationData.email_on_approval_needed}
                    onChange={(e) => setNotificationData({ 
                      ...notificationData, 
                      email_on_approval_needed: e.target.checked 
                    })}
                    className="mt-1"
                  />
                  <div>
                    <p className="body-md font-medium">Payment Approval Needed</p>
                    <p className="caption text-ink-mute">
                      Daily digest of pending payments waiting for your approval
                    </p>
                  </div>
                </label>
              </div>

              <button
                className="button-primary mt-6"
                disabled={saving}
              >
                <Save size={18} />
                Save Notification Preferences
              </button>
            </div>
          </div>
        )}

        {/* Fraud Settings Tab */}
        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-md mb-4">Fraud Prevention</h3>
              <p className="body-md text-ink-mute mb-6">
                Set up rules to automatically flag suspicious transactions
              </p>

              <div className="space-y-4">
                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    Minimum Transaction Amount (BDT)
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={fraudData.min_amount}
                    onChange={(e) => setFraudData({ ...fraudData, min_amount: e.target.value })}
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Reject transactions below this amount
                  </p>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    Maximum Transaction Amount (BDT)
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="100000"
                    value={fraudData.max_amount}
                    onChange={(e) => setFraudData({ ...fraudData, max_amount: e.target.value })}
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Flag transactions above this amount for manual review
                  </p>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    TrxID Format Validation (Regex)
                  </label>
                  <input
                    type="text"
                    className="input font-mono"
                    placeholder="^[A-Z]{2}[0-9]{8}[A-Z]{3}$"
                    value={fraudData.trx_id_pattern}
                    onChange={(e) => setFraudData({ ...fraudData, trx_id_pattern: e.target.value })}
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    Regular expression pattern to validate transaction IDs
                  </p>
                </div>

                <button
                  className="button-primary"
                  disabled={saving}
                >
                  <Save size={18} />
                  Save Fraud Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="heading-md text-red-900 mb-2">Danger Zone</h3>
                  <p className="body-md text-red-800">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="body-md font-medium mb-1">Delete Account</p>
                      <p className="caption text-ink-mute">
                        Permanently delete your BDPay account, all transactions, wallets, and data. 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="button-secondary bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
