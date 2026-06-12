import React, { createContext, useContext, useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

interface RealtimeContextType {
  isConnected: boolean
  pendingCount: number
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { info, success } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [merchantId, setMerchantId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setupRealtime()
    }

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [user])

  const setupRealtime = async () => {
    try {
      // Get merchant ID
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!merchant) return
      setMerchantId(merchant.id)

      // Get initial pending count
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('status', 'pending')

      setPendingCount(count || 0)

      // Set up real-time subscription
      const realtimeChannel = supabase
        .channel(`transactions:${merchant.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `merchant_id=eq.${merchant.id}`,
          },
          (payload) => {
            console.log('New transaction:', payload)
            
            const transaction = payload.new as any
            
            if (transaction.status === 'pending') {
              setPendingCount((prev) => prev + 1)
              
              // Show toast notification
              success(
                `New payment received: ৳${Number(transaction.amount).toLocaleString()} via ${transaction.provider}`,
                6000
              )
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `merchant_id=eq.${merchant.id}`,
          },
          (payload) => {
            console.log('Transaction updated:', payload)
            
            const oldRecord = payload.old as any
            const newRecord = payload.new as any
            
            // If status changed from pending to approved/rejected
            if (oldRecord.status === 'pending' && newRecord.status !== 'pending') {
              setPendingCount((prev) => Math.max(0, prev - 1))
            }
            
            // If status changed back to pending
            if (oldRecord.status !== 'pending' && newRecord.status === 'pending') {
              setPendingCount((prev) => prev + 1)
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
          setIsConnected(status === 'SUBSCRIBED')
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time updates connected')
          }
        })

      setChannel(realtimeChannel)
    } catch (error) {
      console.error('Error setting up realtime:', error)
    }
  }

  const value = {
    isConnected,
    pendingCount,
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
