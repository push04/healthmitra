-- ============================================================================
-- NOTIFICATION SYSTEM FOR HEALTHMITRA
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_reads CASCADE;

-- Main notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN (
        'general',           -- General notification
        'reimbursement',    -- Reimbursement status updates
        'withdrawal',       -- Withdrawal status updates  
        'plan',             -- Plan related (expiry, renewal)
        'service',          -- Service request updates
        'system',           -- System announcements
        'promotional'       -- Promotional messages
    )),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Action link (optional - where clicking the notification goes)
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
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
-- Admin (sender) can create notifications
CREATE POLICY "Admin can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM profiles WHERE role = 'admin')
        OR sender_id IS NULL  -- System notifications
    );

-- All users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

-- Users can update read status of their own
CREATE POLICY "Users can update own read status" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Everyone can read notification_reads
CREATE POLICY "Public read notification_reads" ON notification_reads
    FOR SELECT USING (true);

-- Insert policy for notification_reads
CREATE POLICY "Users can insert notification_reads" ON notification_reads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- Function to create notification
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
        sender_id,
        recipient_id,
        title,
        message,
        type,
        action_url,
        action_label,
        priority,
        metadata
    )
    VALUES (
        p_sender_id,
        p_recipient_id,
        p_title,
        p_message,
        p_type,
        p_action_url,
        p_action_label,
        p_priority,
        p_metadata
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
    p_notification_id UUID,
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE notifications 
    SET is_read = true, 
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = p_notification_id 
    AND recipient_id = p_user_id;
    
    INSERT INTO notification_reads (notification_id, user_id, read_at)
    VALUES (p_notification_id, p_user_id, NOW())
    ON CONFLICT (notification_id, user_id) DO NOTHING;
END;
$$;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM notifications
    WHERE recipient_id = p_user_id
    AND is_read = false;
    
    RETURN v_count;
END;
$$;

-- Function to send bulk notification (admin feature)
CREATE OR REPLACE FUNCTION send_bulk_notification(
    p_title TEXT,
    p_message TEXT,
    p_type TEXT,
    p_sender_id UUID,
    p_filter_role TEXT DEFAULT NULL,
    p_filter_status TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
    v_user RECORD;
BEGIN
    FOR v_user IN 
        SELECT id FROM profiles 
        WHERE (p_filter_role IS NULL OR role = p_filter_role)
        AND (p_filter_status IS NULL OR status = p_filter_status)
        AND id != p_sender_id
    LOOP
        PERFORM create_notification(
            v_user.id,
            p_title,
            p_message,
            p_type,
            p_sender_id
        );
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
GRANT EXECUTE ON FUNCTION send_bulk_notification TO authenticated;

-- Insert some sample notifications for testing
INSERT INTO notifications (recipient_id, title, message, type, priority, created_at)
SELECT 
    id,
    'Welcome to HealthMitra',
    'Thank you for joining HealthMitra. Start exploring our health plans today!',
    'general',
    'high',
    NOW() - INTERVAL '1 day'
FROM profiles 
WHERE role = 'user'
LIMIT 5;

SELECT 'Notification system created successfully!' as message;
