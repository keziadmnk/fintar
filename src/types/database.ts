export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          category: string;
          scale: 'micro' | 'small' | 'medium';
          display_currency: 'IDR' | 'USD' | 'CNY';
          avg_monthly_profit: number;
          current_cash_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          category: string;
          scale?: 'micro' | 'small' | 'medium';
          display_currency?: 'IDR' | 'USD' | 'CNY';
          avg_monthly_profit?: number;
          current_cash_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          category?: string;
          scale?: 'micro' | 'small' | 'medium';
          display_currency?: 'IDR' | 'USD' | 'CNY';
          avg_monthly_profit?: number;
          current_cash_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      consents: {
        Row: {
          id: string;
          user_id: string;
          type: 'ai_processing' | 'anonymous_insights';
          granted: boolean;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'ai_processing' | 'anonymous_insights';
          granted?: boolean;
          timestamp?: string;
        };
        Update: never; // Insert-only for users
      };
      receipts: {
        Row: {
          id: string;
          business_id: string;
          image_ref: string | null;
          parsed_json: Json;
          confidence: number;
          status: 'pending' | 'confirmed' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          image_ref?: string | null;
          parsed_json?: Json;
          confidence?: number;
          status?: 'pending' | 'confirmed' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          image_ref?: string | null;
          parsed_json?: Json;
          confidence?: number;
          status?: 'pending' | 'confirmed' | 'rejected';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          business_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          description: string;
          date: string;
          source: 'manual' | 'ocr' | 'csv';
          receipt_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          description: string;
          date?: string;
          source?: 'manual' | 'ocr' | 'csv';
          receipt_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          type?: 'income' | 'expense';
          amount?: number;
          category?: string;
          description?: string;
          date?: string;
          source?: 'manual' | 'ocr' | 'csv';
          receipt_id?: string | null;
          created_at?: string;
        };
      };
      debts: {
        Row: {
          id: string;
          business_id: string;
          supplier: string;
          amount: number;
          due_date: string;
          status: 'unpaid' | 'paid' | 'overdue';
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          supplier: string;
          amount: number;
          due_date: string;
          status?: 'unpaid' | 'paid' | 'overdue';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          supplier?: string;
          amount?: number;
          due_date?: string;
          status?: 'unpaid' | 'paid' | 'overdue';
          created_at?: string;
        };
      };
      scheduled_expenses: {
        Row: {
          id: string;
          business_id: string;
          label: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          label: string;
          amount: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          label?: string;
          amount?: number;
          date?: string;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          business_id: string;
          level: 'critical' | 'warning' | 'positive';
          title: string;
          detail: string;
          suggested_action: string | null;
          action_route: string | null;
          created_at: string;
          resolved: boolean;
        };
        Insert: {
          id?: string;
          business_id: string;
          level: 'critical' | 'warning' | 'positive';
          title: string;
          detail: string;
          suggested_action?: string | null;
          action_route?: string | null;
          created_at?: string;
          resolved?: boolean;
        };
        Update: {
          id?: string;
          business_id?: string;
          level?: 'critical' | 'warning' | 'positive';
          title?: string;
          detail?: string;
          suggested_action?: string | null;
          action_route?: string | null;
          created_at?: string;
          resolved?: boolean;
        };
      };
      financing_products: {
        Row: {
          id: string;
          name: string;
          provider: string;
          type: string;
          annual_rate: number;
          collateral: string;
          max_amount: number;
          tenors: number[];
          speed_days: number;
          is_simulated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          type: string;
          annual_rate: number;
          collateral: string;
          max_amount: number;
          tenors?: number[];
          speed_days?: number;
          is_simulated?: boolean;
          created_at?: string;
        };
        Update: never;
      };
      proposals: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          amount: number;
          tenor: number;
          pdf_ref: string | null;
          status: 'draft' | 'submitted_sandbox' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          product_id: string;
          amount: number;
          tenor: number;
          pdf_ref?: string | null;
          status?: 'draft' | 'submitted_sandbox' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          product_id?: string;
          amount?: number;
          tenor?: number;
          pdf_ref?: string | null;
          status?: 'draft' | 'submitted_sandbox' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
      insurance_products: {
        Row: {
          id: string;
          name: string;
          provider: string;
          covers: string[];
          monthly_premium: number;
          is_simulated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          covers?: string[];
          monthly_premium: number;
          is_simulated?: boolean;
          created_at?: string;
        };
        Update: never;
      };
      agent_actions: {
        Row: {
          id: string;
          user_id: string;
          tool: string;
          input: Json;
          output: Json;
          tier: 'T0' | 'T1' | 'T2' | 'T3';
          status: 'pending_approval' | 'approved' | 'rejected' | 'completed' | 'blocked';
          approval_id: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool: string;
          input?: Json;
          output?: Json;
          tier: 'T0' | 'T1' | 'T2' | 'T3';
          status?: 'pending_approval' | 'approved' | 'rejected' | 'completed' | 'blocked';
          approval_id?: string | null;
          timestamp?: string;
        };
        Update: never; // Immutable audit log
      };
      approvals: {
        Row: {
          id: string;
          user_id: string;
          action_id: string;
          decision: 'approved' | 'rejected' | 'pending';
          decided_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_id: string;
          decision: 'approved' | 'rejected' | 'pending';
          decided_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_id?: string;
          decision?: 'approved' | 'rejected' | 'pending';
          decided_at?: string;
        };
      };
      fx_rates: {
        Row: {
          currency: 'IDR' | 'USD' | 'CNY';
          rate_to_idr: number;
          as_of: string;
        };
        Insert: {
          currency: 'IDR' | 'USD' | 'CNY';
          rate_to_idr: number;
          as_of?: string;
        };
        Update: never;
      };
    };
    Functions: {
      seed_demo_data: {
        Args: { p_user_id?: string };
        Returns: Json;
      };
    };
  };
}
