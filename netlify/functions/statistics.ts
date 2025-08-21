import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

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
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method not allowed' }),
      };
    }

    // Get all thuoc for statistics
    const { data: thuoc, error } = await supabase
      .from('thuoc')
      .select('*');

    if (error) throw error;

    const totalMedicines = thuoc.length;
    const lowStockMedicines = thuoc.filter(t => Number(t.so_luong_ton || 0) <= 10).length;
    const pendingPrescriptions = 0; // No prescriptions in simplified schema yet
    const totalValue = 0; // No pricing in simplified schema yet

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalMedicines,
        lowStockMedicines,
        pendingPrescriptions,
        totalValue
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Lỗi khi lấy thống kê',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};