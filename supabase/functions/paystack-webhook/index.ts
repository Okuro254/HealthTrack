import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash, createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    gateway_response: string;
    paid_at?: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
    };
  };
}

const verifyPaystackSignature = (payload: string, signature: string): boolean => {
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!secret) {
    console.error('Paystack secret key not configured');
    return false;
  }

  const hash = createHmac('sha512', secret).update(payload).digest('hex');
  return hash === signature;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Get request body and signature
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    if (!signature) {
      throw new Error('Missing Paystack signature');
    }

    // Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const payload: PaystackWebhookPayload = JSON.parse(body);
    
    // Only process charge success events
    if (payload.event !== 'charge.success') {
      return new Response(
        JSON.stringify({ message: 'Event not processed' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { reference, status, amount } = payload.data;

    if (!reference) {
      throw new Error('Missing payment reference');
    }

    // Map Paystack status to our status
    let paymentStatus = 'pending';
    if (status === 'success') {
      paymentStatus = 'paid';
    } else if (status === 'failed') {
      paymentStatus = 'failed';
    } else if (status === 'abandoned') {
      paymentStatus = 'cancelled';
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update payment status in database
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: paymentStatus,
        payment_ref: reference 
      })
      .eq('payment_ref', reference);

    if (error) {
      throw error;
    }

    console.log(`Updated payment ${reference} to status: ${paymentStatus}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: paymentStatus,
        reference 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});