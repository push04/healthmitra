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

function generateHTMLInvoice(invoice: any, purchase: any) {
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const gstAmount = Math.round(invoice.amount * 0.18);
    const totalAmount = invoice.amount + gstAmount;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${invoice.invoice_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fff;
            color: #333;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        .invoice-container {
            border: 2px solid #0d9488;
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
            color: white;
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo-icon {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0d9488;
            font-size: 24px;
            font-weight: bold;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 2px;
        }
        .invoice-title p {
            opacity: 0.9;
            font-size: 14px;
        }
        .invoice-number {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 6px;
            margin-top: 8px;
            font-family: monospace;
            font-size: 14px;
        }
        .body {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0d9488;
            font-weight: 600;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        .info-item {
            margin-bottom: 8px;
        }
        .info-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #111;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th {
            background: #f3f4f6;
            padding: 12px 16px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #4b5563;
            font-weight: 600;
        }
        .table td {
            padding: 14px 16px;
            border-bottom: 1px solid #e5e7eb;
        }
        .table tr:last-child td {
            border-bottom: none;
        }
        .table .text-right {
            text-align: right;
        }
        .table .font-bold {
            font-weight: 600;
        }
        .totals {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        .totals-table {
            width: 280px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .totals-row:last-child {
            border-bottom: none;
            font-size: 18px;
            font-weight: 700;
            color: #0d9488;
            padding-top: 16px;
            margin-top: 8px;
            border-top: 2px solid #0d9488;
        }
        .status-badge {
            display: inline-block;
            background: #d1fae5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .footer {
            background: #f9fafb;
            padding: 30px 40px;
            border-top: 1px solid #e5e7eb;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .footer-title {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        .footer-text {
            font-size: 13px;
            color: #6b7280;
        }
        .bank-details {
            background: #fff;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin-top: 10px;
        }
        .bank-details p {
            font-size: 12px;
            margin-bottom: 4px;
            font-family: monospace;
        }
        .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0d9488;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }
        .print-btn:hover {
            background: #0f766e;
        }
        @media print {
            .print-btn { display: none; }
            body { padding: 0; }
            .invoice-container { border: none; }
        }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    
    <div class="invoice-container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">H</div>
                <div>
                    <div style="font-size: 22px;">HealthMitra</div>
                    <div style="font-size: 11px; opacity: 0.8;">Healthcare Pvt. Ltd.</div>
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <p>Tax Invoice for Membership Purchase</p>
                <div class="invoice-number">${invoice.invoice_number}</div>
            </div>
        </div>
        
        <div class="body">
            <div class="info-grid">
                <div class="section">
                    <div class="section-title">Bill To</div>
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${purchase.full_name || 'Customer'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${invoice.email || 'customer@email.com'}</div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Invoice Details</div>
                    <div class="info-item">
                        <div class="info-label">Invoice Date</div>
                        <div class="info-value">${invoiceDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Status</div>
                        <div class="info-value"><span class="status-badge">✓ ${(invoice.status || 'PAID').toUpperCase()}</span></div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Transaction ID</div>
                        <div class="info-value" style="font-family: monospace; font-size: 12px;">${invoice.transaction_id || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Plan Details</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>${invoice.plan_name || 'Health Plan'}</strong><br>
                            <span style="color: #6b7280; font-size: 13px;">1 Year Membership</span>
                        </td>
                        <td>
                            <div style="font-size: 13px;">
                                <div>Coverage: ₹${(purchase.coverage_amount || 0).toLocaleString('en-IN')}</div>
                                <div>Card ID: ${purchase.card_unique_id || 'N/A'}</div>
                            </div>
                        </td>
                        <td class="text-right font-bold">₹${Number(invoice.amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="totals">
                <div class="totals-table">
                    <div class="totals-row">
                        <span>Subtotal</span>
                        <span>₹${Number(invoice.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="totals-row">
                        <span>GST (18%)</span>
                        <span>₹${gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="totals-row">
                        <span>Total</span>
                        <span>₹${totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-grid">
                <div>
                    <div class="footer-title">Company Details</div>
                    <div class="footer-text">
                        HealthMitra Systems AI Pvt Ltd<br>
                        C/O JSS Academy of Technical Education<br>
                        C-20/1, Sector 62, Noida<br>
                        Uttar Pradesh 201309, India
                    </div>
                </div>
                <div>
                    <div class="footer-title">Contact & Support</div>
                    <div class="footer-text">
                        Email: support@healthmitra.com<br>
                        Phone: +91 9818823106<br>
                        Website: www.healthmitra.com
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #d1d5db; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af;">Thank you for choosing HealthMitra! This is a computer-generated invoice and does not require a signature.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

async function generateInvoice(supabase: any, userId: string, data: any) {
    const { purchaseId } = data;

    // First try to get from invoices table
    let invoice: any = null;
    let purchase: any = null;

    const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', purchaseId)
        .single();

    if (invoiceData) {
        invoice = invoiceData;
    } else {
        // Fallback to ecard_members
        const { data: purchaseData } = await supabase
            .from('ecard_members')
            .select('*, plan:plan_id(*)')
            .eq('id', purchaseId)
            .single();

        if (!purchaseData) {
            return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 });
        }

        purchase = purchaseData;
        invoice = {
            id: purchaseData.id,
            invoice_number: `INV-${purchaseData.id.slice(0, 8).toUpperCase()}`,
            plan_name: purchaseData.plan?.name || 'Health Plan',
            amount: purchaseData.plan?.price || 0,
            status: purchaseData.status === 'active' ? 'PAID' : 'PENDING',
            transaction_id: purchaseData.card_unique_id,
            created_at: purchaseData.created_at,
        };
    }

    if (!purchase) {
        const { data: purchaseData } = await supabase
            .from('ecard_members')
            .select('*')
            .eq('id', purchaseId)
            .single();
        purchase = purchaseData;
    }

    const htmlContent = generateHTMLInvoice(invoice, purchase);
    const filename = `${invoice.invoice_number || 'Invoice'}.html`;

    return NextResponse.json({
        success: true,
        data: {
            content: htmlContent,
            filename: filename,
            type: 'html',
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

    return NextResponse.json({
        success: true,
        data: {
            content: receiptContent,
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
