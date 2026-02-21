import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { type, data } = await request.json();

        switch (type) {
            case 'invoice':
                return generateInvoice(supabase, user.id, data);
            case 'reimbursement_receipt':
                return generateReimbursementReceipt(supabase, user.id, data);
            case 'membership_card':
                return generateMembershipCard(supabase, user.id, data);
            case 'report':
                return generateReport(supabase, user.id, data);
            default:
                return NextResponse.json({ success: false, error: 'Invalid download type' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Download error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function generateInvoice(supabase: any, userId: string, data: any) {
    const { purchaseId } = data;

    const { data: purchase } = await supabase
        .from('ecard_members')
        .select('*, plan:plan_id(*)')
        .eq('id', purchaseId)
        .single();

    if (!purchase) {
        return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 });
    }

    const invoiceContent = `
INVOICE
==========================================
HealthMitra Healthcare Pvt. Ltd.

Invoice Date: ${new Date().toLocaleDateString('en-IN')}
Invoice No: INV-${purchase.id.slice(0, 8).toUpperCase()}

------------------------------------------
Bill To:
${purchase.full_name}
User ID: ${userId}

------------------------------------------
Plan Details:
Plan Name: ${purchase.plan?.name || 'N/A'}
Coverage: ₹${purchase.coverage_amount || 0}
Policy Number: ${purchase.policy_number || 'N/A'}

------------------------------------------
Total Amount: ₹${purchase.plan?.price || 0}
GST (18%): ₹${Math.round((purchase.plan?.price || 0) * 0.18)}
------------------------------------------
GRAND TOTAL: ₹${(purchase.plan?.price || 0) * 1.18}

Payment Status: PAID
Payment Method: Online

==========================================
Thank you for choosing HealthMitra!
For support: support@healthmitra.com
    `.trim();

    const buffer = Buffer.from(invoiceContent, 'utf-8');

    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`invoices/${userId}/INV-${purchase.id.slice(0, 8)}.txt`, buffer, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'text/plain',
        });

    if (uploadError) {
        console.error('Invoice upload error:', uploadError);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`invoices/${userId}/INV-${purchase.id.slice(0, 8)}.txt`);

    return NextResponse.json({
        success: true,
        data: {
            content: invoiceContent,
            url: publicUrl,
            filename: `Invoice-${purchase.id.slice(0, 8)}.txt`,
        }
    });
}

async function generateReimbursementReceipt(supabase: any, userId: string, data: any) {
    const { claimId } = data;

    const { data: claim } = await supabase
        .from('reimbursements')
        .select('*')
        .eq('id', claimId)
        .single();

    if (!claim) {
        return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }

    const receiptContent = `
REIMBURSEMENT RECEIPT
==========================================
HealthMitra Healthcare Pvt. Ltd.

Receipt Date: ${new Date().toLocaleDateString('en-IN')}
Receipt No: RCP-${claim.id.slice(0, 8).toUpperCase()}

------------------------------------------
Patient: ${claim.patient_name || 'N/A'}
Claim ID: ${claim.id}

------------------------------------------
Claim Details:
Type: ${claim.claim_type || 'Medical'}
Amount Claimed: ₹${claim.amount || 0}
Amount Approved: ₹${claim.approved_amount || 0}

Status: ${claim.status?.toUpperCase() || 'PENDING'}

==========================================
Thank you for choosing HealthMitra!
    `.trim();

    const buffer = Buffer.from(receiptContent, 'utf-8');

    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`receipts/${userId}/RCP-${claim.id.slice(0, 8)}.txt`);

    return NextResponse.json({
        success: true,
        data: {
            content: receiptContent,
            url: publicUrl,
            filename: `Receipt-${claim.id.slice(0, 8)}.txt`,
        }
    });
}

async function generateMembershipCard(supabase: any, userId: string, data: any) {
    const { memberId } = data;

    const { data: member } = await supabase
        .from('ecard_members')
        .select('*, plan:plan_id(*)')
        .eq('id', memberId)
        .single();

    if (!member) {
        return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const cardContent = `
HEALTHMITRA MEMBERSHIP CARD
==========================================
Member ID: ${member.id.slice(0, 8).toUpperCase()}
Card No: ${member.card_unique_id || 'N/A'}

------------------------------------------
Name: ${member.full_name}
Relation: ${member.relation || 'Self'}
Valid From: ${member.valid_from ? new Date(member.valid_from).toLocaleDateString('en-IN') : 'N/A'}
Valid Till: ${member.valid_till ? new Date(member.valid_till).toLocaleDateString('en-IN') : 'N/A'}

------------------------------------------
Plan: ${member.plan?.name || 'N/A'}
Coverage: ₹${member.coverage_amount || 0}

==========================================
HealthMitra - Your Health Partner
    `.trim();

    return NextResponse.json({
        success: true,
        data: {
            content: cardContent,
            filename: `MembershipCard-${member.id.slice(0, 8)}.txt`,
        }
    });
}

async function generateReport(supabase: any, userId: string, data: any) {
    const { reportType, startDate, endDate } = data;

    let reportContent = `HEALTHMITRA REPORT\n==========================================\nReport Type: ${reportType}\nGenerated: ${new Date().toLocaleString('en-IN')}\n\n`;

    if (reportType === 'purchases') {
        const { data: purchases } = await supabase
            .from('ecard_members')
            .select('*, plan:plan_id(*)')
            .eq('user_id', userId);

        reportContent += `Total Plans: ${purchases?.length || 0}\n\n`;
        purchases?.forEach((p: any, i: number) => {
            reportContent += `${i + 1}. ${p.plan?.name || 'N/A'} - ₹${p.plan?.price || 0}\n`;
            reportContent += `   Valid: ${p.valid_from ? new Date(p.valid_from).toLocaleDateString('en-IN') : 'N/A'} to ${p.valid_till ? new Date(p.valid_till).toLocaleDateString('en-IN') : 'N/A'}\n`;
        });
    } else if (reportType === 'claims') {
        const { data: claims } = await supabase
            .from('reimbursements')
            .select('*')
            .eq('user_id', userId);

        reportContent += `Total Claims: ${claims?.length || 0}\n\n`;
        claims?.forEach((c: any, i: number) => {
            reportContent += `${i + 1}. ${c.claim_type || 'Medical'} - ₹${c.amount || 0}\n`;
            reportContent += `   Status: ${c.status}\n`;
        });
    }

    reportContent += `\n==========================================\nGenerated by HealthMitra`;

    return NextResponse.json({
        success: true,
        data: {
            content: reportContent,
            filename: `Report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`,
        }
    });
}
