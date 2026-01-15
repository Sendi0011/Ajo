export const NOTIFICATION_SCHEMA_SQL = `
-- ============================================================================
-- NOTIFICATIONS CORE TABLES
-- ============================================================================

-- Main notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'PENDING',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  action_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT ARRAY['IN_APP']::TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  group_key TEXT,
  CONSTRAINT valid_type CHECK (notification_type IN (
    'PAYMENT_REMINDER', 'PAYMENT_DUE', 'PAYMENT_OVERDUE', 'PAYMENT_RECEIVED',
    'PAYOUT_READY', 'PAYOUT_RECEIVED', 'POOL_INVITE', 'MEMBER_JOINED',
    'MEMBER_LEFT', 'EMERGENCY_REQUEST', 'EMERGENCY_APPROVED', 'BADGE_EARNED',
    'REPUTATION_UP', 'REPUTATION_DOWN', 'MILESTONE_REACHED', 'POOL_COMPLETED',
    'ANNOUNCEMENT', 'SYSTEM_UPDATE', 'VERIFICATION_NEEDED', 'DISPUTE_RAISED',
    'POLL_CREATED', 'POLL_CLOSING'
  )),
  CONSTRAINT valid_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'CLICKED', 'FAILED', 'EXPIRED'))
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_address TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_digest TEXT DEFAULT 'DAILY',
  email_digest_time TEXT DEFAULT '09:00',
  push_enabled BOOLEAN DEFAULT TRUE,
  push_subscription JSONB,
  inapp_enabled BOOLEAN DEFAULT TRUE,
  inapp_show_badge BOOLEAN DEFAULT TRUE,
  inapp_play_sound BOOLEAN DEFAULT TRUE,
  inapp_group_similar BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  paused_until TIMESTAMPTZ,
  type_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notification_type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  default_channels TEXT[] DEFAULT ARRAY['IN_APP']::TEXT[],
  default_priority TEXT DEFAULT 'MEDIUM',
  variables JSONB DEFAULT '[]',
  action_url TEXT,
  action_label TEXT,
  icon TEXT,
  color TEXT,
  expires_after INTEGER, -- hours
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification delivery tracking
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  provider TEXT,
  external_id TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_channel CHECK (channel IN ('IN_APP', 'EMAIL', 'PUSH', 'SMS')),
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'))
);

-- Notification events (for analytics)
CREATE TABLE IF NOT EXISTS notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_address TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'CREATED', 'SENT', 'DELIVERED', 'READ', 'CLICKED', 'ARCHIVED', 
    'DELETED', 'FAILED', 'RETRIED', 'EXPIRED'
  ))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_address, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_notifications_priority 
  ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notifications_expires 
  ON notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_group 
  ON notifications(group_key) WHERE group_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deliveries_notification 
  ON notification_deliveries(notification_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_status 
  ON notification_deliveries(status);

CREATE INDEX IF NOT EXISTS idx_events_notification 
  ON notification_events(notification_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_events_user 
  ON notification_events(user_address, timestamp DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Auto-create notification event on insert
CREATE OR REPLACE FUNCTION create_notification_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_events (notification_id, event_type, user_address, metadata)
  VALUES (NEW.id, 'CREATED', NEW.user_address, '{}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_created_event
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_event();

-- Auto-mark as read when read_at is set
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    NEW.is_read = TRUE;
    INSERT INTO notification_events (notification_id, event_type, user_address, metadata)
    VALUES (NEW.id, 'READ', NEW.user_address, jsonb_build_object('read_at', NEW.read_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_mark_read
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_read();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get unread count for user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_address TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_address = LOWER(p_user_address)
      AND is_read = FALSE
      AND is_archived = FALSE
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW()
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get notification preferences with defaults
CREATE OR REPLACE FUNCTION get_notification_preferences(p_user_address TEXT)
RETURNS notification_preferences AS $$
DECLARE
  prefs notification_preferences;
BEGIN
  SELECT * INTO prefs
  FROM notification_preferences
  WHERE user_address = LOWER(p_user_address);
  
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_address)
    VALUES (LOWER(p_user_address))
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$$ LANGUAGE plpgsql;
`;

// Export utility types
export interface NotificationCreateInput {
  userAddress: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: NotificationMetadata;
  channels?: NotificationChannel[];
  expiresIn?: number; // hours
}

export interface NotificationUpdateInput {
  isRead?: boolean;
  isArchived?: boolean;
  readAt?: string;
  archivedAt?: string;
}

export interface NotificationFilterOptions {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  isRead?: boolean;
  isArchived?: boolean;
  startDate?: Date;
  endDate?: Date;
  poolId?: string;
  searchQuery?: string;
}