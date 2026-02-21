import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, paymentMethod, razorpayOrderId, razorpayPaymentId } = await request.json();

        // Get plan details
        const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
        }

        // Get Razorpay settings
        const { data: settings } = await supabase.from('system_settings')
            .select('key, value')
            .in('key', ['razorpay_enabled']);

        const razorpayEnabled = settings?.find(s => s.key === 'razorpay_enabled')?.value === 'true';

        // Determine transaction ID and status
        let transactionId: string;
        let status: string;

        if (razorpayEnabled && paymentMethod === 'razorpay') {
            // Real payment via Razorpay
            transactionId = razorpayPaymentId || `RAZORPAY_${Date.now()}`;
            status = 'completed';
        } else {
            // Test payment (no real payment)
            transactionId = `TEST_${Date.now()}`;
            status = 'completed';
        }

        // Calculate dates
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Ensure profile exists first - with better error handling
        let profileExists = false;
        try {
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (profileCheckError && profileCheckError.code !== 'PGRST116') {
                console.error('Profile check error:', profileCheckError);
            }

            profileExists = !!existingProfile;

            if (!profileExists) {
                const { error: profileInsertError } = await supabase.from('profiles').insert({
                    id: user.id,
                    full_name: user.email?.split('@')[0] || 'User',
                    email: user.email,
                    role: 'customer',
                    status: 'active',
                });

                if (profileInsertError) {
                    console.error('Profile insert error:', profileInsertError);
                    // Try one more time with minimal fields
                    if (profileInsertError.message.includes('duplicate')) {
                        profileExists = true;
                    }
                } else {
                    profileExists = true;
                }
            }
        } catch (err) {
            console.error('Profile handling error:', err);
        }

        // Create membership record
        const { data: member, error: memberError } = await supabase
            .from('ecard_members')
            .insert({
                user_id: user.id,
                plan_id: planId,
                full_name: user.email?.split('@')[0] || 'User',
                relation: 'Self',
                status: 'active',
                valid_from: startDate.toISOString(),
                valid_till: expiryDate.toISOString(),
                coverage_amount: plan.coverage_amount || plan.price * 100,
                card_unique_id: `HM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            })
            .select()
            .single();

        if (memberError) {
            console.error('Member creation error:', memberError);
            return NextResponse.json({ success: false, error: 'Failed to create membership: ' + memberError.message }, { status: 500 });
        }

        // Create payment record
        await supabase.from('payments').insert({
            user_id: user.id,
            plan_id: planId,
            amount: plan.price,
            currency: 'INR',
            status,
            razorpay_order_id: razorpayOrderId || null,
            razorpay_payment_id: transactionId,
            payment_method: paymentMethod || 'test',
        });

        // Create invoice record for automatic invoicing
        const gstAmount = Math.round(plan.price * 0.18);
        const totalAmount = plan.price + gstAmount;
        
        const { error: invoiceError } = await supabase.from('invoices').insert({
            user_id: user.id,
            plan_id: planId,
            invoice_number: `INV-${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            plan_name: plan.name,
            amount: plan.price,
            gst: gstAmount,
            total: totalAmount,
            payment_method: paymentMethod || 'test',
            transaction_id: transactionId,
            status: 'paid',
        });

        if (invoiceError) {
            console.error('Invoice creation error:', invoiceError);
        }

        return NextResponse.json({
            success: true,
            data: {
                membershipId: member.id,
                planName: plan.name,
                amount: plan.price,
                startDate: startDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                transactionId,
            }
        });
    } catch (error: any) {
        console.error('Purchase error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Purchase failed' }, { status: 500 });
    }
}
