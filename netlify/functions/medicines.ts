import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// Validation schemas
const medicineSchema = z.object({
  ten_thuoc: z.string().min(1),
  don_vi: z.string().min(1),
  so_luong_ton: z.number().int().nonnegative(),
  gia_nhap: z.number().nonnegative().optional(),
  gia_ban: z.number().nonnegative().optional(),
  so_luong_dat_hang: z.number().int().nonnegative().optional(),
  duong_dung: z.string().optional(),
});

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { httpMethod, path, body, queryStringParameters } = event;
    const pathParts = path.split('/');
    const medicineId = pathParts[pathParts.length - 1];

    switch (httpMethod) {
      case 'GET':
        if (pathParts.includes('search')) {
          // Search medicines
          const query = queryStringParameters?.q || '';
          const { data: thuoc, error } = await supabase
            .from('thuoc')
            .select('*')
            .ilike('ten_thuoc', `%${query}%`)
            .order('ten_thuoc');

          if (error) throw error;

          // Convert to medicine format
          const medicines = thuoc.map(t => ({
            id: t.id,
            ten_thuoc: t.ten_thuoc,
            don_vi: t.don_vi || '',
            so_luong_ton: parseInt(t.so_luong_ton?.toString() || '0'),
            so_luong_dat_hang: parseInt(t.so_luong_dat_hang?.toString() || '0'),
            gia_nhap: parseInt(t.gia_nhap?.toString() || '0'),
            gia_ban: parseInt(t.gia_ban?.toString() || '0'),
            duong_dung: t.duong_dung || 'Uống',
            created_at: t.created_at || new Date()
          }));

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(medicines),
          };
        } else if (medicineId && medicineId !== 'medicines') {
          // Get single medicine
          const { data: thuoc, error } = await supabase
            .from('thuoc')
            .select('*')
            .eq('id', medicineId)
            .single();

          if (error || !thuoc) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ message: 'Không tìm thấy thuốc' }),
            };
          }

          const medicine = {
            id: thuoc.id,
            ten_thuoc: thuoc.ten_thuoc,
            don_vi: thuoc.don_vi || '',
            so_luong_ton: parseInt(thuoc.so_luong_ton?.toString() || '0'),
            so_luong_dat_hang: parseInt(thuoc.so_luong_dat_hang?.toString() || '0'),
            gia_nhap: parseInt(thuoc.gia_nhap?.toString() || '0'),
            gia_ban: parseInt(thuoc.gia_ban?.toString() || '0'),
            duong_dung: thuoc.duong_dung || 'Uống',
            created_at: thuoc.created_at || new Date()
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(medicine),
          };
        } else {
          // Get all medicines
          const { data: thuoc, error } = await supabase
            .from('thuoc')
            .select('*')
            .order('ten_thuoc');

          if (error) throw error;

          // Convert to medicine format
          const medicines = thuoc.map(t => ({
            id: t.id,
            ten_thuoc: t.ten_thuoc,
            don_vi: t.don_vi || '',
            so_luong_ton: parseInt(t.so_luong_ton?.toString() || '0'),
            so_luong_dat_hang: parseInt(t.so_luong_dat_hang?.toString() || '0'),
            gia_nhap: parseInt(t.gia_nhap?.toString() || '0'),
            gia_ban: parseInt(t.gia_ban?.toString() || '0'),
            duong_dung: t.duong_dung || 'Uống',
            created_at: t.created_at || new Date()
          }));

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(medicines),
          };
        }

      case 'POST':
        // Create new medicine
        const createData = medicineSchema.parse(JSON.parse(body || '{}'));
        
        const { data: newThuoc, error: createError } = await supabase
          .from('thuoc')
          .insert({
            ten_thuoc: createData.ten_thuoc,
            don_vi: createData.don_vi,
            so_luong_ton: createData.so_luong_ton.toString(),
            gia_nhap: createData.gia_nhap?.toString() || '0',
            gia_ban: createData.gia_ban?.toString() || '0',
            so_luong_dat_hang: createData.so_luong_dat_hang || 0,
            duong_dung: createData.duong_dung || 'Uống',
          })
          .select()
          .single();

        if (createError) throw createError;

        const createdMedicine = {
          id: newThuoc.id,
          ten_thuoc: newThuoc.ten_thuoc,
          don_vi: newThuoc.don_vi || '',
          so_luong_ton: parseInt(newThuoc.so_luong_ton?.toString() || '0'),
          so_luong_dat_hang: parseInt(newThuoc.so_luong_dat_hang?.toString() || '0'),
          gia_nhap: parseInt(newThuoc.gia_nhap?.toString() || '0'),
          gia_ban: parseInt(newThuoc.gia_ban?.toString() || '0'),
          duong_dung: newThuoc.duong_dung || 'Uống',
          created_at: newThuoc.created_at || new Date()
        };

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(createdMedicine),
        };

      case 'PATCH':
        // Update medicine
        const updateData = medicineSchema.partial().parse(JSON.parse(body || '{}'));
        
        const updatePayload: any = {};
        if (updateData.ten_thuoc !== undefined) updatePayload.ten_thuoc = updateData.ten_thuoc;
        if (updateData.don_vi !== undefined) updatePayload.don_vi = updateData.don_vi;
        if (updateData.so_luong_ton !== undefined) updatePayload.so_luong_ton = updateData.so_luong_ton.toString();
        if (updateData.gia_nhap !== undefined) updatePayload.gia_nhap = updateData.gia_nhap.toString();
        if (updateData.gia_ban !== undefined) updatePayload.gia_ban = updateData.gia_ban.toString();
        if (updateData.so_luong_dat_hang !== undefined) updatePayload.so_luong_dat_hang = updateData.so_luong_dat_hang;
        if (updateData.duong_dung !== undefined) updatePayload.duong_dung = updateData.duong_dung;

        const { data: updatedThuoc, error: updateError } = await supabase
          .from('thuoc')
          .update(updatePayload)
          .eq('id', medicineId)
          .select()
          .single();

        if (updateError || !updatedThuoc) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Không tìm thấy thuốc' }),
          };
        }

        const updatedMedicine = {
          id: updatedThuoc.id,
          ten_thuoc: updatedThuoc.ten_thuoc,
          don_vi: updatedThuoc.don_vi || '',
          so_luong_ton: parseInt(updatedThuoc.so_luong_ton?.toString() || '0'),
          so_luong_dat_hang: parseInt(updatedThuoc.so_luong_dat_hang?.toString() || '0'),
          gia_nhap: parseInt(updatedThuoc.gia_nhap?.toString() || '0'),
          gia_ban: parseInt(updatedThuoc.gia_ban?.toString() || '0'),
          duong_dung: updatedThuoc.duong_dung || 'Uống',
          created_at: updatedThuoc.created_at || new Date()
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedMedicine),
        };

      case 'DELETE':
        // Delete medicine
        const { error: deleteError } = await supabase
          .from('thuoc')
          .delete()
          .eq('id', medicineId);

        if (deleteError) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Không tìm thấy thuốc' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Đã xóa thuốc thành công' }),
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Dữ liệu không hợp lệ', 
          errors: error.errors 
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Lỗi server', 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};