import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Language = 'en' | 'bn'

interface Translations {
  [key: string]: string
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.transactions': 'Transactions',
    'nav.wallets': 'Wallets',
    'nav.checkout': 'Checkout Links',
    'nav.api': 'API Keys',
    'nav.team': 'Team',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.close': 'Close',
    
    // Transactions
    'transactions.title': 'Transactions',
    'transactions.subtitle': 'View and manage all your payment transactions',
    'transactions.trxid': 'TRX ID',
    'transactions.provider': 'Provider',
    'transactions.amount': 'Amount',
    'transactions.customer': 'Customer',
    'transactions.orderId': 'Order ID',
    'transactions.status': 'Status',
    'transactions.date': 'Date',
    'transactions.action': 'Action',
    'transactions.approve': 'Approve',
    'transactions.reject': 'Reject',
    'transactions.pending': 'Pending',
    'transactions.approved': 'Approved',
    'transactions.rejected': 'Rejected',
    'transactions.refunded': 'Refunded',
    'transactions.noData': 'No transactions found',
    
    // Wallets
    'wallets.title': 'Wallets',
    'wallets.subtitle': 'Manage your payment wallet numbers',
    'wallets.addWallet': 'Add Wallet',
    'wallets.walletNumber': 'Wallet Number',
    'wallets.accountType': 'Account Type',
    'wallets.active': 'Active',
    'wallets.inactive': 'Inactive',
    'wallets.viewQr': 'View QR',
    'wallets.noWallets': 'Add your first wallet',
    
    // Status
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.refunded': 'Refunded',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.fraud': 'Fraud Settings',
    'settings.dangerZone': 'Danger Zone',
  },
  bn: {
    // Navigation
    'nav.overview': 'সারসংক্ষেপ',
    'nav.transactions': 'লেনদেন',
    'nav.wallets': 'ওয়ালেট',
    'nav.checkout': 'চেকআউট লিংক',
    'nav.api': 'এপিআই কী',
    'nav.team': 'টিম',
    'nav.analytics': 'বিশ্লেষণ',
    'nav.settings': 'সেটিংস',
    'nav.logout': 'লগআউট',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সংরক্ষণ করুন',
    'common.cancel': 'বাতিল',
    'common.delete': 'মুছুন',
    'common.edit': 'সম্পাদনা',
    'common.add': 'যোগ করুন',
    'common.search': 'অনুসন্ধান',
    'common.filter': 'ফিল্টার',
    'common.export': 'রপ্তানি',
    'common.copy': 'কপি',
    'common.copied': 'কপি হয়েছে!',
    'common.close': 'বন্ধ করুন',
    
    // Transactions
    'transactions.title': 'লেনদেন',
    'transactions.subtitle': 'আপনার সমস্ত পেমেন্ট লেনদেন দেখুন এবং পরিচালনা করুন',
    'transactions.trxid': 'ট্র্যানজেকশন আইডি',
    'transactions.provider': 'প্রদানকারী',
    'transactions.amount': 'পরিমাণ',
    'transactions.customer': 'গ্রাহক',
    'transactions.orderId': 'অর্ডার আইডি',
    'transactions.status': 'অবস্থা',
    'transactions.date': 'তারিখ',
    'transactions.action': 'কর্ম',
    'transactions.approve': 'অনুমোদন',
    'transactions.reject': 'বাতিল',
    'transactions.pending': 'অপেক্ষমান',
    'transactions.approved': 'অনুমোদিত',
    'transactions.rejected': 'বাতিল',
    'transactions.refunded': 'ফেরত',
    'transactions.noData': 'কোন লেনদেন পাওয়া যায়নি',
    
    // Wallets
    'wallets.title': 'ওয়ালেট',
    'wallets.subtitle': 'আপনার পেমেন্ট ওয়ালেট নম্বর পরিচালনা করুন',
    'wallets.addWallet': 'ওয়ালেট যোগ করুন',
    'wallets.walletNumber': 'ওয়ালেট নম্বর',
    'wallets.accountType': 'অ্যাকাউন্টের ধরন',
    'wallets.active': 'সক্রিয়',
    'wallets.inactive': 'নিষ্ক্রিয়',
    'wallets.viewQr': 'QR দেখুন',
    'wallets.noWallets': 'আপনার প্রথম ওয়ালেট যোগ করুন',
    
    // Status
    'status.pending': 'অপেক্ষমান',
    'status.approved': 'অনুমোদিত',
    'status.rejected': 'বাতিল',
    'status.refunded': 'ফেরত',
    
    // Settings
    'settings.title': 'সেটিংস',
    'settings.profile': 'প্রোফাইল',
    'settings.language': 'ভাষা',
    'settings.notifications': 'বিজ্ঞপ্তি',
    'settings.fraud': 'জালিয়াতি সেটিংস',
    'settings.dangerZone': 'বিপদ অঞ্চল',
  }
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLanguagePreference()
  }, [])

  const loadLanguagePreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('language')
          .eq('user_id', user.id)
          .single()

        if (merchant?.language) {
          setLanguageState(merchant.language as Language)
        }
      }
    } catch (error) {
      console.error('Error loading language preference:', error)
    } finally {
      setLoading(false)
    }
  }

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('merchants')
          .update({ language: lang })
          .eq('user_id', user.id)
      }
    } catch (error) {
      console.error('Error saving language preference:', error)
    }
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  if (loading) {
    return null // or a loading spinner
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
