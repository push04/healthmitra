-- ============================================================================
-- FIXED NOTIFICATION SYSTEM FOR HEALTHMITRA
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notification_reads CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Main notifications table (fixed - no foreign key constraint)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id UUID NOT NULL,  -- Removed FK constraint to allow flexibility
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN (
        'general', 'reimbursement', 'withdrawal', 'plan', 'service', 'system', 'promotional'
    )),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Action link
    action_url TEXT,
    action_label TEXT,
    
    -- Priority
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track which notifications each user has read
CREATE TABLE notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Admin can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Public read for notification_reads
CREATE POLICY "Public read notification_reads" ON notification_reads
    FOR SELECT USING (true);

CREATE POLICY "Users can insert notification_reads" ON notification_reads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_recipient_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'general',
    p_sender_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_action_label TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        sender_id, recipient_id, title, message, type,
        action_url, action_label, priority, metadata
    )
    VALUES (
        p_sender_id, p_recipient_id, p_title, p_message, p_type,
        p_action_url, p_action_label, p_priority, p_metadata
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

SELECT 'Notification system fixed successfully!' as message;
