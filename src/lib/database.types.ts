export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          user_id: string
          business_name: string
          email: string
          phone: string | null
          logo_url: string | null
          api_key: string
          webhook_url: string | null
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          email: string
          phone?: string | null
          logo_url?: string | null
          api_key?: string
          webhook_url?: string | null
          language?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          email?: string
          phone?: string | null
          logo_url?: string | null
          api_key?: string
          webhook_url?: string | null
          language?: string
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          merchant_id: string
          provider: 'bkash' | 'nagad' | 'rocket' | 'upay'
          wallet_number: string
          account_type: 'personal' | 'merchant' | 'agent'
          display_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          provider: 'bkash' | 'nagad' | 'rocket' | 'upay'
          wallet_number: string
          account_type: 'personal' | 'merchant' | 'agent'
          display_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          provider?: 'bkash' | 'nagad' | 'rocket' | 'upay'
          wallet_number?: string
          account_type?: 'personal' | 'merchant' | 'agent'
          display_name?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          merchant_id: string
          wallet_id: string | null
          trx_id: string
          amount: number
          currency: string
          customer_name: string | null
          customer_phone: string | null
          customer_email: string | null
          order_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'refunded'
          provider: 'bkash' | 'nagad' | 'rocket' | 'upay'
          notes: string | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          wallet_id?: string | null
          trx_id: string
          amount: number
          currency?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_email?: string | null
          order_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          provider: 'bkash' | 'nagad' | 'rocket' | 'upay'
          notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          wallet_id?: string | null
          trx_id?: string
          amount?: number
          currency?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_email?: string | null
          order_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          provider?: 'bkash' | 'nagad' | 'rocket' | 'upay'
          notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          merchant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'staff'
          invited_email: string | null
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'staff'
          invited_email?: string | null
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'staff'
          invited_email?: string | null
          accepted_at?: string | null
          created_at?: string
        }
      }
      webhook_logs: {
        Row: {
          id: string
          merchant_id: string | null
          transaction_id: string | null
          event: string
          payload: Json | null
          response_status: number | null
          delivered_at: string
        }
        Insert: {
          id?: string
          merchant_id?: string | null
          transaction_id?: string | null
          event: string
          payload?: Json | null
          response_status?: number | null
          delivered_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string | null
          transaction_id?: string | null
          event?: string
          payload?: Json | null
          response_status?: number | null
          delivered_at?: string
        }
      }
      checkout_sessions: {
        Row: {
          id: string
          merchant_id: string
          amount: number
          order_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_email: string | null
          redirect_url: string | null
          status: string
          expires_at: string
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          amount: number
          order_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_email?: string | null
          redirect_url?: string | null
          status?: string
          expires_at?: string
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          amount?: number
          order_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_email?: string | null
          redirect_url?: string | null
          status?: string
          expires_at?: string
          transaction_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
