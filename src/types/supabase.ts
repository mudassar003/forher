// src/types/supabase.ts
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
      orders: {
        Row: {
          id: string // uuid, NOT NULL
          email: string // text, NOT NULL
          customer_name: string | null // text
          address: string | null // text
          apartment: string | null // text
          city: string | null // text
          country: string | null // text
          postal_code: string | null // text
          phone: string | null // text
          payment_method: string | null // text
          shipping_method: string | null // text
          status: string | null // text
          subtotal: number | null // numeric
          shipping_cost: number | null // numeric
          total: number | null // numeric
          sanity_id: string | null // text
          stripe_session_id: string | null // text
          stripe_payment_intent_id: string | null // text
          payment_status: string | null // text
          stripe_customer_id: string | null // text
          is_deleted: boolean | null // boolean
          display_order_id: string | null // text
          created_at: string | null // timestamp with time zone
        }
        Insert: {
          id?: string // uuid
          email: string // text, NOT NULL
          customer_name?: string | null // text
          address?: string | null // text
          apartment?: string | null // text
          city?: string | null // text
          country?: string | null // text
          postal_code?: string | null // text
          phone?: string | null // text
          payment_method?: string | null // text
          shipping_method?: string | null // text
          status?: string | null // text
          subtotal?: number | null // numeric
          shipping_cost?: number | null // numeric
          total?: number | null // numeric
          sanity_id?: string | null // text
          stripe_session_id?: string | null // text
          stripe_payment_intent_id?: string | null // text
          payment_status?: string | null // text
          stripe_customer_id?: string | null // text
          is_deleted?: boolean | null // boolean
          display_order_id?: string | null // text
          created_at?: string | null // timestamp with time zone
        }
        Update: {
          id?: string // uuid
          email?: string // text
          customer_name?: string | null // text
          address?: string | null // text
          apartment?: string | null // text
          city?: string | null // text
          country?: string | null // text
          postal_code?: string | null // text
          phone?: string | null // text
          payment_method?: string | null // text
          shipping_method?: string | null // text
          status?: string | null // text
          subtotal?: number | null // numeric
          shipping_cost?: number | null // numeric
          total?: number | null // numeric
          sanity_id?: string | null // text
          stripe_session_id?: string | null // text
          stripe_payment_intent_id?: string | null // text
          payment_status?: string | null // text
          stripe_customer_id?: string | null // text
          is_deleted?: boolean | null // boolean
          display_order_id?: string | null // text
          created_at?: string | null // timestamp with time zone
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          name: string
          quantity: number
          price: number
          image: string | null
          created_at: string
          is_deleted: boolean | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          name: string
          quantity: number
          price: number
          image?: string | null
          created_at?: string
          is_deleted?: boolean | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          name?: string
          quantity?: number
          price?: number
          image?: string | null
          created_at?: string
          is_deleted?: boolean | null
        }
      }
      stripe_customers: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          email?: string
          created_at?: string
        }
      }
      temp_orders: {
        Row: {
          id: string
          order_data: Json
          created_at: string
          expires_at: string
        }
        Insert: {
          id: string
          order_data: Json
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          order_data?: Json
          created_at?: string
          expires_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          user_email: string
          sanity_id: string | null
          sanity_subscription_id: string | null
          subscription_name: string | null
          plan_id: string | null
          plan_name: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          billing_amount: number | null
          billing_period: string | null
          start_date: string
          end_date: string | null
          next_billing_date: string | null
          status: string | null
          is_active: boolean
          has_appointment_access: boolean
          appointment_discount_percentage: number | null
          appointments_included: number | null
          appointments_used: number | null
          created_at: string
          updated_at: string
          is_deleted: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          sanity_id?: string | null
          sanity_subscription_id?: string | null
          subscription_name?: string | null
          plan_id?: string | null
          plan_name?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          billing_amount?: number | null
          billing_period?: string | null
          start_date: string
          end_date?: string | null
          next_billing_date?: string | null
          status?: string | null
          is_active: boolean
          has_appointment_access: boolean
          appointment_discount_percentage?: number | null
          appointments_included?: number | null
          appointments_used?: number | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          sanity_id?: string | null
          sanity_subscription_id?: string | null
          subscription_name?: string | null
          plan_id?: string | null
          plan_name?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          billing_amount?: number | null
          billing_period?: string | null
          start_date?: string
          end_date?: string | null
          next_billing_date?: string | null
          status?: string | null
          is_active?: boolean
          has_appointment_access?: boolean
          appointment_discount_percentage?: number | null
          appointments_included?: number | null
          appointments_used?: number | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean | null
        }
      }
      user_appointments: {
        Row: {
          id: string
          user_id: string
          user_email: string | null
          customer_name: string | null
          appointment_date: string | null
          treatment_name: string | null
          notes: string | null
          status: string | null
          order_id: string | null
          subscription_id: string | null
          is_from_subscription: boolean | null
          scheduled_date: string | null
          completed_date: string | null
          appointment_type_id: string | null
          sanity_appointment_id: string | null
          sanity_id: string | null
          price: number | null
          duration: number | null
          prescription_details: Json | null
          prescription_id: string | null
          payment_method: string | null
          stripe_payment_intent_id: string | null
          payment_status: string | null
          stripe_session_id: string | null
          stripe_customer_id: string | null
          qualiphy_patient_exam_id: number | null
          qualiphy_exam_id: number | null
          qualiphy_exam_status: string | null
          qualiphy_provider_name: string | null
          qualiphy_meeting_url: string | null
          qualiphy_meeting_uuid: string | null
          created_at: string
          updated_at: string
          is_deleted: boolean | null
          requires_subscription: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          user_email?: string | null
          customer_name?: string | null
          appointment_date?: string | null
          treatment_name?: string | null
          notes?: string | null
          status?: string | null
          order_id?: string | null
          subscription_id?: string | null
          is_from_subscription?: boolean | null
          scheduled_date?: string | null
          completed_date?: string | null
          appointment_type_id?: string | null
          sanity_appointment_id?: string | null
          sanity_id?: string | null
          price?: number | null
          duration?: number | null
          prescription_details?: Json | null
          prescription_id?: string | null
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          payment_status?: string | null
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          qualiphy_patient_exam_id?: number | null
          qualiphy_exam_id?: number | null
          qualiphy_exam_status?: string | null
          qualiphy_provider_name?: string | null
          qualiphy_meeting_url?: string | null
          qualiphy_meeting_uuid?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean | null
          requires_subscription?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string | null
          customer_name?: string | null
          appointment_date?: string | null
          treatment_name?: string | null
          notes?: string | null
          status?: string | null
          order_id?: string | null
          subscription_id?: string | null
          is_from_subscription?: boolean | null
          scheduled_date?: string | null
          completed_date?: string | null
          appointment_type_id?: string | null
          sanity_appointment_id?: string | null
          sanity_id?: string | null
          price?: number | null
          duration?: number | null
          prescription_details?: Json | null
          prescription_id?: string | null
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          payment_status?: string | null
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          qualiphy_patient_exam_id?: number | null
          qualiphy_exam_id?: number | null
          qualiphy_exam_status?: string | null
          qualiphy_provider_name?: string | null
          qualiphy_meeting_url?: string | null
          qualiphy_meeting_uuid?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean | null
          requires_subscription?: boolean | null
        }
      }
      user_data: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          state: string
          dob: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          state: string
          dob: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          state?: string
          dob?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      active_subscriptions_with_appointment_access: {
        Row: {
          id: string | null
          user_id: string | null
          appointment_discount_percentage: number | null
          is_active: boolean | null
          appointments_included: number | null
          appointments_used: number | null
          billing_amount: number | null
          next_billing_date: string | null
          user_email: string | null
          plan_name: string | null
          stripe_subscription_id: string | null
          billing_period: string | null
        }
      }
    }
    Functions: {
      [_ in string]: never
    }
    Enums: {
      [_ in string]: never
    }
    CompositeTypes: {
      [_ in string]: never
    }
  }
}