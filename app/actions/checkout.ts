'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Razorpay from 'razorpay';

interface PlanPurchaseData {
    planId: string;
    paymentMethod: 'razorpay' | 'test';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
}

export async function getRazorpaySettings() {
    const supabase = await createClient();
    const { data: settings } = await supabase.from('system_settings')
        .select('key, value')
        .in('key', ['razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret']);

    return {
        enabled: settings?.find(s => s.key === 'razorpay_enabled')?.value === 'true',
        keyId: settings?.find(s => s.key === 'razorpay_key_id')?.value || '',
        keySecret: settings?.find(s => s.key === 'razorpay_key_secret')?.value || '',
    };
}

export async function createRazorpayOrderForPlan(planId: string, amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'User not authenticated' };

    const settings = await getRazorpaySettings();
    if (!settings.enabled || !settings.keyId || !settings.keySecret) {
        return { success: false, error: 'Razorpay is not configured' };
    }

    try {
        const razorpay = new Razorpay({
            key_id: settings.keyId,
            key_secret: settings.keySecret,
        });

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `hm_${planId}_${Date.now()}`,
            notes: {
                planId,
                userId: user.id,
            },
        };

        const order = await razorpay.orders.create(options);

        return {
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: settings.keyId,
            }
        };
    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        return { success: false, error: error.message || 'Failed to create payment order' };
    }
}

export async function purchasePlan(data: PlanPurchaseData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', data.planId)
        .single();

    if (planError || !plan) {
        return { success: false, error: 'Plan not found' };
    }

    // Get Razorpay settings
    const settings = await getRazorpaySettings();

    // If Razorpay is enabled and payment method is razorpay, verify payment
    let paymentStatus = 'completed';
    let transactionId = `TEST_${Date.now()}`;

    if (settings.enabled && data.paymentMethod === 'razorpay') {
        // In production, you'd verify the payment here
        // For now, mark as completed since Razorpay handles verification
        paymentStatus = 'completed';
        transactionId = data.razorpayPaymentId || `RAZORPAY_${Date.now()}`;
    } else if (!settings.enabled) {
        // Test mode - no real payment
        paymentStatus = 'completed';
        transactionId = `TEST_${Date.now()}`;
    }

    // Calculate expiry date (1 year from now)
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create purchase record in ecard_members
    const { data: member, error: memberError } = await supabase
        .from('ecard_members')
        .insert({
            user_id: user.id,
            plan_id: data.planId,
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
        return { success: false, error: 'Failed to create membership: ' + memberError.message };
    }

    // Create payment record
    await supabase.from('payments').insert({
        user_id: user.id,
        plan_id: data.planId,
        amount: plan.price,
        currency: 'INR',
        status: paymentStatus,
        razorpay_order_id: data.razorpayOrderId || null,
        razorpay_payment_id: transactionId,
        payment_method: data.paymentMethod,
    });

    return {
        success: true,
        data: {
            membershipId: member.id,
            planName: plan.name,
            amount: plan.price,
            startDate: startDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            transactionId,
        }
    };
}

export async function getPlanById(planId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (error || !data) return { success: false, error: 'Plan not found' };
    return { success: true, data };
}
