import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface Thuoc {
  id: string
  ten_thuoc: string
  hoat_chat: string
  ham_luong: string
  dang_bao_che: string
  quy_cach_dong_goi: string
  don_vi_tinh: string
  so_luong_ton_kho: number
  so_luong_dat_hang: number
  gia_mua_vao: number
  gia_ban_le: number
  duong_dung: string
  created_at?: string
  updated_at?: string
}

export type InsertThuoc = Omit<Thuoc, 'id' | 'created_at' | 'updated_at'>