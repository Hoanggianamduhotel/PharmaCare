import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

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
    const thuocId = pathParts[pathParts.length - 1];

    switch (httpMethod) {
      case 'GET':
        if (pathParts.includes('search')) {
          // Search thuoc
          const query = queryStringParameters?.q || '';
          const { data: thuoc, error } = await supabase
            .from('thuoc')
            .select('*')
            .ilike('ten_thuoc', `%${query}%`)
            .order('ten_thuoc');

          if (error) throw error;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(thuoc),
          };
        } else if (thuocId && thuocId !== 'thuoc') {
          // Get single thuoc
          const { data: thuoc, error } = await supabase
            .from('thuoc')
            .select('*')
            .eq('id', thuocId)
            .single();

          if (error || !thuoc) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ message: 'Không tìm thấy thuốc' }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(thuoc),
          };
        } else {
          // Get all thuoc
          const { data: thuoc, error } = await supabase
            .from('thuoc')
            .select('*')
            .order('ten_thuoc');

          if (error) throw error;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(thuoc),
          };
        }

      case 'PATCH':
        // Update stock
        if (pathParts.includes('stock')) {
          const { so_luong_ton } = JSON.parse(body || '{}');
          
          const { error } = await supabase
            .from('thuoc')
            .update({ so_luong_ton: so_luong_ton.toString() })
            .eq('id', thuocId);

          if (error) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ message: 'Lỗi khi cập nhật tồn kho' }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Cập nhật tồn kho thành công' }),
          };
        }
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid PATCH request' }),
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