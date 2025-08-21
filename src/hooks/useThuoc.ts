import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Thuoc, type InsertThuoc } from '@/lib/supabase'

// Get all medicines
export function useThuoc() {
  return useQuery({
    queryKey: ['thuoc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('thuoc')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Thuoc[]
    }
  })
}

// Get single medicine
export function useThuocById(id: string) {
  return useQuery({
    queryKey: ['thuoc', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('thuoc')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Thuoc
    },
    enabled: !!id
  })
}

// Create medicine
export function useCreateThuoc() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newThuoc: InsertThuoc) => {
      const { data, error } = await supabase
        .from('thuoc')
        .insert([newThuoc])
        .select()
        .single()
      
      if (error) throw error
      return data as Thuoc
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thuoc'] })
    }
  })
}

// Update medicine
export function useUpdateThuoc() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Thuoc> & { id: string }) => {
      const { data, error } = await supabase
        .from('thuoc')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Thuoc
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['thuoc'] })
      queryClient.invalidateQueries({ queryKey: ['thuoc', data.id] })
    }
  })
}

// Delete medicine
export function useDeleteThuoc() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('thuoc')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thuoc'] })
    }
  })
}

// Statistics
export function useThuocStats() {
  return useQuery({
    queryKey: ['thuoc-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('thuoc')
        .select('so_luong_ton_kho')
      
      if (error) throw error
      
      const totalMedicines = data.length
      const lowStockMedicines = data.filter(item => item.so_luong_ton_kho < 10).length
      
      return {
        totalMedicines,
        lowStockMedicines,
        totalStock: data.reduce((sum, item) => sum + item.so_luong_ton_kho, 0)
      }
    }
  })
}