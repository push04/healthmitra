export interface SystemSettings {
    general: {
        companyName: string;
        supportEmail: string;
        currency: string;
        timezone: string;
    };
    email: {
        smtpHost: string;
        smtpPort: number;
        fromEmail: string;
    };
    payment: {
        razorpayKey: string;
        mode: 'test' | 'live';
    };
    security: {
        passwordMinLength: number;
        mfaEnabled: boolean;
        sessionTimeout: number; // minutes
    };
    backup: {
        enabled: boolean;
        frequency: 'daily' | 'weekly';
        retentionDays: number;
    }
}

export interface AuditLog {
    id: string;
    user: string;
    action: string;
    module: string;
    details: string;
    timestamp: string;
}

export const MOCK_SETTINGS: SystemSettings = {
    general: {
        companyName: 'HealthMitra Insurance Services',
        supportEmail: 'support@healthmitra.com',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
    },
    email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        fromEmail: 'noreply@healthmitra.com'
    },
    payment: {
        razorpayKey: 'rzp_test_12345678',
        mode: 'test'
    },
    security: {
        passwordMinLength: 8,
        mfaEnabled: true,
        sessionTimeout: 30
    },
    backup: {
        enabled: true,
        frequency: 'daily',
        retentionDays: 30
    }
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'aud_1', user: 'Rajesh (Admin)', action: 'Created Plan', module: 'Plans', details: 'Gold Health Plan', timestamp: '20 Jan, 10:30 AM' },
    { id: 'aud_2', user: 'Priya (Mgr)', action: 'Approved Claim', module: 'Reimbursements', details: 'CLM-001, ₹1,250', timestamp: '20 Jan, 09:15 AM' },
    { id: 'aud_3', user: 'Rajesh (Admin)', action: 'Updated User', module: 'Users', details: 'Changed role for U-231', timestamp: '19 Jan, 03:45 PM' },
    { id: 'aud_4', user: 'System', action: 'Auto Backup', module: 'System', details: 'Backup success (2.4GB)', timestamp: '19 Jan, 02:00 AM' },
    { id: 'aud_5', user: 'Admin', action: 'Modified Settings', module: 'Settings', details: 'Changed SMTP Host', timestamp: '18 Jan, 05:30 PM' },
];
